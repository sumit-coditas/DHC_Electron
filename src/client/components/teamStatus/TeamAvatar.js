import React from 'react';
import moment from 'moment';
import { Icon } from 'semantic-ui-react';
import find from 'lodash/find';
import cloneDeep from 'lodash/cloneDeep';
import { hashHistory } from 'react-router';

import Picture from './../widgets/Picture.js';
import Constants from '../helpers/Constant.js';
import { compareData } from '../helpers/Utility.js';

import AppStore from './../../stores/AppStore.js';
import LoginStore from './../../stores/LoginStore.js';

import TaskAction from '../../actions/TaskAction.js';
import AppAction from '../../actions/AppAction.js';


/* global $ Webflow:true */
export default class TeamAvatar extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = this.getPropsfromStores();
        this.onChange = this.onChange.bind(this);
        this._handleContextMenu = this._handleContextMenu.bind(this);
        this._handleClick = this._handleClick.bind(this);
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
        this.mainRoot.addEventListener('contextmenu', this._handleContextMenu);
        document.addEventListener('click', this._handleClick);
        document.addEventListener('scroll', this._handleScroll);
    }

    shouldComponentUpdate(nextProps, nextState) {
        let shouldRender = compareData(this.props, nextProps,
            [
                'isSelected',
                'viewMode',
                'user',
                'loggedInUser'
            ]);
        if (this.state.AppStore.viewContextMenu[this.props.user.id] !== nextState.AppStore.viewContextMenu[this.props.user.id]) {
            shouldRender = true;
        }
        return shouldRender;
    }

    componentWillUnmount() {
        AppStore.unlisten(this.onChange);
        LoginStore.unlisten(this.onChange);
        this.mainRoot.removeEventListener('contextmenu', this._handleContextMenu);
        document.removeEventListener('click', this._handleClick);
        document.removeEventListener('scroll', this._handleScroll);
    }

    _handleContextMenu(event) {
        event.preventDefault();
        AppAction.showContextMenu({ userId: this.props.user.id, bool: true });
        if (this.root) {
            const clickX = event.clientX;
            const clickY = event.clientY;
            const screenW = window.innerWidth;
            const screenH = window.innerHeight;
            const rootW = this.root.offsetWidth;
            const rootH = this.root.offsetHeight;

            const right = (screenW - clickX) > rootW;
            const left = !right;
            const top = (screenH - clickY) > rootH;
            const bottom = !top;

            if (right) {
                this.root.style.left = `${clickX + 5}px`;
            }

            if (left) {
                this.root.style.left = `${clickX - rootW - 5}px`;
            }

            if (top) {
                this.root.style.top = `${clickY + 5}px`;
            }

            if (bottom) {
                this.root.style.top = `${clickY - rootH - 5}px`;
            }
        }

    }

    _handleClick(event) {
        const wasOutside = !(event.target.contains === this.root);

        if (wasOutside && this.state.AppStore.viewContextMenu[this.props.user.id])
            AppAction.showContextMenu({ userId: this.props.user.id, bool: false });
    }

    _handleScroll = () => {
        if (this.state.AppStore.viewContextMenu[this.props.user.id])
            AppAction.showContextMenu({ userId: this.props.user.id, bool: false });
    };

    _startSlackChat() {
        if (this.props.user.slackId) {
            window.location = 'slack://user?team=' + this.state.AppStore.appSettings.slackTeamId + '&id=' + this.props.user.slackId;
        } else {
            alert('User does not have slack id.');
        }
    }

    _startSkypeCall = (evt) => {
        evt.stopPropagation();
        window.location = `callto:sip:${this.props.user.email}`;
    };

    _startSkypeConversation = (evt) => {
        evt.stopPropagation();
        window.location = `sip:${this.props.user.email}`;
    };

    _showUserTask(user) {
        if (this.state.LoginStore.user.role.id === Constants.ROLE_ID.MANAGER) {
            hashHistory.push('/');
            TaskAction.addLoader('taskGroupWrapper');
            TaskAction.viewMyScopes(false);
            TaskAction.showUserTasks(user);
            TaskAction.getUsersScopes(user._id);
        }
    }

    render() {
        let self = this;
        let { user } = self.props;
        let userName = user.firstName + ' ' + user.lastName;
        let { locationInfo } = user;
        let locationIcon = '';
        let locationFrom = '-';
        let locationTo = '-';
        let availability = '';
        let extension = '-';
        let pictureStyle = {};

        if (locationInfo && locationInfo.location) {
            locationIcon = (<Icon className='transition' color={locationInfo.location.iconColor} name={locationInfo.location.icon} />);
        }
        if (locationInfo && locationInfo.from) {
            locationFrom = moment(locationInfo.from).format('h:mm');
        }
        if (locationInfo && locationInfo.to) {
            locationTo = moment(locationInfo.to).format('h:mm a');
        }
        if (user.availability) {
            availability = user.availability;
        }
        if (locationInfo && locationInfo.extension) {
            extension = locationInfo.extension;
        }

        let unreadMessages = 0;
        let imFound = find(self.props.loggedInUser.ims, (im) => {
            return im.user === user.slackId;
        });

        if (imFound) {
            unreadMessages = imFound.unread_count;
        }

        if (!user.isOnline) {
            pictureStyle = {
                filter: 'grayScale(100%)',
                opacity: '0.7'
            };
        } else if (locationInfo && locationInfo.location && locationInfo.location.name !== '') {
            if (locationInfo.location.name === 'Lunch' || locationInfo.location.name === 'Meeting' || locationInfo.location.name === 'Off') {
                pictureStyle = {
                    filter: 'grayScale(100%)',
                    opacity: '0.7'
                };
            }
        }

        return (
            <div id='clickable-area' className='team-avatar-dropdown w-dropdown z-d-auto'
                data-delay='0'
                onClick={() => self._showUserTask(user)}>
                <div ref={ref => { this.mainRoot = ref }} className={self.props.isSelected ? 'team-avatar-dropdown-toggle w-dropdown-toggle selected' : 'team-avatar-dropdown-toggle w-dropdown-toggle'}>
                    <div className='new-tile' style={pictureStyle}>
                        <div className='new-tile-avatar tile-avatar'>
                            <Picture style={{ width: '100%', height: '100%' }} src={user.picture} />
                        </div>
                        {unreadMessages
                            ? <div className='notification'>
                                <div>
                                    {unreadMessages}
                                </div>
                            </div>
                            : null}
                        <div className='hours-wrap'>
                            {self.props.viewMode.urgent && <div className='uh-blue urgent-hours'>
                                <div>
                                    {self.props.user.urgentHours}
                                </div>
                            </div>}
                            {self.props.viewMode.nonUrgent && <div className='hours'>
                                <div>
                                    {self.props.user.nonUrgentHours}
                                </div>
                            </div>}
                        </div>
                        <div className='bottom-wrap'>
                            {self.props.viewMode.name && <div className='name-bar'>
                                <div>
                                    {userName}
                                </div>
                            </div>}
                            {self.props.viewMode.location && <div className='location-bar'>
                                <div>
                                    {locationIcon}: &nbsp;{extension}
                                </div>
                            </div>}
                            {self.props.viewMode.availability &&
                                <div style={availability.startsWith('F') || availability.startsWith('f') ? { backgroundColor: '#8CC341' } : { backgroundColor: '#575757', color: '#FFFFFF' }} className='time-bar'>
                                    <div>
                                        {availability}
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>

                {(self.state.AppStore.viewContextMenu && self.state.AppStore.viewContextMenu[user.id]) &&
                    <div ref={ref => { self.root = ref }} className="contextMenu">
                        <div>
                            <div className="contextMenu--option" onClick={this._startSkypeCall}>Call</div>
                            <div className="contextMenu--separator" />
                            <div className="contextMenu--option" onClick={this._startSkypeConversation}>Chat</div>
                        </div>
                    </div>
                }

            </div>
        );
    }
}

TeamAvatar.propTypes = {
    user: React.PropTypes.object.isRequired,
    viewMode: React.PropTypes.object,
    isSelected: React.PropTypes.bool
};

TeamAvatar.defaultProps = {
    viewMode: {
        name: true,
        location: true,
        availability: true,
        urgent: true,
        nonUrgent: true
    }
};
