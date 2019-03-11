import '../style.scss';

import { Col, Row } from 'antd';
import moment from 'moment';
import React from 'react';

import { PLPPureComponent } from '../../../baseComponents/importer';
import { TimePickerGrid } from '../../../baseComponents/TimePickerGrid';
import { drafterAdminWeeklyHeader } from '../../../utils/constants/ScopeTableHeaders';
import { PLPDataGrid } from '../../reusableComponents/PLPDataGrid';
import { getSpentTime } from '../util';
import { ViewEditComponent } from './managerPopupTable';

class DrafterAdminPayDayTable extends PLPPureComponent {

    isFullWidth = (params) => params.data.payDayTotal

    renderWeeklyTotal = (params) => params.data.payDayTotal && <Row className="total-row">
        <Col className="total-row-font" style={{ width: '50.50%' }} span={12} offset={0}>Totals</Col>
        <Col className="total-row-font" style={{ width: '10%' }} span={3} offset={0}>{params.data.totalRegular}</Col>
        <Col className="total-row-font" style={{ width: '10%' }} span={2} offset={0}>{params.data.totalOT}</Col>
        <Col className="total-row-font" style={{ width: '10%' }} span={2} offset={0}>{params.data.totalPTO}</Col>
        <Col className="total-row-font" style={{ width: '10%' }} span={3} offset={0}>{params.data.total}</Col>
    </Row>


    viewEditIconRender = (params) => <ViewEditComponent data={params.data} onDetailPress={this.props.onDetailPress} />

    displayDayRender = (params) => {
        return <Row>
            <Col className="float-left" span={15}>
                {params.data.dateField}
            </Col>
            <Col className="float-right" span={9}>
                {params.data.dayField}
            </Col>
        </Row >
    }

    timePickerRender = (params) => {
        let defaultValue = moment(params.value).isValid() ? moment(params.value) : ''
        let disabledTimer = params.data.total === 0;
        // if (params.data.total === 0 || params.data.total - params.data.pto === 0) {
        //     disabledTimer = true
        //     defaultValue = ''
        // }
        // if (['lunchIn', 'lunchOut'].includes(params.colDef.field)) {
        //     if (params.data.regular <= 6) {
        //         disabledTimer = true
        //         defaultValue = ''
        //     }
        // }
        // lunchIn: item.regular >= 6 && item.lunchIn || null,
        // lunchOut: item.regular >= 6 && item.lunchOut || null,
        
        if (params.data.regular < 6 && ['lunchIn', 'lunchOut'].includes(params.colDef.field)) {
            disabledTimer = true
            defaultValue = ''
        }

        if (params.data.regular === 0) {
            disabledTimer = true
            defaultValue = ''
        }       

        if (this.props.disableForm) {
            return <TimePickerGrid
                disabled={true}
                format={"h:mm a"}
                data={params.data}
                placeholder="-"
                use12Hours
                data={params}
                onChange={this.props.onTimeChange}
                defaultValue={defaultValue} />
        }
        return <TimePickerGrid
            disabled={this.props.disableForm || disabledTimer}
            format={"h:mm a"}
            data={params.data}
            placeholder="-"
            use12Hours
            data={params}
            onChange={this.props.onTimeChange}
            defaultValue={defaultValue} />
    }

    render() {
        return (
            <div className="scope-table-container" >
                <div className="ag-theme-balham custom-grid-layout">
                    <PLPDataGrid
                        showLoader={this.props.showLoader}
                        gridOptions={{
                            rowClassRules: {
                                'timesheet-highlight-default': params => getSpentTime(params.data) === 'default',
                                'timesheet-highlight-red': params => getSpentTime(params.data) === 'red',
                                'timesheet-highlight-yellow': params => getSpentTime(params.data) === 'yellow',
                            }
                        }}
                        domLayout='autoHeight'
                        isFullWidthCell={this.isFullWidth}
                        fullWidthCellRenderer="fullWidthCellRenderer"
                        columnDefs={drafterAdminWeeklyHeader}
                        rowData={this.props.tableData}
                        frameworkComponents={{
                            viewEditIconRender: this.viewEditIconRender,
                            displayDayRender: this.displayDayRender,
                            fullWidthCellRenderer: this.renderWeeklyTotal,
                            timePickerRender: this.timePickerRender,
                        }}
                    />
                </div>
            </div>
        );
    }
}

export default DrafterAdminPayDayTable;