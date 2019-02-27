import React, { PropTypes } from 'react';
import { Input, Button, DatePicker } from 'antd';
import moment from 'moment';

import './styles/scopeTableFilter.scss';

export const ScopeTableFilter = (props) => {
    const { data, handleDateChange, handleChange, applyFilter, clearFilter } = props;
    const { state, city, jobNumber, dateRange } = data;
    return (<div className='filter-container page-wrapper'>

        <span className='ant-input-group-wrapper custom-range-picker'>
            <span className='ant-input-wrapper ant-input-group'>
                <span className='ant-input-group-addon'>
                    Due Date
                </span>
                <DatePicker.RangePicker
                    id='dateRange'
                    onChange={handleDateChange}
                    format='M-D-YYYY'
                    value={!dateRange[0] ? dateRange : [moment(dateRange[0], 'M-D-YYYY'), moment(dateRange[1], 'M-D-YYYY')]}

                />
            </span>
        </span>

        <Input
            style={{ width: '350px' }}
            addonBefore='Job Number'
            placeholder='Enter job number'
            value={jobNumber}
            id='jobNumber'
            onChange={handleChange}
        />

        <Input
            addonBefore='City'
            placeholder='Enter city'
            value={city}
            id='city'
            onChange={handleChange}
        />

        <Input
            addonBefore='State'
            placeholder='Enter state'
            value={state}
            id='state'
            onChange={handleChange}
        />

        <Button
            onClick={applyFilter}
        >
            Apply Filter
        </Button>

        <Button
            onClick={clearFilter}
        >
            Clear Filter
        </Button>
    </div>);
};

ScopeTableFilter.propTypes = {
    data: PropTypes.object.isRequired,
    handleDateChange: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    applyFilter: PropTypes.func.isRequired,
    clearFilter: PropTypes.func.isRequired
};
