import bugsnag from '@bugsnag/js';
import bugsnagReact from '@bugsnag/plugin-react';
import cloneDeep from 'lodash/cloneDeep';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import React from 'react';
import { connect } from 'react-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';

import AppAction from '../actions/AppAction.js';
import LoginAction from '../actions/LoginAction.js';
import PLPPureComponent from '../baseComponents/PLPPureComponent';
import { UtilModel } from '../model/AppModels/UtilModel.js';
import AppStore from '../stores/AppStore.js';
import LoginStore from '../stores/LoginStore.js';
import TaskStore from '../stores/TaskStore.js';
import { socketListeners } from '../utils/socketUtils';
import HeaderNew from './HeaderNew/HeaderNew';
import Constant from './helpers/Constant.js';
import Notification from './helpers/Notification.js';
import './App/app.scss';
import CongratulationsPopup from './reusableComponents/congratulationsPopup';
import UserAvatarHeader from './userAvatar/UserAvatarHeader.js';
import TaskPageWrapper from './views/TaskPage/TaskPageWrapper';
import { UserModel } from '../model/UserModel.js';

// import Header from './Header.js';
injectTapEventPlugin();

const BUGSNAG_API_KEY = '51ebcfd49166bfe382546051ab18f49a';
const bugsnagClient = bugsnag({
    apiKey: BUGSNAG_API_KEY,
    appVersion: '1.0.0',
    appType: 'Client'
});
bugsnagClient.use(bugsnagReact, React);
const ErrorBoundary = bugsnagClient.getPlugin('react');

class AppImpl extends PLPPureComponent {
    constructor(props) {
        super(props);
        this.state = this.getPropsfromStores();
        this.onChange = this.onChange.bind(this);
        this._closeError = this._closeError.bind(this);
    }

    getPropsfromStores() {
        return {
            AppStore: AppStore.getState(),
            LoginStore: LoginStore.getState(),
            TaskStore: TaskStore.getState()
        };
    }

    onChange(state) {
        const newState = cloneDeep(this.state);
        newState[state.displayName] = cloneDeep(state);
        this.setState(newState);
    }

    componentDidMount() {
        AppStore.listen(this.onChange);
        LoginStore.listen(this.onChange);
        TaskStore.listen(this.onChange);
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.LoginStore.user && this.state.LoginStore.user && !this.state.LoginStore.socket) {
            socketListeners();
        }
    }

    componentWillUnmount() {
        AppStore.unlisten(this.onChange);
        LoginStore.unlisten(this.onChange);
        TaskStore.unlisten(this.onChange);
    }

    _closeError() {
        AppAction.hideError();
        if (this.state.AppStore.error.code === 404 && this.state.AppStore.error.message === Constant.NOTIFICATION_MESSAGES.USER_NOT_PRESENT) {
            LoginAction.logout();
        }
    }

    updateAppState = (state) => {
        this.setState({ ...this.state, ...state });
    };

    renderTaskModal = () => <TaskPageWrapper
        taskId={this.props.taskId}
        title={this.props.title}
        newTask={this.props.newTask}
        updateState={this.updateAppState}
        unEditable={this.props.isCustomer}
    />;

    getCongratulationsPopup = () => <CongratulationsPopup />;

    render() {
        let self = this;
        let AppState = self.state.AppStore;

        let childrenWithProps = React.Children.map(this.props.children, child =>
            React.cloneElement(child, { socket: this.state.LoginStore.socket, updateAppState: this.updateAppState }));

        return (
            <MuiThemeProvider>
                <ErrorBoundary>
                    <div style={{ height: '100%' }}>
                        {AppState.showNotification
                            && <Notification isError={AppState.isError} errorCode={AppState.error.code} errorMessage={AppState.error.message}
                                notificationMessage={AppState.notification.message} noyificationLevel={AppState.notification.level} onErrorClose={self._closeError} />}
                        {/* <Header /> */}
                        <HeaderNew currentRoute={window.location.pathname} />
                        {self.state.LoginStore.user && self.state.LoginStore.user.isVerified && <div><UserAvatarHeader /></div>}
                        {this.renderTaskModal()}
                        {this.props.showCongratulationsPopup && this.getCongratulationsPopup()}
                        {childrenWithProps}
                    </div>
                </ErrorBoundary>
            </MuiThemeProvider>
        );
    }
}

function mapStateToProps() {
    const utilData = UtilModel.getUtilsData();
    const userInstance = UserModel.last();
    return {
        showCongratulationsPopup: utilData.showCongratulationsPopup || false,
        taskId: utilData.taskId,
        title: utilData.title,
        newTask: utilData.newTask,
        isCustomer: userInstance && userInstance.props.role.name === 'Customer'
    };
}

export const App = connect(mapStateToProps)(AppImpl);
