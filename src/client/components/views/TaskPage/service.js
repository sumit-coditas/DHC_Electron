import { addHourRecord, addHourToScope } from '../../../utils/promises/TaskPromises';
import { SelectedTaskDetailModel } from '../../../model/TaskModels/SelectedTaskDetailModel';

export async function addHourAndScope(payload, taskId) {
    try {
        payload = { ...payload, scopeID: payload.selectedScope }
        const response = await addHourRecord(payload);
        const body = {
            scopeID: payload.selectedScope.id,
            ...response
        }
        const scope = await addHourToScope(body);
        SelectedTaskDetailModel.addHourToScope(scope, taskId)
        console.log("scope", scope)
    } catch (error) {
        console.log("error", error)
    }
}
