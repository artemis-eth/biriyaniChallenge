import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, UserPlus, Shield } from 'lucide-react';
import { useThemeContext } from './ThemeProvider';
import { BiryaniIcon } from './BiryaniElements';

const Navigation = () => {
  const location = useLocation();
  const { theme } = useThemeContext();

  const navItems = [
    { path: '/register', label: 'Register', icon: UserPlus },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/admin', label: 'Admin', icon: Shield },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-gray-800">
            <BiryaniIcon className="h-8 w-8" />
            <span 
              className="bg-gradient-to-r bg-clip-text text-transparent font-bold"
              style={{ 
                backgroundImage: `linear-gradient(to right, ${theme.primaryColor}, ${theme.accentColor})` 
              }}
            >
              {theme.labels.title}
            </span>
          </Link>
          
          <div className="flex space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                  location.pathname === path
                    ? 'shadow-sm text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
                style={location.pathname === path ? {
                  background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`
                } : {}}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;