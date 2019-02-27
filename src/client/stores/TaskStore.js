import indexOf from 'lodash/indexOf';
import find from 'lodash/find';
import forEach from 'lodash/forEach';
import remove from 'lodash/remove';
import map from 'lodash/map';
import cloneDeep from 'lodash/cloneDeep';
import uniqBy from 'lodash/uniqBy';
import isArray from 'lodash/isArray';
import pick from 'lodash/pick';
import concat from 'lodash/concat';
import differenceWith from 'lodash/differenceWith';
import isEqual from 'lodash/isEqual';
import filter from 'lodash/filter';
import shortid from 'shortid';
import moment from 'moment';
import { arrayMove } from 'react-sortable-hoc';

import alt from '../alt.js';
import Constant from '../components/helpers/Constant.js';

import TaskAction from '../actions/TaskAction.js';
import LoginAction from '../actions/LoginAction.js';

import AppStore from './AppStore.js';
import LoginStore from './LoginStore.js';
import { getTaskNumber } from '../utils/common.js';
class TaskStore {
    constructor() {
        this.bindActions(TaskAction);
        this.clearStore();
    }

    getDefaultCSAData() {
        return {
            hasShoring: false,
            shoringTitle: 'Shoring Near Buildings',
            shoring: 'Client agrees that Consultant shall prepare a shoring system that will provide a safe working area for personnel, capable of supporting estimated surcharge loading from adjacent building structure(s).  However, Client understands and takes full responsibility and liability for the fact that during shoring installation, removal, deflection or other construction activities, damage or settlement may occur to the adjacent soils and building structure.   Therefore, client agrees to defend, indemnify and hold harmless Consultant against any and all claims and liability related to damage, settlement or cracking of any kind that occur to existing building structures, soils, footings, slabs or utilities due to shoring installation, removal, deflection, or construction operations',
            hasEquipmentSupport: false,
            equipmentSupportTitle: 'EOR for Equipment Support',
            equipmentSupport: 'Unless requested and approved under a separate consulting services agreement, the Consultant shall not be responsible for performing any checks or analysis of the existing building structural elements to support the loads imposed upon it by the equipment outlined in the scope of services.  The engineer of record (EOR) for the building must review the new equipment and confirm, in writing, that the existing building structure is adequate to support the imposed loads.  Any changes to the engineered system that occur after the EOR review may be viewed as additional scope of work, and any retrofit of the building structure deemed necessary by EOR is the responsibility of Client.',
            hasStructuralShoring: false,
            structuralShoringTitle: 'EOR for Structural Shoring',
            structuralShoring: 'Unless requested and approved under a separate consulting services agreement, the Consultant shall not be responsible for performing any checks or analysis of the existing building structural elements to support the loads imposed upon them, or to be supported at locations shown during any phase of work.  The engineer of record (EOR) for the building must review proposed shoring system, and provide in writing, that the existing building structure is adequate to undergo construction and shoring operations.  Any changes to the engineered system that occur after the EOR review may be viewed as additional scope of work, and any retrofit of the building structure deemed necessary by EOR is the responsibility of Client.',
            hasFee: true,
            feeTitle: 'FEE',
            fee: 'The fee shall be paid within 30 days after the Client receives the Consultant’s submittal of the work product described in the Scope of Services.  Any additional work, including changes, site inspections/meetings or addressing review comments, will be performed either on a time and material basis at $240 per hour for Principal/Senior Engineer, $210 per hour for staff engineer and $110 per hour for AutoCAD drafting or a negotiated fee.  All outstanding balances remaining unpaid 45 days after the due date shall be subject to interest at the rate of two percent (2%) per month, starting from the due date and continuing until paid in full.  If outstanding balance is not paid after 100 days, the account will be subject to additional fees incurred by the employment of an outside collection agency, including attorney fees.  The Consultant’s liability on this project is limited to the amount of the fee invoiced by the Consultant as described in this section.  To the fullest extent permitted by law, Client shall indemnify, defend, and hold Consultant harmless from and against any and all claims, damages, costs, liabilities, losses, expenses, including reasonable attorneys’ fees, awards, fines or judgments for the death or bodily injury to persons, damage to property, or other loss, damage or expense (collectively “Liabilities”) arising out of or in connection with the work of improvement caused by the negligence of Client, General Contractor, the sub-contractors or their employees, agents or servants, including Consultant\'s alleged or actual negligent act or omission, provided, however, Client shall not be obligated to indemnify Consultant with respect to Liabilities resulting from Consultant’s sole negligence or willful misconduct.',
            hasIndemnity: false,
            indemnityTitle: '2 way indemnity',
            indemnity: 'To the fullest extent permitted by law, Client shall indemnify, defend, and hold Consultant harmless from and against any and all claims, damages, costs, liabilities, losses, expenses, including reasonable attorneys’ fees, awards, fines or judgments for the death or bodily injury to persons, damage to property, or other loss, damage or expense arising out of or in connection with the work of improvement caused by the negligence or willful misconduct of Client, General Contractor, the sub-contractors or their employees, agents or servants.   In turn, Consultant shall indemnify, defend, and hold Client harmless from and against any and all claims, damages, costs, liabilities, losses, expenses, including reasonable attorneys’ fees, awards, fines or judgments for the death or bodily injury to persons, damage to property, or other loss, damage or expense arising out of or in connection with the work of improvement caused by the negligence or willful misconduct of Consultant. Notwithstanding any other provision of this indemnity or contract, nothing herein is intended to create an immediate duty to defend the other party until and unless it is established by a judicial or arbitration finding that the party from whom a defense is sought was in fact negligent in the performance of its professional services under this contract.',
            hasMeans: true,
            meansTitle: 'MEANS AND METHODS',
            means: 'Consultant will not supervise, direct, control or have authority over or be responsible for Client’s means, methods, techniques, sequences or procedures of construction, or the safety precautions and programs incident thereto, or for any failure of Client to comply with Laws and Regulations applicable to the furnishing or performance of work.',
            hasTermination: true,
            terminationTitle: 'TERMINATION OF AGREEMENT',
            termination: 'This Agreement can be terminated at any time by either party, for any reason, by giving written notice to the other party.  If the Client terminates this Agreement prior to the completion of the services, the Consultant shall be reimbursed on a time and materials basis for all costs incurred up to the date of termination.',
            hasCare: true,
            careTitle: 'STANDARD OF CARE',
            care: 'Services performed by Consultant under this Agreement will be conducted in a manner consistent with and limited to that level of care and skill ordinarily exercised by members of the profession currently practicing in the same locality under similar conditions at the time the services were provided.  No other representation, express or implied, and no warranty or guarantee is included or intended in this Agreement, or in any report opinion, document or otherwise.',
            hasSchedule: true,
            scheduleTitle: 'SCHEDULE',
            schedule: 'All design work shall be completed and submitted to Client for review within a schedule agreed upon by Client and Consultant after Consultant receives a notice to proceed.',
            hasDispute: true,
            disputeTitle: 'DISPUTE RESOLUTION',
            dispute: 'The parties shall attempt to resolve by mediation any dispute between them arising out of or relating to this Agreement or the work of improvement.  Except as to any matter that would fall within the jurisdiction of the Small Claims Court, if mediation does not resolve such dispute, it shall be submitted to binding arbitration under the Rules of the American Arbitration Association or the Judicial Arbitration and Mediation Service.  Discovery shall be allowed under the arbitration and will be conducted in accordance with California Code of Civil Procedure section 1283.05.  Judgment on the award of the arbitrator(s) may be entered in any court having jurisdiction. The prevailing party shall be entitled, in addition to any judgment or award, to its attorney\'s fees and costs incurred in such arbitration, and any related costs of enforcement of any such judgment or award, and upon any appeal thereof.  This Agreement and the arbitration shall be governed by California law.',
            hasSafety: true,
            safetyTitle: 'JOBSITE SAFETY',
            safety: 'Neither the professional activities of the Consultant, nor the presence of the Consultant or its employees and sub-consultants at a construction/project site, shall relieve the General Contractor of its obligations, duties and responsibilities including, but not limited to, construction means, methods, sequence, techniques or procedures necessary for performing, superintending and coordinating the Work in accordance with the contract documents and any health or safety precautions required by any regulatory agencies.  The Consultant and its personnel have no authority to exercise any control over any construction contractor or its employees in connection with their work or any health or safety precautions.  The Client agrees that the General Contractor is solely responsible for jobsite safety, and warrants that this intent shall be carried out in the Client’s agreement with the General Contractor.',
            hasMiscellaneous: true,
            miscellaneousTitle: 'MISCELLANEOUS',
            miscellaneous: 'If any provision of this Agreement is held invalid or unenforceable, then all other provisions of this Agreement shall remain fully valid, enforceable and binding on the parties.  Any changes to this Agreement or change orders relative to the Work shall be in writing and signed by the parties to be effective. Time is of the essence of every provision contained in this Agreement.  The waiver by either party of any breach of any provision or covenant of this Agreement shall not be deemed a waiver of any other provision or covenant.  The parties acknowledge that each party and its counsel have reviewed and revised this Agreement and that the normal rule of construction to the effect that ambiguities are to be construed against the drafting party shall not be employed in the interpretation of this Agreement or any amendment or exhibits.'
        };
    }

    clearStore() {
        this.taskGroups = [];
        this.confirmationPopuData = null;
        this.tasks = [];
        this.allScopes = [];
        this.newTaskGroupName = '';
        this.billingReportData = null;
        this.isOpenGroupModel = false;
        this.isViewTask = false;
        this.isOpenTaskModel = false;
        this.selectedTask = null;
        this.showAddHourTrackerModal = false;
        this.hourTrackerData = null;
        this.showCongratulationsPopup = false;
        this.syncContractData = {
            state: 100,
            loading: false
        };
        this.duplicateProjectName = {};
        this.maxInvoiceNumber = 0;
        this.error = {
            taskGroup: '',
            task: '',
            taskForm: '',
            subTask: '',
            HourTracker: '',
            tag: '',
            comment: '',
            editComment: '',
            po: '',
            csa: '',
            mcsa: '',
            ma: '',
            ca: '',
            invoice: '',
            duplicateProjectNameMSG: ''
        };
        this.selectedGroup = '';
        this.hourTrackers = [];
        this.isOpenHourTrackerModal = false;
        this.selectedHourTracker = null;
        this.selectedHourTrackerScope = '';
        this.isViewNotes = false;
        this.office365Contractors = [];
        this.office365Contacts = [];
        this.isFetchingContractors = false;
        this.isFetchingContacts = false;
        this.editedComment = null;
        this.commentText = '';
        this.loader = {
            confirmChangeTaskGroup: false,
            taskGroup: false,
            task: false,
            designStatus: false,
            hourTracker: false,
            editNote: false,
            tags: false,
            addComment: false,
            editComment: false,
            subTask: false,
            subTaskStatus: false,
            taskForm: false,
            milestone: false,
            confirmDelete: false,
            document: false,
            restoreScope: false,
            restoreMileStone: false,
            archivedData: false,
            initialSetup: false,
            activeGroup: false,
            holdGroup: false,
            bidsGroup: false,
            completedGroup: true,
            viewTask: false,
            completedScope: false,
            scopeInvoicePage: false,
            taskGroupWrapper: false,
            groupChangeDropdown: false,
            addRevScope: false
        };
        this.dropableTaskGroup = null;
        this.changeTaskGroup = {
            isChanging: false,
            newGroup: null,
            item: null
        };
        this.taskGroupViewType = 'listView';
        this.isOpenSubTaskModel = false;
        this.selectedSubTask = null;
        this.viewSubTask = false;
        this.selectedTemplate = '';
        this.addAttachment = {};
        this.deleteMode = {
            isDelete: false,
            itemName: null,
            item: null
        };
        this.scopesSortBy = {};
        this.isViewMyScopes = true;
        this.selectedScope = null;
        this.taskFinalHours = [];
        this.isTagLoading = false;
        this.openDocumentModel = false;
        this.isAddDocument = false;
        this.selectedDocument = Constant.DOCUMENT_TYPES.INVOICE;
        this.archivedScopes = [];
        this.archivedMileStones = {
            agreements: [],
            modifiedAgreements: [],
            masterAgreements: [],
            clientAgreements: [],
            purchaseOrders: [],
            invoices: [],
            drawings: [],
            custDrawings: [],
            calcs: [],
            letters: [],
            tabData: []
        };
        this.isOpenViewArchivedScopeModal = false;
        this.isOpenViewArchivedMileStonesModal = false;
        this.poData = {
            id: '',
            name: '',
            notes: '',
            signature: ''
        };
        this.csaData = this.getDefaultCSAData();
        this.mcsaData = [];
        this.mData = [];
        this.caData = [];
        this.invoiceData = {
            id: '',
            poNumber: '',
            hold: 'N',
            company: ''
        };
        this.showDocumentInfo = false;
        this.oldData = {
            objectType: '',
            entityType: '',
            data: null
        };
        this.socketToastrMode = {
            showSocketToastr: false,
            toastrNotificationMsg: null,
            itemType: null,
            item: null
        };
        this.showSocketToastr = false;
        this.toastrNotificationMsg = '';
        this.maxTaskNumber = '';
        this.loaderText = '';
        this.selectedScopesForCSA = [];
        this.selectedScopesForMCSA = [];
        this.selectedScopesForMA = [];
        this.selectedScopesForCA = [];
        this.selectedScopesForInvoice = [];
        this.selectedScopesForPO = [];
        this.isNewTask = false;
        this.isAttachmentUploading = false;
        this.canUpdateLoggedInUser = false;
        this.loggedInUserID = null;
        this.selectedUser = null;
        this.activeScopes = [];
        this.holdScopes = [];
        this.taskScopes = [];
        this.bidsScopes = [];
        this.completedScopes = [];
        this.scopeInvoicePage = null;
        this.fetchingTask = '';
        this.skipRange = 0;
        this.stopPagination = false;
        this.accordionStatus = {};
        this.selectedScopeGroup = null;
        this.enableManualSorting = true;
        this.shouldAddRevScope = false;
        this.parentScopeForRev = {};
        this.updateReport = false;    // used to update report table inside competed scopes screen
    }

    resetData() {
        this.isOpenGroupModel = false;
        this.isOpenTaskModel = false;
        this.isOpenViewArchivedScopeModal = false;
        this.isOpenViewArchivedMileStonesModal = false;
        this.newTaskGroupName = '';
        this.isOpenHourTrackerModal = false;
        this.selectedHourTracker = null;
        this.selectedHourTrackerScope = '';
        this.isViewNotes = false;
        this.office365Contractors = [];
        this.office365Contacts = [];
        this.isFetchingContractors = false;
        this.isFetchingContacts = false;
        this.selectedContractor = null;
        this.editedComment = null;
        this.commentText = '';
        this.syncContractData = {
            state: 100,
            loading: false
        };
        // this.maxInvoiceNumber = 0;
        this.changeTaskGroup = {
            isChanging: false,
            newGroup: null,
            item: null
        };
        this.loader = {
            confirmChangeTaskGroup: false,
            taskGroup: false,
            task: false,
            designStatus: false,
            hourTracker: false,
            tags: false,
            addComment: false,
            editComment: false,
            subTask: false,
            subTaskStatus: false,
            taskForm: false,
            milestone: false,
            confirmDelete: false,
            document: false,
            restoreScope: false,
            restoreMileStone: false,
            archivedData: false,
            initialSetup: false,
            activeGroup: false,
            holdGroup: false,
            bidsGroup: false,
            completedGroup: false,
            viewTask: false,
            taskGroupWrapper: false,
            groupChangeDropdown: false,
            addRevScope: false
        };
        this.dropableTaskGroup = null;
        this.isOpenSubTaskModel = false;
        this.selectedSubTask = null;
        this.viewSubTask = false;
        this.selectedTemplate = '';
        this.deleteMode = {
            isDelete: false,
            itemName: null,
            item: null
        };
        this.selectedScope = null;
        this.isTagLoading = false;
        this.openDocumentModel = false;
        this.isAddDocument = false;
        this.selectedDocument = Constant.DOCUMENT_TYPES.INVOICE;
        this.poData = {
            id: '',
            name: '',
            notes: '',
            signature: ''
        };
        this.csaData = this.getDefaultCSAData();
        this.invoiceData = {
            poNumber: '',
            hold: '',
            company: ''
        };
        this.oldData = {
            objectType: '',
            entityType: '',
            data: null
        };
        this.socketToastrMode = {
            showSocketToastr: false,
            toastrNotificationMsg: null,
            itemType: null,
            item: null,
            loggedInUserID: null
        };
        this.maxTaskNumber = '';
        this.loaderText = '';
        this.selectedScopesForCSA = [];
        this.selectedScopesForMCSA = [];
        this.selectedScopesForMA = [];
        this.selectedScopesForCA = [];
        this.selectedScopesForInvoice = [];
        this.canUpdateLoggedInUser = false;
        this.loggedInUserID = null;
        // this.selectedUser = null;
        this.fetchingTask = '';
        this.shouldAddRevScope = false;
        this.parentScopeForRev = {};
        this.resetError();
        // this.updateReport = false;
    }

    getGroupScopes(groupId) {
        this.allGroupScopes = {
            [Constant.TASK_GROUP_ID.ACTIVE_PROJECTS]: this.activeScopes,
            [Constant.TASK_GROUP_ID.ON_HOLD]: this.holdScopes,
            [Constant.TASK_GROUP_ID.TASKS]: this.taskScopes,
            [Constant.TASK_GROUP_ID.BIDS]: this.bidsScopes,
            [Constant.TASK_GROUP_ID.COMPLETED_PROJECTS]: this.completedScopes
        };
        return this.allGroupScopes[groupId] || [];
    }

    searchAndRemoveScopeFromGroup(updatedScope) {
        const self = this;
        let gridScope;

        if (updatedScope.group.id !== Constant.TASK_GROUP_ID.ACTIVE_PROJECTS) {
            gridScope = find(self.activeScopes, (activeScope) => {
                return activeScope.id === updatedScope.id;
            });
            if (gridScope) {
                remove(self.activeScopes, { id: gridScope.id });
                this._updateManualSortScopes(self.activeScopes, Constant.TASK_GROUP__ID.ACTIVE_PROJECTS, LoginStore.getState().user._id);
                return;
            }
        }
        if (updatedScope.group.id !== Constant.TASK_GROUP_ID.ON_HOLD) {
            gridScope = find(self.holdScopes, (holdScope) => {
                return holdScope.id === updatedScope.id;
            });
            if (gridScope) {
                remove(self.holdScopes, { id: gridScope.id });
                this._updateManualSortScopes(self.holdScopes, Constant.TASK_GROUP__ID.ON_HOLD, LoginStore.getState().user._id);
                return;
            }
        }
        if (updatedScope.group.id !== Constant.TASK_GROUP_ID.TASKS) {
            gridScope = find(self.taskScopes, (taskScope) => {
                return taskScope.id === updatedScope.id;
            });
            if (gridScope) {
                remove(self.taskScopes, { id: gridScope.id });
                this._updateManualSortScopes(self.taskScopes, Constant.TASK_GROUP__ID.TASKS, LoginStore.getState().user._id);
                return;
            }
        }
        if (updatedScope.group.id !== Constant.TASK_GROUP_ID.BIDS) {
            gridScope = find(self.bidsScopes, (bidScope) => {
                return bidScope.id === updatedScope.id;
            });
            if (gridScope) {
                remove(self.bidsScopes, { id: gridScope.id });
                this._updateManualSortScopes(self.bidsScopes, Constant.TASK_GROUP__ID.BIDS, LoginStore.getState().user._id);
                return;
            }
        }
        if (updatedScope.group.id !== Constant.TASK_GROUP_ID.COMPLETED_PROJECTS) {
            gridScope = find(self.completedScopes, (completedScope) => {
                return completedScope.id === updatedScope.id;
            });
            if (gridScope) {
                remove(self.completedScopes, { id: gridScope.id });
                TaskAction.getUsersCompletedScopes(LoginStore.getState().user._id, this.skipRange, 20);
                this._updateManualSortScopes(self.completedScopes, Constant.TASK_GROUP__ID.COMPLETED_PROJECTS, LoginStore.getState().user._id);

            }
        }
    }

    removeArchivedDataFromTask(task) {
        forEach(task.scopes, (scope) => {
            remove(scope.drawings, { isArchived: true });
            remove(scope.custDrawings, { isArchived: true });
            remove(scope.calcs, { isArchived: true });
            remove(scope.letters, { isArchived: true });
            remove(scope.tabData, { isArchived: true });
        });
        remove(task.agreements, { isArchived: true });
        remove(task.modifiedAgreements, { isArchived: true });
        remove(task.masterAgreements, { isArchived: true });
        remove(task.clientAgreements, { isArchived: true });
        remove(task.purchaseOrders, { isArchived: true });
        remove(task.invoices, { isArchived: true });
        remove(task.scopes, { isArchived: true });
    }

