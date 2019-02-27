import React from 'react';
import { PLPPureComponent } from '../../../../baseComponents/importer';
import { Modal } from 'antd';
import { SelectedTaskDetailModel } from '../../../../model/TaskModels/SelectedTaskDetailModel';
import { connect } from 'react-redux';

class PurchaseOrderDetailModal extends PLPPureComponent {
    togglePopup = () => {
        this.props.togglePopup(null, null)
    }

    scopeData = () => this.props.scopes.map(scope => {
        return <div className="po_scope_detail">
            Scope : {scope.definition} <br />
            Price: {scope.price} <br />
            Contact: {scope.customerContact && scope.customerContact.name} <br />
        </div>
    })
    render() {
        console.log("po data", this.props)
        const purchaseOrderDetails = {
            name: this.props.name,

        }
        return (
            <Modal
                visible
                width='650px'
                centered
                onCancel={this.togglePopup}
                footer={null}
            >

                <div className="margin-bottom10">{this.props.selectedPO.name},<br /></div>
                Could you please provide a PO for the following:<br />
                Project:  {this.props.name}<br />
                Project City: {this.props.city}<br />
                {this.scopeData()}
                <br />
                <div className="po_scope_detail"> Additional Note: {this.props.selectedPO.notes}<br /></div>
                <div className="margin-bottom10">If you have any questions regarding this request or the scope of work outlined above, please feel free to contact me at any time<br /></div>
                Thank you,<br />
                {this.props.selectedPO.signature}
            </Modal>
        );
    }
}

function mapStateToProps(state, ownProps) {
    const task = SelectedTaskDetailModel.get(ownProps.data.taskId)
    return {
        purchaseOrder: task.props[ownProps.type].find(po => ownProps.data.id),
        selectedPO: ownProps.data && ownProps.data.sourceData,
        scopes: task.props.scopes.filter(item => !item.isArchived),
        name: task.props.title,
        city: task.props.city
    }
}

export default connect(mapStateToProps)(PurchaseOrderDetailModal);