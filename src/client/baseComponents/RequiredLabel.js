import React from 'react';

export default class RequiredLabel extends React.PureComponent {
    render() {
        const { label } = this.props;
        return (
            <label>
                { label }
                <span className='form-star-field'> *</span>
            </label>
        );
    }
}
