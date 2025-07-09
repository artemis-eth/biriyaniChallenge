// GitHub API client for frontend-only deployment
const GITHUB_API_BASE = 'https://api.github.com';

// Get GitHub token from environment (will be injected at build time)
const getGitHubToken = () => {
  return import.meta.env.VITE_GITHUB_TOKEN;
};

// GitHub API headers with optional token
const getGitHubHeaders = () => {
  const headers: Record<string, string> = {
    'User-Agent': 'GitHub-Leaderboard-App',
    'Accept': 'application/vnd.github.v3+json'
  };
  
  const token = getGitHubToken();
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }
  
  return headers;
};

// Validate GitHub username
export const isValidGitHubUsername = (username: string): boolean => {
  const regex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
  return regex.test(username) && username.length <= 39;
};

// Fetch GitHub user data
export const fetchGitHubUser = async (username: string) => {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/users/${username}`, {
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
    
    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.message.includes('rate limit')) {
      throw error;
    }
    throw new Error('Failed to fetch user data from GitHub');
  }
};

// Fetch user repositories
export const fetchUserRepos = async (username: string) => {
  try {
    let allRepos = [];
    let page = 1;
    const perPage = 100;
    
    while (true) {
      const response = await fetch(
        `${GITHUB_API_BASE}/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated&type=owner`,
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
      
      const ownRepos = repos.filter((repo: any) => !repo.fork);
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
    
    return allRepos;
  } catch (error) {
    console.error(`Error fetching repos for ${username}:`, error);
    return [];
  }
};

// Fetch commits from a repository
export const fetchRepoCommits = async (username: string, repoName: string, since: string, until?: string) => {
  try {
    let url = `${GITHUB_API_BASE}/repos/${username}/${repoName}/commits?author=${username}&since=${since}&per_page=100`;
    
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
    
    return commits.filter((commit: any) => 
      commit.author && 
      commit.author.login && 
      commit.author.login.toLowerCase() === username.toLowerCase()
    );
  } catch (error) {
    console.error(`Error fetching commits for ${username}/${repoName}:`, error);
    return [];
  }
};

// Calculate total commits for a user in the specified time range
export const calculateUserCommits = async (username: string, days = 30) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const since = startDate.toISOString();
  const until = endDate.toISOString();

  try {
    console.log(`Calculating commits for ${username} from ${since} to ${until}`);
    
    const repos = await fetchUserRepos(username);
    console.log(`Found ${repos.length} repositories for ${username}`);
    
    let totalCommits = 0;
    let processedRepos = 0;
    
    const batchSize = 5;
    for (let i = 0; i < repos.length; i += batchSize) {
      const batch = repos.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (repo: any) => {
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
    return totalCommits;
  } catch (error) {
    console.error(`Error calculating commits for ${username}:`, error);
    return 0;
  }
};

// Check GitHub API rate limit
export const checkRateLimit = async () => {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/rate_limit`, {
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
};