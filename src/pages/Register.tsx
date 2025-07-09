import React, { useState } from 'react';
import { UserPlus, CheckCircle, AlertCircle, User, ExternalLink, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
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
      
      setMessage('🎉 Welcome to the challenge! Check the leaderboard to see your progress.');
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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="card-hover bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-scale-in">
          {/* Header */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
              <div 
                className="absolute inset-0 rounded-full animate-pulse"
                style={{ backgroundColor: `${theme.primaryColor}20` }}
              ></div>
              <BiryaniIcon className="h-12 w-12 animate-float" />
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-bounce" />
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-3">
              Join the Challenge
            </h1>
            <p className="text-gray-600 text-lg">
              {theme.labels.subtitle}
            </p>
          </div>

          {step === 'input' && (
            <form onSubmit={handleUsernameSubmit} className="space-y-6 animate-slide-up stagger-2">
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                  GitHub Username
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your-github-username"
                    className="w-full px-6 py-4 pl-14 bg-gray-50 border-2 border-gray-200 rounded-2xl focus-ring transition-all duration-300 text-lg font-medium group-hover:border-gray-300"
                    disabled={isValidating}
                  />
                  <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                    <SpiceIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isValidating || !username.trim()}
                className="btn-primary w-full py-4 px-8 rounded-2xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                {isValidating ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Validating...</span>
                  </>
                ) : (
                  <>
                    <User className="h-6 w-6" />
                    <span>Validate Account</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'confirm' && githubUser && (
            <div className="space-y-6 animate-scale-in">
              <div className="text-center animate-slide-up">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirm Your Account</h2>
                <p className="text-gray-600">
                  Ready to join the challenge?
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 animate-slide-up stagger-1">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <img
                      src={githubUser.avatar_url}
                      alt={`${githubUser.login}'s avatar`}
                      className="h-20 w-20 rounded-2xl border-4 border-white shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-800 truncate">
                        {githubUser.name || githubUser.login}
                      </h3>
                      <a
                        href={`https://github.com/${githubUser.login}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-lg hover:bg-white/50 transition-colors"
                        style={{ color: theme.primaryColor }}
                        title="View GitHub profile"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    
                    <p className="text-gray-600 font-medium mb-3">@{githubUser.login}</p>
                    
                    {githubUser.bio && (
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">{githubUser.bio}</p>
                    )}
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                        <div className="text-xl font-bold text-gray-800">{githubUser.public_repos}</div>
                        <div className="text-xs text-gray-500 font-medium">Repos</div>
                      </div>
                      <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                        <div className="text-xl font-bold text-gray-800">{githubUser.followers}</div>
                        <div className="text-xs text-gray-500 font-medium">Followers</div>
                      </div>
                      <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                        <div className="text-xl font-bold text-gray-800">{githubUser.following}</div>
                        <div className="text-xs text-gray-500 font-medium">Following</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-1 text-xs text-gray-500">
                      {githubUser.location && (
                        <p className="flex items-center">
                          <span className="mr-2">📍</span>
                          {githubUser.location}
                        </p>
                      )}
                      {githubUser.company && (
                        <p className="flex items-center">
                          <span className="mr-2">🏢</span>
                          {githubUser.company}
                        </p>
                      )}
                      <p className="flex items-center">
                        <span className="mr-2">📅</span>
                        Joined {formatDate(githubUser.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 animate-slide-up stagger-2">
                <button
                  onClick={handleBackToInput}
                  className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back</span>
                </button>
                
                <button
                  onClick={handleConfirmRegistration}
                  disabled={isRegistering}
                  className="btn-primary flex-1 py-4 px-6 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isRegistering ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" />
                      <span>Join Challenge</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {message && (
            <div className={`mt-6 flex items-center space-x-3 p-4 rounded-2xl animate-slide-up ${
              messageType === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {messageType === 'success' ? (
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
              )}
              <span className={`font-medium ${
                messageType === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;