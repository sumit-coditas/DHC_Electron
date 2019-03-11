import { getGroupTypes } from "../../../utils/common";
import { getUserScopesByGroup } from "../../../utils/promises/UserPromises";

export function getScopes(loggedInUserId, dateRange) {
    return Promise.all(getGroupTypes().map(item => {
        const groupDateRange = dateRange.find(range => range.groupId === item.id);
        const startYear = moment(groupDateRange.value[0]).year();
        const endYear = moment(groupDateRange.value[1]).year();
        return getUserScopesByGroup(loggedInUserId, item.id, startYear, endYear)
    }))
}