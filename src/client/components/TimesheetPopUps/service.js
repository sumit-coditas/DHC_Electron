import { fetchWorkDetail } from '../../utils/promises/timesheetPromises';
import { deleteHour, removeHourFromScope, updateHourtracker } from '../../utils/promises/TaskPromises';
import { HourTrackerModel } from '../../model/AppModels/HourTrackerModel';
import { DrafterAdminModel } from '../../model/AppModels/DrafterAdminModel';
import { SelectedTaskDetailModel } from '../../model/TaskModels/SelectedTaskDetailModel';
import { ScopeModel } from '../../model/CustomerHomeModels/ScopeModel';
import { showFaliureNotification, showSuccessNotification } from '../../utils/notifications';
import Constant from '../helpers/Constant';
import { getLast15Days, getTimeObject } from './util';
import moment from 'moment';
import shortid from 'shortid';
import { extractHoursAndAppendToDate } from '../../utils/DateUtils';
import { getTodaysLoggedHoursOfUser } from '../../utils/promises/UserPromises';

export async function fetchWorkDetails(payload, done) {
    try {
        const response = await fetchWorkDetail(payload);
        const drafterAdminData = response.drafterAdminData.map(data => {
            return { ...data, startDate: payload.startDate, endDate: payload.endDate }
        })
        const hourTrackers = response.hourTrackers.map(data => {
            return {
                ...data,
                startDate: payload.startDate, endDate: payload.endDate
            }
        })
        let dateArray = getLast15Days(payload.endDate);
        const drafterDataArray = dateArray.map(dateItem => {
            const drafterData = drafterAdminData.find(data => moment(data.date).isSame(moment(dateItem), 'day'))
            // if (drafterData) {
            //     drafterData.timeIn= !drafterData.timeIn ? moment(dateItem).set({ hours: 7, minutes: 0 }).valueOf() : drafterData.timeIn;
            //     drafterData.lunchIn= !drafterData.lunchIn ? moment(dateItem).set({ hours: 11, minutes: 30 }).valueOf() : drafterData.lunchIn;
            //     drafterData.lunchOut= !drafterData.lunchOut ? moment(dateItem).set({ hours: 12, minutes: 30 }).valueOf() : drafterData.lunchOut;
            //     drafterData.timeOut= !drafterData.timeOut ? moment(dateItem).set({ hours: 16, minutes: 0 }).valueOf() : drafterData.timeOut;
            //     return new DrafterAdminModel(drafterData);
            // }
            // return new DrafterAdminModel({
            //     date: moment(dateItem).valueOf(),
            //     id: shortid.generate(),
            //     timeIn: moment(dateItem).set({ hours: 7, minutes: 0 }).valueOf(),
            //     lunchIn: moment(dateItem).set({ hours: 11, minutes: 30 }).valueOf(),
            //     lunchOut: moment(dateItem).set({ hours: 12, minutes: 30 }).valueOf(),
            //     timeOut: moment(dateItem).set({ hours: 16, minutes: 0 }).valueOf(),
            // })
            if (drafterData) {
                drafterData.timeIn = !drafterData.timeIn ? moment(dateItem).set({ hours: 7, minutes: 0, seconds: 0, millisecond: 0 }).valueOf() : extractHoursAndAppendToDate(drafterData.timeIn, dateItem);
                drafterData.lunchIn = !drafterData.lunchIn ? moment(dateItem).set({ hours: 11, minutes: 30, seconds: 0, millisecond: 0 }).valueOf() : extractHoursAndAppendToDate(drafterData.lunchIn, dateItem);
                drafterData.lunchOut = !drafterData.lunchOut ? moment(dateItem).set({ hours: 12, minutes: 30, seconds: 0, millisecond: 0 }).valueOf() : extractHoursAndAppendToDate(drafterData.lunchOut, dateItem);
                drafterData.timeOut = !drafterData.timeOut ? moment(dateItem).set({ hours: 16, minutes: 0, seconds: 0, millisecond: 0 }).valueOf() : extractHoursAndAppendToDate(drafterData.timeOut, dateItem);
                return new DrafterAdminModel(drafterData);
            }
            return new DrafterAdminModel({
                date: moment(dateItem).valueOf(),
                id: shortid.generate(),
                timeIn: moment(dateItem).set({ hours: 7, minutes: 0, seconds: 0, millisecond: 0 }).valueOf(),
                lunchIn: moment(dateItem).set({ hours: 11, minutes: 30, seconds: 0, millisecond: 0 }).valueOf(),
                lunchOut: moment(dateItem).set({ hours: 12, minutes: 30, seconds: 0, millisecond: 0 }).valueOf(),
                timeOut: moment(dateItem).set({ hours: 16, minutes: 0, seconds: 0, millisecond: 0 }).valueOf(),
            })
        });
        DrafterAdminModel.saveAll(drafterDataArray)
        HourTrackerModel.saveAll(hourTrackers.map(hour => new HourTrackerModel(hour)))
        return done()
    } catch (error) {
        console.error("error", error)
        return done()
    }
}
export async function fetchWorkDetailsDaily(payload, done) {
    try {
        const response = await fetchWorkDetail(payload);

        const hourTrackers = response.hourTrackers.map(data => {
            return {
                ...data,
                startDate: payload.startDate, endDate: payload.endDate
            }
        })
        let drafterDataArray = response.drafterAdminData.map(d => ({ ...d, startDate: payload.startDate, endDate: payload.endDate })) || []
        if (response.drafterAdminData && response.drafterAdminData.length == 0) {
            const deafaultObj = {
                date: moment(payload.startDate).valueOf(),
                id: shortid.generate(),
                timeIn: moment(payload.startDate).set({ hours: 7, minutes: 0 }).valueOf(),
                lunchIn: moment(payload.startDate).set({ hours: 11, minutes: 30 }).valueOf(),
                lunchOut: moment(payload.startDate).set({ hours: 12, minutes: 30 }).valueOf(),
                timeOut: moment(payload.startDate).set({ hours: 16, minutes: 0 }).valueOf(),
            }
            drafterDataArray.push(deafaultObj)
        }
        else {
            drafterDataArray = [drafterDataArray.pop()]
        }
        DrafterAdminModel.saveAll(drafterDataArray.map(hour => new DrafterAdminModel(hour)))
        HourTrackerModel.saveAll(hourTrackers.map(hour => new HourTrackerModel(hour)))
        return done()
    } catch (error) {
        console.error("error", error)
        return done()
    }
}

