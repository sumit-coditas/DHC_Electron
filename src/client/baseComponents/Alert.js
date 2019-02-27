import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert as AlertPopup } from 'antd';

export default class Alert extends Component {
    render() {
        return (
            <AlertPopup
                type={this.props.type}
                message={this.props.message}
                description={this.props.description}
                showIcon
            />
        );
    }
}

Alert.propTypes = {
    type: PropTypes.string,
    message: PropTypes.string,
    description: PropTypes.string
};

Alert.defaultProps = {
    type: 'success',
    message: 'Success',
    description: ''
};

