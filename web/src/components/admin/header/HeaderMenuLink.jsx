import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Tooltip } from 'antd';

const HeaderMenuLink = ({ tooltip, icon, url }) => (
  <a target="_blank" href={url} rel="noopener noreferrer" className="HeaderMenuLink">
    <Tooltip title={tooltip}>
      <Icon type={icon} />
    </Tooltip>
  </a>
);

HeaderMenuLink.propTypes = {
  tooltip: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};

export default HeaderMenuLink;
