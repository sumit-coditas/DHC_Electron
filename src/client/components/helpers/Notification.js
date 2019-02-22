import React, { PureComponent } from 'react';
import { Image, Modal } from 'semantic-ui-react';
import NotificationSystem from 'react-notification-system';

import AppAction from '../../actions/AppAction.js';
import Constant from './Constant.js';
import warning from '../../assets/images/warning.png';

export default class Notification extends PureComponent {
    componentDidMount() {
        if (!this.props.isError && this.props.notificationMessage.length) {
            this.refs.notificationSystem.addNotification({
                message: this.props.notificationMessage,
                level: this.props.noyificationLevel,
                position: 'br',
                autoDismiss: 5,
                onRemove: function () {
                    AppAction.hideNotification();
                }
            });
        }
    }

    render() {
        let self = this;
        let styles = {
            modalHeader: {
                backgroundColor: '#BF1818',
                padding: '1.25rem 1.5rem',
                color: '#FFFFFF'
            }
        };

        return (
            <div>
                {self.props.isError
                    ? <Modal size='small' open={true} onClose={self.props.onErrorClose.bind(self)} closeIcon='close'>
                        <div style={styles.modalHeader}>
                            <Modal.Header>Error</Modal.Header>
                        </div>
                        <Modal.Content image>
                            <Image wrapped size='small' src={warning} />
                            <Modal.Description>
                                <p>{self.props.errorMessage}</p>
                                {
                                    self.props.errorMessage === Constant.NOTIFICATION_MESSAGES.NOTIFICATION_MESSAGE &&
                                    <div className='graytext'>{Constant.NOTIFICATION_MESSAGES.NOTIFICATION_ERROR}</div>
                                }
                            </Modal.Description>
                        </Modal.Content>
                    </Modal>
                    : <NotificationSystem ref='notificationSystem' />
                }
            </div>
        );
    }
}

Notification.propTypes = {
    errorCode: React.PropTypes.number,
    errorMessage: React.PropTypes.string,
    onErrorClose: React.PropTypes.func.isRequired,
    isError: React.PropTypes.bool.isRequired,
    notificationMessage: React.PropTypes.string,
    noyificationLevel: React.PropTypes.string
};

Notification.defaultProps = {
    errorCode: 500,
    errorMessage: 'The server encountered an error processing the request. Please try again, Sorry for the trouble.',
    notificationMessage: ''
};
