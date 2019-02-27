import { ScopeModel } from '../model/CustomerHomeModels/ScopeModel';
import { showFaliureNotification, showSuccessNotification } from '../utils/notifications';
import { updateScopeDataUsingId, updateScopeHighlight } from '../utils/promises/ScopePromises';
import { SelectedTaskDetailModel } from '../model/TaskModels/SelectedTaskDetailModel';
import { getUsersTotalUrgentNonUrgentHours } from '../utils/promises/UserPromises';
import ReportAction from '../actions/ReportAction';
import ReportStore from '../stores/ReportStore';


export function updateScope(payload, fieldName = '', taskId, loggedInUser) {
    updateScopeDataUsingId(payload.id, payload).then(async response => {
        ScopeModel.updateScope(response.data);
        SelectedTaskDetailModel.updateScope(response.data, taskId);
        showSuccessNotification(`Scope ${fieldName} updated successfully.`);
        await getUsersTotalUrgentNonUrgentHours(loggedInUser);  // on any scope change
        if (fieldName.match(/^(tg|due date|price)$/)) {
            ReportAction.getReport(ReportStore.getState().filters);
        }
    }).catch((e) => { console.log('error', e); showFaliureNotification(`Failed to update scope ${fieldName}.`) });
}

export function updateScopeHighlightService(scopeId, highlight) {
    updateScopeHighlight(scopeId, highlight).then(highlights => {
        showSuccessNotification('scope highlight updated');
        ScopeModel.updateScopeHighlight(highlights, scopeId);
    }).catch(() => {
        showFaliureNotification('Failed to update scope highlight. Please try again.');
    });
}
