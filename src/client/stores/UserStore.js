import cloneDeep from 'lodash/cloneDeep';
import filter from 'lodash/filter';
import find from 'lodash/find';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import intersectionBy from 'lodash/intersectionBy';
import groupBy from 'lodash/groupBy';
import has from 'lodash/has';
import indexOf from 'lodash/indexOf';
import map from 'lodash/map';
import merge from 'lodash/merge';
import orderBy from 'lodash/orderBy';
import remove from 'lodash/remove';
import moment from 'moment';
import shortid from 'shortid';

import UserAction from '../actions/UserAction.js';
import LoginAction from '../actions/LoginAction.js';
import LoginStore from './LoginStore.js';
import alt from '../alt.js';
import Constant from '../components/helpers/Constant.js';
import { EmployeeModel } from '../model/AppModels/EmployeeModel.js';

import { UserModel } from '../model/UserModel.js';

class UserStore {
    constructor() {
        this.bindActions(UserAction);
        this.clearStore();
    }

    clearStore() {
        this.showForm = false;
        this.isAddUser = false;
        this.isLoading = false;
        this.users = [];
        this.error = {
            employeeCode: '',
            firstName: '',
            lastName: '',
            email: '',
            role: '',
            hourTracker: '',
            title: '',
            picture: '',
            signature: '',
            initials: '',
            titleBlock: '',
            bulkHourTracker: ''
        };
        this.user = {
            isActive: true,
            employeeCode: '',
            firstName: '',
            lastName: '',
            email: '',
            role: '',
            roleLevel: '',
            title: ''
        };
        this.isInputChecked = null;
        this.otherValue = '';
        this.profilePageUser = null;
        this.picture = null;
        this.signature = null;
        this.initials = null;
        this.titleBlock = null;
        this.isEditProfile = false;
        this.activeItem = Constant.USER_PROFILE.MENU_ITEMS.DETAILS;
        this.imagePreviewUrl = 'public/images/user.jpg';
        this.signaturePreviewUrl = '';
        this.initialsPreviewUrl = '';
        this.titleBlockPreviewUrl = '';
        this.hourTrackers = [];
        this.clonedHourTrackers = [];
        this.tasks = [];
        this.isOpenModel = false;
        this.selectedTask = '';
        this.sortData = {
            sortBy: 'date',
            isAscending: false
        };
        this.deleteMode = {
            isDelete: false,
            itemName: null,
            item: null
        };
        this.isDeleteHourTracker = false;
        this.isCroppingImageModalOpen = false;
        this.uploadingImageURL = '';
        this.imageError = false;
        this.cropResult = '';
        this.uploadingType = '';
        this.previewImage = '';
        this.isDayView = true;
        this.isFetchingTask = false;
        this.searchedTasks = [];
        this.searchedScopes = [];
        this.selectedYear = 0;
        this.hourTrackerFirstYear = 0;
        this.hourTrackerLastYear = 0;
        this.selectedMonth = 0;
        this.userTasks = [];
        this.isOpenMultipleEntriesModal = false;
        this.multipleHourTrackers = [];
        this.defaultNumberOfHourTrackerRows = 12;
        this.bulkHourTrackerFormLoading = false;
        this.createObjectsForMultipleHourTrackers();
    }

    createObjectsForMultipleHourTrackers() {
        for (let i = 0; i < this.defaultNumberOfHourTrackerRows; i += 1) {
            this.multipleHourTrackers.push(
                {
                    id: shortid.generate(),
                    date: new Date(moment().add(-1, 'days')),
                    employee: null,
                    task: '',
                    scope: '',
                    searchedScopes: [],
                    revNumber: '',
                    other: '',
                    hoursSpent: '',
                    note: '',
                    isDisabledTask: false,
                    section: i > 5 ? 'firstHalf' : 'secondHalf'
                }
            );
        }
    }

    getUsersSuccess(users) {
        this.users = users;
        this.isLoading = false;
        this.resetUser();
        this.checkAndUpdateManagersAdmin();
    }

