import React from 'react';
import './Loader.css';

export default function Loader({ message = 'Curating fine selections...', fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div className="loader-box">
          <div className="spinner"></div>
          <span className="loader-logo">MAISON</span>
          <p className="loader-msg">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loader-inline">
      <div className="spinner"></div>
      {message && <p className="loader-msg">{message}</p>}
    </div>
  );
}
