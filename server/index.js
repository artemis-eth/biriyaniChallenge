import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Simple JSON file database
const DB_PATH = './server/users.json';
const CACHE_PATH = './server/cache.json';
const THEME_PATH = './server/theme.json';

// Admin credentials (in production, use proper authentication)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

// Initialize cache file if it doesn't exist
if (!fs.existsSync(CACHE_PATH)) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify({}));
}

// Initialize theme file if it doesn't exist
if (!fs.existsSync(THEME_PATH)) {
  const defaultTheme = {
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
  fs.writeFileSync(THEME_PATH, JSON.stringify(defaultTheme, null, 2));
}

// Helper function to read theme
function readTheme() {
  try {
    const data = fs.readFileSync(THEME_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// Helper function to write theme
function writeTheme(data) {
  fs.writeFileSync(THEME_PATH, JSON.stringify(data, null, 2));
}

// Helper function to read database
function readDatabase() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Helper function to write database
function writeDatabase(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Helper function to read cache
function readCache() {
  try {
    const data = fs.readFileSync(CACHE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// Helper function to write cache
function writeCache(data) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));
}

// Cache management
function getCachedData(key, maxAge = 3600000) { // 1 hour default
  const cache = readCache();
  const cached = cache[key];
  
  if (cached && (Date.now() - cached.timestamp) < maxAge) {
    return cached.data;
  }
  
  return null;
}

function setCachedData(key, data) {
  const cache = readCache();
  cache[key] = {
    data,
    timestamp: Date.now()
  };
  writeCache(cache);
}

// Validate GitHub username
function isValidGitHubUsername(username) {
  const regex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
  return regex.test(username) && username.length <= 39;
}

// GitHub API headers with optional token
function getGitHubHeaders() {
  const headers = {
    'User-Agent': 'GitHub-Leaderboard-App',
    'Accept': 'application/vnd.github.v3+json'
  };
  
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }
  
  return headers;
}

// Fetch GitHub user data with caching
async function fetchGitHubUser(username) {
  const cacheKey = `user_${username}`;
  const cached = getCachedData(cacheKey, 1800000); // 30 minutes cache
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: getGitHubHeaders()
    });
    
    if (response.status === 404) {
      throw new Error('GitHub user not found');
    }
    
    if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please try again later.');
    }
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const userData = await response.json();
    setCachedData(cacheKey, userData);
    return userData;
  } catch (error) {
    if (error.message.includes('rate limit')) {
      throw error;
    }
    throw new Error('Failed to fetch user data from GitHub');
  }
}

// Fetch user repositories with caching
async function fetchUserRepos(username) {
  const cacheKey = `repos_${username}`;
  const cached = getCachedData(cacheKey, 1800000); // 30 minutes cache
  
  if (cached) {
    return cached;
  }

  try {
    let allRepos = [];
    let page = 1;
    const perPage = 100;
    
    while (true) {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated&type=owner`,
        { headers: getGitHubHeaders() }
      );
      
      if (!response.ok) {
        if (response.status === 403) {
          console.warn(`Rate limit hit while fetching repos for ${username}`);
          break;
        }
        throw new Error(`Failed to fetch repositories: ${response.status}`);
      }
      
      const repos = await response.json();
      
      if (repos.length === 0) {
        break;
      }
      
      const ownRepos = repos.filter(repo => !repo.fork);
      allRepos = allRepos.concat(ownRepos);
      
      if (repos.length < perPage) {
        break;
      }
      
      page++;
      
      if (page > 10) {
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setCachedData(cacheKey, allRepos);
    return allRepos;
  } catch (error) {
    console.error(`Error fetching repos for ${username}:`, error);
    return [];
  }
}

// Fetch commits from a repository with caching
async function fetchRepoCommits(username, repoName, since, until = null) {
  const cacheKey = `commits_${username}_${repoName}_${since}_${until}`;
  const cached = getCachedData(cacheKey, 900000); // 15 minutes cache for commits
  
  if (cached) {
    return cached;
  }

  try {
    let url = `https://api.github.com/repos/${username}/${repoName}/commits?author=${username}&since=${since}&per_page=100`;
    
    if (until) {
      url += `&until=${until}`;
    }
    
    const response = await fetch(url, {
      headers: getGitHubHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 403) {
        console.warn(`Rate limit hit while fetching commits for ${username}/${repoName}`);
        return [];
      }
      if (response.status === 409) {
        return [];
      }
      return [];
    }
    
    const commits = await response.json();
    
    const filteredCommits = commits.filter(commit => 
      commit.author && 
      commit.author.login && 
      commit.author.login.toLowerCase() === username.toLowerCase()
    );
    
    setCachedData(cacheKey, filteredCommits);
    return filteredCommits;
  } catch (error) {
    console.error(`Error fetching commits for ${username}/${repoName}:`, error);
    return [];
  }
}

// Calculate total commits for a user in the specified time range
async function calculateUserCommits(username, days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const since = startDate.toISOString();
  const until = endDate.toISOString();

  const cacheKey = `user_commits_${username}_${days}_${startDate.toDateString()}`;
  const cached = getCachedData(cacheKey, 1800000); // 30 minutes cache
  
  if (cached !== null) {
    return cached;
  }

  try {
    console.log(`Calculating commits for ${username} from ${since} to ${until}`);
    
    const repos = await fetchUserRepos(username);
    console.log(`Found ${repos.length} repositories for ${username}`);
    
    let totalCommits = 0;
    let processedRepos = 0;
    
    const batchSize = 5;
    for (let i = 0; i < repos.length; i += batchSize) {
      const batch = repos.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (repo) => {
        if (repo.archived) {
          return 0;
        }
        
        const repoUpdated = new Date(repo.updated_at);
        if (repoUpdated < startDate) {
          return 0;
        }
        
        const commits = await fetchRepoCommits(username, repo.name, since, until);
        console.log(`${username}/${repo.name}: ${commits.length} commits`);
        
        return commits.length;
      });
      
      const batchResults = await Promise.all(batchPromises);
      totalCommits += batchResults.reduce((sum, count) => sum + count, 0);
      processedRepos += batch.length;
      
      if (i + batchSize < repos.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.log(`Total commits for ${username}: ${totalCommits} (processed ${processedRepos} repos)`);
    setCachedData(cacheKey, totalCommits);
    return totalCommits;
  } catch (error) {
    console.error(`Error calculating commits for ${username}:`, error);
    return 0;
  }
}

// Check GitHub API rate limit
async function checkRateLimit() {
  try {
    const response = await fetch('https://api.github.com/rate_limit', {
      headers: getGitHubHeaders()
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.rate;
    }
  } catch (error) {
    console.error('Error checking rate limit:', error);
  }
  
  return null;
}

// Admin authentication middleware
function authenticateAdmin(req, res, next) {
  const { username, password } = req.body;
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
}

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ 
      success: true, 
      message: 'Admin authenticated successfully',
      token: 'admin-token' // In production, use proper JWT tokens
    });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
});

