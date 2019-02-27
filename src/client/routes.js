import React from 'react';
import Loadable from 'react-loadable';
import { IndexRoute, Route } from 'react-router';
import Home from './components/views/Home.js';
import CompletedScopePage from './components/views/completedScopePage/';
import Permission from './components/configuration/Permission.js';
import AppSetting from './components/configuration/AppSetting.js';
import CustomerProfile from './components/configuration/CustomerProfile';
import PersonalUpdate from  './components/configuration/PersonalUpdate.js';
import RoleConfiguration from './components/configuration/RoleConfiguration.js';
import RoleLevel from './components/configuration/RoleLevel.js';
import Roles from './components/configuration/Roles.js';
import Users from './components/configuration/User.js';
import WorkBoard from './components/configuration/WorkBoard.js';
import Reports from './components/views/reports/Reports.js';
import ActiveHoldPage from './components/views/activeHoldPage/';
import SentInvoicePage from './components/views/SentInvoicePage/';
import UninvoicedPage from './components/views/UninvoicedPage/';
import UserProfile from './components/views/UserProfile.js';
import AppAction from './actions/AppAction.js';
import LoginAction from './actions/LoginAction.js';
import { App } from './components/App.js';
import Constant from './components/helpers/Constant';
import { ChangePassword } from './components/views/ChangePassword.js';
import { CustomerHome } from './components/views/CustomerHome/CustomerHome';
import FTP from './components/views/Ftp.js';
import { NewLogin } from './components/views/Login/Login.js';
import { ResetPassword } from './components/views/ResetPassword.js';
import { TimesheetTable } from './components/views/Timesheet/TimesheetTable.js';
import LoginLoader from './components/widgets/LoginLoader.js';
import LoginStore from './stores/LoginStore.js';

const personalTimesheet = (props) => <TimesheetTable isPersonal={true} {...props} />;

const timesheet = (props) => <TimesheetTable {...props} />;

const ensureAuthenticated = (nextState, replace) => {
  let authToken = localStorage.getItem(Constant.COOKIES.AUTH_TOKEN);
  if (!authToken) {
    replace('/login');
  } else {
    let user = LoginStore.getState().user;
    if (!user) {
      let redirectUri = nextState.location.pathname;
      if (nextState.location.query.code) {
        redirectUri += '?code=' + nextState.location.query.code;
      }
      LoginAction.getLoggedInUser(authToken, redirectUri);
      AppAction.getMasterData();
      replace('/loading');
    } else if (!user.isVerified) {
      if (nextState.location.pathname !== '/change-password') {
        replace('/change-password');
      }
    }

    if (user) {
      if (nextState.location.pathname === '/active-hold-scopes' &&
        user.role.id !== Constant.ROLE_ID.ADMIN && user.roleLevel && user.roleLevel.name.trim() !== 'President') {
        replace('/');
      }
    }
  }
};

const skipIfAuthenticated = (nextState, replace) => {
  if (localStorage.getItem(Constant.COOKIES.AUTH_TOKEN)) {
    replace('/');
  }
};

function Loading({ error }) {
  if (error) {
    return 'Oh nooess!';
  } else {
    return <h3>Loading...</h3>;
  }
}

// const Home = Loadable({
//   loader: () => import('./components/views/Home.js'),
//   loading: LoginLoader
// });

// const CompletedScopePage = Loadable({
//   loader: () => import('./components/views/completedScopePage/'),
//   loading: LoginLoader
// });

// const Permission = Loadable({
//   loader: () => import('./components/configuration/Permission.js'),
//   loading: LoginLoader
// });

// const AppSetting = Loadable({
//   loader: () => import('./components/configuration/AppSetting.js'),
//   loading: LoginLoader
// });

// const CustomerProfile = Loadable({
//   loader: () => import('./components/configuration/CustomerProfile'),
//   loading: LoginLoader
// });

// const PersonalUpdate = Loadable({
//   loader: () => import('./components/configuration/PersonalUpdate.js'),
//   loading: LoginLoader
// });

