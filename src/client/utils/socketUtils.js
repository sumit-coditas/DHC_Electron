import io from 'socket.io-client';
import { UserModel } from '../model/UserModel';
import AppAction from '../actions/AppAction';
import RoleAction from '../actions/RoleAction';
import { EmployeeModel } from '../model/AppModels/EmployeeModel';
import { SelectedTaskDetailModel } from '../model/TaskModels/SelectedTaskDetailModel';
import { ScopeModel } from '../model/CustomerHomeModels/ScopeModel';
import Constant from '../components/helpers/Constant'
import { checkIdUserExistInScope } from '../components/reusableComponents/scopeTableNew/ScopeTableUtils';
import { SelectedUserModel } from '../model/TaskModels/SelectedUserModel';
import { HourTrackerModel } from '../model/AppModels/HourTrackerModel';
import { TagModel } from '../model/AppModels/TagModel';
import LoginAction from '../actions/LoginAction';
import ItemTypeAction from '../actions/ItemTypeAction.js';
import { ItemTypeModel } from '../model/AppModels/ItemTypeModel';
import UserAction from '../actions/UserAction';
import { UtilModel } from '../model/AppModels/UtilModel';
import { getUsersTotalUrgentNonUrgentHours } from './promises/UserPromises';

export const socketType = {

    DISCONNECT: 'disconnect',
    CONNECTION: 'connection',
    RECONNECTING: 'reconnecting',
    CONNECT: 'connect',

    // old socket events
    USER_UPDATE: 'user update',
    MANAGER_UPDATE: 'manager update',
    SCOPE_UPDATE: 'scope update',
    REV_SCOPE_CREATE: 'rev scope create',
    TASK_UPDATE: 'task update',
    TASK_CREATE: 'task create',
    ROLE_UPDATE: 'role update',
    HOURTRACKER_UPDATE: 'hourtracker update',
    MILESTONE_UPDATE: 'milestone update',
    MILESTONE_CREATE: 'milestone create',
    SCOPE_TEMPLATE_UPDATE: 'scope template update',
    ITEM_TYPE_CREATE: 'itemtype create',
    ITEM_TYPE_UPDATE: 'itemtype update',
    LOGIN: 'login',
    LOGOUT: 'logout',
    USER_SINGIN: 'user singin',
    USER_SINGOUT: 'user singout',
    USERS_SINGIN: 'users singin',
    BID_SCOPE_UPDATE: 'bid scope update',
    UPDATE_USER_TOTAL_HOURS: 'update other users total urgent and non-urgent hours',

    ARCHIVE_SCOPE: 'archive_scope',
    UPDATE_SCOPE: 'update_scope',
    UPDATE_SCOPE_HIGHLIGHTS: 'update_scope_highlights',
    ADD_SCOPE_MILESTONE: 'add_scope_milestone',
    ADD_SCOPE: 'add_scope',
    ADD_HOUR_TRACKER_TO_SCOPE: 'add_hourtracker_to_scope',
    REMOVE_HOUR_TRACKER_FROM_SCOPE: 'remove_hourtracker_from_scope',

    UPDATE_DRAWING: 'update_drawing',
    // ADD_DRAWING: 'add_drawing',
    // DELETE_DRAWING: 'delete_drawing',

    UPDATE_CUST_DRAWING: 'update_cust_drawing',
    // ADD_CUST_DRAWING: 'add_cust_drawing',
    // DELETE_CUST_DRAWING: 'delete_cust_drawing',

    UPDATE_CALC: 'update_calc',
    // ADD_CALC: 'add_calc',
    // DELETE_CALC: 'delete_calc',

    UPDATE_SCOPE_KEYWORD: 'update_scope_keyword',
    // ADD_SCOPE_KEYWORD: 'add_scope_keyword',
    DELETE_SCOPE_KEYWORD: 'delete_scope_keyword',

    UPDATE_SCOPE_PLANNING: 'update_scope_planning',
    // ADD_SCOPE_PLANNING: 'add_scope_planning',
    // DELETE_SCOPE_PLANNING: 'delete_scope_planning',

    ADD_TAG: 'add_tag',

    UPDATE_TAB_DATA: 'update_tab_data',
    // ADD_TAB_DATA: 'add_tab_data',
    // DELETE_TAB_DATA: 'delete_tab_data',

    UPDATE_LETTER: 'update_letter',
    // ADD_LETTER: 'add_letter',
    // DELETE_LETTER: 'delete_letter',

    UPDATE_INVOICE: 'update_invoice',
    ADD_INVOICE: 'add_invoice',
    DELETE_INVOICE: 'delete_invoice',

    UPDATE_PURCHASE_ORDER: 'update_purchase_order',
    ADD_PURCHASE_ORDER: 'add_purchase_order',
    DELETE_PURCHASE_ORDER: 'delete_purchase_order',

    UPDATE_AGREEMENT: 'update_agreement',
    ADD_AGREEMENT: 'add_agreement',
    DELETE_AGREEMENT: 'delete_agreement',

    UPDATE_MODIFIED_AGREEMENT: 'update_modified_agreement',
    ADD_MODIFIED_AGREEMENT: 'add_modified_agreement',
    DELETE_MODIFIED_AGREEMENT: 'delete_modified_agreement',

    UPDATE_MASTER_AGREEMENT: 'update_master_agreement',
    ADD_MASTER_AGREEMENT: 'add_master_agreement',
    DELETE_MASTER_AGREEMENT: 'delete_master_agreement',

    UPDATE_CLIENT_AGREEMENT: 'update_client_agreement',
    ADD_CLIENT_AGREEMENT: 'add_client_agreement',
    DELETE_CLIENT_AGREEMENT: 'delete_client_agreement',

    ADD_TASK: 'add_task',
    ADD_TASK_SCOPE: 'add_task_scope',
    ADD_TASK_AGREEMENT: 'add_task_agreement',
    ADD_TASK_PURCHASE_ORDER: 'add_task_purchase_order',
    ADD_TASK_MODIFIED_AGREEMENT: 'add_task_modified_agreement',
    ADD_TASK_MASTER_AGREEMENT: 'add_task_master_agreement',
    ADD_TASK_CLIENT_AGREEMENT: 'add_task_client_agreement',
    ADD_TASK_COMMENT: 'add_task_comment',
    UPDATE_TASK_COMMENT: 'update_task_comment',
    DELETE_TASK_COMMENT: 'delete_task_comment',
    UPDATE_TASK_TAGS: 'update_task_tags',
    UPDATE_TASK: 'update_task',

    UPDATE_HOUR_TRACKER: 'update_hour_tracker',
    ADD_HOUR_TRACKER: 'add_hour_tracker',
    DELETE_HOUR_TRACKER: 'delete_hour_tracker'

};

