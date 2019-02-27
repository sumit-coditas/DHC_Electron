import { CSA_FORM_ARRAY } from './Constants';
import { isNumeric } from '../../../utils/Validation';

export function getCSAFormData(csa) {
    const csaDataObject = CSA_FORM_ARRAY.map((form) => {
        const newForm = {
            checked: csa[form.checkboxField],
            checkBoxTitle: form.checkBoxTitle,
            titleLabel: form.titleLabel,
            textLabel: form.textLabel,
            title: csa[form.titleField],
            text: csa[form.textTitle],
            rows: form.rows,
            textTitle: form.textTitle,
            field: form.checkboxFiel
        };
        return newForm;
    });
    const includeCost = csa.isCostIncluded;
    const selectedScopes = csa.selectedScopes.map(scope => scope._id);
    return { csaDataObject, includeCost, selectedScopes };
}

export function isValidInvoice(contractor, invoice) {
    const makedScopes = invoice.selectedScopes && invoice.selectedScopes.filter(scope => scope.marked) || [];
    const nonPricesScope = makedScopes.find(item => !isNumeric(item.oldPrice));
    return {
        poRequiredError: contractor.poRequired && !invoice.poNumber && 'PO Number' || null,
        includeContactsError: contractor.includeContacts && !invoice.contact && 'Contact Required' || null,
        includeClientJobNoError: contractor.includeClientJobNo && !invoice.clientJobNo && 'Job Number Required' || null,
        scopesError: invoice.selectedScopes && !invoice.selectedScopes.filter(scope => scope.marked).length && 'Select Scope' || null,
        descrptionError: makedScopes.find(item => item.description.trim() == '') && 'Description can not be Empty' || null,
        priceError: nonPricesScope && 'Price Should be Number' || null
    };
}
