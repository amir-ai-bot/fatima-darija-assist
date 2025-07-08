import React from 'react';

interface FatimaStyle {
  hair_color: string;
  hair_style: 'long' | 'medium' | 'short' | 'hijab';
  makeup_style: 'natural' | 'elegant' | 'glamorous' | 'minimal';
  outfit_color: string;
}

interface FatimaAvatarProps {
  style: FatimaStyle;
  className?: string;
}

const FatimaAvatar: React.FC<FatimaAvatarProps> = ({ style, className }) => {
  const renderHair = () => {
    switch (style.hair_style) {
      case 'long':
        return <path d="M30 30 Q50 10 70 30 T90 30" fill={style.hair_color} />;
      case 'medium':
        return <path d="M35 30 Q50 20 65 30 T85 30" fill={style.hair_color} />;
      case 'short':
        return <path d="M40 30 Q50 25 60 30 T75 30" fill={style.hair_color} />;
      case 'hijab':
        return <rect x="25" y="25" width="50" height="50" fill={style.outfit_color} />;
      default:
        return null;
    }
  };

  const renderMakeup = () => {
    switch (style.makeup_style) {
      case 'elegant':
        return <circle cx="40" cy="45" r="2" fill="red" />;
      case 'glamorous':
        return <path d="M35 40 L45 40" stroke="black" strokeWidth="2" />;
      default:
        return null;
    }
  };

  return (
    <svg viewBox="0 0 100 100" className={className}>
      {/* Base Head */}
      <circle cx="50" cy="50" r="25" fill="#F5D3C3" />
      
      {/* Outfit */}
      <rect x="25" y="75" width="50" height="25" fill={style.outfit_color} />

      {/* Hair */}
      {renderHair()}

      {/* Eyes */}
      <circle cx="40" cy="45" r="3" fill="black" />
      <circle cx="60" cy="45" r="3" fill="black" />

      {/* Makeup */}
      {renderMakeup()}

      {/* Mouth */}
      <path d="M45 60 Q50 65 55 60" stroke="black" strokeWidth="2" fill="none" />
    </svg>
  );
};

export default FatimaAvatar;