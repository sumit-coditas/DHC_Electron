import './styles.scss';

import { Button, Col, Form, Row } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Accordion } from 'semantic-ui-react';

import PLPPureComponent from '../../../baseComponents/PLPPureComponent';
import { UserModel } from '../../../model/UserModel';
import { SelectedTaskDetailModel } from '../../../model/TaskModels/SelectedTaskDetailModel';
import { showConfirmationModal } from '../../../utils/cofirmationModal';
import { changeSubmitButtonStyle } from '../../../utils/changeBackgroundOfSubmit';
import { archiveScope, updateProjectDetails } from './eventHandler/scopeEvent';
import ProjectDescription from './projectDescriptionWrapper';
import ScopeWrapper from './scopesWrapper';
import {
    getFileFTPPath,
    getFinalTask,
    getNewScopeNumber,
    getNewScopeSkelton,
    getProjectDetailData,
    isValidProjectDescription,
    isValidScope,
} from './util';

class ProjectDetailContainer extends PLPPureComponent {
    state = {
        projectDetails: {
            projectDescription: {},
            scopes: [],
        },
        newScopes: [],
        error: {
            projectDescription: undefined,
            scopes: []
        },
        searchedContractor: [],
        selectedContractor: undefined,
        customerContacts: [],
        maxScopeError: null,
        disableSubmit: false,
        isUpdatingHours: false
        // isTask: this.props.isTask
    };

    onNewScopeChange = (updatedScope, updatedScopeList, field, index) => {
        if (['engineerDetails', 'drafterDetails'].includes(field)) {
            if (index === -1) {
                updatedScopeList = [...updatedScopeList, { id: updatedScope.id, [field]: updatedScope }];
                return updatedScopeList
            }
            let newScope = { ...updatedScopeList[index] };
            newScope[field] = { ...newScope[field], ...updatedScope };
            updatedScopeList[index] = newScope;
            return updatedScopeList
        }
        if (index == -1) {
            updatedScopeList = [...updatedScopeList, updatedScope];
            return updatedScopeList
        }
        updatedScopeList[index] = { ...updatedScopeList[index], ...updatedScope };
        return updatedScopeList
    };

    onScopeModification = (updatedScope, updatedScopeList, field, index) => {
        let oldScope = this.props.projectDetails.scopes.filter(scope => scope.id === updatedScope.id)[0];
        if (updatedScope.urgentHours || updatedScope.nonUrgentHours || ['engineerDetails', 'drafterDetails'].includes(field)) {
            this.setState({ isUpdatingHours: true });
        }
        const role = field == 'engineerDetails' ? 'engineer' : 'drafter';
        const userDetails = { ...oldScope[field] };
        oldScope[field] = {
            ...oldScope[field],
            [role]: userDetails[role]
        };
        if (['engineerDetails', 'drafterDetails'].includes(field)) {
            if (index === -1) {
                updatedScopeList = [...updatedScopeList, { id: updatedScope.id, [field]: { ...oldScope[field], ...updatedScope } }];
                return updatedScopeList
            }
            let scopeModification = { ...updatedScopeList[index] };
            scopeModification[field] = { ...oldScope[field], ...scopeModification[field], ...updatedScope };
            updatedScopeList[index] = scopeModification;
            return updatedScopeList
        }
        if (index == -1) {
            updatedScopeList = [...updatedScopeList, updatedScope];
            return updatedScopeList
        } else {
            updatedScopeList[index] = { ...updatedScopeList[index], ...updatedScope };
            return updatedScopeList
        }
    };

