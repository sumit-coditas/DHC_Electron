import Constant from '../../components/helpers/Constant';
import { sortByNameDes, sortDates, sortByNameAsc, employeeSortComparator } from '../common';
import { FIELDS } from './ScopeTableFields';
import { sortByHighLights } from '../../utils/sortUtil';


export const customerTableHeader = [
    { headerName: 'TG', field: FIELDS.TG, suppressSorting: true, minWidth: 75 },
    { headerName: 'DHC Team', field: FIELDS.TEAM, suppressSorting: true, minWidth: 110, cellRenderer: 'internalTeamPopupRenderer' },
    { headerName: 'Customer', field: FIELDS.CUSTOMER_TEAM, suppressSorting: true, minWidth: 215, cellRenderer: 'customerTeamPopupRenderer' },
    { headerName: 'Job #', field: FIELDS.JOB, minWidth: 95 },
    { headerName: 'Project', field: FIELDS.PROJECT, minWidth: 215, cellRenderer: 'openTaskRenderer' },
    { headerName: 'Scope', field: FIELDS.SCOPE, minWidth: 100 },
    { headerName: 'Scope Note', field: FIELDS.SCOPE_NOTE, minWidth: 130 },
    { headerName: 'City', field: FIELDS.CITY, minWidth: 130 },
    { headerName: 'State', field: FIELDS.STATE, minWidth: 100 },
    { headerName: 'Status', field: FIELDS.STATUS, minWidth: 130 },
    {
        headerName: 'Due Date', field: FIELDS.DUE_DATE, minWidth: 100, filter: 'agDateColumnFilter',
        comparator: (filterDate, cellValue, node1, node2, isInverted) => {
            return sortDates(filterDate, cellValue, isInverted);
        }, filterParams: {
            comparator: (filterDate, cellValue) => sortByNameDes(new Date(cellValue), filterDate)
        }
    },
    // { headerName: 'Total E Hrs', field: FIELDS.ENG_HRS, minWidth: 110 },
    // { headerName: 'Total D Hrs', field: FIELDS.DRF_HRS, minWidth: 110 },
    { headerName: 'Cost', field: FIELDS.COST, minWidth: 100 },
    { headerName: 'PO Number', field: FIELDS.PO_NUM, minWidth: 70 },
    { headerName: 'Invoiced', field: FIELDS.INV, minWidth: 50 },
    // { headerName: 'INV', field: FIELDS.INV, sortable: true, minWidth: 65 },
    { headerName: 'Paid', field: FIELDS.PAID, minWidth: 50 }
];

export const uninvoicedHeader = [
    { headerName: 'TG', field: FIELDS.TG, editable: false, suppressSorting: true, minWidth: 75 },
    { headerName: 'Team', field: FIELDS.TEAM, editable: false, suppressSorting: true, minWidth: 110, cellRenderer: 'internalTeamDropdownRenderer' },
    { headerName: 'Contractor', field: FIELDS.CONTR, sortable: true, minWidth: 210, cellRenderer: 'openTaskRenderer' },
    { headerName: 'Job #', field: FIELDS.JOB, sortable: true, minWidth: 90 },
    { headerName: 'Project', field: FIELDS.PROJECT, editable: true, sortable: true, minWidth: 210 },
    { headerName: 'Scope', field: FIELDS.SCOPE, sortable: true, minWidth: 100 },
    { headerName: 'Scope Note', field: FIELDS.SCOPE_NOTE, editable: true, sortable: true, minWidth: 130 },
    { headerName: 'City', field: FIELDS.CITY, editable: true, sortable: true, minWidth: 130 },
    { headerName: 'State', field: FIELDS.STATE, cellRenderer: 'stateRenderer', sortable: true, minWidth: 100 },
    { headerName: 'Status', field: FIELDS.STATUS, editable: false, sortable: true, minWidth: 130, cellRenderer: 'statusRenderer' },
    {
        headerName: 'Due Date', field: FIELDS.DUE_DATE, editable: false, sortable: true, minWidth: 100, cellRenderer: 'dueDateRenderer',
        comparator: (filterDate, cellValue, node1, node2, isInverted) => {
            return sortDates(filterDate, cellValue, isInverted);
        }
    },
    { headerName: 'Cost', field: FIELDS.COST, editable: true, sortable: true, minWidth: 100 },
    { headerName: 'E Hrs', field: FIELDS.ENG_HRS, minWidth: 18 },
    { headerName: 'D Hrs', field: FIELDS.DRF_HRS, minWidth: 20 },
    { headerName: 'CSA', field: FIELDS.CSA, suppressSorting: true, minWidth: 20 },
    { headerName: 'PO', field: FIELDS.PO, sortable: true, minWidth: 20 },
    { headerName: 'INV', field: FIELDS.INV, sortable: true, minWidth: 20 },
    { headerName: 'Calc', field: FIELDS.CALC, sortable: true, minWidth: 20 }
];

