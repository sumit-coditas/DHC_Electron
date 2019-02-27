import './purchaseOrder.scss';

import { Form, Modal, Row, Col } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import { PLPInput } from '../../../baseComponents/PLPInput';
import PLPPureComponent from '../../../baseComponents/PLPPureComponent';
import { SelectedTaskDetailModel } from '../../../model/TaskModels/SelectedTaskDetailModel';
import Constant from '../../helpers/Constant';
import { isEmptyString } from '../../../utils/Validation';

import { changeSubmitButtonStyle } from '../../../utils/changeBackgroundOfSubmit';

class PurchaseOrderFormImpl extends PLPPureComponent {

    constructor(props) {
        super(props);
        this.state = {
            name: props.purchaseOrder && props.purchaseOrder.name || null,
            signature: props.purchaseOrder && props.purchaseOrder.signature || null,
            notes: props.purchaseOrder && props.purchaseOrder.notes || null,
        };
    }

    isValid = () => {
        const { name, signature } = this.state
        return isEmptyString(name) || isEmptyString(signature)
    }

    handleChange = ({ target }) => {
        const { name, value } = target;
        this.setState({ [name]: value });
    }

    togglePopup = () => {
        this.setState({ loading: false });
        this.props.togglePopup({ selectedMilestoneId: null, showPurchaseOrderForm: false })
    }

    handleSubmitClick = () => {
        this.setState({ loading: true });
        const purchaseOrder = {
            id: this.props.purchaseOrder.id
        };
        if (this.state.name) {
            purchaseOrder.name = this.state.name;
        }
        if (this.state.signature) {
            purchaseOrder.signature = this.state.signature;
        }
        if (this.state.notes) {
            purchaseOrder.notes = this.state.notes;
        }
        Promise.resolve(this.props.saveTemplateData(Constant.DOC_TYPES.PURCHASE_ORDER.type, purchaseOrder))
            .then(() => this.togglePopup())
            .catch(e => {
                this.setState({ loading: false });
                console.log(e)
            });
    }

    renderScopes = (scopes) => scopes.map(scope => <Row gutter={16}>
        <Col className="gutter-row" span={8}>
            <PLPInput
                label='Scope' disabled
                className='gutter-box'
                value={`Scope ${scope.number}`}
            />
        </Col>
        <Col className="gutter-row" span={8}>
            <PLPInput
                label='Price' disabled
                className='gutter-box'
                value={scope.price}
            />
        </Col>
        <Col className="gutter-row" span={8}>
            <PLPInput
                label='Contact' disabled
                className='gutter-box'
                value={scope.customerContact && scope.customerContact.name || ''}
            />
        </Col>
    </Row >)


    render() {

        const { name, signature, notes } = this.state;
        const { pojectName, city, scopes, purchaseOrder } = this.props;

        return (<Modal
            visible
            width='800px'
            className='purchase-order-container'
            onCancel={this.togglePopup}
            onOk={this.handleSubmitClick}
            confirmLoading={this.state.loading}
            title='Purchase Order'
            cancelButtonProps={{ className: 'cancel-btn-right' }}
            okButtonProps={{ disabled: this.isValid(), style: changeSubmitButtonStyle(this.state.loading) }}
            okText='Submit'
        >
            <Form>
                <Row gutter={16}>
                    <Col className="gutter-row" span={12}>
                        <PLPInput
                            name='name'
                            label='Customer Contact First Name'
                            className='gutter-box'
                            required
                            value={name}
                            onChange={this.handleChange}
                        />
                    </Col>
                    <Col className="gutter-row" span={12}>
                        <PLPInput
                            name='signature'
                            required
                            label='DHC Employee'
                            className='gutter-box'
                            value={signature}
                            onChange={this.handleChange}
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col className="gutter-row" span={12}>
                        <PLPInput
                            label='Project'
                            disabled
                            className='gutter-box'
                            value={this.props.name}
                        />
                    </Col>
                    <Col className="gutter-row" span={12}>
                        <PLPInput
                            label='Project City'
                            className='gutter-box'
                            value={city} disabled
                        />
                    </Col>
                </Row>

                {this.renderScopes(scopes)}
                <Row gutter={16}>
                    <Col className="gutter-row" span={12}>
                        <PLPInput
                            name='notes'
                            label='Additional Notes'
                            className='gutter-box'
                            value={notes}
                            onChange={this.handleChange}
                        />
                    </Col>
                </Row>
            </Form>
        </Modal >);
    }
}

function mapStateToProps(state, ownProps) {
    const task = SelectedTaskDetailModel.list().map(item => item.props)[0];
    console.log(task.purchaseOrders, task.purchaseOrders.find(item => item.id === ownProps.purchaseOrderId), ownProps.purchaseOrderId)
    return {
        purchaseOrder: task.purchaseOrders.find(item => item.id === ownProps.purchaseOrderId),
        scopes: task.scopes.filter(item => !item.isArchived),
        name: task.title,
        city: task.city
    };
}

export const PurchaseOrderForm = connect(mapStateToProps)(PurchaseOrderFormImpl);
