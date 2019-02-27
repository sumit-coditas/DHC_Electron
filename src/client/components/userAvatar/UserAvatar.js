import React from 'react';
import cloneDeep from 'lodash/cloneDeep';
import map from 'lodash/map';
import { Dropdown } from 'semantic-ui-react';
import { TextField } from 'material-ui';
import { hashHistory } from 'react-router';

import Picture from './../widgets/Picture.js';
import Constant from './../helpers/Constant.js';

import AppStore from './../../stores/AppStore.js';
import LoginStore from './../../stores/LoginStore.js';

import LoginAction from './../../actions/LoginAction.js';
import AppAction from './../../actions/AppAction.js';

export default class UserAvatar extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = this.getPropsfromStores();
        this.onChange = this.onChange.bind(this);
    }

    getPropsfromStores() {
        let state = {
            AppStore: AppStore.getState(),
            LoginStore: LoginStore.getState()
        };
        return state;
    }

    onChange(state) {
        const newState = cloneDeep(this.state);
        newState[state.displayName] = cloneDeep(state);
        this.setState(newState);
    }

    componentDidMount() {
        AppStore.listen(this.onChange);
        LoginStore.listen(this.onChange);
    }

    componentWillUnmount() {
        AppStore.unlisten(this.onChange);
        LoginStore.unlisten(this.onChange);
    }

    _changeLocation(event, location) {
        let loggedInUser = this.state.LoginStore.user;
        let locationInfoObj = loggedInUser.locationInfo;
        if (!locationInfoObj) {
            locationInfoObj = {
                extension: '',
                location: null
            };
        }
        let userLocationInfo = {
            locationInfo: {
                location: location.value,
                extension: locationInfoObj.extension
            }
        };
        LoginAction.updateLoggedInUser(userLocationInfo, loggedInUser.id, Constant.NOTIFICATION_MESSAGES.USER_LOCATION.LOCATION.UPDATE_SUCCESS);
    }

    _setLocationExtension = (event) => {
        let loggedInUser = this.state.LoginStore.user;
        let locationInfoObj = this.state.LoginStore.user.locationInfo;
        let clonedEvent = cloneDeep(event);
        if (!locationInfoObj) {
            locationInfoObj = {
                extension: '',
                location: null
            };
        }
        let defaultExtensionValue = locationInfoObj.extension;
        let extension = event.target.value;
        let updatedUser;
        if (extension) {
            if (extension.trim() === '') {
                AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.USER_LOCATION.EXTENSION.REQUIRED, level: Constant.NOTIFICATION_LEVELS.ERROR });
                clonedEvent.target.value = defaultExtensionValue;
                return;
            }
        }
        if (!locationInfoObj.location) {
            updatedUser = {
                locationInfo: {
                    location: null,
                    extension: extension.trim()
                }
            };
        } else {
            updatedUser = {
                locationInfo: {
                    location: locationInfoObj.location._id,
                    extension: extension.trim()
                }
            };
        }
        LoginAction.updateLoggedInUser(updatedUser, loggedInUser.id, Constant.NOTIFICATION_MESSAGES.USER_LOCATION.EXTENSION.UPDATE_SUCCESS);
    };

    _setAvailability = (event) => {
        let loggedInUser = this.state.LoginStore.user;
        let updatedUser = {
            availability: event.target.value.trim()
        };
        LoginAction.updateLoggedInUser(updatedUser, loggedInUser.id, Constant.NOTIFICATION_MESSAGES.USER_AVAILABILITY.UPDATE_SUCCESS);
    };

    _goToUserProfile(userId) {
        hashHistory.push('/user-profile/' + userId);
    }

    render() {
        const self = this;
        const styles = {
            textFieldStyle: {
                fontSize: '10px',
                width: '75px',
                height: '12px',
                cursor: 'pointer',
                lineHeight: '13px'
            }
        };
        let locationOptions = [];
        let appState = self.state.AppStore;
        let loginState = self.state.LoginStore;
        let userLocation = null;
        let locationInfo = null;
        let availability = null;
        let pictureStyle = {};
        let extension = null;

        if (loginState.user) {
            locationInfo = loginState.user.locationInfo;
            availability = loginState.user.availability;
            extension =  locationInfo && locationInfo.extension || ''
            if (locationInfo && locationInfo.location) {
                userLocation = locationInfo.location;
                if (locationInfo.location.name === 'Lunch' || locationInfo.location.name === 'Meeting' || locationInfo.location.name === 'Off') {
                    pictureStyle = {
                        filter: 'grayScale(100%)',
                        opacity: '0.7'
                    };
                }
            }
            locationOptions = map(appState.locations, (location) => {
                return {
                    text: location.name,
                    value: location._id,
                    icon: {
                        name: location.icon,
                        color: location.iconColor
                    }
                };
            });
        }

        return (
            <div className='profile-wrap'>
                <Picture src={loginState.user && loginState.user.picture} className='profile' onClick={() => self._goToUserProfile(loginState.user.id)} style={pictureStyle} />
                <div className='profile-data-wrap'>
                    <div className='profile-text light'>Todays Logged In Hours:</div>
                    <div className='profile-text'>{this.props.loggedHours}</div>
                    <div className='profile-text light'>Urgent hours:</div>
                    <div className='profile-text'>{this.props.urgentHours ? this.props.urgentHours.toFixed(2) : '0.00'}</div>
                    <div className='profile-text light'>Non-urgent hours:</div>
                    <div className='profile-text'>{this.props.nonUrgentHours ? this.props.nonUrgentHours.toFixed(2) : '0.00'}</div>
                    <div>
                        <div className='profile-dropdown profile-dropdown-zindex w-dropdown profile-text light'>
                            <Dropdown
                                placeholder='Location'
                                selectOnBlur={false}
                                onChange={self._changeLocation.bind(self)}
                                value={userLocation && userLocation._id}
                                options={locationOptions}
                                icon={null}
                            />
                        </div>
                        <div className='profile-dropdown w-dropdown'>
                            <div className='profile-dropdown-toggle w-dropdown-toggle' key={loginState.user && extension + loginState.user._id}>
                                <TextField
                                    className='timePicker-bottom'
                                    name='user-extension'
                                    style={styles.textFieldStyle}
                                    defaultValue={locationInfo && locationInfo.extension ? locationInfo.extension : ''}
                                    onBlur={self._setLocationExtension}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className='profile-text light'>Availability</div>
                        <div className='profile-dropdown w-dropdown'>
                            <div className='profile-dropdown-toggle w-dropdown-toggle' key={availability}>
                                <TextField
                                    name='user-availability'
                                    className='timePicker-bottom'
                                    style={styles.textFieldStyle}
                                    defaultValue={availability}
                                    onBlur={self._setAvailability}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
