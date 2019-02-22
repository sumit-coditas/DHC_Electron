import dateFormat from 'dateformat';

import { padWithZeros } from '../components/reusableComponents/scopeTableNew/ScopeTableUtils';
import { getDifferanceInDays, getMonthDateYearFormat } from './DateUtils';
import sortBy from 'lodash/sortBy';



export function getFormattedNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function getSortedScopes(scopes) {
    scopes.sort((first, second) => {
        return first.number > second.number ? 1 : first.number < second.number ? -1 : 0;
    });
    return scopes;
}

export function getSortedSelectedScopes(selectedScopes) {
    selectedScopes.sort((first, second) => {
        return first.scope.number > second.scope.number ? 1 : first.scope.number < second.scope.number ? -1 : 0;
    });
    return selectedScopes;
}

export function getTaskNumber({ createdAt, taskNumber, isBidding, isFromTaskGroup }) {
    if (isBidding) {
        return 'B' + new Date(createdAt).getFullYear().toString().substr(2, 2) + '-' + padWithZeros(taskNumber, 4);
    } else if (isFromTaskGroup) {
        return 'T' + new Date(createdAt).getFullYear().toString().substr(2, 2) + '-' + padWithZeros(taskNumber, 4);
    }

    return new Date(createdAt).getFullYear().toString().substr(2, 2) + '-' + padWithZeros(taskNumber, 4);
}

// Returns Dates array in between startDate and stopDate
export function getDateRange(startDate, stopDate) {
    Date.prototype.addDays = function (days) {
        let dat = new Date(this.valueOf());
        dat.setDate(dat.getDate() + days);
        return dat;
    };
    let dateArray = [];
    let currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push(currentDate);
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
}

export function getRoundUpHourSpent(oldVal) {
    return function (nextVal) {
        if (isNaN(parseInt(nextVal)) || isNaN(parseInt(oldVal))) {
            return 0;
        }
        if (parseFloat(oldVal) - parseInt(oldVal) > 0 && oldVal > nextVal) {
            return isNaN(parseInt(nextVal)) ? 0 : parseInt(nextVal);
        }
        return nextVal - nextVal % 0.25 + (parseInt(nextVal % 0.25 * 100) / 100 ? 0.25 : 0);
    };
}

export function sortByNameAsc(val1, val2) {
    if (val1 < val2) {
        return 1;
    } else if (val1 > val2) {
        return -1;
    }
    return 0;
}

export function sortByNameDes(val1, val2) {
    if (val1 < val2) {
        return -1;
    } else if (val1 > val2) {
        return 1;
    }
    return 0;
}

export function sortDates(val1, val2, isInverted) {
    if (new Date(val1).getTime() > new Date(val2).getTime()) {
        return 1;
    } else if (new Date(val1).getTime() < new Date(val2).getTime()) {
        return -1;
    }
    return 0;
}

export function formatDate(date) {
    return dateFormat(date, 'm/d/yy');
}

export function isValidHours(hours) {
    return !(!hours || isNaN(hours) || hours < 0 || hours > 1000);
}


function getManagerAndCreator(invoice, employees) {
    const manager = employees.find(user => user._id === invoice.selectedScopes[0].scope.managerDetails.manager);
    const creator = employees.find(user => user._id === invoice.lastModifiedBy);
    return { manager, creator };
}

