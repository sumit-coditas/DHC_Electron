import './header.scss';

import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';
import forEach from 'lodash/forEach';
import React from 'react';
import { hashHistory } from 'react-router';
import { Dropdown, Icon, Search } from 'semantic-ui-react';
import { UtilModel } from '../../model/AppModels/UtilModel.js';
import HeaderAction from '../../actions/HeaderAction.js';
import UserAction from '../../actions/UserAction.js';
import LoginAction from '../../actions/LoginAction.js';
import logo from '../../assets/images/new_logo.png';
import { PLPMenu, PLPMenuItem } from '../../baseComponents/PLPMenu.js';
import PLPPureComponent from '../../baseComponents/PLPPureComponent';
import HeaderStore from '../../stores/HeaderStore.js';
import LoginStore from '../../stores/LoginStore.js';
import { getTaskNumber } from '../../utils/common.js';
import Constant from '../helpers/Constant.js';
import { SelectedUserModel } from '../../model/TaskModels/SelectedUserModel';

// const Search = Input.Search;
export default class HeaderNew extends PLPPureComponent {
    constructor(props) {
        super(props);
        this.state = this.getPropsfromStores();
        this.onChange = this.onChange.bind(this);
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (nextProps.currentRoute !== this.props.currentRoute) {
            if (!['/role-configuration', '/user-management', '/customer-configuration', '/personal-update', '/app-setting'].includes(nextProps.currentRoute)) {
                this.setState({ selectedTab: nextProps.currentRoute });
            } else {
                this.setState({ selectedTab: '/role-configuration' });
            }
        }
    }

