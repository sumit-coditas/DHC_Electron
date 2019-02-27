import React from 'react';
import {
    Label,
    Menu,
    Table,
    Icon,
    Grid,
    Input,
    Header,
    Button,
    Form,
    Segment,
    Message,
    Dropdown
} from 'semantic-ui-react'

import find from 'lodash/find';
import cloneDeep from 'lodash/cloneDeep';
import map from 'lodash/map';


import Constant from './../helpers/Constant.js';
import ReadAccess from './../helpers/ReadAccess.js';
import WriteAccess from './../helpers/WriteAccess.js';

import WorkloadAction from './../../actions/WorkloadAction.js';

import WorkloadStore from './../../stores/WorkloadStore.js';

export default class Workload extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = this.getPropsfromStores();
        this.onChange = this.onChange.bind(this);
    }

    getPropsfromStores() {
        return {
            ...WorkloadStore.getState()
        }
    }

    onChange(state) {
        this.setState(cloneDeep(state));
    }

    componentDidMount() {
        WorkloadStore.listen(this.onChange);
        WorkloadAction.getWorkloads();
    }

    componentWillUnmount() {
        WorkloadStore.unlisten(this.onChange);
        this._closeWorkloadForm();
    }

    _updateWorkload(type, event) {
        if (type == 'name') {
            WorkloadAction.updateWorkload({ value: event.target.value, type: type });
        } else {
            WorkloadAction.updateWorkload({ value: event.value });
        }
    }

    _showWorkloadForm() {
        WorkloadAction.showWorkloadForm();
    }

    _closeWorkloadForm() {
        WorkloadAction.closeWorkloadForm();
    }

    _validateForm() {
        let self = this;
        let duplicateName = find(self.state.workloads, (workload) => {
            if (workload.id === self.state.newWorkload.id) {
                return false;
            }
            return workload.name.trim().toLowerCase().replace(/\s+/g, '') === self.state.newWorkload.name.trim().toLowerCase().replace(/\s+/g, '');
        });
        if (!self.state.newWorkload.name.replace(/\s+/g, '')) {
            WorkloadAction.setError({ name: 'Please enter workload status' });
            return false;
        } else if (duplicateName) {
            WorkloadAction.setError({ name: 'Name already exists' });
            return false;
        } else if (!self.state.newWorkload.color) {
            WorkloadAction.setError({ color: 'Please select color' });
            return false;
        } else if (self.state.newWorkload.name.length > 50) {
            WorkloadAction.setError({ color: 'Name should be less than 50 characters' });
            return false;
        }
        return true;
    }

    _addNewWorkload() {
        WorkloadAction.setLoader();
        if (this._validateForm()) {
            if (this.state.isEditWorkload) {
                WorkloadAction.saveEditedWorkload(this.state.newWorkload)
            } else {
                WorkloadAction.addNewWorkload(this.state.newWorkload)
            }
        }
    }

    _editWorkload(workload) {
        WorkloadAction.editWorkload(workload)
    }

    render() {
        let self = this;
        let canViewWorkload = ReadAccess.hasAccess(Constant.PERMISSIONS.MANAGE_PERSONAL_UPDATE.NAME);
        let canWriteWorkload = WriteAccess.hasAccess(Constant.PERMISSIONS.MANAGE_PERSONAL_UPDATE.NAME);
        let colorOptions = [
            {
                text: 'Light grey',
                value: '#E8E8E8'
            }, {
                text: 'Grey',
                value: '#585858'
            }, {
                text: 'Bright blue',
                value: '#0099c2'
            }, {
                text: 'Bright orange',
                value: '#ff6600'
            }, {
                text: 'Red',
                value: '#ff0000'
            }, {
                text: 'Green',
                value: '#8cc341'
            }
        ];
        let WorkloadData = [];

        map(self.state.workloads, function (workload, index) {
            WorkloadData.push(
                <Table.Row key={'workload' + index}>
                    <Table.Cell>{workload.name}</Table.Cell>
                    <Table.Cell textAlign='center'>
                        <div style={{
                            backgroundColor: workload.color
                        }} className='workload-color-circle'></div>
                    </Table.Cell>
                    {canWriteWorkload &&
                        <Table.Cell textAlign='center'>
                            <Button icon onClick={self._editWorkload.bind(self, workload)}>
                                <Icon name='edit' />
                            </Button>
                        </Table.Cell>
                    }
                </Table.Row>
            )
        });
        return (
            <Grid centered>
                {canViewWorkload ?
                    <Grid.Column width={16}>
                        <Segment size={'large'} disabled={self.state.isAddLoader} loading={self.state.isAddLoader}>
                            <Header as='h2' content='Workload' subheader='Manage workloads here.' /> {self.state.addWorkload
                                ? <Segment stacked secondary>
                                    <Menu fluid vertical>
                                        <Menu.Item>
                                            <Input error={self.state.nameError} value={this.state.newWorkload.name} name='status' label='Workload Status' placeholder='Define the Workload status' onChange={self._updateWorkload.bind(self, 'name')} />
                                            <Message hidden={this.state.error.name
                                                ? false
                                                : true} error header={this.state.error.name} />
                                        </Menu.Item>
                                        <Menu.Item>
                                            <Dropdown error={self.state.colorError} selectOnBlur={false} value={this.state.newWorkload.color} placeholder="Select color" onChange={self._updateWorkload.bind(self)} options={colorOptions} inline />
                                            <Message hidden={this.state.error.color
                                                ? false
                                                : true} error header={this.state.error.color} />
                                        </Menu.Item>
                                        <Menu.Item>
                                            <Button primary={true} onClick={self._addNewWorkload.bind(self)}>{this.state.isEditWorkload
                                                ? 'Save'
                                                : 'Add'}</Button>
                                            <Button secondary={true} onClick={self._closeWorkloadForm.bind(self)}>Cancel</Button>
                                        </Menu.Item>
                                    </Menu>
                                </Segment>
                                :
                                canWriteWorkload && <Button primary={true} onClick={self._showWorkloadForm.bind(self)}>Add new Workload</Button>
                            }
                            <Table celled structured>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>Name</Table.HeaderCell>
                                        <Table.HeaderCell textAlign='center'>Color</Table.HeaderCell>
                                        {canWriteWorkload && <Table.HeaderCell textAlign='center'>Edit</Table.HeaderCell>}
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {WorkloadData}
                                </Table.Body>
                            </Table>
                        </Segment>
                    </Grid.Column> :
                    null
                }
            </Grid>
        )
    }
}
