import React, { Component } from 'react';

import { PLPPureComponent, PLPSelect } from '../../../../baseComponents/importer';
import { STATE_OPTIONS } from '../../../../components/filter/stateList';
import { ScopeModel } from '../../../../model/CustomerHomeModels/ScopeModel';
import { SelectedTaskDetailModel } from '../../../../model/TaskModels/SelectedTaskDetailModel';
import { renameProjectFolderOnFTP } from '../../../../service/TaskService';
import { showFaliureNotification, showSuccessNotification } from '../../../../utils/notifications';
import { updateTaskNew } from '../../../../utils/promises/TaskPromises';
import { getTaskPayload } from '../ScopeTableUtils';

class StateRenderer extends PLPPureComponent {
    state = { selectedItem: { text: '', value: '' } }

    handleSelected = (selectedItem) => {
        this.setState({ selectedItem });
        let scopeInstance = ScopeModel.get(this.props.data.id);
        if (!scopeInstance) return;
        let { task } = scopeInstance.props;
        let data = {
            taskId: task.id,
            projectName: task.title,
            city: task.city,
            state: task.state,
            task
        }
        const { oldFolderName, newFolderName, taskPayload } = getTaskPayload(this.props.value, selectedItem, data, 'state');
        this.updateTask({ id: this.props.data.task.id, state: selectedItem })
            .then(() => renameProjectFolderOnFTP(oldFolderName, newFolderName));
    }

    updateTask = (payload) => {
        return updateTaskNew(payload.id, payload).then(response => {
            showSuccessNotification(`Task state updated successfully.`);
            SelectedTaskDetailModel.updateTaskDescription(response, response.id)
            ScopeModel.updateScope(response);
        }).catch(() => showFaliureNotification(`Failed to update task state.`));
    };

    render() {
        const defaultValue = this.props.value || this.state.selectedItem;
        return <PLPSelect
            className='table-select'
            dropdownClassName='select-options'
            value={defaultValue}
            options={STATE_OPTIONS}
            handleChange={this.handleSelected}
        />
    }
}

export default StateRenderer;
