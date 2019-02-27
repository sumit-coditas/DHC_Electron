import React, { Component } from 'react';
import { Icon, Button } from 'semantic-ui-react';
import debounce from 'lodash/debounce';

import Dropdown from '../../../baseComponents/Dropdown.js'
import Timestamp from '../../../baseComponents/Timestamp.js'

import ReportTable from '../Component/ReportTable.js'

import LoginStore from '../../../stores/LoginStore.js';
import ReportStore from '../../../stores/ReportStore.js';
import AppStore from '../../../stores/AppStore.js';

import ReportAction from '../../../actions/ReportAction.js';

import { changeSubmitButtonStyle } from '../../../utils/changeBackgroundOfSubmit';

import { options, ReportTableHeader, DollarReportTableHeader, monthArray, perDollarHourArray } from '../Constants'
import PLPPureComponent from '../../../baseComponents/PLPPureComponent.js';

class ReportTableContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            ReportStore: ReportStore.getState(),
            AppStore: AppStore.getState(),
            reportTypes: props.reportTypes || this.getReportOptions(),
            filterChanged: false,
            loadedReportType: ''
        };
    }

    componentWillMount() {
        ReportStore.listen(this.onChange);
        AppStore.listen(this.onChange);
        const userID = LoginStore.getState().user._id;
        const role = LoginStore.getState().user.role.name;
        ReportAction.setFilter({
            userID,
            year: 2019,
            reportType: this.state.reportTypes[0].value || '',
            role,
            empID: ''
        });
    }

    componentDidMount() {
        this.refreshList();
    }

    componentWillUnmount() {
        ReportAction.cancelReportRequest();
        ReportStore.unlisten(this.onChange);
        AppStore.unlisten(this.onChange);
        const filter = {};
        filter.reportType = '';
        ReportAction.setFilter(filter);
    }

    onChange = (state) => {
        const obj = {};
        obj[state.displayName] = state;
        this.setState(obj);
    };

    getReportOptions = () => {
        const { role, roleLevel } = LoginStore.getState().user;
        const type = [...options.reportType];
        if (roleLevel && roleLevel.name === 'President') {
            return type.map(item => { return { key: item.key, value: item.value, text: item.text } });
        }

        if (role && role.name === 'Manager') {
            return type.filter(item => item.roles.indexOf('manager') > -1)
                .map(item => { return { key: item.key, value: item.value, text: item.text } });
        }
    };

    getData = () => {
        let data = [];
        data.push(...this.state.ReportStore.reportData);
        if (data.length > 0) {
            data.push(this.getTotalRow(data))
        }
        return data;
    };

    getTotalRow(data) {
        const total = { userName: 'Total', data: {} };
        if (this.state.loadedReportType.match(/^(dollar_per_hour)$/)) {
            perDollarHourArray.forEach(type => {
                const amount = data.map(item => item.data.price || 0)
                    .reduce((sum, item) => sum + item);
                const hours = data.map(item => item.data[type.hourField] || 0)
                    .reduce((sum, item) => sum + item);
                total.data[type.title] = amount === 0 ? 0 : Math.round(amount / hours);
            });
        } else {
            monthArray.forEach(month => {
                const amount = data.map(item => item.data[month] || 0)
                    .reduce((sum, item) => sum + item);
                total.data[month] = this.state.loadedReportType.match(/^(total_billing_dollars)$/) ? Math.round(amount) : Number(amount.toFixed(2));
            });
        }
        return total;
    }

    handleReportTypeChange = (e, { value }) => {
        if (this.state.ReportStore.filters.reportType !== value) {
            this.setFilterAndFetchReport('reportType', value);
        }
    };

    handleYearChange = (e, { value }) => {
        if (this.state.ReportStore.filters.year !== value) {
            this.setFilterAndFetchReport('year', value);
        }
    };

    handleLineOfWorkChange = (e, { value }) => {
        if (this.state.ReportStore.filters.lineOfWork !== value) {
            this.setFilterAndFetchReport('lineOfWork', value);
        }
    };

    handleCustomerChange = (e, { value }) => {
        if (this.state.ReportStore.filters.customer !== value) {
            this.setFilterAndFetchReport('customer', value);
        }
    };

    setFilterAndFetchReport(key, value) {
        const filter = {};
        filter[key] = value;
        ReportAction.setFilter(filter);
        this.setState({ filterChanged: true });
        if (this.props.reportTypes) {
            ReportAction.cancelReportRequest();
            this.refreshList();
        }
    }

    refreshList = () => {
        ReportAction.getReport(this.state.ReportStore.filters);
        this.setState({
            filterChanged: false,
            loadedReportType: this.state.ReportStore.filters.reportType
        });
    };

    getYearArray = () => {
        let startYear = 2017;
        const currentYear = new Date().getFullYear();
        const years = [];

        while (startYear <= currentYear + 1) {
            years.push({ key: startYear, value: startYear, text: startYear });
            startYear = startYear + 1;
        }

        return years;
    };

    getLineOfWork = () => {
        const options = [{ key: 'All', value: 'All', text: 'All' }];
        options.push(...this.state.AppStore.itemTypes
            .map(item => {
                return {
                    key: item._id,
                    value: item._id,
                    text: item.name
                }
            })
        );
        return options;
    };

    getCustomers = debounce((e, value) => {
        if (value === '') {
            ReportAction.setDefaultCustomerList();
            return;
        }
        ReportAction.getCustomers(value);
    }, 500);

    processReport = () => {
        ReportAction.cancelReportRequest();
        this.refreshList();
    };

    getTable = () => <ReportTable
        styleClass={this.state.loadedReportType.indexOf('dollar_per') > -1 ? 'report-table' : 'report-table limit-width'}
        header={this.state.loadedReportType.indexOf('dollar_per') > -1 ? DollarReportTableHeader : ReportTableHeader}
        data={this.getData()}
        isLoading={this.state.ReportStore.isLoading}
        error={this.state.ReportStore.error.msg}
        title={this.state.ReportStore.filters.reportType === 'productivity_report' ? 'Role' : 'Name'}
        perDollar={this.state.loadedReportType.indexOf('dollar_per') > -1}
        type={this.state.loadedReportType.indexOf('dollar') > -1 ? '$ ' : ''}
    />;

    render() {
        const {
            filters,
            lastUpdated,
            fetchingCustomerList,
            isLoading,
            customers
        } = this.state.ReportStore;
        return (
            <div className={"view-report-container" + " " + (window.location.pathname === '/reports' ? 'main-page_wrapper' : '')}>
                <div className={"header" + " " + (window.location.pathname === '/reports' ? 'page-wrapper' : '')}>
                    <div className="filter">
                        <Dropdown
                            options={this.state.reportTypes}
                            placeholder="Report Type"
                            handleChange={this.handleReportTypeChange}
                            value={filters.reportType}
                            label="Report Type"
                        />

                        <Dropdown
                            options={this.getYearArray()}
                            placeholder="Years"
                            handleChange={this.handleYearChange}
                            value={filters.year}
                            label="Year"
                        />

                        {!filters.reportType.match(/^(productivity_report|total_and_pto_report|dollar_per_total_and_pto_report|pto_report|total_hours_report)$/) &&
                            <Dropdown
                                options={this.getLineOfWork()}
                                placeholder="Line Of Work"
                                handleChange={this.handleLineOfWorkChange}
                                value={filters.lineOfWork}
                                label="Line Of Work"
                            />
                        }
                        {!filters.reportType.match(/^(productivity_report|total_and_pto_report|dollar_per_total_and_pto_report|pto_report|total_hours_report)$/) &&
                            <Dropdown
                                options={customers}
                                placeholder="Customer"
                                handleChange={this.handleCustomerChange}
                                value={filters.customer}
                                search
                                loading={fetchingCustomerList}
                                onSearchChange={this.getCustomers}
                                label="Customer"
                            />
                        }
                    </div>
                    <div className="timestamp">
                        {
                            !this.props.reportTypes &&
                            <Button
                                primary
                                disabled={!this.state.filterChanged}
                                onClick={this.processReport}
                                style={changeSubmitButtonStyle(isLoading)}
                            >
                                Process Report
                            </Button>
                        }
                        <span
                            onClick={() => this.refreshList()}>
                            <Icon
                                name="refresh"
                                loading={isLoading}
                                style={{ cursor: 'pointer' }}
                                disabled={isLoading}
                            />
                        </span>

                        <Timestamp date={lastUpdated} />

                    </div>
                    {/* <div className='report-title'>
                        Productivity Report
                    </div> */}
                </div>

                {this.getTable()}

            </div>
        );
    }
}

export default ReportTableContainer;
