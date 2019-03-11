import './CreateMilestone.scss';

import { Col, Radio, Row } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import React from 'react';
import { connect } from 'react-redux';

import { PLPCheckbox, PLPInput, PLPModal, PLPSelect } from '../../../baseComponents/importer';
import PLPPureComponent from '../../../baseComponents/PLPPureComponent';
import { Select } from '../../../baseComponents/Select';
import { UserModel } from '../../../model/UserModel';
import { SelectedTaskDetailModel } from '../../../model/TaskModels/SelectedTaskDetailModel';
import { getSortedScopes, getSortedSelectedScopes } from '../../../utils/common';
import { changeSubmitButtonStyle } from '../../../utils/changeBackgroundOfSubmit';
import { showFaliureNotification, showSuccessNotification, showWarningNotification } from '../../../utils/notifications';
import { addMilestone } from '../../../utils/promises/milestoneCreatePromises';
import { addMilestoneToScope } from '../../../utils/promises/ScopePromises';
import { updateMilestone } from '../../../utils/promises/TaskPromises';
import { CSA_FORM_ARRAY, milestoneTypeArray } from './Constants';
import { CSAFormField } from './CSAFormField';
import ScopeRow from './InvoiceForm/ScopeRow';
import { getFormatedInvoiceFormData, getTotalCost } from './InvoiceForm/util';
import { getCSAFormData, isValidInvoice } from './util';
import { ScopeModel } from '../../../model/CustomerHomeModels/ScopeModel';
import { isEmptyString } from '../../../utils/Validation';

const RadioGroup = Radio.Group;

