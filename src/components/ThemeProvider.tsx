import React, { createContext, useContext } from 'react';
import { useTheme } from '../hooks/useTheme';

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

interface ThemeContextType {
  theme: Theme;
  isLoading: boolean;
  refetchTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themeData = useTheme();

  return (
    <ThemeContext.Provider value={themeData}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};