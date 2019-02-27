import moment, { utc } from 'moment';

export function getDifferanceInDays(fromDate, toDate) {
    let newFromDate = moment(fromDate);
    let newToDate = moment(toDate);
    return newFromDate.diff(newToDate, 'days');
}

export function getMonthDateYearFormat(date) {
    return moment(date).format('M/D/YY');
}

export function sortByDate(arr, key) {
    return arr.sort((item, item1) => {
        if (new Date(item[key]).getTime() < new Date(item1[key]).getTime()) {
            return 1;
        } else if (new Date(item[key]).getTime() > new Date(item1[key]).getTime()) {
            return -1;
        }
        return 0;
    });
}

export function sortByDateAsc(arr, key) {
    return arr.sort((item, item1) => {
        if (new Date(item[key]).getTime() < new Date(item1[key]).getTime()) {
            return -1;
        } else if (new Date(item[key]).getTime() > new Date(item1[key]).getTime()) {
            return 1;
        }
        return 0;
    });
}

export function isSameDate(date1, date2 = new Date()) {
    const starDate = moment(date1).startOf('day');
    const endDate = moment(date2).startOf('day');
    return starDate.isSame(endDate);
}

export function getUTCDate(date) {
    return utc(date);
}

export function getStartDateOfDay(date = moment()) {
    return moment(date).startOf('day');
}

export function isTodayOrPast(date) {
    return moment().isSameOrAfter(moment(date));
}

export function isWithinSameWeek(date) {
    return moment(date).isSame(moment(), 'week');
}

export function isWithinWeekOrNextSevenDays(date) {
    return moment(date).isBetween(moment().startOf('week'), moment().add(8, 'days'), 'day');
}

export function isDueDateAfterWeek(date) {
    return isTodayOrPast(date) || isWithinSameWeek(date) ? false : true;
}

export function isDueDateWeekNotToday(date) {
    if (isTodayOrPast(date)) {
        return false;
    }
    return moment(date).isSame(moment(), 'week');
}

export function getFridayDate(date = undefined) {
    let payDate = new Date();
    return payDate.setDate(payDate.getDate() + (7 + 5 - payDate.getDay()) % 7);
}

export function extractHoursAndAppendToDate(time, toDate) {
    const hours = moment(time).get('hours');
    const min = moment(time).get('minutes');
    return moment(toDate).set({ hours: hours, minutes: min, second: 0 }).valueOf();
}

export function getDefaultDateRangeForGroups(startYearGap = 1) {
    return [
        moment().subtract(startYearGap, 'year'),
        moment()
    ];
}

export const disabledDate = (value) => value < moment().subtract(1, 'days');

export const enableAllDate = value => !moment(value).isValid();

export const getDefaultTime = (timePickerFor, date) => {
    switch (timePickerFor) {
        case 'timeIn':
            return moment(date).hours(7).minute(0).second(0).valueOf()
        case 'timeOut':
            return moment(date).hours(16).minute(0).second(0).valueOf()
        case 'lunchIn':
            return moment(date).hours(11).minute(30).second(0).valueOf()
        case 'lunchOut':
            return moment(date).hours(12).minute(30).second(0).valueOf()
        default:
            return moment(date);
    }
};
