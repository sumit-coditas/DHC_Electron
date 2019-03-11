import '../../reusableComponents/scopeTableNew/scopeTableNew.scss';
import './styles/ScopeDetailsStyle.scss';

import React from 'react';
import isEqual from 'react-fast-compare';
import { connect } from 'react-redux';
import { Loader, Modal } from 'semantic-ui-react';

import PLPPureComponent from '../../../baseComponents/PLPPureComponent';
import { ReferenceGridScopesModel } from '../../../model/CustomerHomeModels/ReferenceGridScopesModel';
import { ScopeModel } from '../../../model/CustomerHomeModels/ScopeModel';
import { UserModel } from '../../../model/UserModel';
import { SelectedTaskDetailModel } from '../../../model/TaskModels/SelectedTaskDetailModel';
import { getTaskNumber, handleString, toTitleCase } from '../../../utils/common';
import { showFaliureNotification } from '../../../utils/notifications';
import { getTaskDetails } from '../../../utils/promises/customerHomePagePromises';
import { getReferenceScopes, updateScopeDataUsingId } from '../../../utils/promises/ScopePromises';
import { updateMilestone } from '../../../utils/promises/TaskPromises';
import Constant from '../../helpers/Constant';
import { AddHourtrackerForm } from '../../hourTracker/addHour';
import { ArchivedMilestone } from '../../reusableComponents/ArchivedMilestone/ArchivedMilestone';
import { ArchivedScopes } from '../../reusableComponents/ArchivedScopes/ArchivedScopes';
import CreateMilestone from '../../reusableComponents/CreateMilestone/CreateMilestone';
import { PurchaseOrderForm } from '../../reusableComponents/purchaseOrderForm/PurchaseOrderForm';
import { getReferenceGridFilters } from '../../reusableComponents/scopeTableNew/ScopeTableUtils';
import { TaskMilestones } from '../../reusableComponents/TaskMilestones';
import { CommentWrapper } from '../../taskGroupWrapper/comment/CommentWrapper';
import ProjectDetails from '../../taskGroupWrapper/projectDetailNew';
import TagContainer from '../../taskGroupWrapper/tag/tagContainer';
import { FooterSection } from './componentWrapper/footerSection';
import PurchaseOrderDetailModal from './componentWrapper/PurchaseOrderDetailModal';
import { addHourAndScope } from './service';
import TeamMembers from './team';
import { getUsersTotalUrgentNonUrgentHours } from '../../../utils/promises/UserPromises';

class TaskPageImpl extends PLPPureComponent {

    constructor(props) {
        super(props);
        this.state = {
            showProjectDetails: true,
            showArchivedMilestones: false,
            showArchivedScopes: false,
            showCreateMilestone: false,
            showAddHourForm: false,
            showPurchaseOrderForm: false,
            purchaseOrderDetails: null,
            hidePOForm: false
        };
    }

    componentDidMount() {
        if (!SelectedTaskDetailModel.get(this.props.taskId)) {
            this.getTaskDetails(this.props.taskId);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.taskId !== nextProps.taskId) {
            ReferenceGridScopesModel.deleteAll()
            this.getTaskDetails(nextProps.taskId);
            return;
        }

        if (nextProps.referenceGridFilters && !isEqual(this.props.referenceGridFilters, nextProps.referenceGridFilters)) {
            this.getReferenceScopes(nextProps.referenceGridFilters)
        }
    }

    componentWillUnmount() {
        SelectedTaskDetailModel.deleteAll();
        ReferenceGridScopesModel.deleteAll();
    }

    getTaskDetails = async (taskId) => {
        try {
            const task = await getTaskDetails(taskId);
            new SelectedTaskDetailModel(task).$save();
        } catch (e) {
            console.log(e);
        }
    };

    getReferenceScopes = async (filterArray) => {
        try {

            let promises = [];

            ReferenceGridScopesModel.deleteAll();

            filterArray.forEach(item => {
                if (item.customKeywordTitle.length === 0 && item.keywords.length === 0) {
                    return;
                }
                promises.push(getReferenceScopes(item).then(resp => ({ resp, referenceScope: item.scope })));
            });

            if (promises.length === 0) {
                return;
            }

            const data = await Promise.all(promises);

            let referenScopes = {};

            data.forEach(item => {
                item.resp.forEach(scope => {
                    let availableScope = referenScopes[scope.id];
                    if (availableScope) {
                        availableScope.referenceScope += `, ${item.referenceScope}`
                    } else {
                        referenScopes[scope.id] = { ...scope, referenceScope: item.referenceScope }
                    }
                });
            });

            ReferenceGridScopesModel.saveAll(Object.values(referenScopes).map(item => new ReferenceGridScopesModel(item)));

        } catch (e) {
            console.log(e);
        }
    }

