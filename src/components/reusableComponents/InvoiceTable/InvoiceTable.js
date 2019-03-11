import '../scopeTableNew/scopeTableNew.scss';
import './InvoiceTable.scss';

import { Button, Icon } from 'antd';
import React, { Component } from 'react';

import PLPPureComponent from '../../../baseComponents/PLPPureComponent';
import { Select } from '../../../baseComponents/Select';
import { InvoiceModel } from '../../../model/InvoiceModel/InvoiceModel.js';
import { FIELDS } from '../../../utils/constants/ScopeTableFields';
import { showFaliureNotification, showSuccessNotification, showWarningNotification } from '../../../utils/notifications.js';
import { updateInvoice } from '../../../utils/promises/invoicePromises';
import { PLPDataGrid } from '../PLPDataGrid';
import CostRenderer from './cellRenderer/CostRenderer';
import InvoiceTeam from './cellRenderer/InvoiceTeam';
import SentOptionRenderer from './cellRenderer/sentOptionRenderer';
import { SENT_PAID_OPTIONS } from './Constants.js';

export default class InvoiceTable extends PLPPureComponent {

  componentWillUnmount() {
    InvoiceModel.deleteAll();
  }

  handleChange = ({ newValue, data }) => {
    const { id, taskID } = data;
    if (parseFloat(newValue) >= 0 && !isNaN(newValue)) {
      const payload = {
        invoice: {
          id,
          totalCost: newValue
        },
        taskId: taskID
      }
      this.updateInvoice(payload, 'total cost');
      return;
    }
    showWarningNotification('Total cost should be non negative integer.');
    this.resetInvoice(id);
  };

  updateInvoice = (payload, field) => {
    updateInvoice(payload).then(data => {
      let existingInvoice = InvoiceModel.getInvoiceId(data.id);
      existingInvoice.props = { ...existingInvoice.props, ...data };
      new InvoiceModel(existingInvoice.props).$save(),
        showSuccessNotification(`Invoice updated successfully.`);
    }).catch(e => {
      showFaliureNotification(`Faild to update ${field} field`);
    })
  };

  handleInvoiceDelete = ({ _id, id, taskID }) => {
    const payload = {
      invoice: {
        isVisibleOnAdminPage: false,
        id
      },
      taskId: taskID
    };

    updateInvoice(payload).then(data => {
      InvoiceModel.get(data.id).$delete();
      showSuccessNotification('Invoice removed successfully.');
    }).catch(e => {
      showFaliureNotification('Something went wrong while deleteing the invoice.');
    })
  };

  deleteIconRenderer = (params) => {
    return <Icon type="delete" onClick={() => this.handleInvoiceDelete(params.data)} style={{ cursor: 'pointer', color: 'red' }} />
  };

  openTaskRenderer = (params) => <Button onClick={() => this.props.openTaskPage(params)}> {params.value} </Button>;

  resetInvoice = (id) => {
    InvoiceModel.resetInvoice(id);
  };

  changeHoldStatus = (value, data) => {
    let { id, templates, taskID } = data;
    let payload = {};
    if (value === 'Y' && data.sent === 'Y') {
      templates.find(template => template.title === 'On Hold').isDone = false;
      payload = {
        invoice: {
          hold: value,
          sent: 'N',
          id,
          templates
        },
        taskId: taskID
      };
    } else {
      payload = {
        invoice: {
          hold: value,
          id
        },
        taskId: taskID
      };
    }
    this.updateInvoice(payload, 'hold  status');
  };

  changeSentStatus = (value, data) => {
    let { id, templates, taskID, hold } = data;
    let payload = {};
    templates.find(template => template.title === 'Submitted to customer').isDone = true;
    if (value === 'Y' && hold === 'Y') {
      payload = {
        id,
        templates,
        // taskID,
        sent: 'Y',
        hold: 'N',
        sentDate: new Date()
      }
    } else if (value === 'Y' && hold !== 'Y') {
      payload = {
        id,
        templates,
        // taskID,
        sent: 'Y',
        sentDate: new Date()
      }
    } else {
      templates.find(template => template.title === 'Submitted to customer').isDone = false;
      payload = {
        id,
        templates,
        sent: value,
        sentDate: null
      }
    }
    this.updateInvoice({ invoice: payload, taskId: taskID }, 'sent status');
  };

  ChangePaidStatus = (value, data) => {
    let { id, templates, taskID } = data;
    let payload = {};
    templates.find(template => template.title === 'Paid').isDone = value === 'Y';
    payload = {
      id,
      templates,
      paid: value,
      paidDate: value === 'Y' ? new Date() : null
    };
    this.updateInvoice({ invoice: payload, taskId: taskID }, 'paid status');
  };

  handleStatusChange = (value, { data, colDef, node }) => {
    if (value === '-') {
      this.resetInvoice(data.id);
      showWarningNotification('Please select Y or N as hold status.');
      return;
    }
    switch (colDef.field) {
      case FIELDS.INV_HOLD:
        this.changeHoldStatus(value, data, node);
        break;
      case FIELDS.INV_SENT:
        this.changeSentStatus(value, data, node);
        break;
      case FIELDS.INV_PAID:
        this.ChangePaidStatus(value, data, node);
        break;
    }
  };

  sentOptionRenderer = (params) => <Select
    defaultValue={params.value}
    extra={params.data}
    handleChange={(e) => this.handleStatusChange(e, params)}
    className='table-select'
    dropdownClassName='select-options'
    options={SENT_PAID_OPTIONS}
  />;

  getRowNodeId = (data) => data.id;

  onScroll = (e) => {
    if (this.props.onScroll) {
      this.props.onScroll(e, this.props.selector);
    }
  }

  onGridSizeChanged = (params) => {
    var gridWidth = document.getElementById("grid-wrapper").offsetWidth;
    var columnsToShow = [];
    var columnsToHide = [];
    var totalColsWidth = 0;
    var allColumns = params.columnApi.getAllColumns();
    for (var i = 0; i < allColumns.length; i++) {
      let column = allColumns[i];
      totalColsWidth += column.getMinWidth();
      if (totalColsWidth > gridWidth) {
        columnsToHide.push(column.colId);
      } else {
        columnsToShow.push(column.colId);
      }
    }
    if (columnsToHide.length === 0) {
      params.api.sizeColumnsToFit();
    }
  }

  render = () => {
    console.log('^^^^^^', this.props.data.length, this.props.selector)
    return <div id='grid-wrapper' className={"collapse-panel scope-table-container"}
      style={{ padding: '0px 0px 0px 3px' }}
      onScroll={this.onScroll}
    >
      <div className="ag-theme-balham custom-grid-layout">
        <PLPDataGrid
          columnDefs={this.props.headers}
          showLoader={this.props.showLoader}
          rowData={this.props.data}
          minHeight={300}
          colResizeDefault
          deltaRowDataMode
          getRowNodeId={this.getRowNodeId}
          onCellValueChanged={this.handleChange}
          frameworkComponents={{
            invoiceTeamRenderer: InvoiceTeam,
            deleteIconRenderer: this.deleteIconRenderer,
            openTaskRenderer: this.openTaskRenderer,
            sentOptionRenderer: SentOptionRenderer,
            costRenderer: CostRenderer
          }}
          onGridSizeChanged={this.onGridSizeChanged}
        />
      </div>
    </div>
  }
}
