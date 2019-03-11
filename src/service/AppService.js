import { updateRole, updateWorkloadGroupStatus } from '../utils/promises/AppPromies';
import { RoleModel } from '../model/AppModels/RoleModel';
import { showFaliureNotification, showSuccessNotification } from '../utils/notifications';
import { UserModel } from '../model/UserModel';

export function updatetRole(data) {
    updateRole(data)
        .then(role => {
            new RoleModel(role).$save();
            showSuccessNotification('Group workload updated successfully');
        })
        .catch(e => {
            showFaliureNotification('Unable to update group workload');
        });
}

export function updateGroupStatus(data) {
    updateWorkloadGroupStatus(data)
        .then(role => {
            new RoleModel(role).$save();
            showSuccessNotification('Group workload updated successfully');
        })
        .catch(e => {
            showFaliureNotification('Unable to update group workload');
        });
}
