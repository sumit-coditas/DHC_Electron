import { BaseModel } from ".././BaseModel";

export class UtilModel extends BaseModel {
    static resource = 'util_persona';

    constructor(properties) {
        super(properties);
    }

    static getUtilsData() {
        let utilInstance = UtilModel.last();
        let data = {};
        if (utilInstance) {
            data = utilInstance.props;
        }
        return data;
    }

    static updateLoaderValue(flag) {
        const data = UtilModel.getUtilsData();
        data.showTableLoader = flag
        new UtilModel(data).$save();
    }

    static updateManualSort(flag) {
        const data = UtilModel.getUtilsData();
        data.isManualSortDisabled = flag
        new UtilModel(data).$save();
    }

    static showLoginLoader(flag) {
        const data = UtilModel.getUtilsData();
        data.showLoginLoader = flag
        new UtilModel(data).$save();
    }

    static isUninvoicedPageOpen(flag) {
        const data = UtilModel.getUtilsData();
        data.isUninvoicedPageOpen = flag
        new UtilModel(data).$save();
    }

    static setShowKeywordSection(flag) {
        const data = UtilModel.getUtilsData();
        data.hideKeywordSection = flag
        new UtilModel(data).$save();
    }

    static setShowAllGreenMilestones(flag) {
        const data = UtilModel.getUtilsData();
        data.hideAllGreenMilestones = flag
        new UtilModel(data).$save();
    }
}