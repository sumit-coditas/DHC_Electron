import { getNewScopeSkelton } from '../projectDetailNew/util';
import Constant from '../../helpers/Constant';

export function getDefaultScope(scopes = [], taskGroup, loggedInUser) {
    let engineer = null, managerDetails = null;
    const isEngineerOrManager = loggedInUser.role.name === 'Engineer' || loggedInUser.role.name === 'Manager';
    engineer = isEngineerOrManager ? {
        id: loggedInUser._id,
        firstName: loggedInUser.firstName,
        lastName: loggedInUser.lastName,
        name: loggedInUser.firstName + ' ' + loggedInUser.lastName
    } : null;
    managerDetails = {
        manager: {
            id: loggedInUser._id,
            firstName: loggedInUser.firstName,
            lastName: loggedInUser.lastName,
            name: loggedInUser.firstName + ' ' + loggedInUser.lastName
        }
    };
    const group = { id: taskGroup.id, _id: taskGroup.id };
    const isFromTaskGroup = taskGroup.id === Constant.TASK_GROUP__ID.TASKS;
    const scope = getNewScopeSkelton(scopes, engineer, null, { managerDetails, group, isFromTaskGroup  });
    return scope;
}

export function extractPersonalNotes(personalNotes) {
    let extractedPersonalNotes = {};
    if (personalNotes && personalNotes.length > 0) {
        personalNotes = personalNotes.split(';');
        for (let i = 0; i < personalNotes.length; i++) {
            let keyValue = personalNotes[i].split(':');
            switch (keyValue[0].trim()) {
            case 'Company':
                extractedPersonalNotes.company = keyValue[1].trim();
                break;

            case 'Bill Branch':
                extractedPersonalNotes.billBranch = keyValue[1].trim();
                break;

            case 'PO Required':
                extractedPersonalNotes.poRequired = keyValue[1].trim();
                break;

            case 'Include Contact':
                extractedPersonalNotes.includeContacts = keyValue[1].trim();
                break;

            case 'Invoice Contact':
                extractedPersonalNotes.invoiceContact = keyValue[1].trim();
                break;

            case 'Include Client Job Number':
                extractedPersonalNotes.includeClientJobNo = keyValue[1].trim();
                break;

            case 'Contract':
                extractedPersonalNotes.contract = keyValue[1].trim();
                break;
            }
        }
    }

    const obj = {
        company: extractedPersonalNotes.company && extractedPersonalNotes.company.length > 0 ? extractedPersonalNotes.company : '',
        billBranch: extractedPersonalNotes.billBranch && extractedPersonalNotes.billBranch.length > 0 ? extractedPersonalNotes.billBranch : '',
        poRequired: extractedPersonalNotes.poRequired && extractedPersonalNotes.poRequired.toLowerCase() === 'yes' ? true : false,
        includeContacts: extractedPersonalNotes.includeContacts && extractedPersonalNotes.includeContacts.toLowerCase() === 'yes' ? true : false,
        invoiceContact: extractedPersonalNotes.invoiceContact && extractedPersonalNotes.invoiceContact ? extractedPersonalNotes.invoiceContact : '',
        includeClientJobNo: extractedPersonalNotes.includeClientJobNo && extractedPersonalNotes.includeClientJobNo.toLowerCase() === 'yes' ? true : false,
        contract: extractedPersonalNotes.contract && extractedPersonalNotes.contract ? extractedPersonalNotes.contract : ''
    };
    return obj;
}