class CreateMilestone extends PLPPureComponent {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            milestoneType: this.props.type,
            selectedScopes: [],
            loading: false,
            csaDataObject: CSA_FORM_ARRAY,
            singleSelectedScope: null,
            invoice: getFormatedInvoiceFormData(this.props.scopes, null, this.props.selectedTask.invoices.length + 1),
            includeCost: false,
            newPurcharseOrder: {
                name: '',
                signature: '',
                notes: ''
            },
            priceUpdatedScopesInInvoice: []
        }
    }

    handlePOChange = ({ target }) => {
        const newPurcharseOrder = { ...this.state.newPurcharseOrder, [target.name]: target.value }
        // {newPurcharseOrder[target.name] = target.value}
        this.setState({ newPurcharseOrder });
    }

    isValidForm = () => {
        switch (this.state.milestoneType) {
            case 'purchaseOrder':
                if (this.props.hidePOForm) return true
                const { name, signature, notes } = this.state.newPurcharseOrder
                return !isEmptyString(name) && !isEmptyString(signature)
            case 'scopePlannings':
                return this.state.singleSelectedScope ? true : false
            case 'invoice':
                const { invoice } = this.state;
                let validInvoice = isValidInvoice(this.props.selectedTask.contractor, invoice);
                let isValid = !validInvoice.poRequiredError && !validInvoice.scopesError
                    && !validInvoice.includeClientJobNoError && !validInvoice.includeContactsError && !validInvoice.descrptionError
                    && !validInvoice.priceError
                if (!isValid) {
                    this.setState({ error: validInvoice });
                    return false;
                }
                return true;

        }
        // if (this.state.milestoneType === 'invoice') {
        //     const { invoice } = this.state;
        //     let validInvoice = isValidInvoice(this.props.selectedTask.contractor, invoice);

        //     let isValid = !validInvoice.poRequiredError && !validInvoice.scopesError
        //         && !validInvoice.includeClientJobNoError && !validInvoice.includeContactsError && !validInvoice.descrptionError
        //         && !validInvoice.priceError
        //     if (!isValid) {
        //         this.setState({ error: validInvoice });
        //         return false
        //     }
        // }
        return true
    }

    componentWillMount() {
        let { selectedMilestoneId, selectedTask } = this.props;
        if (selectedMilestoneId) {
            switch (this.state.milestoneType) {
                case 'agreement':
                    const csa = selectedTask.agreements.find(agreement => agreement.id === selectedMilestoneId);
                    if (!csa) return;
                    const { csaDataObject, includeCost, selectedScopes } = getCSAFormData(csa);
                    this.setState({ csaDataObject, includeCost, selectedScopes, templates: csa.templates });
                    break;
                case 'invoice':
                    const invoice = cloneDeep(selectedTask.invoices.find(inv => inv.id === selectedMilestoneId));
                    if (!invoice) return;
                    const detailedInvoice = getFormatedInvoiceFormData(this.props.scopes, invoice, selectedTask.invoices.length + 1);
                    // detailedInvoice.number = selectedTask.invoices.length + 1,
                    this.setState({ invoice: detailedInvoice });
                    break;
                case 'clientAgreement':
                    const clientAgreement = selectedTask.clientAgreements.find(item => item.id === selectedMilestoneId);
                    if (!clientAgreement) return;
                    this.setState({
                        selectedScopes: clientAgreement.selectedScopes.map(item => item._id)
                    });
                    break;
                case 'masterAgreement':
                    const masterAgreement = selectedTask.masterAgreements.find(item => item.id === selectedMilestoneId);
                    if (!masterAgreement) return;
                    this.setState({
                        selectedScopes: masterAgreement.selectedScopes.map(item => item._id)
                    });
                    break;
                case 'modifiedAgreement':
                    const modifiedAgreement = selectedTask.modifiedAgreements.find(item => item.id === selectedMilestoneId);
                    if (!modifiedAgreement) return;
                    this.setState({
                        selectedScopes: modifiedAgreement.selectedScopes.map(item => item._id)
                    });
                    break;
            }
        }
    }

    handleInvoiceFormChange = ({ target }) => {
        const { value, id, name } = target;
        const invoice = { ...this.state.invoice, [id]: value };
        this.setState({ invoice });
    };

    handleHoldChange = (value) => {
        const invoice = { ...this.state.invoice, hold: value };
        this.setState({ invoice });
    };

    handleScopeChange = (scope, id, isPriceUpdated = false) => {
        const index = this.state.invoice.selectedScopes.findIndex(selectedScope => selectedScope.scope.id === id);
        if (index === -1) return;
        const invoice = { ...this.state.invoice };
        const selectedScopes = [...invoice.selectedScopes];
        selectedScopes[index] = scope;

        const totalCost = getTotalCost(selectedScopes);
        const newInvoice = {
            ...invoice,
            totalCost,
            selectedScopes
        };

        let priceUpdatedScopesInInvoice = [...this.state.priceUpdatedScopesInInvoice]
        if (isPriceUpdated) {
            priceUpdatedScopesInInvoice.push(id);
        }

        this.setState({ invoice: newInvoice, priceUpdatedScopesInInvoice });
    };


    renderInvoices = () => this.state.invoice
        && getSortedSelectedScopes(this.state.invoice.selectedScopes).map(scopeInvoice => <ScopeRow
            onScopeChange={this.handleScopeChange}
            scopeInvoice={scopeInvoice}
        />);

    togglePopup = (event) => {
        this.setState({ loading: false });
        this.props.togglePopup({ target: { id: 'showCreateMilestone', value: false } });
    };

    getSelectedScopesForPayload = () => {
        let { selectedScopes } = this.state;
        let { selectedTask } = this.props;
        let scopes = [];
        selectedScopes.map(scope => {
            let foundScope = selectedTask.scopes.find((propsScopes) => propsScopes._id === scope);
            scopes.push({
                id: foundScope.id,
                _id: foundScope._id,
                note: foundScope.note,
                number: foundScope.number,
                isArchived: foundScope.isArchived
            });
        });
        return scopes;
    };

    updateAgreement = (payload) => {
        let { milestoneType } = this.state;
        payload[milestoneType].isUpdated = true;
        if (this.state.templates) {
            payload.agreement.templates = this.state.templates;
            payload.agreement.templates.forEach(item => {
                if (item.title.match(/^(Scope: |Scope:)$/)) {
                    item.isDone = true;
                }
            });
        }
        const { selectedMilestoneId } = this.props;
        updateMilestone(`${milestoneType}/${selectedMilestoneId}`, payload)
            .then(({ data }) => {
                SelectedTaskDetailModel.updateStore(milestoneType, data, this.props.selectedTask.id);
                this.togglePopup();
                // showSuccessNotification(`${milestoneType} has been updated.`);
            })
            .catch(() => {
                this.setState({ loading: false });
                showFaliureNotification(`Error in updating ${milestoneType}.`);
            });
    };

    addAggrement = (payload) => {
        payload.isUpdated = true;
        let { milestoneType } = this.state;
        addMilestone(milestoneType, payload).then(data => {
            SelectedTaskDetailModel.addToStore(milestoneType, data);
            // showSuccessNotification('Aggrement has been added successfully.');
            this.togglePopup();
        }).catch(e => {
            console.log(e);
            this.setState({ loading: false });
            showFaliureNotification(`Something went wrong while adding ${milestoneType}.`);
        });
    };

    handleSubmitClick = () => {
        this.setState({ loading: true });
        if (this.props.selectedMilestoneId) {
            this.updateMilestone();
        } else {
            this.addMilestone();
        }
    };

    updateMilestone = () => {
        switch (this.state.milestoneType) {
            case 'clientAgreement':
            case 'masterAgreement':
            case 'modifiedAgreement':
                if (this.state.selectedScopes.length <= 0) {
                    showWarningNotification('At least one scope must be selected');
                    this.setState({ loading: false });
                    return;
                }
                this.updateAgreement(this.getCA_MA_MCSAData());
                break;
            case 'agreement':
                if (this.state.selectedScopes.length <= 0) {
                    showWarningNotification('At least one scope must be selected');
                    this.setState({ loading: false });
                    return;
                }
                this.updateAgreement(this.getCSAData());
                break;
            case 'CUSTOMER DRAWING':
            case 'LETTER':
            case 'TAB DATA':
                this.add_LETTER_DRAWING_TAB_DATA();
                break;
            case 'invoice':
                this.updateInvoice();
                break;
        }
    };

    addMilestone = () => {
        switch (this.state.milestoneType) {
            case 'clientAgreement':
            case 'masterAgreement':
            case 'modifiedAgreement':
                if (this.state.selectedScopes.length <= 0) {
                    showWarningNotification('At least one scope must be selected');
                    this.setState({ loading: false });
                    return;
                }
                this.addAggrement(this.getCA_MA_MCSAData());
                break;
            case 'agreement':
                if (this.state.selectedScopes.length <= 0) {
                    showWarningNotification('At least one scope must be selected');
                    this.setState({ loading: false });
                    return;
                }
                this.addAggrement(this.getCSAData());
                break;
            case 'CUSTOMER DRAWING':
            case 'LETTER':
            case 'TAB DATA':
            case 'scopePlannings':
                this.add_LETTER_DRAWING_TAB_DATA();
                break;
            case 'invoice':
                this.addInvoice();
                break;
            case 'purchaseOrder':
                this.addPurchaseOrder();
                break;
        }
    };

    async addPurchaseOrder() {
        const { milestoneType } = this.state;
        const payload = {
            purchaseOrder: this.state.newPurcharseOrder,
            taskID: this.props.selectedTask.id
        };
        addMilestone(milestoneType, payload).then(data => {
            SelectedTaskDetailModel.addToStore(milestoneType, data);
            // showSuccessNotification('Purchase order has been added successfully.');
            this.togglePopup();
        }).catch(e => {
            console.log(e);
            this.setState({ loading: false });
            showFaliureNotification(`Something went wrong while adding purchase order.`);
        });
    }

    async addInvoice() {
        const invoice = {
            ...this.state.invoice,
            selectedScopes: this.state.invoice.selectedScopes.filter(scope => scope.marked),
            isUpdated: true,
            isVisibleOnAdminPage: true,
            lastModifiedBy: this.props.loggedInUser._id
        };

        const payload = {
            invoice,
            taskId: this.props.selectedTask.id
        };
        const { milestoneType } = this.state;
        addMilestone(milestoneType, payload).then(data => { // passing data directly puts array insteaed on obj task.invoices
            SelectedTaskDetailModel.addToStore(milestoneType, data);
            // showSuccessNotification('invoice has been added successfully.');
            this.togglePopup();
        }).catch(e => {
            console.log(e);
            this.setState({ loading: false });
            showFaliureNotification(`Something went wrong while adding invoice.`);
        });
    }

    updateInvoice = async () => {
        const { milestoneType } = this.state;
        let invoice = cloneDeep(this.state.invoice);
        invoice.selectedScopes = this.state.invoice.selectedScopes.filter(scope => scope.marked);
        invoice.templates.forEach(item => {
            if (item.title.match(/^(Scope:|Draft created|Amount:)$/)) {
                item.isDone = true;
            }
        })

        let { selectedMilestoneId, selectedTask } = this.props;
        const inv = selectedTask.invoices.find(inv => inv.id === selectedMilestoneId);


        invoice.selectedScopes.forEach(item => {
            if (!this.state.priceUpdatedScopesInInvoice.find(id => id === item.scope.id)) {
                if (inv) {
                    let selScope = inv.selectedScopes.find(item1 => item1._id === item._id);
                    if (selScope) {
                        item.oldPrice = selScope.oldPrice
                    }
                }
            }
        });

        invoice.isUpdated = true;
        // invoice.isDownloaded = false;
        invoice.isVisibleOnAdminPage = true;
        invoice.lastModifiedBy = this.props.loggedInUser._id;
        invoice.priceUpdatedScopesInInvoice = this.state.priceUpdatedScopesInInvoice;

        const payload = {
            invoice,
            taskId: this.props.selectedTask.id
        }
        updateMilestone(`${milestoneType}/${selectedMilestoneId}`, payload)
            .then(({ data }) => {
                const allScopeIds = ScopeModel.list().map(item => item.props.id);
                const nonExistingScopeIds = []
                data.selectedScopes.forEach(item => {
                    if (!allScopeIds.includes(item.scope.id)) return nonExistingScopeIds.push(item.scope.id)
                });
                if (nonExistingScopeIds.length > 0) {
                    ScopeModel.fetchNewScopes(nonExistingScopeIds)
                }
                SelectedTaskDetailModel.updateStore(milestoneType, data, this.props.selectedTask.id);
                this.togglePopup();
                // showSuccessNotification(`${milestoneType} has been updated.`);
            })
            .catch((e) => {
                this.setState({ loading: false });
                showFaliureNotification(`Error in updating ${milestoneType}.`);
            });
    };

    handleSelectTemplateDropdown = (value) => {
        this.setState({
            milestoneType: value,
            singleSelectedScope: null,
            selectedScopes: []
        });
    };

    onChange = (checked, scopeId) => {
        let selectedScopes = [...this.state.selectedScopes];
        if (checked) {
            selectedScopes.push(scopeId);
        } else {
            selectedScopes.splice(selectedScopes.indexOf(scopeId), 1);
        }
        this.setState({ selectedScopes });
    };

    onRadioButtonChange = ({ target }) => {
        this.setState({ singleSelectedScope: target.value })
    };

    getCamelCase = (str) => {
        return `${str.trim()[0].toUpperCase()}${str.trim().substr(1, str.length)}`;
    };

    getCA_MA_MCSAData = () => {
        let { selectedTask } = this.props;
        const { milestoneType } = this.state;
        const payload = {
            [milestoneType]: { selectedScopes: this.getSelectedScopesForPayload() },
            taskId: selectedTask.id,
        };
        return payload;
    };

    getCSAData = (isUpdating) => {
        const { csaDataObject, includeCost } = this.state;
        let { selectedTask } = this.props;
        let agreement = {};
        csaDataObject.map(object => {
            agreement[`${object.textTitle}`] = object.text;
            agreement[`${object.textTitle}Title`] = object.title;
            agreement[`has${this.getCamelCase(object.textTitle)}`] = object.checked;
        });
        agreement.selectedScopes = this.getSelectedScopesForPayload();
        agreement.isCostIncluded = includeCost;
        agreement.isUpdated = true;
        const payload = {
            agreement,
            taskId: selectedTask.id
        };
        return payload;
    };

    add_LETTER_DRAWING_TAB_DATA = () => {
        const { singleSelectedScope, milestoneType } = this.state;
        if (!singleSelectedScope) {
            showWarningNotification('One scope must be selected');
            this.setState({ loading: false });
            return;
        }
        let foundScope = this.props.selectedTask.scopes.find(propsScopes => propsScopes._id === singleSelectedScope);
        let payload = {
            taskId: this.props.selectedTask.id
        };
        if (foundScope.parent) {
            const revSvopeNumber = foundScope.number.split("-").pop();
            payload.number = revSvopeNumber;
        }
        addMilestoneToScope(singleSelectedScope, milestoneType.toLowerCase().split(' ').join('_'), payload)
            .then(result => {
                console.log('******', result)
                SelectedTaskDetailModel.updateScope(result, this.props.selectedTask.id);
                // showSuccessNotification(`${milestoneType} has been added successfully.`);
                this.togglePopup();
            }).catch(e => {
                showFaliureNotification(`Something went wrong  while adding ${milestoneType} .`);
                // this.togglePopup();
            });
    };

    getScopeCheckBox = () => getSortedScopes(this.props.selectedTask.scopes.filter(item => !item.isArchived))
        .map((scope, key) => <li ksy={key} className='scope-options'>
            <PLPCheckbox
                checked={this.state.selectedScopes.includes(scope._id)}
                data={scope._id}
                onChange={this.onChange}>
                {`Scope ${scope.number} - ${scope.note}`}
            </PLPCheckbox>
        </li>);

    getArchivedScopesLength = () => {
        return this.props.archivedScopesLength > 0 && <span>Archived Scopes: {this.props.archivedScopesLength}</span>;
    }

    getScopeList = () => <div className='scope-options-container' style={this.props.selectedMilestoneId ? { borderTop: 0 } : {}}>
        <div className='scopes-archived'>
            <div className='label'>Scopes <sup>*</sup></div>
            {this.getArchivedScopesLength()}
        </div>
        <div className='scope-list-container'><ol>{this.getScopeCheckBox()}</ol></div>
    </div>;

    getScopeRadioGroup = (scopes) => scopes.map(scope => <RadioGroup className='scope-options' onChange={this.onRadioButtonChange} value={this.state.singleSelectedScope} >
        <Radio value={`${scope._id}`} >
            {`Scope ${scope.number} - ${scope.note}`}
        </Radio>
    </RadioGroup>
    );

    showNoScopesMessage = () => <div className='no-scope-message'>
        No scopes available for this milestone
    </div>;

    getScopeRadioList = (scopes) => <div className='scope-options-container'>
        <div className='label'>Scopes <sup>*</sup></div>
        <div className='scope-list-container'>
            {scopes.length === 0 && this.showNoScopesMessage() || this.getScopeRadioGroup(scopes)}
        </div>
    </div>;

    getFilteredScopes = (key) => this.props.selectedTask.scopes.filter(scope => !scope.isArchived && (scope[key].length === 0 || key === 'scopePlannings'));

    handleCheckBoxClick = (checked, { id, name }) => {
        let csaDataObject = cloneDeep(this.state.csaDataObject);
        csaDataObject[id][name] = checked;
        this.setState({ csaDataObject });
    };

    handleTextValueChange = ({ target: { id, name, value } }) => {
        let csaDataObject = cloneDeep(this.state.csaDataObject);
        csaDataObject[id][name] = value;
        this.setState({
            csaDataObject
        });
    };

    handleIncludeCostChange = (checked) => {
        this.setState({ includeCost: checked });
    };

    getCSAForm = () => <div className='csa-form-container'>
        <PLPCheckbox
            checked={this.state.includeCost}
            onChange={this.handleIncludeCostChange}
        >
            Include Cost
        </PLPCheckbox>
        {
            this.state.csaDataObject.map((form, index) => < CSAFormField
                handleCheckBoxClick={this.handleCheckBoxClick}
                handleTextValueChange={this.handleTextValueChange}
                form={form}
                index={index}
            />)
        }
    </div>;

    getInvoiceForm = () => {
        const { invoice } = this.state;
        return (
            <div>
                <Row gutter={16}>
                    <Col className="gutter-row" span={6}>
                        <PLPInput label="Invoice Number" id='number' value={invoice && invoice.number}
                            className="gutter-box" />
                    </Col>
                    {
                        this.props.selectedTask.contractor.poRequired &&
                        <Col className="gutter-row" span={6}>
                            <PLPInput
                                required={this.props.selectedTask.contractor.poRequired}
                                defaultValue={invoice && invoice.poNumber}
                                label="PO Number" onChange={this.handleInvoiceFormChange}
                                id='poNumber' className="gutter-box"
                            />
                        </Col>
                    }
                    <Col className="gutter-row" span={6}>
                        <PLPSelect
                            value={invoice && invoice.hold}
                            options={[{ text: 'N', value: 'N' }, { text: 'Y', value: 'Y' }]}
                            handleChange={this.handleHoldChange}
                            label='Hold' className="gutter-box"
                        />
                    </Col>
                    <Col className="gutter-row" span={6}>
                        <PLPInput defaultValue={invoice && invoice.company} label="Company"
                            onChange={this.handleInvoiceFormChange}
                            id='company' className="gutter-box"
                        />
                    </Col>
                    <Col className="gutter-row" span={6}>
                        <PLPInput disabled
                            value={invoice && invoice.totalCost} label="Total Billed"
                            id='totalCost' className="gutter-box"
                        />
                    </Col>
                    {
                        this.props.selectedTask.contractor.includeContacts &&
                        <Col className="gutter-row" span={6}>
                            <PLPInput
                                required={this.props.selectedTask.contractor.includeContacts}
                                defaultValue={invoice && invoice.contact}
                                label="Contact" onChange={this.handleInvoiceFormChange}
                                id='contact' className="gutter-box"
                            />
                        </Col>
                    }
                    {
                        this.props.selectedTask.contractor.includeClientJobNo &&
                        <Col className="gutter-row" span={6}>
                            <PLPInput
                                required={this.props.selectedTask.contractor.includeClientJobNo}
                                defaultValue={invoice && invoice.clientJobNo}
                                label="Client Job No" onChange={this.handleInvoiceFormChange}
                                id='clientJobNo' className="gutter-box"
                            />
                        </Col>
                    }
                </Row>
                <div className='scopes-archived'>
                    <label className={'ant-form-item-required'}>
                        {"Scopes"}
                    </label>
                    {this.getArchivedScopesLength()}
                </div>
                {this.renderInvoices()}
            </div>
        )
    };
    getMilestoneForm = () => {
        let filtereScopes = [];
        switch (this.state.milestoneType) {
            case 'clientAgreement':
            case 'masterAgreement':
            case 'modifiedAgreement':
                return this.getScopeList();

            case 'CUSTOMER DRAWING':
                filtereScopes = this.getFilteredScopes('custDrawings');
                return this.getScopeRadioList(filtereScopes);
            case 'scopePlannings':
                filtereScopes = this.getFilteredScopes('scopePlannings');
                return this.getScopeRadioList(filtereScopes);
            case 'LETTER':
                filtereScopes = this.getFilteredScopes('letters');
                return this.getScopeRadioList(filtereScopes);
            case 'TAB DATA':
                filtereScopes = this.getFilteredScopes('tabData');
                return this.getScopeRadioList(filtereScopes);
            case 'agreement':
                return <div>
                    {this.getScopeList()}
                    {this.getCSAForm()}
                </div>;
            case 'invoice':
                return this.getInvoiceForm();
            case 'purchaseOrder':
                return this.getPurchaseOrderForm()
        }
    };

    renderScopes = (scopes) => scopes.map(scope => <Row gutter={16}>
        <Col className="gutter-row" span={8}>
            <PLPInput
                label='Scope' disabled
                className='gutter-box'
                value={`Scope ${scope.number}`}
            />
        </Col>
        <Col className="gutter-row" span={8}>
            <PLPInput
                label='Price' disabled
                className='gutter-box'
                value={scope.price}
            />
        </Col>
        <Col className="gutter-row" span={8}>
            <PLPInput
                label='Contact' disabled
                className='gutter-box'
                value={scope.customerContact && scope.customerContact.name || ''}
            />
        </Col>
    </Row >)

    getPurchaseOrderForm = () => {
        const { name, signature, notes } = this.state.newPurcharseOrder
        if (this.props.hidePOForm) return;

        return (
            <div>
                <Row gutter={16}>
                    <Col className="gutter-row" span={12}>
                        <PLPInput
                            name='name'
                            label='Customer Contact First Name'
                            className='gutter-box'
                            required
                            value={name}
                            onChange={this.handlePOChange}
                        />
                    </Col>
                    <Col className="gutter-row" span={12}>
                        <PLPInput
                            name='signature'
                            required
                            label='DHC Employee'
                            className='gutter-box'
                            value={signature}
                            onChange={this.handlePOChange}
                        />
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col className="gutter-row" span={12}>
                        <PLPInput
                            label='Project'
                            disabled
                            className='gutter-box'
                            value={this.props.selectedTask.title}
                        />
                    </Col>
                    <Col className="gutter-row" span={12}>
                        <PLPInput
                            label='Project City'
                            className='gutter-box'
                            value={this.props.selectedTask.city} disabled
                        />
                    </Col>
                </Row>
                {this.renderScopes(this.props.scopes)}
                <Row gutter={16}>
                    <Col className="gutter-row" span={12}>
                        <PLPInput
                            name='notes'
                            label='Additional Notes'
                            className='gutter-box'
                            value={notes}
                            onChange={this.handlePOChange}
                        />
                    </Col>
                </Row>
            </div>
        )
    }

    getWidth = () => {
        switch (this.state.milestoneType) {
            case 'agreement':
            case 'invoice':
                return '1020px';
            case 'purchaseOrder':
                return '800px'
            default:
                return '520px';
        }
    };

    getDropdownOptions = () => {
        const { milestoneArrayIndex, parent, isTask } = this.props;
        switch (parent) {
            case 'document-table':
                return [milestoneTypeArray[0], ...milestoneTypeArray.slice(4, 9 - milestoneArrayIndex)];
            default:
                return isTask && [milestoneTypeArray[9]] || milestoneTypeArray.slice(1, 9 - milestoneArrayIndex);
        }
    };

    renderMilestoneDropdown = () => <Select
        style={{ width: '150px' }}
        placeholder='Select Template'
        handleChange={this.handleSelectTemplateDropdown}
        className='table-select'
        dropdownClassName='select-options'
        value={this.state.milestoneType}
        options={this.getDropdownOptions()}
        data='showCreateMilestone'
    />;

    render = () => <PLPModal
        title={`${this.props.selectedMilestoneId ? 'Update' : 'Add'} ${this.state.milestoneType}`}
        visible
        id='create_milestone'
        centered
        okText='Submit'
        cancelButtonProps={{ className: 'cancel-btn-right' }}
        okButtonProps={{ disabled: !this.isValidForm(), style: changeSubmitButtonStyle(this.state.loading) }}
        onCancel={this.togglePopup}
        onOk={this.handleSubmitClick}
        confirmLoading={this.state.loading}
        width={this.getWidth()}
    >
        {!this.props.selectedMilestoneId && this.renderMilestoneDropdown()}
        <div className='milestone-form-container'>
            {this.getMilestoneForm()}
        </div>
    </PLPModal>;
}

function mapStateToProps() {
    const task = SelectedTaskDetailModel.list().map(item => item.props)[0];
    const loggedInUser = UserModel.last().props;
    const scopes = task.scopes.filter(scope => !scope.isArchived);
    return {
        loggedInUser,
        selectedTask: task,
        scopes,
        archivedScopesLength: task.scopes.length - scopes.length
    }
}

export default connect(mapStateToProps)(CreateMilestone);
