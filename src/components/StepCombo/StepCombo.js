import React, { Component, PropTypes } from 'react';
import { Step } from 'semantic-ui-react';

export default class StepCombo extends Component {
    render() {
        return (
            <div>
                <Step.Group className='step-container' size='tiny' style={{ border: '0.3px solid rgba(34,36,38,.15)' }}>
                    <div className='template-header'>
                        <div style={this.props.style}>
                            <span>
                                {this.props.title}
                            </span>
                            {this.props.removeIcon &&
                                <a
                                    href='#'
                                    className='fa template-delete-icon'
                                    onClick={this.props.handleRemoveInvoice.bind(this, this.props.scope.scope._id, this.props.invoiceID, this.props.invoice_ID)}
                                >
                                    &#xf056;
                                </a>
                            }
                        </div>
                    </div>
                    <Step
                        className={this.props.orange ? 'custom-steps-header-orange' : 'custom-steps-header'}
                        style={{ width: '150px' }}
                    >
                        <Step.Content>
                            <Step.Title style={{ color: '#000' }}>
                                {this.props.value}
                            </Step.Title>
                        </Step.Content>
                    </Step>
                </Step.Group>
            </div>

        );
    }
}

StepCombo.propTypes = {
    title: PropTypes.string,
    value: PropTypes.string,
    style: PropTypes.object,
    removeIcon: PropTypes.boolean,
    handleRemoveInvoice: PropTypes.func,
    scope: PropTypes.object,
    invoiceID: PropTypes.string,
    invoice_ID: PropTypes.string,
    orange: PropTypes.boolean

};