    addNewTaskGroupName(taskGroupName) {
        this.newTaskGroupName = taskGroupName;
    }

    addScopeAndPrice() {
        let maxScopeNumber = 65;
        let maxArchivedScopeNumber = 65;
        let maxNumber = 65;
        let scopeGroup;
        let isInBidsGroup = false;

        forEach(this.selectedTask.scopes, (scope) => {
            scopeGroup = scope.group;
            if (scopeGroup._id === Constant.TASK_GROUP__ID.BIDS) {
                isInBidsGroup = true;
            }

            if (!scope.number) {
                scope.number = String.fromCharCode(65);
            }
            if (scope.number.charCodeAt(0) > maxScopeNumber) {
                maxScopeNumber = scope.number.charCodeAt(0);
            }
        });

        forEach(this.archivedScopes, (scope) => {
            if (scope.number.charCodeAt(0) > maxArchivedScopeNumber) {
                maxArchivedScopeNumber = scope.number.charCodeAt(0);
            }
        });
        if (maxArchivedScopeNumber > maxScopeNumber) {
            maxNumber = maxArchivedScopeNumber;
        } else {
            maxNumber = maxScopeNumber;
        }
        maxNumber = maxNumber === 72 || maxNumber === 78 ? String.fromCharCode(maxNumber + 2) : String.fromCharCode(maxNumber + 1);
        if (this.selectedScopeGroup) {
            if (this.selectedScopeGroup === Constant.TASK_GROUP__ID.COMPLETED_PROJECTS) {
                scopeGroup = Constant.TASK_GROUP__ID.ACTIVE_PROJECTS;
            } else {
                scopeGroup = this.selectedScopeGroup;
            }
        } else {
            // If scope is in completed add new scope in Active group
            if (scopeGroup._id === Constant.TASK_GROUP__ID.COMPLETED_PROJECTS) {
                scopeGroup = Constant.TASK_GROUP__ID.ACTIVE_PROJECTS;
            }
            // If any of scope in task is in Bid add new scope in bid
            // First of all it will not happen but this is a provison for older scopes/scenarios
            if (isInBidsGroup) {
                scopeGroup = Constant.TASK_GROUP__ID.BIDS;
            }
        }
        let newScope = {
            id: shortid.generate() + shortid.generate(),
            number: maxNumber,
            definition: 'Prepare PE stamped design plans and calculations for ',
            note: '',
            dueDate: new Date(),
            price: 0,
            group: scopeGroup,
            status: '',
            customerContact: '',
            engineerDetails: {
                engineer: {},
                urgentHours: 0,
                nonUrgentHours: 0,
                status: ''
            },
            drafterDetails: {
                drafter: null,
                urgentHours: 0,
                nonUrgentHours: 0,
                status: ''
            },
            drawings: [],
            custDrawings: [],
            calcs: [],
            letters: [],
            tabData: [],
            scopeInvoices: []
        };
        if (typeof scopeGroup === 'string' && scopeGroup === Constant.TASK_GROUP__ID.TASKS || scopeGroup._id === Constant.TASK_GROUP__ID.TASKS) {
            delete newScope.scopeInvoices;
        }
        this.selectedTask.scopes.push(newScope);
    }

    deleteScopeAndPrice(scope) {
        let index = indexOf(this.selectedTask.scopes, find(this.selectedTask.scopes, (currentScope) => {
            return currentScope.id === scope.id;
        }));
        if (index > -1) {
            let charCode = scope.number.charCodeAt(0);
            for (let i = index + 1; i < this.selectedTask.scopes.length; i++) {
                if (charCode === 72 || charCode === 78) {
                    charCode += 2;
                } else {
                    charCode += 1;
                }
                this.selectedTask.scopes[i].number = String.fromCharCode(charCode);
            }
            remove(this.selectedTask.scopes, (currentScope) => {
                return currentScope.id === scope.id;
            });
        }
    }

    viewMyScopes(value) {
        this.isViewMyScopes = value;
        this.selectedUser = null;
    }

    createHourTrackerRows(task) {
        let hourTrackerRows = map(task.hourTrackers, (hourTracker) => {
            let subTask = find(task.subTasks, { id: hourTracker.subTaskId });
            return {
                id: hourTracker.id,
                employee: hourTracker.employee.firstName + ' ' + hourTracker.employee.lastName,
                subTaskId: {
                    id: subTask.id,
                    number: subTask.subTaskNumber
                },
                hoursSpent: parseFloat(hourTracker.hoursSpent).toFixed(2),
                date: moment(hourTracker.date).format('DD/MM/YYYY'),
                notes: hourTracker.notes
            };
        });
        return hourTrackerRows;
    }

    setDeleteMode(payload) {
        this.deleteMode = payload;
    }

    changeTaskGroupView(viewType) {
        this.taskGroupViewType = viewType;
    }

    scopesSortBy(payload) {
        let scopesSortBy = this.scopesSortBy[payload.groupId];
        this.scopesSortBy[payload.groupId] = {
            sortBy: payload.sortBy,
            ascending: !scopesSortBy.ascending
        };
    }

    toggleSubTaskModal() {
        this.isOpenSubTaskModel = !this.isOpenSubTaskModel;
        this.viewSubTask = false;
        this.selectedSubTask = null;
        this.resetError();
    }

    addLoader(type) {
        this.loader[type] = true;
    }

    setDropableTaskGroup(groupId) {
        this.dropableTaskGroup = groupId;
    }

    setChangeTaskGroup(payload) {
        this.changeTaskGroup = payload;
    }

    changeCommentText(commentText) {
        this.commentText = commentText;
    }

    addTaskGroupSuccess(taskGroup) {
        this.taskGroups.push(taskGroup);
        this.scopesSortBy[taskGroup.id] = {
            sortBy: 'invoiceNumber',
            ascending: true
        };
        this.resetData();
    }

    getScopesSuccess(allScopes) {
        this.allScopes = allScopes;
    }

    showToasterNotification = (message) => {
        this.socketToastrMode.toastrNotificationMsg = message;
        this.socketToastrMode.showSocketToastr = true;
    };

    showScopeRevScopeNotification = (loggedInUser, item) => {
        let task = item.task;
        if (!task) {
            let archivedScope = find(this.archivedScopes, (currentArchivedScope) => {
                return currentArchivedScope.id === item.id;
            });
            task = archivedScope.task;
        }
        if (task.createdBy === loggedInUser._id ||
            item.engineerDetails && item.engineerDetails.engineer._id === loggedInUser._id ||
            item.drafterDetails && item.drafterDetails.drafter && item.drafterDetails.drafter._id === loggedInUser._id) {
            const message = 'Scope Updated in Project : Job# - ' + getTaskNumber(task) + '   Title - ' + task.title;
            this.showToasterNotification(message);
        }
    };

    showSocketNotification(payload) {
        let self = this;
        self.socketToastrMode = payload;
        let { loggedInUser, item } = self.socketToastrMode;

        switch (payload.itemType) {
            case 'scope':
                this.showScopeRevScopeNotification(loggedInUser, item);
                break;
            case 'rev scope':
                this.showScopeRevScopeNotification(loggedInUser, item);
                break;
            case 'task':
                let updatedTask = cloneDeep(self.socketToastrMode.item);
                let isMember = find(updatedTask.scopes, (updatedScope) => {
                    return updatedScope.engineerDetails && updatedScope.engineerDetails.engineer === loggedInUser._id ||
                        updatedScope.drafterDetails && updatedScope.drafterDetails.drafter === loggedInUser._id;
                });
                if (updatedTask.createdBy === loggedInUser._id || isMember) {
                    const message = 'Task Updated : Job# - ' + getTaskNumber(updatedTask) + '   Title - ' + updatedTask.title;
                    this.showToasterNotification(message);
                }
                break;
            case 'manager':
                let managerUpdatedTask = self.socketToastrMode.item;
                if (managerUpdatedTask.createdBy === loggedInUser._id) {
                    const message = 'Manager updated for  : Job# - ' + getTaskNumber(managerUpdatedTask) + '   Title - ' + managerUpdatedTask.title;
                    this.showToasterNotification(message);
                }
                break;
            case 'hourtracker':
                let scopes = this.getGroupScopes(payload.item.groupID);
                let scope = find(scopes, (currentScope) => {
                    return currentScope.id === payload.item.scopeID;
                });
                if (scope) {
                    if (scope.task.createdBy === loggedInUser._id ||
                        scope.engineerDetails && scope.engineerDetails.engineer._id === loggedInUser._id ||
                        scope.drafterDetails && scope.drafterDetails.drafter._id === loggedInUser._id) {
                        const message = 'Hourtracker Updated in Job# - ' + getTaskNumber(scope.task) + '   Title - ' + scope.task.title;
                        this.showToasterNotification(message);
                    }
                }
                break;
            default:
        }
    }

    updateMultipleScopeBySocketSuccess(scopes) {
        let self = this;
        scopes.map(scope => {
            self.updateScopeBySocketSuccess(scope);
        });
    }

    updateScopeBySocketSuccess(updatedScope) {
        let self = this;
        let groupScopes;
        let gridScope;

        groupScopes = self.getGroupScopes(updatedScope.group.id);
        gridScope = find(groupScopes, (groupScope) => {
            return groupScope.id === updatedScope.id;
        });

        // Update Scope Price And Description On Grid
        if (updatedScope.engineerDetails.engineer.id === self.loggedInUserID || updatedScope.managerDetails.manager.id === self.loggedInUserID || (updatedScope.drafterDetails.drafter && updatedScope.drafterDetails.drafter.id === self.loggedInUserID)) {
            if (!gridScope) {
                // in case of group change, remove updated scope from existing group and add to new group
                self.searchAndRemoveScopeFromGroup(updatedScope);
                groupScopes.unshift(updatedScope);
                this._updateManualSortScopes(groupScopes, updatedScope.group._id, LoginStore.getState().user._id);
            } else {
                gridScope = self._extend(gridScope, updatedScope);
                if (updatedScope.isArchived) {
                    remove(groupScopes, { id: gridScope.id });
                    if (updatedScope.group._id === Constant.TASK_GROUP__ID.COMPLETED_PROJECTS) {
                        TaskAction.getUsersCompletedScopes(LoginStore.getState().user._id, this.skipRange, 20);
                    }
                    this._updateManualSortScopes(groupScopes, updatedScope.group._id, LoginStore.getState().user._id);
                }
            }
        } else {
            remove(groupScopes, { id: updatedScope.id });
            this._updateManualSortScopes(groupScopes, updatedScope.group._id, LoginStore.getState().user._id);
        }

        // update scope in task form
        if (self.selectedTask && updatedScope.task.id === self.selectedTask.id) {
            let taskScope = find(self.selectedTask.scopes, (currentScope) => {
                return currentScope.id === updatedScope.id;
            });
            if (taskScope) {
                // if scope is archived then update it in milestone's selected scopes
                if (updatedScope.isArchived || taskScope.isArchived || taskScope.price !== updatedScope.price) {
                    self.handleArchivedAndRetrivalMilstones(self.selectedTask, updatedScope);
                }
                taskScope = self._extend(taskScope, updatedScope);
                if (updatedScope.isArchived) {
                    remove(self.selectedTask.scopes, { id: updatedScope.id });
                    self.archivedScopes.push(updatedScope);
                }
            } else {
                taskScope = find(self.archivedScopes, (archivedScope) => {
                    return archivedScope.id === updatedScope.id;
                });
                if (taskScope) {
                    // if scope is archived then update it in milestone's selected scopes
                    if (updatedScope.isArchived || taskScope.isArchived || taskScope.price !== updatedScope.price) {
                        self.handleArchivedAndRetrivalMilstones(self.selectedTask, updatedScope);
                    }
                    let hourTrackerScope = find(updatedScope.task.scopes, (currentScope) => {
                        if (currentScope.id) {
                            return currentScope.id === updatedScope.id;
                        } else {
                            return currentScope === updatedScope._id
                        }

                    });
                    if (hourTrackerScope) {
                        let hourTrackerHours = self.getEngineeringAndDraftingHours(taskScope.hourTrackers);
                        updatedScope.finalEngineeringHours = hourTrackerHours.finalEngineeringHours;
                        updatedScope.finalDraftingHours = hourTrackerHours.finalDraftingHours;
                    }
                    self.selectedTask.scopes.push(updatedScope);
                    remove(self.archivedScopes, { id: taskScope.id });
                }
            }

            // update final engineering and final drafting hours on task form
            let hours = self.getEngineeringAndDraftingHours(taskScope.hourTrackers);
            taskScope.finalEngineeringHours = hours.finalEngineeringHours;
            taskScope.finalDraftingHours = hours.finalDraftingHours;

            // update final engineering and final drafting hours on milestone
            let hourTrackerScope = find(updatedScope.task.scopes, (currentScope) => {
                if (currentScope.id) {
                    return currentScope.id === updatedScope.id;
                } else {
                    return currentScope === updatedScope._id
                }

            });
            if (hourTrackerScope) {
                let hourTrackerHours = self.getEngineeringAndDraftingHours(taskScope.hourTrackers);
                taskScope.finalEngineeringHours = hourTrackerHours.finalEngineeringHours;
                taskScope.finalDraftingHours = hourTrackerHours.finalDraftingHours;
            }
        }
        /* Update urgent and non-urgent hours of logged in user in user avatar */
        if (self.canUpdateLoggedInUser && self.loggedInUserID) {
            let totalHours = self.getUrgentNonUrgentHoursOfUser(self.loggedInUserID);
            let userData = {
                id: self.loggedInUserID,
                urgentHours: totalHours.totalUrgentHours,
                nonUrgentHours: totalHours.totalNonUrgentHours
            };
            setTimeout(() => {
                LoginAction.updateLoggedInUserSuccess(userData);
            }, 30);
            self.canUpdateLoggedInUser = false;
        }

    }

    updateActiveGridScope = (scopes) => {
        this.confirmationPopuData = null;
        let bidScopes = cloneDeep(this.bidsScopes);
        let nonArchivedScopes = [];
        scopes.map(scope => {
            if (!scope.isArchived) {
                nonArchivedScopes.push(scope);
                bidScopes.map((bidScope, index) => {
                    if (bidScope.id === scope.id) {
                        bidScopes.splice(index, 1);
                    }
                });
            }
        });

        if (this.selectedTask) {
            this.selectedTask.scopes = nonArchivedScopes;
        }
        this.bidsScopes = cloneDeep(bidScopes);
        this.activeScopes = nonArchivedScopes.concat(this.activeScopes);
    };

    closeCongratulationsPopup() {
        this.showCongratulationsPopup = false;
    }

    showCongratulationsPopup(updatedScope) {
        this.showCongratulationsPopup = true;
    }

    updateScopeSuccess(updatedScope) {
        let self = this;
        let groupScopes;
        let gridScope;
        this.confirmationPopuData = null;
        groupScopes = self.getGroupScopes(updatedScope.group.id);
        gridScope = find(groupScopes, (groupScope) => {
            return groupScope.id === updatedScope.id;
        });

        // Update Scope Price And Description On Grid
        if (gridScope) {
            gridScope = self._extend(gridScope, updatedScope);
            if (updatedScope.isArchived) {
                remove(groupScopes, { id: gridScope.id });
                if (updatedScope.group._id === Constant.TASK_GROUP__ID.COMPLETED_PROJECTS) {
                    TaskAction.getUsersCompletedScopes(LoginStore.getState().user._id, this.skipRange, 20);
                }
                this._updateManualSortScopes(groupScopes, updatedScope.group._id, LoginStore.getState().user._id);
            }
        } else {
            // in case of group change, remove updated scope from existing group and add to new group
            // or scope is restoring then push the scope to its group
            self.searchAndRemoveScopeFromGroup(updatedScope);
            groupScopes.unshift(updatedScope);
            this._updateManualSortScopes(groupScopes, updatedScope.group._id, LoginStore.getState().user._id);
        }

        // update scope in task form
        if (self.selectedTask) {
            let taskScope = find(self.selectedTask.scopes, (currentScope) => {
                return currentScope.id === updatedScope.id;
            });
            if (taskScope) {
                // if scope is archived then update it in milestone's selected scopes
                if (updatedScope.isArchived || taskScope.isArchived || taskScope.price !== updatedScope.price || (self.oldData.objectType === 'scope' && self.oldData.entityType === 'price' && self.oldData.data.price !== updatedScope.price)) {
                    self.handleArchivedAndRetrivalMilstones(self.selectedTask, updatedScope);
                }
                taskScope = self._extend(taskScope, updatedScope);
                if (taskScope.isArchived) {
                    remove(self.selectedTask.scopes, { id: taskScope.id });
                    self.archivedScopes.push(taskScope);
                }
            } else {
                taskScope = find(self.archivedScopes, (archivedScope) => {
                    return archivedScope.id === updatedScope.id;
                });
                if (taskScope) {
                    // if scope is archived then update it in milestone's selected scopes
                    if (updatedScope.isArchived || taskScope.isArchived || taskScope.price !== updatedScope.price || (self.oldData.objectType === 'scope' && self.oldData.entityType === 'price' && self.oldData.data.price !== updatedScope.price)) {
                        self.handleArchivedAndRetrivalMilstones(self.selectedTask, updatedScope);
                    }
                    taskScope = self._extend(taskScope, updatedScope);
                    self.selectedTask.scopes.push(taskScope);
                    remove(self.archivedScopes, { id: taskScope.id });
                }
            }

            // update final engineering and final drafting hours on task form
            let hours = self.getEngineeringAndDraftingHours(taskScope.hourTrackers);
            taskScope.finalEngineeringHours = hours.finalEngineeringHours;
            taskScope.finalDraftingHours = hours.finalDraftingHours;

            // update final engineering and final drafting hours on milestone
            let hourTrackerScope = find(taskScope.task.scopes, (currentScope) => {
                return currentScope.id === taskScope.id;
            });
            if (hourTrackerScope) {
                let hourTrackerHours = self.getEngineeringAndDraftingHours(taskScope.hourTrackers);
                taskScope.finalEngineeringHours = hourTrackerHours.finalEngineeringHours;
                taskScope.finalDraftingHours = hourTrackerHours.finalDraftingHours;
            }
        }

        // update user's urgent and non-urgent hours in user avatar
        if (self.canUpdateLoggedInUser && self.loggedInUserID) {
            let totalHours = self.getUrgentNonUrgentHoursOfUser(self.loggedInUserID);
            let userData = {
                id: self.loggedInUserID,
                urgentHours: totalHours.totalUrgentHours,
                nonUrgentHours: totalHours.totalNonUrgentHours
            };
            setTimeout(() => {
                LoginAction.updateLoggedInUserSuccess(userData);
            }, 30);
            self.canUpdateLoggedInUser = false;
        }
        self.resetData();
    }

    handleArchivedAndRetrivalMilstones = (selectedTask, updatedScope) => {
        this.handleScopeArchiveRetrievalInMileStonesSelectedScopes(selectedTask.agreements, updatedScope);
        this.handleScopeArchiveRetrievalInMileStonesSelectedScopes(selectedTask.modifiedAgreements, updatedScope);
        this.handleScopeArchiveRetrievalInMileStonesSelectedScopes(selectedTask.masterAgreements, updatedScope);
        this.handleScopeArchiveRetrievalInMileStonesSelectedScopes(selectedTask.clientAgreements, updatedScope);
        this.handleScopeArchiveRetrievalInMileStonesSelectedScopes(selectedTask.purchaseOrders, updatedScope);
        this.handleScopeArchiveRetrievalInMileStonesSelectedScopes(selectedTask.invoices, updatedScope);
    };

    handleScopeArchiveRetrievalInMileStonesSelectedScopes(milestones, updatedScope) {
        let milestonesWithSelectedScope = filter(milestones, (milestone) => {
            return milestone.hasOwnProperty('selectedScopes') && find(milestone.selectedScopes, (selectedScope) => {
                return selectedScope.scope && selectedScope.scope.id === updatedScope.id || selectedScope.id === updatedScope.id
            })
        });

        forEach(milestonesWithSelectedScope, (milestoneWithSelectedScope) => {
            let selectedScopeInMilestone = find(milestoneWithSelectedScope.selectedScopes, (selectedScope) => {
                if (selectedScope.scope) {
                    return selectedScope.scope.id === updatedScope.id;
                } else {
                    return selectedScope.id === updatedScope.id;
                }
            });
            if (selectedScopeInMilestone) {
                if (selectedScopeInMilestone.scope) {
                    selectedScopeInMilestone.scope = this._extend(selectedScopeInMilestone.scope, updatedScope);
                } else {
                    selectedScopeInMilestone = this._extend(selectedScopeInMilestone, updatedScope);
                }

            }
        });

    }

