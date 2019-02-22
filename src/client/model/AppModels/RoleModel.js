import { BaseModel } from ".././BaseModel";

export class RoleModel extends BaseModel {
    static resource = 'role';

    constructor(properties) {
        super(properties);
    }
}