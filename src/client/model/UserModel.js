import { BaseModel } from './BaseModel';
import cloneDeep from 'lodash/cloneDeep';

export class UserModel extends BaseModel {
    static resource = 'user';

    static getCurrentUser() {
        return cloneDeep(this.last().props);
    }

    constructor(properties) {
        super(properties);
    }
    static updatePayDate(date) {
        let user = this.getCurrentUser();
        user.payDayFormDate = date
        new UserModel(user).$save();
    }

    static updateCurrentUser(data) {
        let user = this.getCurrentUser();
        user = { ...user, ...data }
        new UserModel(user).$save();
    }

    static setSocket(socket) {
        let user = this.getCurrentUser();
        if (!user) return;
        user.socket = socket;
        new UserModel(user).$save();
    }
}
