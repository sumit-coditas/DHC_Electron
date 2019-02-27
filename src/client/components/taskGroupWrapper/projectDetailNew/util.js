import shortid from 'shortid';
import { getTaskNumber } from '../../../utils/common';
import Constant from '../../../components/helpers/Constant';
import cloneDeep from 'lodash/cloneDeep';
import uniqBy from 'lodash/uniqBy';

export function getOptions(array = [], valueKey = '', labelKey = '') {
    return array.map((item) => {
        const option = {
            ...item,
            value: item[valueKey],
            label: item[labelKey],
            text: item[labelKey]
        };
        return option
    })
}

export function getProjectDetailData(task) {

    const { additionalNote, city, contractor, state, title, id, _id, createdAt, taskNumber, isBidding, isFromTaskGroup } = task;
    const scopes = cloneDeep(task.scopes);

    let lastScopeGroup = { _id: Constant.TASK_GROUP__ID.ACTIVE_PROJECTS };
    let nonArchievedScopes = scopes.filter(item => !item.isArchived);
    if (nonArchievedScopes.length > 0 && nonArchievedScopes[nonArchievedScopes.length - 1].group._id !== Constant.TASK_GROUP__ID.COMPLETED_PROJECTS) {
        lastScopeGroup = nonArchievedScopes[nonArchievedScopes.length - 1].group;
    }

    const projectDetail = {
        id,
        _id,
        projectDescription: {
            contractor: {
                ...contractor, label: contractor.name, value: contractor.id
            },
            jobNumber: getTaskNumber(task),
            taskNumber,
            projectName: title, city: city, state: state,
            additionalnotes: additionalNote, createdAt,
            isBidding,
            isFromTaskGroup
        },
        scopes: scopes.filter((scope) => {
            if (!scope.parent && !scope.isArchived) {
                let { id, note, number, price, dueDate, itemType, hourTrackers, definition, managerDetails, engineerDetails, drafterDetails } = scope;
                scope.customerContact = { ...scope.customerContact, label: scope.customerContact && scope.customerContact.name || '-', value: scope.customerContact && scope.customerContact.id || '-' };
                scope.itemType = { ...scope.itemType, label: scope.itemType.name, value: scope.itemType._id }
                const obj = {
                    id, note, number, price, dueDate, _id: scope._id,
                    itemType: scope.itemType, customerContact: scope.customerContact, definition, managerDetails,
                    engineerDetails, drafterDetails, hourTrackers
                };
                return obj
            }
        }),
        group: lastScopeGroup
    };
    return projectDetail

}

export function getContractorOptions(searchedContractor = [], projectDetails, generalizeCompanyName = false) {
    let contractorOptions = [];
    if (searchedContractor.length === 0) {
        return projectDetails ? [projectDetails.contractor] : []
    } else {
        if (generalizeCompanyName) {
            const customers = uniqBy(searchedContractor, 'companyName').map(contractor => ({ companyName: contractor.companyName, id: contractor.id }));
            contractorOptions = uniqBy([
                ...customers.map(customer => ({
                    ...customer,
                    companyName: `${customer.companyName.split('[')[0].trim()}${customer.companyName.indexOf('[') > -1 ? ' [All]' : ''}`
                })),
                ...customers
            ], 'companyName');
        } else {
            contractorOptions = _.uniqBy(searchedContractor, 'companyName')
        }
        return contractorOptions.map((contractor) => ({
            ...contractor,
            name: contractor.companyName,
            id: contractor.id,
            label: contractor.companyName,
            value: contractor.id
        }));
    }
}

export function getContactOptions(contacts = [], scope) {
    if (contacts.length === 0) {
        let { customerContact } = scope;
        return [customerContact]
    } else {
        return contacts.filter((contact) => {
            contact.label = contact.displayName;
            contact.value = contact.id;
            return contact
        })
    }
}

export function isEmpty(str = '') {
    if (str === null || str === undefined) {
        return true
    }
    return `${str}`.trim().length === 0
}

export function isNumber(str = '') {
    return !isNaN(parseFloat(str)) && isFinite(str);
}

export function isValidScope(scope) {
    const { definition, note, itemType, price, dueDate, engineerDetails, drafterDetails } = scope;
    const definitionError = isEmpty(definition) ? 'Required' : null;
    const noteError = isEmpty(note) ? 'Required' : null;
    const itemTypeError = isEmpty(itemType) ? 'Required' : null;
    const dueDateError = isEmpty(dueDate) ? 'Required' : null;
    const priceError = !isNumber(price) ? 'Required' : null;
    const engineerError = engineerDetails && isEmpty(engineerDetails.engineer) ? engineerDetails.engineer == undefined || engineerDetails.engineer == '-' ? 'Required' : null : null;
    const engineerUrgentHourError = engineerDetails && !isNumber(engineerDetails.urgentHours) ? 'Required' : null;
    const engineerNonUrgentHoursError = engineerDetails && !isNumber(engineerDetails.nonUrgentHours) ? 'Required' : null;
    if (!definitionError && !noteError && !itemTypeError && !dueDateError && !priceError && !engineerError && !engineerUrgentHourError && !engineerNonUrgentHoursError) {
        return true
    }
    const error = {
        id: scope.id,
        error: {
            definitionError, noteError, itemTypeError,
            dueDateError, priceError, engineerError,
            engineerUrgentHourError, engineerNonUrgentHoursError,
        }
    };
    return error
}