export const homeTableHeader = [
    { headerName: 'TG', field: FIELDS.TG, editable: false, suppressSorting: true, minWidth: 75, cellRenderer: 'taskGroupRenderer', rowDrag: true },
    { headerName: 'Team', field: FIELDS.TEAM, editable: false, suppressSorting: true, minWidth: 120, cellRenderer: 'internalTeamDropdownRenderer' },
    { headerName: 'Contractor', field: FIELDS.CONTR, sortable: true, minWidth: 195, cellRenderer: 'openTaskRenderer' },
    { headerName: 'Job #', field: FIELDS.JOB, sortable: true, minWidth: 80, cellRenderer: 'openHourTrackerRenderer' },
    { headerName: 'Project', field: FIELDS.PROJECT, editable: true, sortable: true, minWidth: 200 },
    {
        headerName: 'Scope', field: FIELDS.SCOPE, sortable: true, minWidth: 75, cellRenderer: 'colorDropdown',
        cellClassRules: {
            'scope-highlight-red': params => params.data.scopeHighlightColor === Constant.SCOPE_HIGHLIGHT_COLOR.RED,
            'scope-highlight-blue': params => params.data.scopeHighlightColor === Constant.SCOPE_HIGHLIGHT_COLOR.BLUE,
            'scope-highlight-green': params => params.data.scopeHighlightColor === Constant.SCOPE_HIGHLIGHT_COLOR.GREEN,
            'scope-highlight-yellow': params => params.data.scopeHighlightColor === Constant.SCOPE_HIGHLIGHT_COLOR.YELLOW,
            'scope-highlight-none': params => params.data.scopeHighlightColor === Constant.SCOPE_HIGHLIGHT_COLOR.NONE
        },
        comparator: (value1, value2, node1, node2, isInverted) => sortByHighLights(node1, node2, isInverted)
    },
    {
        headerName: 'Scope Note', field: FIELDS.SCOPE_NOTE, maxLength: 16, editable: true, suppressSorting: true, minWidth: 130,
        cellRenderer: 'noteRender'
    },
    { headerName: 'City', field: FIELDS.CITY, editable: true, minWidth: 130 },
    { headerName: 'State', field: FIELDS.STATE, cellRenderer: 'stateRenderer', minWidth: 100 },
    { headerName: 'Status', field: FIELDS.STATUS, editable: false, minWidth: 130, cellRenderer: 'statusRenderer' },
    {
        headerName: 'Due Date', field: FIELDS.DUE_DATE_WITH_STATUS, editable: false, minWidth: 100, cellRenderer: 'dueDateRenderer',
        comparator: (filterDate, cellValue, node1, node2, isInverted) => {
            return sortDates(filterDate.date, cellValue.date, isInverted);
        }
    },
    { headerName: 'Cost', field: FIELDS.COST, editable: true, sortable: true, minWidth: 90, cellRenderer: 'costRenderer' },
    {
        headerName: 'U Hrs', field: FIELDS.U_HRS, minWidth:50, editable: params => isEditable(params), sortable: true
    },
    {
        headerName: 'NU Hrs', field: FIELDS.NU_HRS, minWidth: 55, editable: params => isEditable(params), sortable: true
    },
    { headerName: 'CSA', field: FIELDS.CSA, suppressSorting: true, minWidth: 45 },
    { headerName: 'PO', field: FIELDS.PO, suppressSorting: true, minWidth: 40 },
    { headerName: 'INV', field: FIELDS.CUST_INV, suppressSorting: true, minWidth: 45 },
    { headerName: 'Calc', field: FIELDS.CALC, suppressSorting: true, minWidth: 45 }
];

