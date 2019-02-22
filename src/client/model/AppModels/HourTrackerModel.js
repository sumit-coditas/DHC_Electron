import { BaseModel } from ".././BaseModel";
import cloneDeep from 'lodash/cloneDeep'


export class HourTrackerModel extends BaseModel {
    static resource = 'hourTracker';

    constructor(properties) {
        super(properties);
    }

    static getHourId(id) {
        return cloneDeep(this.get(id));
    }


    static deleteHour(result) {
        result.id = result.hourId || result.id
        const oldHourTrackers = HourTrackerModel.list().map(item => item.props);
        const updatedHourTrackers = oldHourTrackers.filter(hour => hour.id !== result.id);
        HourTrackerModel.deleteAll();
        HourTrackerModel.saveAll(updatedHourTrackers.map(hourTrack => new HourTrackerModel(hourTrack)))
    }

    static updateHour(result) {
        // const hours = HourTrackerModel.list().map(item => item.props)
        // const index = hourTrackers.findIndex(hour => hour.id == result.id)
        // if (index == -1) return
        // hours.hourTrackers[index] = { ...hours.hourTrackers[index], result }
        // new HourTrackerModel(hours).$save()
        let updatedTracker = result.hourtracker || result;
        const oldHour = this.getHourId(result.id);
        if (!oldHour) return;
        new HourTrackerModel({ ...oldHour.props, ...updatedTracker }).$save();
    }

    static addHour(result) {
        let hourTrackers = HourTrackerModel.list().map(item => item.props) || []
        hourTrackers.push(result);
        HourTrackerModel.saveAll(hourTrackers.map(hourTrack => new HourTrackerModel(hourTrack)))
    }

    static addMultiple(results) {
        let hourTrackers = HourTrackerModel.list().map(item => item.props) || [];
        hourTrackers.push(...results);
        HourTrackerModel.saveAll(hourTrackers.map(hourtracker => new HourTrackerModel(hourtracker)));
    }
}