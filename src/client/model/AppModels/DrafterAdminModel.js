import { BaseModel } from ".././BaseModel";
import cloneDeep from 'lodash/cloneDeep'

export class DrafterAdminModel extends BaseModel {
    static resource = 'drafterAdmin';

    constructor(properties) {
        super(properties);
    }
    static getDrafterAdminDataById(id) {
        return cloneDeep(this.get(id));
    }
}