export const completeTableHeader = [
    { headerName: 'TG', field: FIELDS.TG, editable: true, suppressSorting: true, minWidth: 75, cellRenderer: 'taskGroupRenderer', rowDrag: true },
    { headerName: 'Team', field: FIELDS.TEAM, editable: false, suppressSorting: true, minWidth: 120, cellRenderer: 'internalTeamDropdownRenderer' },
    { headerName: 'Contractor', field: FIELDS.CONTR, sortable: true, minWidth: 195, cellRenderer: 'openTaskRenderer' },
    { headerName: 'Job #', field: FIELDS.JOB, sortable: true, minWidth: 80 },
    { headerName: 'Project', field: FIELDS.PROJECT, editable: true, sortable: true, minWidth: 200 },
    { headerName: 'Scope', field: FIELDS.SCOPE, sortable: true, minWidth: 75 },
    { headerName: 'Scope Note', field: FIELDS.SCOPE_NOTE, editable: true, suppressSorting: true, minWidth: 130 },
    { headerName: 'City', field: FIELDS.CITY, editable: true, sortable: true, minWidth: 130 },
    { headerName: 'State', field: FIELDS.STATE, cellRenderer: 'stateRenderer', sortable: true, minWidth: 100 },
    { headerName: 'Status', field: FIELDS.STATUS, editable: false, sortable: true, minWidth: 130, cellRenderer: 'statusRenderer' },
    {
        headerName: 'Completed Date', field: FIELDS.DUE_DATE, editable: false, sortable: true, minWidth: 100, cellRenderer: 'dueDateRenderer', type: 'completed', filter: 'agDateColumnFilter',
        comparator: (filterDate, cellValue, node1, node2, isInverted) => {
            return sortDates(filterDate, cellValue, isInverted);
        }, sort: 'desc'
    },
    { headerName: 'Cost', field: FIELDS.COST, editable: true, sortable: true, minWidth: 90, cellRenderer: 'costRenderer' },
    { headerName: 'E Hrs', field: FIELDS.ENG_HRS, minWidth: 50 },
    { headerName: 'D Hrs', field: FIELDS.DRF_HRS, minWidth: 50 },
    { headerName: 'CSA', field: FIELDS.CSA, suppressSorting: true, minWidth: 45 },
    { headerName: 'PO', field: FIELDS.PO, suppressSorting: true, minWidth: 40 },
    { headerName: 'INV', field: FIELDS.INV, suppressSorting: true, minWidth: 45 },
    { headerName: 'Calc', field: FIELDS.CALC, suppressSorting: true, minWidth: 45 }
];

export const designTableHeader = [
    { headerName: 'User', field: FIELDS.USER, editable: false, suppressSorting: true, cellRenderer: 'internalTeamDropdownRenderer', minWidth: 60 },
    { headerName: 'Company Role', field: FIELDS.COMPANY_ROLE, editable: false, suppressSorting: true, minWidth: 60 },
    { headerName: 'Project Role', field: FIELDS.PROJECT_ROLE, editable: false, suppressSorting: true, minWidth: 60 },
    { headerName: 'Scope', field: FIELDS.SCOPE, sortable: true, minWidth: 60 },
    { headerName: 'Scope Note', field: FIELDS.SCOPE_NOTE, editable: false, suppressSorting: true, minWidth: 60 },
    { headerName: 'Status', field: FIELDS.STATUS, editable: false, sortable: true, cellRenderer: 'statusRenderer', minWidth: 100 },
    { headerName: 'Urgent', field: FIELDS.U_HRS, editable: true, minWidth: 40 },
    { headerName: 'Non-Urgent', field: FIELDS.NU_HRS, editable: true, minWidth: 40 }
];

