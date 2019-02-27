import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';
import forEach from 'lodash/forEach';
import React from 'react';
import { hashHistory } from 'react-router';
import { Dropdown, Icon, Search } from 'semantic-ui-react';

import HeaderAction from '../actions/HeaderAction.js';
import LoginAction from '../actions/LoginAction.js';
import TaskAction from '../actions/TaskAction.js';
import UserAction from '../actions/UserAction.js';
import logo from '../assets/images/new_logo.png';
import { UtilModel } from '../model/AppModels/UtilModel.js';
import HeaderStore from '../stores/HeaderStore.js';
import LoginStore from '../stores/LoginStore.js';
import { getTaskNumber } from '../utils/common.js';
import Constant from './helpers/Constant.js';
import PLPPureComponent from '../baseComponents/PLPPureComponent';
import { SelectedUserModel } from '../model/TaskModels/SelectedUserModel';
// import logo from '../assets/images/project-list-logo.png'

export default class Header extends PLPPureComponent {
    constructor(props) {
        super(props);
        this.state = this.getPropsfromStores();
        this.onChange = this.onChange.bind(this);
    }

    getPropsfromStores() {
        let state = {
            HeaderStore: HeaderStore.getState(),
            LoginStore: LoginStore.getState(),
        };
        return state;
    }

    onChange(state) {
        const newState = cloneDeep(this.state);
        newState[state.displayName] = cloneDeep(state);
        this.setState(newState);
    }

    componentDidMount() {
        HeaderStore.listen(this.onChange);
        LoginStore.listen(this.onChange);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    componentWillUnmount() {
        // $(Webflow.destroy);
        HeaderStore.unlisten(this.onChange);
        LoginStore.unlisten(this.onChange);
    }

    _logout = () => {
        let self = this;
        if (self.state.LoginStore.socket) {
            self.state.LoginStore.socket.emit(Constant.SOCKET_EVENTS.USER_SINGOUT, { userId: self.state.LoginStore.user.id });
        }
        LoginAction.logout();
    };

    goToProfile = () => {
        hashHistory.push('/user-profile/' + this.state.LoginStore.user.id);
    }

    toggleCalendarVisibility = () => {
        LoginAction.toggleCalendarVisibility();
    }

    _goToWorkBoard() {
        hashHistory.push('/role-configuration');
    }
    _goToCustomerPage() {
        hashHistory.push('/customer-page');
    }
    _goToCustomerHome() {
        hashHistory.push('/customer-home');
    }
    _goToScopeInvoicePage() {
        hashHistory.push(Constant.NAV_LINK.SCOPE_INVOICE);
    }

    _goToHomePage() {
        TaskAction.viewMyScopes(true);
        SelectedUserModel.deleteAll();
        hashHistory.push('/');
    }

    _goToTimesheet() {
        hashHistory.push('/timesheet');
    }

    _goToAdminPage() {
        hashHistory.push('/active-hold-scopes');
    }

    _changePassword() {
        hashHistory.push('/change-password');
    }

    _goToPersonalTimesheet() {
        hashHistory.push('/my-timesheet');
    }

    _goToReports = () => {
        hashHistory.push('/reports');
    };

    _selectSearchOption(event, option) {
        // let user = find(this.state.HeaderStore.searchOptions, (currentUser) => {
        //     return currentUser.id === option.value;
        // });
        let user = this.state.HeaderStore.searchOptions
            .filter(item => item.firstName)
            .find(item => item.id === option.value);
        if (user) {
            UserAction.clearStore();
            UserAction.getUser(option.value);
            hashHistory.push('/user-profile/' + option.value);
        } else if (option.value) {
            // hashHistory.push('/');
            const data = UtilModel.getUtilsData();
            data.title = ' '
            data.taskId = option.value;
            data.newTask = null;
            new UtilModel(data).$save();
            // TaskAction.openSelectedtask({
            //     taskId: option.value,
            //     groupId: null
            // });
        }
        HeaderAction.resetData();
    }

    _searchUsersAndTasks = debounce((event, value) => {
        HeaderAction.searchOptions(this.state.HeaderStore.searchValue, this.state.LoginStore.user._id);
    }, 500);

    _searchOptions(event, value) {
        HeaderAction.setLoaderAndValue(value);
        this._searchUsersAndTasks(event, value);
    }

    _viewMyScopes(value) {
        let loggedInUserId;
        SelectedUserModel.deleteAll();
        if (value) {
            loggedInUserId = this.state.LoginStore.user._id;
            if (window.location.pathname !== '/') {
                hashHistory.push('/');
            } else {
                TaskAction.getUsersScopes(loggedInUserId);
            }
            TaskAction.viewMyScopes(value);
        } else {
            loggedInUserId = '';
            hashHistory.push('/');
            TaskAction.viewMyScopes(value);
            TaskAction.getUsersScopes(loggedInUserId);
        }
    }

    _viewCompletedScopes() {
        hashHistory.push('/completed-scopes');
    }

    _viewSentInvoices() {
        hashHistory.push('/sent-invoices');
    }
    _isConfigpath(pathName) {
        if (pathName === Constant.NAV_LINK.CONFIG ||
            pathName === Constant.NAV_LINK.APP_CONFIG ||
            pathName === Constant.NAV_LINK.PERSONAL_CONFIG ||
            pathName === Constant.NAV_LINK.USER_CONFIG ||
            pathName === Constant.NAV_LINK.CUSTOMER_PROFILE
        ) {
            return true;
        }
        return false;
    }

    getPayDate = () => {
        const previousDate = new Date(1514764800000);
        const d = new Date();
        const todayDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const diff = todayDate.getTime() - previousDate.getTime();
        const daysDiff = diff / 86400000;
        const dayDifference = Math.ceil(daysDiff % 14) === 14 ? 0 : Math.ceil(daysDiff % 14);
        const lastPayday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dayDifference);
        return lastPayday;
    };

