import React from 'react';
import { TextAreaAntd, TextInput, CustomVirtualSelect, CustomFormItem } from '../formComponents/inputs';
import { Row, Form, Col } from 'antd';
import PLPPureComponent from '../../../../baseComponents/PLPPureComponent';
import { STATE_OPTIONS } from '../../../../components/filter/stateList';


class ProjectDescription extends PLPPureComponent {
    state = {  }
    handleStateChange = (value, e) => {
        this.props.onChange({target: {name: 'state', value: value.value}});
    }

    render() {
        const { jobNumber, projectName, city, state, additionalnotes, contractor } = this.props.projectDescription;
        const { onContractorSearch, selectedContractor, contractorOptions, onContractorSelection, form, error, syncIcon, isExistError, projectDescription, selectedState } = this.props;
        const taskError = isExistError && <TaskExistError goToTask={this.props.goToTask} existingTasks={isExistError} />
        return (
            <div>
                <Row gutter={4} >
                    {taskError}
                    <CustomVirtualSelect async
                        autoFocus={this.props.newTask}
                        syncIcon={syncIcon}
                        span={7} offset={1} label="Contractor"
                        error={error && error.contractorError}
                        form={form} required={true}
                        onSync={this.props.onSync} onChange={onContractorSelection}
                        options={contractorOptions} loadOptions={onContractorSearch}
                        value={selectedContractor || contractor} />
                    <TextInput span={7} offset={1} error={error && error.jobNumberError} form={form} label={projectDescription.isFromTaskGroup? 'Task  Number' : 'Job Number'} disabled onBlur={this.props.onChange} name="jobNumber" defaultValue={jobNumber} />
                    <TextInput span={7} offset={1} error={error && error.projectNameError} form={form} required={true} onBlur={this.props.onChange} name="projectName" label={projectDescription.isFromTaskGroup? 'Task Name' : 'Project Name'} defaultValue={projectName} />
                </Row>
                <Row gutter={4}>
                    <TextInput span={7} offset={1} error={error && error.cityError} form={form} required={true} label="City" onBlur={this.props.onChange} name="city" defaultValue={city} />
                    {/* <TextInput span={7} offset={1} error={error && error.stateError} form={form} required={true} label="State" onBlur={this.props.onChange} name="state" defaultValue={state} /> */}
                    <CustomVirtualSelect
                        span={7}
                        offset={1}
                        error={error && error.stateError}
                        form={form}
                        required={true}
                        name="state"
                        label="State"
                        value={selectedState || state}
                        options={STATE_OPTIONS}
                        onChange={this.props.handleStateSelection}
                    />
                    <TextAreaAntd span={7} offset={1} form={form} label="Additional Note" onBlur={this.props.onChange} name={"additionalNote"} defaultValue={additionalnotes} />
                </Row>
            </div>
        );
    }
}

class TaskExistError extends PLPPureComponent {
    render() {
        return (
            <Col span={23} offset={1} >
                <div className="error-container">
                    <p className="error-text"> Project name already exist. </p>
                    <ui className="square-bullets">
                        {
                            this.props.existingTasks.map((task) => {
                                return <li className="margin-left-5">
                                    <a onClick={() => this.props.goToTask(task)}>
                                        {task.title}
                                    </a>
                                </li>
                            })
                        }
                    </ui>
                </div>
            </Col>
        )
    }
}

export default ProjectDescription;
