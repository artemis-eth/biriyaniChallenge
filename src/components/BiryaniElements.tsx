import React from 'react';

export const BiryaniIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
  <div className={`${className} relative group`}>
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300"></div>
    <div className="absolute inset-1 bg-gradient-to-br from-red-500 to-red-700 rounded-full"></div>
    <div className="absolute inset-2 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-lg font-bold">🍛</div>
    <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  </div>
);

export const SpiceIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <div className={`${className} relative group`}>
    <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-md group-hover:shadow-lg transition-shadow duration-300"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm">🌶️</div>
    <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  </div>
);

export const SteamEffect: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`${className} relative overflow-hidden pointer-events-none`}>
    <div className="absolute inset-0 opacity-20">
      <div className="animate-pulse bg-gradient-to-t from-transparent via-white to-transparent h-full w-1 absolute left-1/4 animate-float"></div>
      <div className="animate-pulse bg-gradient-to-t from-transparent via-white to-transparent h-full w-1 absolute left-1/2 animate-float" style={{ animationDelay: '0.5s' }}></div>
      <div className="animate-pulse bg-gradient-to-t from-transparent via-white to-transparent h-full w-1 absolute left-3/4 animate-float" style={{ animationDelay: '1s' }}></div>
    </div>
  </div>
);

export const BiryaniTrophy: React.FC<{ className?: string }> = ({ className = "h-12 w-12" }) => (
  <div className={`${className} relative group`}>
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl shadow-xl group-hover:shadow-2xl transition-shadow duration-300"></div>
    <div className="absolute inset-1 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-xl"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl">🏆</div>
    <div className="absolute -top-2 -right-2 text-xl animate-bounce">🍛</div>
    <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  </div>
);

export const SpiceJar: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
  <div className={`${className} relative group`}>
    <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full shadow-md group-hover:shadow-lg transition-shadow duration-300"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm">🫙</div>
    <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  </div>
);