// Admin get leaderboard with custom time period
app.post('/api/admin/leaderboard', authenticateAdmin, async (req, res) => {
  const { days = 30, refresh = false } = req.body;
  const users = readDatabase();
  
  if (users.length === 0) {
    return res.json([]);
  }

  try {
    const cacheKey = `admin_leaderboard_${days}`;
    let updatedUsers = users;

    if (refresh || !getCachedData(cacheKey, 1800000)) {
      console.log(`Admin refreshing commit data for ${days} days...`);
      
      const rateLimit = await checkRateLimit();
      if (rateLimit && rateLimit.remaining < users.length * 10) {
        console.warn('Insufficient API calls remaining, using cached data');
        return res.json(users.map((user, index) => ({ ...user, rank: index + 1 })));
      }

      updatedUsers = await Promise.all(
        users.map(async (user) => {
          try {
            const commits = await calculateUserCommits(user.username, days);
            return {
              ...user,
              commits,
              lastUpdated: new Date().toISOString(),
              timePeriod: days
            };
          } catch (error) {
            console.error(`Error updating commits for ${user.username}:`, error);
            return {
              ...user,
              lastUpdated: new Date().toISOString(),
              timePeriod: days
            };
          }
        })
      );

      setCachedData(cacheKey, updatedUsers);
      writeDatabase(updatedUsers);
    } else {
      updatedUsers = getCachedData(cacheKey);
    }

    const sortedUsers = updatedUsers
      .sort((a, b) => b.commits - a.commits)
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));

    res.json(sortedUsers);
  } catch (error) {
    console.error('Admin leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch admin leaderboard data' });
  }
});

