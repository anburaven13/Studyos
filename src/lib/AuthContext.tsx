import React, { createContext, useContext, useState, useEffect } from 'react';
import { onIdTokenChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './firebase';

type User = {
  id: number;
  email: string;
  class_level?: string;
  board?: string;
  is_2fa_enabled?: boolean;
  username?: string;
  uid?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  requires2FA: boolean;
  setRequires2FA: (val: boolean) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  syncUser: (token: string) => Promise<{user: User, requires2FA: boolean}>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: 1,
    email: 'mock@example.com',
    class_level: 'College',
    uid: 'mockuid'
  });
  const [token, setToken] = useState<string | null>('mocktoken');
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);

  const syncUser = async (authToken: string): Promise<{user: User, requires2FA: boolean}> => {
    return { user: { id: 1, email: 'mock@example.com' }, requires2FA: false };
  };

  useEffect(() => {
    // Mocked out Firebase listener
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, requires2FA, setRequires2FA, logout, updateUser, syncUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
