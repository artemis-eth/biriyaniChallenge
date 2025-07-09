// Simple in-memory store for users (non-persistent)
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
  registeredAt: string;
}

class UserStore {
  private users: User[] = [];
  private listeners: (() => void)[] = [];

  // Get all users
  getUsers(): User[] {
    return [...this.users].sort((a, b) => b.commits - a.commits).map((user, index) => ({
      ...user,
      rank: index + 1
    }));
  }

  // Add a new user
  addUser(userData: Omit<User, 'id' | 'commits' | 'rank' | 'lastUpdated' | 'registeredAt'>): User {
    const existingUser = this.users.find(u => u.username.toLowerCase() === userData.username.toLowerCase());
    if (existingUser) {
      throw new Error('User already registered');
    }

    const newUser: User = {
      ...userData,
      id: Date.now(),
      commits: 0,
      rank: 0,
      lastUpdated: new Date().toISOString(),
      registeredAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.notifyListeners();
    return newUser;
  }

  // Update user commits
  updateUserCommits(username: string, commits: number): void {
    const userIndex = this.users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (userIndex !== -1) {
      this.users[userIndex] = {
        ...this.users[userIndex],
        commits,
        lastUpdated: new Date().toISOString()
      };
      this.notifyListeners();
    }
  }

  // Get user by username
  getUser(username: string): User | undefined {
    return this.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  // Get stats
  getStats() {
    const totalCommits = this.users.reduce((sum, user) => sum + user.commits, 0);
    return {
      totalUsers: this.users.length,
      totalCommits,
      lastUpdated: new Date().toISOString()
    };
  }

  // Subscribe to changes
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // Clear all users (for testing/demo purposes)
  clear(): void {
    this.users = [];
    this.notifyListeners();
  }
}

export const userStore = new UserStore();
export type { User };