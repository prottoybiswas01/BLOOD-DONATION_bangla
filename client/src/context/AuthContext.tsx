import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, DonorProfile } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  donorProfile: DonorProfile | null;
  unreadCount: number;
  isLoading: boolean;
  login: (phone: string, pass: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setAuthData: (token: string, user: User, donorProfile?: DonorProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [donorProfile, setDonorProfile] = useState<DonorProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setDonorProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success) {
        setUser(res.user);
        setDonorProfile(res.donorProfile || null);
        setUnreadCount(res.unreadNotifications || 0);
      } else {
        localStorage.removeItem('token');
        setUser(null);
        setDonorProfile(null);
      }
    } catch {
      localStorage.removeItem('token');
      setUser(null);
      setDonorProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (phone: string, pass: string) => {
    try {
      const res = await api.login(phone, pass);
      if (res.success && res.token) {
        localStorage.setItem('token', res.token);
        setUser(res.user);
        setDonorProfile(res.donorProfile || null);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'লগইন ব্যর্থ হয়েছে।' };
    } catch (err: any) {
      return { success: false, message: err.message || 'লগইন ব্যর্থ হয়েছে।' };
    }
  };

  const setAuthData = (token: string, newUser: User, newDonorProfile?: DonorProfile | null) => {
    localStorage.setItem('token', token);
    setUser(newUser);
    if (newDonorProfile !== undefined) {
      setDonorProfile(newDonorProfile);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setDonorProfile(null);
    setUnreadCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        donorProfile,
        unreadCount,
        isLoading,
        login,
        logout,
        refreshUser,
        setAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

