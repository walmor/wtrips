import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Tooltip, Popconfirm } from 'antd';

const DeleteListActionButton = ({ onConfirm }) => (
  <div className="ActionIcon">
    <Tooltip title="Delete" mouseEnterDelay={0.5}>
      <Popconfirm title="Are you sure?" placement="left" onConfirm={onConfirm}>
        <Icon type="close-circle" />
      </Popconfirm>
    </Tooltip>
  </div>
);

DeleteListActionButton.propTypes = {
  onConfirm: PropTypes.func.isRequired,
};

export default DeleteListActionButton;
