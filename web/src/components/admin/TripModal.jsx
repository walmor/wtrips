import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import { Modal, Form, Input, DatePicker, Col, Select, Icon, Row } from 'antd';
import FormField from '../forms/FormField';
import config from '../../core/config';
import { withAntdForm } from '../forms';
import ErrorMessage from '../lib/ErrorMessage';
import UserSelector from './UserSelector';
import FieldLabel from '../lib/FieldLabel';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

class TripModal extends React.Component {
  constructor() {
    super();
    this.state = {
      showUserSelector: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.visible && this.props.visible) {
      const trip = this.getTrip();
      // eslint-disable-next-line
      this.setState({
        showUserSelector: !trip.belongsToCurrUser,
      });
    }
  }

  getTrip() {
    return this.props.trip || { belongsToCurrUser: true };
  }

  getFieldOptions() {
    const trip = this.getTrip();

    const destination = {
      initialValue: trip.destination,
      rules: [{ required: true, whitespace: true, message: 'The destination is required.' }],
    };

    const startDate = trip.startDate ? moment(trip.startDate) : undefined;
    const endDate = trip.endDate ? moment(trip.endDate) : undefined;
    const dates = startDate && endDate ? [startDate, endDate] : undefined;

    const dateRange = {
      initialValue: dates,
      rules: [{ type: 'array', required: true, message: 'The start and end dates are required.' }],
    };

    const comment = {
      initialValue: trip.comment,
    };

    const traveler = {
      initialValue: trip.belongsToCurrUser ? 'me' : 'other',
    };

    const user = {
      validateTrigger: 'onSelect',
      rules: [{ validator: this.validateUser, message: 'Select an user.' }],
    };

    return {
      destination,
      startDate,
      dateRange,
      comment,
      traveler,
      user,
    };
  }

  validateUser = (rule, value, cb) => {
    if (this.state.showUserSelector && !this.props.userSelector.selectedUser) {
      cb(false);
    } else {
      cb();
    }
  };

  handleOk = () => {
    const { form, onSave, canManageUserTrips } = this.props;

    const trip = this.getTrip();

    form.validateFields((error, values) => {
      if (!error) {
        const editedTrip = {
          _id: trip._id,
          destination: values.destination.trim(),
          startDate: values.dateRange[0].toDate(),
          endDate: values.dateRange[1].toDate(),
          comment: values.comment ? values.comment.trim() : null,
        };

        if (canManageUserTrips && values.traveler === 'other') {
          editedTrip.user = this.props.userSelector.selectedUser;
        }

        onSave(editedTrip);
      }
    });
  };

  handleTravelerChanged = (value) => {
    this.setState({
      showUserSelector: value === 'other',
    });
  };

  render() {
    const {
      visible, trip, onCancel, canManageUserTrips, isSaving, userSelector,
    } = this.props;

    const opts = this.getFieldOptions();
    const title = trip ? 'Edit trip' : 'Create trip';

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
        <Form>
          <FormField id="destination" options={opts.destination}>
            <Input prefix={<Icon type="global" />} placeholder="Destination" />
          </FormField>
          {canManageUserTrips && (
            <React.Fragment>
              <FieldLabel>Traveler</FieldLabel>
              <Row type="flex" gutter={12}>
                <Col span={8}>
                  <FormField id="traveler" options={opts.traveler}>
                    <Select onChange={this.handleTravelerChanged}>
                      <Option key="me" value="me">
                        Me
                      </Option>
                      <Option key="other" value="other">
                        Other user
                      </Option>
                    </Select>
                  </FormField>
                </Col>
                <Col span={16}>
                  {this.state.showUserSelector && (
                    <FormField id="user" options={opts.user}>
                      <UserSelector {...userSelector.mappedProps} />
                    </FormField>
                  )}
                </Col>
              </Row>
            </React.Fragment>
          )}
          <FormField id="dateRange" options={opts.dateRange}>
            <RangePicker format={config.dateFormat} className="TripRangePicker" />
          </FormField>
          <FormField id="comment" options={opts.comment}>
            <TextArea placeholder="Comment" autosize={{ minRows: 2, maxRows: 6 }} />
          </FormField>
          <ErrorMessage message={this.props.error} />
        </Form>
      </Modal>
    );
  }
}

TripModal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,
  error: PropTypes.string,
  trip: PropTypes.object,
  canManageUserTrips: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  userSelector: PropTypes.object.isRequired,
};

TripModal.defaultProps = {
  error: null,
  trip: null,
};

function mapStateToProps(s) {
  const ed = s.appStore.trips.editing;
  const { auth } = s.appStore;

  return {
    visible: ed.isEditing,
    isSaving: ed.isSaving,
    error: ed.error,
    trip: ed.trip,
    canManageUserTrips: auth.canManageUserTrips,
    onCancel: ed.cancelEditing,
    onSave: ed.saveTrip,
    userSelector: ed.userSelector,
  };
}

export default inject(mapStateToProps)(observer(withAntdForm(TripModal)));
