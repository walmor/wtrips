import React from 'react';
import { Divider } from 'antd';
import logo from '../../../assets/logo.svg';

const HeaderLogo = () => (
  <div className="HeaderLogo">
    <img src={logo} alt="logo" width="32" />
    <Divider type="vertical" />
  </div>
);

export default HeaderLogo;
