import React from 'react';
import { connect } from 'react-redux';
import { PLPPureComponent, PLPInput, PLPSelect } from '../../../../baseComponents/importer';
import { SelectedTaskDetailModel } from '../../../../model/TaskModels/SelectedTaskDetailModel';
import { getFormatedInvoiceFormData } from './util';
import { Row} from 'antd';
import ScopeRow from './ScopeRow';


class InvoiceContainer extends PLPPureComponent {
    state = { invoice: null };
    componentDidMount() {
        const invoice = this.props.invoice; // 1644
        const detailedInvoice = getFormatedInvoiceFormData(this.props.scopes, invoice);
        this.setState({ invoice: detailedInvoice });
    }

    handleInvoiceFormChange = ({ target }) => {
        const { value, id, name } = target;
        console.log(value, id, name);
    };

    getTotalCost(selectedScopes=[]) {
        let totalCost = 0;
        selectedScopes.forEach(scope=>{
            if(scope.marked) {
                totalCost = totalCost + scope.scope.price
            }
        });
        return totalCost
    }

    handleScopeChange = (scope, id) => {
        const index = this.state.invoice.selectedScopes.findIndex(selectedScope => selectedScope.scope.id === id);
        if (index === -1) return;
        const invoice = { ...this.state.invoice };
        const selectedScopes = [...invoice.selectedScopes];
        selectedScopes[index] = scope;
        const totalCost = this.getTotalCost(selectedScopes);
        const newInvoice = {
            ...invoice,
            totalCost,
            selectedScopes
        };
        this.setState({ invoice: newInvoice });
    };

    renderInvoices = () => this.state.invoice
        && this.state.invoice.selectedScopes.map(scopeInvoice => <ScopeRow onScopeChange={this.handleScopeChange} scopeInvoice={scopeInvoice} />);

    render() {
        const { invoice } = this.state;
        return (
            <div>
                <Row>
                    <PLPInput label="Invoice Number" id='number' value={invoice && invoice.number}
                        className="ant-col-5" disabled />
                    <PLPInput defaultValue={invoice && invoice.poNumber} label="PO Number" onChange={this.handleInvoiceFormChange}
                        id='poNumber' className="ant-col-5"
                    />
                    <PLPSelect
                        defaultValue={invoice && invoice.hold}
                        options={[{ text: 'N', value: 'N' }, { text: 'Y', value: 'Y' }]}
                        handleChange={(e) => console.log(e)}
                        label='Hold' className="ant-col-2"
                    />
                    <PLPInput defaultValue={invoice && invoice.company} label="Company"
                        onChange={this.handleInvoiceFormChange}
                        id='company' className="ant-col-5"
                    />
                    <PLPInput disabled value={invoice && invoice.totalCost} label="Total Billed"
                        id='totalCost' className="ant-col-5"
                    />
                </Row>
                {this.renderInvoices()}
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    const task = SelectedTaskDetailModel.list().map(item => item.props)[0];
    return {
        scopes: task.scopes.filter(scope => !scope.isArchived),
        invoice: task.invoices.find(inv => inv.id === ownProps.selectedInvoiceId)
    }
}

export default connect(mapStateToProps)(InvoiceContainer);