    updateTaskSuccess(task) {
        let self = this;
        let maxNumber = 0;

        if (task.invoices) {
            task.invoices.map((invoice) => {
                maxNumber = invoice.number >= maxNumber ? invoice.number : maxNumber;
            });
        }
        // Updated price of all invoiced if new invoice is added with new full scope price
        if (task._savedInvoice) {
            if (task.invoices) {
                map(task.invoices, invoice => {
                    map(invoice.selectedScopes, selectedScope => {
                        map(task._savedInvoice.savedInvoice.selectedScopes, updatedScope => {
                            if (updatedScope.scope.id === selectedScope.scope.id) {
                                selectedScope.scope.price = updatedScope.scope.price;
                                // update Grid scopes
                                let groupScopes = self.getGroupScopes(updatedScope.scope.group.id);
                                let gridScope = find(groupScopes, (groupScope) => {
                                    return groupScope.id === updatedScope.scope.id;
                                });

                                gridScope.price = updatedScope.scope.price;
                            }
                        });
                    });
                });
            }

            if (self.selectedTask && self.selectedTask.id === task.id) {
                map(task._savedInvoice.savedInvoice.selectedScopes, updatedScope => {
                    map(self.selectedTask.scopes, scope => {
                        if (scope.id === updatedScope.scope.id) {
                            scope.price = updatedScope.scope.price;
                        }
                    });
                });
            }
        }

        self.maxInvoiceNumber = maxNumber;
        self.removeArchivedDataFromTask(task);
        if (self.selectedTask && self.selectedTask.id === task.id) {
            self.selectedTask = self._extend(self.selectedTask, task);
        }
        forEach(task.scopes, (scope) => {
            let hours = self.getEngineeringAndDraftingHours(scope.hourTrackers);
            scope.finalEngineeringHours = hours.finalEngineeringHours;
            scope.finalDraftingHours = hours.finalDraftingHours;
            let groupScopes = self.getGroupScopes(scope.group.id);
            let gridScope = find(groupScopes, (groupScope) => {
                return groupScope.id === scope.id;
            });
            if (self.loggedInUserID) {
                if (gridScope) {

                    // remove scope from group if user is not part of it
                    if (scope.managerDetails.manager.id !== self.loggedInUserID &&
                        scope.engineerDetails.engineer.id !== self.loggedInUserID &&
                        scope.drafterDetails.drafter && scope.drafterDetails.drafter.id !== self.loggedInUserID) {
                        remove(groupScopes, { id: gridScope.id });
                        this._updateManualSortScopes(groupScopes, gridScope.group._id, LoginStore.getState().user._id);

                    } else {
                        // update scope in the relevent group
                        gridScope = self._extend(gridScope, scope);
                        gridScope.task = pick(task, ['agreements', 'clientAgreements', 'masterAgreements', 'modifiedAgreements', 'purchaseOrders', 'invoices', 'teamMembers', '_id', 'id', 'city', 'state', 'title', 'taskNumber', 'createdBy', 'createdAt', 'contractor', 'isBidding', 'isFromTaskGroup']);
                    }
                } else {
                    // if its new scope and user is part of it then add it to groupscopes
                    if (scope.managerDetails.manager.id === self.loggedInUserID ||
                        scope.engineerDetails.engineer.id === self.loggedInUserID ||
                        scope.drafterDetails.drafter && scope.drafterDetails.drafter.id === self.loggedInUserID) {
                        let newScope = cloneDeep(scope);
                        newScope.task = pick(task, ['agreements', 'clientAgreements', 'masterAgreements', 'modifiedAgreements', 'purchaseOrders', 'invoices', 'teamMembers', '_id', 'id', 'city', 'state', 'title', 'taskNumber', 'createdBy', 'createdAt', 'contractor', 'isBidding', 'isFromTaskGroup']);
                        groupScopes.unshift(newScope);
                        this._updateManualSortScopes(groupScopes, newScope.group._id, LoginStore.getState().user._id);
                    }
                }
            } else {
                if (gridScope) {
                    gridScope = self._extend(gridScope, scope);
                    gridScope.task = pick(task, ['agreements', 'clientAgreements', 'masterAgreements', 'modifiedAgreements', 'purchaseOrders', 'invoices', 'teamMembers', '_id', 'id', 'city', 'state', 'title', 'taskNumber', 'createdBy', 'createdAt', 'contractor', 'isBidding', 'isFromTaskGroup']);
                }
            }
        });
        /* Update urgent and non-urgent hours of logged in user */
        if (self.canUpdateLoggedInUser && self.loggedInUserID) {
            let totalHours = self.getUrgentNonUrgentHoursOfUser(self.loggedInUserID);
            let userData = {
                id: self.loggedInUserID,
                urgentHours: totalHours.totalUrgentHours,
                nonUrgentHours: totalHours.totalNonUrgentHours
            };
            setTimeout(() => {
                LoginAction.updateLoggedInUserSuccess(userData);
            }, 30);
            self.canUpdateLoggedInUser = false;
        }
        self.resetData();
    }

    _extend(obj, src) {
        if (isArray(src)) {
            obj = cloneDeep(src);
        } else {
            Object.keys(src).forEach(function (key) {
                if (isArray(key)) {
                    obj[key] = cloneDeep(src[key]);
                } else {
                    obj[key] = src[key];
                }
            });
        }
        return obj;
    }

    updateTaskBySocketSuccess(newTask) {
        let self = this;
        let max = 0;
        newTask.invoices.map((invoice) => {
            max = invoice.number >= max ? invoice.number : max;
        });
        self.maxInvoiceNumber = max;

        if (self.selectedTask && self.selectedTask.id === newTask.id) {
            self.removeArchivedDataFromTask(newTask);
            self.selectedTask = self._extend(self.selectedTask, newTask);
        }

        forEach(newTask.scopes, (scope) => {
            let hours = self.getEngineeringAndDraftingHours(scope.hourTrackers);
            scope.finalEngineeringHours = hours.finalEngineeringHours;
            scope.finalDraftingHours = hours.finalDraftingHours;
            let groupScopes = self.getGroupScopes(scope.group.id);
            let gridScope = find(groupScopes, (groupScope) => {
                return groupScope.id === scope.id;
            });
            forEach(groupScopes, (groupScope) => {
                if (groupScope.task.id === newTask.id) {
                    groupScope.task = self._extend(groupScope.task, newTask);
                }
            });
            if (self.loggedInUserID) {
                if (gridScope) {
                    // remove scope from group if user is not part of it
                    if (scope.managerDetails.manager.id !== self.loggedInUserID &&
                        scope.engineerDetails.engineer.id !== self.loggedInUserID &&
                        scope.drafterDetails.drafter && scope.drafterDetails.drafter.id !== self.loggedInUserID) {
                        remove(groupScopes, { id: gridScope.id });
                        this._updateManualSortScopes(groupScopes, gridScope.group._id, LoginStore.getState().user._id);
                    } else {
                        // update scope in the relevent group
                        gridScope = self._extend(gridScope, scope);
                        gridScope.task = pick(newTask, ['agreements', 'clientAgreements', 'masterAgreements', 'modifiedAgreements', 'purchaseOrders', 'invoices', 'teamMembers', '_id', 'id', 'city', 'state', 'title', 'taskNumber', 'createdBy', 'createdAt', 'contractor', 'isBidding', 'isFromTaskGroup']);
                    }
                } else {
                    // if its new scope and user is part of it then add it to groupscopes
                    if (scope.managerDetails.manager.id === self.loggedInUserID ||
                        scope.engineerDetails.engineer.id === self.loggedInUserID ||
                        scope.drafterDetails.drafter && scope.drafterDetails.drafter.id === self.loggedInUserID) {
                        let newScope = cloneDeep(scope);
                        newScope.task = pick(newTask, ['agreements', 'clientAgreements', 'masterAgreements', 'modifiedAgreements', 'purchaseOrders', 'invoices', 'teamMembers', '_id', 'id', 'city', 'state', 'title', 'taskNumber', 'createdBy', 'createdAt', 'contractor', 'isBidding', 'isFromTaskGroup']);
                        groupScopes.unshift(newScope);
                        this._updateManualSortScopes(groupScopes, scope.group._id, LoginStore.getState().user._id);
                    }
                }
            } else {
                if (gridScope) {
                    gridScope = self._extend(gridScope, scope);
                    gridScope.task = pick(newTask, ['agreements', 'clientAgreements', 'masterAgreements', 'modifiedAgreements', 'purchaseOrders', 'invoices', 'teamMembers', '_id', 'id', 'city', 'state', 'title', 'taskNumber', 'createdBy', 'createdAt', 'contractor', 'isBidding', 'isFromTaskGroup']);
                }
            }
        });

        /* Update urgent and non-urgent hours of logged in user */
        if (self.canUpdateLoggedInUser && self.loggedInUserID) {
            let totalHours = self.getUrgentNonUrgentHoursOfUser(self.loggedInUserID);
            let userData = {
                id: self.loggedInUserID,
                urgentHours: totalHours.totalUrgentHours,
                nonUrgentHours: totalHours.totalNonUrgentHours
            };
            setTimeout(() => {
                LoginAction.updateLoggedInUserSuccess(userData);
            }, 30);
            self.canUpdateLoggedInUser = false;
        }
    }

    addTaskSuccess(task) {
        let self = this;
        let max = 0;
        task.invoices.map((invoice) => {
            max = invoice.number >= max ? invoice.number : max;
        });
        self.maxInvoiceNumber = max;
        const manualSortedScopes = JSON.parse(localStorage.getItem('manualSortedScopes'));
        self.isViewTask = true;
        self.isNewTask = true;
        self.selectedTask = task;
        let groupScopes = self.getGroupScopes(task.scopes[0].group.id);
        // forIn(manualSortedScopes[task.createdBy][task.scopes[0].group._id], (value, key) => {
        //     manualSortedScopes[task.createdBy][task.scopes[0].group._id][key] = value + task.scopes.length;
        // });
        forEach(task.scopes, (scope, index) => {
            // manualSortedScopes[task.createdBy][scope.group._id][scope.id] = index;
            let hours = self.getEngineeringAndDraftingHours(scope.hourTrackers);
            scope.finalEngineeringHours = hours.finalEngineeringHours;
            scope.finalDraftingHours = hours.finalDraftingHours;
            groupScopes.unshift(scope);
        });
        this._updateManualSortScopes(groupScopes, task.scopes[0].group._id, LoginStore.getState().user._id);
        // localStorage.setItem('manualSortedScopes', JSON.stringify(manualSortedScopes));
        forEach(AppStore.getState().appSettings.attachments, (attachment) => {
            let id = attachment._id;
            self.addAttachment[id] = {
                editMode: false,
                progressStatus: 0
            };
        });

        /* Update urgent and non-urgent hours of logged in user */
        if (self.canUpdateLoggedInUser && self.loggedInUserID) {
            let totalHours = self.getUrgentNonUrgentHoursOfUser(self.loggedInUserID);
            let userData = {
                id: self.loggedInUserID,
                urgentHours: totalHours.totalUrgentHours,
                nonUrgentHours: totalHours.totalNonUrgentHours
            };
            setTimeout(() => {
                LoginAction.updateLoggedInUserSuccess(userData);
            }, 30);
            self.canUpdateLoggedInUser = false;
        }
        this.resetData();
    }

    addTaskBySocketSuccess(newTask) {
        let self = this;
        let index = indexOf(this.tasks, find(this.tasks, { id: newTask.id }));
        if (index === -1) {
            self.tasks.push(newTask);
            forEach(AppStore.getState().appSettings.attachments, (attachment) => {
                let id = attachment._id;
                self.addAttachment[id] = {
                    editMode: false,
                    progressStatus: 0
                };
            });
        }
        /* Update urgent and non-urgent hours of logged in user */
        if (self.canUpdateLoggedInUser && self.loggedInUserID) {
            let totalHours = self.getUrgentNonUrgentHoursOfUser(self.loggedInUserID);
            let userData = {
                id: self.loggedInUserID,
                urgentHours: totalHours.totalUrgentHours,
                nonUrgentHours: totalHours.totalNonUrgentHours
            };
            setTimeout(() => {
                LoginAction.updateLoggedInUserSuccess(userData);
            }, 30);
            self.canUpdateLoggedInUser = false;
        }
    }

    resetError() {
        this.error = {
            taskGroup: '',
            task: '',
            taskForm: '',
            subTask: '',
            HourTracker: '',
            tag: '',
            comment: '',
            editComment: '',
            po: '',
            csa: '',
            invoice: '',
            duplicateProjectNameMSG: ''
        };
    }

    setError(payload) {
        this.error[payload.type] = payload.errorMsg;
    }
    setDuplicateProjectTaskData(payload) {
        if (this.isOpenTaskModel) {
            this.error[payload.type] = payload.errorMsg;
            this.duplicateProjectName = payload.data;
        } else {
            this.error[payload.type] = '';
            this.duplicateProjectName = {};
        }
    }
    resetDuplicateProjectName(payload) {
        this.error[payload.type] = payload.errorMsg;
    }
    getTaskGroupsSuccess(taskGroups) {
        let self = this;
        self.taskGroups = taskGroups;
        forEach(taskGroups, (group) => {
            self.scopesSortBy[group.id] = {
                sortBy: 'invoiceNumber',
                ascending: true
            };
        });
    }

    getTaskSuccess(tasks) {
        let self = this;
        forEach(tasks, (task) => {
            forEach(task.scopes, (scope) => {
                let hours = self.getEngineeringAndDraftingHours(scope.hourTrackers);
                scope.finalEngineeringHours = hours.finalEngineeringHours;
                scope.finalDraftingHours = hours.finalDraftingHours;
            });
        });
        self.tasks = tasks;
    }

    getArchivedDataSuccess(archivedData) {
        let self = this;
        let task = cloneDeep(archivedData);
        self.archivedScopes = [];
        forEach(task.scopes, (scope) => {
            if (scope.isArchived) {
                self.archivedScopes.push(scope);
            }
        });

        self.archivedMileStones = {
            agreements: [],
            modifiedAgreements: [],
            masterAgreements: [],
            clientAgreements: [],
            purchaseOrders: [],
            invoices: [],
            drawings: [],
            custDrawings: [],
            calcs: [],
            letters: [],
            tabData: []
        };
        if (task.agreements.length > 0) {
            forEach(task.agreements, (agreement) => {
                if (agreement.isArchived) {
                    self.archivedMileStones.agreements.push(agreement);
                }
            });
        }

        if (task.modifiedAgreements.length > 0) {
            forEach(task.modifiedAgreements, (modifiedAgreement) => {
                if (modifiedAgreement.isArchived) {
                    self.archivedMileStones.modifiedAgreements.push(modifiedAgreement);
                }
            });
        }
        if (task.masterAgreements.length > 0) {
            forEach(task.masterAgreements, (masterAgreement) => {
                if (masterAgreement.isArchived) {
                    self.archivedMileStones.masterAgreements.push(masterAgreement);
                }
            });
        }
        if (task.clientAgreements.length > 0) {
            forEach(task.clientAgreements, (clientAgreement) => {
                if (clientAgreement.isArchived) {
                    self.archivedMileStones.clientAgreements.push(clientAgreement);
                }
            });
        }
        if (task.purchaseOrders.length > 0) {
            forEach(task.purchaseOrders, (purchaseOrder) => {
                if (purchaseOrder.isArchived) {
                    self.archivedMileStones.purchaseOrders.push(purchaseOrder);
                }
            });
        }
        if (task.invoices.length > 0) {
            forEach(task.invoices, (invoice) => {
                if (invoice.isArchived) {
                    self.archivedMileStones.invoices.push(invoice);
                }
            });
        }

        forEach(task.scopes, (scope) => {
            if (scope.drawings.length > 0) {
                forEach(scope.drawings, (drawing) => {
                    let currentScope = {
                        id: scope.id,
                        number: scope.number,
                        note: scope.note
                    };
                    if (drawing.isArchived) {
                        drawing.currentScope = currentScope;
                        self.archivedMileStones.drawings.push(drawing);
                    }
                });
            }

            if (scope.custDrawings.length > 0) {
                forEach(scope.custDrawings, (custDrawing) => {
                    let currentScope = {
                        id: scope.id,
                        number: scope.number,
                        note: scope.note
                    };
                    if (custDrawing.isArchived) {
                        custDrawing.currentScope = currentScope;
                        self.archivedMileStones.custDrawings.push(custDrawing);
                    }
                });
            }

            if (scope.calcs.length > 0) {
                forEach(scope.calcs, (calc) => {
                    let currentScope = {
                        id: scope.id,
                        number: scope.number,
                        note: scope.note
                    };
                    if (calc.isArchived) {
                        calc.currentScope = currentScope;
                        self.archivedMileStones.calcs.push(calc);
                    }
                });
            }

            if (scope.letters.length > 0) {
                forEach(scope.letters, (letter) => {
                    let currentScope = {
                        id: scope.id,
                        number: scope.number,
                        note: scope.note
                    };
                    if (letter.isArchived) {
                        letter.currentScope = currentScope;
                        self.archivedMileStones.letters.push(letter);
                    }
                });
            }

            if (scope.tabData.length > 0) {
                forEach(scope.tabData, (currentTabData) => {
                    let currentScope = {
                        id: scope.id,
                        number: scope.number,
                        note: scope.note
                    };
                    if (currentTabData.isArchived) {
                        currentTabData.currentScope = currentScope;
                        self.archivedMileStones.tabData.push(currentTabData);
                    }
                });
            }
        });
        self.resetData();
    }

    setViewArchivedScopesModal() {
        let self = this;
        self.isOpenViewArchivedScopeModal = true;
    }

    setViewArchivedMileStonesModal() {
        let self = this;
        self.isOpenViewArchivedMileStonesModal = true;
    }
    toggleTaskGroupModal() {
        this.isOpenGroupModel = !this.isOpenGroupModel;
        this.newTaskGroupName = '';
        this.resetError();
    }

    selectTask(payload) {
        let self = this;
        let task = cloneDeep(payload.task);
        let max = 0;
        task.invoices.map((invoice) => {
            max = invoice.number >= max ? invoice.number : max;
        });
        self.maxInvoiceNumber = max;
        self.isViewTask = payload.value;
        // archived data should not be displayed
        self.selectedTask = task;
        if (!self.selectedTask.modifiedAgreements) {
            self.selectedTask.modifiedAgreements = [];
        }

        if (!self.selectedTask.masterAgreements) {
            self.selectedTask.masterAgreements = [];
        }

        if (!self.selectedTask.clientAgreements) {
            self.selectedTask.clientAgreements = [];
        }

        forEach(AppStore.getState().appSettings.attachments, (attachment) => {
            let id = attachment._id;
            self.addAttachment[id] = {
                editMode: false,
                progressStatus: 0
            };
        });
        self.loader.viewTask = false;

        self.archivedScopes = [];
        forEach(self.selectedTask.scopes, (scope) => {
            if (scope.isArchived) {
                self.archivedScopes.push(scope);
            }
        });

        self.archivedMileStones = {
            agreements: [],
            modifiedAgreements: [],
            masterAgreements: [],
            clientAgreements: [],
            purchaseOrders: [],
            invoices: [],
            drawings: [],
            custDrawings: [],
            calcs: [],
            letters: [],
            tabData: []
        };
        if (self.selectedTask.agreements.length > 0) {
            forEach(task.agreements, (agreement) => {
                if (agreement.isArchived) {
                    self.archivedMileStones.agreements.push(agreement);
                }
            });
        }
        if (self.selectedTask.modifiedAgreements.length > 0) {
            forEach(task.modifiedAgreements, (modifiedAgreement) => {
                if (modifiedAgreement.isArchived) {
                    self.archivedMileStones.modifiedAgreements.push(modifiedAgreement);
                }
            });
        }
        if (self.selectedTask.masterAgreements.length > 0) {
            forEach(task.masterAgreements, (masterAgreement) => {
                if (masterAgreement.isArchived) {
                    self.archivedMileStones.masterAgreements.push(masterAgreement);
                }
            });
        }
        if (self.selectedTask.clientAgreements.length > 0) {
            forEach(task.clientAgreements, (clientAgreement) => {
                if (clientAgreement.isArchived) {
                    self.archivedMileStones.clientAgreements.push(clientAgreement);
                }
            });
        }
        if (self.selectedTask.purchaseOrders.length > 0) {
            forEach(task.purchaseOrders, (purchaseOrder) => {
                if (purchaseOrder.isArchived) {
                    self.archivedMileStones.purchaseOrders.push(purchaseOrder);
                }
            });
        }
        if (self.selectedTask.invoices.length > 0) {
            forEach(task.invoices, (invoice) => {
                if (invoice.isArchived) {
                    self.archivedMileStones.invoices.push(invoice);
                }
            });
        }

        forEach(self.selectedTask.scopes, (scope) => {
            if (scope.drawings.length > 0) {
                forEach(scope.drawings, (drawing) => {
                    let currentScope = {
                        id: scope.id,
                        number: scope.number,
                        note: scope.note
                    };
                    if (drawing.isArchived) {
                        drawing.currentScope = currentScope;
                        self.archivedMileStones.drawings.push(drawing);
                    }
                });
            }

            if (scope.custDrawings.length > 0) {
                forEach(scope.custDrawings, (custDrawing) => {
                    let currentScope = {
                        id: scope.id,
                        number: scope.number,
                        note: scope.note
                    };
                    if (custDrawing.isArchived) {
                        custDrawing.currentScope = currentScope;
                        self.archivedMileStones.custDrawings.push(custDrawing);
                    }
                });
            }

            if (scope.calcs.length > 0) {
                forEach(scope.calcs, (calc) => {
                    let currentScope = {
                        id: scope.id,
                        number: scope.number,
                        note: scope.note
                    };
                    if (calc.isArchived) {
                        calc.currentScope = currentScope;
                        self.archivedMileStones.calcs.push(calc);
                    }
                });
            }

            if (scope.letters.length > 0) {
                forEach(scope.letters, (letter) => {
                    let currentScope = {
                        id: scope.id,
                        number: scope.number,
                        note: scope.note
                    };
                    if (letter.isArchived) {
                        letter.currentScope = currentScope;
                        self.archivedMileStones.letters.push(letter);
                    }
                });
            }

            if (scope.tabData.length > 0) {
                forEach(scope.tabData, (currentTabData) => {
                    let currentScope = {
                        id: scope.id,
                        number: scope.number,
                        note: scope.note
                    };
                    if (currentTabData.isArchived) {
                        currentTabData.currentScope = currentScope;
                        self.archivedMileStones.tabData.push(currentTabData);
                    }
                });
            }
        });
        self.removeArchivedDataFromTask(self.selectedTask);
        forEach(self.selectedTask.scopes, (scope) => {
            let hours = self.getEngineeringAndDraftingHours(scope.hourTrackers);
            scope.finalEngineeringHours = hours.finalEngineeringHours;
            scope.finalDraftingHours = hours.finalDraftingHours;
        });
        self.resetData();
    }

