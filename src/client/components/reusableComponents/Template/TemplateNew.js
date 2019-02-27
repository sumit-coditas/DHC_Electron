import './template.scss';

import { Select as AntSelect, Tooltip } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import React, { PropTypes } from 'react';
import { Step } from 'semantic-ui-react';

import CustomStep from '../../../baseComponents/CustomStep';
import PLPPureComponent from '../../../baseComponents/PLPPureComponent';
import { formatDate } from '../../../utils/common';
import { getDifferanceInDays } from '../../../utils/DateUtils';
import { showFaliureNotification, showWarningNotification } from '../../../utils/notifications';
import Constant from '../../helpers/Constant.js';
import { updateKeyword } from '../../../utils/promises/itemTypePromise';
import { SelectedTaskDetailModel } from '../../../model/TaskModels/SelectedTaskDetailModel';
import { CreateTemplateNode } from '../CreateTemplateNode/createTemplateNode';

const Option = AntSelect.Option;
export default class TemplateNew extends PLPPureComponent {
    state = { scopePlanning: null }

    handleScopePlaningChange = (e) => {
        this.setState({ scopePlanning: e.target.value });
    }

    addTemplateNode = (value) => {
        const { data, type, saveTemplateData } = this.props;
        let templates = data.templates.map(a => ({ ...a }));
        templates.push({
            title: value,
            isDone: false,
            isAttachment: false
        })
        const url = `${type}/${data.id}`;
        saveTemplateData(type, { id: data.id, templates });
        this.toggleCreateNodePopup();
    }

    handleScopePlanningBlur = (e) => {
        if (e.target.value && `${e.target.value}`.trim()) {
            this.updateValue(e);
            return;
        }
        showWarningNotification('Scope Planing Title cant be blank');
    }

    toggleCreateNodePopup = () => {
        this.setState(prevState => ({
            showCreateTemplateNodePopup: !prevState.showCreateTemplateNodePopup
        }));
    }


    getHeader = () => {
        const { headerTitle, headerWidth, unEditable, data, type } = this.props;
        let className = 'template-header';
        if (type === Constant.DOC_TYPES.SCOPE_KEYWORD.type && !data.enabled) {
            className += ' clickable-button-header-grey';
        } else {
            className += ' clickable-button-header';
        }

        return <div className={className} style={{ width: headerWidth }}>
            {type === Constant.DOC_TYPES.SCOPE_PLANNING.type &&
                <div className='scope-planning-header'>
                    {/* <Tooltip title="Archive scope">
                        <a className="fa fa-plus color-primary" style={{ color: "#fff" }} onClick={this.toggleCreateNodePopup}>
                            &#xf055;
                </a>
                    </Tooltip> */}
                    <input
                        className='editable-header-input'
                        disabled={this.props.unEditable}
                        value={this.state.scopePlanning !== null ? this.state.scopePlanning : data.title}
                        onChange={this.handleScopePlaningChange}
                        id='headerTitle'
                        onBlur={this.handleScopePlanningBlur}
                    />
                </div> ||
                type === Constant.DOC_TYPES.SCOPE_KEYWORD.type &&
                <span style={{ display: 'block' }} onClick={this.handleHeaderClick}>
                    Keywords
                </span> ||
                <span>
                    {headerTitle}
                    {
                        !this.props.unEditable && <a href='#' className='fa template-delete-icon' onClick={this.handleArchive}>&#xf056;  </a>
                    }
                </span>
            }
        </div>
    };

    handleHeaderClick = () => {
        const { data, type, saveTemplateData } = this.props;
        const url = `${type}/${data.id}`;
        saveTemplateData(type, { ...data, enabled: !data.enabled })
    }

    getStepsContainer = () => {
        const disabledClass = this.props.unEditable && 'disable-click-event-customer step-container' || 'step-container'
        return <Step.Group className={disabledClass} size='tiny'>
            {this.getSteps()}
        </Step.Group>
    }

    getSteps = () => {
        const { type, data } = this.props;
        switch (type) {
            case Constant.DOC_TYPES.CUSTOMER_SERVICE_AGREEMENT.type:
                return this.renderCSA(data);

            case Constant.DOC_TYPES.MODIFIED_CUSTOMER_SERVICE_AGREEMENT.type:
            case Constant.DOC_TYPES.MASTER_AGREEMENT.type:
            case Constant.DOC_TYPES.CLIENT_AGREEMENT.type:
            case Constant.DOC_TYPES.PURCHASE_ORDER.type:
                return this.renderAgreement(data);

            case Constant.DOC_TYPES.INVOICE.type:
                return this.renderInvoice(this.getInvoiceAmount(data.selectedScopes));


            case Constant.DOC_TYPES.DRAWINGS.type:
            case Constant.DOC_TYPES.CALCS.type:
            case Constant.DOC_TYPES.CUST_DRAWING.type:
            case Constant.DOC_TYPES.LETTER.type:
            case Constant.DOC_TYPES.TAB_DATA.type:
            case Constant.DOC_TYPES.SCOPE_PLANNING.type:
                return this.renderDrawing(data);

            case Constant.DOC_TYPES.SCOPE_KEYWORD.type:
                return this.renderKeywords(data);
        }
    };

