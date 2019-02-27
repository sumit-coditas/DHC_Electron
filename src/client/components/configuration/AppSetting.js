import React, { PureComponent } from 'react';
import find from 'lodash/find';
import cloneDeep from 'lodash/cloneDeep';
import map from 'lodash/map';
import { Table, Grid, Header, Segment, Button, Icon, Form, Message } from 'semantic-ui-react';

import Constant from './../helpers/Constant.js';
import ReadAccess from './../helpers/ReadAccess.js';
import WriteAccess from './../helpers/WriteAccess.js';

import AppStore from './../../stores/AppStore.js';

import AppAction from './../../actions/AppAction.js';

export default class AppSetting extends PureComponent {
    constructor(props) {
        super(props);
        this.state = this.getPropsfromStores();
        this.onChange = this.onChange.bind(this);
    }

    getPropsfromStores() {
        let state = {
            AppStore: AppStore.getState()
        };
        return state;
    }

    onChange(state) {
        const newState = cloneDeep(this.state);
        newState[state.displayName] = cloneDeep(state);
        this.setState(newState);
    }

    componentDidMount() {
        AppStore.listen(this.onChange);
    }

    componentWillUnmount() {
        AppStore.unlisten(this.onChange);
        this._closeAttachmentForm();
        this._closeContractorsForm();
    }

    _updateTaskSetting(event, data) {
        AppAction.setAttachmentLoader();
        let setting = {};
        setting[data.name] = data.checked;
        AppAction.updatedAppSetting(setting);
    }

    _showAddAttachmentForm() {
        AppAction.showAddAttachmentForm();
    }

    _showUpdateAttachmentForm(attachment) {
        AppAction.showUpdateAttachmentForm(attachment);
    }
    _showUpdateContractorsForm() {
        AppAction.showUpdateContractorsForm();
    }

    _closeAttachmentForm() {
        AppAction.closeAttachmentForm();
    }

    _closeContractorsForm() {
        AppAction.closeContractorsForm();
    }

    _handleChangeAttachment(event) {
        AppAction.changeAttachment(event.target.value.trim());
    }

    _handleSubmit(event) {
        event.preventDefault();
        let attachment = this.state.AppStore.attachment;
        if (this._validateForm(attachment)) {
            AppAction.setAttachmentLoader();
            let attachments = this.state.AppStore.appSettings.attachments;
            if (this.state.AppStore.isAddAttachment) {
                attachments.push({
                    name: attachment.name
                });
                let setting = {
                    attachments: attachments
                };
                AppAction.updatedAppSetting(setting);
            } else {
                let updatingAttachment = find(attachments, {
                    _id: this.state.AppStore.attachment._id
                });

                if (updatingAttachment) {
                    updatingAttachment.name = attachment.name;
                }

                let setting = {
                    attachments: attachments
                };
                AppAction.updatedAppSetting(setting);
            }
        }
    }

    _handleSubmitContractorForm(event, { formData }) {
        event.preventDefault();
        AppAction.setContractorsFormLoader();
        let formName = formData.name.trim();
        if (!formName) {
            AppAction.setContractorsFormError({
                name: 'Please enter form name.'
            });
            return;
        } else if (formName.length > 50) {
            AppAction.setContractorsFormError({
                name: 'Name should be less than 50 characters.'
            });
            return;
        }
        AppAction.setAttachmentError({
            name: ''
        });
        let setting = {
            taskFormName: formName
        };
        AppAction.updatedAppSetting(setting);
    }

    _validateForm(attachment) {
        let self = this;
        let duplicateName = find(self.state.AppStore.appSettings.attachments, (existingAttachment) => {
            if (existingAttachment._id === self.state.AppStore.attachment._id) {
                return false;
            }
            return existingAttachment.name.trim().toLowerCase().replace(/\s+/g, '') === attachment.name.trim().toLowerCase().replace(/\s+/g, '');
        });
        let attachmentName = attachment.name.replace(/[\s]+/g, '');
        if (!attachmentName) {
            AppAction.setAttachmentError({
                name: 'Please enter attachment name.'
            });
            return false;
        } else if (duplicateName) {
            AppAction.setAttachmentError({
                name: 'Name already exists.'
            });
            return false;
        } else if (attachment.name.length > 50) {
            AppAction.setAttachmentError({
                name: 'Name should be less than 50 characters.'
            });
            return false;
        }
        AppAction.setAttachmentError({
            name: ''
        });
        return true;
    }

