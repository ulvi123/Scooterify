import React from 'react';
import '../../styles/loadingSpinner.css';

export const LoadingSpinner = ({ size = 'medium' }) => (
  <div className={`loading-spinner ${size}`}>
    <div className="spinner-ring"></div>
  </div>
);