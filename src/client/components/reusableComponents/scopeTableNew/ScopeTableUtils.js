import sortBy from 'lodash/sortBy';

import { formatDate, getTaskNumber, sortEmployee } from '../../../utils/common';
import { FIELDS } from '../../../utils/constants/ScopeTableFields';
import Constant, { ROLE_ID } from '../../helpers/Constant';
import { find } from 'lodash/find';
import { filter } from 'lodash/filter';

export function getEngineerHours(hourTrackers) {
    return hourTrackers.filter(tracker => tracker.employee.role.id === Constant.ROLE_ID.ENGINEER ||
        tracker.employee.role.id === Constant.ROLE_ID.MANAGER)
        .map(tracker => Number(tracker.hoursSpent))
        .reduce((total, num) => total + num, 0);
}

export function getDrafterHours(hourTrackers) {
    return hourTrackers.filter(tracker => tracker.employee.role.id === Constant.ROLE_ID.DRAFTER)
        .map(tracker => Number(tracker.hoursSpent))
        .reduce((total, num) => total + num, 0);
}

export function getSelectedInvoices(invoices, scopeId) {
    return invoices.reduce((arr, invoice) => {
        if (!invoice.isUpdated) {
            return arr;
        }
        const inv = invoice.selectedScopes.find(selectedScope => selectedScope.scope._id === scopeId);
        if (inv) {
            arr.push({ ...inv, number: invoice.number, type: 'parent' })
        }
        return arr;
    }, [])
}

export function getSelectedRevInvoices(invoices, scopeId) {
    return invoices.reduce((arr, invoice) => {
        if (!invoice.isUpdated) {
            return arr;
        }
        const inv = invoice.selectedScopes.forEach(selectedScope => {
            if (!selectedScope.scope.isArchived && selectedScope.scope.parent && selectedScope.scope.parent === scopeId) {
                arr.push({ ...selectedScope, number: invoice.number, type: 'rev' })
            }
        });
        return arr;
    }, [])
}

function getPaidDate(invoices) {
    let invoiceSentDate = null;
    let paidDate = null;
    invoices.map(invoice => {
        if (!invoice.isArchived) {
            invoiceSentDate = invoice.sentDate;
            paidDate = invoice.paidDate;
        }
    });
    return invoiceSentDate ? paidDate ? paidDate !== 'N' ? formatDate(paidDate) : 'NO' : 'NO' : '-';
}

function getInvoicedDate(invoices) {
    let invoiceSentDate = null;
    invoices.map(invoice => {
        if (!invoice.isArchived) {
            invoiceSentDate = invoice.sentDate;
        }
    });
    return invoiceSentDate ? formatDate(invoiceSentDate) : '-';
}

function getPONumber(id, invoices) {
    let poNumber = '-';
    invoices.map(invoice => {
        invoice.selectedScopes.map(scope => {
            if (scope.scope.id === id) {
                poNumber = invoice.poNumber ? invoice.poNumber : '-';
            }
        });
    });
    return poNumber;
}

function getPO(purchaseOrders) {
    const unArchivedPOs = purchaseOrders.filter(po => !po.isArchived)
    if (purchaseOrders.length === 0 || unArchivedPOs.length == 0) {
        return '-';
    }
    const template = purchaseOrders.reduce((templates, order) => {
        if (order.isArchived)
            return templates;
        return [...templates, ...order.templates]
    }, [])
        .reverse()
        .find(item => item.title.match(/^(Received|PO Received)$/));
    return template && template.isDone ? 'Y' : 'N';
}

function getInvoiceCount(invoices) { //when template length comes with zero length
    return invoices.filter(inv => !inv.isArchived).reduce((count, invoice) => invoice.templates.length && invoice.templates[invoice.templates.length - 1].isDone ? count + 1 : count, 0);
}

