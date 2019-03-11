import { BaseModel } from '../BaseModel';
import cloneDeep from 'lodash/cloneDeep';
export class InvoiceModel extends BaseModel {
    static resource = 'unique_page_invoices';
    constructor(properties) {
        super(properties);
    }

    static getInvoiceId(id) {
        return cloneDeep(this.get(id));
    }

    static resetInvoice(id) {
        const invoice = this.getInvoiceId(id);
        if (!invoice) {
            return;
        }
        new InvoiceModel(invoice.props).$save()
    }
}