    getTitle = () => <h4 className="font-weight-bold">
        {this.props.title}
    </h4>;

    getTeam = () => <TeamMembers />;

    getProjectDetails = () => <ProjectDetails
        togglePopup={this.togglePopup}
    />;

    handleArchive = (type, id, isArchived, _id = null) => {
        if (this.props.unEditable) return;

        const url = `${type}/archive/${id}`;
        if (isArchived && type === 'scope') {
            let scopes = this.props.task.scopes.filter(item => item.id === id || item.parent === _id);
            const promises = [];
            scopes.forEach(scope => promises.push(updateMilestone(`${type}/archive/${scope.id}`, { taskId: this.props.task.id, [type]: { isArchived } })));

            Promise.all(promises)
                .then(async response => {
                    const scopes = response.map(item => item.data);
                    await getUsersTotalUrgentNonUrgentHours(this.props.loggedInUser._id)
                    SelectedTaskDetailModel.updateScopes(scopes, this.props.task.id);
                    ScopeModel.updateMultipleScopes(scopes, this.props.task.id)
                    // showSuccessNotification(`${type} has been ${isArchived && 'archived' || 'restored'}.`);
                })
                .catch((e) => {
                    console.log('handleArchive error', e);
                    showFaliureNotification(`Error in ${isArchived && 'archiving' || 'restoring'} ${toTitleCase(type)}.`);
                });
        } else {
            updateMilestone(url, { taskId: this.props.task.id, [type]: { isArchived } })
                .then(async ({ data }) => {
                    if (type === 'scope') await getUsersTotalUrgentNonUrgentHours(this.props.loggedInUser._id)
                    SelectedTaskDetailModel.updateStore(type, data, this.props.task.id);
                    // showSuccessNotification(`${toTitleCase(type)}  has been ${isArchived && 'archived' || 'restored'}.`);
                })
                .catch((e) => {
                    console.log('handleArchive error', e);
                    showFaliureNotification(`Error in ${isArchived && 'archiving' || 'restoring'} ${type}.`);
                });
        }
    };

    saveTemplateData = async (type, newData) => {
        if (this.props.unEditable) return
        const url = `${type}/${newData.id}`;
        const payload = {
            [type]: newData,
            taskId: this.props.task.id
        }
        updateMilestone(url, payload)
            .then(({ data }) => {
                SelectedTaskDetailModel.updateStore(type, data, this.props.task.id);

                // showSuccessNotification(`${handleString(type)} has been updated.`);
            })
            .catch((e) => {
                showFaliureNotification(`Error in updating ${handleString(type)}.`);
            });
    };

    updateScope = (scopeId, payload) => {
        updateScopeDataUsingId(scopeId, payload)
            .then(({ data }) => {
                SelectedTaskDetailModel.updateStore(Constant.DOC_TYPES.SCOPE.type, data, this.props.task.id);
                // showSuccessNotification(`Scope has been updated.`);
            })
            .catch(error => {
                console.log(error);
                this.forceUpdate();
                showFaliureNotification(`Error in updating scope.`);
            });
    };

    togglePopup = ({ target: { id, value } }) => {
        this.setState({ [id]: value, selectedTemplate: undefined, selectedMilestoneId: null, parent: null, hidePOForm: false });
    };

    renderArchivedMilestones = () => <ArchivedMilestone
        unEditable={this.props.unEditable}
        handleArchive={this.handleArchive}
        togglePopup={this.togglePopup}
    />;

    renderArchivedScopes = () => <ArchivedScopes
        unEditable={this.props.unEditable}
        handleArchive={this.handleArchive}
        togglePopup={this.togglePopup}
    />;

    renderAddMilestone = () => <CreateMilestone
        isTask={this.props.task.isFromTaskGroup}
        saveTemplateData={this.saveTemplateData}
        hidePOForm={this.state.hidePOForm}
        type={this.state.selectedTemplate}
        togglePopup={this.togglePopup}
        selectedMilestoneId={this.state.selectedMilestoneId}
        parent={this.state.parent}
        milestoneArrayIndex={this.props.milestoneArrayIndex}
    />;

    renderPurchaseOrderForm = () => <PurchaseOrderForm
        purchaseOrderId={this.state.selectedMilestoneId}
        togglePopup={this.handleDocumentClick}
        saveTemplateData={this.saveTemplateData}
    />;

    handleSelectTemplateDropdown = (value, data, parent) => {
        this.setState({ selectedTemplate: value, [data]: true, parent });
    };

