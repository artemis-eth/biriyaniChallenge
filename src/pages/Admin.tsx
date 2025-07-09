import React from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { useThemeContext } from '../components/ThemeProvider';

const Admin = () => {
  const { theme } = useThemeContext();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <div className="text-center">
          <div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: `${theme.primaryColor}20` }}
          >
            <Shield className="h-8 w-8" style={{ color: theme.primaryColor }} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin Panel</h1>
          
          <div 
            className="border rounded-lg p-6"
            style={{ 
              backgroundColor: `${theme.primaryColor}10`,
              borderColor: `${theme.primaryColor}30`
            }}
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 mt-0.5 flex-shrink-0" style={{ color: theme.primaryColor }} />
              <div className="text-left">
                <h2 className="text-lg font-semibold mb-2" style={{ color: theme.primaryColor }}>
                  Static Deployment Mode
                </h2>
                <p className="text-sm mb-3" style={{ color: `${theme.primaryColor}CC` }}>
                  This application is now configured for static deployment (Vercel/Netlify). 
                  The admin panel functionality is not available in this mode since there's no backend server.
                </p>
                <div className="text-sm space-y-2" style={{ color: `${theme.primaryColor}CC` }}>
                  <p><strong>Available features:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>User registration with GitHub validation</li>
                    <li>Commit counting and leaderboard display</li>
                    <li>Real-time GitHub API integration</li>
                    <li>Responsive theme system</li>
                  </ul>
                  <p className="mt-3">
                    <strong>Note:</strong> User data is stored in browser memory and will be lost on page refresh. 
                    For persistent data, you would need a backend database solution.
                  </p>
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