import React from 'react';
import { inject } from 'mobx-react';
import PropTypes from 'prop-types';
import { Form, Icon, Input, Button, Spin } from 'antd';
import { FormField, withAntdForm } from '../forms';
import AuthError from './AuthError';

const emailOpts = {
  rules: [
    { required: true, message: 'Enter your email.' },
    { type: 'email', message: 'Enter a valid email.' },
  ],
};

const passwordOpts = {
  rules: [{ required: true, message: 'Enter your password.' }],
};

const propTypes = {
  resetFocus: PropTypes.bool,
  form: PropTypes.object.isRequired,
  error: PropTypes.string,
  loading: PropTypes.bool,
  onSignIn: PropTypes.func.isRequired,
};

const defaultProps = {
  resetFocus: false,
  error: null,
  loading: false,
};

class SignInForm extends React.Component {
  componentWillUpdate(nextProps) {
    if (!this.props.resetFocus && nextProps.resetFocus) {
      this.firstInput.focus();
    }
  }

  onFormSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.onSignIn(values.signinEmail, values.signinPassword);
      }
    });
  };

  render() {
    return (
      <Spin spinning={this.props.loading}>
        <Form className="SignInForm" onSubmit={this.onFormSubmit}>
          <FormField id="signinEmail" options={emailOpts}>
            <Input
              prefix={<Icon type="mail" />}
              size="large"
              autoFocus
              ref={(input) => {
                this.firstInput = input;
              }}
              placeholder="Email"
            />
          </FormField>
          <FormField id="signinPassword" options={passwordOpts}>
            <Input
              prefix={<Icon type="lock" />}
              size="large"
              type="password"
              placeholder="Password"
            />
          </FormField>
          <AuthError message={this.props.error} />
          <Form.Item>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              className="u-inlineBlock u-sizeFill"
            >
              {this.props.loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    );
  }
}

SignInForm.propTypes = propTypes;
SignInForm.defaultProps = defaultProps;

function mapStateToProps(s) {
  const { auth } = s.appStore;
  return {
    onSignIn: auth.signIn.bind(auth),
    loading: auth.loading,
    error: auth.signInError,
  };
}

export default inject(mapStateToProps)(withAntdForm(SignInForm));
