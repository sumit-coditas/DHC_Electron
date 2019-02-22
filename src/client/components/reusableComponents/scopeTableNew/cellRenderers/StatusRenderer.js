import React from 'react';

import { PLPPureComponent, PLPSelect } from '../../../../baseComponents/importer';
import { ScopeModel } from '../../../../model/CustomerHomeModels/ScopeModel';
import { showFaliureNotification, showSuccessNotification } from '../../../../utils/notifications';
import { updateScopeDataUsingId } from '../../../../utils/promises/ScopePromises';
import { getUsersTotalUrgentNonUrgentHours } from '../../../../utils/promises/UserPromises';
import Constant from '../../../helpers/Constant';
import { UserModel } from '../../../../model/UserModel';

export default class StatusRenderer extends PLPPureComponent {

    // checks if logged in user is drafter or not
    isDrafter = (loggedInUserRoleId) => loggedInUserRoleId === Constant.ROLE_ID.DRAFTER;

    // handle status change
    handleStatusChange = (value, data) => {
        let scopeInstance = ScopeModel.getScopeId(data.id);
        if (!scopeInstance) return;

        if (value.toLowerCase() === 'complete' && data.group && (data.group.id === Constant.TASK_GROUP_TITLE_ID.BIDS.ID || data.group.id === Constant.TASK_GROUP_TITLE_ID.TASKS.ID)) {
            const scopeWorkDetails = {
                nonUrgentHours: 0,
                status: value,
                urgentHours: 0
            }
            let drafterDetails = { ...scopeInstance.props.drafterDetails, ...scopeWorkDetails };
            let engineerDetails = { ...scopeInstance.props.engineerDetails, ...scopeWorkDetails };
            let managerDetails = { ...scopeInstance.props.managerDetails, ...scopeWorkDetails };
            const scopeToUpdate = { drafterDetails, engineerDetails, managerDetails, id: data.id }
            this.updateScope(scopeToUpdate, 'status', data.loggedInUserId);
            return;
        }

        let drafterDetails = scopeInstance.props.drafterDetails; // hack to avoid state mutation
        if (drafterDetails.drafter && drafterDetails.drafter._id === data.loggedInUserId) {
            // let drafterDetails = data.scopeTeam.drafterDetails;
            drafterDetails.status = value;
            this.updateScope({ drafterDetails, id: data.id }, 'status', data.loggedInUserId);
            return;
        }
        let engineerDetails = scopeInstance.props.engineerDetails;
        engineerDetails.status = value;
        this.updateScope({ engineerDetails, id: data.id }, 'status', data.loggedInUserId);

    };

    updateScope = (payload, fieldName = '', loggedInUserID = null) => {
        updateScopeDataUsingId(payload.id, payload).then(response => {
            ScopeModel.updateScope(response.data);
            showSuccessNotification(`Scope ${fieldName} updated successfully.`);
            if (fieldName = 'status') {
                getUsersTotalUrgentNonUrgentHours(loggedInUserID);
            }
        }).catch(() => showFaliureNotification(`Failed to update scope ${fieldName}.`))
    };

    render = () => <PLPSelect
        defaultValue={this.props.value}
        data={this.props.data}
        handleChange={this.handleStatusChange}
        className='table-select'
        dropdownClassName='select-options'
        options={Constant.STATUS_OPTIONS_SEMANTIC}
    />
}
