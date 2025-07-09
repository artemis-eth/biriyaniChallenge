import React, { useState } from 'react';
import { UserPlus, CheckCircle, AlertCircle, Info, User, ExternalLink, ArrowRight, ArrowLeft } from 'lucide-react';
import { useThemeContext } from '../components/ThemeProvider';
import { BiryaniIcon, SpiceIcon } from '../components/BiryaniElements';
import { fetchGitHubUser, isValidGitHubUsername } from '../api/github';
import { userStore } from '../store/userStore';

interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  location: string | null;
  company: string | null;
}

const Register = () => {
  const { theme } = useThemeContext();
  const [username, setUsername] = useState('');
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [step, setStep] = useState<'input' | 'confirm'>('input');

  const validateGitHubUser = async (usernameToValidate: string) => {
    if (!usernameToValidate.trim() || !isValidGitHubUsername(usernameToValidate.trim())) {
      setMessage('Please enter a valid GitHub username');
      setMessageType('error');
      return;
    }

    setIsValidating(true);
    setMessage('');
    setMessageType('');

    try {
      const userData: GitHubUser = await fetchGitHubUser(usernameToValidate.trim());
      setGithubUser(userData);
      setStep('confirm');
      setMessage('');
      setMessageType('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please check your connection and try again.';
      setMessage(errorMessage);
      setMessageType('error');
      setGithubUser(null);
      setStep('input');
    } finally {
      setIsValidating(false);
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await validateGitHubUser(username);
  };

  const handleConfirmRegistration = async () => {
    if (!githubUser) return;

    setIsRegistering(true);
    setMessage('');
    setMessageType('');

    try {
      userStore.addUser({
        username: githubUser.login,
        avatar_url: githubUser.avatar_url,
        name: githubUser.name || githubUser.login,
        public_repos: githubUser.public_repos,
        followers: githubUser.followers
      });
      
      setMessage('Registration successful! You can now check the leaderboard.');
      setMessageType('success');
      setUsername('');
      setGithubUser(null);
      setStep('input');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleBackToInput = () => {
    setStep('input');
    setGithubUser(null);
    setMessage('');
    setMessageType('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <BiryaniIcon className="h-8 w-8" />
          </div>
          <h1 
            className="text-3xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent"
            style={{ 
              backgroundImage: `linear-gradient(to right, ${theme.primaryColor}, ${theme.accentColor})` 
            }}
          >
            Join the {theme.name}!
          </h1>
          <p className="text-gray-600">
            {theme.labels.subtitle}
          </p>
        </div>

        {step === 'input' && (
          <form onSubmit={handleUsernameSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your GitHub username"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  disabled={isValidating}
                />
                <SpiceIcon className="absolute left-4 top-3.5 h-5 w-5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isValidating || !username.trim()}
              className="w-full text-white py-3 px-6 rounded-lg font-medium focus:ring-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover:scale-105 hover:shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
                boxShadow: `0 4px 15px ${theme.primaryColor}40`
              }}
            >
              {isValidating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <User className="h-5 w-5" />
                  <span>Validate Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {step === 'confirm' && githubUser && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Your Account</h2>
              <p className="text-sm text-gray-600 mb-6">
                Is this the correct GitHub account you want to register?
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-start space-x-4">
                <img
                  src={githubUser.avatar_url}
                  alt={`${githubUser.login}'s avatar`}
                  className="h-16 w-16 rounded-full border-2 border-white shadow-md flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                      {githubUser.name || githubUser.login}
                    </h3>
                    <a
                      href={`https://github.com/${githubUser.login}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:scale-110 transition-transform"
                      style={{ color: theme.primaryColor }}
                      title="View GitHub profile"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">@{githubUser.login}</p>
                  
                  {githubUser.bio && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{githubUser.bio}</p>
                  )}
                  
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-white rounded-lg p-2">
                      <div className="text-lg font-bold text-gray-800">{githubUser.public_repos}</div>
                      <div className="text-xs text-gray-500">Repos</div>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <div className="text-lg font-bold text-gray-800">{githubUser.followers}</div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <div className="text-lg font-bold text-gray-800">{githubUser.following}</div>
                      <div className="text-xs text-gray-500">Following</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-1 text-xs text-gray-500">
                    {githubUser.location && (
                      <p>📍 {githubUser.location}</p>
                    )}
                    {githubUser.company && (
                      <p>🏢 {githubUser.company}</p>
                    )}
                    <p>📅 Joined {formatDate(githubUser.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleBackToInput}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              
              <button
                onClick={handleConfirmRegistration}
                disabled={isRegistering}
                className="flex-1 text-white py-3 px-6 rounded-lg font-medium focus:ring-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover:scale-105 hover:shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
                  boxShadow: `0 4px 15px ${theme.primaryColor}40`
                }}
              >
                {isRegistering ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    <span>Confirm & Register</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className={`mt-6 flex items-center space-x-2 p-4 rounded-lg ${
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

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Make sure your GitHub profile is public so we can track your {theme.labels.commitLabel.toLowerCase()}
          </p>

          <div 
            className="mt-6 border rounded-lg p-4"
            style={{ 
              backgroundColor: `${theme.primaryColor}10`,
              borderColor: `${theme.primaryColor}30`
            }}
          >
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: theme.primaryColor }} />
              <div className="text-sm" style={{ color: theme.primaryColor }}>
                <p className="font-medium mb-1">How it works:</p>
                <ul className="space-y-1" style={{ color: `${theme.primaryColor}CC` }}>
                  <li>• We validate your GitHub account before registration</li>
                  <li>• We fetch your public repositories from GitHub</li>
                  <li>• Count {theme.labels.commitLabel.toLowerCase()} from the last 30 days across all repos</li>
                  <li>• Only commits authored by you are counted</li>
                  <li>• Data is updated hourly and cached for performance</li>
                  <li>• {theme.rewardMessage}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;