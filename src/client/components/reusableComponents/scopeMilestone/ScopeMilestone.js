import './scopeMilestone.scss';

import { Modal, Tooltip } from 'antd';
import React from 'react';

import EditableField from '../../../baseComponents/EditableField';
import { PLPPureComponent } from '../../../baseComponents/importer';
import { CustomerHomeModel } from '../../../model/CustomerHomeModels/CustomerHomeModel';
import { ScopeModel } from '../../../model/CustomerHomeModels/ScopeModel';
import { showConfirmationModal } from '../../../utils/cofirmationModal';
import { showFaliureNotification, showSuccessNotification, showWarningNotification } from '../../../utils/notifications';
import { addRevScope } from '../../../utils/promises/ScopePromises';
import Constant, { DOC_TYPES } from '../../helpers/Constant';
import TaskGroupDropdown from '../../reusableComponents/TaskGroupDropdown/';
import { MemberProfileMenuIcon } from '../MemberProfileMenuIcon';
import { getDHCTeam, getDrafterHours, getEngineerHours, getSelectedInvoices, getSelectedRevInvoices, filterAllGreenMilestone } from '../scopeTableNew/ScopeTableUtils';
import TemplateNew from '../Template/TemplateNew';
import TeamDropDownRenderer from '../scopeTableNew/cellRenderers/TeamDropDownRenderer';

const confirm = Modal.confirm;

export default class ScopeMilestone extends PLPPureComponent {

    updateValue = (event) => {
        if (this.props.unEditable) return
        const { id, value } = event.target;
        switch (id) {
            case 'Fee':
                if (isNaN(value)) {
                    showWarningNotification('Fee amount should be a number.');
                    this.forceUpdate();
                } else {
                    this.props.updateScope(this.props.scope.id, { price: value });
                }
                break;
        }
    };

    handleArchiveScope = () => {
        const { scope, handleArchive } = this.props;
        const type = DOC_TYPES.SCOPE.type;
        const title = 'Archive Scope ?', content = scope.number.includes('-') ? `Are you sure you want to archive ${scope.number} Scope? ` : `Are you sure you want to archive ${scope.number} Scope? This action will archive all rev scopes of ${scope.number} scope.`;
        showConfirmationModal(title, content, () => handleArchive(type, scope.id, true, scope._id));
    };

    handleAddRevScope = () => {
        const { scope } = this.props;
        const title = 'Create Revision Scope', content = `Are you sure you want to create revision scope for ${scope.number} Scope?`;
        showConfirmationModal(title, content, this.createRevScope);
    };

    createRevScope = async () => {
        const { scope } = this.props;
        return addRevScope(scope)
            .then(({ data }) => {
                // showSuccessNotification('Revision scope has been created successfully');
                ScopeModel.addNewScopes([data]);
            })
            .catch((e) => {
                console.log('createRevScope error', e);
                showFaliureNotification('Error in creating revision scope. Please try again.');
            });
    };

    renderArchiveIcon = () => {
        const { scope } = this.props;
        return scope.number !== "A" && <Tooltip title="Archive scope">
            <a className="fa color-primary" onClick={this.handleArchiveScope}>
                &#xf056;
        </a>
        </Tooltip>
    };

    renderAddRevScopeIcon = () => {
        const { scope } = this.props;
        return !scope.parent && <Tooltip title="Add revision scope">
            <a className="fa color-primary" onClick={this.handleAddRevScope}>
                &#xf055;
        </a>
        </Tooltip>;
    };

    renderHeaderSection = () => {
        const { scope, headerWidth, unEditable } = this.props;
        return <div className='header' style={{ borderTop: !this.props.isMarginRequired ? 'unset' : '1px solid', width: headerWidth }}>
            <div className='title'>Scope {scope.number}</div>
            {!scope.parent && <div>{scope.note}</div>}
            <div className="scope_utils_wrapper margin-top-15">
                <div className="scope_action margin-top5">
                    {!unEditable && this.renderArchiveIcon()}
                    {!unEditable && this.renderAddRevScopeIcon()}
                </div>
                <TaskGroupDropdown
                    taskId={this.props.taskId}
                    scope={scope}
                    handleCongratulationsPopup={this.props.handleCongratulationsPopup}
                    disabled={this.props.unEditable}
                />
            </div>
        </div>
    };