function getCSA(task) {
    let agreements = [];
    switch (task.contractor.contract) {
        case 'MA':
            agreements = task.masterAgreements || [];
            break;
        case 'CA':
            agreements = task.clientAgreements || [];
            break;
        case 'MCSA':
        case 'MCA':
            agreements = task.modifiedAgreements || [];
            break;
        default:
            agreements = task.agreements || [];
            break;
    }

    if (agreements.length === 0) {
        return 'NA';
    }

    const agreement = agreements.filter(agr => !agr.isArchived)
        .reduce((result, agg) => result.number > agg.number ? result : agg, {});

    if (!agreement.templates) {
        return '-';
    }

    let emailedNode = agreement.templates
        .find(template => template.title === Constant.MILESTONE_NODES_TO_CHECK_ON_GRID.MCSA.EMAILED);

    let signedNode;

    if (task.contractor.contract && task.contractor.contract.match(/^(CA|MA)$/)) {
        signedNode = agreement.templates
            .find(template => template.title === Constant.MILESTONE_NODES_TO_CHECK_ON_GRID.MA.SIGNED);
        return signedNode && signedNode.isDone ? 'Y' : 'N';
    }
    signedNode = agreement.templates
        .find(template => template.title === Constant.MILESTONE_NODES_TO_CHECK_ON_GRID.CSA.SIGNED ||
            template.title === Constant.MILESTONE_NODES_TO_CHECK_ON_GRID.MCSA.SIGNED);

    if (emailedNode && signedNode) {
        if (signedNode.isDone) {
            return 'Y';
        } else if (emailedNode.isDone) {
            return 'E';
        }
        return 'N';
    }
    return '-';
}

function getStatus(scope, _id) {
    if (scope.drafterDetails.drafter && scope.drafterDetails.drafter._id === _id) {
        return scope.drafterDetails.status || '-';
    }


    // if (scope.engineerDetails.engineer._id === _id) {
    return scope.engineerDetails.status || '-';
    // }

    // return '-';
}

function getUrgentNonUrgentHours(scope, type, _id) {
    let hours = 0;
    const status = getStatus(scope, _id);

    if (status.toLowerCase() === 'complete' && (scope.group.id === Constant.TASK_GROUP_TITLE_ID.BIDS.ID || scope.group.id === Constant.TASK_GROUP_TITLE_ID.TASKS.ID)) {
        return hours;
    }


    if (scope.managerDetails.manager._id === _id) {
        hours = scope.managerDetails[type];
    }
    if (scope.engineerDetails.engineer._id === _id) {
        hours = scope.engineerDetails[type];
    }
    if (scope.drafterDetails.drafter && scope.drafterDetails.drafter._id === _id) {
        hours = scope.drafterDetails[type];
    }
    return hours;

}

function isDrafter(loggedInUserRoleId) {
    return loggedInUserRoleId === Constant.ROLE_ID.DRAFTER;
}

function getValue(field, scope, loggedInUserId, loggedInUserRoleId) {
    switch (field) {
        case FIELDS.TG:
            return scope.group.title[0].toUpperCase();
        case FIELDS.CUSTOMER_TEAM:
            return scope.customerContact ? scope.customerContact.id : '';
        case FIELDS.TEAM:
            return { ...getDHCTeam(scope), fetchScope: true };
        case FIELDS.CONTR:
            return scope.task.contractor.name;
        case FIELDS.JOB:
            return getTaskNumber(scope.task);
        case FIELDS.JOB_WITH_SCOPE_NUMBER:
            return `${getTaskNumber(scope.task)}-${scope.number}`;
        case FIELDS.REFERENCE_SCOPE:
            return scope.referenceScope;
        case FIELDS.PROJECT:
            return scope.task.title;
        case FIELDS.SCOPE:
            return scope.number;
        case FIELDS.SCOPE_NOTE:
            return scope.note;
        case FIELDS.CITY:
            return scope.task.city;
        case FIELDS.STATE:
            return scope.task.state;
        case FIELDS.STATUS:
            return getStatus(scope, loggedInUserId);
        case FIELDS.DUE_DATE_WITH_STATUS:
            return {
                date: formatDate(scope.dueDate),
                status: getStatus(scope, loggedInUserId)
            };
        case FIELDS.DUE_DATE:
            return formatDate(scope.dueDate);
        case FIELDS.COST:
            return scope.price;
        case FIELDS.U_HRS:
        case FIELDS.NU_HRS:
            return getUrgentNonUrgentHours(scope, field, loggedInUserId);
        case FIELDS.CSA:
            return getCSA(scope.task);
        case FIELDS.CUST_INV:
            return getInvoiceCount(scope.task.invoices);
        case FIELDS.CALC:
            return scope.calcs.filter(c => !c.isArchived).length > 0 ? 'Y' : 'N';
        case FIELDS.PO:
            return scope.task.contractor && scope.task.contractor.poRequired && getPO(scope.task.purchaseOrders) || '-';
        case FIELDS.PO_NUM:
            return scope.task.contractor.poRequired ? getPONumber(scope.id, scope.task.invoices) : 'NA';
        case FIELDS.INV:
            return getInvoicedDate(scope.task.invoices);
        case FIELDS.PAID:
            return getPaidDate(scope.task.invoices);
        case FIELDS.ENG_HRS:
            return getEngineerHours(scope.hourTrackers);
        case FIELDS.DRF_HRS:
            return getDrafterHours(scope.hourTrackers);
        default:
            return '';
    }
}

