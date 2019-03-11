import React from 'react';

import find from 'lodash/find';
import cloneDeep from 'lodash/cloneDeep';
import map from 'lodash/map';
import isEqual from 'lodash/isEqual';
import ReactDOM from 'react-dom';
import {
    Button,
    Header,
    Segment,
    Table,
    Radio,
    Icon,
    Dropdown,
    Message,
    Grid,
    Menu
} from 'semantic-ui-react';
import Constant from './../helpers/Constant.js';
import ReadAccess from './../helpers/ReadAccess.js';
import WriteAccess from './../helpers/WriteAccess.js';

import PermissionStore from './../../stores/PermissionStore.js';
import RoleStore from './../../stores/RoleStore.js';
import RoleLevelStore from './../../stores/RoleLevelStore.js';

import PermissionAction from './../../actions/PermissionAction.js';
import RoleAction from './../../actions/RoleAction.js';
import RoleLevelAction from './../../actions/RoleLevelAction.js';

export default class Permission extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = this.getPropsfromStores();
        this.onChange = this.onChange.bind(this);
    }

    getPropsfromStores() {
        let state = {
            PermissionStore: PermissionStore.getState(),
            RoleStore: RoleStore.getState(),
            RoleLevelStore: RoleLevelStore.getState()
        };
        return state;
    }

    onChange(state) {
        const newState = cloneDeep(this.state);
        newState[state.displayName] = cloneDeep(state);
        this.setState(newState);
    }

    componentDidMount() {
        PermissionStore.listen(this.onChange);
        RoleStore.listen(this.onChange);
        RoleLevelStore.listen(this.onChange);
        PermissionAction.getAccessData();
        RoleAction.getRoles();
        RoleLevelAction.getLevels();
        PermissionAction.getPermissions();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
    }

    componentWillUnmount() {
        PermissionStore.unlisten(this.onChange);
        RoleStore.unlisten(this.onChange);
        RoleLevelStore.unlisten(this.onChange);
        this._closePermissionForm();
    }

    _showAddPermissionForm() {
        PermissionAction.showAddPermissionForm();
    }

    _closePermissionForm() {
        PermissionAction.closePermissionForm();
    }

    _selectRole(event, { value }) {
        PermissionAction.selectRole(value);
    }

    _selectRoleLevel(event, { value }) {
        PermissionAction.selectRoleLevel(value);
    }

    _selectPermission(permission, event, { value }) {
        let data = {
            permission: permission,
            value: value
        };
        PermissionAction.selectPermission(data);
    }

    _savePermission() {
        if (this._validateForm()) {
            PermissionAction.setLoader();
            PermissionAction.savePermission(this.state.PermissionStore.permission);
        }
    }

    _showUpdatePermissionForm(accessibility) {
        PermissionAction.showUpdatePermissionForm(accessibility);
        ReactDOM.findDOMNode(this.refs.edit_permisssion).scrollIntoView();
    }

    _updatePermission() {
        if (this._validateForm()) {
            PermissionAction.setLoader();
            PermissionAction.updatePermission(this.state.PermissionStore.permission);
        }
    }

    _validateForm() {
        let duplicatePermission = find(this.state.PermissionStore.accessData, (data) => {
            if (this.state.PermissionStore.permission.id === data.id) {
                return false;
            } else if (data.level) {
                return data.role._id === this.state.PermissionStore.permission.role && data.level._id === this.state.PermissionStore.permission.level;
            }
            return data.role._id === this.state.PermissionStore.permission.role && !this.state.PermissionStore.permission.level;
        });
        if (!this.state.PermissionStore.permission.role) {
            let error = {
                role: 'Select a role',
                permissions: ''
            };
            PermissionAction.setError(error);
            return false;
        } else if (!this.state.PermissionStore.permission.permissions.length) {
            let error = {
                role: '',
                permissions: 'Select at least a permission'
            };
            PermissionAction.setError(error);
            return false;
        } else if (duplicatePermission) {
            let error = {
                role: '',
                permissions: 'Permission already exists'
            };
            PermissionAction.setError(error);
            return false;
        }
        return true;
    }

    render() {
        let self = this;
        let roleState = self.state.RoleStore;
        let roleLevelState = self.state.RoleLevelStore;
        let permissionState = self.state.PermissionStore;
        let canWritePermission = WriteAccess.hasAccess(Constant.PERMISSIONS.MANAGE_ACCESSIBILITY.NAME);
        let canViewPermission = ReadAccess.hasAccess(Constant.PERMISSIONS.MANAGE_ACCESSIBILITY.NAME);

        let roleData = [];
        map(roleState.roles, (role) => {
            roleData.push({ text: role.name, value: role._id });
        });
        let roleLevelData = [{ text: '', value: null }];
        map(roleLevelState.levels, (level) => {
            roleLevelData.push({ text: level.name, value: level._id });
        });
        let accessData = [];
        map(permissionState.accessData, (accessibility, accessIndex) => {
            if (accessibility.permissions.length) {
                map(accessibility.permissions, (permission, permissionIndex) => {
                    if (permissionIndex === 0) {
                        accessData.push(
                            <Table.Row key={'access' + accessIndex + 'permission' + permissionIndex}>
                                <Table.Cell textAlign='center' rowSpan={accessibility.permissions.length}>{accessibility.role.name}</Table.Cell>
                                <Table.Cell textAlign='center' rowSpan={accessibility.permissions.length}>{accessibility.level
                                    ? accessibility.level.name
                                    : null}</Table.Cell>
                                <Table.Cell>{permission.permission.name}</Table.Cell>
                                <Table.Cell>{permission.permission.description}</Table.Cell>
                                {permission.read
                                    ? <Table.Cell textAlign='center'>
                                        <Icon color='green' name='checkmark' size='large' />
                                    </Table.Cell>
                                    : <Table.Cell />}
                                {permission.write
                                    ? <Table.Cell textAlign='center'>
                                        <Icon color='green' name='checkmark' size='large' />
                                    </Table.Cell>
                                    : <Table.Cell />}
                                {canWritePermission
                                    ? <Table.Cell textAlign='center' rowSpan={accessibility.permissions.length}>
                                        <Button icon onClick={self._showUpdatePermissionForm.bind(self, accessibility)}>
                                            <Icon name='edit' />
                                        </Button>
                                    </Table.Cell>
                                    : null
                                }
                            </Table.Row>
                        );
                    } else {
                        accessData.push(
                            <Table.Row key={'access' + accessIndex + 'permission' + permissionIndex}>
                                <Table.Cell>{permission.permission.name}</Table.Cell>
                                <Table.Cell>{permission.permission.description}</Table.Cell>
                                {permission.read
                                    ? <Table.Cell textAlign='center'>
                                        <Icon color='green' name='checkmark' size='large' />
                                    </Table.Cell>
                                    : <Table.Cell />}
                                {permission.write
                                    ? <Table.Cell textAlign='center'>
                                        <Icon color='green' name='checkmark' size='large' />
                                    </Table.Cell>
                                    : <Table.Cell />}
                            </Table.Row>
                        );
                    }
                });
            } else {
                accessData.push(
                    <Table.Row key={'access' + accessIndex}>
                        <Table.Cell textAlign='center'>{accessibility.role.name}</Table.Cell>
                        <Table.Cell textAlign='center'>{accessibility.level.name}</Table.Cell>
                        <Table.Cell />
                        <Table.Cell />
                        <Table.Cell />
                        <Table.Cell /> {canWritePermission
                            ? <Table.Cell textAlign='center'>
                                <Button icon onClick={self._showUpdatePermissionForm.bind(self, accessibility)}>
                                    <Icon name='edit' />
                                </Button>
                            </Table.Cell>
                            : null
                        }
                    </Table.Row>
                );
            }
        });

        let permissionData = [];
        map(permissionState.permissionsAvailable, (permission, index) => {
            let hasPermission = find(permissionState.permission.permissions, (newPermission) => {
                return newPermission.permission === permission._id;
            });

            permissionData.push(
                <Table.Row key={'permission' + index}>
                    <Table.Cell>{permission.name}</Table.Cell>
                    <Table.Cell>{permission.description}</Table.Cell>
                    <Table.Cell>
                        <Radio className='padding5' label='Read only'
                            name={'permissionGroup' + index} value='read'
                            checked={hasPermission && hasPermission.read && !hasPermission.write}
                            onChange={self._selectPermission.bind(self, permission)} />
                        <Radio className='padding5' label='Read/Write'
                            name={'permissionGroup' + index} value='write'
                            checked={hasPermission && hasPermission.read && hasPermission.write}
                            onChange={self._selectPermission.bind(self, permission)} />
                        <Radio className='padding5' label='None' name={'permissionGroup' + index} value='none' checked={!hasPermission} onChange={self._selectPermission.bind(self, permission)} />
                    </Table.Cell>
                </Table.Row>
            );
        });

        return (
            <Grid centered>
                {canViewPermission
                    ? <Grid.Column>
                        <Segment size={'large'} loading={permissionState.isLoading} disabled={permissionState.isLoading}>
                            <div ref='edit_permisssion'><Header style={{ marginBottom: '1rem' }} as='h2' content='Permissions' subheader='Manage permissions here.' /></div>
                            {permissionState.showForm
                                ? <div>
                                    <Header as='h2' content={permissionState.isAddPermission
                                        ? 'Add new permission'
                                        : 'Update permission'} />
                                    <Segment stacked secondary>
                                        <Menu fluid vertical>
                                            <Menu.Item>
                                                <Dropdown selectOnBlur={false}
                                                    placeholder='Select a role'
                                                    search selection
                                                    options={roleData}
                                                    value={permissionState.permission.role}
                                                    onChange={self._selectRole.bind(self)} />
                                                {permissionState.error.role && <Message error content={permissionState.error.role} />}
                                            </Menu.Item>
                                            <Menu.Item>
                                                <Dropdown selectOnBlur={false}
                                                    placeholder='Select a level'
                                                    search selection
                                                    options={roleLevelData}
                                                    value={permissionState.permission.level
                                                        ? permissionState.permission.level
                                                        : ''}
                                                    onChange={self._selectRoleLevel.bind(self)} />
                                            </Menu.Item>
                                            <Menu.Item>
                                                <Table celled>
                                                    <Table.Header>
                                                        <Table.Row>
                                                            <Table.HeaderCell>Name</Table.HeaderCell>
                                                            <Table.HeaderCell>Description</Table.HeaderCell>
                                                            <Table.HeaderCell>Access Level</Table.HeaderCell>
                                                        </Table.Row>
                                                    </Table.Header>
                                                    <Table.Body>
                                                        {permissionData}
                                                    </Table.Body>
                                                </Table>
                                                {permissionState.error.permissions && <Message error content={permissionState.error.permissions} />}
                                            </Menu.Item>
                                            <Menu.Item>
                                                <Button primary={true} onClick={permissionState.isAddPermission
                                                    ? self._savePermission.bind(self)
                                                    : self._updatePermission.bind(self)}>{permissionState.isAddPermission
                                                        ? 'Add'
                                                        : 'Update'}</Button>
                                                <Button secondary={true} onClick={self._closePermissionForm.bind(self)}>Cancel</Button>
                                            </Menu.Item>
                                        </Menu>
                                    </Segment>
                                </div>
                                : canWritePermission && <Button primary={true} onClick={self._showAddPermissionForm.bind(self)}>Add new permission</Button>
                            }
                            <Table celled structured>
                                <Table.Header>
                                    <Table.Row textAlign='center'>
                                        <Table.HeaderCell rowSpan='2'>Role</Table.HeaderCell>
                                        <Table.HeaderCell rowSpan='2'>Role Level</Table.HeaderCell>
                                        <Table.HeaderCell colSpan='4'>Permissions</Table.HeaderCell>
                                        {canWritePermission && <Table.HeaderCell rowSpan='2'>Edit</Table.HeaderCell>}
                                    </Table.Row>
                                    <Table.Row textAlign='center'>
                                        <Table.HeaderCell>Name</Table.HeaderCell>
                                        <Table.HeaderCell>Description</Table.HeaderCell>
                                        <Table.HeaderCell>Read</Table.HeaderCell>
                                        <Table.HeaderCell>Write</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>

                                <Table.Body>
                                    {accessData}
                                </Table.Body>
                            </Table>
                        </Segment>
                    </Grid.Column>
                    : null
                }
            </Grid>
        );
    }
}
