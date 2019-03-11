import { BaseModel } from '../BaseModel';

export class ActiveHoldPageModel extends BaseModel {
    static resource = 'active_hold_invoices';
    constructor(properties) {
        super(properties);
    }
}