export function getFinalTask(task, modifiedDetails, newScopes = []) {
    const projectDescription = {
        ...task.projectDescription,
        ...modifiedDetails.projectDescription
    };
    const { scopes } = task;
    const modifiedScopes = modifiedDetails.scopes;
    const finalScopes = scopes.map((scope) => {
        let newScope = modifiedScopes.filter(mScope => scope.id === mScope.id)[0];
        if (newScope && newScope.id) {
            const drafterDetails = { ...scope.drafterDetails, ...newScope.drafterDetails };
            const engineerDetails = { ...scope.engineerDetails, ...newScope.engineerDetails };
            return { ...scope, ...newScope, drafterDetails, engineerDetails }
        }
        return scope
    });
    return { projectDescription, scopes: [...finalScopes, ...newScopes] }
}

export function isValidProjectDescription(projectDescription) {
    const { contractor, jobNumber, projectName, city, state } = projectDescription;
    const contractorError = isEmpty(contractor) ? 'Required' : null;
    const jobNumberError = isEmpty(jobNumber) ? 'Required' : null;
    const projectNameError = isEmpty(projectName) ? 'Required' : null;
    const cityError = isEmpty(city) ? 'Required' : null;
    const stateError = isEmpty(state) ? 'Required' : null;
    const error = {
        contractorError, jobNumberError,
        projectNameError, cityError, stateError
    };
    return !contractorError && !jobNumberError && !projectNameError && !cityError && !stateError ? undefined : error;
}

export function getNewScopeSkelton(scopes, engineerDetails, projectDetails, newTask) {
    let managerDetails = null;
    if (!newTask) {
        const oldScope = projectDetails.scopes[0];
        managerDetails = {
            ...oldScope.managerDetails,
            manager: oldScope.managerDetails.manager && oldScope.managerDetails.manager._id || null,
        }
    }
    const scopeNumber = getNewScopeNumber(scopes);
    if (scopeNumber.success) {
        return {
            id: shortid.generate(),
            number: scopeNumber.scopeNumber,
            definition: 'Prepare PE stamped design plans and calculations for ',
            note: '',
            dueDate: new Date(),
            price: 0,
            status: '',
            customerContact: '',
            engineerDetails: {
                engineer: engineerDetails ? engineerDetails : undefined,
                urgentHours: 0,
                nonUrgentHours: 0,
                status: 'ASAP'
            },
            drafterDetails: {
                drafter: null,
                urgentHours: 0,
                nonUrgentHours: 0,
                status: null
            },
            managerDetails: {
                urgentHours: 0,
                nonUrgentHours: 0,
                status: null,
                ...managerDetails,
                manager: newTask && newTask.managerDetails.manager.id || managerDetails.manager,
            },
            isNewScope: true,
            hourTrackers: [],
            group: newTask && newTask.group || projectDetails.group,
            taskID: !newTask && projectDetails.id,
            task: !newTask && projectDetails._id,
            isArchived: false,
            itemType:((newTask && newTask.isFromTaskGroup) || (projectDetails && projectDetails.projectDescription.isFromTaskGroup)) && '59cac2d594d0000012f60414' || null,
            completedDate: null,
            customerContact: { name: '', id: '' }
        };
    }
    return scopeNumber
}

export function getNewScopeNumber(scopes = []) {
    if (scopes.length === 0) {
        return { success: true, scopeNumber: String.fromCharCode(65) }
    }
    const lastScopeNumber = scopes.pop();
    const scopeCode = lastScopeNumber.charCodeAt(0);
    if (scopeCode === 72 || scopeCode === 78) {
        return { success: true, scopeNumber: String.fromCharCode(scopeCode + 2) }
    }
    if (scopeCode >= 65 && scopeCode < 90) {
        return { success: true, scopeNumber: String.fromCharCode(scopeCode + 1) }
    }
    return { success: false, message: "Create New Project/Task" }

}

export function getFileFTPPath(task) {
    const { contractor, createdAt, projectName, state, city, title } = task;
    const contractorName = contractor.company ? contractor.company.trim() : contractor.name;
    const year = new Date(createdAt).getFullYear();
    return `${contractorName}/${year}/${city}, ${state} - ${projectName || title} - ${getTaskNumber(task)}`
}
