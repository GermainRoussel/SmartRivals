
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    // Prevent infinite loops
    if (img.getAttribute('data-has-error')) return;
    
    img.setAttribute('data-has-error', 'true');
    
    // Try fallback if main logo fails
    if (!img.src.includes('logo-1.png')) {
        img.src = 'logo-1.png';
    }
  };

  return (
    <img
      src="logo.png"
      alt="Smart Rivals"
      className={`object-contain ${className}`}
      onError={handleImageError}
      style={{ display: 'block' }}
    />
  );
};
