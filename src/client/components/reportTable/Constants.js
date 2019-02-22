export const ReportTableHeader = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
    'Avg',
    'Total'
];

export const DollarReportTableHeader = [
    '$/BH',
    '$/TH',
    '$/(TH + PTO+ HOLIDAY)'
];

export const monthArray = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
];

export const perDollarHourArray = [
    {
        title: 'totalAndHolidayAmount',
        hourField: 'hours'
    },
    {
        title: 'billedAmount',
        hourField: 'billedHours'
    },
    {
        title: 'totalAmount',
        hourField: 'totalHours'
    }
];


export const Strings = {
    tableTitle: 'Productivity Report',
    aeOnly: 'AE',
    pmOnly: 'PM Only',
    total: 'Total'
};

export const options = {
    reportType: [
        { key: '0', text: 'Total Billing Dollars', value: 'total_billing_dollars', roles: ['manager'] },
        { key: '1', text: 'Billing Hours', value: 'billing_hours_report', roles: ['manager'] },
        { key: '2', text: 'Total Hours', value: 'total_hours_report', roles: ['manager', 'engineer'] },
        { key: '3', text: 'TH + PTO + HOLIDAY', value: 'total_and_pto_report', roles: [] },
        { key: '4', text: '$/Hour', value: 'dollar_per_hour', roles: ['manager'] },
        { key: '5', text: 'PTO', value: 'pto_report', roles: [] }
        // { key: '4', text: '$/BH', value: 'dollar_per_billing_hour_report', roles: ['manager'] },
        // { key: '5', text: '$/TH', value: 'dollar_per_total_hour_report', roles: ['manager'] },
        // { key: '6', text: '$/(TH + PTO + HOLIDAY)', value: 'dollar_per_total_and_pto_report', roles: ['manager'] },
        // { key: '8', text: 'Salary', value: 'salary_report', roles: ['manager'] },
        // { key: '9', text: 'Bonus*', value: 'bonus_report', roles: ['owner', 'manager', 'engineer'] },
        // { key: '10', text: 'Salary + Bonus*', value: 'salary_and_bonus_report', roles: ['owner', 'manager', 'engineer'] }
    ]
};
