import React, { Component } from 'react';
import PropsTypes from 'prop-types'
import { connect } from 'react-redux';
import { Select } from 'antd';
import { UserModel } from '../../../model/UserModel';
import Constants from '../../helpers/Constant';
import { EmployeeModel } from '../../../model/AppModels/EmployeeModel';
import { PLPPureComponent } from '../../../baseComponents/importer';
import { sortEmployee } from '../../../utils/common';

/**
 * Accept Following propeties
 * list :  array of user role id tobe shown. default is all
 * handleChange: callback functions, send user _id in parent component
 */

class UserDropDownContainer extends PLPPureComponent {

    getUserOptions = () => this.props.employees.filter(user => this.props.list.includes(user.role.id)).map(user => <Select.Option value={user._id} key={user._id}>{`${user.firstName}  ${user.lastName}`}</Select.Option>);

    handleChange = (value) => {
        this.props.handleChange(value);
    };

    render = () => <Select
        showSearch
        style={{ width: 200 }}
        placeholder="Select a user"
        optionFilterProp="children"
        onChange={this.handleChange}
        defaultValue={this.props.user._id}
        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
    >
        {this.getUserOptions()}
    </Select>
}

UserDropDownContainer.PropsTypes = {
    // handleChange: PropsTypes.func,
    list: PropsTypes.array
};

UserDropDownContainer.defaultProps = {
    // handleChange: ()=>{},
    list: [Constants.ROLE_ID.MANAGER, Constants.ROLE_ID.ENGINEER, Constants.ROLE_ID.DRAFTER, Constants.ROLE_ID.ADMIN]
};

function mapStateToProps() {
    return {
        employees: sortEmployee(EmployeeModel.list().map(item => item.props)),
        user: UserModel.last().props
    };
}

export default connect(mapStateToProps)(UserDropDownContainer);
