import React, { PureComponent } from 'react';
import { Collapse } from 'antd';
import { ScopeTableNew } from '../../../reusableComponents/scopeTableNew/ScopeTableNew';
import { uninvoicedHeader } from '../../../../utils/constants/ScopeTableHeaders';
import { TaskPage } from '../../TaskPage/TaskPage';
import './uninvoicedPageComponent.scss';
import PLPPureComponent from '../../../../baseComponents/PLPPureComponent';
const tableTypes = [{ type: 1, name: 'Completed - Not Invoiced', action: 1 }, { type: 1, name: 'Invoiced - On Hold', action: 2 }];

export default class UninvoicedPageContainer extends PLPPureComponent {
    constructor(props) {
        super(props);
        this.state = {
            taskId: null,
            title: ''
        }
    }

    getHoldScopes = () => tableTypes.map(item => <Collapse.Panel header={item.name} className='collapse-header'>
        <ScopeTableNew
            groupId={item.type}
            showLoader={this.props.showLoader}
            selector='invoiceType'
            header={uninvoicedHeader}
            openTaskPage={this.openTaskModal}
            action={item.action}
        />
    </Collapse.Panel>);

    openTaskModal = ({ data }) => {
        this.setState({
            taskId: data.taskId,
            title: `${data.jobNumber} - ${data.projectName} - ${data.city}, ${data.state}`
        });
    };

    closeTaskModal = () => {
        this.setState({
            taskId: null,
            title: ''
        });
    };

    getTaskModal = () => <TaskPage
        taskId={this.state.taskId}
        title={this.state.title}
        onClose={this.closeTaskModal}
    />;

    render = () => <div className='uninvoiced-page-container main-page_wrapper'>
        <Collapse defaultActiveKey={['0']}>
            {this.getHoldScopes()}
            {this.state.taskId && this.getTaskModal()}
        </Collapse>
    </div>;
}

