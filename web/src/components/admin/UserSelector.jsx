import React, { Component } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { Select, Spin } from 'antd';
import PropTypes from 'prop-types';

const { Option } = Select;

class UserSelector extends Component {
  async componentDidMount() {
    // await this.props.onLoad();
  }

  render() {
    const {
      selectedUser,
      loading,
      placeholder,
      onSelect,
      onSearch,
      onLeave,
      className,
    } = this.props;

    const users = toJS(this.props.users);
    const selectedValue = selectedUser ? selectedUser.id : undefined;

    return (
      <Select
        className={`TripListUserFilter ${className || ''}`}
        showSearch
        placeholder={placeholder}
        notFoundContent={loading ? <Spin size="small" /> : 'No users found'}
        filterOption={false}
        value={selectedValue}
        onSearch={onSearch}
        onSelect={onSelect}
        onBlur={onLeave}
      >
        {users.map(u => (
          <Option key={u.id} value={u.id}>
            {u.name}
          </Option>
        ))}
      </Select>
    );
  }
}

UserSelector.propTypes = {
  className: PropTypes.string,
  selectedUser: PropTypes.object,
  users: PropTypes.array,
  loading: PropTypes.bool,
  placeholder: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onLeave: PropTypes.func.isRequired,
};

UserSelector.defaultProps = {
  className: null,
  selectedUser: null,
  users: [],
  loading: false,
};

export default observer(UserSelector);
