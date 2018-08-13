import React from 'react';
import PropTypes from 'prop-types';
import HeaderMenuLink from './HeaderMenuLink';
import UserDropdown from './UserDropdown';

const HeaderMenu = ({ className }) => (
  <div className={`HeaderMenu ${className || ''}`}>
    <HeaderMenuLink url="http://www.toptal.com" tooltip="Toptal" icon="question-circle-o" />
    <UserDropdown username="Walmor" />
  </div>
);

HeaderMenu.propTypes = {
  className: PropTypes.string,
};

HeaderMenu.defaultProps = {
  className: null,
};

export default HeaderMenu;
