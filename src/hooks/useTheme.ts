import { useState, useEffect } from 'react';

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

const defaultTheme: Theme = {
  name: 'Default',
  primaryColor: '#3B82F6',
  accentColor: '#8B5CF6',
  backgroundColor: '#F8FAFC',
  headerImage: '',
  rewardMessage: 'Congratulations to our top contributor!',
  labels: {
    title: 'GitHub Commits Leaderboard',
    subtitle: 'Compete with fellow developers based on your commit activity',
    commitLabel: 'Commits',
    rankLabel: 'Rank',
    leaderboardTitle: 'Leaderboard'
  }
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTheme = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/theme');
      if (response.ok) {
        const themeData = await response.json();
        setTheme({ ...defaultTheme, ...themeData });
      }
    } catch (error) {
      console.error('Error fetching theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTheme();
  }, []);

  const applyThemeStyles = () => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--accent-color', theme.accentColor);
    root.style.setProperty('--background-color', theme.backgroundColor);
  };

  useEffect(() => {
    applyThemeStyles();
  }, [theme]);

  return { theme, isLoading, refetchTheme: fetchTheme };
};