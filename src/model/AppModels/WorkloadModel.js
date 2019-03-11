import { BaseModel } from ".././BaseModel";

export class WorkloadModel extends BaseModel {
    static resource = 'workload';

    constructor(properties) {
        super(properties);
    }
}