// const RoleConfiguration = Loadable({
//   loader: () => import('./components/configuration/RoleConfiguration.js'),
//   loading: LoginLoader
// });

// const RoleLevel = Loadable({
//   loader: () => import('./components/configuration/RoleLevel.js'),
//   loading: LoginLoader
// });

// const Roles = Loadable({
//   loader: () => import('./components/configuration/Roles.js'),
//   loading: LoginLoader
// });

// const Users = Loadable({
//   loader: () => import('./components/configuration/User.js'),
//   loading: LoginLoader
// });

// const WorkBoard = Loadable({
//   loader: () => import('./components/configuration/WorkBoard.js'),
//   loading: LoginLoader
// });

// const Reports = Loadable({
//   loader: () => import('./components/views/reports/Reports.js'),
//   loading: LoginLoader
// });

// const ActiveHoldPage = Loadable({
//   loader: () => import('./components/views/activeHoldPage/'),
//   loading: LoginLoader
// });

// const SentInvoicePage = Loadable({
//   loader: () => import('./components/views/SentInvoicePage/'),
//   loading: LoginLoader
// });

// const UninvoicedPage = Loadable({
//   loader: () => import('./components/views/UninvoicedPage/'),
//   loading: LoginLoader
// });

// const UserProfile = Loadable({
//   loader: () => import('./components/views/UserProfile.js'),
//   loading: LoginLoader
// });

//   const LoginLoader = Loadable({
//     loader: () => import('./components/widgets/LoginLoader.js'),
//     loading: Spinner
//   });


export default (
  <Route path='/' component={App}>
    <Route path='/login' component={NewLogin} onEnter={skipIfAuthenticated} />
    <Route path='/ftp' component={FTP} onEnter={ensureAuthenticated} />
    <Route path='/user-profile/:userId' component={UserProfile} onEnter={ensureAuthenticated} />
    <Route path='/change-password' component={ChangePassword} onEnter={ensureAuthenticated} />
    <Route path='/reset/:token' component={ResetPassword} onEnter={skipIfAuthenticated} />
    <Route path='/roles' component={Roles} onEnter={ensureAuthenticated} />
    <Route path='/role-levels' component={RoleLevel} onEnter={ensureAuthenticated} />
    <Route path='/permissions' component={Permission} onEnter={ensureAuthenticated} />
    <Route path='/users' component={Users} onEnter={ensureAuthenticated} />
    <Route path='/completed-scopes' component={CompletedScopePage} onEnter={ensureAuthenticated} />
    <Route path='/reports' component={Reports} onEnter={ensureAuthenticated} />
    <Route path='/sent-invoices' component={SentInvoicePage} onEnter={ensureAuthenticated} />
    <Route path='/timesheet' component={timesheet} onEnter={ensureAuthenticated} />
    <Route path='/my-timesheet' component={personalTimesheet} onEnter={ensureAuthenticated} />
    <Route path='/active-hold-scopes' component={ActiveHoldPage} onEnter={ensureAuthenticated} />
    <Route path='/customer-page' component={CustomerHome} onEnter={ensureAuthenticated} />
    <Route path='/scope-invoice' component={UninvoicedPage} onEnter={ensureAuthenticated} />
    <Route path='/work-board' component={WorkBoard} onEnter={ensureAuthenticated}>
      <Route path='/role-configuration' component={RoleConfiguration} onEnter={ensureAuthenticated} />
      <Route path='/personal-update' component={PersonalUpdate} onEnter={ensureAuthenticated} />
      <Route path='/communication' onEnter={ensureAuthenticated} />
      <Route path='/user-management' component={Users} onEnter={ensureAuthenticated} />
      <Route path='/app-setting' component={AppSetting} onEnter={ensureAuthenticated} />
      <Route path='/customer-configuration' component={CustomerProfile} onEnter={ensureAuthenticated} />
    </Route>
    <Route path='/loading' component={LoginLoader} />
    <IndexRoute component={Home} onEnter={ensureAuthenticated} />
  </Route>
);
