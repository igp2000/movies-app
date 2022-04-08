import React from 'react';
import { Spin } from 'antd';

import './Spinner.scss';

const Spinner = () => {
  return (
    <div className="spin">
      <Spin size="large" tip="Loading..." />
    </div>
  );
};

export default Spinner;
