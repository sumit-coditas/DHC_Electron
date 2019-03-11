import { Button, Form } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

import PLPPureComponent from '../../../baseComponents/PLPPureComponent';
import { UtilModel } from '../../../model/AppModels/UtilModel';
import { ScopeModel } from '../../../model/CustomerHomeModels/ScopeModel';
import { SelectedTaskDetailModel } from '../../../model/TaskModels/SelectedTaskDetailModel';
import { getTaskNumber } from '../../../utils/common';
import { changeSubmitButtonStyle } from '../../../utils/changeBackgroundOfSubmit';
import { addNewTask, createProjectFolder, getContractorContacts } from '../../../utils/promises/TaskPromises';
import Constants from '../../helpers/Constant';
import { getFileFTPPath, getNewScopeNumber, isValidProjectDescription, isValidScope } from '../projectDetailNew/util';
import ScopesWrapper from './scopeWrapper';
import ProjectDescription from './taskdetail';
import { extractPersonalNotes, getDefaultScope } from './util';
import { UserModel } from '../../../model/UserModel';
import { getUsersTotalUrgentNonUrgentHours } from '../../../utils/promises/UserPromises';

class AddTaskForm extends PLPPureComponent {
    state = {
        projectDescription: {
            contractor: null, jobNumber: 'Yet to be generate', projectName: '',
            city: null, state: null, additionalNote: null
        },
        scopes: [getDefaultScope([], this.props.taskGroup, this.props.loggedInUser)],
        customerContactsList: [],
        error: {
            projectDescription: undefined,
            scopes: []
        },
        maxScopeError: null,
        loading: false
    };

    fetchCustomerList = async (companyName) => {
        const response = await getContractorContacts(companyName);
        this.setState({ customerContactsList: response });
    }

    handleProjectDescriptionChange = (name, value) => {
        if (name === 'contractor') {
            this.fetchCustomerList(value.companyName)
            const note = extractPersonalNotes(value.personalNotes);
            value = {
                ...note,
                name: value.companyName, id: value.id,
                label: value.companyName, value: value.id
            }
        }
        const projectDescription = {
            ...this.state.projectDescription,
            [name]: value
        };
        this.setState({ projectDescription });
    };

    handleAddNewScope = () => {
        const scopes = this.state.scopes.map(scope => scope.number);
        const { taskGroup, loggedInUser } = this.props;
        const newScope = getDefaultScope(scopes, taskGroup, loggedInUser);
        if (newScope.id) {
            this.setState({ scopes: [...this.state.scopes, newScope] });
        } else {
            this.setState({ maxScopeError: newScope.message });
        }
    };

    handleRemoveScope = (scopeId) => {
        const scopes = this.state.scopes.filter((scope) => scope.id !== scopeId);
        scopes.forEach((scope, index) => {
            if (index === 0) return
            const scopeNumber = getNewScopeNumber([scopes[index - 1].number]);
            if (!scopeNumber.success && !this.state.maxScopeError) {
                this.setState({ maxScopeError: scopeNumber.message });
                return
            } else {
                this.setState({ maxScopeError: null });
            }
            scope.number = scopeNumber.scopeNumber
        });
        this.setState({ scopes });

    };

    handleScopeChange = (updatedScope, field) => {
        const scopes = this.state.scopes;
        const index = scopes.map(scope => scope.id).indexOf(updatedScope.id);
        if (field === "price") {
            updatedScope.price = isNaN(updatedScope.price) ? `${updatedScope.price}`.split("$")[1] : updatedScope.price;
            updatedScope.price = `${updatedScope.price}`.trim();
        }
        if (['engineerDetails', 'drafterDetails'].includes(field)) {
            let newScope = { ...scopes[index] };
            newScope[field] = { ...newScope[field], ...updatedScope };
            scopes[index] = newScope
        } else {
            scopes[index] = { ...scopes[index], ...updatedScope }
        }
        this.setState({ scopes });
    };

