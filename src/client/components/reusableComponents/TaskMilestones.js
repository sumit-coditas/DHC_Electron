import React from 'react';
import { connect } from 'react-redux';
import { Button, Col, Switch } from 'antd';
import Constant from '../helpers/Constant';
import { SelectedTaskDetailModel } from '../../model/TaskModels/SelectedTaskDetailModel';
import { ScopeMilestoneWrapper } from './ScopeMilestoneWrapper';
import { MilestoneWrapper } from './MilestoneWrapper';
import './taskMileStone/style.scss';
import PLPPureComponent from '../../baseComponents/PLPPureComponent';
import { Select } from '../../baseComponents/Select';
import { getDrafterHours, getEngineerHours, filterAllGreenMilestone } from './scopeTableNew/ScopeTableUtils';
import { milestoneTypeArray } from '../reusableComponents/CreateMilestone/Constants';
import { UtilModel } from '../../model/AppModels/UtilModel';

const headerWidth = '160px';
const stepWidth = '160px';

class TaskMilestonesImpl extends PLPPureComponent {

    toggleKeywordsVisibility = (value) => {
        console.log('&&&&', value)
        UtilModel.setShowKeywordSection(!value)
    }

    toggleAllGreenMilestonesVisibility = (value) => {
        UtilModel.setShowAllGreenMilestones(!value)
    }

    renderMilestones = (index, { title, type }) => {
        return <MilestoneWrapper
            key={index}
            milestoneList={this.props[`${type}s`]}
            headerWidth={headerWidth}
            stepWidth={stepWidth}
            handleArchive={this.props.handleArchive}
            scopes={this.props.scopes}
            saveTemplateData={this.props.saveTemplateData}
            type={type}
            title={title}
            unEditable={this.props.unEditable}
        />
    };

    getFinalHours() {
        const scopes = this.props.scopes;
        let allScopeHourTrackers = [];
        scopes.forEach((scope) => {
            if (scope.hourTrackers) {
                allScopeHourTrackers = [...allScopeHourTrackers, ...scope.hourTrackers]
            }
        });
        const engineerHours = getEngineerHours(allScopeHourTrackers);
        const drafterHours = getDrafterHours(allScopeHourTrackers);
        return { engineerHours, drafterHours }
    }

    renderFinalHours = () => {
        const { engineerHours, drafterHours } = this.getFinalHours();
        return (
            <Col span={6}>
                <div className='ant-row'>
                    <div className="ant-col-12 modal-stat">
                        <div className="stat-number">{engineerHours || 0}</div>
                        <div className="hour-label"> Eng. Hours To Date </div>
                    </div>
                    <div className="ant-col-12 modal-stat">
                        <div className="stat-number">{drafterHours || 0}</div>
                        <div className="hour-label"> Draft. Hours To Date  </div>
                    </div>
                </div>
            </Col>
        )
    };

    renderMileStoneHeader = (archivedScopesLength, archivedMilestoneLength) => {
        return <div className='modal-section-title full-width'>
            <div className="ant-row">
                <div className="ant-col-3 margin-top-10">
                    <div className="ant-row">
                        <div className="ant-col-3">
                            <span className='fa'></span>
                        </div>
                        <div className="ant-col-18">
                            Milestones
                        </div>
                    </div>
                </div>
                {!this.props.unEditable && [
                    this.renderFinalHours(),
                    <div className="ant-col-3 ant-col-offset-0 margin-top5">
                        <Select
                            style={{ width: '150px' }}
                            placeholder='Select Template'
                            handleChange={this.props.handleSelectTemplateDropdown}
                            className='table-select'
                            dropdownClassName='select-options'
                            options={!this.props.isTask && milestoneTypeArray.slice(1, 9 - this.props.milestoneArrayIndex) || [milestoneTypeArray[9]]}
                            data='showCreateMilestone'
                            value={this.props.selectedTemplate}
                        />
                    </div>
                ]
                }
                {archivedMilestoneLength > 0 && <div className="ant-col-3 ant-col-offset-0 margin-top5">
                    <Button id='showArchivedMilestones' value={true} onClick={this.props.togglePopup}>
                        Archived Milestones {" " + archivedMilestoneLength}
                    </Button>
                </div>
                }
                {archivedScopesLength > 0 && <div className="ant-col-3 ant-col-offset-0 margin-top5">
                    <Button id='showArchivedScopes' value={true} onClick={this.props.togglePopup}>
                        Archived Scopes {' ' + archivedScopesLength}
                    </Button>
                </div>
                }
                <div className="ant-col-3 ant-col-offset-0 margin-top5 milestone_toggle">
                    <Switch checked={!this.props.hideKeywordSection} onChange={this.toggleKeywordsVisibility} /> Toggle Keywords
                </div>

                <div className="ant-col-3 ant-col-offset-0 margin-top5 milestone_toggle">
                    <Switch checked={!this.props.hideAllGreenMilestones} onChange={this.toggleAllGreenMilestonesVisibility} /> Toggle Green Milestones
                </div>
            </div>
        </div>
    };

