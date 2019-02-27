import { BaseModel } from ".././BaseModel";

export class SelectedUserModel extends BaseModel {
    static resource = 'selectedUser';

    constructor(properties) {
        super(properties);
    }
}