    handleScopeChangeNew = (updatedScope, field) => {
        if (field === "price") {
            updatedScope.price = isNaN(updatedScope.price) ? `${updatedScope.price}`.split("$")[1] : updatedScope.price;
            updatedScope.price = `${updatedScope.price}`.trim();
        }
        let updatedScopeList = updatedScope.isNewScope ? this.state.newScopes : this.state.projectDetails.scopes;
        const index = updatedScopeList.map(scope => scope.id).indexOf(updatedScope.id);
        if (updatedScope.isNewScope) {
            updatedScopeList = this.onNewScopeChange(updatedScope, updatedScopeList, field, index);
            this.setState({ newScopes: updatedScopeList });
        } else {
            updatedScopeList = this.onScopeModification(updatedScope, updatedScopeList, field, index);
            const projectDetails = { ...this.state.projectDetails, scopes: updatedScopeList };
            this.setState({ projectDetails });
        }
    };

    handleProjectDescriptionChange = (name, value) => {
        let projectDescription = { ...this.state.projectDetails.projectDescription };
        if (name === 'projectName') {
            projectDescription.title = value
        }
        projectDescription[name] = value
        const projectDetails = { ...this.state.projectDetails, projectDescription };
        this.setState({ projectDetails });
    };

    isValidForm(task) {
        let error = { projectDescription: undefined, scopes: [] };
        const projectDescriptionError = isValidProjectDescription(task.projectDescription);
        if (typeof projectDescriptionError === "object") {
            error = { ...error, projectDescription: { ...projectDescriptionError } }
        }

        task.scopes.map((scope) => {
            const scopeError = isValidScope(scope);
            if (typeof scopeError === 'object') {
                error.scopes.push(scopeError)
            }
        });
        this.setState({ error });
        return error.projectDescription === undefined && error.scopes.length === 0
    }

    handleUpdateTask = async (e) => {
        e.preventDefault();
        const finalTask = getFinalTask(this.props.projectDetails, this.state.projectDetails, this.state.newScopes);
        if (this.isValidForm(finalTask)) {
            this.setState({ disableSubmit: true });
            const taskId = this.props.projectDetails.id;
            const oldPath = getFileFTPPath(this.props.projectDetails.projectDescription);
            const newPath = getFileFTPPath(finalTask.projectDescription);

            const projectDetailPayload = {
                taskId,
                ...this.state.projectDetails,
                newScopes: this.state.newScopes.map((scope) => {
                    const obj = {
                        ...scope,
                        engineerDetails: {
                            ...scope.engineerDetails,
                            engineer: scope.engineerDetails.engineer && scope.engineerDetails.engineer.id || scope.engineerDetails.engineer
                        }
                    }
                    // scope.engineerDetails = {
                    //     ...scope.engineerDetails,
                    //     engineer: scope.engineerDetails.engineer && scope.engineerDetails.engineer.id || scope.engineerDetails.engineer
                    // };
                    return obj
                }),
                isUpdatingHours: this.state.isUpdatingHours,
                userID: this.props.loggedInUser._id
            };
            updateProjectDetails(projectDetailPayload, { oldPath, newPath }, (flag) => this.setState({ disableSubmit: flag, newScopes: [] }))
            // this.setState({ disableSubmit: true });
        }
    };

    handleAddNewScope = (e) => {
        e.preventDefault();
        let loggedInUser = this.props.loggedInUser;
        let scope;
        let scopes = [...this.props.existingScopes, ...this.state.newScopes];
        scopes = scopes.map(scope => scope.number);
        let engineer = null;
        if (loggedInUser.role.name === 'Engineer' || loggedInUser.role.name === 'Manager') {
            engineer = {
                id: loggedInUser._id,
                firstName: loggedInUser.firstName,
                lastName: loggedInUser.lastName,
                name: loggedInUser.firstName + ' ' + loggedInUser.lastName
            };
        }
        // const isFromTaskGroup = taskGroup.id === Constant.TASK_GROUP__ID.TASKS;
        scope = getNewScopeSkelton(scopes, engineer, this.props.projectDetails);
        if (scope.id) {
            scope.task = this.props.projectDetails._id;
            const newScopes = [...this.state.newScopes, scope];
            this.setState({ newScopes });
        } else {
            this.setState({ maxScopeError: scope.message });
        }
    };

