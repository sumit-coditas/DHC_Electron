import moment from 'moment';
import { getTaskNumber } from '../../utils/common';
import sortBy from 'lodash/sortBy';
import shortid from 'shortid';
import { getStartDateOfDay } from '../../utils/DateUtils';
import { DrafterAdminModal } from '../../model/payDayModels/DrafterAdminModal';

export function getDailyPopUpTableData(hourTrackers = [], selectedDate) {
    if (!hourTrackers.length) { return [initDailyTableData] }
    if (selectedDate) {
        const tableRows = hourTrackers.filter((hour) => moment(hour.date).isSame(moment(selectedDate), 'day'))
        return tableRows.map(hourTrack => formatData(hourTrack))
    }
    const tableRows = hourTrackers.map((hourTrack) => {
        return formatData(hourTrack)
    });
    return tableRows
}

function formatData(hourTrack) {
    const scopeNumber = hourTrack.scope && hourTrack.scope.number;
    const task = hourTrack.task && hourTrack.task.id || null;
    const rowData = {
        'jobNumber': hourTrack.other || task && getTaskNumber(hourTrack.task) || '-',
        'project': task && hourTrack.task.title || '-',
        'customer': task && hourTrack.task.contractor && hourTrack.task.contractor.name || '-',
        'scope': scopeNumber,
        'note': hourTrack.scope && hourTrack.scope.note || '-',
        'notes': hourTrack.note,
        'hoursSpent': hourTrack.hoursSpent,
        'scopeId': hourTrack.scope && hourTrack.scope.id,
        'hourId': hourTrack.id,
        'id': hourTrack._id,
        'taskId': task && task.id || ''
    }
    return rowData
}

export function getSpentTime(data) {
    let timeOut = data.timeOut
    if (moment(data.timeIn).isAfter(timeOut)) {
        timeOut = moment(timeOut).add(1, 'day')
    }
    let total = data.total - data.pto;
    // total = total * 60;
    let inOutTimeDifference = moment(timeOut).diff(moment(data.timeIn), 'minutes')
    inOutTimeDifference = inOutTimeDifference / 60
    let lunchTime = total >= 6 && moment(data.lunchOut).diff(data.lunchIn, 'minutes') || 0
    lunchTime = lunchTime / 60
    let duration = inOutTimeDifference - lunchTime
    duration = duration < 0 && duration * -1 || duration;

    if (total != 0 && total < duration) return 'yellow'
    else if (data.total != 0 && total > duration) return 'red'
    else if (duration == total) return 'default'
    else return 'default'
}

export function getDrafterAdminData(data = [], selectedDate, startDate) {
    if (selectedDate) {
        return data.filter((hour) => moment(hour.date).isSame(moment(selectedDate), 'day'))
    }
    if (!data.length) return [initDrafterAdminData(startDate)]
    return data.map((adminDrafter) => {
        return {
            ...adminDrafter,
            timeIn: adminDrafter.timeIn || moment(adminDrafter.date).set({ hours: 7, minutes: 0 }).valueOf(),
            lunchIn: adminDrafter.lunchIn || moment(adminDrafter.date).set({ hours: 11, minutes: 30 }).valueOf(),
            lunchOut: adminDrafter.lunchOut || moment(adminDrafter.date).set({ hours: 12, minutes: 30 }).valueOf(),
            timeOut: adminDrafter.timeOut || moment(adminDrafter.date).set({ hours: 4, minutes: 0 }).valueOf()
        }
    })
}

export function getDrafterAdminWeeklyData(hourTrackers = [], drafteAdminData = [], endDate) {
    if (drafteAdminData.length === 0) {
        return []
    }
    const dates = getLast15Days(endDate);
    const rowData = [];
    let totalRegular = 0, totalOT = 0, totalPTO = 0;
    drafteAdminData.forEach(dateItem => {
        // dates.forEach((dateItem) => {
        // const timeObj = drafteAdminData.find(data => moment(data.date).isSame(moment(dateItem), 'day'));
        const obj = {
            dayField: moment(dateItem.date).format('ddd'),
            dateField: moment(dateItem.date).format('DD-MMM'),
            pto: 0, total: 0, hoursSpent: 0, regular: 0, ot: 0,
            // ...getTimeObject(timeObj, dateItem),
            ...dateItem,
            date: dateItem.date
        }
        const sameDayRecords = hourTrackers.filter(day => moment(day.date).isSame(moment(dateItem.date), 'day'))
        sameDayRecords.forEach((sameDayHour) => {
            obj.hoursSpent = sameDayHour.other !== 'PTO' && obj.hoursSpent + sameDayHour.hoursSpent
                || obj.hoursSpent,
                obj.pto = sameDayHour.other === 'PTO' ? obj.pto + sameDayHour.hoursSpent
                    : obj.pto
        });
        obj.regular = obj.hoursSpent > 8 ? 8 : obj.hoursSpent
        obj.ot = obj.hoursSpent > 8 ? obj.hoursSpent - 8 : obj.ot
        obj.total = obj.regular + obj.ot + obj.pto;
        obj.overtime = obj.ot;
        totalRegular = obj.regular + totalRegular;
        totalPTO = obj.pto + totalPTO;
        totalOT = obj.ot + totalOT;
        rowData.push(obj)
        // })
    })
    const total = totalRegular + totalOT + totalPTO;
    rowData.push({ totalPTO, totalRegular, totalOT, total, payDayTotal: true })
    return rowData
}

