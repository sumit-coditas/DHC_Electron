import React from 'react';
import { connect } from 'react-redux';

import PLPPureComponent from '../../../../baseComponents/PLPPureComponent';
import { SelectedTaskDetailModel } from '../../../../model/TaskModels/SelectedTaskDetailModel';
import AppStore from '../../../../stores/AppStore';
import { getDrafters, getManagersAndEngineers, getOtherEmployees } from '../../../reusableComponents/scopeTableNew/ScopeTableUtils';
import { getContactOptions, getOptions } from '../util';
import ScopeForm from './scopeForm';
import { ItemTypeModel } from '../../../../model/AppModels/ItemTypeModel';
import { EmployeeModel } from '../../../../model/AppModels/EmployeeModel';

class ScopeForms extends PLPPureComponent {
    state = { engineer: null, drafter: null, drafterStatus: null, engineerStatus: null }

    handleRoleChange = (value, field) => {
        this.setState({ [field]: value });
    }

    renderScopeForm = () => {
        const { scopes, errors, onAddNewScope, onRemoveScope, updatedScope, customerContactsList,
             maxScopeError, isTask } = this.props;
        return scopes.map((scope, index) => <ScopeForm
            maxScopeError={maxScopeError}
            selectedDrafter={this.state.drafter}
            selectedEngineer={this.state.engineer}
            drafterStatus={this.state.drafterStatus}
            engineerStatus={this.state.engineerStatus}
            onRoleChange={this.handleRoleChange}
            onAddNewScope={onAddNewScope}
            onRemoveScope={onRemoveScope}
            handleScopeChange={this.props.handleScopeChange}
            isLastScope={scopes.length === index + 1}
            error={errors.find(scopeError => scopeError.id === scope.id)}
            key={scope.id} updatedScope={updatedScope}
            customerContactOptions={getContactOptions(customerContactsList, scope)}
            optionList={this.props}
            scope={scope}
            isTask={isTask}
        />);
    };

    render = () => <div> {this.renderScopeForm()}</div>
}

function mapStateToProps(models, ownProps) {
    const task = SelectedTaskDetailModel.list().map(item => item.props)[0];
    const isTask = task.isFromTaskGroup;
    const employees = EmployeeModel.list().map(({ props }) => props);
    let drafterList = getOptions(isTask ? getOtherEmployees(employees) : getDrafters(employees), 'id', 'name');
    drafterList = [{ value: null, text: '-', label: '-' }, ...drafterList]
    const engineerList = getOptions(isTask ? getOtherEmployees(employees) : getManagersAndEngineers(employees), 'id', 'name');
    const scopes = ownProps.scopes
    .sort((firstScope, secondScope) => firstScope.number > secondScope.number ? 1 : firstScope.number < secondScope.number ? -1 : 0)
    .map(scope => {
        const childScopes = task.scopes.filter(child => child.parent === scope._id).map(child => child.id);
        return {
            ...scope,
            childScopes
        };
    });

    return {
        customerContactsList: task.customerContactsList,
        itemTypesOptions: getOptions(ItemTypeModel.list().map(({ props }) => props), '_id', 'name'),
        drafterList,
        engineerList,
        scopes,
        isTask
    };
}

export default connect(mapStateToProps)(ScopeForms);