    handleRemoveScope = (scopeId, isArchive, childScopes) => {
        if (isArchive) {
            const userID = this.props.loggedInUser._id
            const payload = { scopeId, isArchived: true, taskId: this.props.projectDetails.id, childScopes, userID };
            const title = 'Archive Scope ?', content = `Are you sure you want to archive Scope? This action will archive all rev scopes related to this scope.`;
            showConfirmationModal(title, content, () => archiveScope(payload));
        } else {
            let scopes = this.props.projectDetails.scopes.map(scope => scope.number);
            const newScopes = this.state.newScopes.filter((scope) => scope.id !== scopeId);
            newScopes.forEach((scope) => {
                const scopeNumber = getNewScopeNumber(scopes);
                if (!scopeNumber.success && !this.state.maxScopeError) {
                    this.setState({ maxScopeError: scopeNumber.message });
                    return
                } else {
                    this.setState({ maxScopeError: null });
                }
                scope.number = scopeNumber.scopeNumber;
                scopes = [...scopes, scopeNumber.scopeNumber]
            });
            this.setState({ newScopes });
        }
    };

    toggleAccordian = () => {
        this.setState({ showProjectDetails: !this.state.showProjectDetails });
    };

    renderForm = () => <Form className="container" onSubmit={this.handleUpdateTask} layout={"vertical"}>
        <ProjectDescription
            error={this.state.error.projectDescription}
            onChange={this.handleProjectDescriptionChange} />
        <ScopeWrapper
            maxScopeError={this.state.maxScopeError}
            onRemoveScope={this.handleRemoveScope}
            onAddNewScope={this.handleAddNewScope}
            handleScopeChange={this.handleScopeChangeNew}
            errors={this.state.error.scopes}
            scopes={[...this.props.projectDetails.scopes, ...this.state.newScopes]} />
        <Row>
            <Col span={2} style={{ float: 'right' }} offset={1}>
                <Button style={changeSubmitButtonStyle(this.state.disableSubmit)} type="primary" loading={this.state.disableSubmit} onClick={this.handleUpdateTask} className="login-form-button">Submit</Button>
            </Col>
        </Row>
    </Form>;

    renderHeader = () => <div className="d-flex p-2 title-border-bottom ">
        <Row style={{ marginBottom: 5, alignItems: 'center' }} type="flex" justify="start">
            <Col>
                <div className='fa list-icon'></div>
            </Col>
            <Col span={22}> <h3 className='font-weight-bold'>{this.props.isTask ? 'Task Details' : 'Project Details'}</h3> </Col>
            <Col> <i className='dropdown icon' style={{ float: 'right', marginTop: '1%' }} /> </Col>
        </Row>
    </div>;

    render = () => <Accordion className="project-detail-layout container-fluid">
        <Accordion.Title
            className="header"
            active={this.state.showProjectDetails}
            onClick={this.toggleAccordian}
        >
            {this.renderHeader()}
        </Accordion.Title>
        <Accordion.Content active={this.state.showProjectDetails}>
            {
                this.props.archivedScopesLength > 0 && <div className="ant-row">
                    <div className="ant-col-3 ant-col-offset-1">
                        <Button id='showArchivedScopes' value={true} onClick={this.props.togglePopup}>
                            {`Archived Scopes ` + this.props.archivedScopesLength}
                        </Button>
                    </div>
                </div>
            }
            {this.state.showProjectDetails && this.renderForm()}
        </Accordion.Content>
    </Accordion>;
}

function mapStateToProps() {
    const task = SelectedTaskDetailModel.list().map(item => item.props)[0];
    const { role, _id, firstName, lastName } = UserModel.last().props
    return {
        projectDetails: getProjectDetailData(task),
        loggedInUser: { role, _id, firstName, lastName },
        existingScopes: task.scopes.filter(scope => !scope.parent),
        archivedScopesLength: task.scopes.filter(scope => scope.isArchived).length,
        isTask: task.isFromTaskGroup
    };
}

export default connect(mapStateToProps)(ProjectDetailContainer)