export function getManagerEngineerWeeklyData(hourTrackers = [], endDate) {
    const dates = getLast15Days(endDate);
    let weeklyPto = 0, weeklyHour = 0;
    const rowData = []
    let totalHoursSpent = 0, totalPTO = 0;
    dates.forEach((date) => {
        const obj = {
            'dayField': moment(date).format('ddd'), 'dateField': moment(date).format('DD-MMM'),
            'hoursSpent': 0, 'pto': 0, 'total': 0, 'date': date
        }
        const sameDayRecords = hourTrackers.filter(day => moment(day.date).isSame(moment(date), 'day'))
        sameDayRecords.forEach((sameDayHour) => {
            obj.hoursSpent = sameDayHour.other !== 'PTO' && obj.hoursSpent + sameDayHour.hoursSpent || obj.hoursSpent;
            obj.pto = sameDayHour.other === 'PTO' || sameDayHour.other === 'pto' ? obj.pto + sameDayHour.hoursSpent : obj.pto
        })
        obj.total = obj.hoursSpent + obj.pto;
        rowData.push(obj)

        weeklyHour = weeklyHour + obj.hoursSpent;
        weeklyPto = weeklyPto + obj.pto;
        const isFirstWeeklyTotal = moment(dates[0]).endOf('week').isSame(moment(date), 'day')
        const isSecondWeeklyTotal = moment(dates[dates.length - 1]).endOf('week').isSame(moment(date), 'day');
        if (isFirstWeeklyTotal || isSecondWeeklyTotal) {
            obj.weeklyHour = weeklyHour;
            obj.weeklyPto = weeklyPto
            obj.weeklyTotal = obj.weeklyHour + obj.weeklyPto
            weeklyHour = 0; weeklyPto = 0
            totalHoursSpent = totalHoursSpent + obj.weeklyHour;
            totalPTO = obj.weeklyPto + totalPTO
            rowData.push({ ...obj, isWeeklyRecord: true });
        }
    })
    const obj = {
        totalPTO, totalHoursSpent, isWeeklyRecord: true, payDayTotal: true,
        total: totalPTO + totalHoursSpent
    }
    rowData.push(obj)
    return rowData
}

export function getLast15Days(date = undefined) {
    var dates = []
    for (var i = 14; i >= 1; i--) {
        dates.push(getStartDateOfDay(moment(date).subtract(i, 'day')))
    }
    return dates
}

const initDailyTableData = {
    'jobNumber': '-', 'project': '-', 'customer': '-', 'scope': '-',
    'note': '-', 'hoursSpent': 0, 'scopeId': '-', 'hourId': '-', 'id': '-',
    'isDummyRow': true, date: moment()
}

function initDrafterAdminData(startDate) {
    return {
        "date": moment(startDate).startOf('day').valueOf(),
        'isDummyRow': true,
        "timeIn": moment(startDate).startOf('day').add(7, 'hours').valueOf(),
        "lunchIn": moment(startDate).startOf('day').add(11.5, 'hours').valueOf(),
        "lunchOut": moment(startDate).startOf('day').add(12.5, 'hours').valueOf(),
        "timeOut": moment(startDate).startOf('day').add(16, 'hours').valueOf(),
    }
}



export function getTimeObject(date) {
    if (timeObj && timeObj.timeIn) {
        return {
            ...timeObj,
            "timeIn": timeObj && timeObj.timeIn || moment(date).set({ hours: 7, minutes: 0 }).valueOf(),
            "lunchIn": timeObj && timeObj.lunchIn || moment(date).set({ hours: 11, minutes: 30 }).valueOf(),
            "lunchOut": timeObj && timeObj.lunchOut || moment(date).set({ hours: 12, minutes: 30 }).valueOf(),
            "timeOut": timeObj && timeObj.timeOut || moment(date).set({ hours: 16, minutes: 0 }).valueOf(),
        }
    } else {
        const obj = {
            ...timeObj,
            date: date,
            id: shortid.generate() + shortid.generate(),
            "timeIn": moment(date).set({ hours: 7, minutes: 0 }).valueOf() || '',
            "lunchIn": moment(date).set({ hours: 11, minutes: 30 }).valueOf() || '',
            "lunchOut": moment(date).set({ hours: 12, minutes: 30 }).valueOf() || '',
            "timeOut": moment(date).set({ hours: 16, minutes: 0 }).valueOf() || '',
        }
        return obj
    }
}

const managerEngineerDefault = {
    'dayField': '-', 'dateField': '-', 'isDummyRow': true,
    'hoursSpent': '-', 'pto': '-', 'total': 0,
}

export const TOOLTIPS = {
    red: 'indicates hour spent are more than time in and out duration',
    yellow: ' indicates hour spent are less than time in and out duration',
    default: 'every thing seems correct'
} 