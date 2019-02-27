import { BaseModel } from ".././BaseModel";

export class TagModel extends BaseModel {
    static resource = 'tag';

    constructor(properties) {
        super(properties);
    }
}