import { BaseModel } from ".././BaseModel";

export class AppSettingModel extends BaseModel {
    static resource = 'appSetting';

    constructor(properties) {
        super(properties);
    }
}