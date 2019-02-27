import { BaseModel } from ".././BaseModel";
import cloneDeep from 'lodash/cloneDeep';

export class ItemTypeModel extends BaseModel {
    static resource = 'itemType';

    constructor(properties) {
        super(properties);
    }

    static getItemTypeId(id) {
        return cloneDeep(this.get(id));
    }

    static addItemType(itemType) {
        new ItemTypeModel(itemType).$save()
    }

    static updateItemType(itemType) {
        const existingItemType = cloneDeep(itemType.id);
        if (existingItemType && existingItemType.props) {
            existingItemType.props = { ...existingItemType.props, ...itemType };
            new ItemTypeModel(existingItemType.props).$save()
        }
    }
}