export function socketListeners() {
    const user = UserModel.getCurrentUser();

    const socket = io(apiUrl, {
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000
    });

    socket.on(socketType.RECONNECTING, () => {
        socket.emit(socketType.LOGIN, user._id);
    });

    socket.on(socketType.CONNECT, () => {
        localStorage.setItem('socketid', socket.id);
        UserModel.setSocket(socket);
    });

    socket.on(socketType.ADD_TAG, (data) => {
        new TagModel(data).$save();
    });

    socket.emit(socketType.LOGIN, user._id);

    socket.on(socketType.ITEM_TYPE_CREATE, (itemType) => {
        AppAction.addItemTypeBySocketSuccess(itemType.newItemType);
        ItemTypeAction.addItemTypeBySocketSuccess(itemType.newItemType);
        ItemTypeModel.addItemType(itemType.newItemType)
    });


    socket.on(socketType.USER_SINGIN, (data) => {
        EmployeeModel.updateEmployee({ _id: data.userId, isOnline: true });
    });

    socket.on(socketType.USER_SINGOUT, (data) => {
        EmployeeModel.updateEmployee({ _id: data.userId, isOnline: false });
    });

    socket.on(socketType.USERS_SINGIN, (data) => {
        AppAction.setUserOnlineStatus({ userId: data.userIds, isOnline: true });
        EmployeeModel.updateMultipleEmployeesOnlineStatus(data.userIds);
    });

    socket.on(socketType.USER_UPDATE, (data) => {
        const user = UserModel.last();
        if (user && user.props.id === data.user.id) {
            UserModel.updateCurrentUser(data.user);
            // UserAction.updateUserSuccess(data.user)
            LoginAction.updateLoggedInUserSuccess(data.user);
        }
        EmployeeModel.updateEmployee(data.user);
        UserAction.updateUserSuccess(data.user)
    });

    // Sockets to add task related milestones

    socket.on(socketType.ADD_PURCHASE_ORDER, (data) => {
        ScopeModel.socket_addMileStone('purchaseOrders', data);
    })

    socket.on(socketType.ADD_MASTER_AGREEMENT, (data) => {
        ScopeModel.socket_addMileStone('masterAgreements', data);
    })

    socket.on(socketType.ADD_CLIENT_AGREEMENT, (data) => {
        ScopeModel.socket_addMileStone('clientAgreements', data);
    })

    socket.on(socketType.ADD_MODIFIED_AGREEMENT, (data) => {
        ScopeModel.socket_addMileStone('modifiedAgreements', data);
    })

    socket.on(socketType.ADD_AGREEMENT, (data) => {
        ScopeModel.socket_addMileStone('agreements', data);
    })

    socket.on(socketType.ADD_INVOICE, (data) => {
        ScopeModel.socket_addMileStone('invoices', data);
    })

    // Sockets to update task related milestones
    socket.on(socketType.UPDATE_AGREEMENT, (data) => {
        ScopeModel.socket_updateMileStone('agreement', data);
    })

    socket.on(socketType.UPDATE_MODIFIED_AGREEMENT, (data) => {
        ScopeModel.socket_updateMileStone('modifiedAgreement', data);
    })

    socket.on(socketType.UPDATE_MASTER_AGREEMENT, (data) => {
        ScopeModel.socket_updateMileStone('masterAgreement', data);
    })

    socket.on(socketType.UPDATE_CLIENT_AGREEMENT, (data) => {
        ScopeModel.socket_updateMileStone('clientAgreement', data);
    })

    socket.on(socketType.UPDATE_PURCHASE_ORDER, (data) => {
        ScopeModel.socket_updateMileStone('purchaseOrder', data);
    })

    socket.on(socketType.UPDATE_INVOICE, (data) => {
        ScopeModel.socket_updateMileStone('invoice', data);
    })

    socket.on(socketType.TASK_UPDATE, (data) => {
        let scopes = [];
        const user = SelectedUserModel.last() && SelectedUserModel.last().props || UserModel.last().props;
        if (!user) return;
        data.task.scopes.forEach(item => {
            if (!checkIdUserExistInScope(item, user._id)) return;
            if (UtilModel.last().props.isUninvoicedPageOpen) {  // done for adding new scopes when on uninvoiced page as that page has no selectoe available
                scopes.push(new ScopeModel({ ...item, invoiceType: { _id: 1 } }));
            } else {
                scopes.push(new ScopeModel(item));
            }
        });
        ScopeModel.saveAll(scopes);
    })

    // Sockets to add scope related milestones
    socket.on(socketType.ADD_SCOPE_MILESTONE, ({ scope, taskId }) => {
        SelectedTaskDetailModel.updateScope(scope, taskId)
    })

    // Sockets to add scope related milestones

    socket.on(socketType.UPDATE_SCOPE, async (data) => {
        // const scope = ScopeModel.getScopeId(data.scope.id);
        // const SelectedTask = SelectedTaskDetailModel.last();
        // if (SelectedTask && SelectedTask.props) {
        //     SelectedTaskDetailModel.updateScope(data.scope, SelectedTask.props.id)
        // } else {
        //     ScopeModel.updateScope(data.scope)
        // }
        await getUsersTotalUrgentNonUrgentHours()
        if (UtilModel.last().props.isUninvoicedPageOpen) {  // done for adding new scopes when on uninvoiced page as that page has no selectoe available
            data.scope.invoiceType = { _id: 1 }
        }
        const SelectedTask = SelectedTaskDetailModel.last();
        if (SelectedTask && SelectedTask.props) {
            SelectedTaskDetailModel.updateScope(data.scope, SelectedTask.props.id)
        } else {
            const scope = ScopeModel.getScopeId(data.scope.id);
            if (scope && scope.props) {
                new ScopeModel(data.scope).$save();
            } else {
                const user = SelectedUserModel.last() && SelectedUserModel.last().props || UserModel.last().props;
                if (!user || !checkIdUserExistInScope(data.scope, user._id)) return; // check user is part of scope
                const scopeInstance = new ScopeModel(data.scope);
                ScopeModel.saveAllOnTop([scopeInstance])
            }
        }
    })

    socket.on(socketType.UPDATE_DRAWING, (data) => {
        ScopeModel.socket_updateScopeMileStone('drawing', data)
    })

    socket.on(socketType.UPDATE_CUST_DRAWING, (data) => {
        ScopeModel.socket_updateScopeMileStone('custDrawing', data)
    })

    socket.on(socketType.UPDATE_TAB_DATA, (data) => {
        ScopeModel.socket_updateScopeMileStone('tabData', data)
    })

    socket.on(socketType.UPDATE_CALC, (data) => {
        ScopeModel.socket_updateScopeMileStone('calc', data)
    })

    socket.on(socketType.UPDATE_SCOPE_PLANNING, (data) => {
        ScopeModel.socket_updateScopeMileStone('scopePlanning', data)
    })

    socket.on(socketType.UPDATE_LETTER, (data) => {
        ScopeModel.socket_updateScopeMileStone('letter', data)
    })

    socket.on(socketType.UPDATE_SCOPE_KEYWORD, (data) => {
        ScopeModel.socket_updateScopeMileStone('scopeKeyword', data)
    })

    socket.on(socketType.MANAGER_UPDATE, (data) => {
        if (UtilModel.last().props.isUninvoicedPageOpen) {  // done for adding new scopes when on uninvoiced page as that page has no selectoe available
            ScopeModel.saveAll(data.task.map(scope => new ScopeModel({ ...scope, invoiceType: { _id: 1 } })))
            // ScopeModel.saveAllOnTop([new ScopeModel({ ...data, invoiceType: { _id: 1 } })]);
        } else {

            ScopeModel.saveAll(data.task.map(scope => new ScopeModel(scope)))
        }
    });
    //scope related sockets

    // add scope to main page table
    socket.on(socketType.ADD_SCOPE, async (data) => {
        await getUsersTotalUrgentNonUrgentHours()

        const user = SelectedUserModel.last() && SelectedUserModel.last().props || UserModel.last().props;
        if (!user || !checkIdUserExistInScope(data, user._id)) return;
        if (UtilModel.last().props.isUninvoicedPageOpen) {  // done for adding new scopes when on uninvoiced page as that page has no selectoe available
            ScopeModel.saveAllOnTop([new ScopeModel({ ...data, invoiceType: { _id: 1 } })]);
        } else {
            ScopeModel.saveAllOnTop([new ScopeModel(data)]);
        }
    })

    socket.on(socketType.UPDATE_SCOPE_HIGHLIGHTS, (data) => {
        ScopeModel.updateScopeHighlight(data.highlights, data.id)
    })

    //these sockets result in task manuplation and addition

    socket.on(socketType.ADD_TASK, async (task) => {
        await getUsersTotalUrgentNonUrgentHours()

        const finalTask = { ...task };                  // task object simillar to Scope inside ScopeModel
        finalTask.scopes = task.scopes.map(scope => scope.id);
        const scopes = [];
        task.scopes.forEach(scope => scopes.push(new ScopeModel({ ...scope, task: finalTask })));
        ScopeModel.saveAllOnTop(scopes);
    })

    socket.on(socketType.ADD_TASK_COMMENT, (data) => {
        const userInstance = EmployeeModel.list().find(item => item.props._id === data.comment.postedBy);
        if (!userInstance) return;
        SelectedTaskDetailModel.addComment(data.taskId, data.comment, userInstance.props)
    })

    socket.on(socketType.UPDATE_TASK_COMMENT, (data) => {
        const userInstance = EmployeeModel.list().find(item => item.props._id === data.comment.postedBy);
        if (!userInstance) return;
        SelectedTaskDetailModel.updateComment(data.taskId, data.comment, userInstance.props)
    })

    socket.on(socketType.DELETE_TASK_COMMENT, (data) => {
        SelectedTaskDetailModel.deleteComment(data.taskId, data.comment)
    })

    socket.on(socketType.UPDATE_TASK, (data) => {
        if (data && data.id) {
            SelectedTaskDetailModel.updateTaskDescription(data, data.id)
        }
    })

    socket.on(socketType.UPDATE_TASK_TAGS, (data) => {
        SelectedTaskDetailModel.updateTags(data, data.taskId)
    })

    socket.on(socketType.ADD_TASK_SCOPE, async (data) => {
        await getUsersTotalUrgentNonUrgentHours()
        data.task = data.task.id
        SelectedTaskDetailModel.addNewScopes([data], data.task);
    })

    // update other user's urgent and non urgent hours
    socket.on(socketType.UPDATE_USER_TOTAL_HOURS, (data) => {
        AppAction.updateUserOtherUser(data);
    });

    socket.on(socketType.ITEM_TYPE_UPDATE, (itemType) => {
        AppAction.updateItemTypeBySocketSuccess(itemType.newItemType);
        ItemTypeAction.updateItemTypeBySocketSuccess(itemType.newItemType);
        ItemTypeModel.updateItemType(itemType.newItemType)
    });

    socket.on(socketType.ROLE_UPDATE, (data) => {
        RoleAction.updateRoleSuccess(data.role);
    });

    // time sheet and hourtracker related sockets

    socket.on(socketType.ADD_HOUR_TRACKER, (data) => {
        const user = UserModel.last().props;
        if (user.id === data.employee.id) {
            HourTrackerModel.addHour(data);
        }
    });

    socket.on(socketType.ADD_HOUR_TRACKER_TO_SCOPE, (data) => {
        const selectedTask = SelectedTaskDetailModel.last();
        if (selectedTask) {
            ScopeModel.addHourToScope(data, selectedTask.props.id)
        }
    });

    socket.on(socketType.UPDATE_HOUR_TRACKER, data => {
        const selectedTask = SelectedTaskDetailModel.last();
        if (selectedTask) {
            SelectedTaskDetailModel.updateHourTrackRecord(data, data.taskId);
        }
        HourTrackerModel.updateHour(data);
    })

    socket.on(socketType.DELETE_HOUR_TRACKER, data => {
        HourTrackerModel.deleteHour(data);
    })

    socket.on(socketType.REMOVE_HOUR_TRACKER_FROM_SCOPE, data => {
        const selectedTask = SelectedTaskDetailModel.last();
        if (selectedTask) {
            ScopeModel.removeHourFromScope(data, selectedTask.props.id);
        }
    })

}

