import sortBy from 'lodash/sortBy';
import { getTeamManagerDetails, getTeamEngineerDetails, getTeamDrafterDetails } from '../../reusableComponents/scopeTableNew/ScopeTableUtils';

export function deisgnAllocationData(scopes = [], users) {
    let scopeDetails = [];
    scopes = sortBy(scopes, (scope) => {
        return scope.number;
    });
    const managerdetails = scopes.length && getTeamManagerDetails(scopes[0], users);
    // scopeDetails = [...scopeDetails, { ...managerdetails, scopedetails: scopes[0] }];

    scopeDetails.push(managerdetails);

    scopes.forEach(scope => {
        const engineerdetails = getTeamEngineerDetails(scope, users);
        const drafterdetails = getTeamDrafterDetails(scope, users);
        scopeDetails.push(engineerdetails);
        scopeDetails.push(drafterdetails);
        // scopeDetails = [...scopeDetails, { ...engineerdetails, scopedetails: scope }, { ...drafterdetails, scopedetails: scope }]
    });
    return scopeDetails;
}

export function sortEmployee(employeeCode1, employeeCode2) {
    let employeeCode1Match;
    let employeeCode2Match;
    let a1;
    let b1;
    let i = 0;
    let numReturnVal;
    let employeeCode1Length;
    let regexPattern = /(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g;
    if (employeeCode1 === employeeCode2) {
        return 0;
    }
    employeeCode1Match = employeeCode1.toLowerCase().match(regexPattern);
    employeeCode2Match = employeeCode2.toLowerCase().match(regexPattern);
    employeeCode1Length = employeeCode1Match.length;
    while (i < employeeCode1Length) {
        if (!employeeCode2Match[i]) {
            return 1;
        }
        a1 = employeeCode1Match[i];
        b1 = employeeCode2Match[i++];
        if (a1 !== b1) {
            numReturnVal = a1 - b1;
            if (!isNaN(numReturnVal)) {
                return numReturnVal;
            }
            return a1 > b1 ? 1 : -1;
        }
    }
    return employeeCode2Match[i] ? -1 : 0;
}
