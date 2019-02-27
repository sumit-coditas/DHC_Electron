import React, { PropTypes } from 'react';

import { PLPDatePicker, PLPPureComponent } from '../../../../baseComponents/importer';
import { isWithinSameWeek, isDueDateAfterWeek, isTodayOrPast, isWithinWeekOrNextSevenDays } from '../../../../utils/DateUtils';
import moment from 'moment';
import { updateScopeDataUsingId } from '../../../../utils/promises/ScopePromises';
import { showSuccessNotification, showFaliureNotification } from '../../../../utils/notifications';
import { ScopeModel } from '../../../../model/CustomerHomeModels/ScopeModel';
import { updateScope } from '../../../../service/scopeService';
import Constant from '../../../helpers/Constant';
import { FIELDS } from '../../../../utils/constants/ScopeTableFields'
import { PLPDATE_FORMAT } from '../../../../utils/constant';

export default class DueDateRenderer extends PLPPureComponent {

    handleDuedateChange = async (dueDate) => {
        updateScope({
            dueDate,
            id: this.props.data.id
        }, 'due date');

    };

    updateScope = (payload, fieldName = '') => {
        updateScopeDataUsingId(payload.id, payload).then(response => {
            ScopeModel.updateScope(response.data);
            showSuccessNotification(`Scope ${fieldName} updated successfully.`);
        }).catch(() => showFaliureNotification(`Failed to update scope ${fieldName}.`))
    };

    disabledDate = (value) => {
        if (this.props.colDef.type === 'completed') return false
        return value < moment().subtract(1, 'days')
    }

    checkIsCompleted(status) {
        const taskGroupId = Constant.TASK_GROUP__ID.TASKS;
        const bidGroupId = Constant.TASK_GROUP__ID.BIDS;
        const isStatusComplete = status == [Constant.STATUS_OPTIONS_SEMANTIC[3].value]
        return [taskGroupId, bidGroupId].includes(this.props.data.group._id) && isStatusComplete
    }

    render() {
        const { value } = this.props;
        const colDef = this.props.colDef
        let date = null;
        if (typeof value === 'object') {    // for home page table to show date as complete for  task group
            date = value.date;
        } else {
            date = value;
        }
        let className = isDueDateAfterWeek(date) && 'dueDatePicker' || isTodayOrPast(date) && 'red-container-cell';
        className = colDef.type === 'completed' && 'dueDatePicker' || className
        const formatType = isWithinWeekOrNextSevenDays(date) ? 'ddd' : PLPDATE_FORMAT;
        if (typeof value === 'object' && this.checkIsCompleted(value.status))
            return <div>Complete</div>;
        return <PLPDatePicker
            className={"dueDatePicker " + className}
            disabledDate={this.disabledDate}
            defaultValue={moment(date, PLPDATE_FORMAT)}
            format={formatType}
            onChange={this.handleDuedateChange}
            autoFocus={false}
        />
    }
}