    renderTaskMilestones = () => <div id='wrapper' className='milestone-wrapper'>
        {!this.props.isTask && [
            Constant.DOC_TYPES.CUSTOMER_SERVICE_AGREEMENT,
            Constant.DOC_TYPES.MODIFIED_CUSTOMER_SERVICE_AGREEMENT,
            Constant.DOC_TYPES.MASTER_AGREEMENT,
            Constant.DOC_TYPES.CLIENT_AGREEMENT,
            Constant.DOC_TYPES.PURCHASE_ORDER,
            Constant.DOC_TYPES.INVOICE
        ].filter(item => {
            if (!this.props.isPoRequired && item === Constant.DOC_TYPES.PURCHASE_ORDER) return;
            return item

        })
        .map((item, index) => this.renderMilestones(index, item))
        }
        <ScopeMilestoneWrapper
            saveTemplateData={this.props.saveTemplateData}
            updateScope={this.props.updateScope}
            handleArchive={this.props.handleArchive}
            headerWidth={headerWidth}
            stepWidth={stepWidth}
            handleCongratulationsPopup={this.props.handleCongratulationsPopup}
            unEditable={this.props.unEditable}
            isTask={this.props.isTask}
        />
    </div>;

    render() {
        const { archivedScopesLength, archivedMilestoneLength } = this.props;
        return (
            <div className='milestone-container'>
                {this.renderMileStoneHeader(archivedScopesLength, archivedMilestoneLength)}
                {this.renderTaskMilestones()}
            </div>
        );
    }
}

function mapStateToProps() {
    const task = SelectedTaskDetailModel.list().map(item => item.props)[0];
    const { clientAgreements, modifiedAgreements, masterAgreements, agreements, invoices, purchaseOrders, scopes } = task;
    const scopeMilestones = scopes.reduce((list, scope) => {
        const milestones = [
            ...scope.letters || [],
            ...scope.tabData || [],
            ...scope.calcs || [],
            ...scope.drawings || [],
            ...scope.custDrawings || []
        ];
        return [...list, ...milestones];
    }, []);

    const archivedMilestoneLength = [...clientAgreements,
    ...modifiedAgreements,
    ...masterAgreements,
    ...agreements,
    ...invoices,
    ...purchaseOrders,
    ...scopeMilestones
    ].filter(item => item.isArchived).length;

    const { hideKeywordSection, hideAllGreenMilestones} = UtilModel.last().props

    return {
        clientAgreements: task.clientAgreements.filter(item => !item.isArchived && ( !hideAllGreenMilestones || filterAllGreenMilestone(item) )),
        modifiedAgreements: task.modifiedAgreements.filter(item => !item.isArchived && ( !hideAllGreenMilestones || filterAllGreenMilestone(item) )),
        masterAgreements: task.masterAgreements.filter(item => !item.isArchived && ( !hideAllGreenMilestones || filterAllGreenMilestone(item) )),
        agreements: task.agreements.filter(item => !item.isArchived && ( !hideAllGreenMilestones || filterAllGreenMilestone(item) )),
        purchaseOrders: task.purchaseOrders.filter(item => !item.isArchived && ( !hideAllGreenMilestones || filterAllGreenMilestone(item) )),
        invoices: task.invoices.filter(item => !item.isArchived && ( !hideAllGreenMilestones || filterAllGreenMilestone(item) )),
        archivedScopesLength: task.scopes.filter(item => item.isArchived).length,
        archivedMilestoneLength,
        isPoRequired: task.contractor && task.contractor.poRequired,
        scopes: task.scopes.filter(item => !item.isArchived),
        hideAllGreenMilestones,
        hideKeywordSection
    };
}

export const TaskMilestones = connect(mapStateToProps)(TaskMilestonesImpl);
