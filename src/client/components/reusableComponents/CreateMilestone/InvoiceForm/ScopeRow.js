import { Col, Row } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import React from 'react';

import { PLPCheckbox, PLPInput, PLPPriceInput, PLPPureComponent } from '../../../../baseComponents/importer';

class ScopeRow extends PLPPureComponent {
    handleCheckboxChange = (value, data) => {
        let scopeInvoice = cloneDeep(this.props.scopeInvoice);
        scopeInvoice[data] = value;

        if (data === 'isPartial') {
            if (!value) {
                scopeInvoice.oldPrice = scopeInvoice.scope.price;
            }
            // scopeInvoice.amount = scope.price;
        }
        this.props.onScopeChange(scopeInvoice, scopeInvoice.scope.id);
    };

    handlePriceChange = (value) => {
        let scopeInvoice = cloneDeep(this.props.scopeInvoice);
        if (scopeInvoice.isPartial) {
            if (value >= scopeInvoice.scope.price) return;
            scopeInvoice.amount = value;
        } else {
            scopeInvoice.oldPrice = value;
        }
        this.props.onScopeChange(scopeInvoice, scopeInvoice.scope.id, true);
    };

    handleChange = ({ target }) => {
        const scopeInvoice = { ... this.props.scopeInvoice, description: target.value };
        this.props.onScopeChange(scopeInvoice, scopeInvoice.scope.id);
    };

    render() {
        const { scopeInvoice } = this.props;
        const { marked, description, isPartial, oldPrice, isRev, scope, amount } = scopeInvoice;
        return (
            // <Row key={scopeInvoice.id}>
            <Row key={scopeInvoice.id} gutter={16}>
                <Col className="gutter-row" span={6}>
                    <PLPCheckbox
                        data="marked"
                        label={`${scope.number}-${scope.note}`}
                        onChange={this.handleCheckboxChange}
                        checked={marked}
                        className="gutter-box"
                    />
                </Col>
                <Col className="gutter-row" span={4}>
                    <PLPCheckbox
                        disabled={!marked || isRev}
                        data="isPartial"
                        label={"Partial Bill"}
                        onChange={this.handleCheckboxChange}
                        checked={isPartial}
                        className="gutter-box"
                    />
                </Col>
                <Col className="gutter-row" span={4}>
                    <PLPPriceInput id={"price"} label={"Price"}
                        disabled={!marked}
                        onChange={this.handlePriceChange}
                        value={isPartial ? amount : oldPrice}
                        className="gutter-box"
                    />
                </Col>
                <Col className="gutter-row" span={10}>
                    <PLPInput id={"description"} label={"Description"}
                        disabled={!marked}
                        onChange={this.handleChange}
                        defaultValue={description}
                        className="gutter-box"
                    />
                </Col>
            </Row>
        );
    }
}

export default ScopeRow;
