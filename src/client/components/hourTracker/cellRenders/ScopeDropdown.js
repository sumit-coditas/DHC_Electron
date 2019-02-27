import React from 'react';
import { PLPPureComponent, PLPSelect } from '../../../baseComponents/importer';
import { SelectedTaskDetailModel } from '../../../model/TaskModels/SelectedTaskDetailModel';
import { connect } from 'react-redux';
import { updateHourTrackerScope } from '../service';
import { getScopeList } from '../util';

class ScopeDropdown extends PLPPureComponent {
    handleDropdownChange = (value, data) => {
        const payload = {
            id: data.hourId,
            taskId: this.props.taskId,
            newScopeId: value,
            employee: data.user,
            ...data,
        }
        if( value === data.scopeId ) return
        updateHourTrackerScope( payload);
    }

    render = () => <PLPSelect 
        data={this.props.data}
        handleChange={this.handleDropdownChange}
        defaultValue={this.props.value}
        options={this.props.scopeList} 
    />

}

function mapStateToProps() {
    const task = SelectedTaskDetailModel.list().map(item => item.props)[0];
    return {
        taskId: task.id,
        scopeList: getScopeList(task.scopes),
    }
}

export default connect(mapStateToProps)(ScopeDropdown);