export const sentInvoiceHeader = [
    { headerName: 'Team', field: FIELDS.INV_TEAM, editable: false, suppressSorting: true, cellStyle: { textAlign: 'center' }, minWidth: 80, cellRenderer: 'invoiceTeamRenderer' },
    { headerName: 'Contractor', field: FIELDS.CONTR, editable: false, cellStyle: { textAlign: 'center' }, minWidth: 215 },
    { headerName: 'Invoice #', field: FIELDS.INV_NUMBER, editable: false, cellStyle: { textAlign: 'center' }, minWidth: 120, cellRenderer: 'openTaskRenderer' },
    { headerName: 'Project', field: FIELDS.PROJECT, suppressSorting: true, minWidth: 215, cellStyle: { textAlign: 'center' } },
    { headerName: 'City', field: FIELDS.CITY, editable: false, suppressSorting: true, cellStyle: { textAlign: 'center' }, minWidth: 130 },
    { headerName: 'State', field: FIELDS.STATE, suppressSorting: true, editable: false, cellStyle: { textAlign: 'center' }, minWidth: 60 },
    { headerName: 'To Accounting', field: FIELDS.INV_TO_ACCOUNTING, suppressSorting: true, editable: false, minWidth: 125, cellStyle: { textAlign: 'center' } },
    { headerName: 'Hold', field: FIELDS.INV_HOLD, editable: true, suppressSorting: true, minWidth: 20, cellStyle: { textAlign: 'center' }, cellRenderer: 'sentOptionRenderer' },
    { headerName: 'Sent', field: FIELDS.INV_SENT, editable: true, suppressSorting: true, minWidth: 20, cellStyle: { textAlign: 'center' }, cellRenderer: 'sentOptionRenderer' },
    {
        headerName: 'Date Sent', field: FIELDS.INV_SENT_DATE, editable: false, minWidth: 100, cellStyle: { textAlign: 'center' },
        comparator: (filterDate, cellValue, node1, node2, isInverted) => {
            return sortDates(filterDate, cellValue, isInverted);
        }
    },
    { headerName: 'Paid', field: FIELDS.INV_PAID, editable: true, suppressSorting: true, minWidth: 20, cellStyle: { textAlign: 'center' }, cellRenderer: 'sentOptionRenderer' },
    {
        headerName: 'Date Paid', field: FIELDS.INV_PAID_DATE, editable: false, minWidth: 100, cellStyle: { textAlign: 'center' },
        comparator: (filterDate, cellValue, node1, node2, isInverted) => {
            return sortDates(filterDate, cellValue, isInverted);
        }
    },
    { headerName: 'Aging', field: FIELDS.INV_AGING, editable: false, minWidth: 60, cellStyle: { textAlign: 'center' } },
    { headerName: 'Cost', field: FIELDS.COST, editable: true, minWidth: 60, cellStyle: { textAlign: 'center' }, cellRenderer: 'costRenderer' },
    { headerName: 'Delete', field: FIELDS.NU_HRS, editable: false, suppressSorting: true, minWidth: 65, cellStyle: { textAlign: 'center' }, cellRenderer: 'deleteIconRenderer' }
];

export const documentTableHeader = [
    { headerName: 'Item', field: 'name', suppressSorting: true, minWidth: 60, cellRenderer: 'openModalRenderer' },
    { headerName: 'Date', field: 'date', suppressSorting: true, minWidth: 60 },
    { headerName: 'Download', field: FIELDS.sourceData, suppressSorting: true, minWidth: 60, cellRenderer: 'downloadRender' },
    { headerName: 'Delete', field: FIELDS.sourceData, suppressSorting: true, minWidth: 60, cellRenderer: 'deleteRender' }
];

export const hourTrackerTableHeader = [
    {
        headerName: 'User', field: 'user', editable: false, cellRenderer: 'userImageRender', minWidth: 45,
        comparator: (filterDate, cellValue, node1, node2, isInverted) => {
            return employeeSortComparator(filterDate, cellValue,isInverted);
        }
    },
    { headerName: 'Scope', field: 'scopeTitle', editable: false, cellRenderer: 'scopeDropdownRender', minWidth: 70 },
    {
        headerName: 'Hour', field: 'hoursSpent', cellRenderer: 'hourInputRender', editable: false, minWidth: 50, suppressSorting: true,
        suppressKeyboardEvent: (params) => {
            const KEY_LEFT = 37;
            const KEY_RIGHT = 39;
            return params.event.keyCode === KEY_LEFT || params.event.keyCode === KEY_RIGHT;
        }
    },
    { headerName: 'Date', field: 'date', cellRenderer: 'dateRender', editable: false, minWidth: 60 },
    {
        headerName: 'Note', field: 'note', editable: true, suppressSorting: true, minWidth: 65,
        valueFormatter: (params) => params.value === '' ? '---' : params.value
    },
    { headerName: 'Delete', field: 'archived', editable: false, cellRenderer: 'archiveIconRender', suppressSorting: true, minWidth: 40 }
];

