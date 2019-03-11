import cookie from 'react-cookie';
import moment from 'moment';
import { hashHistory } from 'react-router';
import find from 'lodash/find';
import merge from 'lodash/merge';
import { UserModel } from '../model/UserModel';
import alt from '../alt.js';
import Constant from '../components/helpers/Constant.js';

import LoginAction from '../actions/LoginAction.js';
import AppAction from '../actions/AppAction.js';
import { HourTrackerModel } from '../model/AppModels/HourTrackerModel';
import { UtilModel } from '../model/AppModels/UtilModel';

class LoginStore {
    constructor() {
        this.bindActions(LoginAction);
        this.clearStore();
    }
    clearStore() {
        this.user = null;
        this.token = null;
        this.error = {
            email: '',
            password: '',
            newPassword: '',
            confirmPassword: ''
        };
        this.isLoading = false;
        this.isForgetPassword = false;
        this.isNewPasswordSuccess = false;
        this.isResetPasswordSuccess = false;
        this.isEditProfile = false;
        this.activeItem = 'profile details';
        this.userPicture = null;
        this.officeEvents = [];
        this.startDate = moment();
        this.endDate = moment();
        this.isCalendarLoading = false;
        this.calendarVisible = false;
        this.slackAuthUrl = '';
        this.isSlackPresent = false;
        this.isChangePasswordSuccess = false;
        this.socket = null;
    }

    getNewPasswordSuccess() {
        this.isLoading = false;
        this.isNewPasswordSuccess = true;
        hashHistory.push('/');
    }

    resetPasswordSuccess() {
        this.isLoading = false;
        this.resetFormError();
        this.isResetPasswordSuccess = true;
    }

    loginSuccess(data) {
        this.user = data.user;
        new UserModel(data.user).$save();
        UtilModel.showLoginLoader(false);
        this.token = data.token;
        localStorage.setItem(Constant.COOKIES.AUTH_TOKEN, data.token);
        // if (this.user.role.name === 'Customer' && this.user.roleLevel.name === 'Contractor') {
        //     setTimeout(() => {
        //         hashHistory.push('/customer-home');
        //     }, 10);
        // } else {
        setTimeout(() => {
            hashHistory.push('/');
        }, 10);
        // }
        this.resetFormError();
        this.isLoading = false;
        AppAction.getMasterData();
    }

    resetData() {
        this.isLoading = false;
        this.resetFormError();
        this.isEditProfile = false;
        this.userPicture = null;
        this.isCalendarLoading = false;
    }

    goToLoginPage() {
        this.isNewPasswordSuccess = false;
        this.isForgetPassword = false;
        if (this.isResetPasswordSuccess) {
            hashHistory.push('/login');
        }
    }

    forgetPassword(val) {
        this.isForgetPassword = val;
        this.resetFormError();
    }

    isLoading() {
        this.isLoading = true;
    }

    logout() {
        this.clearCookies();
        this.clearStore();
        window.location = '/login';
    }

    setError(error) {
        this.error = error;
        this.isLoading = false;
    }

    changePasswordSuccess(user) {
        user.permissions = this.user.permissions;
        this.user = user;
        this.resetFormError();
        this.isLoading = false;
        this.isChangePasswordSuccess = true;
    }

    closeSuccessModal() {
        this.isChangePasswordSuccess = false;
        this.logout();
    }

    getLoggedInUserSuccess(payload) {
        this.user = payload.user;
        new UserModel(payload.user).$save();
        if (this.user.todaysHourTrackers) {
            HourTrackerModel.saveAll(this.user.todaysHourTrackers.map(item => new HourTrackerModel(item)));
        }
        setTimeout(() => {
            hashHistory.push(payload.redirectUri);
        }, 100);
    }

    addHours({ urgentHours, nonUrgentHours }) {
        this.user.urgentHours = this.user.urgentHours + urgentHours;
        this.user.nonUrgentHours = this.user.nonUrgentHours + nonUrgentHours;
    }

    subtractHours({ urgentHours, nonUrgentHours }) {
        this.user.urgentHours = this.user.urgentHours - urgentHours;
        this.user.nonUrgentHours = this.user.nonUrgentHours - nonUrgentHours;
    }

    updateLoggedInUserSuccess(user) {
        if(user && this.user){
            user.permissions = this.user.permissions;
            merge(this.user, user);
            this.resetData();
        }
    }

    resetFormError() {
        this.error = {
            email: '',
            password: '',
            newPassword: '',
            confirmPassword: ''
        };
    }

    getOfficeAuthUrlSuccess(authUrl) {
        window.location = authUrl;
    }

    getOfficeAccessTokenSuccess() {
        // if (this.user.role.name === 'Customer' && this.user.roleLevel.name === 'Contractor') {
        //     hashHistory.push('/customer-home');
        // } else {
        // hashHistory.push('/');
        // window.location.pathname = '/';
        // }
    }

    toggleEditMode() {
        this.isEditProfile = !this.isEditProfile;
    }

    handleMenuItem(name) {
        this.activeItem = name;
    }

    onChangePicture(file) {
        this.userPicture = file;
    }

    getOffice365EventsSuccess(payload) {
        this.officeEvents = payload.events;
        this.startDate = payload.startDate;
        this.endDate = payload.endDate;
        this.toggleCalendarLoading();
    }

    toggleCalendarLoading() {
        this.isCalendarLoading = !this.isCalendarLoading;
    }

    toggleCalendarVisibility() {
        this.calendarVisible = !this.calendarVisible;
    }

    getSlackAuthUrlSuccess(url) {
        this.slackAuthUrl = url;
    }

    getSlackAccessTokenSuccess(user) {
        if (!this.user.slackId) {
            this.user.slackId = user.slackID;
        }
        this.isSlackPresent = true;
        hashHistory.push('/');
    }

    clearCookies() {
        localStorage.removeItem(Constant.COOKIES.AUTH_TOKEN);
        cookie.remove(Constant.COOKIES.OFFICE_ACCESS_TOKEN);
        cookie.remove(Constant.COOKIES.OFFICE_REFRESH_TOKEN);
        cookie.remove(Constant.COOKIES.SLACK_ACCESS_TOKEN);
    }

    setUnreadMessages(paylaod) {
        this.user.ims = paylaod.ims;
        this.user.channels = paylaod.channels;
    }

    setRecievedMessage(msg) {
        let channel = find(this.user.channels, (channel) => {
            return msg.channel === channel.id;
        });

        if (channel) {
            channel.unread_count += 1;
        } else {
            let im = find(this.user.ims, (im) => {
                return msg.user === im.user && msg.user !== this.user.slackId;
            });

            if (im) {
                im.unread_count += 1;
            }
        }
    }

    setReadMessages(msg) {
        let im = find(this.user.ims, (im) => {
            return msg.channel === im.id;
        });

        if (im) {
            im.unread_count = 0;
        }
    }

    addNewIm(im) {
        this
            .user
            .ims
            .push(im);
    }

    setChannelMarked(channelData) {
        let channel = find(this.user.channels, (channel) => {
            return channelData.channel === channel.id;
        });

        if (channel) {
            channel.unread_count = 0;
        }
    }

    setSocket(socket) {
        this.socket = socket;
    }

    changeReportModalStatus(status) {
        this.reportModalStatus = status;
        this.isOpenedReportModal = true;
    }

    updateTotalHours({ urgentHours, nonUrgentHours }) {
        this.user.urgentHours = urgentHours;
        this.user.nonUrgentHours = nonUrgentHours;
    }
}

export default alt.createStore(LoginStore, 'LoginStore');
