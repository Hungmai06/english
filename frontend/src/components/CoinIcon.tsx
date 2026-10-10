'use client';

import React from 'react';

interface CoinIconProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

export const CoinIcon: React.FC<CoinIconProps> = ({
  className = 'w-5 h-5',
  size,
  animate = false,
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animate ? 'hover:rotate-12 transition-transform duration-300' : ''} inline-block select-none flex-shrink-0 drop-shadow-[0_2px_4px_rgba(180,83,9,0.4)]`}
      style={size ? { width: size, height: size } : undefined}
      aria-label="Coin"
    >
      <defs>
        <linearGradient id="goldCoinRim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="16%" stopColor="#FFF570" />
          <stop offset="46%" stopColor="#FBBF24" />
          <stop offset="78%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        <radialGradient id="goldCoinFace" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFDE7" />
          <stop offset="35%" stopColor="#FDE047" />
          <stop offset="70%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>

        <linearGradient id="goldCoinStar" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#FEF9C3" />
          <stop offset="100%" stopColor="#FDE047" />
        </linearGradient>

        <linearGradient id="goldCoinGroove" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      <circle cx="12" cy="13.2" r="9.75" fill="#B45309" />
      <circle cx="12" cy="12.6" r="9.75" fill="#D97706" />
      <circle cx="12" cy="12" r="9.75" fill="url(#goldCoinRim)" stroke="#FEF3C7" strokeWidth="0.5" />
      <circle cx="12" cy="12" r="7.75" fill="url(#goldCoinFace)" stroke="url(#goldCoinGroove)" strokeWidth="0.75" />
      <circle
        cx="12"
        cy="12"
        r="6.5"
        fill="none"
        stroke="#D97706"
        strokeWidth="0.5"
        strokeDasharray="0.8 1.2"
        opacity="0.6"
      />
      <path
        d="M12 7.2C12.3 10.1 13.4 11.2 16.3 12C13.4 12.8 12.3 13.9 12 16.8C11.7 13.9 10.6 12.8 7.7 12C10.6 11.2 11.7 10.1 12 7.2Z"
        fill="url(#goldCoinStar)"
        filter="drop-shadow(0px 0.5px 0.8px rgba(180,83,9,0.6))"
      />
      <circle cx="12" cy="12" r="0.9" fill="#FFFFFF" />
      <path
        d="M5.5 11.5C5.5 7.8 8.4 4.8 12 4.8C13.9 4.8 15.6 5.6 16.8 6.8C15.4 6 13.8 5.5 12 5.5C8.6 5.5 5.9 8.2 5.9 11.6C5.9 12.8 6.3 13.9 6.9 14.8C6 13.9 5.5 12.8 5.5 11.5Z"
        fill="#FFFFFF"
        opacity="0.8"
      />
      <path
        d="M18.5 4.5L19 5.8L20.3 6.3L19 6.8L18.5 8.1L18 6.8L16.7 6.3L18 5.8Z"
        fill="#FFFFFF"
        filter="drop-shadow(0px 0px 1px #FBBF24)"
      />
    </svg>
  );
};

export interface GoldRewardCoinProps {
  amount: number | string;
  className?: string;
  size?: number;
}

/**
 * Premium 3D Gamified Gold Reward Coin
 * Styled with multi-stop radial gold gradients, outer extrusion, inner ring, star and specular reflection
 */
export const GoldRewardCoin: React.FC<GoldRewardCoinProps> = ({
  amount,
  className = '',
  size = 46,
}) => {
  const formattedText =
    typeof amount === 'number'
      ? `+${amount}`
      : amount.startsWith('+')
      ? amount.replace(/\s+/g, '')
      : `+${amount}`;

  return (
    <div
      className={`reward-coin-3d ${className}`}
      style={size !== 46 ? { width: size, height: size } : undefined}
      aria-label={`Thưởng ${formattedText} xu`}
    >
      {/* Tiny 4-Point Star */}
      <svg className="w-2 h-2 fill-[#FFFBEB] -mt-0.5 drop-shadow-xs" viewBox="0 0 24 24">
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" />
      </svg>
      {/* Value */}
      <span className="text-[13.5px] font-black text-[#6D2F00] leading-none tracking-tight [text-shadow:0_1px_0_rgba(255,255,255,0.6),0_-0.5px_0_rgba(109,47,0,0.3)]">
        {formattedText}
      </span>
    </div>
  );
};

export interface RewardCoinBadgeProps {
  amount: number | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  iconPosition?: 'left' | 'right';
  variant?: 'coin' | 'pill' | 'light';
}

export const RewardCoinBadge: React.FC<RewardCoinBadgeProps> = ({
  amount,
  className = '',
  size = 'md',
  iconPosition = 'left',
  variant = 'coin',
}) => {
  // If variant is 'coin', render the 3D Gold Reward Coin
  if (variant === 'coin') {
    const coinSize = size === 'sm' ? 38 : size === 'lg' ? 50 : 46;
    return <GoldRewardCoin amount={amount} size={coinSize} className={className} />;
  }

  const formattedAmount =
    typeof amount === 'number'
      ? `+${amount}`
      : amount.startsWith('+')
      ? amount.replace(/\s+/g, '')
      : `+${amount}`;

  if (variant === 'light') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-black text-xs text-amber-900 bg-amber-50 border border-amber-200 shadow-xs whitespace-nowrap ${className}`}
      >
        <CoinIcon className="w-4 h-4 flex-shrink-0" />
        <span>{formattedAmount}</span>
      </span>
    );
  }

  // Sleek capsule pill
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-xs bg-white text-slate-900 border border-amber-300/80 shadow-[0_2px_8px_rgba(0,0,0,0.18)] whitespace-nowrap flex-nowrap group-hover:scale-105 group-hover:shadow-md transition-all select-none ${className}`}
    >
      {iconPosition === 'left' && <CoinIcon className="w-4.5 h-4.5 flex-shrink-0" />}
      <span className="font-black text-slate-900 leading-none">{formattedAmount}</span>
      {iconPosition === 'right' && <CoinIcon className="w-4.5 h-4.5 flex-shrink-0" />}
    </span>
  );
};
