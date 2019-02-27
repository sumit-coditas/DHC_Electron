import React, { PropTypes } from 'react';

import forEach from 'lodash/forEach';
import concat from 'lodash/concat';
import isEqual from 'lodash/isEqual';

import moment from 'moment';

import Constant from '../helpers/Constant.js';

export default class Document extends React.Component {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !isEqual(this.props.task.agreements, nextProps.task.agreements) ||
            !isEqual(this.props.task.modifiedAgreements, nextProps.task.modifiedAgreements) ||
            !isEqual(this.props.task.masterAgreements, nextProps.task.masterAgreements) ||
            !isEqual(this.props.task.clientAgreements, nextProps.task.clientAgreements) ||
            !isEqual(this.props.task.invoices, nextProps.task.invoices) ||
            !isEqual(this.props.task.purchaseOrders, nextProps.task.purchaseOrders) ||
            !isEqual(this.props.task.contractor.poRequired, nextProps.task.contractor.poRequired) ||
            !isEqual(this.props.task.contractor.invoiceContact, nextProps.task.contractor.invoiceContact) ||
            !isEqual(this.props.task.contractor.includeContacts, nextProps.task.contractor.includeContacts) ||
            !isEqual(this.props.task.contractor.billBranch, nextProps.task.contractor.billBranch) ||
            !isEqual(this.props.task.contractor.contract, nextProps.task.contractor.contract) ||
            !isEqual(this.props.task.contractor, nextProps.task.contractor);
    }

    render() {
        let self = this;
        let { task, contractor } = self.props;
        let styles = {
            docName: {
                cursor: 'pointer',
                color: '#4183C4'
            },
            download: {
                background: 'none',
                color: '#4183C4',
                border: 'none'
            },
            disabledDownload: {
                cursor: 'not-allowed',
                background: 'none',
                color: '#4183C4',
                border: 'none'
            }
        };

        let agreements = [];
        // if (task.contractor.contract.toUpperCase() === Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT) {
        forEach(task.agreements, (agreement, index) => {
            agreements.push(
                <div key={'agreement' + index} className='modal-bucket-row w-row'>
                    <div className='w-col w-col-3'>
                        <div className='team-role' style={styles.docName}
                            onClick={self.props.handleUpdateDocument.bind(self, Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT, agreement)}>{'CSA ' + agreement.number}</div>
                    </div>
                    <div className='w-col w-col-3'>
                        <div className='team-role'>{moment(agreement.createdAt).format('M/D/YY')}</div>
                    </div>
                    <div className='w-col w-col-3'>
                        <form action='/api/agreement/download' method='post'>
                            <input type='hidden' name='csaId' value={agreement.id} />
                            <input type='hidden' name='taskId' value={task.id} />
                            <input type='submit' style={self.props.disableClick ? styles.disabledDownload : styles.download}
                                className='team-role fa' value='&#xf019;'
                                disabled={self.props.disableClick ? 'disabled' : ''}
                                onClick={self.props.handleDownload.bind(self, Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT, agreement)} />
                        </form>
                    </div>
                    { !this.props.disabled &&
                        <div className='w-col w-col-3'>
                            <a className='fa team-role' href='#'
                                onClick={self.props.handleArchive.bind(self, agreement, Constant.DOCUMENT_TYPES.CUSTOMER_SERVICE_AGREEMENT)}>&#xf00d;</a>
                        </div>
                    }
                </div>
            );
        });
        // }

        let modifiedAgreements = [];
        forEach(task.modifiedAgreements, (modifiedAgreement, index) => {
            modifiedAgreements.push(
                <div key={'modifiedAgreement' + index} className='modal-bucket-row w-row'>
                    <div className='w-col w-col-3'>
                        <div className='team-role' style={styles.docName}
                            onClick={self.props.handleUpdateDocument.bind(self, Constant.DOCUMENT_TYPES.MODIFIED_CUSTOMER_SERVICE_AGREEMENT, modifiedAgreement)}>{'MCSA ' + modifiedAgreement.number}</div>
                    </div>
                    <div className='w-col w-col-3'>
                        <div className='team-role'>{moment(modifiedAgreement.createdAt).format('M/D/YY')}</div>
                    </div>
                    <div className='w-col w-col-3'>
                        <form action='/api/modifiedAgreement/download' method='post'>
                            <input type='hidden' name='csaId' value={modifiedAgreement.id} />
                            <input type='hidden' name='taskId' value={task.id} />
                            <input type='submit' style={styles.disabledDownload}
                                className='team-role fa' value='&#xf019;'
                                disabled={true} />
                        </form>
                    </div>
                    { !this.props.disabled &&
                        <div className='w-col w-col-3'>
                            <a className='fa team-role' href='#'
                                onClick={self.props.handleArchive.bind(self, modifiedAgreement, Constant.DOCUMENT_TYPES.MODIFIED_CUSTOMER_SERVICE_AGREEMENT)}>&#xf00d;</a>
                        </div>
                    }
                </div>
            );
        });

        let masterAgreements = [];
        forEach(task.masterAgreements, (masterAgreement, index) => {
            masterAgreements.push(
                <div key={'masterAgreement' + index} className='modal-bucket-row w-row'>
                    <div className='w-col w-col-3'>
                        <div className='team-role' style={styles.docName}
                            onClick={self.props.handleUpdateDocument.bind(self, Constant.DOCUMENT_TYPES.MASTER_AGREEMENT, masterAgreement)}>{'MA ' + masterAgreement.number}</div>
                    </div>
                    <div className='w-col w-col-3'>
                        <div className='team-role'>{moment(masterAgreement.createdAt).format('M/D/YY')}</div>
                    </div>
                    <div className='w-col w-col-3'>
                        <form action='/api/masterAgreement/download' method='post'>
                            <input type='hidden' name='csaId' value={masterAgreement.id} />
                            <input type='hidden' name='taskId' value={task.id} />
                            <input type='submit' style={styles.disabledDownload}
                                className='team-role fa' value='&#xf019;'
                                disabled={true} />
                        </form>
                    </div>
                    { !this.props.disabled &&
                        <div className='w-col w-col-3'>
                            <a className='fa team-role' href='#'
                                onClick={self.props.handleArchive.bind(self, masterAgreement, Constant.DOCUMENT_TYPES.MASTER_AGREEMENT)}>&#xf00d;</a>
                        </div>
                    }
                </div>
            );
        });

        let clientAgreements = [];
        forEach(task.clientAgreements, (clientAgreement, index) => {
            clientAgreements.push(
                <div key={'clientAgreement' + index} className='modal-bucket-row w-row'>
                    <div className='w-col w-col-3'>
                        <div className='team-role' style={styles.docName}
                            onClick={self.props.handleUpdateDocument.bind(self, Constant.DOCUMENT_TYPES.CLIENT_AGREEMENT, clientAgreement)}>{'CA ' + clientAgreement.number}</div>
                    </div>
                    <div className='w-col w-col-3'>
                        <div className='team-role'>{moment(clientAgreement.createdAt).format('M/D/YY')}</div>
                    </div>
                    <div className='w-col w-col-3'>
                        <form action='/api/clientAgreement/download' method='post'>
                            <input type='hidden' name='csaId' value={clientAgreement.id} />
                            <input type='hidden' name='taskId' value={task.id} />
                            <input type='submit' style={styles.disabledDownload}
                                className='team-role fa' value='&#xf019;'
                                disabled={true} />
                        </form>
                    </div>
                    { !this.props.disabled &&
                        <div className='w-col w-col-3'>
                            <a className='fa team-role' href='#'
                                onClick={self.props.handleArchive.bind(self, clientAgreement, Constant.DOCUMENT_TYPES.CLIENT_AGREEMENT)}>&#xf00d;</a>
                        </div>
                    }

                </div>
            );
        });

        let purchaseOrders = [];
        if (task.contractor.poRequired) {
            forEach(task.purchaseOrders, (purchaseOrder, index) => {
                purchaseOrders.push(
                    <div key={'purchaseOrder' + index} className='modal-bucket-row w-row'>
                        <div className='w-col w-col-3'>
                            <div className='team-role' style={styles.docName}
                                onClick={self.props.handleUpdateDocument.bind(self, Constant.DOCUMENT_TYPES.PURCHASE_ORDER, purchaseOrder)}>{'PO ' + purchaseOrder.number}</div>
                        </div>
                        <div className='w-col w-col-3'>
                            <div className='team-role'>{moment(purchaseOrder.createdAt).format('M/D/YY')}</div>
                        </div>

                        <div className='w-col w-col-3'>
                            {/* <form action='/api/purchaseOrder/download' method='post'>
                                <input type='hidden' name='poId' value={purchaseOrder.id} />
                                <input type='hidden' name='taskId' value={task.id} />
                                <input type='submit' style={{ background: 'none', border: 'none' }} className='team-role fa' value='&#xf019;' />
                            </form>*/}
                            <a className='fa team-role' href='#' onClick={self.props.showDocumentView.bind(self, purchaseOrder, Constant.DOCUMENT_TYPES.PURCHASE_ORDER)}>&#xf15b;</a>
                        </div>
                        { !this.props.disabled && <div className='w-col w-col-3'>
                            <a className='fa team-role' href='#' onClick={self.props.handleArchive.bind(self, purchaseOrder, Constant.DOCUMENT_TYPES.PURCHASE_ORDER)}>&#xf00d;</a>
                        </div>
                        }
                    </div>
                );
            });
        }

        let invoices = [];
        forEach(task.invoices, (invoice, index) => {
            invoices.push(
                <div key={'invoice' + index} className='modal-bucket-row w-row'>
                    <div className='w-col w-col-3'>
                        <div className='team-role' style={styles.docName}
                            onClick={self.props.handleUpdateDocument.bind(self, Constant.DOCUMENT_TYPES.INVOICE, invoice)}>{'Invoice ' + invoice.number}</div>
                    </div>
                    <div className='w-col w-col-3'>
                        <div className='team-role'>{moment(invoice.createdAt).format('M/D/YY')}</div>
                    </div>
                    <div className='w-col w-col-3'>
                        <form action='/api/invoice/download' method='post'>
                            <input type='hidden' name='invoiceId' value={invoice.id} />
                            <input type='hidden' name='taskId' value={task.id} />
                            <input type='hidden' name='poRequired' value={task.contractor.poRequired=== true || task.contractor.poRequired === undefined ? 'yes':'no'} />
                            <input type='hidden' name='includeContacts' value={task.contractor.includeContacts ? 'yes':'no'}/>
                            <input type='hidden' name='contact' value={invoice.contact} />
                            <input type='hidden' name='billBranchFromOutlook' value={task.contractor.billBranch}/>
                            <input type='hidden' name='companyNameFromOutlookNotes' value={task.contractor.company}/>
                            <input type='hidden' name='invoiceContact' value={task.contractor.invoiceContact} />
                            <input type='hidden' name='clientJobNo' value = {task.contractor.includeClientJobNo ? invoice.clientJobNo:''}/>

                            <input type='submit'
                                style={self.props.disableClick || !invoice.isVisibleOnAdminPage ? styles.disabledDownload : styles.download}
                                className='team-role fa'
                                value='&#xf019;'
                                disabled={self.props.disableClick || !invoice.isVisibleOnAdminPage ? 'disabled' : ''}
                                onClick={self.props.handleDownload.bind(self, Constant.DOCUMENT_TYPES.INVOICE, invoice, invoice.templates[1]._id)} />
                        </form>
                    </div>
                    { !this.props.disabled && <div className='w-col w-col-3'>
                        <a className='fa team-role' href='#' onClick={self.props.handleArchive.bind(self, invoice, Constant.DOCUMENT_TYPES.INVOICE)}>&#xf00d;</a>
                    </div>
                    }
                </div>
            );
        });

        let documents = concat(agreements, modifiedAgreements, masterAgreements, clientAgreements, purchaseOrders, invoices);

        return (
            <div>
                <div>
                    <div className='modal-section-wrapper'>
                        <div className='modal-section-title'>
                            <span className='fa'></span>
                            <span className='modal-name-field'>{task.contractor.poRequired? 'PO/CSA/Invoice' : 'CSA/Invoice'}</span>
                        </div>
                    </div>
                    { !this.props.disabled &&
                        <a className='fa add-new-tag' href='#' onClick={self.props.handleAddDocument.bind(self)}>
                            
                        </a>
                    }
                </div>
                <div className='modal-col-wrap'>
                    <div className='team-role-header'>
                        <div className='w-row'>
                            <div className='w-col w-col-3'>
                                <span>Item</span>
                            </div>
                            <div className='w-col w-col-3'>
                                <span>Date</span>
                            </div>
                            <div className='w-col w-col-3'>
                                <span>Download</span>
                            </div>
                            { !this.props.disabled &&
                                <div className='w-col w-col-3'>
                                    <span>Delete</span>
                                </div>
                            }
                        </div>
                    </div>
                    {documents.length
                        ? documents
                        : <div className='helptext'>No documents created yet. Click + button to create a new one.</div>
                    }
                </div>
            </div>
        );
    }
}

Document.propTypes = {
    task: PropTypes.object,
    disabled: PropTypes.bool
};
Document.defaultProps = {
    disabled: false
};
