
import Constant from '../../../components/helpers/Constant';
import { formatDate } from '../../../utils/common';

function getFormatedData(array, { title, type }) {
    const data = [];
    array.forEach(element => {
        if (!element.isArchived) {
            data.push({
                type,
                name: `${title} ${element.number}`,
                date: formatDate(element.createdAt),
                sourceData: element,
                isUpdated: type === Constant.DOC_TYPES.INVOICE.type ? element.isUpdated : true,
                id: element.id
            });
        }
    });
    return data;
}

export function getFormattedTableData(task) {
    const { masterAgreements, modifiedAgreements, purchaseOrders,
        agreements, clientAgreements, invoices, contractor
    } = task;
    const po = contractor.poRequired && getFormatedData(purchaseOrders, Constant.DOC_TYPES.PURCHASE_ORDER) || [];
    const ma = getFormatedData(masterAgreements, Constant.DOC_TYPES.MASTER_AGREEMENT);
    const ca = getFormatedData(clientAgreements, Constant.DOC_TYPES.CLIENT_AGREEMENT);
    const csa = getFormatedData(agreements, Constant.DOC_TYPES.CUSTOMER_SERVICE_AGREEMENT);
    const mcsa = getFormatedData(modifiedAgreements, Constant.DOC_TYPES.MODIFIED_CUSTOMER_SERVICE_AGREEMENT);
    const formatedInvoices = getFormatedData(invoices, Constant.DOC_TYPES.INVOICE);
    // return [...po, ...ma, ...ca, ...csa, ...mcsa, ...formatedInvoices];
    return [...csa, ...mcsa, ...ma, ...ca, ...po, ...formatedInvoices]
}
