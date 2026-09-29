import React from 'react';

interface Props {
  className?: string;
  size?: number;
}

export const OnionLogo: React.FC<Props> = ({ className = '', size = 38 }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Glowing Green & Purple Accent Ring */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-purple-600 to-blue-500 rounded-2xl blur-md opacity-70 animate-pulse-glow" />
        
        {/* Main Logo Container */}
        <div className="relative bg-dark-bg p-2 rounded-xl border border-purple-500/50 flex items-center justify-center">
          <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer Onion Bulb Skin (Purple to Green Gradient) */}
            <path
              d="M32 6C22 14 10 24 10 40C10 51.0457 19.8492 60 32 60C44.1508 60 54 51.0457 54 40C54 24 42 14 32 6Z"
              fill="url(#onionGradOuter)"
              stroke="#10B981"
              strokeWidth="2"
            />
            {/* Inner Layers */}
            <path
              d="M32 14C25 21 17 29 17 41C17 49 23.7157 54 32 54C40.2843 54 47 49 47 41C47 29 39 21 32 14Z"
              fill="url(#onionGradInner)"
              opacity="0.88"
            />
            {/* Center Core Layer */}
            <path
              d="M32 24C28 29 23 34 23 42C23 46.5 27 49 32 49C37 49 41 46.5 41 42C41 34 36 29 32 24Z"
              fill="#34D399"
              opacity="0.9"
            />
            {/* Top Root Sprout (Green Leaves) */}
            <path d="M32 6V0M30 4L26 0M34 4L38 0" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
            {/* Bottom Roots */}
            <path d="M26 60L24 64M32 60V64M38 60L40 64" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />

            <defs>
              <linearGradient id="onionGradOuter" x1="10" y1="6" x2="54" y2="60" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7C3AED" />
                <stop offset="0.5" stopColor="#9333EA" />
                <stop offset="1" stopColor="#10B981" />
              </linearGradient>
              <linearGradient id="onionGradInner" x1="17" y1="14" x2="47" y2="54" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-400 font-sans">
            Onion<span className="text-emerald-700 dark:text-emerald-300">Grow</span>
          </span>
          <span className="bg-gradient-to-r from-emerald-500 to-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
            AI 2.0
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium tracking-wide">
          Smart Onion Ecosystem
        </span>
      </div>
    </div>
  );
};