    attachTaskFileSuccess(payload) {
        const self = this;
        let task = cloneDeep(payload.task);
        self.removeArchivedDataFromTask(task);
        if (self.selectedTask) {
            self.selectedTask = self._extend(self.selectedTask, task);
        } else {
            this.selectedTask = task;
        }
        this.isAttachmentUploading = false;
        this.addAttachment[payload.attachment._id] = {
            editMode: false,
            progressStatus: 100
        };
    }

    attachTaskFileFail(attachment) {
        this.addAttachment[attachment._id] = {
            editMode: false,
            progressStatus: 100
        };
        this.isAttachmentUploading = false;
    }

    updateProgressBar(payload) {
        this.addAttachment[payload.attachmentId].progressStatus = payload.completed;
    }

    setTemplate(templateId) {
        this.selectedTemplate = templateId;
    }

    isViewTask(value) {
        let dangligScopes = [];
        if (this.selectedTask) {
            forEach(this.selectedTask.scopes, (scope) => {
                if (scope && !scope.hasOwnProperty('_id')) {
                    dangligScopes.push(scope.id);
                }
            });
        }
        forEach(dangligScopes, (scope) => {
            this.deleteScopeAndPrice(scope);
        });

        this.isViewTask = value;
        if (value === false) {
            this.selectedTask = null;
        }
        this.archivedScopes = [];
        this.archivedMileStones = {
            agreements: [],
            modifiedAgreements: [],
            masterAgreements: [],
            clientAgreements: [],
            purchaseOrders: [],
            invoices: [],
            drawings: [],
            custDrawings: [],
            calcs: [],
            letters: [],
            tabData: []
        };
        this.office365Contacts = [];
        this.isNewTask = false;
        this.resetData();
    }

    setSelectedSubTask(payload) {
        this.isOpenSubTaskModel = true;
        this.selectedSubTask = payload.subTask;
        this.viewSubTask = payload.viewSubTask;
    }

    openTaskModal({ _id, id }) {
        this.isOpenTaskModel = true;
        this.selectedGroup = _id;
        let isBidding = id === Constant.TASK_GROUP_ID.BIDS ? true : false;
        let isFromTaskGroup = id === Constant.TASK_GROUP_ID.TASKS ? true : false;
        this.selectedTask = {
            teamMembers: [],
            isBidding: isBidding,
            isFromTaskGroup: isFromTaskGroup,
            modifiedAgreements: [],
            masterAgreements: [],
            clientAgreements: [],
            scopes: [
                {
                    id: shortid.generate() + shortid.generate(),
                    definition: 'Prepare PE stamped design plans and calculations for ',
                    note: '',
                    dueDate: new Date(),
                    price: 0,
                    group: _id,
                    status: '',
                    customerContact: '',
                    engineerDetails: {
                        engineer: {},
                        urgentHours: 0,
                        nonUrgentHours: 0,
                        status: ''
                    },
                    drafterDetails: {
                        drafter: null,
                        urgentHours: 0,
                        nonUrgentHours: 0,
                        status: ''
                    },
                    scopeInvoices: [
                        {
                            invoiceNumber: '',
                            billedAmount: ''
                        }
                    ],
                    custDrawings: [],
                    letters: [],
                    tabData: []
                }
            ]
        };
        if (this.selectedGroup === Constant.TASK_GROUP__ID.TASKS) {
            delete this.selectedTask.scopes[0].scopeInvoices;
        }
    }

    closeTaskModal() {
        this.isViewTask = false;
        this.isOpenTaskModel = false;
        this.isNewTask = false;
        this.selectedTask = null;
        this.office365Contacts = [];
        this.office365Contractors = [];
        this.archivedScopes = [];
        this.duplicateProjectName = {};
        this.archivedMileStones = {
            agreements: [],
            modifiedAgreements: [],
            masterAgreements: [],
            clientAgreements: [],
            purchaseOrders: [],
            invoices: [],
            drawings: [],
            custDrawings: [],
            calcs: [],
            letters: [],
            tabData: []
        };
        this.selectedScopeGroup = null;
        this.resetError();
    }

    toggleAddAttachment(attachmentId) {
        this.addAttachment[attachmentId].editMode = !this.addAttachment[attachmentId].editMode;
    }

    getEngineeringAndDraftingHours(hourTrackers) {
        let finalEngineeringHours = 0;
        let finalDraftingHours = 0;
        forEach(hourTrackers, (hourTracker) => {
            if (hourTracker.employee.role.id === Constant.ROLE_ID.ENGINEER || hourTracker.employee.role.id === Constant.ROLE_ID.MANAGER) {
                finalEngineeringHours = parseFloat(hourTracker.hoursSpent) + finalEngineeringHours;
            }
            if (hourTracker.employee.role.id === Constant.ROLE_ID.DRAFTER) {
                finalDraftingHours = parseFloat(hourTracker.hoursSpent) + finalDraftingHours;
            }
        });
        finalEngineeringHours = parseFloat(finalEngineeringHours).toFixed(2);
        finalDraftingHours = parseFloat(finalDraftingHours).toFixed(2);
        return { finalEngineeringHours, finalDraftingHours };
    }

    editHourTrackerSuccess(updatedScopePayload) {
        let oldScopeHours = this.getEngineeringAndDraftingHours(updatedScopePayload.oldScope.hourTrackers);
        updatedScopePayload.oldScope.finalEngineeringHours = oldScopeHours.finalEngineeringHours;
        updatedScopePayload.oldScope.finalDraftingHours = oldScopeHours.finalDraftingHours;

        let oldScopeIndex = indexOf(this.selectedTask.scopes, find(this.selectedTask.scopes, {
            id: updatedScopePayload.oldScope.id
        }));

        this.selectedTask.scopes.splice(oldScopeIndex, 1, updatedScopePayload.oldScope);

        if (updatedScopePayload.newScope) {
            let newScopeHours = this.getEngineeringAndDraftingHours(updatedScopePayload.newScope.hourTrackers);
            updatedScopePayload.newScope.finalEngineeringHours = newScopeHours.finalEngineeringHours;
            updatedScopePayload.newScope.finalDraftingHours = newScopeHours.finalDraftingHours;

            let newScopeIndex = indexOf(this.selectedTask.scopes, find(this.selectedTask.scopes, {
                id: updatedScopePayload.newScope.id
            }));

            this.selectedTask.scopes.splice(newScopeIndex, 1, updatedScopePayload.newScope);
        }

        let hourTrackers = [];
        let groupScopes = [];
        let gridScope = null;

        const { newScope, oldScope } = updatedScopePayload;

        if (newScope) {
            hourTrackers = newScope.hourTrackers;
            groupScopes = this.getGroupScopes(newScope.group.id);
            gridScope = find(groupScopes, (groupScope) => {
                return groupScope.id === newScope.id;
            });
        } else if (oldScope) {
            hourTrackers = oldScope.hourTrackers;
            groupScopes = this.getGroupScopes(oldScope.group.id);
            gridScope = find(groupScopes, (groupScope) => {
                return groupScope.id === oldScope.id;
            });
        }

        if (gridScope) {
            gridScope.hourTrackers = hourTrackers;
        }
        this.resetData();
    }

    updateHourTrackerForGridScope(hourTracker) {
        const groupScopes = this.getGroupScopes(hourTracker.scope.group.id);
        const gridScope = find(groupScopes, (groupScope) => {
            return groupScope.id === hourTracker.scope.id;
        });
        if (gridScope) {
            let trackers = gridScope.hourTrackers;
            let oldTracker = trackers.find(item => item._id === hourTracker._id);
            if (!oldTracker) {
                return // tracker not found
            }
            delete hourTracker.scope;
            delete hourTracker.employee;
            delete hourTracker.task;
            oldTracker = { ...oldTracker, ...hourTracker };

            gridScope.hourTrackers = trackers.map(item => item._id === oldTracker._id ? oldTracker : item);
        }
    }

    updateHourTrackerByGroupId(hourTracker) {
        const groupScopes = this.getGroupScopes(hourTracker.groupID);
        const gridScope = find(groupScopes, (groupScope) => {
            return groupScope.id === hourTracker.scopeID;
        });
        if (gridScope) {
            let trackers = gridScope.hourTrackers;
            let oldTracker = trackers.find(item => item.id === hourTracker.id);
            if (!oldTracker) {
                return // tracker not found
            }
            delete hourTracker.groupID;
            delete hourTracker.scopeID;
            oldTracker = { ...oldTracker, ...hourTracker };

            gridScope.hourTrackers = trackers.map(item => item._id === oldTracker._id ? oldTracker : item);
        }
    }

    updateHourTrackerBySocketSuccess(payload) {
        let self = this;
        let scopes;
        let scope;
        // let task = find(self.tasks, { id: payload.taskID });
        if (this.selectedTask) {
            scope = find(this.selectedTask.scopes, (currentScope) => {
                return currentScope.id === payload.scopeID;
            });
        } else {
            scopes = this.getGroupScopes(payload.groupID);
            scope = find(scopes, (currentScope) => {
                return currentScope.id === payload.scopeID;
            });
        }
        if (scope) {
            let updatedHourTracker = find(scope.hourTrackers, { id: payload.hourTracker.id });
            updatedHourTracker = self._extend(updatedHourTracker, payload.hourTracker);
            let hours = self.getEngineeringAndDraftingHours(scope.hourTrackers);
            scope.finalEngineeringHours = hours.finalEngineeringHours;
            scope.finalDraftingHours = hours.finalDraftingHours;
        }
    }

    toggleHourTrackerModal() {
        this.isOpenHourTrackerModal = !this.isOpenHourTrackerModal;
        this.selectedHourTracker = null;
        this.selectedHourTrackerScope = '';
        this.isViewNotes = false;
        this.resetError();
    }

    hourTrackerAction(payload) {
        this.isOpenHourTrackerModal = true;
        this.selectedHourTracker = payload.hourTracker;
        this.selectedHourTrackerScope = payload.scope;
        this.isViewNotes = payload.isViewNotes;
    }

    toggleFetchingContractors() {
        this.isFetchingContractors = !this.isFetchingContractors;
    }

    toggleFetchingContacts() {
        this.isFetchingContacts = !this.isFetchingContacts;
    }

    getOffice365ContractorsSuccess({ contractors, generalizeCompanyName }) {
        if (generalizeCompanyName) {
            const customers = uniqBy(contractors, 'companyName').map(contractor => ({ companyName: contractor.companyName, id: contractor.id }));
            this.office365Contractors = uniqBy([
                ...customers.map(customer => ({
                    ...customer,
                    companyName: `${customer.companyName.split('[')[0].trim()}${customer.companyName.indexOf('[') > -1 ? ' [All]' : ''}`
                })),
                ...customers
            ], 'companyName');
        } else {
            this.office365Contractors = uniqBy(contractors, 'companyName');
        }
        this.toggleFetchingContractors();
    }

    getOffice365ContactsSuccess(contacts) {
        let self = this;
        forEach(self.selectedTask.scopes, (scope) => {
            if (!scope._id) {
                scope.customerContact = null;
            }
        });
        this.office365Contacts = contacts;
        this.toggleFetchingContacts();
    }

    editComment(comment) {
        this.editedComment = comment;
        this.resetError();
    }

    selectScope(scopeId) {
        this.selectedScope = scopeId;
    }

    toggleTagLoading(isLoading) {
        this.isTagLoading = isLoading;
    }

    restoreSuccess(payload) {
        let index;
        switch (payload.objectType) {
            case Constant.DOCUMENT_TYPES.PURCHASE_ORDER:
                index = indexOf(this.archivedMileStones.purchaseOrders, find(this.archivedMileStones.purchaseOrders, {
                    id: payload.object.id
                }));
                if (index !== -1) {
                    this.archivedMileStones.purchaseOrders.splice(index, 1);
                    this.selectedTask.purchaseOrders.push(payload.object);
                }
                break;
            case Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT:
                index = indexOf(this.archivedMileStones.agreements, find(this.archivedMileStones.agreements, {
                    id: payload.object.id
                }));

                if (index !== -1) {
                    this.archivedMileStones.agreements.splice(index, 1);
                    this.selectedTask.agreements.push(payload.object);
                }
                break;
            case Constant.DOCUMENT_TYPES.MODIFIED_CUSTOMER_SERVICE_AGREEMENT:
                index = indexOf(this.archivedMileStones.modifiedAgreements, find(this.archivedMileStones.modifiedAgreements, {
                    id: payload.object.id
                }));

                if (index !== -1) {
                    this.archivedMileStones.modifiedAgreements.splice(index, 1);
                    this.selectedTask.modifiedAgreements.push(payload.object);
                }
                break;
            case Constant.DOCUMENT_TYPES.MASTER_AGREEMENT:
                index = indexOf(this.archivedMileStones.masterAgreements, find(this.archivedMileStones.masterAgreements, {
                    id: payload.object.id
                }));

                if (index !== -1) {
                    this.archivedMileStones.masterAgreements.splice(index, 1);
                    this.selectedTask.masterAgreements.push(payload.object);
                }
                break;
            case Constant.DOCUMENT_TYPES.CLIENT_AGREEMENT:
                index = indexOf(this.archivedMileStones.clientAgreements, find(this.archivedMileStones.clientAgreements, {
                    id: payload.object.id
                }));

                if (index !== -1) {
                    this.archivedMileStones.clientAgreements.splice(index, 1);
                    this.selectedTask.clientAgreements.push(payload.object);
                }
                break;
            case Constant.DOCUMENT_TYPES.INVOICE:
                index = indexOf(this.archivedMileStones.invoices, find(this.archivedMileStones.invoices, {
                    id: payload.object.id
                }));

                if (index !== -1) {
                    this.archivedMileStones.invoices.splice(index, 1);
                    this.selectedTask.invoices.push(payload.object);
                }
                break;
            default:
        }
        this.updateMileStonesOnGrid(payload.objectType, this.selectedTask);
        this.resetData();
    }

    archiveSuccess(payload) {
        let index;
        switch (payload.objectType) {
            case Constant.DOCUMENT_TYPES.PURCHASE_ORDER:
                index = indexOf(this.selectedTask.purchaseOrders, find(this.selectedTask.purchaseOrders, {
                    id: payload.object.id
                }));
                if (index !== -1) {
                    this.archivedMileStones.purchaseOrders.push(payload.object);
                    this.selectedTask.purchaseOrders.splice(index, 1);
                }
                break;
            case Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT:
                index = indexOf(this.selectedTask.agreements, find(this.selectedTask.agreements, {
                    id: payload.object.id
                }));

                if (index !== -1) {
                    this.archivedMileStones.agreements.push(payload.object);
                    this.selectedTask.agreements.splice(index, 1);
                }
                break;
            case Constant.DOCUMENT_TYPES.MODIFIED_CUSTOMER_SERVICE_AGREEMENT:
                index = indexOf(this.selectedTask.modifiedAgreements, find(this.selectedTask.modifiedAgreements, {
                    id: payload.object.id
                }));

                if (index !== -1) {
                    this.archivedMileStones.modifiedAgreements.push(payload.object);
                    this.selectedTask.modifiedAgreements.splice(index, 1);
                }
                break;
            case Constant.DOCUMENT_TYPES.MASTER_AGREEMENT:
                index = indexOf(this.selectedTask.masterAgreements, find(this.selectedTask.masterAgreements, {
                    id: payload.object.id
                }));

                if (index !== -1) {
                    this.archivedMileStones.masterAgreements.push(payload.object);
                    this.selectedTask.masterAgreements.splice(index, 1);
                }
                break;
            case Constant.DOCUMENT_TYPES.CLIENT_AGREEMENT:
                index = indexOf(this.selectedTask.clientAgreements, find(this.selectedTask.clientAgreements, {
                    id: payload.object.id
                }));

                if (index !== -1) {
                    this.archivedMileStones.clientAgreements.push(payload.object);
                    this.selectedTask.clientAgreements.splice(index, 1);
                }
                break;
            case Constant.DOCUMENT_TYPES.INVOICE:
                index = indexOf(this.selectedTask.invoices, find(this.selectedTask.invoices, {
                    id: payload.object.id
                }));

                if (index !== -1) {
                    this.archivedMileStones.invoices.push(payload.object);
                    this.selectedTask.invoices.splice(index, 1);
                }
                break;
            default:
        }
        if (payload.objectType === Constant.DOCUMENT_TYPES.PURCHASE_ORDER) {


        } else if (payload.objectType === Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT) {

        } else if (payload.objectType === Constant.DOCUMENT_TYPES.INVOICE) {

        }
        this.updateMileStonesOnGrid(payload.objectType, this.selectedTask);
        this.resetData();
    }

