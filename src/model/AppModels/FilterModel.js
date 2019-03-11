import { BaseModel } from ".././BaseModel";

export class AdvanceFilter extends BaseModel {
    static resource = 'filter';

    constructor(properties) {
        super(properties);
    }

    static saveFilter(field, value) {
        let filter = this.last();
        filter = filter && filter.props || filter
        filter = {
            ...filter,
            [field]: value
        }
        new AdvanceFilter(filter).$save();
    }

    static removeFilter() {
        let filter = this.last();
        if (filter && filter.props) {
            filter.props = {
                applyFilter: false
            };
            new AdvanceFilter(filter.props).$save();
        }
    }
}
