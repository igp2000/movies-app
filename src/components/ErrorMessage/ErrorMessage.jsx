import React from 'react';
import { Alert } from 'antd';

import './ErrorMessage.scss';

const ErrorMessage = ({ message }) => {
  return (
    <div className="error-message">
      <Alert message={String(message)} type="error" showIcon />
    </div>
  );
};

export default ErrorMessage;
