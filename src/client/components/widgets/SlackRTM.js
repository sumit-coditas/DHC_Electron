import React, { Component, PropTypes } from 'react';
import slack from 'slack';

import LoginAction from '../../actions/LoginAction.js';

export default class SlackRTM extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let { accessToken } = this.props;
        if (accessToken) {
            let client = slack
                .rtm
                .client();
            client.listen({
                token: accessToken
            });

            slack
                .rtm
                .start({
                    token: accessToken
                }, (err, data) => {
                    if (!err) {
                        if (data.ok) {
                            LoginAction.setUnreadMessages(data);
                        }
                    }
                });

            client.message((msg) => {
                LoginAction.setRecievedMessage(msg);
            });

            client.im_marked((im) => {
                LoginAction.setReadMessages(im);
            });

            client.im_created((event) => {
                LoginAction.addNewIm(event.channel);
            });

            client.channel_marked((channel) => {
                LoginAction.setChannelMarked(channel);
            });
        }
    }

    render() {
        return (<div/>);
    }
}

SlackRTM.propTypes = {
    accessToken: PropTypes.string.isRequired
};
