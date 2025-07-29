import React from 'react';

// ProgressBar Component
const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => {
  // Ensure the percentage is between 0 and 100
  const progress = Math.min(Math.max(percentage, 0), 100);

  return (
    <div style={containerStyle}>
      <div style={{ ...barStyle, width: `${progress}%` }} />
      <span style={textStyle}>{progress}%</span>
    </div>
  );
};

// Define styles as React.CSSProperties
const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '20px',
  backgroundColor: '#e0e0e0',
  borderRadius: '10px',
  position: 'relative',
  direction: 'ltr'
};

const barStyle: React.CSSProperties = {
  height: '100%',
  backgroundColor: '#4caf50',
  borderRadius: '10px',
  transition: 'width 0.3s ease-in-out',
};

const textStyle: React.CSSProperties = {
  position: 'absolute',
  top: '0',
  left: '50%',
  transform: 'translateX(-50%)',
  color: '#fff',
  fontWeight: 'bold',
  lineHeight: '20px',
};

export default ProgressBar;