    checkAndUpdateManagersAdmin() {
        const updatableUsers = this.users.
        reduce((users, user) => {
            if (user.role.id === Constant.ROLE_ID.MANAGER) {
                users.push({
                    _id: user._id,
                    scopeVisibilityPermission: Constant.SCOPE_PERMISSION_OPTIONS
                })
            } else if (user.role.id === Constant.ROLE_ID.ADMIN) {
                users.push({
                    _id: user._id,
                    canViewPaydayReport: true
                })
            }
            return users;
        }, []);
        if (updatableUsers) {
            UserAction.updateUsers(updatableUsers);
        }
    }

    getUserSuccess(user) {
        this.profilePageUser = user;
        this.isLoading = false;
    }

    toggleEditMode() {
        this.isEditProfile = !this.isEditProfile;
        this.picture = null;
        this.signature = null;
        this.resetError();
    }

    handleMenuItem(name) {
        this.activeItem = name;
    }

    showUpdateUserForm(user) {
        this.resetUser();
        this.showForm = true;
        this.isAddUser = false;
        this.user = cloneDeep(user);
        this.user.role = user.role;
        this.user.roleLevel = user.roleLevel
            ? user.roleLevel
            : '';
        this.imagePreviewUrl = user.picture || 'public/images/user.jpg';
        this.signaturePreviewUrl = user.signature || '';
        this.initialsPreviewUrl = user.initials || '';
        this.titleBlockPreviewUrl = user.titleBlock || '';
    }

    addUserSuccess(user) {
        this.users.push(user);
        this.resetData();
    }
    changeUser(user) {
        this.user = cloneDeep(user);
    }

    updateUserSuccess(updatedUser) {
        let self = this;
        let currentUser = find(self.users, { id: updatedUser.id });
        if (currentUser) {
            this.updateUsersProps(currentUser, updatedUser);
        }
        if (UserModel.last().props.id === updatedUser.id) {
            UserModel.updateCurrentUser(updatedUser);
        }
        if (LoginStore.getState().user._id === updatedUser._id) {
            setTimeout(() => {
                LoginAction.updateLoggedInUserSuccess(currentUser);
            }, 200);
        }
        EmployeeModel.updateEmployee(updatedUser);
        this.profilePageUser = updatedUser;
        this.resetData();
    }

    updateUsersSuccess(updatedUsers) {
        this.users.forEach(currentUser => {
            const updatedUser = updatedUsers.find(updated => updated._id === currentUser._id);
            if (updatedUser) {
                this.updateUsersProps(currentUser, updatedUser);
            }
        });
    }

    updateUsersProps(currentUser, updatedUser) {
        for (let key in updatedUser) {
            currentUser[key] = updatedUser[key];
        }
    }

    setError(payload) {
        this.error[payload.type] = payload.errorMsg;
    }

    setLoader() {
        this.isLoading = true;
    }

    resetUser() {
        this.user = {
            employeeCode: '',
            isActive: true,
            firstName: '',
            lastName: '',
            email: '',
            role: '',
            roleLevel: '',
            title: ''
        };
        this.picture = null;
        this.signature = null;
        this.initials = null;
        this.titleBlock = null;
        this.imagePreviewUrl = 'public/images/user.jpg';
        this.signaturePreviewUrl = '';
        this.initialsPreviewUrl = '';
        this.titleBlockPreviewUrl = '';
        this.resetError();
    }

    resetError() {
        this.error = {
            employeeCode: '',
            firstName: '',
            lastName: '',
            email: '',
            role: '',
            hourTracker: '',
            title: '',
            picture: '',
            signature: '',
            initials: '',
            titleBlock: '',
            imageError: ''
        };
    }

    showAddUserForm() {
        this.showForm = true;
        this.isAddUser = true;
        this.resetUser();
    }

    closeUserForm() {
        this.showForm = false;
        this.resetUser();
    }

