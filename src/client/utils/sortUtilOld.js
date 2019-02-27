import Constants from '../components/helpers/Constant';
import cloneDeep from 'lodash/cloneDeep';


function sortedScopesFromSortedIds(sortedScopeIds = [], scopes = []) {
    if (!sortedScopeIds.length) return scopes;
    scopes = scopes.reduce((scopeList, scope) => [...scopeList, ...scope]);
    return sortedScopeIds.map(item => {
        const scope = scopes.find(scope => scope.id === item)
        return scope
    })
}

export function sortScopes(scopesData=[], userId) {
    if(scopesData.length === 0) return [];
    let scopes = cloneDeep(scopesData);
    scopes = scopes.map(scope=>scope.props)
    const loggedInUser_Id = userId;
    let manualSortedScopesData = localStorage.getItem(Constants.LOCALSTORAGE_KEY.MANUAL_SORT);
    manualSortedScopesData = manualSortedScopesData && JSON.parse(manualSortedScopesData) || null
    if (manualSortedScopesData) {
        const groupData = manualSortedScopesData[loggedInUser_Id];
        if (groupData) {
            let sortedIds = [];
            groupData.forEach(grp => {
                Constants.TASK_GROUP_ARRAY.forEach(id => {
                    var ids = grp[id]
                    if (ids) { sortedIds = [...sortedIds, ...ids] }
                })
            })
            return sortedScopesFromSortedIds(sortedIds, scopes);
        }
    }
    return handleDefaultSorting(scopes,userId)
}

function handleDefaultSorting(scopes, userId) {
    const loggedInUser_Id = userId;
    let groupsWithScopesIds = []
    scopes.forEach((groupScopes) => {
        if (groupScopes.length) {
            const singleGroupWithScopeIds = {
                [groupScopes[0].group._id]: [...groupScopes.map(scope => scope.id)]
            }
            groupsWithScopesIds.push(singleGroupWithScopeIds)
        }
    })
    const manualSorted = {
        [loggedInUser_Id]: groupsWithScopesIds
    }
    localStorage.setItem(Constants.LOCALSTORAGE_KEY.MANUAL_SORT, JSON.stringify(manualSorted))
    return scopes.reduce((scopeList, scope) => [...scopeList, ...scope])
}