    getActiveHeader() {
        const pathName = window.location.pathname;
        const pathArray = Object.values(Constant.NAV_LINK);
        return pathArray.find(path => path === pathName)    
    }

    render() {
        let self = this;
        const { LoginStore, HeaderStore } = self.state;
        let trigger;
        let pathName = this.getActiveHeader();
        let userOptions = [];
        let taskOptions = [];
        let styles = {
            backgroundColor: '#8CC341',
            borderRadius: '5px',
            padding: '8px',
            fontWeight: '400',
            textAlign: 'center',
            boxShadow: '0 0 8px'
        };

        forEach(HeaderStore.searchOptions, (item) => {
            if (item && item.firstName) {
                userOptions.push({
                    title: item.firstName + ' ' + item.lastName,
                    value: item.id,
                    key: item.id
                });
            } else {
                let taskNumber = getTaskNumber(item);
                taskOptions.push({ value: item.id, key: item.id, title: item.contractor.name + '-' + taskNumber + '-' + item.title + '-' + item.city + ', ' + item.state });
            }
        });

        let searchCategoryOptions = {
            user: {
                name: 'Users',
                results: userOptions.length === 0
                    ? [
                        {
                            title: 'No result found'
                        }
                    ]
                    : userOptions
            },
            task: {
                name: 'Tasks',
                results: taskOptions.length === 0
                    ? [
                        {
                            title: 'No result found'
                        }
                    ]
                    : taskOptions
            }
        };

        let canViewAllScopes = true;
        let canViewTimesheet = false;
        let canViewAdminPage = false;
        let canViewCustomerPage = false;

        if (LoginStore.user) {
            trigger = (
                <span><Icon name='user' />Hello, {LoginStore.user.firstName}</span>
            );

            if (LoginStore.user.role.id === Constant.ROLE_ID.ENGINEER || LoginStore.user.role.id === Constant.ROLE_ID.DRAFTER) {
                canViewAllScopes = false;
            }

            if (LoginStore.user.role.id === Constant.ROLE_ID.MANAGER) {
                canViewTimesheet = true;
            }

            if (LoginStore.user.role.id === Constant.ROLE_ID.ADMIN ||
                LoginStore.user.roleLevel && LoginStore.user.roleLevel.name.trim() === 'President') {
                canViewAdminPage = true;
            }

            if (LoginStore.user.role.id === Constant.ROLE_ID.CUSTOMER ||
                LoginStore.user.roleLevel && LoginStore.user.roleLevel.name.trim() === 'Contractor') {
                canViewCustomerPage = true;
            }

        }

        return (
            <div className='sub-nav w-clearfix' style={canViewCustomerPage ? { backgroundColor: '#001529' } : {}} >
                <a href='#' onClick={() => self._goToHomePage()}>
                    <img className='logo-img' sizes='(max-width: 479px) 77vw, 110px' src={logo} /></a>
                {
                    self.state.LoginStore.user &&
                    <div className='nav-dropdown-wrap screen_class'>
                        {canViewAllScopes && !canViewCustomerPage &&
                            <div
                                className='nav-dropdown w-dropdown'
                                style={pathName === Constant.NAV_LINK.MY_SCOPE ? styles : null}
                                onClick={self._viewMyScopes.bind(self, true)}>
                                <div
                                    className='nav-dropdown-toggle w-dropdown-toggle'>
                                    <span>My Scopes</span>
                                </div>
                            </div>
                        }
                        {/* Completed Scope */}
                        {
                            !canViewCustomerPage &&
                            <div
                                className='nav-dropdown w-dropdown'
                                style={pathName === Constant.NAV_LINK.COMPLETED_SCOPES ? styles : null}
                                onClick={self._viewCompletedScopes.bind(self, false)}>
                                <div
                                    className='nav-dropdown-toggle w-dropdown-toggle'>
                                    {/* <Icon name='universal access' /> */}
                                    <span>Completed Scopes</span>
                                </div>
                            </div>

                        }


                        {/*Active Hold*/}
                        {canViewAdminPage &&
                            <div
                                className='nav-dropdown w-dropdown'
                                style={pathName === Constant.NAV_LINK.ADMIN_PAGE ? styles : null}
                                onClick={self._goToAdminPage.bind(self)}>
                                <div
                                    className='nav-dropdown-toggle w-dropdown-toggle'>
                                    {/* <Icon name='universal access' /> */}
                                    <span>Active/Hold Invoices</span>
                                </div>
                            </div>
                        }
                        {/* Sent Invoice*/}
                        {
                            !canViewCustomerPage &&
                            <div
                                className='nav-dropdown w-dropdown'
                                style={pathName === Constant.NAV_LINK.SENT_INVOICES ? styles : null}
                                onClick={self._viewSentInvoices.bind(self)}>
                                <div
                                    className='nav-dropdown-toggle w-dropdown-toggle'>
                                    {/* <Icon name='wait' /> */}
                                    <span>Sent Invoices</span>
                                </div>
                            </div>
                        }

                        {/* My Time Sheets*/}
                        {!canViewTimesheet && !canViewCustomerPage &&
                            <div
                                className='nav-dropdown w-dropdown'
                                style={pathName === Constant.NAV_LINK.PERSONAL_TIMESHEET ? styles : null}
                                onClick={self._goToPersonalTimesheet.bind(self)}>
                                <div
                                    className='nav-dropdown-toggle w-dropdown-toggle'>
                                    {/* <Icon name='wait' /> */}
                                    <span>My Timesheet</span>
                                </div>
                            </div>
                        }
                        {/*Timeshets*/}
                        {canViewTimesheet &&
                            <div
                                className='nav-dropdown w-dropdown'
                                style={pathName === Constant.NAV_LINK.TIMESHEET ? styles : null}
                                onClick={self._goToTimesheet.bind(self)}>
                                <div
                                    className='nav-dropdown-toggle w-dropdown-toggle'>
                                    {/* <Icon name='wait' /> */}
                                    <span>Timesheets</span>
                                </div>
                            </div>
                        }
                        {/*Configurations*/}
                        {canViewTimesheet &&
                            <div
                                className='nav-dropdown w-dropdown'
                                style={this._isConfigpath(pathName) ? styles : null}
                                onClick={self._goToWorkBoard.bind(self)}>
                                <div
                                    className='nav-dropdown-toggle w-dropdown-toggle'>
                                    {/* <Icon name='universal access' /> */}
                                    <span>Configuration</span>
                                </div>
                            </div>
                        }

                        {/* CUSTOMER PAGE*/}
                        {
                            !canViewCustomerPage &&
                            <div
                                className='nav-dropdown w-dropdown'
                                style={pathName === Constant.NAV_LINK.CUSTOMER ? styles : null}
                                onClick={self._goToCustomerPage.bind(self)}>
                                <div
                                    className='nav-dropdown-toggle w-dropdown-toggle'>
                                    {/* <Icon name='universal access' /> */}
                                    <span>Customer</span>
                                </div>
                            </div>
                        }

                        {/* CUSTOMER HOME PAGE*/}
                        {canViewCustomerPage &&
                            <div
                                className='nav-dropdown w-dropdown'
                                // style={pathName === Constant.NAV_LINK.CUSTOMER_HOME ? styles : null}
                                onClick={self._goToCustomerHome.bind(self)}>
                                <div
                                    className='nav-dropdown-toggle w-dropdown-toggle'>
                                    {/* <Icon name='universal access' /> */}
                                    <span></span>
                                </div>
                            </div>
                        }

                        {/* ScopeInvoice PAGE*/}
                        {
                            !canViewCustomerPage &&
                            <div
                                className='nav-dropdown w-dropdown'
                                style={pathName === Constant.NAV_LINK.SCOPE_INVOICE ? styles : null}
                                onClick={self._goToScopeInvoicePage.bind(self)}>
                                <div
                                    className='nav-dropdown-toggle w-dropdown-toggle'>

                                    <span>Uninvoiced</span>
                                </div>
                            </div>
                        }

                        {canViewTimesheet &&
                            <div
                                className='nav-dropdown w-dropdown'
                                style={pathName === Constant.NAV_LINK.REPORTS ? styles : null}
                                onClick={self._goToReports}>
                                <div
                                    className='nav-dropdown-toggle w-dropdown-toggle'>
                                    <span>Reports</span>
                                </div>
                            </div>
                        }

                        {/* /populate payday report for admins */}
                        {LoginStore.user.role.id === Constant.ROLE_ID.ADMIN &&
                            <div className='nav-dropdown w-dropdown'>
                                <div className='nav-dropdown-toggle w-dropdown-toggle'>
                                    <form action='/api/hourTracker/download-payday-report' method='post'>
                                        <input type='hidden' name='payDate' value={this.getPayDate()} />
                                        <button type='submit' className='pay-day-report-button' > Populate payday reports</button>
                                    </form>
                                </div>
                            </div>
                        }
                    </div>
                }
                {LoginStore.user && <div style={{
                    display: 'inline'
                }}>
                    <div className='nav-dropdown right-dropdown w-dropdown'>
                        <Dropdown trigger={trigger} pointing className='profile-header-dropdown screen_class'>
                            <Dropdown.Menu>
                                <Dropdown.Item disabled>
                                    Signed in as &nbsp;
                                    <strong>{LoginStore.user.firstName + ' ' + LoginStore.user.lastName}</strong>
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={self.goToProfile}>Your Profile</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={self._changePassword}>Change Password</Dropdown.Item>
                                <Dropdown.Item onClick={self._logout}>Sign Out</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    {!canViewCustomerPage && <div className='nav-dropdown right-dropdown w-dropdown'>
                        <div className='nav-dropdown-toggle w-clearfix w-dropdown-toggle'>
                            <div className='fa w-hidden-small w-hidden-tiny' data-delay='0' onClick={self.toggleCalendarVisibility.bind(self)}></div>
                        </div>
                    </div>
                    }
                    {LoginStore.user && !canViewCustomerPage &&
                        <div className='nav-dropdown right-dropdown search-dropdown' data-delay='0'>
                            <Search category value={HeaderStore.searchValue} results={searchCategoryOptions}
                                loading={HeaderStore.isLoading} onSearchChange={self._searchOptions.bind(self)}
                                onResultSelect={self._selectSearchOption.bind(self)} placeholder='Search' />
                        </div>
                    }
                </div>
                }
            </ div>
        );
    }
}
