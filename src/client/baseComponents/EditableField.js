import React, { PropTypes } from 'react';

export default class EditableField extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            value: props.value
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.value !== nextProps.value) {
            this.setState({ value: nextProps.value });
        }
    }

    handleChange = (event) => {
        this.setState({ value: event.target.value });
    };

    render() {
        const { stepWidth, headerWidth, symbol, title, readOnly, updateValue, value } = this.props;
        return (<div className='editable-field'>
            <div className='template-header' style={{ width: headerWidth, textAlign: 'center' }}>
                <span> {title} </span>
            </div>
            <div style={{ width: stepWidth, textAlign: 'center' }}>
                <span >
                    {symbol}
                    <input className='custom-input' id={title} value={this.state.value} onChange={this.handleChange} onBlur={updateValue} readOnly={readOnly} />
                </span>
            </div>
        </div>);
    }
}

EditableField.propTypes = {
    title: PropTypes.string.isRequired,
    updateValue: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([PropTypes.number.isRequired, PropTypes.string.isRequired]),
    symbol: PropTypes.string,
    stepWidth: PropTypes.string,
    readOnly: PropTypes.oneOfType([PropTypes.bool, PropTypes.null])
};
