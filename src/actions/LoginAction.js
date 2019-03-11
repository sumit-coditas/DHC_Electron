import alt from '../alt.js';

import RequestHandler from '../components/helpers/RequestHandler.js';
import Constant from '../components/helpers/Constant.js';

import AppAction from '../actions/AppAction.js';
import { UtilModel } from '../model/AppModels/UtilModel.js';

class LoginAction {
    constructor() {
        this.generateActions(
            'clearStore',
            'closeSuccessModal',
            'onChangePicture',
            'toggleEditMode',
            'handleMenuItem',
            'changePasswordSuccess',
            'updateLoggedInUserSuccess',
            'goToLoginPage',
            'resetPasswordSuccess',
            'getNewPasswordSuccess',
            'forgetPassword',
            'loginSuccess',
            'resetData',
            'logout',
            'setError',
            'isLoading',
            'getLoggedInUserSuccess',
            'getOfficeAuthUrlSuccess',
            'getOfficeAccessTokenSuccess',
            'getOffice365EventsSuccess',
            'toggleCalendarLoading',
            'toggleCalendarVisibility',
            'getSlackAuthUrlSuccess',
            'getSlackAccessTokenSuccess',
            'clearCookies',
            'setUnreadMessages',
            'setRecievedMessage',
            'setReadMessages',
            'addNewIm',
            'setChannelMarked',
            'setSocket',
            'changeReportModalStatus',
            'subtractHours',
            'addHours',
            'updateTotalHours'
        );
    }

    login(email, password) {
        let self = this;

        let url = 'users/login';
        let data = {
            email: email,
            password: password
        };
        RequestHandler.post(url, data).then((data) => {
            self.loginSuccess(data);
        }).catch((error) => {
            UtilModel.showLoginLoader(false);
            self.resetData();
        });
    }

    changePassword(newPassword, oldPassword, userId) {
        let url = 'users/password';
        let self = this;
        let data = {
            newPassword: newPassword,
            userId: userId,
            isVerified: true,
            oldPassword: oldPassword
        };

        RequestHandler.put(url, data).then((data) => {
            UtilModel.showLoginLoader(false);
            self.changePasswordSuccess(data);
        }).catch((error) => {
            UtilModel.showLoginLoader(false);
            self.resetData();
        });
    }

    getNewPassword(email) {
        let self = this;
        let url = 'users/forgot';
        let data = {
            email: email
        };
        RequestHandler.post(url, data).then((data) => {
            UtilModel.showLoginLoader(false);
            self.getNewPasswordSuccess();
        }).catch((error) => {
            UtilModel.showLoginLoader(false);
            self.resetData();
        });
    }

    resetPassword(newPassword, token) {
        let self = this;
        let url = 'users/reset/' + token;
        let data = {
            password: newPassword
        };
        RequestHandler.post(url, data).then((data) => {
            UtilModel.showLoginLoader(false);
            self.resetPasswordSuccess();
        }).catch((error) => {
            UtilModel.showLoginLoader(false);
            self.resetData();
        });
    }

    getLoggedInUser(authToken, redirectUri) {
        let self = this;
        let url = 'users/getLoggedInUser';
        let data = {
            authToken: authToken
        };

        RequestHandler.post(url, data).then((user) => {
            self.getLoggedInUserSuccess({ user: user, redirectUri: redirectUri });
        });
    }

    updateLoggedInUser(userData, loggedInUserId, notificationMsg) {
        let self = this;
        let url = 'users/' + loggedInUserId;
        RequestHandler
            .put(url, userData)
            .then((user) => {
                AppAction.showNotification({
                    message: notificationMsg,
                    level: Constant.NOTIFICATION_LEVELS.SUCCESS
                });
                self.updateLoggedInUserSuccess(user);
            })
            .catch((err) => {
                self.resetData();
            });
    }

    getOfficeAuthUrl() {
        let url = 'office/authUrl';

        RequestHandler.get(url).then((data) => {
            this.getOfficeAuthUrlSuccess(data);
        });
    }

    getOfficeAccessToken(code) {
        let url = 'office/login/' + code;

        RequestHandler.get(url).then(() => {
            this.getOfficeAccessTokenSuccess();
        });
    }

    getOffice365Events(startDate, endDate) {
        let formattedStartDate = startDate.format('YYYY-MM-DDTHH:mm:ss');
        let formattedEndDate = endDate.format('YYYY-MM-DDTHH:mm:ss');
        let url = 'office/events/' + formattedStartDate + '/' + formattedEndDate;
        let self = this;

        RequestHandler.get(url).then((events) => {
            self.getOffice365EventsSuccess({ events: events, startDate: startDate, endDate: endDate });
        }).catch(() => {
            self.resetData();
        });
    }

    getSlackAuthUrl() {
        let url = 'slack/authUrl';

        RequestHandler.get(url).then((data) => {
            this.getSlackAuthUrlSuccess(data);
        });
    }

    getSlackAccessToken(code, userId) {
        let self = this;
        let url = 'slack/login/' + code + '/' + userId;

        RequestHandler.get(url).then((user) => {
            self.getSlackAccessTokenSuccess(user);
        });
    }

    getTotalHours(userId) {
        let self = this;
        const url = `users/${userId}/totalHours`;
        RequestHandler.get(url)
            .then(result => {
                self.updateTotalHours(result);
            })
            .catch(e => console.log(e));
    }

    updateTotalUrgentHours(newValue, oldValue, scope, userId) {
        let self = this;
        let urgentHours = 0;
        let nonUrgentHours = 0;
        if (scope.engineerDetails.engineer._id === userId) {
            urgentHours = scope.engineerDetails.urgentHours;
            nonUrgentHours = scope.engineerDetails.nonUrgentHours;
        } else if (scope.drafterDetails.drafter._id === userId) {
            urgentHours = scope.drafterDetails.urgentHours;
            nonUrgentHours = scope.drafterDetails.nonUrgentHours;
        } else if (scope.managerDetails.manager._id === userId) {
            urgentHours = scope.managerDetails.urgentHours;
            nonUrgentHours = scope.managerDetails.nonUrgentHours;
        }
        if (oldValue === 'Complete') {
            self.addHours({ urgentHours, nonUrgentHours });
        } else if (newValue === 'Complete') {
            self.subtractHours({ urgentHours, nonUrgentHours });
        }
    }
}

export default alt.createActions(LoginAction);
