import React, { useState, useEffect } from 'react';
import { Medal, Award, Github, ExternalLink, RefreshCw, Users, GitCommit, AlertCircle } from 'lucide-react';
import { useThemeContext } from '../components/ThemeProvider';
import { BiryaniIcon, BiryaniTrophy, SpiceIcon, SteamEffect } from '../components/BiryaniElements';

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
}

interface Stats {
  totalUsers: number;
  totalCommits: number;
  lastUpdated: string;
}

interface RateLimit {
  limit: number;
  remaining: number;
  reset: number;
}
const Leaderboard = () => {
  const { theme } = useThemeContext();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async (forceRefresh = false) => {
    try {
      setError(null);
      const refreshParam = forceRefresh ? '?refresh=true' : '';
      const [usersResponse, statsResponse] = await Promise.all([
        fetch(`http://localhost:3001/api/leaderboard${refreshParam}`),
        fetch('http://localhost:3001/api/stats')
      ]);

      if (!usersResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch data from server');
      }

      const usersData = await usersResponse.json();
      const statsData = await statsResponse.json();

      setUsers(usersData);
      setStats(statsData);
      
      // Fetch rate limit info
      try {
        const rateLimitResponse = await fetch('http://localhost:3001/api/rate-limit');
        if (rateLimitResponse.ok) {
          const rateLimitData = await rateLimitResponse.json();
          setRateLimit(rateLimitData);
        }
      } catch (rateLimitError) {
        console.warn('Could not fetch rate limit info:', rateLimitError);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to load leaderboard data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLeaderboard(true);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <BiryaniTrophy className="h-8 w-8" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-600">{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return `bg-gradient-to-r from-yellow-400 to-yellow-500`;
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400';
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-500';
    return `bg-gradient-to-r`;
  };

  const getRankStyle = (rank: number) => {
    if (rank <= 3) return {};
    return { 
      background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})` 
    };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">
          {isRefreshing ? 'Refreshing commit data...' : 'Loading leaderboard...'}
        </p>
        {isRefreshing && (
          <p className="text-sm text-gray-500 mt-2">
            This may take a moment while we fetch the latest GitHub data
          </p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              fetchLeaderboard();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto">
      {/* Biriyani Header Banner */}
      <div 
        className="relative overflow-hidden rounded-2xl mb-8 p-8 text-white shadow-2xl"
        style={{ 
          background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})` 
        }}
      >
        <SteamEffect className="absolute inset-0" />
        <div className="relative z-10 text-center">
          <div className="flex justify-center items-center space-x-4 mb-4">
            <BiryaniIcon className="h-16 w-16" />
            <h1 className="text-5xl font-bold">{theme.labels.title}</h1>
            <BiryaniIcon className="h-16 w-16" />
          </div>
          <p className="text-xl opacity-90 mb-4">{theme.labels.subtitle}</p>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 inline-block">
            <p className="text-lg font-semibold">{theme.rewardMessage}</p>
          </div>
        </div>
      </div>

      {/* Header */}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Chefs</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8" style={{ color: theme.primaryColor }} />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total {theme.labels.commitLabel}</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalCommits}</p>
              </div>
              <SpiceIcon className="h-8 w-8" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-sm text-gray-800">
                  {new Date(stats.lastUpdated).toLocaleString()}
                </p>
              </div>
              <RefreshCw 
                className={`h-8 w-8 cursor-pointer hover:scale-110 transition-all ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
                style={{ color: theme.accentColor }}
                onClick={handleRefresh}
                title={isRefreshing ? 'Refreshing...' : `Refresh ${theme.labels.commitLabel.toLowerCase()} data`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Rate Limit Info */}
      {rateLimit && (
        <div 
          className="mb-6 border rounded-lg p-4"
          style={{ 
            backgroundColor: `${theme.primaryColor}10`,
            borderColor: `${theme.primaryColor}30`
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Github className="h-5 w-5" style={{ color: theme.primaryColor }} />
              <span className="text-sm font-medium" style={{ color: theme.primaryColor }}>
                GitHub API Status: {rateLimit.remaining}/{rateLimit.limit} requests remaining
              </span>
            </div>
            <span className="text-xs" style={{ color: theme.accentColor }}>
              Resets at {new Date(rateLimit.reset * 1000).toLocaleTimeString()}
            </span>
          </div>
          {rateLimit.remaining < 100 && (
            <p className="text-xs mt-2" style={{ color: `${theme.primaryColor}CC` }}>
              API rate limit is getting low. Data updates may be limited until reset.
            </p>
          )}
        </div>
      )}
      {/* Leaderboard */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div 
          className="px-6 py-4"
          style={{ 
            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})` 
          }}
        >
          <h2 className="text-xl font-bold text-white flex items-center justify-center">
            <BiryaniIcon className="h-6 w-6 mr-2" />
            {theme.labels.leaderboardTitle}
            <BiryaniIcon className="h-6 w-6 ml-2" />
          </h2>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12">
            <BiryaniIcon className="h-12 w-12 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No chefs registered yet</p>
            <p className="text-gray-500 mt-2">Be the first to join the {theme.name}!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-6 hover:bg-gray-50 transition-colors ${
                  user.rank === 1 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 
                  user.rank <= 3 ? 'bg-gradient-to-r from-orange-50 to-red-50' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getRankIcon(user.rank)}
                    {user.rank === 1 && (
                      <div className="absolute -top-2 -right-2 text-xs animate-bounce">👑</div>
                    )}
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
                      {user.rank === 1 && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                          Biriyani Winner! 🍛
                        </span>
                      )}
                      <a
                        href={`https://github.com/${user.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:scale-110 transition-transform"
                        style={{ color: theme.primaryColor }}
                        title={`View ${user.username}'s GitHub profile`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        Last updated: {user.lastUpdated ? new Date(user.lastUpdated).toLocaleString() : 'Never'}
                      </span>
                      {user.public_repos && (
                        <span>{user.public_repos} repos</span>
                      )}
                      {user.followers && (
                        <span>{user.followers} followers</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">{user.commits}</div>
                    <div className="text-sm text-gray-500">{theme.labels.commitLabel.toLowerCase()}</div>
                  </div>
                  
                  {user.rank <= 3 && (
                    <div 
                      className={`${getRankBadge(user.rank)} text-white px-3 py-1 rounded-full text-sm font-medium`}
                      style={getRankStyle(user.rank)}
                    >
                      {theme.labels.rankLabel} #{user.rank}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Data is fetched from the GitHub API and cached for performance. {theme.labels.commitLabel} are based on the last 30 days of activity across all public repositories.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Click the refresh icon to manually update {theme.labels.commitLabel.toLowerCase()} data. Automatic updates occur hourly.
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;