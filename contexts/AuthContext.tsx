import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '@/services/api.service';

interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  birthDate?: string;
  readingStats?: {
    booksRead: number;
    pagesRead: number;
    readingStreak: number;
    lastReadDate?: string;
  };
  favoriteGenres?: string[];
  favoriteBooks?: Array<{
    title: string;
    author: string;
    coverImage?: string;
  }>;
  privacy?: {
    profileVisibility: 'public' | 'private' | 'friends';
    showReadingStats: boolean;
    showFavoriteBooks: boolean;
  };
  profileCompletion?: number;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      setIsLoading(true);
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      
      console.log('AuthContext: Loading stored auth data');
      console.log('AuthContext: Token found:', !!storedToken);
      console.log('AuthContext: User found:', !!storedUser);
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log('AuthContext: Auth data loaded successfully');
      } else if (storedToken && !storedUser) {
        console.log('AuthContext: Token exists but no user data - attempting to fetch profile');
        // Try to fetch user data using the token
        try {
          const result = await apiService.getProfile();
          if (result.success) {
            const userData = result.user || result.data;
            if (userData) {
              setToken(storedToken);
              setUser(userData);
              await AsyncStorage.setItem('user', JSON.stringify(userData));
              console.log('AuthContext: User data fetched and stored');
            }
          }
        } catch (profileError) {
          console.error('AuthContext: Failed to fetch profile:', profileError);
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (authToken: string, userData: User) => {
    try {
      setToken(authToken);
      setUser(userData);
      
      await AsyncStorage.setItem('token', authToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setToken(null);
      setUser(null);
      
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user) return;
      
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      if (!token) return;
      
      const result = await apiService.getProfile();
      
      if (result.success) {
        const userData = result.user || result.data;
        if (userData) {
          setUser(userData);
          await AsyncStorage.setItem('user', JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};