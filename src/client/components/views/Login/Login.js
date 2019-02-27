import React from 'react';
import { connect } from 'react-redux';

import { Form, Icon, Input, Button } from 'antd';
import './login.scss';
import LoginAction from '../../../actions/LoginAction.js';

import { UtilModel } from '../../../model/AppModels/UtilModel';

import { changeSubmitButtonStyle } from '../../../utils/changeBackgroundOfSubmit';

const FormItem = Form.Item;

class NormalLoginFormImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          forgotPassword: false
        }
    }
    handleSubmit = (e) => {
      e.preventDefault();
      this.props.form.validateFields((err, formData) => {
        if (!err) {
          this.enterLoading();
          if (!this.state.forgotPassword) {
            LoginAction.login(formData.email, formData.password);
          } else {
            LoginAction.getNewPassword(formData.email);
          }
        }
      });
    }

    changeView = () => {
      this.setState(prevState => ({
        forgotPassword: !prevState.forgotPassword
      }));
    }

    enterLoading = () => {
      UtilModel.showLoginLoader(true);
      this.setState({ loading: true });
    }

    enterIconLoading = () => {
      this.setState({ iconLoading: true });
    }

    render() {
      const { getFieldDecorator } = this.props.form;
      return (
            <div className='login__form'>
              <Form className='form_control' onSubmit= {this.handleSubmit} className="login-form" style={{padding: '30px'}}>
                <FormItem>
                  {getFieldDecorator('email', {
                    rules: [{ required: true, message: 'Please input your email!' }],
                  })(
                    <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Email" />
                  )}
                </FormItem>
                {!this.state.forgotPassword &&
                <div>
                  <FormItem>
                    {getFieldDecorator('password', {
                      rules: [{ required: true, message: 'Please input your Password!' }],
                    })(
                      <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
                    )}
                  </FormItem>
                </div>
                }
                  <FormItem className='login_footer'>
                    <div className="forgot_password">
                      <a className="login-form-forgot" onClick={this.changeView}>{!this.state.forgotPassword ? 'Forgot password?' : 'Back To Login'}</a>
                    </div>
                  </FormItem>
                  <Button type="primary" style={changeSubmitButtonStyle(this.props.showLoginLoader)} loading={this.props.showLoginLoader} htmlType="submit" className="login-form-button">
                  {!this.state.forgotPassword ? 'Login' : 'Get New Password'}
                  </Button>
                <div>
              </div>
              </Form>
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

  export const NewLogin = connect(mapStateToProps)(Form.create()(NormalLoginFormImpl));
