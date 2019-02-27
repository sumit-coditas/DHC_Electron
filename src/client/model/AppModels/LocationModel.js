import { BaseModel } from ".././BaseModel";

export class LocationModel extends BaseModel {
    static resource = 'location';

    constructor(properties) {
        super(properties);
    }
}