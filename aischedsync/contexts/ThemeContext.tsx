import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Add isClient state to handle hydration
  const [isClient, setIsClient] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(false);

  // Handle initial theme setup after hydration
  useEffect(() => {
    setIsClient(true);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== null) {
      setIsDark(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
      localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Update localStorage and document class when theme changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDark, isClient]);

  // Listen for system theme changes
  useEffect(() => {
    if (!isClient) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isClient]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  // Don't render anything until after hydration
  if (!isClient) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 