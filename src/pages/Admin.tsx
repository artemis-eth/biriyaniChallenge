import React from 'react';
import { Shield, Sparkles, Zap } from 'lucide-react';
import { useThemeContext } from '../components/ThemeProvider';

const Admin = () => {
  const { theme } = useThemeContext();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="card-hover bg-white rounded-3xl shadow-xl p-12 border border-gray-100 animate-scale-in">
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-24 h-24 mb-8">
              <div 
                className="absolute inset-0 rounded-full animate-pulse"
                style={{ backgroundColor: `${theme.primaryColor}20` }}
              ></div>
              <Shield className="h-12 w-12" style={{ color: theme.primaryColor }} />
              <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-400 animate-bounce" />
            </div>
            
            <h1 className="text-4xl font-bold gradient-text mb-6">Admin Panel</h1>
            
            <div 
              className="border-2 border-dashed rounded-2xl p-8 mb-8"
              style={{ 
                backgroundColor: `${theme.primaryColor}05`,
                borderColor: `${theme.primaryColor}30`
              }}
            >
              <div className="flex items-start space-x-4">
                <Zap className="h-8 w-8 mt-1 flex-shrink-0" style={{ color: theme.primaryColor }} />
                <div className="text-left">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: theme.primaryColor }}>
                    Static Deployment Mode
                  </h2>
                  <p className="text-gray-600 text-lg mb-6">
                    This application is optimized for static deployment with real-time GitHub integration.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Available Features
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• GitHub user validation</li>
                        <li>• Real-time commit tracking</li>
                        <li>• Dynamic leaderboard</li>
                        <li>• Responsive design</li>
                        <li>• Theme customization</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Technical Stack
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• React 18 + TypeScript</li>
                        <li>• Tailwind CSS</li>
                        <li>• GitHub API integration</li>
                        <li>• Vite build system</li>
                        <li>• Static hosting ready</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">
                      <strong>Note:</strong> User data is stored in browser memory for this demo. 
                      For persistent storage, integrate with a backend database service.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;