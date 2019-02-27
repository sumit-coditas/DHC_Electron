import './taskModalForm.scss';

import React, { Component } from 'react';
import { Modal } from 'semantic-ui-react';

import PLPPureComponent from '../../../baseComponents/PLPPureComponent';
import TaskForm from './addTaskForm';

export default class NewTaskModal extends PLPPureComponent {

    renderTaskForm = () => <TaskForm
        {...this.props}
        onClose={this.props.onClose}
        onAddTask={this.props.onAddTask}
        taskGroup={this.props.taskGroup}
    />;

    render = () => <Modal open
        closeIcon className="task-page-container"
        size="fullscreen" onClose={this.props.onClose}
        closeOnEscape={false}
    >
        <Modal.Header>
            {this.props.taskGroup.title === 'Tasks' && 'Add Task' || 'Add Project' }
        </Modal.Header>
        <Modal.Content scrolling>
            {this.renderTaskForm()}
        </Modal.Content>
    </Modal>
}