function getData({ id, _id, task, engineerDetails, managerDetails, drafterDetails, group, highlights },
    loggedInUserId, loggedInUserRoleId, loggedInUserRoleName) {

    let scopeHighlightColor = 'inherit';
    const highlight = highlights && highlights.find(item => item.user === loggedInUserId);
    if (highlight) {
        scopeHighlightColor = highlight.color;
    }

    return {
        id,
        _id,
        loggedInUserId,
        loggedInUserRoleId,
        loggedInUserRoleName,
        taskId: task.id,
        group,
        scopeHighlightColor,
        task: {
            contractor: task.contractor,
            createdAt: task.createdAt,
            taskNumber: task.taskNumber,
            isBidding: task.isBidding,
            isFromTaskGroup: task.isFromTaskGroup,
            teamMembers: task.teamMembers,
            _id: task._id,
            id: task.id
        },
        scopeTeam: {
            engineerDetails,
            managerDetails,
            drafterDetails
        }
    };
}

export function scopeDataConvertor(scope, header, loggedInUserId, loggedInUserRoleId, loggedInUserRoleName) {
    let data = getData(scope, loggedInUserId, loggedInUserRoleId, loggedInUserRoleName);
    header.forEach(headerItem => {
        data[headerItem.field] = getValue(headerItem.field, scope, loggedInUserId, loggedInUserRoleId);
    });
    return data;
}

export function getOtherEmployees(employees, selectedUserId = '') {
    const emp = employees.filter(employee => employee.id !== selectedUserId);
    return sortEmployee(emp).map(employee => ({ id: employee._id, name: `${employee.firstName} ${employee.lastName}` }));
}

export function getManagersAndEngineers(employees, selectedUserId = '') {
    return employees.filter(employee => (employee.role.id === ROLE_ID.MANAGER ||
        employee.role.id === ROLE_ID.ENGINEER) && employee.id !== selectedUserId)
        .sort((a, b) => a.employeeCode - b.employeeCode)
        .map(employee => ({ id: employee._id, name: `${employee.firstName} ${employee.lastName}` }));
}

export function getDrafters(employees, selectedUserId = '') {
    let drafters = employees.filter(employee => employee.role.id === ROLE_ID.DRAFTER && employee.id !== selectedUserId);
    drafters = sortBy(drafters, ['employeeCode']);
    return drafters.map(employee => ({ id: employee._id, name: `${employee.firstName} ${employee.lastName}` }));
}

export function getProjectPath(payload) {
    const { contractor, createdAt, city, state, title, taskNumber } = payload;
    return getContractorName(contractor) + '/' + new Date(createdAt).getFullYear().toString() + '/' +
        city + ', ' + state + ' - ' + title + ' - ' + getTaskNumber(payload);
}
export function getContractorName(contractor) {
    return contractor.company ? contractor.company.trim() : contractor.name;
}

export function padWithZeros(number, length) {
    let castedNumber = '' + number;
    while (castedNumber.length < length) {
        castedNumber = '0' + castedNumber;
    }
    return castedNumber;
}

export function getDHCTeam(scope) {
    const managerName = scope.managerDetails.manager.firstName + ' ' + scope.managerDetails.manager.lastName;
    const managerEmail = scope.managerDetails.manager.email || '';
    const managerId = scope.managerDetails.manager.id;
    const managerImage = scope.managerDetails.manager.picture || '';

    const drafterName = scope.drafterDetails.drafter && scope.drafterDetails.drafter.firstName + ' ' + scope.drafterDetails.drafter.lastName;
    const drafterEmail = scope.drafterDetails.drafter && scope.drafterDetails.drafter.email || '';
    const drafterId = scope.drafterDetails.drafter && scope.drafterDetails.drafter.id;
    const drafterImage = scope.drafterDetails.drafter && scope.drafterDetails.drafter.picture || '';

    const engineerName = scope.engineerDetails.engineer.firstName + ' ' + scope.engineerDetails.engineer.lastName;
    const engineerEmail = scope.engineerDetails.engineer.email || '';
    const engineerId = scope.engineerDetails.engineer.id;
    const engineerImage = scope.engineerDetails.engineer.picture || '';

    let task_Id = null;
    if (typeof scope.task === 'string') {
        task_Id = scope.task;
    } else if (typeof scope.task === 'object') {
        task_Id = scope.task._id
    }

    return { managerName, managerEmail, managerImage, engineerName, engineerEmail, engineerImage, drafterName, drafterEmail, drafterImage, managerId, engineerId, drafterId, task_Id };
}

