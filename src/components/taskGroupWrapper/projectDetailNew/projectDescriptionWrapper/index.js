import React, { Component } from 'react';
import { connect } from 'react-redux';
import debounce from 'lodash/debounce';
import ProjectDescriptionForm from './form';
import { getContractors, getContractorContacts } from '../../../../utils/promises/TaskPromises';
import { getContractorOptions, getProjectDetailData, } from '../util';
import { SelectedTaskDetailModel } from '../../../../model/TaskModels/SelectedTaskDetailModel';
import LoginStore from '../../../../stores/LoginStore';
import { handleSyncContractor } from '../eventHandler/scopeEvent';

class ProjectDescription extends Component {
    state = {
        projectDescription: {},
        searchedContractor: [],
        selectedContractor: undefined,
        selectedState: undefined
    };

    componentDidMount() {
        this.getCustomerContacts()
    }

    handleStateSelection = (state) =>{
        this.setState({selectedState: state});
        this.props.onChange('state', state.value)
    }

    handleContractorSelection = (selectedContractor) => {
        this.setState({ selectedContractor }, () => this.getCustomerContacts());
        const { contractor } = this.props.projectDetails.projectDescription;
        // selectedContractor = { ...contractor, ...selectedContractor, };
        this.props.onChange('contractor', selectedContractor)
    };

    handleProjectDescriptionChange = (e) => {
        this.props.onChange(e.target.name, e.target.value)
    };

    handleContractorSearch = debounce(async (query) => {
        if (query) {
            try {
                const contractors = await getContractors(query);
                const searchedContractor = getContractorOptions(contractors, null);
                this.setState({ searchedContractor: contractors });
                return { options: searchedContractor }
            } catch (error) {

            }
        }
    }, 500);

    handleSyncPress = (e) => {
        e.preventDefault();
        const { taskID, userID } = this.props;
        const { projectDescription } = this.props.projectDetails;
        const payload = {
            taskID: taskID,
            userID: userID,
            contactID: projectDescription.contractor.value
        };
        handleSyncContractor(payload)
    };

    getCustomerContacts = async () => {
        const { id } = this.props.projectDetails;
        const { contractor } = this.props.projectDetails.projectDescription;
        const { selectedContractor } = this.state;
        const selectedContractorName = selectedContractor && selectedContractor.label || contractor.label;
        try {
            const updateCustomerContactsList = await getContractorContacts(selectedContractorName);
            SelectedTaskDetailModel.updateCustomerContactsList(updateCustomerContactsList, id)
        } catch (error) {
            console.log("customer fetch failed", error)
        }
    };

    render() {
        const { projectDescription } = this.props.projectDetails;
        return (
            <ProjectDescriptionForm
                syncIcon={true}
                error={this.props.error}
                onSync={this.handleSyncPress}
                onChange={this.handleProjectDescriptionChange}
                handleStateSelection={this.handleStateSelection}
                selectedState={this.state.selectedState}
                selectedContractor={this.state.selectedContractor}
                onContractorSearch={this.handleContractorSearch}
                contractorOptions={getContractorOptions(this.state.searchedContractor, projectDescription)}
                onContractorSelection={this.handleContractorSelection}
                projectDescription={projectDescription}/>
        );
    }
}

function mapStateToProps() {
    const task = SelectedTaskDetailModel.last().props;
    return {
        taskID: task.id,
        userID: LoginStore.getState().user._id,
        projectDetails: getProjectDetailData(task)    
    };
}

export default connect(mapStateToProps)(ProjectDescription);