export const dailyPopUpHeader = [
    { headerName: 'Job Number', field: 'jobNumber', editable: false, minWidth: 45, suppressSorting: true },
    { headerName: 'Project', field: 'project', minWidth: 45, suppressSorting: true },
    { headerName: 'Customer', field: 'customer', cellStyle: { textAlign: 'center' }, minWidth: 45, suppressSorting: true },
    { headerName: 'Scope', field: 'scope', minWidth: 45, suppressSorting: true },
    { headerName: 'Note', field: 'note', minWidth: 45, suppressSorting: true },
    {
        headerName: 'Notes', field: 'notes', editable: true, minWidth: 45, suppressSorting: true,
        valueFormatter: (params) => params.value === '' ? '---' : params.value
    },
    { headerName: 'Hours', field: 'hoursSpent', cellRenderer: 'hourInputRender', minWidth: 45, suppressSorting: true },
    { headerName: 'Delete', field: 'id', editable: false, minWidth: 65, cellStyle: { textAlign: 'center' }, cellRenderer: 'deleteIconRender' }
];

export const dailyPopUpHeaderDisabled = [
    { headerName: 'Job Number', field: 'jobNumber', editable: false, minWidth: 45, suppressSorting: true },
    { headerName: 'Project', field: 'project', minWidth: 45, suppressSorting: true },
    { headerName: 'Customer', field: 'customer', cellStyle: { textAlign: 'center' }, minWidth: 45, suppressSorting: true },
    { headerName: 'Scope', field: 'scope', minWidth: 45, suppressSorting: true },
    { headerName: 'Note', field: 'note', minWidth: 45, suppressSorting: true },
    {
        headerName: 'Notes', field: 'notes', editable: false, minWidth: 45, suppressSorting: true,
        valueFormatter: (params) => params.value === '' ? '---' : params.value
    },
    { headerName: 'Hours', field: 'hoursSpent', cellRenderer: 'hourInputRender', minWidth: 45, suppressSorting: true },
    { headerName: 'Delete', field: 'id', editable: false, minWidth: 65, cellStyle: { textAlign: 'center' }, cellRenderer: 'deleteIconRender' }
];

export const timesheetTableHeaders = [
    { headerName: 'Employee', field: 'user', suppressSorting: true, editable: false, cellRenderer: 'userImageRender', minWidth: 45 },
    {
        headerName: 'Date', field: 'date', cellRenderer: 'dateRender', editable: true, sortable: true, minWidth: 70, filter: 'agDateColumnFilter',
        comparator: (filterDate, cellValue, node1, node2, isInverted) => {
            return sortDates(filterDate, cellValue, isInverted);
        },
        sort: 'desc'
    },
    { headerName: 'Project', field: FIELDS.PROJECT, sortable: true, minWidth: 120, cellStyle: { textAlign: 'center' } },
    { headerName: 'Job Number', field: FIELDS.JOB, sortable: true, minWidth: 95 },
    { headerName: 'Scope', field: 'scope', sortable: true, minWidth: 70 },
    { headerName: 'Scope Note', suppressSorting: true, field: FIELDS.SCOPE_NOTE, minWidth: 110 },
    { headerName: 'Contractor', field: FIELDS.CONTR, sortable: true, minWidth: 140 },
    {
        headerName: 'Hours', field: 'hoursSpent', cellRenderer: 'hourInputRender', editable: false, sortable: true, minWidth: 50,
        suppressKeyboardEvent: (params) => {
            const KEY_LEFT = 37;
            const KEY_RIGHT = 39;
            return params.event.keyCode === KEY_LEFT || params.event.keyCode === KEY_RIGHT;
        }
    },
    { headerName: 'Other', field: 'other', suppressSorting: true, minWidth: 60 },
    {
        headerName: 'Notes', field: 'note', suppressSorting: true, editable: true, minWidth: 65,
        valueFormatter: (params) => params.value === '' ? '---' : params.value
    },
    { headerName: 'Delete', field: 'archived', suppressSorting: true, cellRenderer: 'archiveIconRender', minWidth: 40 }
];

