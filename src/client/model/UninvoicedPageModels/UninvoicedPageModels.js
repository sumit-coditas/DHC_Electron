import { BaseModel } from '../BaseModel';

export class UninvoicedPageModel extends BaseModel {
    static resource = 'user';

    constructor(properties) {
        super(properties);
    }
}