    getTeam = () => {
        const { headerWidth, stepWidth, scope, taskId } = this.props;
        const { managerName, managerEmail, managerImage, engineerName, engineerEmail, engineerImage,
            drafterName, drafterEmail, drafterImage } = getDHCTeam(scope);
        return <div className="team-view">
            <div className='template-header' style={{ width: headerWidth }}>
                <span> Team </span>
            </div>
            {this.props.unEditable && <div className='team' style={{ width: stepWidth }}>
                <MemberProfileMenuIcon photo={managerImage} email={managerEmail} name={managerName} />
                <MemberProfileMenuIcon photo={engineerImage} email={engineerEmail} name={engineerName} />
                <MemberProfileMenuIcon photo={drafterImage} email={drafterEmail} name={drafterName} />
                {this.props.unEditable && this.getCustomer()}
            </div> ||
                <div className="team" style={{ width: stepWidth }}>
                    <TeamDropDownRenderer
                        value={{ ...getDHCTeam(scope), taskId }}
                        data={scope}
                    />
                </div>
            }
        </div>;
    };

    getCustomer = () => {
        const instance = CustomerHomeModel.get(this.props.contractorId);
        if (!instance) return <div />;
        const { email, name, photo } = instance.props;
        return <MemberProfileMenuIcon
            photo={photo}
            email={email}
            name={name}
        />
    };

    getNoteCssClass = (invoice) => {
        if (invoice.type === 'parent' && !invoice.isPartial && invoice.oldPrice !== this.props.scope.price) return ' step-on-hold';
        return '';
    }

    getInvoice = (invoice, headerWidth, stepWidth) => <div key={invoice._id} className='invoice-data'>
        <div className='template-header' style={{ width: headerWidth, textAlign: headerWidth === stepWidth ? 'center' : 'right' }} >
            <span> Inv. - Amount </span>
        </div>
        <div className='value-section' style={{ width: stepWidth, textAlign: 'center' }}>
            {`${invoice.number} - $ ${invoice.isPartial ? invoice.amount : invoice.oldPrice}`}
        </div>
        <div className='template-header' style={{ width: stepWidth, textAlign: 'center', marginRight: 0 }}>
            <span> Notes </span>
        </div>
        <div className={`value-section${this.getNoteCssClass(invoice)}`} style={{ width: stepWidth, textAlign: 'center' }}>
            {invoice.type === 'parent' ? (invoice.isPartial ? 'Partial' : 'Full Scope Bill') : `Rev ${invoice.scope.number.split('-').pop()}`}
        </div>
    </div>;

    renderInvoiceSection = () => <div className='invoice-section'>
        {[
            ...getSelectedInvoices(this.props.invoices, this.props.scope._id),
            ...getSelectedRevInvoices(this.props.invoices, this.props.scope._id)
        ].map((invoice, index) => this.getInvoice(invoice, this.props.headerWidth, this.props.stepWidth))
        }
    </div>;

    renderTemplate = (index, item, { type, title }) => <TemplateNew
        key={index}
        type={type}
        headerTitle={`${title} ${item.number}`}
        headerWidth={this.props.headerWidth}
        stepWidth={this.props.stepWidth}
        data={item}
        handleArchive={this.props.handleArchive}
        unEditable={this.props.unEditable}
        scopes={this.props.scopes}
        saveTemplateData={this.props.saveTemplateData}
    />;

