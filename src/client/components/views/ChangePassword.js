import React from 'react';
import { connect } from 'react-redux';
import { Form, Icon, Checkbox, Input, Button } from 'antd';
import {
    Grid,
    Header,
    Modal
} from 'semantic-ui-react'

import LoginAction from '../../actions/LoginAction.js';

import LoginStore from '../../stores/LoginStore.js';
import { UtilModel } from '../../model/AppModels/UtilModel';

import { changeSubmitButtonStyle } from '../../utils/changeBackgroundOfSubmit';

const FormItem = Form.Item;
class PasswordImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getPropsfromStores();
        this.onChange = this.onChange.bind(this);
    }

    getPropsfromStores() {
        return {
            ...LoginStore.getState(),
            confirmDirty: false,
            // iconLoading: false
        }
    }


    enterLoading = () => {
        UtilModel.showLoginLoader(true);
        this.setState({ isLoading: true });
    }
    
    enterIconLoading = () => {
        this.setState({ iconLoading: true });
    }

    onChange(state) {
        this.setState(state);
    }

    componentDidMount() {
        LoginStore.listen(this.onChange);
    }

    componentWillUnmount() {
        LoginStore.unlisten(this.onChange);
    }

    _changePassword = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, formData) => {
            if (!err) {
                this.enterLoading();
                LoginAction.changePassword(formData.newPassword, formData.oldPassword, this.state.user.id)
            }
        });
    }

    _closeSuccessModal() {
        LoginAction.closeSuccessModal();
        this.enterLoading();
    }

    handleConfirmBlur = (e) => {
        const value = e.target.value;
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    }

    validateToNextPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && this.state.confirmDirty) {
            form.validateFields(['confirmPassword'], { force: true });
        }
        callback();
    }

    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('newPassword')) {
            callback('Two passwords that you enter is inconsistent!');
        } else {
            callback();
        }
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        let self = this;
        return (
            <div className='loginDiv'>
                <Header as='h2' content='Change login password'/>
                <Form onSubmit= {this._changePassword} className="login-form" style={{padding: '30px'}}>
                    <div>
                        <FormItem>
                            {getFieldDecorator('oldPassword', {
                            rules: [{ required: true, message: 'Please input your old password!' }],
                            })(
                            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Old Password" />
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('newPassword', {
                            rules: [{ required: true, message: 'Please input your new password!' },{
                                validator: this.validateToNextPassword,
                            }],
                            })(
                            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="New Password" />
                            )}
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('confirmPassword', {
                            rules: [{ required: true, message: 'Please confirm password!' },{
                                validator: this.compareToFirstPassword
                            }],
                            })(
                            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Confirm Password" onBlur={this.handleConfirmBlur} />
                            )}
                        </FormItem>
                    </div>
                    <Button type="primary" style={changeSubmitButtonStyle(this.props.showLoginLoader)} loading={this.props.showLoginLoader} htmlType="submit" className="login-form-button">
                        Change Password
                    </Button>
                </Form>
                {self.state.isChangePasswordSuccess && <Modal open size='small'>
                    <Modal.Header>Success Message</Modal.Header>
                    <Modal.Content>
                        <Header size='medium'>Your password has been changed successfully, Click OK to go to login page</Header>
                    </Modal.Content>
                    <Modal.Actions>
                        {/* <Button primary content='OK' onClick={self._closeSuccessModal.bind(self)}/> */}
                        <Button type="primary" onClick={self._closeSuccessModal.bind(self)}>
                        OK
                    </Button>
                    </Modal.Actions>
                </Modal>
}
            </div>

        );
    }
}

function mapStateToProps() {
    const { showLoginLoader } = UtilModel.getUtilsData();
    return  {
      showLoginLoader
    }
  }

export const ChangePassword = connect(mapStateToProps)(Form.create()(PasswordImpl));
