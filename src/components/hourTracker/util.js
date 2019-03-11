import moment from 'moment';
import sortBy from 'lodash/sortBy';

export function formatHourTrackerData(scopes, user) {
    let hourTrackerData = [];
    // scopes = scopes.filter(scope => !scope.isArchived);
    // const scopeHours = scopes.map(scope => scope.hourTrackers);
    scopes.filter(scope => !scope.isArchived)
        .forEach((scope) => {
            scope.hourTrackers.forEach(scopeHour => {
                const obj = {
                    scopeId: scope.id,
                    _id: scopeHour._id,
                    hourId: scopeHour.id,
                    other: scopeHour.other,
                    user: scopeHour.employee,
                    scopeTitle: `${scope.number} - ${scope.note}`,
                    hoursSpent: scopeHour.hoursSpent,
                    date: moment(scopeHour.date),
                    note: scopeHour.note,
                    isDeletable: user._id === scopeHour.employee._id
                };
                hourTrackerData = [...hourTrackerData, obj];
            });
        });
    return hourTrackerData;
}

export function getScopeList(scopes) {
    const list = [];
    scopes = sortBy(scopes, 'number')
    scopes.filter((scope) => {
        if (!scope.isArchived) {
            list.push(
                {
                    label: `${scope.number} - ${scope.note}`,
                    text: `${scope.number} - ${scope.note}`,
                    value: scope.id
                }
            );
        }
    });
    return list;
}