    resetData() {
        this.showForm = false;
        this.isLoading = false;
        this.isEditProfile = false;
        this.isDeleteHourTracker = false;
        this.deleteMode = {
            isDelete: false,
            itemName: null,
            item: null
        };
        this.uploadingType = '';
        this.searchedScopes = [];
        this.searchedTasks = [];
        this.isInputChecked = null;
        this.resetUser();
        this.userTasks = [];
        this.isOpenMultipleEntriesModal = false;
        this.multipleHourTrackers = [];
        this.bulkHourTrackerFormLoading = false;
        this.createObjectsForMultipleHourTrackers();
    }

    resetCroppingModal() {
        this.isCroppingImageModalOpen = false;
        this.uploadingType = '';
        this.previewImage = '';
    }

    setDeleteMode(payload) {
        this.deleteMode = payload;
        this.isDeleteHourTracker = true;
    }

    deleteHourTrackerSuccess(deletedHourTracker) {
        let index = indexOf(this.hourTrackers, find(this.hourTrackers, {
            id: deletedHourTracker.id
        }));

        if (index > -1) {
            this.hourTrackers.splice(index, 1);
        }

        this.resetData();
    }

    setProfilePicture(payload) {
        let self = this;
        self.isCroppingImageModalOpen = true;
        self.picture = payload.file;
        self.imagePreviewUrl = payload.imagePreviewUrl;
        self.uploadingImageURL = self.imagePreviewUrl;
        self.uploadingType = 'picture';
    }

    setSignature(payload) {
        let self = this;
        self.isCroppingImageModalOpen = true;
        self.signature = payload.file;
        self.signaturePreviewUrl = payload.signaturePreviewUrl;
        self.uploadingImageURL = self.signaturePreviewUrl;
        self.uploadingType = 'signature';
    }

    setInitials(payload) {
        let self = this;
        self.isCroppingImageModalOpen = true;
        self.initials = payload.file;
        self.initialsPreviewUrl = payload.initialsPreviewUrl;
        self.uploadingImageURL = self.initialsPreviewUrl;
        self.uploadingType = 'initials';
    }

    setTitleBlock(payload) {
        let self = this;
        self.isCroppingImageModalOpen = true;
        self.titleBlock = payload.file;
        self.titleBlockPreviewUrl = payload.titleBlockPreviewUrl;
        self.uploadingImageURL = self.titleBlockPreviewUrl;
        self.uploadingType = 'titleBlock';
    }

    setCropResult(cropResult) {
        let self = this;
        self.cropResult = cropResult;
        let blobObject = this.dataURItoBlob(cropResult);
        blobObject.name = 'tempFile.png';
        self.error[self.uploadingType] = '';
        switch (self.uploadingType) {
            case 'picture':
                self.imagePreviewUrl = self.cropResult;
                self.previewImage = self.imagePreviewUrl;
                self.picture = blobObject;
                break;
            case 'signature':
                self.signaturePreviewUrl = self.cropResult;
                self.previewImage = self.signaturePreviewUrl;
                self.signature = blobObject;
                break;
            case 'initials':
                self.initialsPreviewUrl = self.cropResult;
                self.previewImage = self.initialsPreviewUrl;
                self.initials = blobObject;
                break;
            case 'titleBlock':
                self.titleBlockPreviewUrl = self.cropResult;
                self.previewImage = self.titleBlockPreviewUrl;
                self.titleBlock = blobObject;
                break;
        }
    }

    dataURItoBlob(dataURI) {
        let byteString;
        let mimestring;

        if (dataURI.split(',')[0].indexOf('base64') !== -1) {
            byteString = atob(dataURI.split(',')[1]);
        } else {
            byteString = decodeURI(dataURI.split(',')[1]);
        }

        mimestring = dataURI.split(',')[0].split(':')[1].split(';')[0];

        let content = [];
        for (let i = 0; i < byteString.length; i += 1) {
            content[i] = byteString.charCodeAt(i);
        }
        return new Blob([new Uint8Array(content)], { type: mimestring }, { name: 'tempFile.png' });
    }

    getHourTrackersSuccess(data) {
        this.hourTrackers = data.hourTrackers;
        this.clonedHourTrackers = cloneDeep(data.hourTrackers);
        this.isLoading = false;
        this.selectedYear = parseInt(data.year);
        this.hourTrackerFirstYear = moment(data.oldestDate).year();
        this.hourTrackerLastYear = moment(data.latestDate).year();
        this.selectedMonth = parseInt(data.month);
    }

