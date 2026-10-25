import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon: Leaf intertwined with heart in pastel pink and sky blue */}
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#FCE8EF] to-[#FFF8EF] border border-[#F4A7C3]/40 shadow-sm p-1.5 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Heart shape */}
          <path
            d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="#F4A7C3"
          />
          {/* Integrated sprout/leaf accent */}
          <path
            d="M12 6.5C13 4 16 3.5 17 4.5C18 5.5 17.5 8.5 15 9.5C13.5 10.1 12.2 9 12 6.5Z"
            fill="#83BDEB"
          />
          {/* Leaf vein */}
          <path
            d="M12.5 7C14 6.5 15.5 6 16.5 5.5"
            stroke="#3978AE"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span className={`font-extrabold tracking-tight text-[#343746] dark:text-white ${textSizes[size]}`}>
              Nutri<span className="text-[#3978AE]">vita</span>
            </span>
          </div>
          <span className="text-[10px] tracking-widest font-semibold text-[#83BDEB] uppercase mt-0.5">
            AI Health & Nutrition
          </span>
        </div>
      )}
    </div>
  );
};