    getPropsfromStores() {
        let state = {
            HeaderStore: HeaderStore.getState(),
            LoginStore: LoginStore.getState(),
            selectedTab: '',
            defaultPage: false
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
        this.setState({ selectedTab: window.location.pathname });
    }

    componentDidUpdate() {
        console.log(window.location.pathname);
        this.setState({ selectedTab: '/' });
    }

    componentWillUnmount() {
        HeaderStore.unlisten(this.onChange);
        LoginStore.unlisten(this.onChange);
    }

    _searchUsersAndTasks = debounce((event, value) => {
        HeaderAction.searchOptions(this.state.HeaderStore.searchValue, this.state.LoginStore.user._id);
    }, 500);

    _searchOptions = (event, value) => {
        HeaderAction.setLoaderAndValue(value);
        this._searchUsersAndTasks(event, value);
    }

    toggleCalendarVisibility = () => {
        LoginAction.toggleCalendarVisibility();
    }

    changeMenu = (e) => {
        if (e.key !== 'search') {
            if (e.key == '/') {
                SelectedUserModel.deleteAll();
                UtilModel.updateManualSort(false);
            }
            if (e.key === 'img') {
                SelectedUserModel.deleteAll()
                this.setState({ defaultPage: true });
                UtilModel.updateManualSort(false);
                return hashHistory.push('/');
            }
            this.setState({ defaultPage: false });
            if (e.key) {
                hashHistory.push(e.key);
            }
        }
    }

    _changePassword() {
        hashHistory.push('/change-password');
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

    _selectSearchOption = (event, option) => {
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

    renderMenu = () => {
        const { LoginStore, HeaderStore } = this.state;
        let trigger;
        let pathName = window.location.pathname;
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
        const menu = <PLPMenu
            debugger
            defaultSelectedKeys={[this.state.selectedTab]}
            onClick={this.changeMenu}
            mode='horizontal'
            theme='dark'
        >
            <PLPMenuItem key="img" className="header_img">
                <img src={logo} alt='Project List Pro' className='logo' style={{ width: '200px' }} />
            </PLPMenuItem>
            {canViewAllScopes && !canViewCustomerPage &&
                <PLPMenuItem key="/" selectedKeys={['/']} className={this.state.defaultPage ? 'ant-menu-item-selected' : ''}>
                    My Scopes
            </PLPMenuItem>
            }
            {!canViewCustomerPage &&
                <PLPMenuItem key="/ftp">
                    FTPsssss
            </PLPMenuItem>
            }
            {!canViewCustomerPage &&
                <PLPMenuItem key="/completed-scopes">
                    Completed Scopes
            </PLPMenuItem>
            }
            {canViewAdminPage &&
                <PLPMenuItem key="/active-hold-scopes">
                    Active/Hold Invoices
            </PLPMenuItem>
            }
            {!canViewCustomerPage &&
                <PLPMenuItem key="/sent-invoices">
                    Sent Invoices
            </PLPMenuItem>
            }
            {!canViewTimesheet && !canViewCustomerPage &&
                <PLPMenuItem key="/my-timesheet">
                    My Timesheets
            </PLPMenuItem>
            }
            {canViewTimesheet &&
                <PLPMenuItem key="/timesheet">
                    Timesheets
            </PLPMenuItem>
            }
            {canViewTimesheet &&
                <PLPMenuItem key="/role-configuration">
                    Configuration
            </PLPMenuItem>
            }
            {!canViewCustomerPage &&
                <PLPMenuItem key="/customer-page">
                    Customer
            </PLPMenuItem>
            }
            {!canViewCustomerPage &&
                <PLPMenuItem key={Constant.NAV_LINK.SCOPE_INVOICE}>
                    UnInvoiced
            </PLPMenuItem>
            }
            {canViewTimesheet &&
                <PLPMenuItem key="/reports">
                    Reports
            </PLPMenuItem>
            }
            {LoginStore.user && (LoginStore.user.role.id === Constant.ROLE_ID.ADMIN || LoginStore.user.canViewPaydayReport) &&
                <div className='nav-dropdown w-dropdown'>
                    <div className='nav-dropdown-toggle w-dropdown-toggle'>
                        <form action='/api/hourTracker/download-payday-report' method='post'>
                            <input type='hidden' name='payDate' value={this.getPayDate()} />
                            <button type='submit' style={{ lineHeight: '0px', fontSize: '14px', outline: 'none' }} className='ant-menu-dark pay-day-report-button'> Populate payday reports</button>
                        </form>
                    </div>
                </div>
            }
            <div style={{
                display: 'inline'
            }}>
                {LoginStore.user && <div className='nav-dropdown right-dropdown w-dropdown' style={{ paddingRight: '25px' }}>
                    <Dropdown trigger={trigger} pointing className='profile-header-dropdown screen_class'>
                        <Dropdown.Menu>
                            <Dropdown.Item disabled>
                                Signed in as &nbsp;
                                    <strong>{LoginStore.user.firstName + ' ' + LoginStore.user.lastName}</strong>
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={this.goToProfile}>Your Profile</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={this._changePassword}>Change Password</Dropdown.Item>
                            <Dropdown.Item onClick={this._logout}>Sign Out</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                }
                {!canViewCustomerPage && <div className='nav-dropdown right-dropdown w-dropdown'>
                    <div className='nav-dropdown-toggle w-clearfix w-dropdown-toggle'>
                        <div className='fa w-hidden-small w-hidden-tiny' data-delay='0' onClick={this.toggleCalendarVisibility}></div>
                    </div>
                </div>
                }
                {LoginStore.user && !canViewCustomerPage &&
                    <div className='nav-dropdown right-dropdown search-dropdown' data-delay='0'>
                        <Search category value={HeaderStore.searchValue} results={searchCategoryOptions}
                            loading={HeaderStore.isLoading} onSearchChange={this._searchOptions}
                            onResultSelect={this._selectSearchOption} placeholder='Quick Search' />
                    </div>
                }
            </div>
        </PLPMenu>
        if (this.state.LoginStore.user) {
            return (
                <div key={window.location.pathname}>
                    {menu}
                </div>
            )
        }
        return null;
    }
    render = () => <div>
        {this.renderMenu()}
    </div>;

}
