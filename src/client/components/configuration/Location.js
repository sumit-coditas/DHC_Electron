import React from 'react';
import find from 'lodash/find';
import cloneDeep from 'lodash/cloneDeep';
import map from 'lodash/map';
import {
    Label,
    Menu,
    Table,
    Icon,
    Grid,
    Input,
    Header,
    Button,
    Segment,
    Message,
    Dropdown
} from 'semantic-ui-react';
import Constant from './../helpers/Constant.js';
import ReadAccess from './../helpers/ReadAccess.js';
import WriteAccess from './../helpers/WriteAccess.js';

import LocationStore from './../../stores/LocationStore.js';

import LocationAction from './../../actions/LocationAction.js';

export default class Location extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = this.getPropsfromStores();
        this.onChange = this.onChange.bind(this);
    }

    getPropsfromStores() {
        let state = {
            LocationStore: LocationStore.getState()
        };
        return state;
    }

    onChange(state) {
        const newState = cloneDeep(this.state);
        newState[state.displayName] = cloneDeep(state);
        this.setState(newState);
    }

    componentDidMount() {
        LocationStore.listen(this.onChange);
        LocationAction.getLocation();
    }

    componentWillUnmount() {
        LocationStore.unlisten(this.onChange);
        this._closeLocationForm();
    }

    _updateLocation(type, event) {
        if (type === 'name') {
            LocationAction.updateLocation({ value: event.target.value, type: type });
        } else {
            LocationAction.updateLocation({
                value: event.value,
                type: event.placeholder === 'Select color'
                    ? 'color'
                    : 'icon'
            });
        }
    }

    _showLocationForm() {
        LocationAction.showLocationForm();
    }

    _closeLocationForm() {
        LocationAction.closeLocationForm();
    }

    _validateForm() {
        let self = this;
        let duplicateName = find(self.state.LocationStore.locations, (location) => {
            if (location.id === self.state.LocationStore.newLocation.id) {
                return false;
            }
            return location.name.trim().toLowerCase().replace(/\s+/g, '') === self.state.LocationStore.newLocation.name.trim().toLowerCase().replace(/\s+/g, '');
        });
        if (!self.state.LocationStore.newLocation.name.replace(/\s+/g, '')) {
            LocationAction.setError({ name: 'Please enter location status' });
            return false;
        } else if (duplicateName) {
            LocationAction.setError({ name: 'Name already exists' });
            return false;
        } else if (!self.state.LocationStore.newLocation.icon) {
            LocationAction.setError({ icon: 'Please select icon' });
            return false;
        } else if (!self.state.LocationStore.newLocation.iconColor) {
            LocationAction.setError({ color: 'Please select color' });
            return false;
        } else if (self.state.LocationStore.newLocation.name.length > 50) {
            LocationAction.setError({ color: 'Name should be less than 50 characters' });
            return false;
        }
        return true;
    }

    _addAndUpdateLocation() {
        LocationAction.setLoader();
        if (this._validateForm()) {
            if (this.state.LocationStore.isEditLocation) {
                LocationAction.saveEditedLocation(this.state.LocationStore.newLocation);
            } else {
                LocationAction.addNewLocation(this.state.LocationStore.newLocation);
            }
        }
    }

    _editLocation(location) {
        LocationAction.editLocation(location);
    }

    render() {
        let self = this;
        let colorOptions = [
            {
                text: 'Green',
                value: 'green',
                label: {
                    color: 'green',
                    empty: true,
                    circular: true
                }
            }, {
                text: 'Orange',
                value: 'orange',
                label: {
                    color: 'orange',
                    empty: true,
                    circular: true
                }
            }, {
                text: 'Red',
                value: 'red',
                label: {
                    color: 'red',
                    empty: true,
                    circular: true
                }
            }, {
                text: 'Yellow',
                value: 'yellow',
                label: {
                    color: 'yellow',
                    empty: true,
                    circular: true
                }
            }, {
                text: 'Olive',
                value: 'olive',
                label: {
                    color: 'olive',
                    empty: true,
                    circular: true
                }
            }, {
                text: 'Blue',
                value: 'blue',
                label: {
                    color: 'blue',
                    empty: true,
                    circular: true
                }
            }, {
                text: 'Violet',
                value: 'violet',
                label: {
                    color: 'violet',
                    empty: true,
                    circular: true
                }
            }
        ];
        let iconOptions = [
            {
                text: 'Mobile',
                value: 'mobile',
                icon: <Icon name='mobile' />
            }, {
                text: 'Flight',
                value: 'plane',
                icon: <Icon name='plane' />
            }, {
                text: 'Meeting',
                value: 'group',
                icon: <Icon name='group' />
            }, {
                text: 'Lunch',
                value: 'food',
                icon: <Icon name='food' />
            }, {
                text: 'Off',
                value: 'hotel',
                icon: <Icon name='hotel' />
            }, {
                text: 'Desk',
                value: 'building',
                icon: <Icon name = 'building' />
            }
        ];
        let locationData = [];

        let canViewLocation = ReadAccess.hasAccess(Constant.PERMISSIONS.MANAGE_PERSONAL_UPDATE.NAME);
        let canWriteLocation = WriteAccess.hasAccess(Constant.PERMISSIONS.MANAGE_PERSONAL_UPDATE.NAME);

        map(self.state.LocationStore.locations, function (location, index) {
            locationData.push(
                <Table.Row key={'location' + index}>
                    <Table.Cell>{location.name}</Table.Cell>
                    <Table.Cell textAlign='center'>
                        <Icon size='large' name={location.icon} />
                    </Table.Cell>
                    <Table.Cell textAlign='center'>
                        <Label color={location.iconColor} empty circular={true} />
                    </Table.Cell>
                    {canWriteLocation ?
                        <Table.Cell textAlign='center'>
                            <Button icon onClick={self._editLocation.bind(self, location)}>
                                <Icon name='edit' />
                            </Button>
                        </Table.Cell> :
                        null
                    }
                </Table.Row>
            );
        });

        return (
            <Grid centered>
                {canViewLocation ?
                    <Grid.Column width={16}>
                        <Segment size='large' disabled={self.state.LocationStore.isAddLoader} loading={self.state.LocationStore.isAddLoader}>
                            <Header as='h2' content='Locations' subheader='Manage locations here.' /> {self.state.LocationStore.addLocation
                                ? <Segment stacked secondary>
                                    <Menu fluid vertical>
                                        <Menu.Item>
                                            <Input name='status' value={this.state.LocationStore.newLocation.name}
                                                label='Location Status' placeholder='Define the location status'
                                                onChange={self._updateLocation.bind(self, 'name')} />
                                            <Message hidden={this.state.LocationStore.error.name
                                                ? false
                                                : true} error header={this.state.LocationStore.error.name} />
                                        </Menu.Item>
                                        <Menu.Item>
                                            <Dropdown value={this.state.LocationStore.newLocation.icon}
                                                selectOnBlur={false} placeholder='Select icon'
                                                onChange={self._updateLocation.bind(self)}
                                                options={iconOptions} inline />
                                            <Message hidden={this.state.LocationStore.error.icon
                                                ? false
                                                : true} error header={this.state.LocationStore.error.icon} />
                                        </Menu.Item>
                                        <Menu.Item>
                                            <Dropdown value={this.state.LocationStore.newLocation.iconColor}
                                                selectOnBlur={false} placeholder='Select color'
                                                onChange={self._updateLocation.bind(self)}
                                                options={colorOptions} inline />
                                            <Message hidden={this.state.LocationStore.error.color
                                                ? false
                                                : true} error header={this.state.LocationStore.error.color} />
                                        </Menu.Item>
                                        <Menu.Item>
                                            <Button primary={true} onClick={self._addAndUpdateLocation.bind(self)}>{this.state.LocationStore.isEditLocation
                                                ? 'Save'
                                                : 'Add'}</Button>
                                            <Button secondary={true} onClick={self._closeLocationForm.bind(self)}>Cancel</Button>
                                        </Menu.Item>
                                    </Menu>
                                </Segment>
                                :
                                canWriteLocation ?
                                    <Button primary={true} onClick={self._showLocationForm.bind(self)}>Add new Location</Button> :
                                    null
                            }
                            <Table celled structured>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>Name</Table.HeaderCell>
                                        <Table.HeaderCell textAlign='center'>Icon</Table.HeaderCell>
                                        <Table.HeaderCell textAlign='center'>Icon Color</Table.HeaderCell>
                                        {canWriteLocation ?
                                            <Table.HeaderCell textAlign='center'>Edit</Table.HeaderCell> :
                                            null
                                        }
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {locationData}
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
