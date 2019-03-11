import React, { Component } from 'react';
import UserDropDownContainer from './UserDropDownContainer/UserDropDownContainer';

export default class UserDropDown extends Component{
    render = () => <UserDropDownContainer {...this.props}/>
}