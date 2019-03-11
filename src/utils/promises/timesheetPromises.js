import { HourTrackerModel } from '../../model/AppModels/HourTrackerModel';
import { DrafterAdminModal } from '../../model/payDayModels/DrafterAdminModal';
import RequestHandler from '../../components/helpers/RequestHandler';

export function updateTime(payload) {
    return RequestHandler.post('timeInTimeOut/update/time', payload);
}

export function createTimeInOutRecord(payload) {
    return RequestHandler.post('timeInTimeOut/save', payload);
}

export function fetchWorkDetail(payload) {
    return RequestHandler.post('hourTracker/get-work-details', payload);
}

export function updateHourTrackerReport(payload) {
    return RequestHandler.post('hourTracker_new/generate-payday-report', payload);
}

export function updatePayDate(payload) {
    return RequestHandler.post('hourTracker_new/update-pay-date', payload);
}

export async function getUsersHourtrackers(payload) {
    const response = await RequestHandler.get(`hourTracker_new/user/${payload.userId}/${payload.year}/${payload.month}/${payload.needYear}`);
    HourTrackerModel.deleteAll();
    DrafterAdminModal.deleteAll();
    if (response.hourTrackers && response.hourTrackers.length) {
        HourTrackerModel.saveAll(response.hourTrackers.map(item => new HourTrackerModel(item)));
        DrafterAdminModal.saveAll(response.drafterAdminData.map(item => new DrafterAdminModal(item)));
    }
    return response;
}

export async function saveMultipleHourtrackers(payload) {
    const response = await RequestHandler.post('hourTracker/insert/multiple', payload);
    HourTrackerModel.addMultiple(response);
    return response;
}
