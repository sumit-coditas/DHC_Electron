/* eslint-disable no-useless-constructor */
import { BaseModel } from '../BaseModel';

export class CustomerHomeModel extends BaseModel {
    static resource = 'customer_contacts';

    constructor(properties) {
        super(properties);
    }
}
