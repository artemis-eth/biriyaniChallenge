import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Trash2, 
  RefreshCw, 
  Calendar, 
  Database, 
  AlertCircle, 
  CheckCircle,
  Eye,
  EyeOff,
  LogOut,
  BarChart3,
  Clock,
  HardDrive,
  Palette,
  Save,
  RotateCcw
} from 'lucide-react';
import { useThemeContext } from '../components/ThemeProvider';
import { BiryaniIcon } from '../components/BiryaniElements';

interface User {
  id: number;
  username: string;
  avatar_url: string;
  name?: string;
  public_repos?: number;
  followers?: number;
  commits: number;
  rank: number;
  lastUpdated: string;
  timePeriod?: number;
}

interface CacheEntry {
  key: string;
  timestamp: string;
  age: number;
  size: number;
}

interface CacheStats {
  totalEntries: number;
  entries: CacheEntry[];
}

interface ThemeLabels {
  title: string;
  subtitle: string;
  commitLabel: string;
  rankLabel: string;
  leaderboardTitle: string;
}

interface Theme {
  name: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  headerImage: string;
  rewardMessage: string;
  labels: ThemeLabels;
}

const Admin = () => {
  const { theme: currentTheme, refetchTheme } = useThemeContext();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [timePeriod, setTimePeriod] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'theme' | 'cache'>('leaderboard');
  const [themeSettings, setThemeSettings] = useState<Theme>(currentTheme);
  const [isSavingTheme, setIsSavingTheme] = useState(false);

  useEffect(() => {
    setThemeSettings(currentTheme);
  }, [currentTheme]);

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        showMessage('Successfully logged in as admin', 'success');
        fetchLeaderboard();
        fetchCacheStats();
      } else {
        showMessage('Invalid admin credentials', 'error');
      }
    } catch (error) {
      showMessage('Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaderboard = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/admin/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: 'admin', 
          password: 'admin123',
          days: timePeriod,
          refresh 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        if (refresh) {
          showMessage(`Leaderboard refreshed for ${timePeriod} days`, 'success');
        }
      } else {
        showMessage('Failed to fetch leaderboard data', 'error');
      }
    } catch (error) {
      showMessage('Error fetching leaderboard data', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchCacheStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/cache-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'admin', password: 'admin123' }),
      });

      if (response.ok) {
        const data = await response.json();
        setCacheStats(data);
      }
    } catch (error) {
      console.error('Error fetching cache stats:', error);
    }
  };

  const fetchThemeSettings = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'admin', password: 'admin123' }),
      });

      if (response.ok) {
        const data = await response.json();
        setThemeSettings(data);
      }
    } catch (error) {
      console.error('Error fetching theme settings:', error);
    }
  };

  const handleSaveTheme = async () => {
    setIsSavingTheme(true);
    try {
      const response = await fetch('http://localhost:3001/api/admin/update-theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: 'admin', 
          password: 'admin123',
          theme: themeSettings 
        }),
      });

      if (response.ok) {
        showMessage('Theme updated successfully', 'success');
        refetchTheme();
      } else {
        showMessage('Failed to update theme', 'error');
      }
    } catch (error) {
      showMessage('Error updating theme', 'error');
    } finally {
      setIsSavingTheme(false);
    }
  };

  const resetToDefaultTheme = () => {
    const defaultTheme: Theme = {
      name: 'Biriyani Challenge',
      primaryColor: '#FF6B35',
      accentColor: '#F7931E',
      backgroundColor: '#FFF8E1',
      headerImage: '',
      rewardMessage: 'Winner gets a delicious full biriyani plate! 🍛',
      labels: {
        title: 'Biriyani Challenge Leaderboard',
        subtitle: 'Compete with fellow developers - Winner gets biriyani!',
        commitLabel: 'Spice Points',
        rankLabel: 'Steam Rank',
        leaderboardTitle: 'Biriyani Champions'
      }
    };
    setThemeSettings(defaultTheme);
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: 'admin', 
          password: 'admin123',
          userId 
        }),
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
        showMessage(`User "${username}" deleted successfully`, 'success');
        fetchCacheStats(); // Refresh cache stats after deletion
      } else {
        const data = await response.json();
        showMessage(data.error || 'Failed to delete user', 'error');
      }
    } catch (error) {
      showMessage('Error deleting user', 'error');
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all cached data? This will force fresh API calls for all future requests.')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/admin/clear-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'admin', password: 'admin123' }),
      });

      if (response.ok) {
        showMessage('Cache cleared successfully', 'success');
        fetchCacheStats();
      } else {
        showMessage('Failed to clear cache', 'error');
      }
    } catch (error) {
      showMessage('Error clearing cache', 'error');
    }
  };

  const handleTimePeriodChange = (newPeriod: number) => {
    setTimePeriod(newPeriod);
  };

  useEffect(() => {
    if (isAuthenticated && timePeriod) {
      fetchLeaderboard();
      fetchThemeSettings();
    }
  }, [timePeriod]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatAge = (age: number) => {
    const minutes = Math.floor(age / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Panel</h1>
            <p className="text-gray-600">Enter your credentials to access the admin dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all duration-200"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {message && (
              <div className={`flex items-center space-x-2 p-4 rounded-lg ${
                messageType === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {messageType === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  messageType === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {message}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg font-medium hover:from-red-700 hover:to-red-800 focus:ring-4 focus:ring-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Default credentials: admin / admin123
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="inline-flex items-center justify-center w-12 h-12 rounded-full"
                style={{ backgroundColor: `${currentTheme.primaryColor}20` }}
              >
                <Shield className="h-6 w-6" style={{ color: currentTheme.primaryColor }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-600">Manage {currentTheme.name} settings</p>
              </div>
            </div>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: `${currentTheme.primaryColor}20`,
                color: currentTheme.primaryColor 
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-6 flex items-center space-x-2 p-4 rounded-lg ${
            messageType === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {messageType === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <span className={`text-sm font-medium ${
              messageType === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message}
            </span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex space-x-1 mb-6">
            {[
              { id: 'leaderboard', label: 'Leaderboard', icon: BarChart3 },
              { id: 'theme', label: 'Theme Settings', icon: Palette },
              { id: 'cache', label: 'Cache Management', icon: HardDrive }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === id ? 'text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={activeTab === id ? {
                  background: `linear-gradient(135deg, ${currentTheme.primaryColor}, ${currentTheme.accentColor})`
                } : {}}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Leaderboard Controls */}
          {activeTab === 'leaderboard' && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <label className="text-sm font-medium text-gray-700">Time Period:</label>
                </div>
                <select
                  value={timePeriod}
                  onChange={(e) => handleTimePeriodChange(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                  style={{ focusRingColor: currentTheme.primaryColor }}
                >
                  <option value={7}>Last 7 days</option>
                  <option value={14}>Last 14 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={60}>Last 60 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => fetchLeaderboard(true)}
                  disabled={isRefreshing}
                  className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{ backgroundColor: currentTheme.primaryColor }}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Theme Settings */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Challenge Name
                  </label>
                  <input
                    type="text"
                    value={themeSettings.name}
                    onChange={(e) => setThemeSettings({ ...themeSettings, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={themeSettings.primaryColor}
                      onChange={(e) => setThemeSettings({ ...themeSettings, primaryColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeSettings.primaryColor}
                      onChange={(e) => setThemeSettings({ ...themeSettings, primaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={themeSettings.accentColor}
                      onChange={(e) => setThemeSettings({ ...themeSettings, accentColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeSettings.accentColor}
                      onChange={(e) => setThemeSettings({ ...themeSettings, accentColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={themeSettings.backgroundColor}
                      onChange={(e) => setThemeSettings({ ...themeSettings, backgroundColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeSettings.backgroundColor}
                      onChange={(e) => setThemeSettings({ ...themeSettings, backgroundColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Winner Reward Message
                </label>
                <textarea
                  value={themeSettings.rewardMessage}
                  onChange={(e) => setThemeSettings({ ...themeSettings, rewardMessage: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Title
                  </label>
                  <input
                    type="text"
                    value={themeSettings.labels.title}
                    onChange={(e) => setThemeSettings({ 
                      ...themeSettings, 
                      labels: { ...themeSettings.labels, title: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={themeSettings.labels.subtitle}
                    onChange={(e) => setThemeSettings({ 
                      ...themeSettings, 
                      labels: { ...themeSettings.labels, subtitle: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commit Label
                  </label>
                  <input
                    type="text"
                    value={themeSettings.labels.commitLabel}
                    onChange={(e) => setThemeSettings({ 
                      ...themeSettings, 
                      labels: { ...themeSettings.labels, commitLabel: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rank Label
                  </label>
                  <input
                    type="text"
                    value={themeSettings.labels.rankLabel}
                    onChange={(e) => setThemeSettings({ 
                      ...themeSettings, 
                      labels: { ...themeSettings.labels, rankLabel: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leaderboard Title
                  </label>
                  <input
                    type="text"
                    value={themeSettings.labels.leaderboardTitle}
                    onChange={(e) => setThemeSettings({ 
                      ...themeSettings, 
                      labels: { ...themeSettings.labels, leaderboardTitle: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t">
                <button
                  onClick={handleSaveTheme}
                  disabled={isSavingTheme}
                  className="flex items-center space-x-2 px-6 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{ backgroundColor: currentTheme.primaryColor }}
                >
                  <Save className={`h-4 w-4 ${isSavingTheme ? 'animate-spin' : ''}`} />
                  <span>{isSavingTheme ? 'Saving...' : 'Save Theme'}</span>
                </button>

                <button
                  onClick={resetToDefaultTheme}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset to Default</span>
                </button>
              </div>
            </div>
          )}

          {/* Cache Management */}
          {activeTab === 'cache' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Cache Management</span>
              </div>
              <button
                onClick={handleClearCache}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Database className="h-4 w-4" />
                <span>Clear Cache</span>
              </button>
            </div>
          )}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'leaderboard' && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div 
                className="px-6 py-4"
                style={{ 
                  background: `linear-gradient(135deg, ${currentTheme.primaryColor}, ${currentTheme.accentColor})` 
                }}
              >
                <h2 className="text-xl font-bold text-white flex items-center">
                  <BiryaniIcon className="h-6 w-6 mr-2" />
                  {currentTheme.labels.leaderboardTitle} ({timePeriod} days)
                </h2>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading leaderboard...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <BiryaniIcon className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No chefs registered</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <span className="text-lg font-bold text-gray-600">{user.rank}</span>
                        </div>
                        
                        <img
                          src={user.avatar_url}
                          alt={`${user.username}'s avatar`}
                          className="h-12 w-12 rounded-full border-2 border-white shadow-md"
                        />
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-800">{user.username}</h3>
                            {user.name && user.name !== user.username && (
                              <span className="text-sm text-gray-500">({user.name})</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>ID: {user.id}</span>
                            {user.public_repos && <span>{user.public_repos} repos</span>}
                            {user.followers && <span>{user.followers} followers</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-800">{user.commits}</div>
                          <div className="text-sm text-gray-500">{currentTheme.labels.commitLabel.toLowerCase()}</div>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title={`Delete ${user.username}`}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'cache' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cache Statistics */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <HardDrive className="h-5 w-5 mr-2" />
                  Cache Statistics
                </h3>
                <button
                  onClick={fetchCacheStats}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {cacheStats ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-800">{cacheStats.totalEntries}</div>
                    <div className="text-sm text-blue-600">Total Cache Entries</div>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cacheStats.entries.slice(0, 10).map((entry, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-800 truncate">
                          {entry.key}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatAge(entry.age)}
                          </span>
                          <span>{formatBytes(entry.size)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {cacheStats.entries.length > 10 && (
                    <div className="text-center text-sm text-gray-500">
                      ... and {cacheStats.entries.length - 10} more entries
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Loading cache stats...</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">{users.length}</div>
                  <div className="text-sm text-gray-600">Total Chefs</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">
                    {users.reduce((sum, user) => sum + user.commits, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total {currentTheme.labels.commitLabel}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">{timePeriod}</div>
                  <div className="text-sm text-gray-600">Days Period</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">{cacheStats?.totalEntries || 0}</div>
                  <div className="text-sm text-gray-600">Cache Entries</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;