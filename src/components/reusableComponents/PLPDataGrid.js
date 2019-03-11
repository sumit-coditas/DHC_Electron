import React from 'react';
import PLPPureComponent from '../../baseComponents/PLPPureComponent';
import { AgGridReact } from 'ag-grid-react';
import '../reusableComponents/scopeTableNew/scopeTableNew.scss';
// import 'antd/dist/antd.css';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import { UtilModel } from '../../model/AppModels/UtilModel';
import { connect } from 'react-redux';

export class PLPDataGridTable extends PLPPureComponent {
    constructor(props) {
        super(props)
        this.params = null
    }

    handleLoader = (api, showTableLoader) => {
        if (showTableLoader) {
            api.showLoadingOverlay();
        } else {
            api.hideOverlay();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.params && nextProps.showLoader !== this.props.showLoader) {
            this.handleLoader(this.api, nextProps.showLoader)
        }
    }

    onGridReady = (params) => {
        this.params = params;
        this.api = params.api;
        this.handleLoader(params.api, this.props.showLoader)
        this.columnApi = params.columnApi;
        params.api.sizeColumnsToFit();
        this.props.onGridReady && this.props.onGridReady(params);
    };

    onFirstDataRendered = (params) => {
        params.api.sizeColumnsToFit();
    };

    onGridSizeChanged = (params) => {
        this.props.onGridSizeChanged && this.props.onGridSizeChanged(params)
    }

    render = () => {
        const { onGridReady, ...props } = this.props;
        return <AgGridReact
            id='plp-grid'
            rowHeight={38}
            headerHeight={43}
            enableCellChangeFlash
            refreshCells
            minHeight={300}
            animateRows
            rowDragManaged
            suppressHorizontalScroll={false}
            enableSorting
            overlayLoadingTemplate={`<div style="margin-top: 50px" class="ant-spin ant-spin-spinning"><i class="anticon anticon-loading ant-spin-dot" style="font-size: 24px;"><svg viewBox="0 0 1024 1024" class="anticon-spin" data-icon="loading" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 0 0-94.3-139.9 437.71 437.71 0 0 0-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path></svg></i></div>`}
            onFirstDataRendered={this.onFirstDataRendered}
            colResizeDefault
            suppressDragLeaveHidesColumns
            onGridReady={this.onGridReady}
            onGridSizeChanged={this.onGridSizeChanged}
            {...props}
        />
    };
}

export const PLPDataGrid = PLPDataGridTable;