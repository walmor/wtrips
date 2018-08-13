import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Tooltip } from 'antd';

const EditListActionButton = ({ onClick }) => (
  <div className="ActionIcon">
    <Tooltip title="Edit" mouseEnterDelay={0.5}>
      <Icon type="edit" onClick={onClick} />
    </Tooltip>
  </div>
);

EditListActionButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default EditListActionButton;
