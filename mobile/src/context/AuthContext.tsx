import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MobileApi, TokenStorage, clearApiCache } from '../api/client';

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN'
  | 'DIVISION_COORDINATOR' 
  | 'INSTITUTION_HEAD'
  | 'INSTITUTION_MODERATOR' 
  | 'MEMBER'
  | 'DONOR' 
  | 'REQUESTER';

export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  accountStatus: string;
  status?: string;
  gender?: string;
  assignedDivision?: string;
  assignedInstitution?: string;
  requirePasswordChangeAtFirstLogin?: boolean;
  division?: string;
  district?: string;
  upazila?: string;
}

export interface DonorProfile {
  _id: string;
  userId: string;
  displayName: string;
  bloodGroup: string;
  division: string;
  district: string;
  upazila: string;
  bio?: string;
  availabilityStatus: 'available' | 'recently_donated' | 'temporarily_unavailable';
  totalDonations: number;
  lastDonationDate?: string;
  institutionId?: string;
  consentToShareContact: boolean;
  emergencyAvailable: boolean;
  isPubliclyListed: boolean;
}

interface AuthContextType {
  user: User | null;
  donorProfile: DonorProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateAvailability: (status: 'available' | 'recently_donated' | 'temporarily_unavailable') => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [donorProfile, setDonorProfile] = useState<DonorProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = async () => {
    try {
      const storedToken = await TokenStorage.getToken();
      if (storedToken) {
        setToken(storedToken);
        const cached = await TokenStorage.getCachedUser();
        if (cached) {
          setUser(cached.user);
          setDonorProfile(cached.donorProfile);
        }
      }
    } catch (e) {
      console.warn('initAuth local load error:', e);
    } finally {
      // Unblock initial screen rendering immediately
      setIsLoading(false);
    }

    // Asynchronously verify session in background without stalling startup
    try {
      const storedToken = await TokenStorage.getToken();
      if (storedToken) {
        const res = await MobileApi.getCurrentUser();
        if (res.success && res.user) {
          setUser(res.user);
          setDonorProfile(res.donorProfile || null);
          await TokenStorage.saveCachedUser({ user: res.user, donorProfile: res.donorProfile });
        } else {
          // Server rejected user session; revoke cached authentication
          await TokenStorage.clearAll();
          setUser(null);
          setDonorProfile(null);
          setToken(null);
        }
      }
    } catch (serverErr: any) {
      if (serverErr?.message?.includes('401') || serverErr?.message?.includes('অননুমোদিত')) {
        // Session definitively expired on server
        await TokenStorage.clearAll();
        setUser(null);
        setDonorProfile(null);
        setToken(null);
      } else {
        // Ephemeral network outage: retain offline read-only cached profile
        console.warn('Network offline during session verification, keeping local read cache');
      }
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (phone: string, pass: string) => {
    clearApiCache();
    try {
      const res = await MobileApi.login(phone, pass);
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        setDonorProfile(res.donorProfile || null);
        await TokenStorage.saveToken(res.token);
        await TokenStorage.saveCachedUser({ user: res.user, donorProfile: res.donorProfile });
        return { success: true };
      }
      return { success: false, message: res.message || 'লগইন ব্যর্থ হয়েছে।' };
    } catch (err: any) {
      return { success: false, message: err.message || 'নেটওয়ার্ক সংযোগে ত্রুটি দেখা দিয়েছে।' };
    }
  };

  const register = async (data: any) => {
    clearApiCache();
    try {
      const res = await MobileApi.register(data);
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        setDonorProfile(res.donorProfile || null);
        await TokenStorage.saveToken(res.token);
        await TokenStorage.saveCachedUser({ user: res.user, donorProfile: res.donorProfile });
        return { success: true };
      }
      return { success: false, message: res.message || 'নিবন্ধন সম্পন্ন করা যায়নি।' };
    } catch (err: any) {
      return { success: false, message: err.message || 'নিবন্ধন প্রক্রিয়া ব্যর্থ হয়েছে।' };
    }
  };

  const logout = async () => {
    clearApiCache();
    await TokenStorage.clearAll();
    setToken(null);
    setUser(null);
    setDonorProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await MobileApi.getCurrentUser();
      if (res.success && res.user) {
        setUser(res.user);
        setDonorProfile(res.donorProfile || null);
        await TokenStorage.saveCachedUser({ user: res.user, donorProfile: res.donorProfile });
      }
    } catch (e) {}
  };

  const updateAvailability = async (status: 'available' | 'recently_donated' | 'temporarily_unavailable') => {
    try {
      const res = await MobileApi.updateDonorProfile({ availabilityStatus: status });
      if (res.success && (res.donorProfile || res.profile)) {
        setDonorProfile(res.donorProfile || res.profile);
      }
    } catch (e) {
      throw e;
    }
  };

  return (
    <AuthContext.Provider value={{
      user: user ? { ...user, status: user.status || user.accountStatus } : null,
      donorProfile,
      token,
      isLoading,
      login,
      register,
      logout,
      refreshProfile,
      refreshUser: refreshProfile,
      updateAvailability
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