    updateMileStoneBySocketSuccess(updatedMileStone) {
        let self = this;
        let updatedDocument;
        if (self.selectedTask && updatedMileStone.taskID === self.selectedTask.id) {
            switch (updatedMileStone.objectType) {
                case Constant.DOCUMENT_TYPES.PURCHASE_ORDER:
                    updatedDocument = find(self.selectedTask.purchaseOrders, (purchaseOrder) => {
                        return purchaseOrder.id === updatedMileStone.purchaseOrder.id;
                    });
                    if (updatedDocument) {
                        updatedDocument = self._extend(updatedDocument, updatedMileStone.purchaseOrder);
                        if (updatedDocument.isArchived) {
                            self.archivedMileStones.purchaseOrders.push(updatedDocument);
                            remove(self.selectedTask.purchaseOrders, { id: updatedDocument.id });
                        }
                    } else {
                        updatedDocument = find(self.archivedMileStones.purchaseOrders, (purchaseOrder) => {
                            return purchaseOrder.id === updatedMileStone.purchaseOrder.id;
                        });
                        if (updatedDocument) {
                            self.selectedTask.purchaseOrders.push(updatedMileStone.purchaseOrder);
                            remove(self.archivedMileStones.purchaseOrders, { id: updatedDocument.id });
                        }
                    }
                    break;
                case Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT:
                    updatedDocument = find(self.selectedTask.agreements, (agreement) => {
                        return agreement.id === updatedMileStone.agreement.id;
                    });
                    if (updatedDocument) {
                        updatedDocument = self._extend(updatedDocument, updatedMileStone.agreement);
                        if (updatedDocument.isArchived) {
                            self.archivedMileStones.agreements.push(updatedDocument);
                            remove(self.selectedTask.agreements, { id: updatedDocument.id });
                        }
                    } else {
                        updatedDocument = find(self.archivedMileStones.agreements, (agreement) => {
                            return agreement.id === updatedMileStone.agreement.id;
                        });
                        if (updatedDocument) {
                            self.selectedTask.agreements.push(updatedDocument);
                            remove(self.archivedMileStones.agreements, { id: updatedDocument.id });
                        }
                    }
                    break;
                case Constant.DOCUMENT_TYPES.MODIFIED_CUSTOMER_SERVICE_AGREEMENT:
                    updatedDocument = find(self.selectedTask.modifiedAgreements, (modifiedAgreement) => {
                        return modifiedAgreement.id === updatedMileStone.modifiedAgreement.id;
                    });
                    if (updatedDocument) {
                        updatedDocument = self._extend(updatedDocument, updatedMileStone.modifiedAgreement);
                        if (updatedDocument.isArchived) {
                            self.archivedMileStones.modifiedAgreements.push(updatedDocument);
                            remove(self.selectedTask.modifiedAgreements, { id: updatedDocument.id });
                        }
                    } else {
                        updatedDocument = find(self.archivedMileStones.modifiedAgreements, (modifiedAgreement) => {
                            return modifiedAgreement.id === updatedMileStone.modifiedAgreement.id;
                        });
                        if (updatedDocument) {
                            self.selectedTask.modifiedAgreements.push(updatedDocument);
                            remove(self.archivedMileStones.modifiedAgreements, { id: updatedDocument.id });
                        }
                    }
                    break;
                case Constant.DOCUMENT_TYPES.MASTER_AGREEMENT:
                    updatedDocument = find(self.selectedTask.masterAgreements, (masterAgreement) => {
                        return masterAgreement.id === updatedMileStone.masterAgreement.id;
                    });
                    if (updatedDocument) {
                        updatedDocument = self._extend(updatedDocument, updatedMileStone.masterAgreement);
                        if (updatedDocument.isArchived) {
                            self.archivedMileStones.masterAgreements.push(updatedDocument);
                            remove(self.selectedTask.masterAgreements, { id: updatedDocument.id });
                        }
                    } else {
                        updatedDocument = find(self.archivedMileStones.masterAgreements, (masterAgreement) => {
                            return masterAgreement.id === updatedMileStone.masterAgreement.id;
                        });
                        if (updatedDocument) {
                            self.selectedTask.masterAgreements.push(updatedDocument);
                            remove(self.archivedMileStones.masterAgreements, { id: updatedDocument.id });
                        }
                    }
                    break;
                case Constant.DOCUMENT_TYPES.CLIENT_AGREEMENT:
                    updatedDocument = find(self.selectedTask.clientAgreements, (clientAgreement) => {
                        return clientAgreement.id === updatedMileStone.clientAgreement.id;
                    });
                    if (updatedDocument) {
                        updatedDocument = self._extend(updatedDocument, updatedMileStone.clientAgreement);
                        if (updatedDocument.isArchived) {
                            self.archivedMileStones.clientAgreements.push(updatedDocument);
                            remove(self.selectedTask.clientAgreements, { id: updatedDocument.id });
                        }
                    } else {
                        updatedDocument = find(self.archivedMileStones.clientAgreements, (clientAgreement) => {
                            return clientAgreement.id === updatedMileStone.clientAgreement.id;
                        });
                        if (updatedDocument) {
                            self.selectedTask.clientAgreements.push(updatedDocument);
                            remove(self.archivedMileStones.clientAgreements, { id: updatedDocument.id });
                        }
                    }
                    break;
                case Constant.DOCUMENT_TYPES.INVOICE:
                    updatedDocument = find(self.selectedTask.invoices, (invoice) => {
                        return invoice.id === updatedMileStone.invoice.id;
                    });

                    // Update scope price in all invoices -> selectedScops
                    self.selectedTask.invoices.map(invoice => {
                        invoice.selectedScopes.map(scope => {
                            updatedMileStone.invoice.selectedScopes.map(updatedScope => {
                                if (scope.scope.id == updatedScope.scope.id) {
                                    if (updatedScope.isPartial) {
                                        scope.amount = updatedScope.amount;
                                    } else {
                                        scope.scope.price = updatedScope.scope.price
                                    }
                                }
                            });
                        });
                    });

                    // Update grid scope price and definition on grid
                    let groupScopes;
                    let gridScope;
                    updatedMileStone.invoice.selectedScopes.map(scope => {
                        if (!scope.isPartial) {
                            let taskScope = find(self.selectedTask.scopes, (currentScope) => {
                                return currentScope.id === scope.scope.id;
                            });

                            if (taskScope) {
                                taskScope.price = scope.scope.price;
                                taskScope.definition = scope.scope.definition;
                            }
                        }
                    });

                    if (updatedDocument) {
                        updatedDocument = self._extend(updatedDocument, updatedMileStone.invoice);
                        if (updatedDocument.isArchived) {
                            self.archivedMileStones.invoices.push(updatedDocument);
                            remove(self.selectedTask.invoices, { id: updatedDocument.id });
                        }
                    } else {
                        updatedDocument = find(self.archivedMileStones.invoices, (invoice) => {
                            return invoice.id === updatedMileStone.invoice.id;
                        });
                        if (updatedDocument) {
                            self.selectedTask.invoices.push(updatedDocument);
                            remove(self.archivedMileStones.invoices, { id: updatedDocument.id });
                        }
                    }
                    break;
                default:
            }
        }
        self.updatedMilestoneOnGridBySocket(updatedMileStone);
    }

    updatedMilestoneOnGridBySocket(updatedMileStone) {
        let self = this;
        forEach(self.activeScopes, (activeScope) => {
            if (activeScope.task.id === updatedMileStone.taskID) {
                let updatedGridScopeDocument;
                switch (updatedMileStone.objectType) {
                    case Constant.DOCUMENT_TYPES.PURCHASE_ORDER:
                        updatedGridScopeDocument = find(activeScope.task.purchaseOrders, (purchaseOrder) => {
                            return purchaseOrder.id === updatedMileStone.purchaseOrder.id;
                        });
                        if (updatedGridScopeDocument) {
                            updatedGridScopeDocument = self._extend(updatedGridScopeDocument, updatedMileStone.purchaseOrder);
                            if (updatedGridScopeDocument.isArchived) {
                                remove(activeScope.task.purchaseOrders, { id: updatedGridScopeDocument.id });
                            }
                        } else {
                            activeScope.task.purchaseOrders.push(updatedMileStone.purchaseOrder);
                        }
                        break;
                    case Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT:
                        updatedGridScopeDocument = find(activeScope.task.agreements, (agreement) => {
                            return agreement.id === updatedMileStone.agreement.id;
                        });
                        if (updatedGridScopeDocument) {
                            updatedGridScopeDocument = self._extend(updatedGridScopeDocument, updatedMileStone.agreement);
                            if (updatedGridScopeDocument.isArchived) {
                                remove(activeScope.task.agreements, { id: updatedGridScopeDocument.id });
                            }
                        } else {
                            activeScope.task.agreements.push(updatedMileStone.agreement);
                        }
                        break;
                    case Constant.DOCUMENT_TYPES.INVOICE:
                        updatedGridScopeDocument = find(activeScope.task.invoices, (invoice) => {
                            return invoice.id === updatedMileStone.invoice.id;
                        });
                        if (updatedGridScopeDocument) {
                            updatedGridScopeDocument = self._extend(updatedGridScopeDocument, updatedMileStone.invoice);
                            if (updatedGridScopeDocument.isArchived) {
                                remove(activeScope.task.invoices, { id: updatedGridScopeDocument.id });
                            }
                        } else {
                            activeScope.task.invoices.push(updatedMileStone.invoice);
                        }
                        // Update selected task scope price and definition
                        updatedMileStone.invoice.selectedScopes.map((selectedScope) => {
                            let groupScopes = self.getGroupScopes(selectedScope.scope.group.id);
                            let gridScope = find(groupScopes, (groupScope) => {
                                return groupScope.id === selectedScope.scope.id;
                            });

                            // Update Scope Price And Description On Grid
                            if (gridScope) {
                                gridScope.price = selectedScope.scope.price;
                                gridScope.definition = selectedScope.scope.definition;
                            }
                        });
                        break;
                    default:
                }
            }
        });

        forEach(self.holdScopes, (holdScope) => {
            if (holdScope.task.id === updatedMileStone.taskID) {
                let updatedGridScopeDocument;
                switch (updatedMileStone.objectType) {
                    case Constant.DOCUMENT_TYPES.PURCHASE_ORDER:
                        updatedGridScopeDocument = find(holdScope.task.purchaseOrders, (purchaseOrder) => {
                            return purchaseOrder.id === updatedMileStone.purchaseOrder.id;
                        });
                        if (updatedGridScopeDocument) {
                            updatedGridScopeDocument = self._extend(updatedGridScopeDocument, updatedMileStone.purchaseOrder);
                            if (updatedGridScopeDocument.isArchived) {
                                remove(holdScope.task.purchaseOrders, { id: updatedGridScopeDocument.id });
                            }
                        } else {
                            holdScope.task.purchaseOrders.push(updatedMileStone.purchaseOrder);
                        }
                        break;
                    case Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT:
                        updatedGridScopeDocument = find(holdScope.task.agreements, (agreement) => {
                            return agreement.id === updatedMileStone.agreement.id;
                        });
                        if (updatedGridScopeDocument) {
                            updatedGridScopeDocument = self._extend(updatedGridScopeDocument, updatedMileStone.agreement);
                            if (updatedGridScopeDocument.isArchived) {
                                remove(holdScope.task.agreements, { id: updatedGridScopeDocument.id });
                            }
                        } else {
                            holdScope.task.agreements.push(updatedMileStone.agreement);
                        }
                        break;
                    case Constant.DOCUMENT_TYPES.INVOICE:
                        updatedGridScopeDocument = find(holdScope.task.invoices, (invoice) => {
                            return invoice.id === updatedMileStone.invoice.id;
                        });
                        if (updatedGridScopeDocument) {
                            updatedGridScopeDocument = self._extend(updatedGridScopeDocument, updatedMileStone.invoice);
                            if (updatedGridScopeDocument.isArchived) {
                                remove(holdScope.task.invoices, { id: updatedGridScopeDocument.id });
                            }
                        } else {
                            holdScope.task.invoices.push(updatedMileStone.invoice);
                        }
                        updatedMileStone.invoice.selectedScopes.map((selectedScope) => {
                            let groupScopes = self.getGroupScopes(selectedScope.scope.group.id);
                            let gridScope = find(groupScopes, (groupScope) => {
                                return groupScope.id === selectedScope.scope.id;
                            });

                            // Update Scope Price And Description On Grid
                            if (gridScope) {
                                gridScope.price = selectedScope.scope.price;
                                gridScope.definition = selectedScope.scope.definition;
                            }
                        });
                        break;
                    default:
                }
            }
        });

        forEach(self.bidsScopes, (bidScope) => {
            if (bidScope.task.id === updatedMileStone.taskID) {
                let updatedGridScopeDocument;
                switch (updatedMileStone.objectType) {
                    case Constant.DOCUMENT_TYPES.PURCHASE_ORDER:
                        updatedGridScopeDocument = find(bidScope.task.purchaseOrders, (purchaseOrder) => {
                            return purchaseOrder.id === updatedMileStone.purchaseOrder.id;
                        });
                        if (updatedGridScopeDocument) {
                            updatedGridScopeDocument = self._extend(updatedGridScopeDocument, updatedMileStone.purchaseOrder);
                            if (updatedGridScopeDocument.isArchived) {
                                remove(bidScope.task.purchaseOrders, { id: updatedGridScopeDocument.id });
                            }
                        } else {
                            bidScope.task.purchaseOrders.push(updatedMileStone.purchaseOrder);
                        }
                        break;
                    case Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT:
                        updatedGridScopeDocument = find(bidScope.task.agreements, (agreement) => {
                            return agreement.id === updatedMileStone.agreement.id;
                        });
                        if (updatedGridScopeDocument) {
                            updatedGridScopeDocument = self._extend(updatedGridScopeDocument, updatedMileStone.agreement);
                            if (updatedGridScopeDocument.isArchived) {
                                remove(bidScope.task.agreements, { id: updatedGridScopeDocument.id });
                            }
                        } else {
                            bidScope.task.agreements.push(updatedMileStone.agreement);
                        }
                        break;
                    case Constant.DOCUMENT_TYPES.INVOICE:
                        updatedGridScopeDocument = find(bidScope.task.invoices, (invoice) => {
                            return invoice.id === updatedMileStone.invoice.id;
                        });
                        if (updatedGridScopeDocument) {
                            updatedGridScopeDocument = self._extend(updatedGridScopeDocument, updatedMileStone.invoice);
                            if (updatedGridScopeDocument.isArchived) {
                                remove(bidScope.task.invoices, { id: updatedGridScopeDocument.id });
                            }
                        } else {
                            bidScope.task.invoices.push(updatedMileStone.invoice);
                        }
                        updatedMileStone.invoice.selectedScopes.map((selectedScope) => {
                            let groupScopes = self.getGroupScopes(selectedScope.scope.group.id);
                            let gridScope = find(groupScopes, (groupScope) => {
                                return groupScope.id === selectedScope.scope.id;
                            });

                            // Update Scope Price And Description On Grid
                            if (gridScope) {
                                gridScope.price = selectedScope.scope.price;
                                gridScope.definition = selectedScope.scope.definition;
                            }
                        });
                        break;
                    default:
                }
            }
        });

        forEach(self.taskScopes, (taskScope) => {
            if (taskScope.task.id === updatedMileStone.taskID) {
                let updatedGridScopeDocument;
                switch (updatedMileStone.objectType) {
                    case Constant.DOCUMENT_TYPES.PURCHASE_ORDER:
                        updatedGridScopeDocument = find(taskScope.task.purchaseOrders, (purchaseOrder) => {
                            return purchaseOrder.id === updatedMileStone.purchaseOrder.id;
                        });
                        if (updatedGridScopeDocument) {
                            updatedGridScopeDocument = self._extend(updatedGridScopeDocument, updatedMileStone.purchaseOrder);
                            if (updatedGridScopeDocument.isArchived) {
                                remove(taskScope.task.purchaseOrders, { id: updatedGridScopeDocument.id });
                            }
                        } else {
                            taskScope.task.purchaseOrders.push(updatedMileStone.purchaseOrder);
                        }
                        break;
                    case Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT:
                        updatedGridScopeDocument = find(taskScope.task.agreements, (agreement) => {
                            return agreement.id === updatedMileStone.agreement.id;
                        });
                        if (updatedGridScopeDocument) {
                            updatedGridScopeDocument = self._extend(updatedGridScopeDocument, updatedMileStone.agreement);
                            if (updatedGridScopeDocument.isArchived) {
                                remove(taskScope.task.agreements, { id: updatedGridScopeDocument.id });
                            }
                        } else {
                            taskScope.task.agreements.push(updatedMileStone.agreement);
                        }
                        break;
                    case Constant.DOCUMENT_TYPES.INVOICE:
                        updatedGridScopeDocument = find(taskScope.task.invoices, (invoice) => {
                            return invoice.id === updatedMileStone.invoice.id;
                        });
                        if (updatedGridScopeDocument) {
                            updatedGridScopeDocument = self._extend(updatedGridScopeDocument, updatedMileStone.invoice);
                            if (updatedGridScopeDocument.isArchived) {
                                remove(taskScope.task.invoices, { id: updatedGridScopeDocument.id });
                            }
                        } else {
                            taskScope.task.invoices.push(updatedMileStone.invoice);
                        }
                        updatedMileStone.invoice.selectedScopes.map((selectedScope) => {
                            let groupScopes = self.getGroupScopes(selectedScope.scope.group.id);
                            let gridScope = find(groupScopes, (groupScope) => {
                                return groupScope.id === selectedScope.scope.id;
                            });

                            // Update Scope Price And Description On Grid
                            if (gridScope) {
                                gridScope.price = selectedScope.scope.price;
                                gridScope.definition = selectedScope.scope.definition;
                            }
                        });
                        break;
                    default:
                }
            }
        });

        forEach(self.completedScopes, (completedScope) => {
            if (completedScope.task.id === updatedMileStone.taskID) {
                let updatedGridScopeDocument;
                switch (updatedMileStone.objectType) {
                    case Constant.DOCUMENT_TYPES.PURCHASE_ORDER:
                        updatedGridScopeDocument = find(completedScope.task.purchaseOrders, (purchaseOrder) => {
                            return purchaseOrder.id === updatedMileStone.purchaseOrder.id;
                        });
                        if (updatedGridScopeDocument) {
                            updatedGridScopeDocument = self._extend(updatedGridScopeDocument, updatedMileStone.purchaseOrder);
                            if (updatedGridScopeDocument.isArchived) {
                                remove(completedScope.task.purchaseOrders, { id: updatedGridScopeDocument.id });
                            }
                        } else {
                            completedScope.task.purchaseOrders.push(updatedMileStone.purchaseOrder);
                        }
                        break;
                    case Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT:
                        updatedGridScopeDocument = find(completedScope.task.agreements, (agreement) => {
                            return agreement.id === updatedMileStone.agreement.id;
                        });
                        if (updatedGridScopeDocument) {
                            updatedGridScopeDocument = self._extend(updatedGridScopeDocument, updatedMileStone.agreement);
                            if (updatedGridScopeDocument.isArchived) {
                                remove(completedScope.task.agreements, { id: updatedGridScopeDocument.id });
                            }
                        } else {
                            completedScope.task.agreements.push(updatedMileStone.agreement);
                        }
                        break;
                    case Constant.DOCUMENT_TYPES.INVOICE:
                        updatedGridScopeDocument = find(completedScope.task.invoices, (invoice) => {
                            return invoice.id === updatedMileStone.invoice.id;
                        });
                        if (updatedGridScopeDocument) {
                            updatedGridScopeDocument = self._extend(updatedGridScopeDocument, updatedMileStone.invoice);
                            if (updatedGridScopeDocument.isArchived) {
                                remove(completedScope.task.invoices, { id: updatedGridScopeDocument.id });
                            }
                        } else {
                            completedScope.task.invoices.push(updatedMileStone.invoice);
                        }
                        updatedMileStone.invoice.selectedScopes.map((selectedScope) => {
                            let groupScopes = self.getGroupScopes(selectedScope.scope.group.id);
                            let gridScope = find(groupScopes, (groupScope) => {
                                return groupScope.id === selectedScope.scope.id;
                            });

                            // Update Scope Price And Description On Grid
                            if (gridScope) {
                                gridScope.price = selectedScope.scope.price;
                                gridScope.definition = selectedScope.scope.definition;
                            }
                        });
                        break;
                    default:
                }
            }
        });
    }

    updateScopeTemplateBySocketSuccess(updatedSocketTemplate) {
        let self = this;
        let scope;
        let gridScope;
        let scopeOfArchivedThing;
        let updatingTemplate;
        if (self.selectedTask) {
            scope = find(self.selectedTask.scopes, (currentScope) => {
                return currentScope.id === updatedSocketTemplate.scopeID;
            });
            scopeOfArchivedThing = {
                id: scope.id,
                number: scope.number,
                note: scope.note
            };
            switch (updatedSocketTemplate.objectType) {
                case Constant.DOCUMENT_TYPES.CALC:
                    if (scope) {
                        updatingTemplate = find(scope.calcs, (calc) => {
                            return calc.id === updatedSocketTemplate.calc.id;
                        });
                        if (updatingTemplate) {
                            updatingTemplate = self._extend(updatingTemplate, updatedSocketTemplate.calc);
                            if (updatingTemplate.isArchived) {
                                updatingTemplate.currentScope = scopeOfArchivedThing;
                                self.archivedMileStones.calcs.push(updatingTemplate);
                                remove(scope.calcs, { id: updatingTemplate.id });
                            }
                        } else {
                            scope.calcs.push(updatedSocketTemplate.calc);
                            remove(self.archivedMileStones.calcs, { id: updatedSocketTemplate.calc.id });
                        }
                    }
                    break;
                case Constant.DOCUMENT_TYPES.DRAWING:
                    if (scope) {
                        updatingTemplate = find(scope.drawings, (drawing) => {
                            return drawing.id === updatedSocketTemplate.drawing.id;
                        });
                        if (updatingTemplate) {
                            updatingTemplate = self._extend(updatingTemplate, updatedSocketTemplate.drawing);
                            if (updatingTemplate.isArchived) {
                                updatingTemplate.currentScope = scopeOfArchivedThing;
                                self.archivedMileStones.drawings.push(updatingTemplate);
                                remove(scope.drawings, { id: updatingTemplate.id });
                            }
                        } else {
                            scope.drawings.push(updatedSocketTemplate.drawing);
                            remove(self.archivedMileStones.drawings, { id: updatedSocketTemplate.drawing.id });
                        }
                    }
                    break;
                case Constant.DOCUMENT_TYPES.CUST_DRAWING:
                    if (scope) {
                        updatingTemplate = find(scope.custDrawings, (custDrawing) => {
                            return custDrawing.id === updatedSocketTemplate.custDrawing.id;
                        });
                        if (updatingTemplate) {
                            updatingTemplate = self._extend(updatingTemplate, updatedSocketTemplate.custDrawing);
                            if (updatingTemplate.isArchived) {
                                updatingTemplate.currentScope = scopeOfArchivedThing;
                                self.archivedMileStones.custDrawings.push(updatingTemplate);
                                remove(scope.custDrawings, { id: updatingTemplate.id });
                            }
                        } else {
                            scope.custDrawings.push(updatedSocketTemplate.custDrawing);
                            remove(self.archivedMileStones.custDrawings, { id: updatedSocketTemplate.custDrawing.id });
                        }
                    }
                    break;
                case Constant.DOCUMENT_TYPES.LETTER:
                    if (scope) {
                        updatingTemplate = find(scope.letters, (letter) => {
                            return letter.id === updatedSocketTemplate.letter.id;
                        });
                        if (updatingTemplate) {
                            updatingTemplate = self._extend(updatingTemplate, updatedSocketTemplate.letter);
                            if (updatingTemplate.isArchived) {
                                updatingTemplate.currentScope = scopeOfArchivedThing;
                                self.archivedMileStones.letters.push(updatingTemplate);
                                remove(scope.letters, { id: updatingTemplate.id });
                            }
                        } else {
                            scope.letters.push(updatedSocketTemplate.letter);
                            remove(self.archivedMileStones.letters, { id: updatedSocketTemplate.letter.id });
                        }
                    }
                    break;
                case Constant.DOCUMENT_TYPES.TAB_DATA:
                    if (scope) {
                        updatingTemplate = find(scope.tabData, (currentTabData) => {
                            return currentTabData.id === updatedSocketTemplate.tabData.id;
                        });
                        if (updatingTemplate) {
                            updatingTemplate = self._extend(updatingTemplate, updatedSocketTemplate.tabData);
                            if (updatingTemplate.isArchived) {
                                updatingTemplate.currentScope = scopeOfArchivedThing;
                                self.archivedMileStones.tabData.push(updatingTemplate);
                                remove(scope.tabData, { id: updatingTemplate.id });
                            }
                        } else {
                            scope.tabData.push(updatedSocketTemplate.tabData);
                            remove(self.archivedMileStones.tabData, { id: updatedSocketTemplate.tabData.id });
                        }
                    }
                    break;
                default:
            }
        }

        // update calc on grid to display 'Y' or 'N'
        if (updatedSocketTemplate.objectType === Constant.DOCUMENT_TYPES.CALC) {
            let allScopes = concat(
                this.activeScopes,
                this.holdScopes,
                this.taskScopes,
                this.bidsScopes,
                this.completedScopes
            );
            gridScope = find(allScopes, (currentScope) => {
                return currentScope.id === updatedSocketTemplate.scopeID;
            });
            if (gridScope) {
                let updatedTemplate;
                updatedTemplate = find(gridScope.calcs, (gridCalc) => {
                    return gridCalc.id === updatedSocketTemplate.calc.id;
                });
                if (updatedTemplate) {
                    updatedTemplate = self._extend(updatedTemplate, updatedSocketTemplate.calc);
                    if (updatedTemplate.isArchived) {
                        remove(gridScope.calcs, { id: updatedTemplate.id });
                    }
                } else {
                    gridScope.calcs.push(updatedSocketTemplate.calc);
                }
            }
        }
    }

