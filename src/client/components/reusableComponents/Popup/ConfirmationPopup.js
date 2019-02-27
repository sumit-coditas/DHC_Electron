import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Loader,
    Dimmer,
    Modal,
    Icon
} from 'semantic-ui-react';
import { Strings } from './Constants';

class ConfirmationPopup extends PureComponent {
    render() {
        const {
            loading,
            title,
            message,
            primaryLable,
            secondaryLable,
            handleCancel,
            handleSuccess
        } = this.props;

        return (
            <Modal size='small' open >
                <Dimmer active={loading} inverted >
                    <Loader />
                </Dimmer>
                <Modal.Header>
                    {title}
                </Modal.Header>
                <Modal.Content>
                    {message}
                </Modal.Content>
                <Modal.Actions>
                    <Button negative icon labelPosition='right' onClick={handleCancel}>
                        {secondaryLable} <Icon name='remove'/>
                    </Button>
                    <Button positive icon labelPosition='right' onClick={handleSuccess} >
                        {primaryLable} <Icon name='checkmark'/>
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

ConfirmationPopup.propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    loading: PropTypes.bool,
    primaryLable: PropTypes.string,
    secondaryLable: PropTypes.string,
    handleCancel: PropTypes.func,
    handleSuccess: PropTypes.func
};

ConfirmationPopup.defaultProps = {
    loading: false,
    primaryLable: Strings.primaryLable,
    secondaryLable: Strings.secondaryLable
};

export default ConfirmationPopup;