    changeHourSpent(payload) {
        let hourTracker = find(this.hourTrackers, { id: payload.hourTracker.id });
        if (hourTracker) {
            hourTracker.hoursSpent = payload.hoursSpent;
        }
    }

    changeNote(payload) {
        let hourTracker = find(this.hourTrackers, { id: payload.hourTracker.id });
        if (hourTracker) {
            hourTracker.note = payload.note;
        }
    }

    updateHourSpent = (payload) => {
        this.hourTrackers.map(hourTracker => {
            if (hourTracker.id === payload.hourTracker.id) {
                hourTracker.hoursSpent = payload.updatedHoursSpent
            }
        })
    };

    updateHourTrackerSuccess(updatedHourTracker) {
        this.isLoading = false;
        if (this.selectedYear === moment(updatedHourTracker.date).year() && this.selectedMonth === moment(updatedHourTracker.date).month()) {
            let oldHourTracker = find(this.hourTrackers, { id: updatedHourTracker.id });
            merge(oldHourTracker, updatedHourTracker);
            this.clonedHourTrackers = cloneDeep(this.hourTrackers);
        } else {
            remove(this.hourTrackers, (hourTracker) => {
                return hourTracker.id === updatedHourTracker.id;
            });
        }

        /* updatedHourTracker.task = oldHourTracker.task;
        updatedHourTracker.scope = oldHourTracker.scope;

        let index = indexOf(this.hourTrackers, oldHourTracker);
        this.hourTrackers.splice(index, 1, updatedHourTracker);*/
    }

    updateHourTrackerBySocketSuccess(payload) {
        let oldHourTracker = find(this.hourTrackers, { id: payload.hourTracker.id });
        merge(oldHourTracker, payload.hourTracker);
    }

    getTasksSuccess(tasks) {
        this.tasks = tasks;
    }

    toggleModel(isOpen) {
        this.isOpenModel = isOpen;
        if (!isOpen) {
            this.resetError();
            this.selectedTask = '';
        }
    }

    toggleTaskView(isInputChecked) {
        this.isInputChecked = isInputChecked;
    }

    resetCheckBoxValues() {
        this.isInputChecked = null;
    }

    // updateSelectedTask(task) {
    //     console.log('task', task, get(this.userTasks, task), orderBy(get(this.userTasks, task), 'createdAt', 'desc'));
    //     this.selectedTask = task;
    //     this.searchedScopes = orderBy(get(this.userTasks, task), 'createdAt', 'desc');
    // }

    updateSelectedTask(task) {
        this.selectedTask = task;
        this.searchedScopes = get(this.userTasks, task).scopes || [];
    }

    updateOtherValue(value) {
        this.otherValue = value;
    }

    // addHourTrackerSuccess(payload) {
    //     if (payload.task && payload.scope) {
    //         payload.hourTracker.task = payload.task;
    //         payload.hourTracker.scope = payload.scope;
    //     }
    //     if (this.selectedYear === moment(payload.hourTracker.date).year() && this.selectedMonth === moment(payload.hourTracker.date).month()) {
    //         this.hourTrackers.push(payload.hourTracker);
    //     }
    //     this.isLoading = false;
    //     this.isOpenModel = false;
    //     this.resetError();
    //     this.resetCheckBoxValues();
    //     this.selectedTask = '';
    //     this.clonedHourTrackers = cloneDeep(this.hourTrackers);
    // }

    addHourTrackerSuccess(hourTracker) {
        this.isLoading = false;
        this.isOpenModel = false;
        this.resetError();
        this.resetCheckBoxValues();
        this.selectedTask = '';
        if (this.selectedYear === moment(hourTracker.date).year() && this.selectedMonth === moment(hourTracker.date).month()) {
            this.hourTrackers.push(hourTracker);
        }
    }