    updateValue = (event) => {
        const { type, data, saveTemplateData } = this.props;
        const { value, id } = event.target;
        let templates = data.templates.map(a => ({ ...a }));
        let payload = null;
        switch (id) {
            case 'poValue':
                let template1 = templates.find(template => template.title === 'PO');
                template1.isDone = value !== '';
                payload = { id: data.id, templates, poValue: value };
                break;
            case 'amountValue':
                if (!isNaN(value)) {
                    let template2 = templates.find(template => template.title === 'Amount');
                    template2.isDone = value !== '';
                    payload = { id: data.id, templates, amountValue: value };
                    saveTemplateData(type, payload);
                    return;
                }
                showWarningNotification('Amount should be Valid Number')
                return
                break;
            case 'headerTitle':
                payload = { ...data, templates, title: value };
                break
        }
        saveTemplateData(type, payload);
    };

    updateCustomKeyword = (event) => {
        const { type, data } = this.props;
        const { value } = event.target;
        let payload = {};
        payload.keyword = { ...data.customKeyword.keyword, title: value };
        payload.scopeKeywordId = data.id;
        const taskInstance = SelectedTaskDetailModel.last();
        if (taskInstance) {
            payload.taskId = taskInstance.props.id;
        }

        updateKeyword(payload).then(result => {
            SelectedTaskDetailModel.updateStore(Constant.DOC_TYPES.SCOPE_KEYWORD.type,
                result.scopeKeyword,
                result.taskId
            );
        })
    }

    getScopesDropDown = ({ selectedScopes }) => {
        const { type } = this.props;
        let value = selectedScopes.filter(scope => !scope.isArchived).map(scope => scope.number);
        return <AntSelect
            mode="multiple"
            showArrow
            disabled={this.props.unEditable}
            onChange={this.handleScopeSelection}
            value={value}
            clearIcon={null}
            removeicon={null}
        >
            {this.props.scopes.filter(scope => !scope.isArchived).map(scope => <Option key={scope.number} >{scope.number}</Option>)}
        </AntSelect>;
    };

    handleScopeSelection = (selectedScopes) => {
        if (selectedScopes.length !== 0) {
            const { data, type, saveTemplateData, scopes } = this.props;
            data.templates.forEach(item => {
                if (item.title.match(/^(Scope: |Scope:)$/)) {
                    item.isDone = true;
                }
            })
            selectedScopes = scopes.filter(scope => selectedScopes.includes(scope.number)).map(scope => scope._id);
            saveTemplateData(type, { id: data.id, selectedScopes: selectedScopes, templates: data.templates })
        } else {
            showFaliureNotification('Select at least One Scope')
        }
    };

    getInvoiceAmount = (scopes) => scopes.reduce(({ amount, scopeNumber }, scope) => {
        if (!scope.scope.isArchived) {
            scopeNumber += ` ${scope.scope.number},`;
            amount += scope.isPartial ? scope.amount : scope.oldPrice;
        }
        return { amount, scopeNumber };
    }, { amount: 0, scopeNumber: '' });

    getinitialProps({ isDone, title, _id }) {
        let klass = isDone ? 'custom-step step-complete' : 'custom-step step-incomplete';
        const { hold, isDownloaded, sent, sentDate, paid } = this.props.data;
        if (title === 'On Hold') {
            if (hold === 'Y') {
                if (isDownloaded) {
                    klass += ' step-on-hold';
                }
            } else {
                title = 'Not On Hold';
            }
        } else if (title === 'Submitted to customer' && paid !== 'Y' && isDone) {
            const agingDays = sent === 'Y' && sentDate !== null && sentDate && paid !== 'Y' ? getDifferanceInDays(Date(), sentDate) - 30 : '-';
            if (agingDays && agingDays > 60) {
                klass += ' step-on-hold';
                title = `Late: ${agingDays} days`;
            }
        }
        return {
            id: _id,
            key: _id,
            className: klass,
            title,
            style: { width: this.props.stepWidth }
        }
    }

    getStepDescription(template, amount, scopeNumber, milestone, checkForIsUpdated) {
        switch (`${template.title}`.trim()) {
            case 'Scope:':
                if (checkForIsUpdated && milestone && !milestone.isUpdated) {
                    return ''
                }
                return checkForIsUpdated && scopeNumber || this.getScopesDropDown(milestone);

            case 'Amount:':     // invoices
                if (checkForIsUpdated && milestone && !milestone.isUpdated) {
                    return ''
                }
                return ` $ ${amount}`;
            case 'Amount':   //PO
                return <span key={milestone.amountValue + 'a'} className='custom-span'>$ <input disabled={this.props.unEditable} type="number" className='custom-input' defaultValue={milestone.amountValue} id='amountValue' onBlur={this.updateValue} /></span>;
            case 'PO':
                return <span key={milestone.poValue + 'b'} className='custom-span'><input disabled={this.props.unEditable} className='custom-input' defaultValue={milestone.poValue} id='poValue' onBlur={this.updateValue} /> </span>;
            case 'Paid':
                if (!template.isDone)
                    return ''
                return formatDate(milestone.paidDate)
            default:
                return ''
        }
    }

