import React from 'react';
import find from 'lodash/find';
import cloneDeep from 'lodash/cloneDeep';
import map from 'lodash/map';

import {
    Button,
    Grid,
    Input,
    Header,
    Segment,
    Table,
    Radio,
    Icon,
    Message,
    Menu
} from 'semantic-ui-react';

import Constant from './../helpers/Constant.js';
import ReadAccess from './../helpers/ReadAccess.js';
import WriteAccess from './../helpers/WriteAccess.js';

import RoleStore from './../../stores/RoleStore.js';

import RoleAction from './../../actions/RoleAction.js';

export default class Roles extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = this.getPropsfromStores();
        this.onChange = this.onChange.bind(this);
    }

    getPropsfromStores() {
        return {
            ...RoleStore.getState()
        }
    }

    onChange(state) {
        this.setState(cloneDeep(state));
    }

    componentDidMount() {
        RoleStore.listen(this.onChange);
        RoleAction.getRoles();
    }

    componentWillUnmount() {
        RoleStore.unlisten(this.onChange);
        this._closeRoleForm();
    }

    _addNewRole() {
        RoleAction.setLoader();
        if (this._validateForm()) {
            RoleAction.addNewRole(this.state.role);
        }
    }

    _updateRoleName(event) {
        RoleAction.updateRoleName(event.target.value);
    }

    _showAddRoleForm() {
        RoleAction.showAddRoleForm();
    }

    _showUpdateRoleForm(role) {
        RoleAction.showUpdateRoleForm(role);
    }

    _closeRoleForm() {
        RoleAction.closeRoleForm();
    }

    _updateRole() {
        RoleAction.setLoader();
        if (this._validateForm()) {
            RoleAction.updateRole(this.state.role);
        }
    }

    _validateForm() {
        let self = this;
        let duplicateName = find(self.state.roles, (role) => {
            if (role.id === self.state.role.id) {
                return false;
            }
            return role.name.trim().toLowerCase().replace(/\s+/g, '') === self.state.role.name.trim().toLowerCase().replace(/\s+/g, '');
        });
        if (!self.state.role.name.replace(/\s+/g, '')) {
            let error = {
                name: 'Role name cannot be empty'
            };
            RoleAction.setError(error);
            return false;
        } else if (duplicateName) {
            let error = {
                name: 'Name already exists'
            };
            RoleAction.setError(error);
            return false;
        } else if (self.state.role.name.length > 30) {
            let error = {
                name: 'Name should be less than 30 characters'
            };
            RoleAction.setError(error);
            return false;
        }
        return true;
    }

    render() {
        let self = this;
        let canViewRole = ReadAccess.hasAccess(Constant.PERMISSIONS.MANAGE_ACCESSIBILITY.NAME);
        let canWriteRole = WriteAccess.hasAccess(Constant.PERMISSIONS.MANAGE_ACCESSIBILITY.NAME);

        let roleData = [];
        map(self.state.roles, (role, index) => {
            roleData.push(
                <Table.Row key={'role' + index}>
                    <Table.Cell>{role.name}</Table.Cell>
                    {canWriteRole &&
                        <Table.Cell textAlign='center'>
                            <Button icon onClick={self._showUpdateRoleForm.bind(self, role)}>
                                <Icon name='edit' />
                            </Button>
                        </Table.Cell>
                    }
                </Table.Row>
            )
        });
        return (
            <Grid centered>
                {canViewRole ?
                    <Grid.Column width={16}>
                        <Segment size='large' loading={self.state.isLoaderActive} disabled={self.state.isLoaderActive}>
                            <Header as='h2' content='Roles' subheader='Manage roles here.' /> {self.state.showForm
                                ? <div>
                                    <Header as='h2' content={self.state.isAddRole
                                        ? 'Add new role'
                                        : 'Update role'} />
                                    <Segment stacked secondary>
                                        <Menu fluid vertical>
                                            <Menu.Item>
                                                <Input name='role' label='Role name' placeholder='Enter name of the role' value={self.state.role.name} onChange={self._updateRoleName.bind(self)}></Input>
                                                {self.state.error.name && <Message error content={self.state.error.name} />}
                                            </Menu.Item>
                                            <Menu.Item>
                                                <Button primary={true} onClick={self.state.isAddRole
                                                    ? self._addNewRole.bind(self)
                                                    : self._updateRole.bind(self)}>{self.state.isAddRole
                                                        ? 'Add'
                                                        : 'Update'}</Button>
                                                <Button secondary={true} onClick={self._closeRoleForm.bind(self)}>Cancel</Button>
                                            </Menu.Item>
                                        </Menu>
                                    </Segment>
                                </div>
                                :
                                canWriteRole && <Button primary={true} onClick={self._showAddRoleForm.bind(self)}>Add new role</Button>
                            }
                            <Table celled structured>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>Name</Table.HeaderCell>
                                        {canWriteRole && <Table.HeaderCell textAlign='center'>Edit</Table.HeaderCell>}
                                    </Table.Row>
                                </Table.Header>

                                <Table.Body>
                                    {roleData}
                                </Table.Body>
                            </Table>
                        </Segment>
                    </Grid.Column> :
                    null
                }
            </Grid>
        );
    }
}
