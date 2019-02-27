import React from 'react';
import { connect } from 'react-redux';

import PLPPureComponent from '../../baseComponents/PLPPureComponent';
import { SelectedTaskDetailModel } from '../../model/TaskModels/SelectedTaskDetailModel';
import ScopeMilestone from './scopeMilestone/ScopeMilestone';
import sortBy from 'lodash/sortBy';
import { UtilModel } from '../../model/AppModels/UtilModel';

class ScopeMilestoneWrapperImpl extends PLPPureComponent {

    isMarginRequired = (scope, index) => {
        if (!scope.parent) return true;
        if ((index >= 1 && scope.parent === this.props.scopes[index - 1].parent) || scope.parent === this.props.scopes[index - 1]._id) return false
        return true
    }

    renderMilestoneScope = (scope, index) => <ScopeMilestone
        isMarginRequired={this.isMarginRequired(scope, index)}
        key={index}
        scope={scope}
        headerWidth={this.props.headerWidth}
        stepWidth={this.props.stepWidth}
        invoices={this.props.invoices}
        updateScope={this.props.updateScope}
        saveTemplateData={this.props.saveTemplateData}
        handleArchive={this.props.handleArchive}
        handleCongratulationsPopup={this.props.handleCongratulationsPopup}
        unEditable={this.props.unEditable}
        contractorId={this.props.contractorId}
        taskId={this.props.taskId}
        isTask={this.props.isTask}
        hideKeywordSection={this.props.hideKeywordSection}
        hideAllGreenMilestones={this.props.hideAllGreenMilestones}
    />;

    render = () => <div className='milestone-group'>
        {this.props.scopes.map((scope, index) => this.renderMilestoneScope(scope, index))}
    </div>;
}

function mapStateToProps() {
    const task = SelectedTaskDetailModel.list().map(item => item.props)[0];
    const { hideKeywordSection, hideAllGreenMilestones } = UtilModel.last().props

    return {
        scopes: sortBy(task.scopes && task.scopes.filter(item => !item.isArchived) || [], ['number']),
        invoices: task.invoices.filter(item => !item.isArchived),
        contractorId: task.contractor.id,
        taskId: task.id,
        hideKeywordSection,
        hideAllGreenMilestones
    };
}

export const ScopeMilestoneWrapper = connect(mapStateToProps)(ScopeMilestoneWrapperImpl);
