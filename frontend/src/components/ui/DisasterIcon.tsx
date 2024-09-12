import React from 'react';

interface DisasterIconProps {
  type: string;
  className?: string;
}

export const DisasterIcon: React.FC<DisasterIconProps> = ({ type, className }) => {
  // This is a placeholder implementation. You should replace this with your actual icon logic.
  const getIconContent = (type: string) => {
    switch (type.toLowerCase()) {
      case 'earthquake':
        return '🌋';
      case 'flood':
        return '🌊';
      case 'fire':
        return '🔥';
      case 'hurricane':
        return '🌀';
      default:
        return '⚠️';
    }
  };

  return (
    <span className={className} role="img" aria-label={`${type} icon`}>
      {getIconContent(type)}
    </span>
  );
};
