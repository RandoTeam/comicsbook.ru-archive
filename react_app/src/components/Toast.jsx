import React, { useEffect } from 'react';

export default function Toast({ message, show, onHide, duration = 2000 }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onHide]);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '100px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '20px',
      zIndex: 9999,
      fontSize: '14px',
      transition: 'opacity 0.3s ease',
      animation: 'fadeIn 0.3s ease'
    }}>
      {message}
    </div>
  );
}
