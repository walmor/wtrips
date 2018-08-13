import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';
import FormContext from './form-context';

const withFormContext = (Component) => {
  const fc = (props) => {
    const { form } = props;

    return (
      <FormContext.Provider value={form}>
        <Component {...props} />
      </FormContext.Provider>
    );
  };

  fc.propTypes = {
    form: PropTypes.object.isRequired,
  };

  return fc;
};

const withAntdForm = component => Form.create()(withFormContext(component));

export default withAntdForm;