    updateMileStonesOnGrid(objectType, task) {
        forEach(task.scopes, (scope) => {
            let groupScopes = this.getGroupScopes(scope.group.id);
            let groupScope = find(groupScopes, (currentGroupScope) => {
                return currentGroupScope.id === scope.id;
            });
            if (groupScope) {
                switch (objectType) {
                    case Constant.DOCUMENT_TYPES.PURCHASE_ORDER:
                        groupScope.task.purchaseOrders = this._extend(groupScope.task.purchaseOrders, task.purchaseOrders);
                        break;
                    case Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT:
                        groupScope.task.agreements = this._extend(groupScope.task.agreements, task.agreements);
                        break;
                    case Constant.DOCUMENT_TYPES.MODIFIED_CUSTOMER_SERVICE_AGREEMENT:
                        groupScope.task.modifiedAgreements = this._extend(groupScope.task.modifiedAgreements, task.modifiedAgreements);
                        break;
                    case Constant.DOCUMENT_TYPES.MASTER_AGREEMENT:
                        groupScope.task.masterAgreements = this._extend(groupScope.task.masterAgreements, task.masterAgreements);
                        break;
                    case Constant.DOCUMENT_TYPES.CLIENT_AGREEMENT:
                        groupScope.task.clientAgreements = this._extend(groupScope.task.clientAgreements, task.clientAgreements);
                        break;
                    case Constant.DOCUMENT_TYPES.INVOICE:
                        groupScope.task.invoices = this._extend(groupScope.task.invoices, task.invoices);
                        break;
                    default:
                }
            }
        });
    }

    toggleStepStatusSuccess(payload) {
        const self = this;
        let index;
        switch (payload.objectType) {
            case Constant.DOCUMENT_TYPES.PURCHASE_ORDER:
                index = indexOf(self.selectedTask.purchaseOrders, find(self.selectedTask.purchaseOrders, {
                    id: payload.object.id
                }));
                self.selectedTask.purchaseOrders.splice(index, 1, payload.object);
                break;
            case Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT:
                index = indexOf(self.selectedTask.agreements, find(self.selectedTask.agreements, {
                    id: payload.object.id
                }));

                self.selectedTask.agreements.splice(index, 1, payload.object);
                break;
            case Constant.DOCUMENT_TYPES.MODIFIED_CUSTOMER_SERVICE_AGREEMENT:
                index = indexOf(self.selectedTask.modifiedAgreements, find(self.selectedTask.modifiedAgreements, {
                    id: payload.object.id
                }));

                self.selectedTask.modifiedAgreements.splice(index, 1, payload.object);
                break;
            case Constant.DOCUMENT_TYPES.MASTER_AGREEMENT:
                index = indexOf(self.selectedTask.masterAgreements, find(self.selectedTask.masterAgreements, {
                    id: payload.object.id
                }));

                self.selectedTask.masterAgreements.splice(index, 1, payload.object);
                break;
            case Constant.DOCUMENT_TYPES.CLIENT_AGREEMENT:
                index = indexOf(self.selectedTask.clientAgreements, find(self.selectedTask.clientAgreements, {
                    id: payload.object.id
                }));

                self.selectedTask.clientAgreements.splice(index, 1, payload.object);
                break;
            case Constant.DOCUMENT_TYPES.INVOICE:
                index = indexOf(self.selectedTask.invoices, find(self.selectedTask.invoices, {
                    id: payload.object.id
                }));

                self.selectedTask.invoices.splice(index, 1, payload.object);
                break;
        }

        self.updateMileStonesOnGrid(payload.objectType, self.selectedTask);
        self.resetData();
    }

    archiveScopeTemplateSuccess(payload) {
        let self = this;
        let index;
        let groupScopes;
        let gridScope;
        let scope = find(self.selectedTask.scopes, (scopeToFind) => {
            return scopeToFind.id === payload.scope.id;
        });
        let currentScope = {
            id: scope.id,
            number: scope.number,
            note: scope.note
        };

        if (scope) {
            switch (payload.objectType) {
                case Constant.DOCUMENT_TYPES.DRAWING:
                    index = indexOf(scope.drawings, find(scope.drawings, {
                        id: payload.object.id
                    }));
                    if (index !== -1) {
                        scope.drawings.splice(index, 1);
                        let archivedDrawing = payload.object;
                        archivedDrawing.currentScope = currentScope;
                        self.archivedMileStones.drawings.push(archivedDrawing);
                    }
                    groupScopes = this.getGroupScopes(scope.group.id);
                    gridScope = find(groupScopes, (groupScope) => {
                        return groupScope.id === scope.id;
                    });
                    gridScope.drawings = this._extend(gridScope.drawings, scope.drawings);
                    break;
                case Constant.DOCUMENT_TYPES.CUST_DRAWING:
                    index = indexOf(scope.custDrawings, find(scope.custDrawings, {
                        id: payload.object.id
                    }));
                    if (index !== -1) {
                        scope.custDrawings.splice(index, 1);
                        let archivedCustDrawing = payload.object;
                        archivedCustDrawing.currentScope = currentScope;
                        self.archivedMileStones.custDrawings.push(archivedCustDrawing);
                    }
                    groupScopes = this.getGroupScopes(scope.group.id);
                    gridScope = find(groupScopes, (groupScope) => {
                        return groupScope.id === scope.id;
                    });
                    gridScope.custDrawings = this._extend(gridScope.custDrawings, scope.custDrawings);
                    break;
                case Constant.DOCUMENT_TYPES.CALC:
                    index = indexOf(scope.calcs, find(scope.calcs, {
                        id: payload.object.id
                    }));
                    if (index !== -1) {
                        scope.calcs.splice(index, 1);
                        let archivedCalc = payload.object;
                        archivedCalc.currentScope = currentScope;
                        self.archivedMileStones.calcs.push(archivedCalc);
                    }
                    groupScopes = this.getGroupScopes(scope.group.id);
                    gridScope = find(groupScopes, (groupScope) => {
                        return groupScope.id === scope.id;
                    });
                    gridScope.calcs = this._extend(gridScope.calcs, scope.calcs);
                    break;
                case Constant.DOCUMENT_TYPES.LETTER:
                    index = indexOf(scope.letters, find(scope.letters, {
                        id: payload.object.id
                    }));
                    if (index !== -1) {
                        scope.letters.splice(index, 1);
                        let archivedLetter = payload.object;
                        archivedLetter.currentScope = currentScope;
                        self.archivedMileStones.letters.push(archivedLetter);
                    }
                    groupScopes = this.getGroupScopes(scope.group.id);
                    gridScope = find(groupScopes, (groupScope) => {
                        return groupScope.id === scope.id;
                    });
                    gridScope.letters = this._extend(gridScope.letters, scope.letters);
                    break;
                case Constant.DOCUMENT_TYPES.TAB_DATA:
                    index = indexOf(scope.tabData, find(scope.tabData, {
                        id: payload.object.id
                    }));
                    if (index !== -1) {
                        scope.tabData.splice(index, 1);
                        let archivedTabData = payload.object;
                        archivedTabData.currentScope = currentScope;
                        self.archivedMileStones.tabData.push(archivedTabData);
                    }
                    groupScopes = this.getGroupScopes(scope.group.id);
                    gridScope = find(groupScopes, (groupScope) => {
                        return groupScope.id === scope.id;
                    });
                    gridScope.tabData = this._extend(gridScope.tabData, scope.tabData);
                    break;
                default:
            }
        }
        this.resetData();
    }

    restoreScopeTemplateSuccess(payload) {
        let self = this;
        let index;
        let groupScopes;
        let gridScope;
        let scope = find(self.selectedTask.scopes, (scopeToFind) => {
            return scopeToFind.id === payload.scope.id;
        });

        if (scope) {
            switch (payload.objectType) {
                case Constant.DOCUMENT_TYPES.DRAWING:
                    index = indexOf(self.archivedMileStones.drawings, find(self.archivedMileStones.drawings, {
                        id: payload.object.id
                    }));
                    if (index !== -1) {
                        self.archivedMileStones.drawings.splice(index, 1);
                        let restoreIndex = indexOf(scope.drawings, find(scope.drawings, {
                            id: payload.object.id
                        }));
                        if (restoreIndex < 0) {
                            scope.drawings.push(payload.object);
                        }
                    }
                    groupScopes = this.getGroupScopes(scope.group.id);
                    gridScope = find(groupScopes, (groupScope) => {
                        return groupScope.id === scope.id;
                    });
                    gridScope.drawings = this._extend(gridScope.drawings, scope.drawings);
                    break;
                case Constant.DOCUMENT_TYPES.CUST_DRAWING:
                    index = indexOf(self.archivedMileStones.custDrawings, find(self.archivedMileStones.custDrawings, {
                        id: payload.object.id
                    }));
                    if (index !== -1) {
                        self.archivedMileStones.custDrawings.splice(index, 1);
                        let restoreIndex = indexOf(scope.custDrawings, find(scope.custDrawings, {
                            id: payload.object.id
                        }));
                        if (restoreIndex < 0) {
                            scope.custDrawings.push(payload.object);
                        }
                    }
                    groupScopes = this.getGroupScopes(scope.group.id);
                    gridScope = find(groupScopes, (groupScope) => {
                        return groupScope.id === scope.id;
                    });
                    gridScope.custDrawings = this._extend(gridScope.custDrawings, scope.custDrawings);
                    break;
                case Constant.DOCUMENT_TYPES.CALC:
                    index = indexOf(self.archivedMileStones.calcs, find(self.archivedMileStones.calcs, {
                        id: payload.object.id
                    }));
                    if (index !== -1) {
                        self.archivedMileStones.calcs.splice(index, 1);
                        let restoreIndex = indexOf(scope.calcs, find(scope.calcs, {
                            id: payload.object.id
                        }));
                        if (restoreIndex < 0) {
                            scope.calcs.push(payload.object);
                        }
                    }
                    groupScopes = this.getGroupScopes(scope.group.id);
                    gridScope = find(groupScopes, (groupScope) => {
                        return groupScope.id === scope.id;
                    });
                    gridScope.calcs = this._extend(gridScope.calcs, scope.calcs);
                    break;
                case Constant.DOCUMENT_TYPES.LETTER:
                    index = indexOf(self.archivedMileStones.letters, find(self.archivedMileStones.letters, {
                        id: payload.object.id
                    }));
                    if (index !== -1) {
                        self.archivedMileStones.letters.splice(index, 1);
                        let restoreIndex = indexOf(scope.letters, find(scope.letters, {
                            id: payload.object.id
                        }));
                        if (restoreIndex < 0) {
                            scope.letters.push(payload.object);
                        }
                    }
                    groupScopes = this.getGroupScopes(scope.group.id);
                    gridScope = find(groupScopes, (groupScope) => {
                        return groupScope.id === scope.id;
                    });
                    gridScope.letters = this._extend(gridScope.letters, scope.letters);
                    break;
                case Constant.DOCUMENT_TYPES.TAB_DATA:
                    index = indexOf(self.archivedMileStones.tabData, find(self.archivedMileStones.tabData, {
                        id: payload.object.id
                    }));
                    if (index !== -1) {
                        self.archivedMileStones.tabData.splice(index, 1);
                        let restoreIndex = indexOf(scope.tabData, find(scope.tabData, {
                            id: payload.object.id
                        }));
                        if (restoreIndex < 0) {
                            scope.tabData.push(payload.object);
                        }
                    }
                    groupScopes = this.getGroupScopes(scope.group.id);
                    gridScope = find(groupScopes, (groupScope) => {
                        return groupScope.id === scope.id;
                    });
                    gridScope.tabData = this._extend(gridScope.tabData, scope.tabData);
                    break;
                default:
            }
        }
        this.resetData();
    }

    toggleScopeStepStatusSuccess(payload) {
        let index;
        let groupScopes;
        let gridScope;
        let scope = find(this.selectedTask.scopes, (scopeToFind) => {
            return scopeToFind.id === payload.scope.id;
        });

        if (scope) {
            switch (payload.objectType) {
                case Constant.DOCUMENT_TYPES.DRAWING:
                    index = indexOf(scope.drawings, find(scope.drawings, {
                        id: payload.object.id
                    }));

                    scope.drawings.splice(index, 1, payload.object);
                    groupScopes = this.getGroupScopes(scope.group.id);
                    gridScope = find(groupScopes, (groupScope) => {
                        return groupScope.id === scope.id;
                    });
                    gridScope.drawings = this._extend(gridScope.drawings, scope.drawings);
                    break;
                case Constant.DOCUMENT_TYPES.CUST_DRAWING:
                    index = indexOf(scope.custDrawings, find(scope.custDrawings, {
                        id: payload.object.id
                    }));

                    scope.custDrawings.splice(index, 1, payload.object);
                    groupScopes = this.getGroupScopes(scope.group.id);
                    gridScope = find(groupScopes, (groupScope) => {
                        return groupScope.id === scope.id;
                    });
                    gridScope.custDrawings = this._extend(gridScope.custDrawings, scope.custDrawings);
                    break;
                case Constant.DOCUMENT_TYPES.CALC:
                    index = indexOf(scope.calcs, find(scope.calcs, {
                        id: payload.object.id
                    }));

                    scope.calcs.splice(index, 1, payload.object);
                    groupScopes = this.getGroupScopes(scope.group.id);
                    gridScope = find(groupScopes, (groupScope) => {
                        return groupScope.id === scope.id;
                    });
                    gridScope.calcs = this._extend(gridScope.calcs, scope.calcs);
                    break;
                case Constant.DOCUMENT_TYPES.LETTER:
                    index = indexOf(scope.letters, find(scope.letters, {
                        id: payload.object.id
                    }));

                    scope.letters.splice(index, 1, payload.object);
                    groupScopes = this.getGroupScopes(scope.group.id);
                    gridScope = find(groupScopes, (groupScope) => {
                        return groupScope.id === scope.id;
                    });
                    gridScope.letters = this._extend(gridScope.letters, scope.letters);
                    break;
                case Constant.DOCUMENT_TYPES.TAB_DATA:
                    index = indexOf(scope.tabData, find(scope.tabData, {
                        id: payload.object.id
                    }));

                    scope.tabData.splice(index, 1, payload.object);
                    groupScopes = this.getGroupScopes(scope.group.id);
                    gridScope = find(groupScopes, (groupScope) => {
                        return groupScope.id === scope.id;
                    });
                    gridScope.tabData = this._extend(gridScope.tabData, scope.tabData);
                    break;
                default:
            }
        }
        this.resetData();
    }

    toggleDocumentModel(isOpen) {
        this.openDocumentModel = isOpen;
    }

    handleAddDocument(fromDocument) {
        let self = this;
        this.openDocumentModel = true;

        this.isAddDocument = true;
        this.poData = {
            id: '',
            name: '',
            notes: '',
            signature: ''
        };
        this.csaData = this.getDefaultCSAData();
        this.invoiceData = {
            poNumber: '',
            hold: 'N',
            company: '',
            invoiceNumber: self.maxInvoiceNumber + 1,
            totalBilled: ''
        };
    }

    handleUpdateDocument(payload) {
        this.openDocumentModel = true;
        this.isAddDocument = false;
        this.selectedDocument = payload.documentType;
        switch (payload.documentType) {
            case Constant.DOCUMENT_TYPES.PURCHASE_ORDER:
                this.poData = payload.document;
                break;
            case Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT:
                this.csaData = cloneDeep(payload.document);
                this.selectedScopesForCSA = payload.document.selectedScopes ? cloneDeep(payload.document.selectedScopes) : [];
                break;

            case Constant.DOCUMENT_TYPES.MODIFIED_CUSTOMER_SERVICE_AGREEMENT:
                this.mcsaData = cloneDeep(payload.document);
                this.selectedScopesForMCSA = payload.document.selectedScopes ? cloneDeep(payload.document.selectedScopes) : [];
                break;

            case Constant.DOCUMENT_TYPES.MASTER_AGREEMENT:
                this.maData = cloneDeep(payload.document);
                this.selectedScopesForMA = payload.document.selectedScopes ? cloneDeep(payload.document.selectedScopes) : [];
                break;

            case Constant.DOCUMENT_TYPES.CLIENT_AGREEMENT:
                this.caData = cloneDeep(payload.document);
                this.selectedScopesForCA = payload.document.selectedScopes ? cloneDeep(payload.document.selectedScopes) : [];
                break;

            case Constant.DOCUMENT_TYPES.INVOICE:
                this.invoiceData = payload.document;
                this.invoiceData.invoiceNumber = payload.document.number;
                let selectedScopes = [];
                map(payload.document.selectedScopes, scope => {
                    if (!scope.scope.isArchived) {
                        selectedScopes.push(scope);
                    }
                });
                this.selectedScopesForInvoice = selectedScopes;
                break;

            default:
        }
    }

    closeDocumentModel() {
        this.openDocumentModel = false;
        this.isAddDocument = false;
        this.resetData();
    }

    updateSelectedDocument(document) {
        this.selectedDocument = document;
    }

    changeDefinition(payload) {
        // let task = this.selectedTask;
        let currentScope = find(this.selectedTask.scopes, (scope) => {
            return scope.id === payload.scope.id;
        });
        currentScope.definition = payload.value;
    }

    changeScopeNote(payload) {
        const self = this;
        let groupScopes = self.getGroupScopes(payload.scope.group.id);
        let scope = find(groupScopes, (groupScope) => {
            return groupScope.id === payload.scope.id;
        });

        if (scope) {
            self.oldData = {
                objectType: 'scope',
                entityType: 'note',
                data: cloneDeep(scope)
            };
            if (scope) {
                scope.note = payload.value;
            }
        }
    }

    changeTaskTitle(payload) {
        const self = this;
        let scope = payload.scope;
        let groupScopes = self.getGroupScopes(payload.scope.group.id);
        forEach(groupScopes, (groupScope) => {
            if (groupScope.task.id === scope.task.id) {
                groupScope.task.title = payload.value;
            }
        });
        if (scope) {
            self.oldData = {
                objectType: 'task',
                entityType: 'title',
                data: cloneDeep(scope)
            };
        }
    }

