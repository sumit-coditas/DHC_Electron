import cloneDeep from 'lodash/cloneDeep';
import React from 'react';

import { PLPButton } from '../../../baseComponents/PLPButton';
import { PLPInput } from '../../../baseComponents/PLPInput';
import PLPPureComponent from '../../../baseComponents/PLPPureComponent';
import { SelectedTaskDetailModel } from '../../../model/TaskModels/SelectedTaskDetailModel';
import { updateMilestone } from '../../../utils/promises/TaskPromises';
import Constant from '../../helpers/Constant';
import { ScopeModel } from '../../../model/CustomerHomeModels/ScopeModel';

export class AgreementForm extends PLPPureComponent {

    handleOnClick = () => {
        const { type, task, milestone } = this.props;
        if (type !== Constant.DOC_TYPES.CUSTOMER_SERVICE_AGREEMENT.type) {
            return;
        }

        let agg = cloneDeep(milestone);
        agg.templates.forEach(item => {
            if (item.title.match(/^(Draft created)$/)) {
                item.isDone = true;
            }
        })
        let milestoneType = this.props.type;

        const payload = {
            [this.props.type]: agg,
            taskId: task.id
        };

        updateMilestone(`${milestoneType}/${agg.id}`, payload)
            .then(({ data }) => {
                // ScopeModel.updateMultipleScopesTask(data);
                SelectedTaskDetailModel.updateStore(type, data, task.id);
            });
    };

    render() {
        const { milestone, task, type, disableClick } = this.props;
        return (<form action={`/api/${type}/download`} method='post'>
            <PLPInput type='hidden' name='id' value={milestone.id} />
            <PLPInput type='hidden' name='taskId' value={task.id} />
            <PLPInput type='hidden' name='managerDetails' value={task.managerDetails} />
            <PLPButton htmlType='submit' icon='cloud-download' disabled={disableClick ? 'disabled' : ''} onClick={this.handleOnClick} />
        </form>);
    }
}
