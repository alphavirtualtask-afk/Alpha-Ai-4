import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
  onClick,
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-base', subtext: 'text-[9px]' },
    md: { icon: 38, text: 'text-xl', subtext: 'text-[10px]' },
    lg: { icon: 46, text: 'text-2xl', subtext: 'text-xs' },
    xl: { icon: 56, text: 'text-3xl', subtext: 'text-sm' },
  };

  const current = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Precision Vector Emblem */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={current.icon}
          height={current.icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_12px_rgba(229,169,60,0.35)]"
        >
          {/* Subtle Outer Diamond / Hex Ring */}
          <polygon
            points="50,4 96,27 96,73 50,96 4,73 4,27"
            stroke="url(#goldGradientHex)"
            strokeWidth="3.5"
            strokeLinejoin="round"
            className="opacity-75"
          />
          {/* Inner Geometric Shield Fill */}
          <polygon
            points="50,11 88,31 88,69 50,89 12,69 12,31"
            fill="#121620"
            stroke="rgba(229, 169, 60, 0.25)"
            strokeWidth="1.5"
          />
          {/* Stylized Alpha 'A' & Virtual Flow Bars */}
          {/* Left Leg of A */}
          <path
            d="M50 20 L24 78 H36 L43 62 H57 L64 78 H76 L50 20Z"
            fill="url(#goldGradientMain)"
          />
          {/* Center Cutout Triangle */}
          <path
            d="M50 36 L44 52 H56 L50 36Z"
            fill="#121620"
          />
          {/* Horizontal Tech Data Bar through A */}
          <rect
            x="32"
            y="54"
            width="36"
            height="4"
            rx="2"
            fill="#FFF"
            className="opacity-90 shadow-sm"
          />
          {/* Virtual Task Precision Core Accent */}
          <circle cx="50" cy="56" r="3" fill="#E5A93C" />

          {/* Gradients */}
          <defs>
            <linearGradient id="goldGradientMain" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF2D6" />
              <stop offset="35%" stopColor="#F5B942" />
              <stop offset="70%" stopColor="#D4952B" />
              <stop offset="100%" stopColor="#9C6811" />
            </linearGradient>
            <linearGradient id="goldGradientHex" x1="4" y1="4" x2="96" y2="96" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#D4952B" />
              <stop offset="100%" stopColor="#784B06" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography Lockup */}
      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center gap-1.5 tracking-tight">
          <span className={`font-display font-extrabold text-white ${current.text}`}>
            ALPHA
          </span>
          <span className={`font-display font-bold text-[#E5A93C] ${current.text}`}>
            VIRTUAL TASK
          </span>
        </div>
        {showTagline && (
          <span className={`font-sans font-medium uppercase tracking-[0.22em] text-[#C89427] opacity-90 ${current.subtext}`}>
            Your Trust Our Priority
          </span>
        )}
      </div>
    </div>
  );
};