    changeTaskCity(payload) {
        const self = this;
        let scope = payload.scope;
        let groupScopes = self.getGroupScopes(payload.scope.group.id);
        forEach(groupScopes, (groupScope) => {
            if (groupScope.task.id === scope.task.id) {
                groupScope.task.city = payload.value;
            }
        });
        if (scope) {
            self.oldData = {
                objectType: 'task',
                entityType: 'city',
                data: cloneDeep(scope)
            };
        }
    }

    changeTaskState(payload) {
        const self = this;
        let scope = payload.scope;
        let groupScopes = self.getGroupScopes(payload.scope.group.id);
        forEach(groupScopes, (groupScope) => {
            if (groupScope.task.id === scope.task.id) {
                groupScope.task.state = payload.value;
            }
        });
        if (scope) {
            self.oldData = {
                objectType: 'task',
                entityType: 'state',
                data: cloneDeep(scope)
            };
        }
    }

    changeScopePrice(payload) {
        const self = this;
        let groupScopes = self.getGroupScopes(payload.scope.group.id);
        let scope = find(groupScopes, (groupScope) => {
            return groupScope.id === payload.scope.id;
        });

        if (scope) {
            self.oldData = {
                objectType: 'scope',
                entityType: 'price',
                data: cloneDeep(scope)
            };
            scope.price = payload.value;
        }
    }

    changeScopeItemType(payload) {
        // let task = this.selectedTask;
        let currentScope = find(this.selectedTask.scopes, (scope) => {
            return scope.id === payload.scope.id;
        });
        if (!payload.value) {
            currentScope.itemType = '';
        } else {
            currentScope.itemType = payload.value;
        }
    }

    changeScopeGroup(payload) {
        let task = this.selectedTask;
        let currentScope = find(task.scopes, (scope) => {
            return scope.id === payload.scope.id;
        });
        currentScope.group = payload.value;
    }

    changeCustomerContact(payload) {
        // let task = this.selectedTask;
        let currentScope = find(this.selectedTask.scopes, (scope) => {
            return scope.id === payload.scope.id;
        });
        currentScope.customerContact = payload.value;
    }

    changeDueDate(payload) {
        if (payload.isChangingFromForm) {
            let currentScope = find(this.selectedTask.scopes, (scope) => {
                return scope.id === payload.scope.id;
            });
            currentScope.dueDate = payload.value;
        } else {
            let task = this.selectedTask;
            let currentScope = find(task.scopes, (scope) => {
                return scope.id === payload.scope.id;
            });
            currentScope.dueDate = payload.value;
        }
    }

    changeEngineer(payload) {
        // let task = this.selectedTask;
        let self = this;
        let currentScope = find(self.selectedTask.scopes, (scope) => {
            return scope.id === payload.scope.id;
        });
        if (!payload.value) {
            currentScope.engineerDetails.engineer = '';
        } else {
            currentScope.engineerDetails.engineer = payload.value;
            self.canUpdateLoggedInUser = true;
            self.loggedInUserID = payload.loggedInUserID;
        }
    }

    changeDrafter(payload) {
        // let task = this.selectedTask;
        let self = this;
        let currentScope = find(self.selectedTask.scopes, (scope) => {
            return scope.id === payload.scope.id;
        });
        self.canUpdateLoggedInUser = true;
        self.loggedInUserID = payload.loggedInUserID;
        currentScope.drafterDetails.drafter = payload.value;
    }

    changeStatus(payload) {
        // let task = this.selectedTask;
        let currentScope = find(this.selectedTask.scopes, (scope) => {
            return scope.id === payload.scope.id;
        });
        if (payload.isDrafter) {
            currentScope.drafterDetails.status = payload.value;
        } else {
            currentScope.engineerDetails.status = payload.value;
        }
    }

    changeUrgentHour(payload) {
        const self = this;
        let groupScopes = self.getGroupScopes(payload.scope.group.id);
        let scope = find(groupScopes, (groupScope) => {
            return groupScope.id === payload.scope.id;
        });

        if (scope) {
            if (payload.isManager) {
                scope.managerDetails.urgentHours = payload.value;
            } else if (payload.isDrafter) {
                scope.drafterDetails.urgentHours = payload.value;
            } else {
                scope.engineerDetails.urgentHours = payload.value;
            }
        }
        if (self.selectedTask) {
            let taskScope = find(self.selectedTask.scopes, (currentScope) => {
                return payload.scope.id === currentScope.id;
            });
            if (taskScope) {
                if (payload.isManager) {
                    taskScope.managerDetails.urgentHours = payload.value;
                } else if (payload.isDrafter) {
                    taskScope.drafterDetails.urgentHours = payload.value;
                } else {
                    taskScope.engineerDetails.urgentHours = payload.value;
                }
            }
        }
    }

    changeNonUrgentHour(payload) {
        const self = this;
        let groupScopes = self.getGroupScopes(payload.scope.group.id);
        let scope = find(groupScopes, (groupScope) => {
            return groupScope.id === payload.scope.id;
        });

        if (scope) {
            if (payload.isManager) {
                scope.managerDetails.nonUrgentHours = payload.value;
            } else if (payload.isDrafter) {
                scope.drafterDetails.nonUrgentHours = payload.value;
            } else {
                scope.engineerDetails.nonUrgentHours = payload.value;
            }
        }
        if (self.selectedTask) {
            let taskScope = find(self.selectedTask.scopes, (currentScope) => {
                return payload.scope.id === currentScope.id;
            });
            if (taskScope) {
                if (payload.isManager) {
                    taskScope.managerDetails.nonUrgentHours = payload.value;
                } else if (payload.isDrafter) {
                    taskScope.drafterDetails.nonUrgentHours = payload.value;
                } else {
                    taskScope.engineerDetails.nonUrgentHours = payload.value;
                }
            }
        }
    }

    changeHoursSpent(payload) {
        let scopeData = find(this.selectedTask.scopes, (scope) => {
            return scope.id === payload.scope.id;
        });
        forEach(scopeData.hourTrackers, (hourTracker) => {
            if (hourTracker.id === payload.hourTracker.id) {
                hourTracker.hoursSpent = payload.newHoursValue;
            }
        });
    }

    changeRevNumber(payload) {
        let scopeData = find(this.selectedTask.scopes, (scope) => {
            return scope.id === payload.scope.id;
        });
        forEach(scopeData.hourTrackers, (hourTracker) => {
            if (hourTracker.id === payload.hourTracker.id) {
                hourTracker.revNumber = payload.revNumber;
            }
        });
    }

    updateEngineerDrafterSuccess(payload) {
        let self = this;
        if (self.selectedTask && self.selectedTask.id === payload.task.id) {
            self.selectedTask.teamMembers = payload.task.teamMembers;
            let taskScope = find(self.selectedTask.scopes, (scope) => {
                return scope.id === payload.scope.id;
            });
            if (taskScope) {
                taskScope = self._extend(taskScope, payload.scope);
            }
        }
        let groupScopes = self.getGroupScopes(payload.scope.group.id);
        let presentScope = find(groupScopes, { id: payload.scope.id });
        if (presentScope && self.loggedInUserID !== null) {
            if (payload.scope.managerDetails.manager.id !== self.loggedInUserID &&
                payload.scope.engineerDetails.engineer.id !== self.loggedInUserID &&
                payload.scope.drafterDetails.drafter && payload.scope.drafterDetails.drafter.id !== self.loggedInUserID) {
                remove(groupScopes, { id: payload.scope.id });
            }
        }
        forEach(payload.task.scopes, (scope) => {
            let currentGroupScopes = self.getGroupScopes(scope.group.id);
            forEach(currentGroupScopes, (groupScope) => {
                if (groupScope.task.id === payload.task.id) {
                    groupScope.task = self._extend(groupScope.task, payload.task);
                }
                if (groupScope.id === payload.scope.id) {
                    groupScope = self._extend(groupScope, payload.scope);
                    let hours = self.getEngineeringAndDraftingHours(groupScope.hourTrackers);
                    groupScope.finalEngineeringHours = hours.finalEngineeringHours;
                    groupScope.finalDraftingHours = hours.finalDraftingHours;
                }
            });
        });


        /* Update urgent and non-urgent hours of logged in user */
        if (self.canUpdateLoggedInUser && self.loggedInUserID) {
            let totalHours = self.getUrgentNonUrgentHoursOfUser(self.loggedInUserID);
            let userData = {
                id: self.loggedInUserID,
                urgentHours: totalHours.totalUrgentHours,
                nonUrgentHours: totalHours.totalNonUrgentHours
            };
            setTimeout(() => {
                LoginAction.updateLoggedInUserSuccess(userData);
            }, 30);
            self.canUpdateLoggedInUser = false;
        }
        self.resetData();
    }

    updateManagerSuccess(updatedTask) {
        const self = this;
        let groupScopes;
        if (self.selectedTask) {
            self.selectedTask.createdBy = updatedTask.createdBy;
            self.selectedTask.teamMembers = updatedTask.teamMembers;
        }
        forEach(updatedTask.scopes, (scope) => {
            groupScopes = self.getGroupScopes(scope.group.id);
            let gridScope = find(groupScopes, (groupScope) => {
                return scope.id === groupScope.id;
            });
            if (gridScope && gridScope.task.id === updatedTask.id) {
                // remove scope from groups if logged in user is not part of that scope
                if (self.loggedInUserID && gridScope.managerDetails.manager.id === self.loggedInUserID && scope.managerDetails.manager.id !== self.loggedInUserID) {
                    if (self.loggedInUserID !== scope.engineerDetails.engineer.id && (!scope.drafterDetails.drafter || scope.drafterDetails.drafter.id !== self.loggedInUserID)) {
                        remove(groupScopes, { id: gridScope.id });
                    } else {
                        // update scope's manager details if scope is found in groupscopes
                        gridScope.task.createdBy = scope.task.createdBy;
                        gridScope.task.teamMembers = scope.task.teamMembers;
                        gridScope.managerDetails = scope.managerDetails;
                    }
                } else {
                    // update scope's manager details if scope is found in groupscopes
                    gridScope.task.createdBy = scope.task.createdBy;
                    gridScope.task.teamMembers = scope.task.teamMembers;
                    gridScope.managerDetails = scope.managerDetails;
                }
            } else {
                // if scope is not found then push it to groupscopes if the logged in user is new manager of that scope
                if (self.loggedInUserID && scope.managerDetails.manager.id === self.loggedInUserID) {
                    groupScopes.push(scope);
                }
            }
        });
        self.resetData();
    }

    updateManagerBySocketSuccess(updatedTask) {
        const self = this;
        let groupScopes;
        if (self.selectedTask) {
            self.selectedTask.createdBy = updatedTask.createdBy;
            self.selectedTask.teamMembers = updatedTask.teamMembers;
        }
        forEach(updatedTask.scopes, (scope) => {
            groupScopes = self.getGroupScopes(scope.group.id);
            let gridScope = find(groupScopes, (groupScope) => {
                return scope.id === groupScope.id;
            });
            if (gridScope && gridScope.task.id === updatedTask.id) {
                // remove scope from groups if logged in user is not part of that scope
                if (self.loggedInUserID && gridScope.managerDetails.manager.id === self.loggedInUserID && scope.managerDetails.manager.id !== self.loggedInUserID) {
                    if (self.loggedInUserID !== scope.engineerDetails.engineer.id && (!scope.drafterDetails.drafter || scope.drafterDetails.drafter.id !== self.loggedInUserID)) {
                        remove(groupScopes, { id: gridScope.id });
                    } else {
                        gridScope.task.createdBy = scope.task.createdBy;
                        gridScope.task.teamMembers = scope.task.teamMembers;
                        gridScope.managerDetails = scope.managerDetails;
                    }
                } else {
                    // update scope's manager details if scope is found in groupscopes
                    gridScope.task.createdBy = scope.task.createdBy;
                    gridScope.task.teamMembers = scope.task.teamMembers;
                    gridScope.managerDetails = scope.managerDetails;
                }
            } else {
                // if scope is not found then push it to groupscopes if the logged in user is new manager of that scope
                if (self.loggedInUserID && scope.managerDetails.manager.id === self.loggedInUserID) {
                    groupScopes.push(scope);
                }
            }
        });
    }

    closeDocumentView() {
        this.showDocumentInfo = false;
        this.poData = {
            id: '',
            name: '',
            notes: '',
            signature: ''
        };
        this.csaData = this.getDefaultCSAData();
    }

    showDocumentView(payload) {
        this.showDocumentInfo = true;
        if (payload.objectType === Constant.DOCUMENT_TYPES.PURCHASE_ORDER) {
            this.poData = payload.object;
        } else if (payload.objectType === Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT) {
            this.csaData = payload.object;
        }
    }

    restoreData() {
        if (this.oldData.data) {
            let scopes = this.getGroupScopes(this.oldData.data.group.id);
            if (scopes.length > 0) {
                if (this.oldData.objectType === 'task') {
                    forEach(scopes, (currentScope) => {
                        if (this.oldData.data.task.id === currentScope.task.id) {
                            currentScope.task[this.oldData.entityType] = this.oldData.data.task[this.oldData.entityType];
                        }
                    });
                } else if (this.oldData.objectType === 'scope') {
                    let scope;
                    if (this.selectedTask) {
                        scope = find(this.selectedTask.scopes, (currentScope) => {
                            return currentScope.id === this.oldData.data.id;
                        });
                        if (scope) {
                            scope[this.oldData.entityType] = this.oldData.data[this.oldData.entityType];
                        }
                    } else {

                    }
                    scope = find(scopes, (currentScope) => {
                        return currentScope.id === this.oldData.data.id;
                    });
                    if (scope) {
                        scope[this.oldData.entityType] = this.oldData.data[this.oldData.entityType];
                    }
                }
            }
        }
        this.oldData = {
            objectType: '',
            entityType: '',
            data: null
        };
    }

    changeFormScopeNote(payload) {
        let scope = find(this.selectedTask.scopes, (scopeToFind) => {
            return scopeToFind.id === payload.scope.id;
        });

        if (scope) {
            scope.note = payload.value;
            this.loggedInUserID = payload.loggedInUserID;   // logged in user id is required to check whether logged in user is part of new scope
        }
    }

    changeFormScopePrice(payload) {
        let scope = find(this.selectedTask.scopes, (scopeToFind) => {
            return scopeToFind.id === payload.scope.id;
        });

        if (scope) {
            scope.price = payload.value;
        }
    }

    changeFormUrgentHour(payload) {
        let scope = find(this.selectedTask.scopes, (scopeToFind) => {
            return scopeToFind.id === payload.scope.id;
        });
        if (scope) {
            if (payload.isDrafter) {
                scope.drafterDetails.urgentHours = payload.value;
                if (scope.drafterDetails.drafter && scope.drafterDetails.drafter.id === payload.loggedInUserID) {
                    this.canUpdateLoggedInUser = true;
                    this.loggedInUserID = payload.loggedInUserID;
                }
            } else {
                scope.engineerDetails.urgentHours = payload.value;
                if (scope.engineerDetails.engineer.id === payload.loggedInUserID) {
                    this.canUpdateLoggedInUser = true;
                    this.loggedInUserID = payload.loggedInUserID;
                }
            }
        }
    }

    changeFormNonUrgentHour(payload) {
        let scope = find(this.selectedTask.scopes, (scopeToFind) => {
            return scopeToFind.id === payload.scope.id;
        });
        if (scope) {
            if (payload.isDrafter) {
                scope.drafterDetails.nonUrgentHours = payload.value;
                if (scope.drafterDetails.drafter && scope.drafterDetails.drafter.id === payload.loggedInUserID) {
                    this.canUpdateLoggedInUser = true;
                    this.loggedInUserID = payload.loggedInUserID;
                }
            } else {
                scope.engineerDetails.nonUrgentHours = payload.value;
                if (scope.engineerDetails.engineer.id === payload.loggedInUserID) {
                    this.canUpdateLoggedInUser = true;
                    this.loggedInUserID = payload.loggedInUserID;
                }
            }
        }
    }

    getMaxTaskNumberSuccess(payload) {
        this.maxTaskNumber = payload.taskNumber;
        payload.resolve(this.maxTaskNumber);
    }

    setLoaderText(loaderText) {
        this.loaderText = loaderText;
    }

    handleInvoiceEdit(payload) {
        let selectedScope = {
            scope: {
                _id: payload.scope._id,
                id: payload.scope.id,
                number: payload.scope.number,
                note: payload.scope.note,
                isArchived: payload.scope.isArchived,
                price: payload.scope.price,
                definition: payload.scope.definition

            },
            amount: 0,
            oldPrice: payload.scope.price,
            isPartial: false,
            description: payload.scope.definition

        };

        switch (payload.editField) {
            case Constant.STRINGS.selectedScope:
                if (payload.value.checked) {
                    // selectedScope.amount = payload.amountValue;
                    // selectedScope.description = payload.scopeValue;
                    this.selectedScopesForInvoice.push(selectedScope);
                } else {
                    remove(this.selectedScopesForInvoice, (scope) => {
                        return scope.scope._id === selectedScope.scope._id;
                    });
                }
                break;

            case Constant.STRINGS.amount:
                this.selectedScopesForInvoice.map((scope, index) => {
                    if (scope.scope._id === selectedScope.scope._id) {
                        if (scope.isPartial) {
                            if (payload.event.target.value >= payload.scope.price && payload.event.target.value !== 0) {
                                this.error['invoice'] = Constant.STRINGS.ERROR_MSG.partialAmountError
                            } else {
                                this.resetError();
                            }
                            this.selectedScopesForInvoice[index].amount = payload.event.target.value;
                        } else {
                            this.selectedScopesForInvoice[index].scope.price = payload.event.target.value;
                            this.selectedScopesForInvoice[index].oldPrice = payload.event.target.value;
                        }
                    }
                });
                break;

            case Constant.STRINGS.scope:
                this.selectedScopesForInvoice.map((scope, index) => {
                    if (scope.scope._id === selectedScope.scope._id) {
                        this.selectedScopesForInvoice[index].description = payload.event.target.value;
                    }
                });
                break;

            case Constant.STRINGS.partialBill:
                this.selectedScopesForInvoice.map((scope, index) => {
                    if (scope.scope._id === selectedScope.scope._id) {
                        if (payload.value.checked) {
                            this.selectedScopesForInvoice[index].isPartial = payload.value.checked;

                        } else {
                            this.selectedScopesForInvoice[index].isPartial = payload.value.checked;
                            // this.selectedScopesForInvoice[index].description = payload.scope.definition;
                            // this.selectedScopesForInvoice[index].amount = payload.scope.price;// this.selectedScopesForInvoice[index].scope.definition = this.selectedScopesForInvoice[index].description;
                        }

                        if (this.selectedScopesForInvoice[index].isPartial && this.selectedScopesForInvoice[index].amount >= payload.scope.price && this.selectedScopesForInvoice[index].amount !== 0) {
                            this.error['invoice'] = Constant.STRINGS.ERROR_MSG.partialAmountError
                        } else {
                            this.resetError();
                        }
                    }
                });
                break;

            default:
                break;
        }
    }

    handleSelectedScopesCheck(payload) {
        switch (payload.mileStoneType) {
            case Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT:
                if (payload.isChecked) {
                    this.selectedScopesForCSA.push(payload.scope);
                } else {
                    remove(this.selectedScopesForCSA, (scope) => {
                        return scope._id === payload.scope._id;
                    });
                }
                break;
            case Constant.DOCUMENT_TYPES.MODIFIED_CUSTOMER_SERVICE_AGREEMENT:
                if (payload.isChecked) {
                    this.selectedScopesForMCSA.push(payload.scope);
                } else {
                    remove(this.selectedScopesForMCSA, (scope) => {
                        return scope._id === payload.scope._id;
                    });
                }
                break;
            case Constant.DOCUMENT_TYPES.MASTER_AGREEMENT:
                if (payload.isChecked) {
                    this.selectedScopesForMA.push(payload.scope);
                } else {
                    remove(this.selectedScopesForMA, (scope) => {
                        return scope._id === payload.scope._id;
                    });
                }
                break;
            case Constant.DOCUMENT_TYPES.CLIENT_AGREEMENT:
                if (payload.isChecked) {
                    this.selectedScopesForCA.push(payload.scope);
                } else {
                    remove(this.selectedScopesForCA, (scope) => {
                        return scope._id === payload.scope._id;
                    });
                }
                break;
            case Constant.DOCUMENT_TYPES.INVOICE:
                if (payload.isChecked) {
                    this.selectedScopesForInvoice.push(payload.scope);
                } else {
                    remove(this.selectedScopesForInvoice, (scope) => {
                        /* if (scope._id) {
                            return scope._id === payload.scopeID;
                        } */
                        return scope.scope._id === payload.scope._id;
                    });
                }
                break;
            default:
        }
    }


    initialSetupSuccess() {
        this.loader.initialSetup = false;
        this.loaderText = '';
    }

