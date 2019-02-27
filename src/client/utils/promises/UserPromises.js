import moment from 'moment';

import RequestHandler from '../../components/helpers/RequestHandler';
import { UserModel } from '../../model/UserModel';
import { showFaliureNotification } from '../../utils/notifications';


export function getUserScopesByGroup(userId, groupId, fromYear = moment().subtract(1, 'year').year(), toYear = moment().year()) {
    return RequestHandler.postNew(`scope/group/${groupId}`, { userId, fromYear, toYear });
}

export function updateUser(payload, userID) {
    return RequestHandler.put(`users/${userID}`, payload);
}

export async function getLoggedInUser(payload) {
    const user = await RequestHandler.post('users/getLoggedInUser', payload);
    new UserModel({
        loggedInUser: user
    }).$save();

}

export function login(payload) {
    return RequestHandler.post('users/login', payload);
}

export function getMasterData() {
    return RequestHandler.get('app-settings/master-data');
}

export async function getTodaysLoggedHoursOfUser(userID = '') {
    try {
        const user = UserModel.last()
        userID = user.props._id
        const todaysHours = await RequestHandler.get(`users/user-total-hours/${userID}`);
        UserModel.updateCurrentUser({
            todaysHours
        });
    } catch (error) {
        console.error('Error while fetching todays logged in hours\n', error);
        showFaliureNotification('Unable to fetch today`s logged in hours');
    }
}

export async function getUsersTotalUrgentNonUrgentHours(userID = '') {
    const user = UserModel.last()
    userID = user.props._id
    if (userID) {
        const urgentNonUrgentHours = await RequestHandler.get(`users/${userID}/totalHours`);
        UserModel.updateCurrentUser(urgentNonUrgentHours);
    }
}
