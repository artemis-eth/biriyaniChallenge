import { useState, useEffect } from 'react';
import { userStore, User } from '../store/userStore';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initial load
    setUsers(userStore.getUsers());

    // Subscribe to changes
    const unsubscribe = userStore.subscribe(() => {
      setUsers(userStore.getUsers());
    });

    return unsubscribe;
  }, []);

  const refreshUsers = async () => {
    setIsLoading(true);
    try {
      const allUsers = userStore.getUsers();
      
      // Update commits for all users
      const { calculateUserCommits } = await import('../api/github');
      
      for (const user of allUsers) {
        try {
          const commits = await calculateUserCommits(user.username);
          userStore.updateUserCommits(user.username, commits);
        } catch (error) {
          console.error(`Error updating commits for ${user.username}:`, error);
        }
      }
    } catch (error) {
      console.error('Error refreshing users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    isLoading,
    refreshUsers,
    stats: userStore.getStats()
  };
};