    handleHourAdd = (hourData) => {
        addHourAndScope(hourData, this.props.task.id)
    };

    handleDocumentClick = (state) => {
        this.setState({ ...this.state, ...state })
    };

    handleDropDownFromTaskMileStone = (value, data, parent) => {
        if (value === 'purchaseOrder') {
            this.setState({ selectedTemplate: value, [data]: true, parent, hidePOForm: true });
            return;
        }
        this.setState({ selectedTemplate: value, [data]: true, parent });

    }
    getMilestonesNew = () => <TaskMilestones
        handleSelectTemplateDropdown={this.handleDropDownFromTaskMileStone}
        togglePopup={this.togglePopup}
        saveTemplateData={this.saveTemplateData}
        handleArchive={this.handleArchive}
        updateScope={this.updateScope}
        handleCongratulationsPopup={this.props.handleCongratulationsPopup}
        unEditable={this.props.unEditable}
        selectedTemplate={this.state.selectedTemplate}
        isTask={this.props.task.isFromTaskGroup}
        milestoneArrayIndex={this.props.milestoneArrayIndex}
    />;

    renderHourForm = () => <AddHourtrackerForm
        showScope
        enableAllDate={true}
        togglePopup={() => this.setState({ showAddHourTrackerForm: false })}
    />;

    renderPurchaseOrderDetailModal = () => <PurchaseOrderDetailModal
        data={this.state.purchaseOrderDetails} type="purchaseOrders"
        togglePopup={this.handlePurchaseOrderDetailView} />

    handlePurchaseOrderDetailView = (data, taskId) => this.setState({ purchaseOrderDetails: data });

    onAddHourClick = () => this.setState({ showAddHourTrackerForm: true });

    getFooterSection = () => <FooterSection
        handleDocumentClick={this.handleDocumentClick}
        onAddHourClick={this.onAddHourClick}
        // onAddInvoice={this.onAddInvoiceClick}
        showPurchaseOrderDetail={this.handlePurchaseOrderDetailView}
        taskNumber={getTaskNumber(this.props.task)}
        updateScope={this.updateScope}
        handleArchive={this.handleArchive}
        handleSelectTemplateDropdown={this.handleSelectTemplateDropdown}
        isTask={this.props.task.isFromTaskGroup}
    />;

    getTagsSection = () => <TagContainer
        disabled={this.props.unEditable}
    />;

    getCommentsSection = () => <CommentWrapper
        unEditable={this.props.unEditable}
    />;

    getLoader = () => <Loader inverted active>Loading</Loader>;

    renderTaskDetails = () => <div className='task-details'>
        {/* {this.getTeam()} */}
        {!this.props.unEditable && this.getProjectDetails()}
        {this.getMilestonesNew()}
        {!this.props.unEditable && this.getFooterSection()}
        {this.getTagsSection()}
        {this.getCommentsSection()}
    </div>;

    render = () => <Modal
        open
        closeIcon
        className="task-page-container"
        size="fullscreen"
        onClose={this.props.onClose}
        closeOnEscape={false}
    >
        <Modal.Header>
            {this.props.task && this.getTeam()}
            {this.getTitle()}
        </Modal.Header>
        <Modal.Content scrolling>
            {this.state.showArchivedMilestones && this.renderArchivedMilestones()}
            {this.state.showArchivedScopes && this.renderArchivedScopes()}
            {this.state.showCreateMilestone && this.renderAddMilestone()}
            {this.state.showPurchaseOrderForm && this.state.selectedMilestoneId && this.renderPurchaseOrderForm()}
            {this.props.task && this.renderTaskDetails() || this.getLoader()}
            {this.state.showAddHourTrackerForm && this.renderHourForm()}
            {this.state.purchaseOrderDetails && this.renderPurchaseOrderDetailModal()}
        </Modal.Content>
    </Modal>;
}

function mapStateToProps(state, ownProps) {
    const task = SelectedTaskDetailModel.list().map(item => item.props)[0];

    if (!task) {
        return {};
    }

    let user = UserModel.last().props;
    let referenceGridFilters = getReferenceGridFilters(task, user._id);

    return {
        task,
        loggedInUser: user,
        title: `${getTaskNumber(task)} - ${task.title} - ${task.city}, ${task.state} - ${task.contractor.name}` || ownProps.title,
        milestoneArrayIndex: task.contractor.poRequired ? 0 : task.isFromTaskGroup ? 5 : 1,
        referenceGridFilters
    };
}

export const TaskPage = connect(mapStateToProps)(TaskPageImpl);