    renderDetailHeader = () => <div className='detail-section'>
        {this.getTeam()}
        {!this.props.isTask && <EditableField
            title='Fee'
            stepWidth={this.props.stepWidth}
            headerWidth={this.props.stepWidth}
            value={this.props.scope.price}
            updateValue={this.updateValue}
            symbol='$'
            readOnly={this.props.unEditable}
        />}
        {!this.props.isTask && <EditableField
            title='Total Billed'
            stepWidth={this.props.stepWidth}
            headerWidth={this.props.headerWidth}
            value={[
                ...getSelectedInvoices(this.props.invoices, this.props.scope._id),
                ...getSelectedRevInvoices(this.props.invoices, this.props.scope._id)
            ].reduce((total, invoice) => total + (invoice.isPartial ? invoice.amount : invoice.oldPrice), 0)
            }
            updateValue={this.updateValue}
            symbol='$'
            readOnly
        />}
        {!this.props.unEditable && [
            <EditableField
                title='Total Eng. Hrs.'
                stepWidth={this.props.stepWidth}
                headerWidth={this.props.stepWidth}
                value={getEngineerHours(this.props.scope.hourTrackers)}
                updateValue={this.updateValue}
                symbol=''
                readOnly
            />,
            <EditableField
                title='Total Drft. Hrs.'
                stepWidth={this.props.stepWidth}
                headerWidth={this.props.headerWidth}
                value={getDrafterHours(this.props.scope.hourTrackers)}
                updateValue={this.updateValue}
                symbol=''
                readOnly
            />
        ]}
    </div>;

    renderDetailSection = () => <div className='detail-container'>
        {this.renderDetailHeader()}
        {!this.props.scope.parent && !this.props.isTask && this.renderInvoiceSection()}
        {!this.props.isTask && this.props.scope.drawings.filter(item => !item.isArchived && (!this.props.hideAllGreenMilestones || filterAllGreenMilestone(item))).map((drawing, index) => this.renderTemplate(index, drawing, Constant.DOC_TYPES.DRAWINGS))}
        {!this.props.isTask && this.props.scope.custDrawings.filter(item => !item.isArchived && (!this.props.hideAllGreenMilestones || filterAllGreenMilestone(item))).map((custDrawing, index) => this.renderTemplate(index, custDrawing, Constant.DOC_TYPES.CUST_DRAWING))}
        {!this.props.isTask && this.props.scope.calcs.filter(item => !item.isArchived && (!this.props.hideAllGreenMilestones || filterAllGreenMilestone(item))).map((calc, index) => this.renderTemplate(index, calc, Constant.DOC_TYPES.CALCS))}
        {!this.props.isTask && this.props.scope.letters.filter(item => !item.isArchived && (!this.props.hideAllGreenMilestones || filterAllGreenMilestone(item))).map((letter, index) => this.renderTemplate(index, letter, Constant.DOC_TYPES.LETTER))}
        {!this.props.isTask && this.props.scope.tabData.filter(item => !item.isArchived && (!this.props.hideAllGreenMilestones || filterAllGreenMilestone(item))).map((tabData, index) => this.renderTemplate(index, tabData, Constant.DOC_TYPES.TAB_DATA))}
        {!this.props.hideKeywordSection && !this.props.isTask && this.props.scope.scopeKeywords.filter(item => !item.isArchived).map((scopeKeyword, index) => this.renderTemplate(index, scopeKeyword, Constant.DOC_TYPES.SCOPE_KEYWORD))}
        {this.props.isTask && this.props.scope.scopePlannings.filter(item => !item.isArchived && (!this.props.hideAllGreenMilestones || filterAllGreenMilestone(item))).map((scopePlanning, index) => this.renderTemplate(index, scopePlanning, Constant.DOC_TYPES.SCOPE_PLANNING))}
    </div>;

    render = () => {
        const marginRequired = this.props.isMarginRequired && 'margin-top-10' || ''
        return <div className={'scope-miestone-container ' + marginRequired}>
            {this.renderHeaderSection()}
            {this.renderDetailSection()}
        </div>
    }
}

ScopeMilestone.propTypes = {
};
