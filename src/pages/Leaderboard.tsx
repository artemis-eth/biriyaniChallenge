import React, { useState, useEffect } from 'react';
import { Medal, Award, Github, ExternalLink, RefreshCw, Users, Crown, Zap, TrendingUp } from 'lucide-react';
import { useThemeContext } from '../components/ThemeProvider';
import { BiryaniIcon, BiryaniTrophy, SpiceIcon, SteamEffect } from '../components/BiryaniElements';
import { useUsers } from '../hooks/useUsers';
import { checkRateLimit } from '../api/github';

interface RateLimit {
  limit: number;
  remaining: number;
  reset: number;
}

const Leaderboard = () => {
  const { theme } = useThemeContext();
  const { users, isLoading: isRefreshing, refreshUsers, stats } = useUsers();
  const [rateLimit, setRateLimit] = useState<RateLimit | null>(null);

  const fetchRateLimit = async () => {
    try {
      const rateLimitData = await checkRateLimit();
      if (rateLimitData) {
        setRateLimit(rateLimitData);
      }
    } catch (rateLimitError) {
      console.warn('Could not fetch rate limit info:', rateLimitError);
    }
  };

  useEffect(() => {
    fetchRateLimit();
  }, []);

  const handleRefresh = async () => {
    try {
      await refreshUsers();
      await fetchRateLimit();
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-8 w-8 text-yellow-500 animate-pulse" />;
    if (rank === 2) return <Medal className="h-7 w-7 text-gray-400" />;
    if (rank === 3) return <Award className="h-7 w-7 text-amber-600" />;
    return <span className="text-xl font-bold text-gray-600">{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-500';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-amber-400 to-amber-500';
    return '';
  };

  const getRankStyle = (rank: number) => {
    if (rank <= 3) return {};
    return { 
      background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})` 
    };
  };

  if (users.length === 0 && isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-scale-in">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-gray-600 mb-2">Loading leaderboard...</p>
          <p className="text-gray-500">Fetching the latest data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Hero Section */}
        <div 
          className="relative overflow-hidden rounded-3xl mb-12 p-12 text-white shadow-2xl animate-slide-up"
          style={{ 
            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})` 
          }}
        >
          <SteamEffect className="absolute inset-0" />
          <div className="relative z-10 text-center">
            <div className="flex justify-center items-center space-x-6 mb-6">
              <BiryaniIcon className="h-20 w-20 animate-float" />
              <h1 className="text-6xl font-bold">{theme.labels.title}</h1>
              <BiryaniIcon className="h-20 w-20 animate-float" style={{ animationDelay: '1s' }} />
            </div>
            <p className="text-2xl opacity-90 mb-6">{theme.labels.subtitle}</p>
            <div className="glass rounded-2xl p-6 inline-block">
              <p className="text-xl font-semibold flex items-center justify-center space-x-2">
                <Zap className="h-6 w-6 text-yellow-300" />
                <span>{theme.rewardMessage}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="card-hover bg-white rounded-2xl shadow-lg p-8 border border-gray-100 animate-slide-in-left stagger-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Participants</p>
                <p className="text-4xl font-bold text-gray-800">{stats.totalUsers}</p>
              </div>
              <div 
                className="p-4 rounded-2xl"
                style={{ backgroundColor: `${theme.primaryColor}20` }}
              >
                <Users className="h-8 w-8" style={{ color: theme.primaryColor }} />
              </div>
            </div>
          </div>
          
          <div className="card-hover bg-white rounded-2xl shadow-lg p-8 border border-gray-100 animate-slide-up stagger-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Total {theme.labels.commitLabel}</p>
                <p className="text-4xl font-bold text-gray-800">{stats.totalCommits}</p>
              </div>
              <div 
                className="p-4 rounded-2xl"
                style={{ backgroundColor: `${theme.accentColor}20` }}
              >
                <SpiceIcon className="h-8 w-8" />
              </div>
            </div>
          </div>
          
          <div className="card-hover bg-white rounded-2xl shadow-lg p-8 border border-gray-100 animate-slide-in-right stagger-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Activity</p>
                <p className="text-sm font-medium text-gray-800">
                  {new Date(stats.lastUpdated).toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-4 rounded-2xl transition-all duration-300 hover:scale-110 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
                style={{ backgroundColor: `${theme.accentColor}20`, color: theme.accentColor }}
                title="Refresh data"
              >
                <RefreshCw className="h-8 w-8" />
              </button>
            </div>
          </div>
        </div>

        {/* Rate Limit Info */}
        {rateLimit && rateLimit.remaining < 1000 && (
          <div 
            className="mb-8 border rounded-2xl p-6 animate-slide-up"
            style={{ 
              backgroundColor: `${theme.primaryColor}10`,
              borderColor: `${theme.primaryColor}30`
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Github className="h-6 w-6" style={{ color: theme.primaryColor }} />
                <div>
                  <p className="font-semibold" style={{ color: theme.primaryColor }}>
                    API Status: {rateLimit.remaining}/{rateLimit.limit} requests remaining
                  </p>
                  <p className="text-sm" style={{ color: `${theme.primaryColor}CC` }}>
                    Resets at {new Date(rateLimit.reset * 1000).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <TrendingUp className="h-6 w-6" style={{ color: theme.accentColor }} />
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-slide-up stagger-4">
          <div 
            className="px-8 py-6"
            style={{ 
              background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})` 
            }}
          >
            <h2 className="text-2xl font-bold text-white flex items-center justify-center space-x-3">
              <BiryaniIcon className="h-8 w-8" />
              <span>{theme.labels.leaderboardTitle}</span>
              <BiryaniIcon className="h-8 w-8" />
            </h2>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-20">
              <BiryaniIcon className="h-16 w-16 mx-auto mb-6 opacity-50" />
              <h3 className="text-2xl font-bold text-gray-600 mb-2">No participants yet</h3>
              <p className="text-gray-500 text-lg">Be the first to join the {theme.name}!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-8 hover:bg-gray-50 transition-all duration-300 animate-slide-in-left ${
                    user.rank === 1 ? 'bg-gradient-to-r from-yellow-50/50 to-orange-50/50' : 
                    user.rank <= 3 ? 'bg-gradient-to-r from-orange-50/30 to-red-50/30' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0 relative">
                      {getRankIcon(user.rank)}
                      {user.rank === 1 && (
                        <div className="absolute -top-3 -right-3 animate-bounce">
                          <Crown className="h-6 w-6 text-yellow-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="relative">
                      <img
                        src={user.avatar_url}
                        alt={`${user.username}'s avatar`}
                        className="h-16 w-16 rounded-2xl border-4 border-white shadow-lg hover:scale-110 transition-transform duration-300"
                      />
                      {user.rank === 1 && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                          <Crown className="h-3 w-3 text-yellow-800" />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{user.username}</h3>
                        {user.name && user.name !== user.username && (
                          <span className="text-gray-500 font-medium">({user.name})</span>
                        )}
                        {user.rank === 1 && (
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                            <Crown className="h-4 w-4" />
                            <span>Champion!</span>
                          </span>
                        )}
                        <a
                          href={`https://github.com/${user.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-110"
                          style={{ color: theme.primaryColor }}
                          title={`View ${user.username}'s GitHub profile`}
                        >
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        {user.public_repos && (
                          <span className="flex items-center space-x-1">
                            <Github className="h-4 w-4" />
                            <span>{user.public_repos} repos</span>
                          </span>
                        )}
                        {user.followers && (
                          <span className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{user.followers} followers</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-800 mb-1">{user.commits}</div>
                      <div className="text-sm text-gray-500 font-medium">{theme.labels.commitLabel.toLowerCase()}</div>
                    </div>
                    
                    {user.rank <= 3 && (
                      <div 
                        className={`bg-gradient-to-r ${getRankBadge(user.rank)} text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg`}
                        style={getRankStyle(user.rank)}
                      >
                        #{user.rank}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;