import { searchTask } from '../../../utils/promises/TaskPromises';
import { getTaskNumber } from '../../../utils/common';

export async function searchTaskDetails(payload) {
            searchTask(payload)
            .then(searchResult=>{
            searchResult = searchResult.forEach(element => {
                const scopes = element.scopes.forEach(scope=>{
                    scope.label = `${scope.number} - ${scope.note}`;
                    scope.value = `${scope.id}`;
                    return scope;
                })
                element.scopes = scopes;
                element.label = getTaskNumber(element);
                element.value = element.id;
                return element
            });
            return searchResult
        })
}

export const  OTHER_OPTIONS = [
    { label:'',value:'' },
    { label:'PTO',value:'PTO' },
    { label:'Holiday',value:'Holiday' },
    { label:'Bids',value:'Bids' },
    { label:'Tasks',value:'Tasks' },
    { label:'DHC',value:'DHC' },
]