// Admin delete user endpoint
app.post('/api/admin/delete-user', authenticateAdmin, (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const users = readDatabase();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);
    writeDatabase(users);

    // Clear related cache entries
    const cache = readCache();
    const keysToDelete = Object.keys(cache).filter(key => 
      key.includes(deletedUser.username.toLowerCase())
    );
    
    keysToDelete.forEach(key => delete cache[key]);
    writeCache(cache);

    console.log(`Admin deleted user: ${deletedUser.username}`);
    res.json({ 
      success: true, 
      message: `User ${deletedUser.username} deleted successfully`,
      deletedUser 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Admin get cache statistics
app.post('/api/admin/cache-stats', authenticateAdmin, (req, res) => {
  try {
    const cache = readCache();
    const stats = {
      totalEntries: Object.keys(cache).length,
      entries: Object.keys(cache).map(key => ({
        key,
        timestamp: new Date(cache[key].timestamp).toISOString(),
        age: Date.now() - cache[key].timestamp,
        size: JSON.stringify(cache[key].data).length
      })).sort((a, b) => b.timestamp - a.timestamp)
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({ error: 'Failed to get cache statistics' });
  }
});

// Admin clear cache endpoint
app.post('/api/admin/clear-cache', authenticateAdmin, (req, res) => {
  try {
    writeCache({});
    console.log('Admin cleared cache');
    res.json({ success: true, message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Admin get theme endpoint
app.post('/api/admin/theme', authenticateAdmin, (req, res) => {
  try {
    const theme = readTheme();
    res.json(theme);
  } catch (error) {
    console.error('Error getting theme:', error);
    res.status(500).json({ error: 'Failed to get theme data' });
  }
});

// Admin update theme endpoint
app.post('/api/admin/update-theme', authenticateAdmin, (req, res) => {
  const { theme } = req.body;
  
  if (!theme) {
    return res.status(400).json({ error: 'Theme data is required' });
  }

  try {
    writeTheme(theme);
    console.log('Admin updated theme settings');
    res.json({ success: true, message: 'Theme updated successfully', theme });
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({ error: 'Failed to update theme' });
  }
});

// Public theme endpoint
app.get('/api/theme', (req, res) => {
  try {
    const theme = readTheme();
    res.json(theme);
  } catch (error) {
    console.error('Error getting public theme:', error);
    res.status(500).json({ error: 'Failed to get theme data' });
  }
});

// Regular endpoints (existing)
app.post('/api/register', async (req, res) => {
  const { username } = req.body;

  if (!username || !isValidGitHubUsername(username)) {
    return res.status(400).json({ error: 'Invalid GitHub username format' });
  }

  try {
    const rateLimit = await checkRateLimit();
    if (rateLimit && rateLimit.remaining < 10) {
      return res.status(429).json({ 
        error: 'GitHub API rate limit low. Please try again later.',
        resetTime: new Date(rateLimit.reset * 1000).toISOString()
      });
    }

    const githubUser = await fetchGitHubUser(username);
    
    const users = readDatabase();
    
    const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'User already registered' });
    }

    const newUser = {
      id: Date.now(),
      username: githubUser.login,
      avatar_url: githubUser.avatar_url,
      name: githubUser.name || githubUser.login,
      public_repos: githubUser.public_repos,
      followers: githubUser.followers,
      registeredAt: new Date().toISOString(),
      commits: 0,
      lastUpdated: null
    };

    users.push(newUser);
    writeDatabase(users);

    console.log(`User ${githubUser.login} registered successfully`);
    res.json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  const { refresh } = req.query;
  const users = readDatabase();
  
  if (users.length === 0) {
    return res.json([]);
  }

  try {
    const shouldRefresh = refresh === 'true' || users.some(user => {
      if (!user.lastUpdated) return true;
      const lastUpdate = new Date(user.lastUpdated);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return lastUpdate < oneHourAgo;
    });

    let updatedUsers = users;

    if (shouldRefresh) {
      console.log('Refreshing commit data for all users...');
      
      const rateLimit = await checkRateLimit();
      if (rateLimit && rateLimit.remaining < users.length * 10) {
        console.warn('Insufficient API calls remaining, using cached data');
        return res.json(users.map((user, index) => ({ ...user, rank: index + 1 })));
      }

      updatedUsers = await Promise.all(
        users.map(async (user) => {
          try {
            const commits = await calculateUserCommits(user.username);
            return {
              ...user,
              commits,
              lastUpdated: new Date().toISOString()
            };
          } catch (error) {
            console.error(`Error updating commits for ${user.username}:`, error);
            return {
              ...user,
              lastUpdated: new Date().toISOString()
            };
          }
        })
      );

      writeDatabase(updatedUsers);
    }

    const sortedUsers = updatedUsers
      .sort((a, b) => b.commits - a.commits)
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));

    res.json(sortedUsers);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

app.get('/api/stats', (req, res) => {
  const users = readDatabase();
  const totalCommits = users.reduce((sum, user) => sum + (user.commits || 0), 0);
  
  res.json({
    totalUsers: users.length,
    totalCommits,
    lastUpdated: new Date().toISOString()
  });
});

app.get('/api/rate-limit', async (req, res) => {
  try {
    const rateLimit = await checkRateLimit();
    res.json(rateLimit || { error: 'Unable to fetch rate limit' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check rate limit' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    users: readDatabase().length
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('GitHub API integration ready with advanced caching');
  
  checkRateLimit().then(rateLimit => {
    if (rateLimit) {
      console.log(`GitHub API rate limit: ${rateLimit.remaining}/${rateLimit.limit} remaining`);
      console.log(`Rate limit resets at: ${new Date(rateLimit.reset * 1000).toLocaleString()}`);
    }
  });
});