export function getTeamManagerDetails(scope, team) {
    const managerUserId = scope.managerDetails.manager && scope.managerDetails.manager._id;
    const obj = {
        [FIELDS.USER]: scope.managerDetails.manager.firstName + ' ' + scope.managerDetails.manager.lastName,
        [FIELDS.U_HRS]: scope.managerDetails.urgentHours || '-',
        [FIELDS.NU_HRS]: scope.managerDetails.nonUrgentHours || '-',
        [FIELDS.STATUS]: "-",
        [FIELDS.SCOPE]: "All",
        [FIELDS.PROJECT_ROLE]: 'PM',
        [FIELDS.COMPANY_ROLE]: getCompanyRole(managerUserId, team),
        [FIELDS.SCOPE_NOTE]: '-',
        userImage: scope.managerDetails.manager.picture || '',
        selectedUserId: scope.managerDetails.manager.id,
        userDetails: scope.managerDetails,
        scopeId: scope.id,
        key: 'managerDetails'

    };
    return { ...obj }
}

export function getTeamDrafterDetails(scope, team) {

    const drafterUserId = scope.drafterDetails.drafter && scope.drafterDetails.drafter._id;
    const obj = {
        [FIELDS.USER]: scope.drafterDetails.drafter && scope.drafterDetails.drafter.firstName + ' ' + scope.drafterDetails.drafter.lastName,
        [FIELDS.U_HRS]: scope.drafterDetails.urgentHours || '-',
        [FIELDS.NU_HRS]: scope.drafterDetails.nonUrgentHours || '-',
        [FIELDS.STATUS]: scope.drafterDetails.status,
        [FIELDS.SCOPE]: scope.number,
        [FIELDS.COMPANY_ROLE]: getCompanyRole(drafterUserId, team),
        [FIELDS.PROJECT_ROLE]: 'AD',
        [FIELDS.SCOPE_NOTE]: scope.note ? scope.note : '-',
        selectedUserId: scope.drafterDetails.drafter && scope.drafterDetails.drafter.id,
        userImage: scope.drafterDetails.drafter && scope.drafterDetails.drafter.picture || '',
        scopeId: scope.id,
        userDetails: scope.drafterDetails,
        key: 'drafterDetails'
    };
    return { ...obj }
}

export function getTeamEngineerDetails(scope, team) {
    const engineerUserId = scope.engineerDetails.engineer && scope.engineerDetails.engineer._id;
    const obj = {
        [FIELDS.USER]: scope.engineerDetails.engineer.firstName + ' ' + scope.engineerDetails.engineer.lastName,
        [FIELDS.PROJECT_ROLE]: 'AE',
        [FIELDS.U_HRS]: scope.engineerDetails.urgentHours,
        [FIELDS.NU_HRS]: scope.engineerDetails.nonUrgentHours,
        [FIELDS.STATUS]: scope.engineerDetails.status,
        [FIELDS.SCOPE]: scope.number,
        [FIELDS.COMPANY_ROLE]: getCompanyRole(engineerUserId, team),
        [FIELDS.SCOPE_NOTE]: scope.note ? scope.note : '-',
        userImage: scope.engineerDetails.engineer.picture || '',
        selectedUserId: scope.engineerDetails.engineer.id,
        scopeId: scope.id,
        userDetails: scope.engineerDetails,
        key: 'engineerDetails'
    };
    return { ...obj }
}

export function formatEmployeeData(employee) {
    const { email, employeeCode, firstName, id, _id, lastName, role } = employee;
    return { email, employeeCode, firstName, id, _id, lastName, role };
}


function getCompanyRole(teamMemberId, companyMember) {
    const companyRole = companyMember.filter(f => f._id === teamMemberId)[0];
    return companyRole && companyRole.role && companyRole.role.name || '-';
}

