import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { Button, Modal } from 'antd';
import isEqual from 'react-fast-compare';

import Constant from '../../helpers/Constant';
import { groupScopeRelatedMilestones } from '../scopeTableNew/ScopeTableUtils';
import { SelectedTaskDetailModel } from '../../../model/TaskModels/SelectedTaskDetailModel';
import PLPPureComponent from '../../../baseComponents/PLPPureComponent';

class ArchivedScopesImpl extends PLPPureComponent {

    restoreMilestone = (event) => {
        if (this.props.unEditable) return;

        this.props.handleArchive(event.target.value, event.target.id, false);
    };

    togglePopup = (event) => {
        this.props.togglePopup({ target: { id: 'showArchivedScopes', value: false } });
    };

    getArchieveScope = (milestone, { title, type }) => <div id={milestone.id} className="archived-modal-row border-bottom">
        <div className='width-33'> {`${title} ${milestone.number}`}</div>
        <div className='width-33'> {milestone.note || ''}</div>
        <Button className="width-33 restore-btn" icon="undo" value={type} id={milestone.id} onClick={this.restoreMilestone} disabled={this.props.unEditable} >Restore</Button>
    </div>;

    render = () => <Modal
        title="Archived Scopes"
        visible
        centered
        id='archived_scope_modal'
        bodyStyle={{ overflow: 'auto', maxHeight: 400 }}
        onCancel={this.togglePopup}
        footer={null}
    >
        <div className="archived-modal-row">
            <div className="archived-modal-header width-33"> Milestone</div>
            <div className="archived-modal-header width-33"> Scope</div>
            <div className="archived-modal-header width-33"> Restore </div>
        </div>
        {this.props.scopes.map(scope => this.getArchieveScope(scope, Constant.DOC_TYPES.SCOPE))}
    </Modal>

}

function mapStateToProps() {
    const task = SelectedTaskDetailModel.list().map(item => item.props)[0];
    return {
        scopes: task.scopes.filter(item => item.isArchived),
    };
}

export const ArchivedScopes = connect(mapStateToProps)(ArchivedScopesImpl);