    handleArchive = () => {
        const { data: { id }, type, handleArchive } = this.props;
        handleArchive(type, id, true);
    };

    toggleTemplateNodePopup = () => {

    }

    handleStepClick = (e, { title }) => {
        const { data, type, saveTemplateData } = this.props;
        let templates = data.templates.map(a => ({ ...a }));

        const index = templates.findIndex(template => template.title === title);
        if (index === -1) return;

        templates.forEach((template, pos) => {
            if (template.title.match(/^(Scope:|Scope: |PO|Amount)$/)) return;
            if (pos < index) {
                template.isDone = true;
            } else if (pos === index) {
                template.isDone = !template.isDone;
            } else {
                template.isDone = false;
            }
        });
        const url = `${type}/${data.id}`;
        saveTemplateData(type, { id: data.id, templates })
    };

    renderCreateNodePopup = () => <CreateTemplateNode
        addTemplateNode={this.addTemplateNode}
        toggleCreateNodePopup={this.toggleCreateNodePopup}
        title={""}
    />;

    renderAgreement = (agreement) => agreement.templates.map(template => {
        let props = this.getinitialProps(template);
        props.description = this.getStepDescription(template, null, null, agreement);

        if (template.title.match(/^(Draft created|Emailed to customer|MCSA signed|Signed|Email draft created|PO request email sent|PO recieved|PO requested|Received)$/)) {
            props.onClick = this.handleStepClick
        }

        return <CustomStep {...props} />
    });

    handleKeywordClick = (e, { id }) => {
        const { data, type, saveTemplateData } = this.props;
        const scopeKeyword = cloneDeep(data);
        [...scopeKeyword.customKeyword, ...scopeKeyword.itemTypeKeywords].forEach(item => {
            if (item.keyword._id === id) {
                item.isDone = !item.isDone;
            }
        });

        scopeKeyword.enabled = false;
        const url = `${type}/${data.id}`;
        saveTemplateData(type, scopeKeyword);
    }

    renderKeywords = (keywords) => [...keywords.itemTypeKeywords, keywords.customKeyword].map((keyword, index) => {
        let props = this.getinitialProps({ isDone: keyword.isDone, _id: keyword.keyword._id, title: keyword.keyword.title });
        props.onClick = this.handleKeywordClick

        // edtidable field for custom keyword
        if (index === keywords.itemTypeKeywords.length) {
            props.title = '';
            props.onClick = null;
            props.className = keyword.keyword.title !== '' ? 'custom-step step-complete' : 'custom-step step-incomplete';
            props.description = <span key={keyword.keyword.title + keyword.keyword.id} className='custom-span'>
                <input id='customKeyword' disabled={this.props.unEditable} className='custom-input custom-editable-span' defaultValue={keyword.keyword.title} onBlur={this.updateCustomKeyword} />
            </span>;
        }
        return <CustomStep key={keyword._id} {...props} />
    });

    renderCSA = (csa) => csa.templates.map(template => {
        let props = this.getinitialProps(template);
        props.description = this.getStepDescription(template, null, ` ${csa.selectedScopes.filter(scope => !scope.isArchived).map(scope => scope.number).join(', ')}`, csa, true);
        if (template.title.match(/^(Draft created|Emailed to customer|CSA signed)$/)) {
            props.onClick = this.handleStepClick
        }

        return <CustomStep key={template._id} {...props} />
    });

    renderInvoice = ({ amount, scopeNumber }) => this.props.data.templates.map(template => {
        let props = this.getinitialProps(template);
        props.description = this.getStepDescription(template, amount, ` ${scopeNumber.slice(0, -1)}`, this.props.data, true);
        if (template.title === 'Draft created') {
            props.onClick = this.handleStepClick
        }
        return <CustomStep {...props} />
    });

    renderDrawing = (drawing) => drawing.templates && drawing.templates.map(template => {
        let props = this.getinitialProps(template);
        props.description = this.getStepDescription(template, null, null, drawing);
        props.onClick = this.handleStepClick;
        return <CustomStep {...props} />
    });

    render = () => <div className='template-container-new'>
        {this.getHeader()}
        {this.getStepsContainer()}
        {this.state.showCreateTemplateNodePopup && this.renderCreateNodePopup()}
    </div>
}

TemplateNew.propTypes = {
    data: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    handleArchive: PropTypes.func,
    handleDocUpload: PropTypes.func,
    amountValue: PropTypes.number,
    poValue: PropTypes.string,
    disabled: PropTypes.bool
};
