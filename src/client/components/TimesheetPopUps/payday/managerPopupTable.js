import React from 'react';
import { PLPDataGrid } from '../../reusableComponents/PLPDataGrid'
import { managerEngineerWeeklyHeader } from '../../../utils/constants/ScopeTableHeaders';
import { Row, Icon, Col } from 'antd';
import PLPPureComponent from '../../../baseComponents/PLPPureComponent';
import '../style.scss';
import moment from 'moment'
import '../../reusableComponents/scopeTableNew/scopeTableNew.scss';
import { formatDate } from '../../../utils/common';

class ManagerPopupTable extends PLPPureComponent {

    isFullWidth = (params) => params.data.isWeeklyRecord

    renderWeeklyTotal = (params) => params.data.isWeeklyRecord && params.data.payDayTotal
        && <Row className="total-row">
            <Col className="total-row-font" span={4}>Payday-{formatDate(this.props.payDate)}</Col>
            <Col className="total-row-font" span={2} offset={2}>Totals</Col>
            <Col className="total-row-font" span={2} offset={1}>{params.data.totalHoursSpent}</Col>
            <Col className="total-row-font" span={2} offset={2}>{params.data.totalPTO}</Col>
            <Col className="total-row-font" span={2} offset={2}>{params.data.total}</Col>
        </Row>
        || <Row className="total-row">
            <Col className="total-row-font" span={7}>Week Total:</Col>
            <Col className="total-row-font" span={2} offset={2} >{params.data.weeklyHour}</Col>
            <Col className="total-row-font" span={2} offset={2} >{params.data.weeklyPto}</Col>
            <Col className="total-row-font" span={2} offset={2} >{params.data.weeklyTotal}</Col>
        </Row>


    viewEditIconRender = (params) => <ViewEditComponent data={params.data} onDetailPress={this.props.onDetailPress} />

    render() {
        return (
            <div className="scope-table-container" >
                <div className="ag-theme-balham custom-grid-layout">
                    <PLPDataGrid
                        showLoader={this.props.showLoader}
                        gridOptions={{
                            rowClassRules: {
                                'timesheet-highlight-red': params => params.data.total >= 24,
                            }
                        }}
                        isFullWidthCell={this.isFullWidth}
                        fullWidthCellRenderer="fullWidthCellRenderer"
                        columnDefs={managerEngineerWeeklyHeader}
                        rowData={this.props.hourTrackers}
                        frameworkComponents={{
                            viewEditIconRender: this.viewEditIconRender,
                            fullWidthCellRenderer: this.renderWeeklyTotal
                        }}
                        domLayout='autoHeight'
                    />
                </div>
            </div>
        );
    }
}

export class ViewEditComponent extends PLPPureComponent {
    handleClick = () => {
        this.props.onDetailPress(this.props.data)
    }

    render = () => <Row className="view-edit-container" gutter={2} onClick={this.handleClick}>
        <label className="cursor-pointer"> View/ Edit Details  </label>
        <Icon className="cursor-pointer" type="edit" />
    </Row>
}

export default ManagerPopupTable;