    filterHourTracker(query) {
        this.hourTrackers = cloneDeep(this.clonedHourTrackers);
        this.hourTrackers = filter(this.hourTrackers, (hourTracker) => {
            let name = new RegExp(query, 'i').test(hourTracker.employee.firstName + ' ' + hourTracker.employee.lastName);
            let hoursSpent = new RegExp(query, 'i').test(hourTracker.hoursSpent);
            let note = new RegExp(query, 'i').test(hourTracker.note);
            let date = new RegExp(query, 'i').test(moment(hourTracker.date).format('M/D/YY'));
            let taskNumber = hourTracker.task && new RegExp(query, 'i').test(new Date(hourTracker.task.createdAt).getFullYear().toString().substr(2, 2) + '-' + hourTracker.task.taskNumber);
            let client = hourTracker.task && new RegExp(query, 'i').test(hourTracker.task.contractor.name);
            let scope = hourTracker.scope && new RegExp(query, 'i').test('Scope ' + hourTracker.scope.number);
            let other = hourTracker.other && new RegExp(query, 'i').test(hourTracker.other);

            return name || hoursSpent || note || date || taskNumber || client || scope || other;
        });

        if (!query.length) {
            this.hourTrackers = cloneDeep(this.clonedHourTrackers);
        }
    }

    sortHourTrackers(sortBy) {
        this.sortData.sortBy = sortBy;
        this.sortData.isAscending = !this.sortData.isAscending;
    }

    toggleImageError(value) {
        let self = this;
        self.error.imageError = value;
    }

    showImage(imageType) {
        let self = this;
        self.isCroppingImageModalOpen = true;
        switch (imageType) {
            case 'picture':
                self.previewImage = self.imagePreviewUrl;
                break;
            case 'signature':
                self.previewImage = self.signaturePreviewUrl;
                break;
            case 'initials':
                self.previewImage = self.initialsPreviewUrl;
                break;
            case 'titleBlock':
                self.previewImage = self.titleBlockPreviewUrl;
                break;
        }
    }

    toggleTotalHoursView(isDayViewChecked) {
        this.isDayView = isDayViewChecked;
    }

    searchTaskSuccess(tasks) {
        // this.userTasks = {};
        const self = this;
        forEach(tasks, (task) => {
            if (!has(self.userTasks, task.id)) {
                task.scopes = map(task.scopes, (scope) => {
                    scope.task = task;
                    return scope;
                });
                self.userTasks[task.id] = task.scopes;
            }
        });
        // this.searchedTasks = tasks;
        this.toggleFetchingTask();
        this.searchedScopes = [];
        this.selectedTask = '';
    }

    searchScopesSuccess(scopes) {
        this.searchedScopes = scopes;
        this.searchedScopes = orderBy(this.searchedScopes, 'number', 'asc');
        this.isLoading = false;
        this.toggleFetchingScopes();
    }

    toggleFetchingTask() {
        this.isFetchingTask = !this.isFetchingTask;
    }

    getUserScopesSuccess(scopes) {
        this.userTasks = groupBy(scopes, (scope) => {
            return scope.task.id;
        });
        this.isFetchingTask = false;
        this.searchedScopes = [];
        this.selectedTask = '';
    }

    getUserTasksSuccess(tasks) {
        this.userTasks = tasks;
        this.isFetchingTask = false;
        this.searchedScopes = [];
        this.selectedTask = '';
    }

    toggleMultipleEntriesModal(isOpen) {
        this.isOpenMultipleEntriesModal = isOpen;
        if (!isOpen) {
            this.resetError();
            this.selectedTask = '';
        }
    }
    /**
     * Change date of all hourTrackers
     * @param {*} Data
     */
    changeHourTrackerDate(Data) {
        this.multipleHourTrackers.map((hourTracker) => {
            if (Data.section === hourTracker.section) {
                hourTracker.date = new Date(Data.date);
            }
        });
    }

    changeSelectedTaskForBulkEntry(data) {
        let hourTracker = find(this.multipleHourTrackers, (currentHourTracker) => {
            return currentHourTracker.id === data.id;
        });
        if (hourTracker) {
            if (data.task) {
                hourTracker.task = data.task;
                hourTracker.searchedScopes = orderBy(data.scopes, 'number', 'asc');
            } else {
                hourTracker.searchedScopes = [];
            }
        }
    }

