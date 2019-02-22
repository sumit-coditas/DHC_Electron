import { Col, Row } from 'antd';
import React from 'react';

import { AddIcon } from '../../../../baseComponents/button';
import { PLPPureComponent } from '../../../../baseComponents/importer';
import { HourTrackerTable } from '../../../hourTracker/hourTrackerTable';
import DesignStatusNew from '../../../taskGroupWrapper/DesignStatusNew';
import { DocumentTable } from '../../../taskGroupWrapper/document/DocumentTable';
import { ProjectReferenceGrid } from '../../../taskGroupWrapper/ProjectRefrenceGrid';

export class FooterSection extends PLPPureComponent {

    renderDesignTable = () => <DesignStatusNew updatedScope={this.props.updateScope} />;

    renderHourTracker = () => <HourTrackerTable />;

    renderDocumentTable = () => <DocumentTable
        showPurchaseOrderDetail={this.props.showPurchaseOrderDetail}
        handleDocumentClick={this.props.handleDocumentClick}
        onArchive={this.props.handleArchive}
        onModalClick={this.props.handleSelectTemplateDropdown}
    />;

    renderReferenceGrid = () => <ProjectReferenceGrid />

    addMilestone = () => {
        this.props.handleSelectTemplateDropdown('invoice', 'showCreateMilestone', 'document-table');
    };

    render() {
        return (
            <Row className='table-section custom-grid-layout'>
                {/*<Col span={10} >*/}
                {/*<TableTitle title='Design Allocation' >*/}
                {/*{this.props.taskNumber}*/}
                {/*</TableTitle>*/}
                {/*{this.renderDesignTable()}*/}
                {/*</Col>*/}
                <Col span={8} >
                    <TableTitle title='Hour Tracker' >
                        <AddIcon onClick={this.props.onAddHourClick} />
                    </TableTitle>
                    {this.renderHourTracker()}
                </Col>
                {!this.props.isTask &&
                    <Col span={8}>
                        <TableTitle title='PO/CSA/Invoice'>
                            <AddIcon onClick={this.addMilestone} />
                        </TableTitle>
                        {this.renderDocumentTable()}
                    </Col>
                }
                {!this.props.isTask &&
                    <Col span={8} >
                        <TableTitle title='Reference Grid' >
                            {/* <AddIcon onClick={this.props.onAddHourClick} /> */}
                        </TableTitle>
                        {this.renderReferenceGrid()}
                    </Col>
                }
            </Row>
        );
    }
}
class TableTitle extends PLPPureComponent {
    render = () => <div style={{ marginBottom: 20 }}>
        <div className='modal-section-wrapper modal-section-title'>
            <span className='fa'></span>
            <span className='modal-name-field'>{this.props.title}</span>
        </div>
        <div className="add-new-tag">
            {this.props.children}
        </div>
    </div>
}
