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
    Icon,
    Message,
    Menu
} from 'semantic-ui-react';
import Constant from './../helpers/Constant.js';
import ReadAccess from './../helpers/ReadAccess.js';
import WriteAccess from './../helpers/WriteAccess.js';

import RoleLevelStore from './../../stores/RoleLevelStore.js';

import RoleLevelAction from './../../actions/RoleLevelAction.js';

export default class RoleLevel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = this.getPropsfromStores();
        this.onChange = this.onChange.bind(this);
    }

    getPropsfromStores() {
        return {
            ...RoleLevelStore.getState()
        }
    }

    onChange(state) {
        this.setState(cloneDeep(state));
    }

    componentDidMount() {
        RoleLevelStore.listen(this.onChange);
        RoleLevelAction.getLevels();
    }

    componentWillUnmount() {
        RoleLevelStore.unlisten(this.onChange);
        this._closeLevelForm();
    }

    _showAddLevelForm() {
        RoleLevelAction.showAddLevelForm();
    }

    _closeLevelForm() {
        RoleLevelAction.closeLevelForm();
    }

    _updateLevelName(event) {
        RoleLevelAction.updateLevelName(event.target.value);
    }

    _addLevel() {
        RoleLevelAction.setLoader();
        if (this._validateForm()) {
            RoleLevelAction.addLevel(this.state.roleLevel);
        }
    }

    _showUpdateLevelForm(level) {
        RoleLevelAction.showUpdateLevelForm(level);
    }

    _updateLevel() {
        RoleLevelAction.setLoader();
        if (this._validateForm()) {
            RoleLevelAction.updateLevel(this.state.roleLevel);
        }
    }

    _validateForm() {
        let self = this;
        let duplicateName = find(self.state.levels, (roleLevel) => {
            if (roleLevel.id === self.state.roleLevel.id) {
                return false;
            }
            return roleLevel.name.trim().toLowerCase().replace(/\s+/g, '') === self.state.roleLevel.name.trim().toLowerCase().replace(/\s+/g, '');
        });
        if (!self.state.roleLevel.name.replace(/\s+/g, '')) {
            let error = {
                name: 'Role level name cannot be empty'
            };
            RoleLevelAction.setError(error);
            return false;
        } else if (duplicateName) {
            let error = {
                name: 'Name already exists'
            };
            RoleLevelAction.setError(error);
            return false;
        } else if (self.state.roleLevel.name.length > 50) {
            let error = {
                name: 'Name should be less than 50 characters'
            };
            RoleLevelAction.setError(error);
            return false;
        }
        return true;
    }

    render() {
        let self = this;
        let canViewRoleLevel = ReadAccess.hasAccess(Constant.PERMISSIONS.MANAGE_ACCESSIBILITY.NAME);
        let canWriteRoleLevel = WriteAccess.hasAccess(Constant.PERMISSIONS.MANAGE_ACCESSIBILITY.NAME);

        let levelData = [];
        map(self.state.levels, (level, index) => {
            levelData.push(
                <Table.Row key={'roleLevel' + index}>
                    <Table.Cell >{level.name}</Table.Cell>
                    {canWriteRoleLevel &&
                        <Table.Cell textAlign='center'>
                            <Button icon onClick={self._showUpdateLevelForm.bind(self, level)}>
                                <Icon name='edit' />
                            </Button>
                        </Table.Cell>
                    }
                </Table.Row>
            );
        });
        return (
            <Grid centered>
                {canViewRoleLevel ?
                    <Grid.Column width={16}>
                        <Segment size={'large'} loading={self.state.isFormLoading} disabled={self.state.isFormLoading}>
                            <Header as='h2' content='Role Levels' subheader='Manage role levels here.' /> {self.state.showForm
                                ? <div>
                                    <Header as='h2' content={self.state.isAddLevel
                                        ? 'Add new role level'
                                        : 'Update role level'} />
                                    <Segment stacked secondary>
                                        <Menu fluid vertical>
                                            <Menu.Item>
                                                <Input name='level' label='Role level name' placeholder='Enter name of the role level' value={self.state.roleLevel.name} onChange={self._updateLevelName} /> {self.state.error.name && <Message error content={self.state.error.name} />}
                                            </Menu.Item>
                                            <Menu.Item>
                                                <Button primary={true} onClick={self.state.isAddLevel
                                                    ? self._addLevel.bind(self)
                                                    : self._updateLevel.bind(self)}>{self.state.isAddLevel
                                                        ? 'Add'
                                                        : 'Update'}</Button>
                                                <Button secondary={true} onClick={self._closeLevelForm.bind(self)}>Cancel</Button>
                                            </Menu.Item>
                                        </Menu>
                                    </Segment>
                                </div>
                                :
                                canWriteRoleLevel && <Button primary={true} onClick={self._showAddLevelForm.bind(self)}>Add new role level</Button>
                            }
                            <Table celled structured>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>Name</Table.HeaderCell>
                                        {canWriteRoleLevel && <Table.HeaderCell textAlign='center'>Edit</Table.HeaderCell>}
                                    </Table.Row>
                                </Table.Header>

                                <Table.Body>
                                    {levelData}
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
