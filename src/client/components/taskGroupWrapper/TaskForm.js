import React from 'react';
import map from 'lodash/map';
import forEach from 'lodash/forEach';
import cloneDeep from 'lodash/cloneDeep';
import filter from 'lodash/filter';
import find from 'lodash/find';
import sortBy from 'lodash/sortBy';
import debounce from 'lodash/debounce';

import ReactDOM from 'react-dom';
import {
    Form,
    Button,
    Message,
    Divider,
    Icon,
    Modal,
    Label,
    Dimmer,
    Loader,
    Table,
    Dropdown,
    Header,
    Popup
} from 'semantic-ui-react';
import DatePicker from 'material-ui/DatePicker';
import moment from 'moment';
import Select from 'react-select';

import Constant from './../helpers/Constant.js';
import { compareData } from './../helpers/Utility.js';

import TaskAction from './../../actions/TaskAction.js';
import AppAction from './../../actions/AppAction.js';

import AppStore from './../../stores/AppStore.js';
import TaskStore from './../../stores/TaskStore.js';
import LoginStore from './../../stores/LoginStore.js';

export default class TaskForm extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = this.getPropsfromStores();
        this.onChange = this.onChange.bind(this);
        this._handleProjectNameClick = this._handleProjectNameClick.bind(this);
        this.contractorName = null;
        this.projectName = null;
    }
    getPropsfromStores() {
        let state = {
            TaskStore: cloneDeep(TaskStore.getState()),
            LoginStore: cloneDeep(LoginStore.getState()),
            AppStore: cloneDeep(AppStore.getState()),
            isLoading: false,
            scopeToBeUpdated: []
        };
        return state;
    }

    onChange(state) {
        const newState = cloneDeep(this.state);
        newState[state.displayName] = cloneDeep(state);
        this.setState(newState);
    }

    /**TODO
     * Update old Price and Date in local storage to change Productivity report table
     * @param {string} entityType
     */

    shouldComponentUpdate(nextProps, nextState) {
        const shouldRender = compareData(
            { ...this.state.LoginStore, ...this.state.AppStore, ...this.state.TaskStore },
            { ...nextState.LoginStore, ...nextState.AppStore, ...nextState.TaskStore },
            [
                'selectedTask',
                'syncContractData',
                'archivedScopes',
                'office365Contacts',
                'office365Contractors',
                'isFetchingContacts',
                'isFetchingContractors',
                'error',
                'duplicateProjectName',
                'loader.taskForm',
                'loader.archivedData',
                'loaderText',
                'isOpenViewArchivedScopeModal',
                'loader.restoreScope',
                'itemTypes',
                'users',
                'user'
            ]);
        return shouldRender;
    }

    componentDidMount() {
        TaskStore.listen(this.onChange);
        LoginStore.listen(this.onChange);
        AppStore.listen(this.onChange);
        if (this.props.isAddTask && this.refs.contractor) {
            this.refs.contractor.open();
        }
    }

    componentWillUnmount() {
        TaskStore.unlisten(this.onChange);
        LoginStore.unlisten(this.onChange);
        AppStore.unlisten(this.onChange);
    }

    _formatDate = (date) => {
        let dateString = '';
        let formattedDate = moment(date);

        dateString += formattedDate.format('M/D/YY');
        return dateString;
    };

    _addScopeAndPrice = (event) => {
        event.target.blur();
        event.stopPropagation();
        TaskAction.addScopeAndPrice();
    };

    _deleteScopeAndPrice = (id) => {
        TaskAction.deleteScopeAndPrice(id);
    };

    _archiveScope = (scope) => {
        TaskAction.setDeleteMode({
            isDelete: true,
            itemName: 'Scope',
            item: {
                scope: scope
            }
        });
    };

    _handleFocusOnButtons = (event) => {
        let target = event.target || event.srcElement;
        if (target.nodeName === 'A') {
            target.style.color = 'red';
        } else {
            target.style.backgroundColor = 'red';
        }

        event.stopPropagation();
    };

    _handleOnBlurOnButtons = (event) => {
        let target = event.target || event.srcElement;

        if (target.textContent === 'Submit') {
            target.style.backgroundColor = '#2185D0';
        } else if (target.textContent === 'Cancel') {
            target.style.backgroundColor = '#1B1C1D';
        } else {
            target.style.color = '#4183C4';
        }
        event.stopPropagation();
    };

    _closeTaskModal = () => {
        TaskAction.closeTaskModal();
        TaskAction.clearDuplicateProjectName();
    };

    _resetData = () => {
        TaskAction.resetData();
    };

    _validateTaskForm = ({ formData }) => {
        let selectedTaskScopes = filter(this.state.TaskStore.selectedTask.scopes, (scope) => {
            return !scope.parent;
        });
        let error = false;
        if (!formData.name.replace(/[\s]+/g, '') || !formData.contractor || !formData.city.replace(/[\s]+/g, '') || !formData.state.replace(/[\s]+/g, '')) {
            TaskAction.setError({ errorMsg: 'Please fill all the fields mark with *', type: 'taskForm' });
            error = true;
        }
        forEach(selectedTaskScopes, (scope, index) => {
            if (!formData['scope' + scope.id] || !formData['scopeNote' + scope.id] ||
                !formData['engineer' + scope.id] || !formData['engineeringUrgentHours' + scope.id] ||
                !formData['engineeringNonUrgentHours' + scope.id] || !formData['price' + scope.id] ||
                !formData['dueDate' + scope.id] || !formData['itemType' + scope.id] ||
                !formData['engineerStatus' + scope.id]) {
                TaskAction.setError({ errorMsg: 'Please fill all the fields mark with *', type: 'taskForm' });
                error = true;
                return;
            }

            if (isNaN(formData['price' + scope.id])) {
                TaskAction.setError({ errorMsg: Constant.NOTIFICATION_MESSAGES.SCOPE.PRICE.NOT_A_NUMBER, type: 'taskForm' });
                error = true;
                return;
            }

            if (parseFloat(formData['price' + scope.id]) < 0) {
                TaskAction.setError({ errorMsg: Constant.NOTIFICATION_MESSAGES.SCOPE.PRICE.RANGE_ERROR, type: 'taskForm' });
                error = true;
                return;
            }

            if (isNaN(formData['engineeringUrgentHours' + scope.id])) {
                TaskAction.setError({ errorMsg: Constant.NOTIFICATION_MESSAGES.SCOPE.URGENT_HOURS.NOT_A_NUMBER, type: 'taskForm' });
                error = true;
                return;
            }

            if (!(parseFloat(formData['engineeringUrgentHours' + scope.id]) >= 0 && parseFloat(formData['engineeringUrgentHours' + scope.id]) < 1000)) {
                TaskAction.setError({ errorMsg: Constant.NOTIFICATION_MESSAGES.SCOPE.URGENT_HOURS.RANGE_ERROR, type: 'taskForm' });
                error = true;
                return;
            }

            if (isNaN(formData['engineeringNonUrgentHours' + scope.id])) {
                TaskAction.setError({ errorMsg: Constant.NOTIFICATION_MESSAGES.SCOPE.NON_URGENT_HOURS.NOT_A_NUMBER, type: 'taskForm' });
                error = true;
                return;
            }

            if (!(parseFloat(formData['engineeringNonUrgentHours' + scope.id]) >= 0 && parseFloat(formData['engineeringNonUrgentHours' + scope.id]) < 1000)) {
                TaskAction.setError({ errorMsg: Constant.NOTIFICATION_MESSAGES.SCOPE.NON_URGENT_HOURS.RANGE_ERROR, type: 'taskForm' });
                error = true;
                return;
            }

            if (formData['draftingUrgentHours' + scope.id]) {
                if (isNaN(formData['draftingUrgentHours' + scope.id])) {
                    TaskAction.setError({ errorMsg: Constant.NOTIFICATION_MESSAGES.SCOPE.URGENT_HOURS.NOT_A_NUMBER, type: 'taskForm' });
                    error = true;
                    return;
                }
                if (!(parseFloat(formData['draftingUrgentHours' + scope.id]) >= 0 && parseFloat(formData['draftingUrgentHours' + scope.id]) < 1000)) {
                    TaskAction.setError({ errorMsg: Constant.NOTIFICATION_MESSAGES.SCOPE.URGENT_HOURS.RANGE_ERROR, type: 'taskForm' });
                    error = true;
                    return;
                }
                if (1 / parseFloat(formData['draftingUrgentHours' + scope.id]) === -Infinity) {
                    TaskAction.setError({ errorMsg: Constant.NOTIFICATION_MESSAGES.SCOPE.URGENT_HOURS.RANGE_ERROR, type: 'taskForm' });
                    error = true;
                    return;
                }
            }

            if (formData['draftingNonUrgentHours' + scope.id]) {
                if (isNaN(formData['draftingNonUrgentHours' + scope.id])) {
                    TaskAction.setError({ errorMsg: Constant.NOTIFICATION_MESSAGES.SCOPE.NON_URGENT_HOURS.NOT_A_NUMBER, type: 'taskForm' });
                    error = true;
                    return;
                }
                if (!(parseFloat(formData['draftingNonUrgentHours' + scope.id]) >= 0 && parseFloat(formData['draftingNonUrgentHours' + scope.id]) < 1000)) {
                    TaskAction.setError({ errorMsg: Constant.NOTIFICATION_MESSAGES.SCOPE.NON_URGENT_HOURS.RANGE_ERROR, type: 'taskForm' });
                    error = true;
                    return;
                }
                if (1 / parseFloat(formData['draftingNonUrgentHours' + scope.id]) === -Infinity) {
                    TaskAction.setError({ errorMsg: Constant.NOTIFICATION_MESSAGES.SCOPE.NON_URGENT_HOURS.RANGE_ERROR, type: 'taskForm' });
                    error = true;
                    return;
                }
            }

            if (formData['scopeNote' + scope.id]) {
                if (formData['scopeNote' + scope.id].replace(/\s\s+/g, ' ').trim() === '') {
                    TaskAction.setError({ errorMsg: Constant.NOTIFICATION_MESSAGES.SCOPE.NOTE.REQUIRED, type: 'taskForm' });
                    error = true;
                    return;
                }
                if (formData['scopeNote' + scope.id].trim().length > 16) {
                    TaskAction.setError({ errorMsg: Constant.NOTIFICATION_MESSAGES.SCOPE.NOTE.LENGTH, type: 'taskForm' });
                    error = true;

                }
            }
        });

        if (error) {
            ReactDOM.findDOMNode(this.refs.show_error).scrollIntoView();
            return false;
        }
        return true;
    };

    _changeDefinition = (scope, event) => {
        TaskAction.changeDefinition({
            scope: scope,
            value: event.target.value
        });
        this.updateScopesToBeUpdated(scope);
    };

    _changeScopeNote = (scope, event) => {
        TaskAction.changeFormScopeNote({
            scope: scope,
            value: event.target.value.replace(/\s\s+/g, ' '),
            loggedInUserID: this.state.LoginStore.user.id
        });
        this.updateScopesToBeUpdated(scope);
    };

    _changeScopePrice = (scope, event) => {
        TaskAction.changeFormScopePrice({
            scope: scope,
            value: event.target.value
        });
        this.updateScopesToBeUpdated(scope);
    };

    _changeDueDate = (scope, event, date) => {
        let updatedDate = new Date(date).toUTCString();
        TaskAction.changeDueDate({
            scope: scope,
            value: updatedDate,
            isChangingFromForm: true
        });
        this.updateScopesToBeUpdated(scope);
    };

    _changeItemType = (scope, selectedOption) => {
        let itemType = find(this.state.AppStore.itemTypes, (itemTypeToFind) => {
            return itemTypeToFind._id === selectedOption.value;
        });
        TaskAction.changeScopeItemType({
            scope: scope,
            value: cloneDeep(itemType)
        });
        this.updateScopesToBeUpdated(scope);
    };

    _changeCustomerContact = (scope, selectedOption) => {
        let selectedTaskScopes = filter(this.state.TaskStore.selectedTask.scopes, (scope) => {
            return !scope.parent;
        });
        let office365Contacts = cloneDeep(this.state.TaskStore.office365Contacts);
        let customerContact = find(office365Contacts, (customerContactToFind) => {
            if (customerContactToFind.displayName !== '') {
                return customerContactToFind.id === selectedOption.value;
            }
        });
        if (!customerContact) {
            forEach(selectedTaskScopes, (contactScope) => {
                if (contactScope.customerContact && contactScope.customerContact.id === selectedOption.value) {
                    customerContact = {
                        id: contactScope.customerContact.id,
                        displayName: contactScope.customerContact.name
                    };
                }
            });
            if (!customerContact) {
                customerContact = {
                    id: '',
                    name: ''
                };
            }
        }

        if (customerContact) {
            TaskAction.changeCustomerContact({
                scope: scope,
                value: {
                    id: customerContact.id,
                    name: customerContact.displayName
                }
            });
            this.updateScopesToBeUpdated(scope);
        }
    };

    _changeEngineer = (scope, selectedOption) => {
        let engineer = find(this.state.AppStore.users, (user) => {
            return (user.role.id === Constant.ROLE_ID.ENGINEER || user.role.id === Constant.ROLE_ID.MANAGER) && user._id === selectedOption.value;
        });
        TaskAction.changeEngineer({
            scope: scope,
            value: cloneDeep(engineer),
            loggedInUserID: this.state.LoginStore.user.id
        });
        this.updateScopesToBeUpdated(scope);
    };

    /* TODO */
    _changeStatus = (scope, isDrafter, selectedOption) => {
        TaskAction.changeStatus({
            scope: scope,
            value: selectedOption.value,
            isDrafter: isDrafter
        });
        this.updateScopesToBeUpdated(scope);
    };

    _changeUrgentHours = (scope, isDrafter, event) => {
        let value = event.target.value;
        TaskAction.changeFormUrgentHour({
            scope: scope,
            value: value,
            isDrafter: isDrafter,
            loggedInUserID: this.state.LoginStore.user.id
        });
        this.updateScopesToBeUpdated(scope);
    };

    _changeNonUrgentHours = (scope, isDrafter, event) => {
        let value = event.target.value;
        TaskAction.changeFormNonUrgentHour({
            scope: scope,
            value: value,
            isDrafter: isDrafter,
            loggedInUserID: this.state.LoginStore.user.id
        });
        this.updateScopesToBeUpdated(scope);
    };

    _changeDrafter = (scope, selectedOption) => {
        let drafter = find(this.state.AppStore.users, (user) => {
            return user.role.id === Constant.ROLE_ID.DRAFTER && user._id === selectedOption.value;
        });
        TaskAction.changeDrafter({
            scope: scope,
            value: cloneDeep(drafter),
            loggedInUserID: this.state.LoginStore.user.id
        });
        this.updateScopesToBeUpdated(scope);
    };
    // push scope to scopeToBeUpdated aarray if changed something in it and update on submit only uodated scopes
    updateScopesToBeUpdated = ({_id, id}) => {
        let {scopeToBeUpdated} = this.state;
        if (_id && !scopeToBeUpdated.includes(id)) {
            scopeToBeUpdated.push(id);
        }
        this.setState({scopeToBeUpdated});
    };
    _extractPersonalNotes = (personalNotes) => {
        let payload = {};
        if (personalNotes && personalNotes.length > 0) {
            personalNotes = personalNotes.split(";");
            for(var i = 0; i< personalNotes.length; i++){
                let keyValue = personalNotes[i].split(":");
                switch(keyValue[0].trim()) {
                    case 'Company' :
                        payload.company = keyValue[1].trim();
                        break;

                    case "Bill Branch" :
                        payload.billBranch = keyValue[1].trim();
                        break;

                    case "PO Required" :
                        payload.poRequired = keyValue[1].trim();
                        break;

                    case "Include Contact" :
                        payload.includeContacts = keyValue[1].trim();
                        break;

                    case "Invoice Contact" :
                        payload.invoiceContact = keyValue[1].trim();
                        break;

                    case "Include Client Job Number" :
                        payload.includeClientJobNo = keyValue[1].trim();
                        break;

                    case "Contract" :
                        payload.contract = keyValue[1].trim();
                        break;
                }
            }
        }

        return payload;
    };

    syncContractorInformation = (contractorID, taskID) => {
        let loginState = cloneDeep(this.state.LoginStore);
        let userID = loginState.user._id;
        let data = {
            state: 100,
            loading: true
        };
        TaskAction.changeSyncContractState(data);
        TaskAction.syncContractor(userID, contractorID, taskID);


    };

    _handleSubmit = (event, { formData }) => {
        event.preventDefault();
        let self = this;
        let loginState = cloneDeep(self.state.LoginStore);
        let taskState = cloneDeep(self.state.TaskStore);
        const selectedTaskScopes = filter(taskState.selectedTask.scopes, (scope) => {
            return !scope.parent;
        });
        let selectedContact;
        if (self._validateTaskForm({ formData })) {
            event.target[event.target.length - 1].blur();
            let needRename = false;
            let oldPath = '';
            let newPath = '';
            let task = cloneDeep(taskState.selectedTask);

            if (task.contractor && task.contractor.id !== formData.contractor) {
                AppAction.showNotification({ message: Constant.NOTIFICATION_MESSAGES.TASK.CONTRACTOR.UPDATE_WARNING, level: Constant.NOTIFICATION_LEVELS.WARNING });
            }

            let selectedContractor = find(taskState.office365Contractors, (contractor) => {
                return formData.contractor === contractor.id;
            });

            // Extract Personal Notes Info as it is a String object
            let extractedPersonalNotes = self._extractPersonalNotes(selectedContractor && selectedContractor.personalNotes ? selectedContractor.personalNotes : "");

            if (formData.contractor) {
                if (selectedContractor && extractedPersonalNotes) {
                    task.contractor = {
                        name: selectedContractor.companyName.trim(),
                        id: selectedContractor.id,
                        company: extractedPersonalNotes.company && extractedPersonalNotes.company.length >0 ? extractedPersonalNotes.company : "",
                        billBranch: extractedPersonalNotes.billBranch && extractedPersonalNotes.billBranch.length > 0 ? extractedPersonalNotes.billBranch : "",
                        poRequired: extractedPersonalNotes.poRequired && extractedPersonalNotes.poRequired.toLowerCase() === 'yes' ? true : false,
                        includeContacts: extractedPersonalNotes.includeContacts && extractedPersonalNotes.includeContacts.toLowerCase() === 'yes' ? true : false,
                        invoiceContact: extractedPersonalNotes.invoiceContact && extractedPersonalNotes.invoiceContact ? extractedPersonalNotes.invoiceContact : "" ,
                        includeClientJobNo: extractedPersonalNotes.includeClientJobNo && extractedPersonalNotes.includeClientJobNo.toLowerCase() === 'yes' ? true : false,
                        contract: extractedPersonalNotes.contract && extractedPersonalNotes.contract ? extractedPersonalNotes.contract : "" ,
                        updatedAt: new Date(),
                        updatedBy: loginState.user._id
                    };
                }
            }

            let taskNumber;
            if (task.isBidding) {
                taskNumber = 'B' + new Date(task.createdAt).getFullYear().toString().substr(2, 2) + '-' + task.taskNumber;
            } else if (task.isFromTaskGroup) {
                taskNumber = 'T' + new Date(task.createdAt).getFullYear().toString().substr(2, 2) + '-' + task.taskNumber;
            } else {
                taskNumber = new Date(task.createdAt).getFullYear().toString().substr(2, 2) + '-' + task.taskNumber;
            }

            if (!self.props.isAddTask) {
                needRename = task.title.toLowerCase() !== formData.name.toLowerCase().trim() ||
                    task.city.toLowerCase() !== formData.city.toLowerCase().trim() ||
                    task.state.toLowerCase() !== formData.state.toLowerCase().trim();
            }
            if (needRename) {
                let contractorName = task.contractor.company ? task.contractor.company.trim() : task.contractor.name;
                oldPath = contractorName + '/' + new Date(task.createdAt).getFullYear().toString() + '/' +
                    task.city + ', ' + task.state + ' - ' + task.title + ' - ' + taskNumber;
            }

            task.title = formData.name.trim();
            task.city = formData.city.trim();
            task.state = formData.state.trim();
            task.additionalNote = formData.additionalNotes.trim();

            forEach(selectedTaskScopes, (scope, index) => {
                let isEngineerPresent = find(task.teamMembers, (member) => {
                    if (member._id) {
                        return member._id === formData['engineer' + scope.id];
                    }
                    return member === formData['engineer' + scope.id];
                });

                if (!isEngineerPresent) {
                    task.teamMembers.push(formData['engineer' + scope.id]);
                }

                if (formData['drafter' + scope.id]) {
                    let isDrafterPresent = find(task.teamMembers, (member) => {
                        if (member._id) {
                            return member._id === formData['drafter' + scope.id];
                        }
                        return member === formData['drafter' + scope.id];
                    });

                    if (!isDrafterPresent) {
                        task.teamMembers.push(formData['drafter' + scope.id]);
                    }
                }
                let oldScope;
                let currentTask = find(taskState.metaTasks, (metaTask) => {
                    return metaTask._id === task._id;
                });
                if (currentTask && scope._id) {
                    oldScope = find(currentTask.scopes, (currentScope) => {
                        return currentScope._id === scope._id;
                    });
                }
                if (scope._id && oldScope && oldScope.note !== formData['scopeNote' + scope.id].trim()) {
                    scope.scopeNoteData = {
                        oldNote: oldScope.note,
                        newNote: formData['scopeNote' + scope.id].trim()
                    };
                }
                scope.number = scope.number ? scope.number : String.fromCharCode(65 + index);
                scope.definition = formData['scope' + scope.id].trim();
                // scope.group = formData['group' + index];
                scope.note = formData['scopeNote' + scope.id].trim();
                scope.price = parseFloat(formData['price' + scope.id]).toFixed(2);
                scope.engineerDetails = {
                    engineer: formData['engineer' + scope.id],
                    status: formData['engineerStatus' + scope.id],
                    urgentHours: parseFloat(formData['engineeringUrgentHours' + scope.id]).toFixed(2),
                    nonUrgentHours: parseFloat(formData['engineeringNonUrgentHours' + scope.id]).toFixed(2)
                };

                if (formData['drafter' + scope.id]) {
                    scope.drafterDetails = {
                        drafter: formData['drafter' + scope.id],
                        status: formData['drafterStatus' + scope.id],
                        urgentHours: parseFloat(formData['draftingUrgentHours' + scope.id]).toFixed(2),
                        nonUrgentHours: parseFloat(formData['draftingNonUrgentHours' + scope.id]).toFixed(2)
                    };
                } else {
                    scope.drafterDetails = {
                        drafter: null,
                        status: Constant.STATUS_OPTIONS[0].value,
                        urgentHours: 0,
                        nonUrgentHours: 0
                    };
                }
                scope.dueDate = self._dateWrapper(formData['dueDate' + scope.id]);
                scope.itemType = formData['itemType' + scope.id];

                if (formData['customerContact' + scope.id]) {
                    selectedContact = find(this.state.TaskStore.office365Contacts, (contact) => {
                        return formData['customerContact' + scope.id] === contact.id;
                    });
                    if (selectedContact) {
                        scope.customerContact = {
                            name: selectedContact.displayName,
                            id: selectedContact.id
                        };
                    } else {
                        let contactName;
                        forEach(selectedTaskScopes, (contactScope) => {
                            if (contactScope.customerContact && contactScope.customerContact.id === formData['customerContact' + scope.id]) {
                                contactName = contactScope.customerContact.name;

                            }
                        });
                        scope.customerContact = {
                            name: contactName,
                            id: formData['customerContact' + scope.id]
                        };
                    }
                }
            });

            TaskAction.addLoader('taskForm');
            TaskAction.addLoader('milestone');
            if (self.props.isAddTask) {
                task.createdBy = loginState.user._id;
                task.teamMembers.push(loginState.user._id);
                task.purchaseOrders = [];
                task.attachments = map(self.state.AppStore.appSettings.attachments, (attachment) => {
                    return {
                        attachmentId: attachment._id,
                        new: true
                    };
                });
                task.scopes = taskState.selectedTask.scopes;
                TaskAction.updateLoggedInUser(loginState.user.id);
                TaskAction.addTask(task);
            } else {
                task.scopes = taskState.selectedTask.scopes;
                forEach(task.scopes, (scope) => {
                    forEach(taskState.archivedMileStones.drawings, (archivedDrawing) => {
                        if (archivedDrawing.currentScope.id === scope.id) {
                            scope.drawings.push(archivedDrawing);
                        }
                    });
                    forEach(taskState.archivedMileStones.calcs, (archivedCalc) => {
                        if (archivedCalc.currentScope.id === scope.id) {
                            scope.calcs.push(archivedCalc);
                        }
                    });
                });
                forEach(taskState.archivedScopes, (archivedScope) => {
                    if (archivedScope.task === task._id) {
                        task.scopes.push(archivedScope);
                    }
                });
                TaskAction.updateLoggedInUser(loginState.user.id);
                TaskAction.updateTaskForm(task, Constant.NOTIFICATION_MESSAGES.TASK_FORM.UPDATE_SUCCESS, this.state.scopeToBeUpdated);
                this.setState({scopeToBeUpdated: []});
                if (needRename) {
                    let contractorName = task.contractor.company ? task.contractor.company.trim() : task.contractor.name;
                    newPath = contractorName + '/' + new Date(task.createdAt).getFullYear().toString() + '/' +
                        task.city + ', ' + task.state + ' - ' + task.title + ' - ' + taskNumber;
                    TaskAction.renameFTPFolder(oldPath, newPath);
                }
            }
        }
    };

    _getOffice365Contractors = debounce((event, value) => {
        TaskAction.toggleFetchingContractors();
        TaskAction.getOffice365Contractors(value, false);
    }, 500);

    _handleChangeContractor = (event, { value }) => {
        let self = this;
        let office365Contractors = cloneDeep(self.state.TaskStore.office365Contractors);
        let selectedContractor = cloneDeep(self.state.TaskStore.selectedTask.contractor);
        let newContractor;
        if (office365Contractors.length > 0) {
            newContractor = find(office365Contractors, (contractor) => {
                return contractor.id === value;
            });
            TaskAction.toggleFetchingContacts();
            this.contractorName = newContractor.companyName;
            self._isProjectNameAlreadyExist();
            TaskAction.getOffice365Contacts(newContractor.companyName);
        } else {
            newContractor = selectedContractor;
            TaskAction.toggleFetchingContacts();
            this.contractorName = newContractor.name;
            self._isProjectNameAlreadyExist();
            TaskAction.getOffice365Contacts(newContractor.name);
        }
    };

    _getOffice365Contacts = () => {
        let self = this;
        let office365Contacts = cloneDeep(self.state.TaskStore.office365Contacts);
        let selectedContractor = cloneDeep(self.state.TaskStore.selectedTask.contractor);
        if (office365Contacts.length === 0 && selectedContractor) {
            TaskAction.toggleFetchingContacts();
            TaskAction.getOffice365Contacts(selectedContractor.name);
        }
    };

    _handleFocusOnDatePicker = (scopeID, event) => {
        if (event.relatedTarget) {
            this.refs['datePicker' + scopeID].openDialog();
        }
    };

    _viewArchivedScopes = () => {
        TaskAction.setViewArchivedScopesModal();
    };

    _restoreScope = (scope) => {
        TaskAction.addLoader('restoreScope');
        let cloneScope = cloneDeep(scope);
        const loggedInUserID = this.state.LoginStore.user.id;
        let updatedScope = {
            id: cloneScope.id,
            isArchived: false
        };
        TaskAction.updateLoggedInUser(loggedInUserID);
        TaskAction.updateScope(updatedScope, Constant.NOTIFICATION_MESSAGES.SCOPE.ARCHIVED.FALSE);
    };

    _dateWrapper = (date) => {
        let inputDate = new Date(date);
        if (inputDate.getFullYear() < 2000) {
            return moment(inputDate).add('years', 100).toDate();
        }
        return new Date(date);
    };

    _naturalSorter = (employeeCode1, employeeCode2) => {
        let employeeCode1Match;
        let employeeCode2Match;
        let a1;
        let b1;
        let i = 0;
        let numReturnVal;
        let employeeCode1Length;
        let regexPattern = /(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g;
        if (employeeCode1 === employeeCode2) {
            return 0;
        }
        employeeCode1Match = employeeCode1.toLowerCase().match(regexPattern);
        employeeCode2Match = employeeCode2.toLowerCase().match(regexPattern);
        employeeCode1Length = employeeCode1Match.length;
        while (i < employeeCode1Length) {
            if (!employeeCode2Match[i]) {
                return 1;
            }
            a1 = employeeCode1Match[i];
            b1 = employeeCode2Match[i++];
            if (a1 !== b1) {
                numReturnVal = a1 - b1;
                if (!isNaN(numReturnVal)) {
                    return numReturnVal;
                }
                return a1 > b1 ? 1 : -1;
            }
        }
        return employeeCode2Match[i] ? -1 : 0;
    };

    _renderCustomerContact = (option) => {
        return <Header size='tiny' content={option.displayName} subheader={option.companyName.trim()} />;
    };

    /**
     * Call an action to check whether entered Project Name is already exists or not.
     */
    _isProjectNameAlreadyExist = (e = null) => {
        if( this.state.TaskStore.office365Contacts && this.state.TaskStore.office365Contacts.length > 0) {
            this.contractorName = this.state.TaskStore.office365Contacts[0].companyName;
        }
        if(e && e.target.name === 'name') {
            this.projectName = e.target.value;
        }
        if(this.projectName && this.projectName !== "" && this.projectName.length > 0 && this.contractorName) {
            TaskAction.isProjectNameExist(this.contractorName, this.projectName.trim());
        } else {
            TaskAction.clearDuplicateProjectName();

        }
    };

    /***
     * If user clicks on The Name of Existing Task Name which was shown in error
     * message this action will close existing popup and open already exist task
     * in new popup
     */
    _handleProjectNameClick = (e) => {
        TaskAction.closeTaskModal();
        let self = this;
        let taskState = self.state.TaskStore;
        let payload = {
            taskId: e.target.id
        };
        TaskAction.openSelectedtask(payload);
    };

    render() {
        let self = this;
        let taskState = self.state.TaskStore;
        let appState = self.state.AppStore;
        let loginState = self.state.LoginStore;
        let selectedTaskScopes = [];

        if (taskState.selectedTask) {
            selectedTaskScopes = filter(taskState.selectedTask.scopes, (scope) => {
                return !scope.parent;
            });
        }
        let contractorsOptions = [];
        let contactOptions = [];
        let contactOptionsDefault = [{ label: '', value: '', displayName: '', companyName: '' }];

        let isLoggedInUserEngineer = loginState.user.role.id === Constant.ROLE_ID.MANAGER || loginState.user.role.id === Constant.ROLE_ID.ENGINEER;

        if (taskState.selectedTask && taskState.selectedTask.contractor && taskState.office365Contractors.length === 0) {
            contractorsOptions = [
                {
                    text: taskState.selectedTask.contractor.name,
                    value: taskState.selectedTask.contractor.id
                }
            ];
        } else {
            contractorsOptions = map(taskState.office365Contractors, (contractor) => {
                return { key: contractor.id, text: contractor.companyName, value: contractor.id };
            });
        }

        contactOptions = map(taskState.office365Contacts, (contact, index) => {
            return {
                key: index,
                label: contact.displayName,
                value: contact.id,
                displayName: contact.displayName,
                companyName: contact.companyName
            };
        });
        contactOptions = contactOptionsDefault.concat(contactOptions);
        let itemTypes = cloneDeep(appState.itemTypes);
        itemTypes.unshift({ name: '', _id: '' });
        const itemTypeOptions = map(itemTypes, (itemType, index) => {
            return { label: itemType.name, value: itemType._id, key: 'itemType' + index };
        });

        let users = cloneDeep(appState.users);
        users = users.sort((e1, e2) => {
            return self._naturalSorter(e1.employeeCode, e2.employeeCode);
        });

        let engineers = filter(users, (user) => {
            return user.role.id === Constant.ROLE_ID.ENGINEER || user.role.id === Constant.ROLE_ID.MANAGER;
        });

        let engineerOptionsDefault = [{ label: '', value: '' }];
        let engineerOptions = map(engineers, (engineer) => {
            return {
                label: engineer.firstName + ' ' + engineer.lastName,
                value: engineer._id
            };
        });
        engineerOptions = engineerOptionsDefault.concat(engineerOptions);
        let defaultEngineer = find(engineerOptions, (engineerOption) => {
            return isLoggedInUserEngineer && engineerOption.value === loginState.user._id;
        });

        let drafters = filter(users, (user) => {
            return user.role.id === Constant.ROLE_ID.DRAFTER;
        });
        let drafterOptionsDefault = [{ label: '', value: '' }];
        let drafterOptions = map(drafters, (drafter) => {
            return {
                label: drafter.firstName + ' ' + drafter.lastName,
                value: drafter._id
            };
        });
        drafterOptions = drafterOptionsDefault.concat(drafterOptions);

        let archivedScopes = map(taskState.archivedScopes, (scope, index) => {
            return (
                <Table.Row className='archived-table-row' key={'archived-scope' + index}>
                    <Table.Cell>{scope.number}</Table.Cell>
                    <Table.Cell>{scope.note}</Table.Cell>
                    <Table.Cell>
                        <Button negative onClick={() => self._restoreScope(scope)}>
                            Restore
                        </Button>
                    </Table.Cell>
                </Table.Row>
            );
        });

        selectedTaskScopes = sortBy(selectedTaskScopes, (scope) => {
            return scope.number;
        });

        let biddingOrTaskGroupTask = taskState.selectedTask.isBidding ? 'B' : taskState.selectedTask.isFromTaskGroup ? 'T' : '';
        let maxScopeNumber = 'A';
        let scopeAndPrice = map(selectedTaskScopes, (scope, index) => {
            if (scope.customerContact && scope.customerContact.id) {
                let contactExist = find(contactOptions, (contact) => {
                    return scope.customerContact.id === contact.value;
                });

                if (!contactExist) {
                    contactOptions.push({
                        label: scope.customerContact.name,
                        value: scope.customerContact.id,
                        displayName: '',
                        companyName: ''
                    });
                }
            }
            let defaultStatus = find(Constant.STATUS_OPTIONS, (status) => {
                return status.value === 'ASAP';
            });
            let defaultEngineerStatus = scope.engineerDetails && scope.engineerDetails.status ? scope.engineerDetails.status : defaultStatus.value;
            let defaultDrafterStatus = scope.drafterDetails && scope.drafterDetails.status ? scope.drafterDetails.status : Constant.STATUS_OPTIONS[0].value;
            maxScopeNumber = scope.number ? scope.number : String.fromCharCode(65 + index);
            return (
                <div key={'scopeAndPrice' + scope.id + index}>
                    <Divider horizontal>{'Scope ' + maxScopeNumber}</Divider>
                    <Form.Group widths='2'>
                        <Form.Field width='11'>
                            <Form.TextArea required label='Scope' autoHeight name={'scope' + scope.id}
                                defaultValue={scope.definition} onBlur={(event) => self._changeDefinition(scope, event)} />
                        </Form.Field>
                        <Form.Field>
                            <label>
                                Scope note
                                <span className='form-star-field'> *</span>
                            </label>
                            <div className='field'>
                                <div className='ui input'>
                                    <input
                                        type='text'
                                        defaultValue={scope.note}
                                        required
                                        maxLength='16'
                                        name={'scopeNote' + scope.id}
                                        onBlur={(event) => self._changeScopeNote(scope, event)}
                                    />
                                </div>
                            </div>
                            <div style={{ marginTop: '10px' }}>
                                <label>
                                    Cost
                                <span className='form-star-field'> *</span>
                                </label>
                                <div className='field'>
                                    <div className='ui input left icon'>
                                        <i aria-hidden='true' className='dollar icon' />
                                        <input
                                            type='number'
                                            defaultValue={scope.price}
                                            required
                                            name={'price' + scope.id}
                                            onBlur={(event) => self._changeScopePrice(scope, event)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginTop: '10px' }}>
                                <label>Due Date <span className='form-star-field'> *</span></label>
                                <DatePicker
                                    firstDayOfWeek={0}
                                    hintText='Due Date'
                                    name={'dueDate' + scope.id}
                                    className='date'
                                    minDate={new Date()}
                                    defaultDate={new Date(scope.dueDate)}
                                    formatDate={self._formatDate}
                                    mode='landscape'
                                    ref={'datePicker' + scope.id}
                                    onFocus={(event) => self._handleFocusOnDatePicker(scope.id, event)}
                                    onBlur={(event, date) => self._changeDueDate(scope, event, date)} />
                            </div>
                        </Form.Field>
                        <Form.Field>
                            <label>
                                Item Type
                                <span className='form-star-field'> *</span>
                            </label>
                            <Select
                                name={'itemType' + scope.id}
                                autosize={false}
                                clearable={false}
                                value={scope.itemType && scope.itemType._id}
                                options={itemTypeOptions}
                                onChange={(option) => self._changeItemType(scope, option)}
                            />

                            <div style={{ marginTop: '10px' }}>
                                <label>Customer Contact</label>
                                <Select
                                    name={'customerContact' + scope.id}
                                    searchable
                                    autosize={false}
                                    clearable={false}
                                    disabled={taskState.isFetchingContacts}
                                    isLoading={taskState.isFetchingContacts}
                                    value={scope.customerContact && scope.customerContact.name ? scope.customerContact.id : ''}
                                    options={contactOptions}
                                    optionRenderer={self._renderCustomerContact}
                                    onOpen={self._getOffice365Contacts}
                                    onChange={(option) => self._changeCustomerContact(scope, option)}
                                />
                            </div>
                        </Form.Field>
                    </Form.Group>
                    <Form.Group widths='2'>
                        <Form.Field width='11' className='engineer-differential'>
                            <label>
                                Engineer
                                <span className='form-star-field'> *</span>
                            </label>
                            <Select
                                name={'engineer' + scope.id}
                                autosize={false}
                                clearable={false}
                                value={scope.engineerDetails && scope.engineerDetails.engineer._id ? scope.engineerDetails.engineer._id : defaultEngineer ? defaultEngineer.value : engineerOptionsDefault.value}
                                options={engineerOptions}
                                onChange={(option) => self._changeEngineer(scope, option)}
                            />
                            <div style={{ marginTop: '10px' }}>
                                <label>
                                    Status
                                <span className='form-star-field'> *</span>
                                </label>
                                <Select
                                    name={'engineerStatus' + scope.id}
                                    autosize={false}
                                    clearable={false}
                                    value={defaultEngineerStatus}
                                    options={Constant.STATUS_OPTIONS}
                                    onChange={(option) => self._changeStatus(scope, false, option)}
                                />
                            </div>
                            <div style={{ marginTop: '10px' }}>
                                <label>
                                    Urgent hours
                                <span className='form-star-field'> *</span>
                                </label>
                                <div className='field'>
                                    <div className='ui input'>
                                        <input
                                            type='number'
                                            defaultValue={scope.engineerDetails ? scope.engineerDetails.urgentHours : 0}
                                            required
                                            name={'engineeringUrgentHours' + scope.id}
                                            onBlur={(event) => self._changeUrgentHours(scope, false, event)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginTop: '10px' }}>
                                <label>
                                    Non-Urgent hours
                                <span className='form-star-field'> *</span>
                                </label>
                                <div className='field'>
                                    <div className='ui input'>
                                        <input
                                            type='number'
                                            defaultValue={scope.engineerDetails ? scope.engineerDetails.nonUrgentHours : 0}
                                            required
                                            name={'engineeringNonUrgentHours' + scope.id}
                                            onBlur={(event) => self._changeNonUrgentHours(scope, false, event)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Form.Field>
                        <Form.Field className='drafter-differential'>
                            <label>
                                Drafter
                            </label>
                            <Select
                                name={'drafter' + scope.id}
                                autosize={false}
                                clearable={false}
                                value={scope.drafterDetails && scope.drafterDetails.drafter ? scope.drafterDetails.drafter._id : ''}
                                options={drafterOptions}
                                onChange={(option) => self._changeDrafter(scope, option)}
                            />
                            <div style={{ marginTop: '10px' }}>
                                <label>
                                    Status
                                </label>
                                <Select
                                    name={'drafterStatus' + scope.id}
                                    autosize={false}
                                    clearable={false}
                                    value={scope.drafterDetails && scope.drafterDetails.status !== '' ? scope.drafterDetails.status : Constant.STATUS_OPTIONS[0].value}
                                    options={Constant.STATUS_OPTIONS}
                                    onChange={(option) => self._changeStatus(scope, true, option)}
                                />
                            </div>
                            <div style={{ marginTop: '10px' }}>
                                <label>
                                    Urgent hours
                                </label>
                                <div className='field'>
                                    <div className='ui input'>
                                        <input
                                            type='number'
                                            defaultValue={scope.drafterDetails ? scope.drafterDetails.urgentHours : 0}
                                            required
                                            name={'draftingUrgentHours' + scope.id}
                                            onBlur={(event) => self._changeUrgentHours(scope, true, event)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginTop: '10px' }}>
                                <label>
                                    Non-Urgent hours
                                </label>
                                <div className='field'>
                                    <div className='ui input'>
                                        <input
                                            type='number'
                                            defaultValue={scope.drafterDetails ? scope.drafterDetails.nonUrgentHours : 0}
                                            required
                                            name={'draftingNonUrgentHours' + scope.id}
                                            onBlur={(event) => self._changeNonUrgentHours(scope, true, event)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Form.Field>
                        <Form.Field>
                            <div style={{ marginTop: '10px' }}>
                                <label>Final Engineering Hours</label>
                                <div className='disabled field'>
                                    <div className='ui input'>
                                        <input type='text' name={'finalEngineeringHours' + scope.id} value={scope.finalEngineeringHours} disabled />
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginTop: '10px' }}>
                                <label>Final Drafting Hours</label>
                                <div className='disabled field'>
                                    <div className='ui input'>
                                        <input type='text' name={'finalDraftingHours' + scope.id} value={scope.finalDraftingHours} disabled />
                                    </div>
                                </div>
                            </div>
                        </Form.Field>
                    </Form.Group>

                    {index !== 0 &&
                        <a className='fa delete-scope-price' href='#'
                            onClick={!scope._id ? () => self._deleteScopeAndPrice(scope) : () => self._archiveScope(scope)}>&#xf056;</a>
                    }
                    <div className='clear' />
                </div>
            );
        });

        return (
            <div ref='show_error' className='task-form-container'>
                <div className='task-form-error-wrapper'>
                    {taskState.error.taskForm &&
                        <Message negative>
                            <Message.Header>
                                {taskState.error.taskForm}
                            </Message.Header>
                        </Message>
                    }
                    {taskState.error.duplicateProjectNameMSG &&
                        <Message negative>
                            <Message.Header>
                                {taskState.error.duplicateProjectNameMSG}
                                <ol type="1">
                                {taskState.duplicateProjectName.map(existingTask => {
                                    return (
                                        <li key = {existingTask._id+'li'}>
                                            <a
                                                onClick = {this._handleProjectNameClick}
                                                id = {existingTask.id}
                                                key = {existingTask._id}
                                                style = {{cursor:'pointer',paddingLeft:'10px'}}
                                            >
                                                {existingTask.title}
                                            </a>
                                        </li>
                                    );
                                })
                                }</ol>

                            </Message.Header>
                        </Message>
                    }
                </div>
                <Form as='form' noValidate onSubmit={(event, data) => self._handleSubmit(event, data)}>
                    <Dimmer active={taskState.loader.taskForm} inverted>
                        <Loader size='large'>{taskState.loaderText}</Loader>
                    </Dimmer>
                    <Form.Group widths='equal'>
                        <Form.Field>
                            <label>
                                Contractor <span className='form-star-field'> *</span>
                                { // if contractor is selected then show sync button else do not show
                                taskState.selectedTask && taskState.selectedTask.contractor && taskState.selectedTask.contractor.id &&
                                    <Popup
                                        on='hover'
                                        trigger={
                                            <span
                                                onClick={() => self.syncContractorInformation(taskState.selectedTask.contractor.id,taskState.selectedTask.id )}
                                                style={{ marginLeft: '65%' }}
                                                name="sync"
                                                disabled={taskState.syncContractData.loading}>
                                                <Icon
                                                    name="refresh"
                                                    loading={taskState.syncContractData.loading}
                                                    style={{ cursor:'pointer' }}
                                                    disabled={taskState.syncContractData.loading}
                                                    />
                                            </span>
                                        }
                                        content="Click to sync outlook contact details with task."
                                        />
                                }
                            </label>
                            <Dropdown
                                ref='contractor'
                                required
                                name='contractor'
                                placeholder='Enter contractor name or company name'
                                onChange={self._handleChangeContractor}
                                defaultValue={taskState.selectedTask.contractor ? taskState.selectedTask.contractor.id : ''}
                                icon='search'
                                search
                                selection
                                options={contractorsOptions}
                                loading={taskState.isFetchingContractors}
                                disabled={taskState.isFetchingContractors}
                                onSearchChange={self._getOffice365Contractors}
                                onBlur = {self._isProjectNameAlreadyExist}
                            />
                        </Form.Field>
                        <Form.Field>
                            <label>
                                Job No.
                            </label>
                            <div className='disabled field'>
                                <div className='ui input'>
                                    <input type='text' name={'invoiceNumber'} value={taskState.selectedTask.taskNumber ? biddingOrTaskGroupTask + '' +
                                        new Date(taskState.selectedTask.createdAt).getFullYear().toString().substr(2, 2) + '-' + taskState.selectedTask.taskNumber :
                                        'Yet to be generated'} disabled />
                                </div>
                            </div>
                        </Form.Field>
                        <Form.Field>
                            <label>
                                Project name
                                <span className='form-star-field'> *</span>
                            </label>
                            <div className='field'>
                                <div className='ui input'>
                                    <input
                                        type='text'
                                        placeholder="Enter project name"
                                        defaultValue={taskState.selectedTask.title}
                                        onBlur = {self._isProjectNameAlreadyExist}
                                        required
                                        name='name'
                                    />
                                </div>
                            </div>
                        </Form.Field>
                    </Form.Group>
                    <Form.Group widths='equal'>
                        <Form.Field>
                            <label>
                                City
                                <span className='form-star-field'> *</span>
                            </label>
                            <div className='field'>
                                <div className='ui input'>
                                    <input
                                        type='text'
                                        defaultValue={taskState.selectedTask.city}
                                        required
                                        placeholder="City name"
                                        name='city'
                                    />
                                </div>
                            </div>
                        </Form.Field>
                        <Form.Field>
                            <label>
                                State
                                <span className='form-star-field'> *</span>
                            </label>
                            <div className='field'>
                                <div className='ui input'>
                                    <input
                                        type='text'
                                        defaultValue={taskState.selectedTask.state}
                                        required
                                        placeholder="State name"
                                        name='state'
                                    />
                                </div>
                            </div>
                        </Form.Field>
                        <Form.Field>
                            <Form.TextArea
                                autoHeight
                                label='Additional Notes'
                                defaultValue={taskState.selectedTask.additionalNote}
                                name='additionalNotes' />
                        </Form.Field>
                    </Form.Group>
                    {taskState.archivedScopes.length > 0 && !self.props.isAddTask &&
                        <Form.Group widths='1'>
                            <Form.Field>
                                <a href='#' onClick={self._viewArchivedScopes}>
                                    <Label>
                                        <Icon name='archive' />Archived Scopes {taskState.archivedScopes.length}
                                    </Label>
                                </a>
                            </Form.Field>
                        </Form.Group>
                    }
                    {taskState.loader.archivedData &&
                        <span className='fa '>Loading Archived Scopes &#xf110;</span>
                    }
                    {scopeAndPrice}
                    <Form.Group widths='1'>
                        <Form.Field>
                            { maxScopeNumber === 'Z' ? // If scope limit reaches to the number Z do not allow user to add more scopes in th task.
                                <Popup
                                    trigger={
                                        <a name='add-Scope' className='fa add-scope' style={{color: '#797c7c', cursor: 'not-allowed'}}>
                                            &#xf055;
                                        </a>
                                    }
                                    on='hover'
                                    content='Exceeded max number of scope limit in one project. Please consider adding new Project/Task instead.'
                                />
                                :
                                <a name ='add-scope' className='fa add-scope' href='#' onFocus={self._handleFocusOnButtons} onClick={self._addScopeAndPrice}
                                onBlur={self._handleOnBlurOnButtons}>
                                    &#xf055;
                                </a>
                            }
                        </Form.Field>
                    </Form.Group>
                    <div className='text-align-right'>
                        <Button name ='button' primary type='submit' onFocus={self._handleFocusOnButtons} onBlur={self._handleOnBlurOnButtons}>
                            Submit
                        </Button>
                        {self.props.isAddTask &&
                            <Button name ='buttom-p' secondary content='Cancel' type='reset' onClick={self._closeTaskModal}
                                onFocus={self._handleFocusOnButtons}
                                onBlur={self._handleOnBlurOnButtons} />
                        }
                    </div>
                    {taskState.isOpenViewArchivedScopeModal &&
                        <Modal open size='small' closeIcon onClose={self._resetData}>
                            <Dimmer active={taskState.loader.restoreScope} inverted>
                                <Loader />
                            </Dimmer>
                            <Modal.Header>
                                Archived Scopes
                        </Modal.Header>
                            <Modal.Content>

                                <Table padded='very'>
                                    <Table.Header>
                                        <Table.Row className='archived-table-row'>
                                            <Table.HeaderCell>Scope Number</Table.HeaderCell>
                                            <Table.HeaderCell>Scope Note</Table.HeaderCell>
                                            <Table.HeaderCell>Restore</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {archivedScopes}
                                    </Table.Body>
                                </Table>
                            </Modal.Content>
                        </Modal>
                    }
                </Form>
            </div>
        );
    }
}
