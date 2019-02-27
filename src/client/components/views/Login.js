import React from 'react';
import {Grid, Header, Form, Segment, Message} from 'semantic-ui-react'

import LoginAction from '../../actions/LoginAction.js';

import LoginStore from '../../stores/LoginStore.js';

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getPropsfromStores();
        this.onChange = this.onChange.bind(this);
    }

    getPropsfromStores() {
        return {
            ...LoginStore.getState()
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

    _validateForm({formData}) {
      var re = /^(([^<>()\[\]\.,;:\s@\']+(\.[^<>()\[\]\.,;:\s@\']+)*)|(\'.+\'))@(([^<>()[\]\.,;:\s@\']+\.)+[^<>()[\]\.,;:\s@\']{2,})$/i;
      let email = formData.email;
      let isValidEmail = re.test(formData.email);
      if(this.state.isForgetPassword){
        if (!email || !isValidEmail) {
            LoginAction.setError({
                email: !email
                    ? 'Enter your email address'
                    : !isValidEmail
                        ? 'Enter valid email address'
                        : ''
            });
            return false;
        }else{
          return true;
        }
      }else{
        let password = formData.password;
        if (!email || !password || !isValidEmail) {
            LoginAction.setError({
                email: !email
                    ? 'Enter your email address'
                    : !isValidEmail
                        ? 'Enter valid email address'
                        : '',
                password: !password
                    ? ' Enter your password'
                    : null
            });
            return false;
        }else{
          return true;
        }
      }
    }

    _handleSubmit(event, {formData}) {
        event.preventDefault();
        LoginAction.isLoading();
        if(this._validateForm({formData})){
          if (this.state.isForgetPassword) {
              LoginAction.getNewPassword(formData.email);
          } else {
              LoginAction.login(formData.email, formData.password);
          }
        }
      }

    _forgetPassword(val) {
        LoginAction.forgetPassword(val);
    }

    _goToLoginPage() {
        LoginAction.goToLoginPage();
    }

    render() {
        let self = this;

        return (
            <div className='loginDiv'>
                <Grid centered>
                    {self.state.isNewPasswordSuccess
                        ? <Grid.Column width ={4}>
                                <Message info>
                                    <Message.Header>We sent you link on your email account to reset your password</Message.Header>
                                </Message>
                                <a href='#' onClick ={self._goToLoginPage.bind(self, false)}>Return to login page</a>
                            </Grid.Column>
                        : <Grid.Column width ={4}>
                            <Header as='h2' content={!self.state.isForgetPassword
                                ? 'Log-in to your account'
                                : 'Forgot your password?'}/>
                              <Form onSubmit={self._handleSubmit.bind(self)} error loading={self.state.isLoading}>
                                <Segment stacked secondary>
                                    <Form.Field>
                                        <Form.Input name='email' placeholder='E-mail address' icon='user' iconPosition='left'/>
                                    </Form.Field>
                                    {self.state.error.email
                                        ? <Message error content={self.state.error.email}/>
                                        : null
                                      }
                                    {!self.state.isForgetPassword
                                        ? <Form.Field>
                                                <Form.Input name='password' placeholder='Password' type='password' icon='lock' iconPosition='left'/>
                                            </Form.Field>
                                        : null}
                                    {self.state.error.password
                                        ? <Message error content={self.state.error.password}/>
                                        : null
                                      }
                                    <Form.Field>
                                        <Form.Button fluid content={!self.state.isForgetPassword
                                            ? 'Login'
                                            : 'Get New Password'} size='large' color='teal'/>
                                    </Form.Field>
                                    {!self.state.isForgetPassword
                                        ? <a href='#' onClick ={self._forgetPassword.bind(self, true)}>Forgot password</a>
                                        : <a href='#' onClick ={self._forgetPassword.bind(self, false)}>Return to login page</a>}
                                </Segment>
                            </Form>
                        </Grid.Column>
}
                </Grid>
            </div>
        );
    }
}