    changeSelectedScopeForBulkEntry(data) {
        let hourTracker = find(this.multipleHourTrackers, (currentHourTracker) => {
            return currentHourTracker.id === data.id;
        });
        if (hourTracker) {
            hourTracker.scope = data.scope;
        }
    }

    changeRevNumberForBulkEntry(data) {
        let hourTracker = find(this.multipleHourTrackers, (currentHourTracker) => {
            return currentHourTracker.id === data.id;
        });
        if (hourTracker) {
            hourTracker.revNumber = data.revNumber;
        }
    }

    changeOtherForBulkEntry(data) {
        let hourTracker = find(this.multipleHourTrackers, (currentHourTracker) => {
            return currentHourTracker.id === data.id;
        });
        if (hourTracker) {
            hourTracker.other = data.other;
        }
    }

    changeHoursSpentForBulkEntry(data) {
        let hourTracker = find(this.multipleHourTrackers, (currentHourTracker) => {
            return currentHourTracker.id === data.id;
        });
        if (hourTracker) {
            hourTracker.hoursSpent = data.hoursSpent;
        }
    }

    changeNoteForBulkEntry(data) {
        let hourTracker = find(this.multipleHourTrackers, (currentHourTracker) => {
            return currentHourTracker.id === data.id;
        });
        if (hourTracker) {
            hourTracker.note = data.note;
        }
    }

    addHourTrackerRow(hourTracker) {
        let newHourTracker = hourTracker;
        let index = indexOf(this.multipleHourTrackers, find(this.multipleHourTrackers, { id: hourTracker.id }));
        newHourTracker.id = shortid.generate() + shortid.generate();
        newHourTracker.hoursSpent = '';
        newHourTracker.note = '';
        this.multipleHourTrackers.splice(index + 1, 0, newHourTracker);
    }

    deleteHourTrackerRow(hourTracker) {
        let firstHalf = this.multipleHourTrackers.filter(hourTrackers => hourTrackers.section === 'firstHalf');
        let secondHalf = this.multipleHourTrackers.filter(hourTrackers => hourTrackers.section === 'secondHalf');

        if (hourTracker.section === 'firstHalf' && firstHalf.length > 1) {
            let index = indexOf(this.multipleHourTrackers, find(this.multipleHourTrackers, { id: hourTracker.id }));
            this.multipleHourTrackers.splice(index, 1);
        } else if (hourTracker.section === 'secondHalf' && secondHalf.length > 1) {
            let index = indexOf(this.multipleHourTrackers, find(this.multipleHourTrackers, { id: hourTracker.id }));
            this.multipleHourTrackers.splice(index, 1);
        }
    }

    setBulkHourTrackerFormLoader(value) {
        this.bulkHourTrackerFormLoading = value;
    }

    addMultipleHourTrackersSuccess(multipleHourTrackers) {
        forEach(multipleHourTrackers, (hourTracker) => {
            if (this.selectedYear === moment(hourTracker.date).year() && this.selectedMonth === moment(hourTracker.date).month()) {
                this.hourTrackers.push(hourTracker);
            }
        });
        this.clonedHourTrackers = cloneDeep(this.hourTrackers);
        this.resetData();
    }

    changeTaskOrOtherPreference(data) {
        let hourTracker = find(this.multipleHourTrackers, (currentHourTracker) => {
            return currentHourTracker.id === data.id;
        });
        if (hourTracker) {
            if (data.isChecked) {
                hourTracker.isDisabledTask = true;
                hourTracker.task = '';
                hourTracker.scope = '';
                hourTracker.revNumber = '';
            } else {
                hourTracker.isDisabledTask = false;
                hourTracker.other = '';
            }
        }
    }

    removeBlankHourTrackerRows(newMultipleHourTrackers) {
        this.multipleHourTrackers = newMultipleHourTrackers;
    }
}
export default alt.createStore(UserStore, 'UserStore');
