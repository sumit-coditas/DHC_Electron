import React from 'react';
import { connect } from 'react-redux';

import PLPPureComponent from '../../../../baseComponents/PLPPureComponent';
import { EmployeeModel } from '../../../../model/AppModels/EmployeeModel';
import { ItemTypeModel } from '../../../../model/AppModels/ItemTypeModel';
import Constants from '../../../helpers/Constant';
import {
    getDrafters,
    getManagersAndEngineers,
    getOtherEmployees
} from '../../../reusableComponents/scopeTableNew/ScopeTableUtils';
import ScopeForm from '../../projectDetailNew/scopesWrapper/scopeForm';
import { getContactOptions, getOptions } from '../../projectDetailNew/util';

class Scopes extends PLPPureComponent {
    render() {
        const { scopes, errors, onAddNewScope, onRemoveScope, customerContactsList, 
            handleScopeChange, maxScopeError, isTask } = this.props;
        return (
            <div>
                {
                    scopes.map((scope, index) => (<ScopeForm
                        onAddNewScope={onAddNewScope}
                        maxScopeError={maxScopeError}
                        onRemoveScope={onRemoveScope}
                        handleScopeChange={handleScopeChange}
                        isLastScope={scopes.length === index + 1}
                        error={errors.find(scopeError => scopeError.id === scope.id)}
                        key={scope.id}
                        customerContactOptions={getContactOptions(customerContactsList, scope)}
                        optionList={this.props}
                        scope={scope}
                        isTask={isTask}
                    />))
                }
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    const isTask = ownProps.taskGroup.id === Constants.TASK_GROUP__ID.TASKS;
    const employees = EmployeeModel.list().map(({ props }) => props);
    let drafterList = getOptions(isTask ? getOtherEmployees(employees) : getDrafters(employees), 'id', 'name');
    drafterList = [{ value: null, text: '-', label: '-' }, ...drafterList];
    const engineerList = getOptions(isTask ? getOtherEmployees(employees) : getManagersAndEngineers(employees), 'id', 'name');
    const itemTypesOptions = getOptions(ItemTypeModel.list().map(({ props }) => props), '_id', 'name');

    return {
        itemTypesOptions,
        drafterList,
        engineerList,
        isTask
    };
}

export default connect(mapStateToProps)(Scopes);
