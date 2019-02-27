import cloneDeep from 'lodash/cloneDeep';

export function getFormatedInvoiceFormData(scopes = [], invoice, number) {
    if (!invoice) {
        invoice = { ...invoiceObj(scopes), number }
    }
    const orgSelectedScopes = cloneDeep(invoice.selectedScopes);

    invoice.selectedScopes = scopes.map(scope => {
        const oldScope = orgSelectedScopes.find(item => scope.id === item.scope.id);
        if (oldScope) {
            // if (oldScope.scope.price !== oldScope.oldPrice && invoice.isDownloaded) {
            //     oldScope.oldPrice = oldScope.scope.price;
            // }
            if (oldScope.scope.price !== oldScope.oldPrice) {
                oldScope.oldPrice = oldScope.scope.price;
            }
            return { ...oldScope, marked: true };
        }
        return {
            marked: false,
            amount: 0,
            description: scope.definition,
            isPartial: false,
            oldPrice: scope.price,
            isRev: !!scope.parent,
            scope: {
                definition: scope.definition,
                id: scope.id,
                isArchived: scope.isArchived,
                note: scope.note,
                number: scope.number,
                price: scope.price,
                _id: scope._id,
            },
        }
    });
    let totalCost = getTotalCost(invoice.selectedScopes);
    return { ...invoice, totalCost };
}

export function getTotalCost(selectedScopes) {
    let totalCost = 0;
    selectedScopes.forEach(selectedScope => {
        if (selectedScope.marked) {
            if (selectedScope.isPartial) {
                totalCost = totalCost + selectedScope.amount
            } else {
                totalCost = totalCost + selectedScope.oldPrice
            }
        }
    });
    return totalCost;
}

const invoiceObj = (scopes) => {
    return {
        company: '',
        contact: '',
        hold: 'N',
        selectedScopes: [],
        totalCost: 0,
        templates: [
            {
                title: "Scope:",
                isDone: true,
                isAttachment: false
            },
            {
                title: "Amount:",
                isDone: true,
                isAttachment: false
            },
            {
                title: "Draft created",
                isDone: true,
                isAttachment: false
            },
            {
                title: "Submitted to DHC accounting",
                isDone: false,
                isAttachment: false
            },
            {
                title: "On Hold",
                isDone: false,
                isAttachment: false
            },
            {
                title: "Submitted to customer",
                isDone: false,
                isAttachment: false
            },
            {
                "title": "Paid",
                "isDone": false,
                "isAttachment": false
            }
        ]
    }
}
