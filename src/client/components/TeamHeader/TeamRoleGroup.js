import React from 'react';
import { connect } from 'react-redux';

import PLPPureComponent from '../../baseComponents/PLPPureComponent';
import { Select } from '../../baseComponents/Select';
import { EmployeeModel } from '../../model/AppModels/EmployeeModel';
import { updateGroupStatus } from '../../service/AppService';
import { sortEmployee } from '../../utils/common';
import { TeamAvatar } from './TeamAvatar';

class TeamRoleGroupImpl extends PLPPureComponent {

    updateWorkload = (workload) => {
        const payload = {
            id: this.props.role.id,
            workload
        };
        updateGroupStatus(payload);
    }

    getWorkLoadOptions = ({ workload }, workLoads) => workLoads.filter(item => item._id !== (workload && workload._id || null))
        .map(WorkLoad => ({
            text: WorkLoad.name,
            value: WorkLoad._id
        }));

    renderHeader = () => {
        const { role, workLoads } = this.props;
        return <div className='group-header' style={{ background: role.workload && role.workload.color || '#333' }}>
            <div className='title'>
                {role.name}
            </div>
            <Select
                options={this.getWorkLoadOptions(role, workLoads)}
                handleChange={this.updateWorkload}
                className='workload-dropdown'
            />
        </div >
    }


    renderEmployees = () => <div className='employee-avatar-container'>
        {this.props.employees.map(employee => <TeamAvatar
            key={employee.id}
            clickable={this.props.clickable}
            employee={employee}
            filters={this.props.filters} />
        )}
    </div>;

    render = () => {
        const { employees } = this.props;
        let width = `${Math.ceil(employees.length / 2) * 103}px`;
        return <div className='team-group' style={{ width }}>
            {this.renderHeader()}
            {this.renderEmployees()}
        </div>
    }
}

function mapStateToProps(state, ownProps) {
    const employees = sortEmployee(
        EmployeeModel
            .list()
            .map(item => item.props)
            .filter(employee => employee.role._id === ownProps.role._id && employee._id !== ownProps.loggedInUserId)
    );
    return {
        employees,
    }
}

export const TeamRoleGroup = connect(mapStateToProps)(TeamRoleGroupImpl);
