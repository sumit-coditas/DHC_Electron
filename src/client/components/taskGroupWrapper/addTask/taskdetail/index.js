import React, { Component } from 'react';
import TaskDescriptionForm from '../../projectDetailNew/projectDescriptionWrapper/form';
import { getContractorOptions } from '../../projectDetailNew/util';
import { getContractors, isTaskExist } from '../../../../utils/promises/TaskPromises';
import PLPPureComponent from '../../../../baseComponents/PLPPureComponent';

class TaskDescription extends PLPPureComponent {
    constructor(props) {
        super(props);
        this.projectName = null;
        this.selectedContractor = null;
    }

    state = {
        selectedContractor: null,
        searchedContractor: [],
        isExistError: null,
        selectedState: undefined
    };

    isExistCall(payload) {
        isTaskExist(payload)
            .then((result) => {
                if (Array.isArray(result) && result.length > 0) {
                    this.setState({ isExistError: result }); // send comoplete task to call back
                } else {
                    this.setState({ isExistError: null });
                }
            })
            .catch(error => console.log('Task exist check failed', error))
    }

    checkIsExist() {
        const projectName = this.projectName && this.projectName.trim();
        const contractor = this.selectedContractor && this.selectedContractor.name.trim();
        if (projectName && contractor) {
            const payload = {
                "contractorName": contractor,
                "projectName": this.projectName
            };
            this.isExistCall(payload)
        }
    }

    handleProjectDescriptionChange = (e) => {
        if (e.target.name === 'projectName') {
            this.projectName = e.target.value;
            this.checkIsExist();
        }
        this.props.onChange([e.target.name], e.target.value)
    };

    handleContractorSearch = async (query) => {
        if (query) {
            const contractors = await getContractors(query);
            const searchedContractor = getContractorOptions(contractors, null);
            return { options: searchedContractor }
        }
    };

    handleContractorSelection = (selectedContractor) => {
        const { contractor } = this.props.projectDescription;
        selectedContractor = { ...contractor, ...selectedContractor };
        this.selectedContractor = selectedContractor;
        this.checkIsExist();
        this.props.onChange('contractor', selectedContractor)
    };

    handleStateSelection = (state) =>{
        this.setState({selectedState: state});
        this.props.onChange('state', state.value)
    }

    render() {
        const { error, projectDescription } = this.props;
        return (
            <TaskDescriptionForm
                newTask={this.props.newTask}
                goToTask={this.props.goToTask}
                isExistError={this.state.isExistError}
                error={error} syncIcon={false}
                onChange={this.handleProjectDescriptionChange}
                selectedContractor={this.state.selectedContractor}
                onContractorSearch={this.handleContractorSearch}
                onContractorSelection={this.handleContractorSelection}
                handleStateSelection={this.handleStateSelection}
                projectDescription={projectDescription} />
        )
    }

}

export default TaskDescription;


// const { jobNumber, projectName, city, state, additionalnotes, contractor } = this.props.projectDescription;
// const { onContractorSearch, selectedContractor, contractorOptions, onContractorSelection, error } = this.props;
