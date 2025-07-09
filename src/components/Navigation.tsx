import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, UserPlus, Shield } from 'lucide-react';
import { useThemeContext } from './ThemeProvider';
import { BiryaniIcon } from './BiryaniElements';

const Navigation = () => {
  const location = useLocation();
  const { theme } = useThemeContext();

  const navItems = [
    { path: '/register', label: 'Join', icon: UserPlus },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/admin', label: 'Admin', icon: Shield },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <Link 
            to="/" 
            className="flex items-center space-x-3 group transition-all duration-300 hover:scale-105"
          >
            <div className="animate-float">
              <BiryaniIcon className="h-10 w-10" />
            </div>
            <span className="text-2xl font-bold gradient-text">
              {theme.name}
            </span>
          </Link>
          
          <div className="flex items-center space-x-2">
            {navItems.map(({ path, label, icon: Icon }, index) => (
              <Link
                key={path}
                to={path}
                className={`group relative flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                  location.pathname === path
                    ? 'text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                } animate-slide-in-right stagger-${index + 1}`}
                style={location.pathname === path ? {
                  background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`
                } : {}}
              >
                <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span>{label}</span>
                {location.pathname === path && (
                  <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse"></div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;