import './sentInvoicePage.scss';

import { Button, Collapse } from 'antd';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import PLPPureComponent from '../../../../baseComponents/PLPPureComponent';
import { EmployeeModel } from '../../../../model/AppModels/EmployeeModel.js';
import { InvoiceModel } from '../../../../model/InvoiceModel/InvoiceModel.js';
import { changeSubmitButtonStyle } from '../../../../utils/changeBackgroundOfSubmit';
import { getInvoiceData, sortEmployee } from '../../../../utils/common';
import { sentInvoiceHeader } from '../../../../utils/constants/ScopeTableHeaders';
import { showFaliureNotification } from '../../../../utils/notifications.js';
import { getSentPaidInvoices, getSentUnpaidInvoices } from '../../../../utils/promises/invoicePromises.js';
import InvoiceTable from '../../../reusableComponents/InvoiceTable/InvoiceTable.js';
import { TeamHeaderNew } from '../../../TeamHeader/TeamHeader.js';
import { TaskPage } from '../../TaskPage/TaskPage';

// import TeamHeader from '../../../teamStatus/TeamHeader.js';
class SentInvoice extends PLPPureComponent {
    constructor(props) {
        super(props);
        this.state = {
            sentPaidRange: { from: 0, to: 20 },
            sentUnpaidRange: { from: 0, to: 20 },
            isCalled: false,
            taskId: '',
            getall: 0,
            invoices: [],
            showPaidLoader: false,
            showUnpaidLoader: false
        }
    }

    componentWillMount() {
        this.getSentPaidInvoices();
        this.getSentUnpaidInvoices();
    }

    componentWillUnmount() {
        InvoiceModel.deleteAll();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ invoices: nextProps.invoices })
    }
    handleLaoder(key, flag) {
        this.setState({ [key]: flag });
    }
    getSentPaidInvoices = () => {
        this.handleLaoder('showPaidLoader', true)
        const { sentPaidRange } = this.state;
        getSentPaidInvoices(sentPaidRange.from, sentPaidRange.to).then(data => {
            InvoiceModel.saveAll(data.map(item => new InvoiceModel(item)));
            this.setState((state) => {
                return {
                    sentPaidRange: {
                        from: state.sentPaidRange.from + 20,
                        to: state.sentPaidRange.to,
                    },
                    isCalled: false,
                    showPaidLoader: false
                };
            });

        }).catch(e => {
            this.handleLaoder('showPaidLoader', false)
            console.log('error', e)
            showFaliureNotification(`Something went wrong while fetching sent paid invoices : ${e}`);
        })
    };

    getSentUnpaidInvoices = () => {
        this.handleLaoder('showUnpaidLoader', true)
        const { sentUnpaidRange } = this.state;
        getSentUnpaidInvoices(sentUnpaidRange.from, sentUnpaidRange.to).then(data => {
            this.setState((state) => {
                return {
                    sentUnpaidRange: {
                        from: state.sentUnpaidRange.from + 20,
                        to: state.sentUnpaidRange.to,
                    },
                    isCalled: false,
                    showUnpaidLoader: false
                };
            });
            InvoiceModel.saveAll(data.map(item => new InvoiceModel(item)));
        }).catch(e => {
            this.handleLaoder('showUnpaidLoader', false)
            showFaliureNotification(`Something went wrong while fetching sent Unpaid invoices : ${e}`);
        })
    };

    onClick = (e) => {
        e.stopPropagation();
        switch (e.target.value) {
            case 'Sent Unpaid':
                this.getAllUnpaidInvoices();
                break;
            case 'Sent Paid':
                this.getAllPaidInvoices();
                break;
        }
    }

    getAllUnpaidInvoices = () => {
        this.handleLaoder('showUnpaidLoader', true)
        this.setState({ getall: 1 });
        getSentUnpaidInvoices(null, null).then(data => {
            this.setState((state) => {
                return {
                    sentUnpaidRange: {
                        from: data.length,
                        to: state.sentUnpaidRange.to,
                    },
                    getall: 3
                };
            });
            InvoiceModel.saveAll(data.map(item => new InvoiceModel(item)));
        }).catch(e => {
            showFaliureNotification(`Something went wrong while fetching sent Unpaid invoices : ${e}`);
        })
    };

    getAllPaidInvoices = () => {
        this.handleLaoder('showPaidLoader', true)
        this.setState({ getall: 2 });
        getSentPaidInvoices(null, null).then(data => {
            this.setState((state) => {
                return {
                    sentUnpaidRange: {
                        from: data.length,
                        to: state.sentPaidRange.to,
                    },
                    getall: 4
                };
            });
            InvoiceModel.saveAll(data.map(item => new InvoiceModel(item)));
        }).catch(e => {
            showFaliureNotification(`Something went wrong while fetching sent Unpaid invoices : ${e}`);
        })
    };

    getGroup = () => {
        return [
            {
                name: 'Sent Unpaid',
                selector: 'N'
            },
            {
                name: 'Sent Paid',
                selector: 'Y'
            }
        ]
    };

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

    onScroll = ({ target }, group) => {
        if (target.scrollTop > (target.scrollHeight - target.clientHeight) / 2 && !this.state.isCalled) {
            this.setState({
                isCalled: true
            });
            if (group === 'N') {
                this.getSentUnpaidInvoices();
            } else if (group === 'Y') {
                this.getSentPaidInvoices();
            }
        }

        if (target.scrollTop > (target.scrollHeight - target.clientHeight) * 3 / 4 && !this.state.isCalled) {

        }
    };

    getSentInvoiceTables = () => this.getGroup().map((group, index) =>
        <Collapse.Panel
            className='page-wrapper'
            key={index}
            header={this.renderGetAll(group.name, index + 1, index + 3)}
        >
            <InvoiceTable
                showLoader={group.name === 'Sent Unpaid' && this.state.showUnpaidLoader || this.state.showPaidLoader}
                headers={sentInvoiceHeader}
                data={this.state.invoices.filter(item => item.paid === group.selector && item.sent === 'Y')}
                openTaskPage={this.openTaskModal}
                pagination={false}
                className="collapse-panel"
                // onScroll={this.onScroll}
                selector={group.selector}
                employees={this.props.employees}
            />
        </Collapse.Panel>);

    renderGetAll = (value, load, disabled) => <div className='header'>
        <div>
            {value}
        </div>
        <div >
            <Button style={changeSubmitButtonStyle(this.state.getall === load)} value={value} onClick={this.onClick} loading={this.state.getall === load} disabled={this.state.getall === disabled} icon='cloud-download'>Get All</Button>
        </div>
    </div>;

    render = () => <div className='invoice_page-wrapper scope-page-container'>
        {this.state.taskId && this.getTaskModal()}
        <TeamHeaderNew />
        <Collapse defaultActiveKey={['0', '1']}>
            {this.getSentInvoiceTables()}
        </Collapse>
    </div>;
}

function mapStateToProps() {
    const employees = sortEmployee(EmployeeModel.list().map(item => item.props))
    const invoices = InvoiceModel.list()
        .filter(({ props }) => props.selectedScopes[0].scope.task)
        .map(({ props }) => getInvoiceData(props, employees));
    return { invoices, employees };
}

export default connect(mapStateToProps)(SentInvoice);
