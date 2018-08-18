import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Tooltip, Popconfirm } from 'antd';

const DeleteListActionButton = ({ className, onConfirm }) => (
  <span className={`ActionIcon ${className || ''}`}>
    <Tooltip title="Delete" mouseEnterDelay={0.5}>
      <Popconfirm title="Are you sure?" placement="left" onConfirm={onConfirm}>
        <Icon type="close-circle" />
      </Popconfirm>
    </Tooltip>
  </span>
);

DeleteListActionButton.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  className: PropTypes.string,
};

DeleteListActionButton.defaultProps = {
  className: null,
};

export default DeleteListActionButton;
