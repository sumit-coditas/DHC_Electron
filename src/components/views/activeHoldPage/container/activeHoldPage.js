import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Collapse } from 'antd';

import { TeamHeaderNew } from '../../../TeamHeader/TeamHeader.js';
import InvoiceTable from '../../../reusableComponents/InvoiceTable/InvoiceTable.js';
import { TaskPage } from '../../TaskPage/TaskPage';
import { sentInvoiceHeader } from '../../../../utils/constants/ScopeTableHeaders';
import { InvoiceModel } from '../../../../model/InvoiceModel/InvoiceModel.js';
import { getActiveHoldInvoices } from '../../../../utils/promises/invoicePromises';
import { showFaliureNotification } from '../../../../utils/notifications.js';
import { getInvoiceData, sortEmployee } from '../../../../utils/common';
import './activeHoldPage.scss';
import { EmployeeModel } from '../../../../model/AppModels/EmployeeModel.js';
import { UtilModel } from '../../../../model/AppModels/UtilModel.js';


class SentInvoice extends Component {
    constructor(props) {
        super(props);
        this.state = {
            taskId: '',
            showLoader: true
        };
        this.handleLoader(true)
    }

    componentDidMount() {
        this.getActiveHoldInvoices();
    }

    componentWillMount() {
        InvoiceModel.deleteAll();
    }

    handleLoader(flag) {
        UtilModel.updateLoaderValue(flag)
    }

    getActiveHoldInvoices = () => {
        getActiveHoldInvoices().then(data => {
            InvoiceModel.saveAll(data.map(item => new InvoiceModel(item)));
            this.setState({ showLoader: false });
            this.handleLoader(false)
        }).catch(e => {
            console.log(e);
            this.setState({ showLoader: false });
            this.handleLoader(false);
            showFaliureNotification(`Something went wrong while fetching sent paid invoices : ${e}`);
        })
    };

    getGroup = () => [
        {
            name: 'Active',
            selector: 'N'
        },
        {
            name: 'Hold',
            selector: 'Y'
        }
    ];

    openTaskModal = ({ data }) => {
        this.setState({
            taskId: data.taskID,
            title: `${data.taskNumber} - ${data.projectName} - ${data.city}, ${data.state}`
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

    getSentInvoiceTables = () => this.getGroup().map(group => <Collapse.Panel className='page-wrapper' header={group.name}>
        <InvoiceTable
            headers={sentInvoiceHeader}
            showLoader={this.state.showLoader}
            data={this.props.invoices.filter(item => item.hold === group.selector && item.sent === 'N')}
            openTaskPage={this.openTaskModal}
            pagination={true}
        />
    </Collapse.Panel>);

    render = () => <div className='invoice_page-wrapper scope-page-container'>
        {this.state.taskId && this.getTaskModal()}
        {/* <div>
            <TeamHeader
                socket={this.props.socket}
                location={this.props.location} />
        </div> */}
        <TeamHeaderNew />
        <div>
            <Collapse defaultActiveKey={['0']}>
                {this.getSentInvoiceTables()}
            </Collapse>
        </div>
    </div>;

}

function mapStateToProps() {
    const employees = sortEmployee(EmployeeModel.list().map(item => item.props));
    return {
        invoices: InvoiceModel.list()
            .filter(item => item.props.selectedScopes[0].scope.task)
            .map(({ props }) => getInvoiceData(props, employees))
    }
}

export default connect(mapStateToProps)(SentInvoice);