export function groupScopeRelatedMilestones(scopes, key) {
    const result = {
        archived: [],
        nonArchived: []
    };

    scopes.forEach(scope => scope[key].forEach(item => {
        if (item.isArchived) {
            result.archived.push({ ...item, scopeNumber: scope.number })
        } else {
            result.nonArchived.push({ ...item, scopeNumber: scope.number })
        }
    }));
    return result;
}

export function getTeamMembers(task) {

    if (!task) {
        return [];
    }

    const memberList = [];
    const scopes = task.scopes.filter(item => !item.isArchived)
        .sort((firstScope, secondScope) => firstScope.number > secondScope.number ? 1 : firstScope.number < secondScope.number ? -1 : 0);

    let managers = sortBy(scopes.map(scope => scope.managerDetails.manager), ['employeeCode']);
    let engineers = sortBy(scopes.map(scope => scope.engineerDetails.engineer), ['employeeCode']);
    let drafters = sortBy(scopes.map(scope => scope.drafterDetails.drafter), ['employeeCode']);

    [...managers, ...engineers, ...drafters].forEach(member => {
        if (member && !memberList.find(item => item.id === member.id)) {
            memberList.push({
                id: member.id,
                picture: member.picture,
                name: `${member.firstName} ${member.lastName}`,
                email: member.email
            });
        }
    });

    return memberList;
}

export function checkIdUserExistInScope(scope, userID) {
    const { drafterDetails, managerDetails: { manager }, engineerDetails: { engineer } } = scope;

    if (typeof manager === 'string' && manager === userID) {
        return true;
    }

    if (typeof manager === 'object' && manager._id === userID) {
        return true;
    }

    if (typeof engineer === 'string' && engineer === userID) {
        return true;
    }

    if (typeof engineer === 'object' && engineer._id === userID) {
        return true;
    }

    const drafter = drafterDetails.drafter;

    if (!drafter) {
        return false;
    }

    if (typeof drafter === 'string' && drafter === userID) {
        return true;
    }

    if (typeof drafter === 'object' && drafter._id === userID) {
        return true;
    }

    return false;

}

export function getReferenceGridFilters(task, userId) {

    let filterArray = [];
    let scopeIds = [];

    task.scopes.forEach(item => {
        if (item.isArchived) return;

        let filter = {
            contractor: task.contractor.name,
            tags: task.tags,
            userId,
            keywords: [],
            customKeywordTitle: '',
            scopeIds: [],
            scope: item.number,
            itemType: item.itemType._id
        }
        let scopeKeyword = item.scopeKeywords[0];
        if (!scopeKeyword || !scopeKeyword.enabled) return;
        const allCustomersKeyword = scopeKeyword.itemTypeKeywords.find(item => item.keyword.title === 'All Customers');
        if (allCustomersKeyword && allCustomersKeyword.isDone) {
            filter.contractor = '';
        }
        filter.keywords.push(...scopeKeyword.itemTypeKeywords.filter(item => item.isDone && item.keyword.title !== 'All Customers').map(item => item.keyword.title));
        filter.customKeywordTitle = scopeKeyword.customKeyword.keyword.title;
        filterArray.push(filter);
        scopeIds.push(item.id);    // for removing id's from filtered data
    });

    return filterArray.map(item => ({ ...item, scopeIds }));
}

export function getProjectFolderName(oldValue, newValue, data, field) {
    const { projectName, city, state, task } = data;
    let oldFolderName,
        newFolderName;
    oldFolderName = getProjectPath({
        ...task,
        city,
        state,
        title: projectName,
        [field === 'projectName' ? 'title' : field]: oldValue
    });
    newFolderName = getProjectPath({
        ...task,
        city,
        state,
        title: projectName,
        [field === 'projectName' ? 'title' : field]: newValue
    });
    return {
        oldFolderName,
        newFolderName
    }
}

export function getTaskPayload(oldValue, newValue, data, field) {
    const { taskId } = data;
    const { oldFolderName, newFolderName } = getProjectFolderName(oldValue, newValue, data, field);
    if (field === FIELDS.PROJECT) {
        return {
            taskPayload: {
                id: taskId,
                title: newValue
            },
            oldFolderName,
            newFolderName
        }
    }
    return {
        taskPayload: {
            id: taskId,
            [field]: newValue
        },
        oldFolderName,
        newFolderName
    };
}

export function filterAllGreenMilestone(milestone) {
    return milestone.templates.find(template => !template.isDone)
}