    disableAttachfiles() {
        let self = this;
        self.isAttachmentUploading = true;
    }

    updateLoggedInUser(loggedInUserID) {
        this.canUpdateLoggedInUser = true;
        this.loggedInUserID = loggedInUserID;
    }

    getUrgentNonUrgentHoursOfUser(userID) {
        let self = this;
        let totalUrgentHours = 0;
        let totalNonUrgentHours = 0;

        forEach(self.activeScopes, (activeScope) => {
            if (activeScope.engineerDetails.engineer.id === userID) {
                totalUrgentHours += activeScope.engineerDetails.urgentHours;
                totalNonUrgentHours += activeScope.engineerDetails.nonUrgentHours;
            } else if (activeScope.drafterDetails.drafter && activeScope.drafterDetails.drafter.id === userID) {
                totalUrgentHours += activeScope.drafterDetails.urgentHours;
                totalNonUrgentHours += activeScope.drafterDetails.nonUrgentHours;
            } else if (activeScope.managerDetails.manager.id === userID && activeScope.managerDetails.urgentHours || activeScope.managerDetails.nonUrgentHours) {
                totalUrgentHours += activeScope.managerDetails.urgentHours;
                totalNonUrgentHours += activeScope.managerDetails.nonUrgentHours;
            }
        });
        forEach(self.holdScopes, (holdScope) => {
            if (holdScope.engineerDetails.engineer.id === userID) {
                totalUrgentHours += holdScope.engineerDetails.urgentHours;
                totalNonUrgentHours += holdScope.engineerDetails.nonUrgentHours;
            } else if (holdScope.drafterDetails.drafter && holdScope.drafterDetails.drafter.id === userID) {
                totalUrgentHours += holdScope.drafterDetails.urgentHours;
                totalNonUrgentHours += holdScope.drafterDetails.nonUrgentHours;
            } else if (holdScope.managerDetails.manager.id === userID && holdScope.managerDetails.urgentHours || holdScope.managerDetails.nonUrgentHours) {
                totalUrgentHours += holdScope.managerDetails.urgentHours;
                totalNonUrgentHours += holdScope.managerDetails.nonUrgentHours;
            }
        });
        forEach(self.taskScopes, (taskScope) => {
            if (taskScope.engineerDetails.engineer.id === userID) {
                totalUrgentHours += taskScope.engineerDetails.urgentHours;
                totalNonUrgentHours += taskScope.engineerDetails.nonUrgentHours;
            } else if (taskScope.drafterDetails.drafter && taskScope.drafterDetails.drafter.id === userID) {
                totalUrgentHours += taskScope.drafterDetails.urgentHours;
                totalNonUrgentHours += taskScope.drafterDetails.nonUrgentHours;
            } else if (taskScope.managerDetails.manager.id === userID && taskScope.managerDetails.urgentHours || taskScope.managerDetails.nonUrgentHours) {
                totalUrgentHours += taskScope.managerDetails.urgentHours;
                totalNonUrgentHours += taskScope.managerDetails.nonUrgentHours;
            }
        });
        forEach(self.bidsScopes, (bidScope) => {
            if (bidScope.engineerDetails.engineer.id === userID) {
                totalUrgentHours += bidScope.engineerDetails.urgentHours;
                totalNonUrgentHours += bidScope.engineerDetails.nonUrgentHours;
            } else if (bidScope.drafterDetails.drafter && bidScope.drafterDetails.drafter.id === userID) {
                totalUrgentHours += bidScope.drafterDetails.urgentHours;
                totalNonUrgentHours += bidScope.drafterDetails.nonUrgentHours;
            } else if (bidScope.managerDetails.manager.id === userID && bidScope.managerDetails.urgentHours || bidScope.managerDetails.nonUrgentHours) {
                totalUrgentHours += bidScope.managerDetails.urgentHours;
                totalNonUrgentHours += bidScope.managerDetails.nonUrgentHours;
            }
        });
        return { totalUrgentHours: totalUrgentHours, totalNonUrgentHours: totalNonUrgentHours };
    }

    sortInvoices(payload) {
        let self = this;
        self.sortData[payload.group].sortBy = payload.sortBy;
        self.sortData[payload.group].ascending = !self.sortData[payload.group].ascending;
    }

    showUserTasks(user) {
        this.selectedUser = user;
        this.skipRange = 0;
    }

    clearSelectedUser() {
        this.selectedUser = null;
        this.skipRange = 0;
    }

    getActiveScopesSuccess(payload) {
        if (payload.userId === LoginStore.getState().user._id) {
            this.activeScopes = this.setManualSortedScopes({ scopes: payload.scopes, scopeGroupId: Constant.TASK_GROUP__ID.ACTIVE_PROJECTS, userId: payload.userId });
        } else {
            this.activeScopes = payload.scopes;
        }
        this.loader.taskGroupWrapper = false;
    }

    getHoldScopesSuccess(payload) {
        if (payload.userId === LoginStore.getState().user._id) {
            this.holdScopes = this.setManualSortedScopes({ scopes: payload.scopes, scopeGroupId: Constant.TASK_GROUP__ID.ON_HOLD, userId: payload.userId });
        } else {
            this.holdScopes = payload.scopes;
        }
        this.loader.taskGroupWrapper = false;
    }

    getTasksScopesSuccess(payload) {
        if (payload.userId === LoginStore.getState().user._id) {
            this.taskScopes = this.setManualSortedScopes({ scopes: payload.scopes, scopeGroupId: Constant.TASK_GROUP__ID.TASKS, userId: payload.userId });
        } else {
            this.taskScopes = payload.scopes;
        }
        this.loader.taskGroupWrapper = false;
    }

    getBidsScopesSuccess(payload) {
        if (payload.userId === LoginStore.getState().user._id) {
            this.bidsScopes = this.setManualSortedScopes({ scopes: payload.scopes, scopeGroupId: Constant.TASK_GROUP__ID.BIDS, userId: payload.userId });
        } else {
            this.bidsScopes = payload.scopes;
        }
        this.loader.taskGroupWrapper = false;
    }

    getCompletedScopesSuccess(completedScopes) {
        this.completedScopes = concat(this.completedScopes, completedScopes);
        this.skipRange = completedScopes.length + this.skipRange;
        this.loader.completedScope = false;
        this.loader.completedGroup = false;
        if (completedScopes.length === 0) {
            this.stopPagination = true;
        }
    }

    getScopeInvoicePageScopesSuccess(payload) {
        if (payload.completedUnInvoiced && payload.holdInvoiceScopes) {
            this.completedScopes = payload.completedUnInvoiced;

            this.activeScopes = payload.holdInvoiceScopes[Constant.TASK_GROUP__ID.ACTIVE_PROJECTS] ? payload.holdInvoiceScopes[Constant.TASK_GROUP__ID.ACTIVE_PROJECTS] : [];
            this.bidsScopes = payload.holdInvoiceScopes[Constant.TASK_GROUP__ID.BIDS] ? payload.holdInvoiceScopes[Constant.TASK_GROUP__ID.BIDS] : [];
            this.holdScopes = payload.holdInvoiceScopes[Constant.TASK_GROUP__ID.ON_HOLD] ? payload.holdInvoiceScopes[Constant.TASK_GROUP__ID.ON_HOLD] : [];
            let onlyTaskScopes = payload.holdInvoiceScopes[Constant.TASK_GROUP__ID.TASKS] ? payload.holdInvoiceScopes[Constant.TASK_GROUP__ID.TASKS] : [];
            this.taskScopes = concat(payload.holdInvoiceScopes[Constant.TASK_GROUP__ID.COMPLETED_PROJECTS] ? payload.holdInvoiceScopes[Constant.TASK_GROUP__ID.COMPLETED_PROJECTS] : [], onlyTaskScopes);

            map(this.completedScopes, scope => {
                scope.__completed = true;
            });

            map(this.activeScopes, scope => {
                scope.__hold = true;
            });
            map(this.bidsScopes, scope => {
                scope.__hold = true;
            });
            map(this.holdScopes, scope => {
                scope.__hold = true;
            });
            map(this.taskScopes, scope => {
                scope.__hold = true;
            })
        }

        this.loader.scopeInvoicePage = false;
    }

    openSelectedtask(payload) {
        this.fetchingTask = payload.taskId;
        this.isViewTask = true;
        this.loader.viewTask = true;
        this.selectedScopeGroup = null;
    }
    clearFechingTask() {
        this.isViewTask = false;
        this.loader.viewTask = false;
        this.fetchingTask = null;
        this.selectedTask = null;
    }
    getAccordionStatusSuccess(status) {
        this.accordionStatus = status;
    }

    setAccordionStatusSuccess(status) {
        this.accordionStatus = status;
    }

    setManualSortedScopes(payload) {
        let manualSortedScopes = JSON.parse(localStorage.getItem('manualSortedScopes'));
        const scopes = payload.scopes;
        const sortedScopes = map(payload.scopes, (scope) => {
            return scope.id;
        });
        if (manualSortedScopes && manualSortedScopes[payload.userId] && manualSortedScopes[payload.userId][payload.scopeGroupId]) {
            let deletedScopes = differenceWith(manualSortedScopes[payload.userId][payload.scopeGroupId], sortedScopes, isEqual);
            forEach(deletedScopes, (deletedScopeId) => {
                remove(manualSortedScopes[payload.userId][payload.scopeGroupId], (scopeId) => {
                    return scopeId === deletedScopeId;
                });
            });
            let newScopes = differenceWith(sortedScopes, manualSortedScopes[payload.userId][payload.scopeGroupId], isEqual);
            manualSortedScopes[payload.userId][payload.scopeGroupId] = concat(newScopes, manualSortedScopes[payload.userId][payload.scopeGroupId]);
            localStorage.setItem('manualSortedScopes', JSON.stringify(manualSortedScopes));
            forEach(manualSortedScopes[payload.userId][payload.scopeGroupId], (scopeId, index) => {
                const removedScope = remove(scopes, { id: scopeId });
                scopes.splice(index, 0, removedScope[0]);
            });
        } else {
            let sortedScopeObj = {};
            if (manualSortedScopes && manualSortedScopes[payload.userId]) {
                manualSortedScopes[payload.userId][payload.scopeGroupId] = sortedScopes;
                sortedScopeObj = manualSortedScopes;
            } else {
                sortedScopeObj = { [payload.userId]: { [payload.scopeGroupId]: sortedScopes } };
            }
            localStorage.setItem('manualSortedScopes', JSON.stringify(sortedScopeObj));
        }

        return scopes;
    }

    _updateManualSortScopes(scopes, scopeGroupId, userId) {
        let sortedScopes = map(scopes, (scope) => {
            return scope.id;
        });
        const manualSortedScopes = JSON.parse(localStorage.getItem('manualSortedScopes'));
        manualSortedScopes[userId][scopeGroupId] = sortedScopes;
        localStorage.setItem('manualSortedScopes', JSON.stringify(manualSortedScopes));
    }

    manualSortScopes(payload) {
        this[payload.groupType] = arrayMove(this[payload.groupType], payload.oldIndex, payload.newIndex);
        this._updateManualSortScopes(this[payload.groupType], payload.scopeGroupId, payload.userId);
    }

    toggleManualSorting(bool) {
        this.enableManualSorting = bool;
    }

    removeLoader(type) {
        this.loader[type] = false;
    }

    resetCompletedScopes() {
        this.completedScopes = [];
        this.stopPagination = false;
        this.skipRange = 0;
    }

    changeInputValueInScopeTeam(payload) {
        const self = this;
        let scope;

        if (self.selectedTask) {
            scope = find(self.selectedTask.scopes, (currentScope) => {
                return currentScope.id === payload.updatableScope.id;
            });
            if (scope && payload.inputType === 'Status') {
                scope.status = payload.updatableScope.status;
            } else {
                self.oldData = {
                    objectType: 'scope',
                    entityType: 'price',
                    data: cloneDeep(scope)
                };
                scope.price = payload.updatableScope.price;
            }
        }
    }

    changeInputValueInScopeInvoices(payload) {
        const self = this;
        let scope;

        if (self.selectedTask) {
            scope = find(self.selectedTask.scopes, (currentScope) => {
                return currentScope.id === payload.updatableScope.id;
            });
            if (scope && payload.inputType === 'Invoice') {
                let invoice = find(scope.scopeInvoices, { _id: payload.invoiceDetails.invoiceId });
                if (invoice) {
                    invoice.invoiceNumber = payload.invoiceDetails.invoiceNumber;
                }
            } else {
                let invoice = find(scope.scopeInvoices, { _id: payload.invoiceDetails.invoiceId });
                if (invoice) {
                    invoice.billedAmount = payload.invoiceDetails.billedAmount;
                }
            }
        }
    }

    updateMilestoneSuccess(payload) {
        const self = this;
        let updatableDocument;
        if (self.selectedTask && self.selectedTask.id === payload.task.id) {
            switch (payload.documentType) {
                case Constant.DOCUMENT_TYPES.PURCHASE_ORDER:
                    updatableDocument = find(self.selectedTask.purchaseOrders, (purchaseOrder) => {
                        return purchaseOrder.id === payload.document.id;
                    });
                    break;
                case Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT:
                    updatableDocument = find(self.selectedTask.agreements, (agreement) => {
                        return agreement.id === payload.document.id;
                    });
                    break;
                case Constant.DOCUMENT_TYPES.MODIFIED_CUSTOMER_SERVICE_AGREEMENT:
                    updatableDocument = find(self.selectedTask.modifiedAgreements, (modifiedAgreement) => {
                        return modifiedAgreement.id === payload.document.id;
                    });
                    break;
                case Constant.DOCUMENT_TYPES.MASTER_AGREEMENT:
                    updatableDocument = find(self.selectedTask.masterAgreements, (masterAgreement) => {
                        return masterAgreement.id === payload.document.id;
                    });
                    break;
                case Constant.DOCUMENT_TYPES.CLIENT_AGREEMENT:
                    updatableDocument = find(self.selectedTask.clientAgreements, (clientAgreement) => {
                        return clientAgreement.id === payload.document.id;
                    });
                    break;
                case Constant.DOCUMENT_TYPES.INVOICE:
                    updatableDocument = find(self.selectedTask.invoices, (invoice) => {
                        return invoice.id === payload.document.id;
                    });

                    let groupScopes;
                    let gridScope;

                    // Updated price of all invoices in selectedTask if invoice price is updated
                    map(self.selectedTask.invoices, invoices => {
                        map(invoices.selectedScopes, selectedScope => {
                            map(payload.document.selectedScopes, updatedScope => {
                                if (selectedScope.scope.id === updatedScope.scope.id) {
                                    selectedScope.scope.price = updatedScope.scope.price;
                                }
                            })
                        })
                    });

                    if (self.archivedMileStones.invoices) {
                        map(self.archivedMileStones.invoices, invoices => {
                            map(invoices.selectedScopes, selectedScope => {
                                map(payload.document.selectedScopes, updatedScope => {
                                    if (selectedScope.scope.id === updatedScope.scope.id) {
                                        selectedScope.scope.price = updatedScope.scope.price;
                                    }
                                })
                            })
                        })
                    }

                    payload.document.selectedScopes.map(selectedScope => {
                        if (!selectedScope.isPartial) {
                            groupScopes = self.getGroupScopes(selectedScope.scope.group.id);
                            gridScope = find(groupScopes, (groupScope) => {
                                return groupScope.id === selectedScope.scope.id;
                            });

                            // Update Scope Price And Description On Grid
                            if (gridScope) {
                                gridScope.price = selectedScope.scope.price;
                                gridScope.definition = selectedScope.scope.definition;
                            }
                            if (self.selectedTask) {
                                let taskScope = find(self.selectedTask.scopes, (currentScope) => {
                                    return currentScope.id === selectedScope.scope.id;
                                });

                                if (taskScope) {
                                    taskScope.price = selectedScope.scope.price;
                                    taskScope.definition = selectedScope.scope.definition;

                                }
                            }
                        }
                    });
                    break;
                default:
            }
            if (updatableDocument) {
                updatableDocument = self._extend(updatableDocument, payload.document);
                self.updateMileStonesOnGrid(payload.documentType, self.selectedTask);
            }
            self.resetData();
        }
    }

    toggleConfirmAddRevScope() {
        this.shouldAddRevScope = !this.shouldAddRevScope;
    }

    setParentForRevScope(scope) {
        this.parentScopeForRev = {
            _id: scope._id,
            number: scope.number,
            group: scope.group,
            itemType: scope.itemType,
            engineerDetails: scope.engineerDetails,
            note: scope.note
        };
    }

    addRevScopeSuccess(savedRevScope) {
        const self = this;
        savedRevScope.finalEngineeringHours = 0;
        savedRevScope.finalDraftingHours = 0;
        this.selectedTask.scopes.push(savedRevScope);
        const groupScopes = self.getGroupScopes(savedRevScope.group.id);
        groupScopes.unshift(savedRevScope);
        this._updateManualSortScopes(groupScopes, savedRevScope.group._id, LoginStore.getState().user._id);
        self.resetData();
    }
    setGetBillingReportSuccess(payload) {
        this.billingReportData = payload;
    }
    addRevScopeBySocketSuccess(payload) {
        const self = this;
        const savedRevScope = payload.scope;
        const loggedInUserID = payload.loggedInUser;
        if (savedRevScope.managerDetails.manager.id === loggedInUserID ||
            savedRevScope.engineerDetails.engineer.id === loggedInUserID ||
            savedRevScope.drafterDetails.drafter && savedRevScope.drafterDetails.drafter.id === loggedInUserID) {
            savedRevScope.finalEngineeringHours = 0;
            savedRevScope.finalDraftingHours = 0;
            if (self.selectedTask) {
                self.selectedTask.scopes.push(savedRevScope);
            }
            const groupScopes = self.getGroupScopes(savedRevScope.group.id);
            groupScopes.unshift(savedRevScope);
            self._updateManualSortScopes(groupScopes, savedRevScope.group._id, LoginStore.getState().user._id);
        }
    }
    updateGridScopeAndSelectedTaskOnSyncContractorSuccess(data) {

        if (this.selectedTask && data.id === this.selectedTask.id) {
            this.selectedTask.contractor = data.contractor;
        }
        var activeScope = this.activeScopes.filter(scope => { return scope.task.id === data.id });
        var holdScopes = this.holdScopes.filter(scope => { return scope.task.id === data.id });
        var taskScopes = this.taskScopes.filter(scope => { return scope.task.id === data.id });
        var bidsScopes = this.bidsScopes.filter(scope => { return scope.task.id === data.id });
        var completedScopes = this.completedScopes.filter(scope => { return scope.task.id === data.id });

        activeScope = Array.concat(activeScope, holdScopes, taskScopes, bidsScopes, completedScopes);
        if (activeScope.length > 0) {
            activeScope.map(scope => {
                scope.task.contractor = data.contractor;
            })
        }

    }

    showConfirmationPupup(payload) {
        this.confirmationPopuData = payload;
    }
    clearConfirmationPupupData() {
        this.confirmationPopuData = null;
    }

    syncContractorSuccess(data) {
        if (data.status === 200) {
            this.updateGridScopeAndSelectedTaskOnSyncContractorSuccess(data.data);
            this.syncContractData = {
                loading: false,
                state: 200
            }
        } else {
            this.syncContractData = {
                state: 301,
                loading: false,
            }
        }
    }
    changeSyncContractState(data) {
        this.syncContractData = data;
    }
    clearSocketToastrMode() {
        this.socketToastrMode = {
            showSocketToastr: false,
            toastrNotificationMsg: null,
            itemType: null,
            item: null,
            loggedInUserID: null
        };
    }

    resetUpdateReportFlag() {
        this.updateReport = false;
    }

    setHourTrackerData(payload) {
        this.hourTrackerData = payload;
    }

    toggleAddHourTrackerModal(payload) {
        this.showAddHourTrackerModal = payload;
        if (!payload) {
            this.hourTrackerData = null;
        }
    }

    addHourTrackerInScope(payload) {
        let groupScope = this.getGroupScopes(payload.scope.group.id);
        let {
            createdAt,
            date,
            employee,
            hoursSpent,
            id,
            note,
            other,
            updatedAt,
            _id
        } = payload.hourTracker;

        groupScope.map(scope => {
            if (scope.id === payload.scope.id) {
                scope.hourTrackers.push({
                    createdAt,
                    date,
                    employee,
                    hoursSpent,
                    id,
                    note,
                    other,
                    updatedAt,
                    _id
                });
            }
        });
    }

    deleteHourTrackerInScope(hourtracker) {
        let groupScope = this.getGroupScopes(hourtracker.scope.group.id);
        groupScope.forEach(scope => {
            if (scope.id === hourtracker.scope.id) {
                const index = scope.hourTrackers.findIndex(tracker => tracker._id === hourtracker._id);
                scope.hourTrackers.splice(index, 0);
            }
        });
    }
}

export default alt.createStore(TaskStore, 'TaskStore');
