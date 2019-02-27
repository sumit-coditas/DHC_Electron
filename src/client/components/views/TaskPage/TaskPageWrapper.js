import React from 'react';

import PLPPureComponent from '../../../baseComponents/PLPPureComponent';
import { UtilModel } from '../../../model/AppModels/UtilModel';
import NewTaskModal from '../../taskGroupWrapper/addTask';
import { TaskPage } from './TaskPage';

export default class TaskPageWrapper extends PLPPureComponent {

    closeTaskModal = () => {
        const data = UtilModel.getUtilsData();
        data.title = null;
        data.taskId = null;
        data.newTask = null;
        new UtilModel(data).$save();

        // this.props.updateState({
        //     taskId: null,
        //     title: null,
        //     newTask: null
        // })
    };

    handleGoToTask = (task) => {
        this.props.updateState({ taskId: task.id });
    }

    getTaskModal = () => <TaskPage
        taskId={this.props.taskId}
        title={this.props.title}
        onClose={this.closeTaskModal}
        unEditable={this.props.unEditable}
    />;

    getNewTaskModal = () => <NewTaskModal
        onClose={this.closeTaskModal}
        taskGroup={this.props.newTask}
    />;

    render = () => <div>
        {this.props.taskId && this.getTaskModal()}
        {this.props.newTask && this.getNewTaskModal()}
    </div>;

}
