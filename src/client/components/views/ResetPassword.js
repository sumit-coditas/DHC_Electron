import React from 'react';
import { connect } from 'react-redux';

import {Grid, Header, Segment, Message} from 'semantic-ui-react';
import { Form, Icon, Checkbox, Input, Button } from 'antd';

import LoginStore from '../../stores/LoginStore.js';

import LoginAction from '../../actions/LoginAction.js';
import { UtilModel } from '../../model/AppModels/UtilModel';

import { changeSubmitButtonStyle } from '../../utils/changeBackgroundOfSubmit';

const FormItem = Form.Item;
class ResetImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getPropsfromStores();
        this.onChange = this
            .onChange
            .bind(this);
    }

    getPropsfromStores() {
        return {
            ...LoginStore.getState(),
            confirmDirty: false,
        }
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

    _goToLoginPage() {
        LoginAction.goToLoginPage();
    }

    _handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, formData) => {
            if (!err) {
                this.enterLoading();
                LoginAction.resetPassword(formData.newPassword, this.props.params.token);
            }
        });
    }

    enterLoading = () => {
        UtilModel.showLoginLoader(true);
        this.setState({ loading: true });
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
        return (
            <div className='loginDiv'>
                {this.state.isResetPasswordSuccess
                    ? <div width ={4}>
                            <Message info>
                                <Message.Header>Password Changed Successfully!</Message.Header>
                            </Message>
                            <a
                                href=''
                                onClick
                                ={this
                                ._goToLoginPage
                                .bind(this, false)}>Return to login page</a>
                        </div>
                    : <div width ={4}>
                        <Header as='h2' content='Reset Your Password'/>
                        <Form onSubmit= {this._handleSubmit} className="login-form" style={{padding: '30px'}}>
                        <div>
                            <FormItem>
                                {getFieldDecorator('newPassword', {
                                rules: [{ required: true, message: 'Please input your new password!' }, {
                                    validator: this.validateToNextPassword,
                                },
                            {
                                
                            }],
                                })(
                                <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="New Password" />
                                )}
                            </FormItem>
                            <FormItem>
                                {getFieldDecorator('confirmPassword', {
                                rules: [{ required: true, message: 'Please confirm your password!' },
                                    {validator: this.compareToFirstPassword}],
                                })(
                                <Input
                                    prefix={<Icon type="lock"
                                        style={{ color: 'rgba(0,0,0,.25)' }}
                                    />}
                                    type="password"
                                    placeholder="Confirm Password"
                                    onBlur={this.handleConfirmBlur}
                                />
                                )}
                            </FormItem>
                        </div>
                        <Button type="primary" style={changeSubmitButtonStyle(this.props.showLoginLoader)} loading={this.props.showLoginLoader} htmlType="submit" className="login-form-button">
                            Change Password
                        </Button>
                        </Form>
                    </div>
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

export const ResetPassword = connect(mapStateToProps)(Form.create()(ResetImpl));