export function getInvoiceData(invoice, employees) {
    const agingDays = invoice.sent === 'Y' && invoice.sentDate !== null && invoice.sentDate && invoice.paid !== 'Y' ? getDifferanceInDays(Date(), invoice.sentDate) - 30 : '-';
    const taskNumber = getTaskNumber(invoice.selectedScopes[0].scope.task);
    const invoiceNumber = taskNumber + '-' + invoice.number;
    const contractor = invoice.selectedScopes[0].scope.task.contractor.name;
    const city = invoice.selectedScopes[0].scope.task.city;
    const state = invoice.selectedScopes[0].scope.task.state;
    const taskID = invoice.selectedScopes[0].scope.task.id;
    const task_ID = invoice.selectedScopes[0].scope.task._id;
    const projectName = invoice.selectedScopes[0].scope.task.title;
    const paidDate = invoice.paid === 'Y' && invoice.paidDate && invoice.paidDate !== null ? getMonthDateYearFormat(invoice.paidDate) : '-';
    const sentDate = invoice.sent === 'Y' && invoice.sentDate && invoice.sentDate !== null ? getMonthDateYearFormat(invoice.sentDate) : '-';

    let cost = 0;
    if (invoice.totalCost && invoice.totalCost > 0) {
        cost = invoice.totalCost;
    } else {
        invoice.selectedScopes.map((selectedScope) => {
            let price = selectedScope.isPartial ? selectedScope.amount : selectedScope.scope.price;
            cost += price;
        });
    }
    const { manager, creator } = getManagerAndCreator(invoice, employees);
    return {
        agingDays,
        invoiceNumber,
        taskNumber,
        projectName,
        contractor,
        city,
        state,
        taskID,
        task_ID,
        cost,
        paidDate,
        sentDate,
        manager,
        creator,
        paid: invoice.paid,
        sent: invoice.sent,
        toAccounting: invoice.toAccounting,
        hold: invoice.hold,
        id: invoice.id,
        _id: invoice.id,
        templates: invoice.templates
    };
}

export function sortEmployee(employees) {
    return employees.sort((a, b) => {
        if (a.role.name.toLowerCase() > b.role.name.toLowerCase()) // sort string ascending
        {
            return -1;
        }
        if (a.role.name.toLowerCase() < b.role.name.toLowerCase()) {
            return 1;
        }
        if (a.role.name === 'Drafter') {
            return a.employeeCode === b.employeeCode ? 0 : a.employeeCode > b.employeeCode;
        }
        try {
            return Number(a.employeeCode) === Number(b.employeeCode) ? 0 : Number(a.employeeCode) - Number(b.employeeCode);
        } catch (e) {
            return a.employeeCode === b.employeeCode ? 0 : a.employeeCode > b.employeeCode;
        }
    });
}

export function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

export function handleString(string) {
    return string.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase()
        .replace(/^./, function(str){ return str.charAt(0).toUpperCase() + str.slice(1); })
}

export function getGroupTypes() {
    return [
        {
            id: '58bed83e62b976001126f7a6',
            title: 'Active Projects'
        },
        {
            id: '58bed84862b976001126f7a7',
            title: 'On Hold or Potential Projects'
        },
        {
            id: '58bed84f62b976001126f7a8',
            title: 'Tasks'
        },
        {
            id: '590241226a30630011b82056',
            title: 'Bids'
        }
    ];
}

export function sortEmployeeRoleAndEmployeeCode(employees, rule) {
    const isAsc = rule === 'asc' && 'asc' || 'desc';
    let managerEngineer = employees.map(emp => { if (!isNaN(emp.employeeCode)) return { ...emp, employeeCode: parseInt(emp.employeeCode) } }).filter(a => a)
    managerEngineer = sortBy(managerEngineer, ['employeeCode'], isAsc)

    let drafterAdmin = employees.filter(emp => isNaN(emp.employeeCode));
    drafterAdmin = sortBy(drafterAdmin, ['employeeCode'], isAsc)
    return isAsc === 'asc' && [...managerEngineer, ...drafterAdmin] || [...drafterAdmin, ...managerEngineer]
}

export function employeeSortComparator(a, b, isInverted) {
    if (a.role.name.toLowerCase() > b.role.name.toLowerCase()) // sort string ascending
    {
        return -1;
    }
    if (a.role.name.toLowerCase() < b.role.name.toLowerCase()) {
        return 1;
    }
    if (a.role.name === 'Drafter' || a.role.name === 'Admin/AP') {
        // return a.employeeCode === b.employeeCode ? 0 : a.employeeCode > b.employeeCode;
        if (a.employeeCode === b.employeeCode) return 0
        else if (a.employeeCode > b.employeeCode) return 1
        else return -1
    }
    try {
        return Number(a.employeeCode) === Number(b.employeeCode) ? 0 : Number(a.employeeCode) - Number(b.employeeCode);
    } catch (e) {
        return a.employeeCode === b.employeeCode ? 0 : a.employeeCode > b.employeeCode;
    }
}