    render() {
        let self = this;
        let appState = self.state.AppStore;
        let attachments = [];

        let canViewAttachment = ReadAccess.hasAccess(Constant.PERMISSIONS.MANAGE_APP.NAME);
        let canWriteAttachment = WriteAccess.hasAccess(Constant.PERMISSIONS.MANAGE_APP.NAME);

        attachments = map(appState.appSettings.attachments, (attachment, index) => {
            return (
                <Table.Row key={'attachment' + index}>
                    <Table.Cell>
                        {attachment.name}
                    </Table.Cell>
                    <Table.Cell textAlign='center'>
                        {canWriteAttachment ?
                            <Button icon onClick={self._showUpdateAttachmentForm.bind(self, attachment)}>
                                <Icon name='edit' />
                            </Button> :
                            null
                        }
                    </Table.Cell>
                </Table.Row>
            );
        });

        let contractorForm =
            (<Table.Row>
                <Table.Cell>
                    {appState.appSettings.taskFormName}
                </Table.Cell>
                <Table.Cell textAlign='center'>
                    <Button icon onClick={self._showUpdateContractorsForm.bind(self)}>
                        <Icon name='edit' />
                    </Button>
                </Table.Cell>
            </Table.Row >
            );

        return (
            <Grid centered>
                {canViewAttachment ?
                    <Grid.Column >
                        <Segment size='large' disabled={appState.isAttachmentLoading} loading={appState.isAttachmentLoading}>
                            <Header as='h3' content='Attachments' />
                            {appState.showAttachmentForm
                                ? <Segment stacked secondary>
                                    <Form error onSubmit={self._handleSubmit.bind(self)}>
                                        <Form.Group widths='equal'>
                                            <Form.Field>
                                                <Form.Input label='Attachment Name' value={appState.attachment.name} name='name' onChange={self._handleChangeAttachment.bind(self)} />
                                                {appState.attachmentError.name && <Message error content={appState.attachmentError.name} />}
                                            </Form.Field>
                                        </Form.Group>
                                        <Button primary type='submit'>
                                            {appState.isAddAttachment
                                                ? 'Add'
                                                : 'Save'}
                                        </Button>
                                        <Button secondary type='reset' onClick={self._closeAttachmentForm.bind(self)}>Cancel</Button>
                                    </Form>
                                </Segment>
                                :
                                canWriteAttachment ?
                                    <Button primary={true} onClick={self._showAddAttachmentForm.bind(self)}>Add new Attachment</Button> :
                                    null

                            }
                            <Table celled structured>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>Name</Table.HeaderCell>
                                        <Table.HeaderCell textAlign='center'>Edit</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {attachments}
                                </Table.Body>
                            </Table>
                        </Segment>

                        <Segment size='large' disabled={appState.isContractorsFormLoading} loading={appState.isContractorsFormLoading}>
                            <Header as='h3' content='Contractor&#39;s Form Name' />
                            {appState.showContractorsForm &&
                                <Segment stacked secondary>
                                    <Form error onSubmit={self._handleSubmitContractorForm.bind(self)}>
                                        <Form.Group widths='equal'>
                                            <Form.Field>
                                                <Form.Input label='Contractors Form Name' defaultValue={appState.appSettings.taskFormName} name='name' />
                                                {appState.contractorsFormError.name && <Message error content={appState.contractorsFormError.name} />}
                                            </Form.Field>
                                        </Form.Group>
                                        <Button primary type='submit'>Save</Button>
                                        <Button secondary type='reset' onClick={self._closeContractorsForm.bind(self)}>Cancel</Button>
                                    </Form>
                                </Segment>
                            }
                            <Table celled structured>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>Name</Table.HeaderCell>
                                        <Table.HeaderCell textAlign='center'>Edit</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {contractorForm}
                                </Table.Body>
                            </Table>
                        </Segment>
                    </Grid.Column > :
                    null
                }
            </Grid >

        );
    }
}
