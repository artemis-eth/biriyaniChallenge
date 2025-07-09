import React from 'react';

export const BiryaniIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
  <div className={`${className} relative`}>
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full"></div>
    <div className="absolute inset-1 bg-gradient-to-br from-red-500 to-red-700 rounded-full"></div>
    <div className="absolute inset-2 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold">🍛</div>
  </div>
);

export const SpiceIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <div className={`${className} relative`}>
    <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 rounded-full"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs">🌶️</div>
  </div>
);

export const SteamEffect: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`${className} relative overflow-hidden`}>
    <div className="absolute inset-0 opacity-30">
      <div className="animate-pulse bg-gradient-to-t from-transparent via-white to-transparent h-full w-1 absolute left-1/4"></div>
      <div className="animate-pulse bg-gradient-to-t from-transparent via-white to-transparent h-full w-1 absolute left-1/2 animation-delay-200"></div>
      <div className="animate-pulse bg-gradient-to-t from-transparent via-white to-transparent h-full w-1 absolute left-3/4 animation-delay-400"></div>
    </div>
  </div>
);

export const BiryaniTrophy: React.FC<{ className?: string }> = ({ className = "h-12 w-12" }) => (
  <div className={`${className} relative`}>
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-lg shadow-lg"></div>
    <div className="absolute inset-1 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-lg"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">🏆</div>
    <div className="absolute -top-1 -right-1 text-lg">🍛</div>
  </div>
);

export const SpiceJar: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
  <div className={`${className} relative`}>
    <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs">🫙</div>
  </div>
);