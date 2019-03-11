import Constant from '../components/helpers/Constant';
import cloneDeep from 'lodash/cloneDeep';
import { sortByNameAsc } from './common';
import { forEach } from 'lodash/forEach';
import sortBy from 'lodash/sortBy'


export function getSortedScopes(scopesData = [], groupId, userId) {
    if (scopesData.length == 0) return [];
    const scopes = cloneDeep(scopesData).map(scope => scope.props);

    let isAlreadySortedData = isAlreadySorted(scopes, groupId, userId);
    if (isAlreadySortedData && isAlreadySortedData[groupId]) {
        const prevGroupIds = [...isAlreadySortedData[groupId]];
        const nonExistedScopes = scopes.filter((scope) => {
            const isExistScope = prevGroupIds.find(id => id === scope.id);
            if (isExistScope) return;
            return scope
        });
        if (nonExistedScopes && nonExistedScopes.length) {
            const prevSortedScopes = sortedScopesFromSortedIds(prevGroupIds, scopes);
            return storeScopesIds([...nonExistedScopes, ...prevSortedScopes], groupId, userId);
        }
        return sortedScopesFromSortedIds(prevGroupIds, scopes);

    }
    return storeScopesIds(scopes, groupId, userId);

}

export function hasOnHoldSelectedScopesInvoice(scope) {
    return scope.task.invoices.find(invoice => {
        return invoice.hold === 'Y' && invoice.selectedScopes.find(selected => {
            if (invoice.isArchived) return false    // if invoice not found
            if (typeof selected.scope === 'string') {
                return selected.scope === scope._id
            } else if (typeof selected.scope === 'object') {
                return selected.scope._id === scope._id
            }
            return false;
        })
    })
}

export function hasNotOnHoldSelectedScopesInvoice(scope) {
    return scope.task.invoices.find(invoice => {
        return invoice.hold === 'N' && invoice.selectedScopes.find(selected => {
            if (typeof selected.scope === 'string') {
                return selected.scope === scope._id
            } else if (typeof selected.scope === 'object') {
                return selected.scope._id === scope._id
            }
            return false;
        })
    })
}

export function isPriceEqualTotalBilled(scope) {
    let isPriceGreater = false;
    let sum = scope.task.invoices.reduce((total, inv) => {
        let selScope = inv.selectedScopes.find(selected => {
            if (typeof selected.scope === 'string') {
                return selected.scope === scope._id
            } else if (typeof selected.scope === 'object') {
                return selected.scope._id === scope._id
            }
        });
        if (selScope) {
            return total + (selScope.isPartial ? selScope.amount : selScope.oldPrice);
        }
        return total;
    }, 0);

    return sum < scope.price;
}

function storeScopesIds(scopes, groupId, userId) {
    let prevRecord = getFromLocalStorage();
    try {
        let manuallysorted = null;
        if (prevRecord) {
            prevRecord = JSON.parse(prevRecord);
            const isUsersExistingData = prevRecord && prevRecord[userId];
            const currentUserData = { ...isUsersExistingData, [groupId]: scopes.map(scope => scope.id) };
            manuallysorted = {
                ...prevRecord,
                [userId]: currentUserData
            }
        } else {
            manuallysorted = {
                [userId]: {
                    [groupId]: scopes.map(scope => scope.id)
                }
            }
        }
        setLocalStorage(manuallysorted);
        return scopes
    } catch (error) {
    }
}

function sortedScopesFromSortedIds(sortedScopeIds = [], scopes = []) {
    if (!sortedScopeIds.length) return scopes;
    const sortedScopes = [];
    sortedScopeIds.forEach(item => {
        const scope = scopes.find(scope => scope.id === item);
        if (scope) { sortedScopes.push(scope) }
    });
    return sortedScopes
}

function isAlreadySorted(scopes, groupId, userId) {
    let prevRecord = getFromLocalStorage();
    try {
        prevRecord = JSON.parse(prevRecord);
        if (prevRecord && prevRecord[userId]) {
            return prevRecord[userId]
        }
        return {}
    } catch (error) {
        return {}
    }
}

export function getFromLocalStorage() {
    return localStorage.getItem(Constant.LOCALSTORAGE_KEY.MANUAL_SORT);
}

export function setLocalStorage(data) {
    data = JSON.stringify(data);
    localStorage.setItem(Constant.LOCALSTORAGE_KEY.MANUAL_SORT, data)
}

export function sortContacts(contact1, contact2) {
    const position1 = contact1.position.toLowerCase();
    const position2 = contact2.position.toLowerCase();
    return sortByNameAsc(position1, position2);
}

export function sortByHighLights(node1, node2, isInverted) {
    let node2ColorIntValue = Constant.SCOPE_HIGHLIGHTERS.find(scopeHighlight => node2.data.scopeHighlightColor && node2.data.scopeHighlightColor === scopeHighlight.value)
    let node1ColorIntValue = Constant.SCOPE_HIGHLIGHTERS.find(scopeHighlight => node1.data.scopeHighlightColor && node1.data.scopeHighlightColor === scopeHighlight.value)
    node1ColorIntValue = node1ColorIntValue || Constant.SCOPE_HIGHLIGHTERS[2]
    node2ColorIntValue = node2ColorIntValue || Constant.SCOPE_HIGHLIGHTERS[2]
    let result = 0;
    if (node1ColorIntValue.intValue < node2ColorIntValue.intValue) {
        return -1;
    } else if (node1ColorIntValue.intValue > node2ColorIntValue.intValue) {
        return 1;
    }

    if (isInverted) {
        return result * -1;
    }
    return result;
}

export function sortItemTypes(itemTypes) {
    itemTypes = itemTypes.map((item) => { return { ...item, sortNumber: item.name && item.name.split('.')[0] && parseInt(item.name.split('.')[0]) || item.name } });
    return sortBy(itemTypes, ['sortNumber']);
}