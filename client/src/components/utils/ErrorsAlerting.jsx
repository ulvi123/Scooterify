import React from 'react';
import '../../styles/ErrorAlert.css';

export const ErrorAlert = ({ message, onClose }) => (
  <div className="error-alert">
    <p>{message}</p>
    {onClose && (
      <button className="close-button" onClick={onClose}>
        ×
      </button>
    )}
  </div>

)