export async function deleteHourRecord(payload) {
    try {
        if (!payload.other) {
            const taskId = payload.taskId
            const response = await deleteHour(payload);
            getTodaysLoggedHoursOfUser()
            if (payload.scopeId) {
                const removeBody = { ...response, ...payload }
                const removeHourResponse = await removeHourFromScope(payload) // scopeid,hourTracker_id
                SelectedTaskDetailModel.removeHourFromScope(payload, taskId);
                ScopeModel.removeHourFromScope({ id: payload.scopeId, hourtracker: payload.id });
            }
            HourTrackerModel.deleteHour(payload)
            showSuccessNotification(Constant.NOTIFICATION_MESSAGES.TASK_HOURTRACKER.DELETE_SUCCESS);
        } else {
            deleteHour(payload)
                .then(res => {
                    HourTrackerModel.deleteHour(payload);
                    showSuccessNotification(Constant.NOTIFICATION_MESSAGES.TASK_HOURTRACKER.DELETE_SUCCESS);
                })
                .catch(error => {
                    throw 'error in delete';
                });
        }
    } catch (deleteError) {
        console.error('Error deleting hour record:\n', deleteError);
        showFaliureNotification(Constant.NOTIFICATION_MESSAGES.TASK_HOURTRACKER.DELETE_FAILURE);
    }
}

export async function updateHourtrackerCall(payload) { //id ==hourtracker.id not _id inside payload
    try {
        const response = await updateHourtracker(payload);
        HourTrackerModel.updateHour(response.data)
        const scopePayload = { hourtracker: response.data, scopeId: payload.scopeId }
        ScopeModel.updateHourFromScope(scopePayload);
        getTodaysLoggedHoursOfUser()
        showSuccessNotification(Constant.NOTIFICATION_MESSAGES.TASK_HOURTRACKER.UPDATE_SUCCESS);
    } catch (error) {
        console.error('Error updating hour tracker:\n', error)
        showFaliureNotification(Constant.NOTIFICATION_MESSAGES.TASK_HOURTRACKER.UPDATE_FAILURE);
    }
}