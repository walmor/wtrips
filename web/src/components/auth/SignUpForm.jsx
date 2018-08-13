import React from 'react';
import PropTypes from 'prop-types';
import { Form, Icon, Input, Button, Spin } from 'antd';
import { FormField, withAntdForm } from '../forms';
import AuthError from './AuthError';
import authManager from '../../core/auth-manager';
import debounce from '../../core/debounce';

const propTypes = {
  resetFocus: PropTypes.bool,
  form: PropTypes.object.isRequired,
  signUp: PropTypes.func.isRequired,
  error: PropTypes.string,
  loading: PropTypes.bool,
};

const defaultProps = {
  resetFocus: false,
  error: null,
  loading: false,
};

class SignUpForm extends React.Component {
  constructor() {
    super();
    this.state = {
      emailValidationError: false,
    };
    this.setFieldOptions();
  }

  componentWillUpdate(nextProps) {
    if (!this.props.resetFocus && nextProps.resetFocus) {
      this.firstInput.focus();
    }
  }

  setFieldOptions = () => {
    const name = {
      rules: [{ required: true, whitespace: true, message: 'Enter your name.' }],
    };

    const email = {
      validateFirst: true,
      rules: [
        { required: true, message: 'Enter your email.' },
        { type: 'email', message: 'Enter a valid email.' },
        { validator: debounce(this.validateEmail, 1000) },
      ],
    };

    const password = {
      rules: [{ required: true, whitespace: true, message: 'Enter your password.' }],
    };

    const confirmPassword = {
      rules: [
        { required: true, message: 'Confirm your password.' },
        { validator: debounce(this.validateConfirmPassword, 500) },
      ],
    };

    this.fieldOpts = {
      name,
      email,
      password,
      confirmPassword,
    };
  };

  disableCopyPaste = (field) => {
    field.input.onpaste = () => false;
    field.input.oncopy = () => false;
  };

  shouldShowEmailFeedback = () => {
    const { form } = this.props;

    if (form.isFieldValidating('signupEmail')) {
      return true;
    }

    if (this.state.emailValidationError || form.getFieldError('signupEmail')) {
      return false;
    }

    return form.isFieldTouched('signupEmail');
  };

  handlePasswordChange = () => {
    const { form } = this.props;

    if (form.isFieldTouched('signupConfirmPassword')) {
      form.validateFields(['signupConfirmPassword'], { force: true });
    }
  };

  validateConfirmPassword = (rule, value, callback) => {
    const { getFieldValue } = this.props.form;
    if (value && value !== getFieldValue('signupPassword')) {
      callback('The passwords donʼt match.');
    } else {
      callback();
    }
  };

  validateEmail = async (rule, email, callback) => {
    try {
      this.setState({ emailValidationError: false });

      // TODO: get data from api
      const data = { isEmailAvailable: true };

      if (data.isEmailAvailable) {
        callback();
      } else {
        callback('This email is already in use.');
      }
    } catch (err) {
      // when getting an network error don't show any
      // validation error to the email field
      this.setState({ emailValidationError: true });
      callback();
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.signUp(values.signupName, values.signupEmail, values.signupPassword);
      }
    });
  };

  signUp = async (name, email, password) => {
    try {
      const { data } = await this.props.signUp({
        variables: {
          name,
          email,
          password,
        },
      });

      const token = data.signup;
      authManager.signin(token);
    } catch (err) {
      // do nothing, because the UI will be updated
      // through the error property (this.props.error)
    }
  };

  render() {
    const opts = this.fieldOpts;

    return (
      <Spin spinning={this.props.loading}>
        <Form className="SignUpForm" onSubmit={this.handleSubmit}>
          <FormField id="signupName" options={opts.name}>
            <Input
              prefix={<Icon type="user" />}
              size="large"
              ref={(input) => {
                this.firstInput = input;
              }}
              placeholder="Name"
            />
          </FormField>
          <FormField
            id="signupEmail"
            options={opts.email}
            hasFeedback={this.shouldShowEmailFeedback()}
          >
            <Input prefix={<Icon type="mail" />} size="large" placeholder="Email" />
          </FormField>
          <FormField id="signupPassword" options={opts.password}>
            <Input
              prefix={<Icon type="lock" />}
              size="large"
              type="password"
              placeholder="Password"
              onChange={this.handlePasswordChange}
              ref={this.disableCopyPaste}
            />
          </FormField>
          <FormField id="signupConfirmPassword" options={opts.confirmPassword}>
            <Input
              prefix={<Icon type="lock" />}
              size="large"
              type="password"
              placeholder="Confirm your password"
              ref={this.disableCopyPaste}
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
              {this.props.loading ? 'Signing up...' : 'Sign up'}
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    );
  }
}

SignUpForm.propTypes = propTypes;
SignUpForm.defaultProps = defaultProps;

const SignUpAntdForm = withAntdForm(SignUpForm);

export default SignUpAntdForm;