export const managerEngineerWeeklyHeader = [
    { headerName: 'Day', field: 'dayField', editable: false, minWidth: 45, suppressSorting: true },
    { headerName: 'Date', field: 'dateField', editable: false, minWidth: 45, suppressSorting: true },
    { headerName: 'Hours', field: 'hoursSpent', editable: false, minWidth: 45, suppressSorting: true },
    { headerName: 'PTO', field: 'pto', editable: false, minWidth: 45, suppressSorting: true },
    { headerName: 'Total', field: 'total', editable: false, minWidth: 45, suppressSorting: true },
    { headerName: 'View/Edit Details', field: 'date', editable: false, minWidth: 45, suppressSorting: true, cellRenderer: 'viewEditIconRender' }
];

export const drafterAdminWeeklyHeader = [
    { headerName: 'Day', field: 'dayField', editable: false, minWidth: 45, suppressSorting: true, cellRenderer: 'displayDayRender', cellStyle: { textAlign: 'center' } },
    { headerName: 'In(AM)', field: 'timeIn', editable: false, minWidth: 45, suppressSorting: true, cellRenderer: 'timePickerRender', cellStyle: { textAlign: 'center' } },
    { headerName: 'Lunch(In)', field: 'lunchIn', editable: false, minWidth: 45, suppressSorting: true, cellRenderer: 'timePickerRender', cellStyle: { textAlign: 'center' } },
    { headerName: 'Lunch(Out)', field: 'lunchOut', editable: false, minWidth: 45, suppressSorting: true, cellRenderer: 'timePickerRender', cellStyle: { textAlign: 'center' } },
    { headerName: 'Out(PM)', field: 'timeOut', editable: false, minWidth: 45, suppressSorting: true, cellRenderer: 'timePickerRender', cellStyle: { textAlign: 'center' } },
    { headerName: 'Regular', field: 'regular', editable: false, minWidth: 45, suppressSorting: true, cellStyle: { textAlign: 'center' } },
    { headerName: 'Overtime', field: 'ot', editable: false, minWidth: 45, suppressSorting: true, cellStyle: { textAlign: 'center' } },
    { headerName: 'PTO', field: 'pto', editable: false, minWidth: 45, suppressSorting: true, cellStyle: { textAlign: 'center' } },
    { headerName: 'Total', field: 'total', editable: false, minWidth: 45, suppressSorting: true, cellStyle: { textAlign: 'center' } },
    { headerName: 'View/Edit Details', field: 'date', editable: false, minWidth: 45, suppressSorting: true, cellRenderer: 'viewEditIconRender', cellStyle: { textAlign: 'center' } }
];

export const referenceGridHeader = [
    { headerName: 'Ref. Scope', field: FIELDS.REFERENCE_SCOPE, minWidth: 80 },
    { headerName: 'Contractor', field: FIELDS.CONTR, minWidth: 125 },
    { headerName: 'Job #', field: FIELDS.JOB_WITH_SCOPE_NUMBER, minWidth: 95 },
    { headerName: 'Project', field: FIELDS.PROJECT, minWidth: 200, cellRenderer: 'openTaskRenderer' },
    { headerName: 'Scope Note', field: FIELDS.SCOPE_NOTE, minWidth: 100 }
];

function isEditable(params) {
    const taskGroupId = Constant.TASK_GROUP__ID.TASKS;
    const bidGroupId = Constant.TASK_GROUP__ID.BIDS;
    const isStatusComplete = params.data[FIELDS.STATUS] == [Constant.STATUS_OPTIONS_SEMANTIC[3].value];
    if (params.data.group && [taskGroupId, bidGroupId].includes(params.data.group._id)) {
        return !isStatusComplete;
    }
    return true;
}

