import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { Modal, Form, Input, Checkbox, Select, Icon } from 'antd';
import FormField from '../forms/FormField';
import { withAntdForm } from '../forms';
import ErrorMessage from '../lib/ErrorMessage';

const { Option } = Select;

class UserModal extends React.Component {
  constructor() {
    super();
    this.state = {
      changingPassword: false,
    };
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.visible && !this.props.visible) {
      // eslint-disable-next-line
      this.setState({
        changingPassword: false,
      });
    }
  }

  getFieldOptions() {
    const user = this.props.user || {};

    const name = {
      initialValue: user.name,
      rules: [{ required: true, whitespace: true, message: 'The name is required.' }],
    };

    const email = {
      initialValue: user.email,
      rules: [
        { required: true, message: 'The email is required.' },
        { type: 'email', message: 'Enter a valid email.' },
      ],
    };

    const isActive = {
      valuePropName: 'checked',
      initialValue: user.isActive,
    };

    const password = {
      rules: [{ required: false, whitespace: true, message: 'Enter your password.' }],
    };

    const confirmPassword = {
      rules: [
        { required: this.state.changingPassword, message: 'Confirm your password.' },
        { validator: this.validateConfirmPassword },
      ],
    };

    const currentPassword = {
      rules: [
        {
          required: this.state.changingPassword,
          whitespace: true,
          message: 'Enter your current password.',
        },
      ],
    };

    const role = {
      initialValue: user.role,
      rules: [{ required: true, message: 'The role is required.' }],
    };

    return {
      name,
      email,
      isActive,
      role,
      password,
      confirmPassword,
      currentPassword,
    };
  }

  handleOk = () => {
    const {
      user, form, onSave, isCurrentUser,
    } = this.props;

    form.validateFields((error, values) => {
      if (!error) {
        const editedUser = {
          _id: user._id,
          name: values.name.trim(),
          email: values.email.trim(),
        };

        if (!isCurrentUser) {
          editedUser.isActive = values.isActive;
          editedUser.role = values.role;
        }

        if (this.state.changingPassword) {
          editedUser.password = values.newPassword;
          editedUser.currentPassword = values.currentPassword;
        }

        onSave(editedUser);
      }
    });
  };

  disableCopyPaste = (field) => {
    field.input.onpaste = () => false;
    field.input.oncopy = () => false;
  };

  handlePasswordChange = (e) => {
    const { form } = this.props;
    this.setState(
      {
        changingPassword: !!e.target.value,
      },
      () => {
        if (form.isFieldTouched('confirmNewPassword')) {
          form.validateFields(['confirmNewPassword'], { force: true });
        }

        if (form.isFieldTouched('currentPassword')) {
          form.validateFields(['currentPassword'], { force: true });
        }
      },
    );
  };

  validateConfirmPassword = (rule, value, callback) => {
    const { getFieldValue } = this.props.form;
    if (value && value !== getFieldValue('newPassword')) {
      callback('The passwords donʼt match.');
    } else {
      callback();
    }
  };

  render() {
    const {
      onCancel, visible, roles, isCurrentUser, isSaving,
    } = this.props;
    const opts = this.getFieldOptions();
    const title = isCurrentUser ? 'My profile' : 'Edit user';

    return (
      <Modal
        title={title}
        width="480px"
        confirmLoading={isSaving}
        destroyOnClose
        visible={visible}
        onCancel={onCancel}
        onOk={this.handleOk}
      >
        <Form layout="horizontal">
          <FormField id="name" options={opts.name}>
            <Input prefix={<Icon type="user" />} placeholder="Name" />
          </FormField>
          <FormField id="email" options={opts.email}>
            <Input prefix={<Icon type="mail" />} placeholder="E-mail" />
          </FormField>
          {!isCurrentUser && (
            <React.Fragment>
              <FormField id="role" options={opts.role}>
                <Select placeholder="Select a role">
                  {Object.entries(roles).map(([key, name]) => (
                    <Option key={key} value={key}>
                      {name}
                    </Option>
                  ))}
                </Select>
              </FormField>
              <FormField id="isActive" options={opts.isActive}>
                <Checkbox>Active</Checkbox>
              </FormField>
            </React.Fragment>
          )}

          {isCurrentUser && (
            <React.Fragment>
              <FormField
                id="newPassword"
                extra="Leave it blank if you don't want to change it."
                options={opts.password}
              >
                <Input
                  prefix={<Icon type="lock" />}
                  type="password"
                  placeholder="New password"
                  onChange={this.handlePasswordChange}
                  ref={this.disableCopyPaste}
                />
              </FormField>
              <FormField id="confirmNewPassword" options={opts.confirmPassword}>
                <Input
                  prefix={<Icon type="lock" />}
                  type="password"
                  placeholder="Confirm your password"
                  ref={this.disableCopyPaste}
                />
              </FormField>
              <FormField
                id="currentPassword"
                extra="To change your password you must inform the current one."
                placeholder="Current password"
                options={opts.currentPassword}
              >
                <Input
                  prefix={<Icon type="lock" />}
                  type="password"
                  placeholder="Current password"
                  ref={this.disableCopyPaste}
                />
              </FormField>
            </React.Fragment>
          )}
          <ErrorMessage message={this.props.error} />
        </Form>
      </Modal>
    );
  }
}

UserModal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,
  error: PropTypes.string,
  user: PropTypes.object,
  isCurrentUser: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  roles: PropTypes.object.isRequired,
};

UserModal.defaultProps = {
  error: null,
  user: null,
};

function mapStateToProps(s) {
  const ued = s.appStore.users.userEditing;
  return {
    visible: ued.isEditing,
    isSaving: ued.isSaving,
    error: ued.error,
    user: ued.user,
    isCurrentUser: ued.isCurrentUser,
    onCancel: ued.cancelEditing,
    onSave: ued.saveUser,
    roles: ued.roles,
  };
}

export default inject(mapStateToProps)(observer(withAntdForm(UserModal)));