    isValidTask(task) {
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

    handleSubmit = (e) => {
        e.preventDefault();
        const task = {
            projectDescription: this.state.projectDescription,
            scopes: this.state.scopes
        };
        if (this.isValidTask(task)) {
            const scopes = this.state.scopes.map((scope) => {
                const finalScope = { group: this.props.taskGroup.id, ...scope };
                finalScope.engineerDetails = {
                    ...finalScope.engineerDetails,
                    engineer: finalScope.engineerDetails.engineer.id || finalScope.engineerDetails.engineer,
                };
                return finalScope
            });
            const body = {
                task: {
                    ...this.state.projectDescription,
                    isBidding: this.props.taskGroup.id === Constants.TASK_GROUP__ID.BIDS,
                    isFromTaskGroup: this.props.taskGroup.id === Constants.TASK_GROUP__ID.TASKS,
                    title: this.state.projectDescription.projectName, createdBy: this.props.loggedInUser._id
                },
                scopes: scopes
            };
            this.setState({ loading: true }, () => this.makeAddTaskCall(body));
        }
    };

    createFolder = (newFilePath) => {
        const newPath = { path: newFilePath }
        createProjectFolder(newPath)
            .then((res) => console.log("file created"))
            .catch(error => console.log('file error'))
    }

    updateSelectedTaskModel = (task) => {
        const fileName = getFileFTPPath(task);
        this.createFolder(fileName)

        new SelectedTaskDetailModel(task).$save();
        // this.setState({ taskId: task.id });
        const finalTask = { ...task };                  // task object simillar to Scope inside ScopeModel
        finalTask.scopes = task.scopes.map(scope => scope.id);
        const scopes = [];
        task.scopes.forEach(scope => scopes.push(new ScopeModel({ ...scope, task: finalTask })));
        // ScopeModel.saveAll(scopes)
        ScopeModel.saveAllOnTop(scopes);
        setTimeout(() => this.goToTaskPage(task), 200);
    };

    makeAddTaskCall(task) {
        addNewTask(task)
            .then( async result => {
                await getUsersTotalUrgentNonUrgentHours()
                this.setState({ loading: false });
                this.updateSelectedTaskModel(result)
            })
            .catch(error => {
                this.setState({ loading: false });
                console.log("error", error)
            })
    }

    goToTaskPage = (task) => {
        const data = UtilModel.getUtilsData();
        data.taskId = task.id;
        data.title = `${getTaskNumber(task)} - ${task.title} - ${task.city}, ${task.state} - ${task.contractor.name}`;
        data.newTask = null;
        new UtilModel(data).$save();
    }

    render() {
        return (
            <Form onSubmit={this.handleSubmit}>
                {/* {
                    this.state.loading && <Spinner tip="Adding Task" />
                } */}
                <ProjectDescription
                    goToTask={this.goToTaskPage}
                    newTask={true}
                    error={this.state.error.projectDescription}
                    projectDescription={{...this.state.projectDescription, isFromTaskGroup: this.props.taskGroup.title === 'Tasks'}}
                    onChange={this.handleProjectDescriptionChange}
                    // isTask={this.props.taskGroup.title === 'Tasks'}
                />
                <ScopesWrapper
                    maxScopeError={this.state.maxScopeError}
                    errors={this.state.error.scopes}
                    scopes={this.state.scopes}
                    onAddNewScope={this.handleAddNewScope}
                    onRemoveScope={this.handleRemoveScope}
                    customerContactsList={this.state.customerContactsList}
                    handleScopeChange={this.handleScopeChange}
                    taskGroup={this.props.taskGroup}
                    // isTask={this.props.taskGroup.title === 'Tasks'}
                />
                <div className="ant-row">
                    <div className="ant-col-3 ant-col-offset-1" style={{ float: 'right' }}>
                        <Button type="primary" style={changeSubmitButtonStyle(this.state.loading)} loading={this.state.loading} onClick={this.handleSubmit} className="login-form-button margin-right20">Submit</Button>
                        <Button onClick={this.props.onClose} type="">Cancel</Button>
                    </div>
                </div>
            </Form>
        );
    }
}


function mapStateToProps() {
    const{ _id, id, role, firstName, lastName} = UserModel.last().props;
    return {
        loggedInUser: { _id, id, role, firstName, lastName}
    }
}

export default connect(mapStateToProps)(AddTaskForm)
