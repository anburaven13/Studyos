import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './firebase';

type User = {
  id: number;
  email: string;
  class_level?: string;
  board?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  syncUser: (token: string) => Promise<User>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUser = async (authToken: string): Promise<User> => {
    const res = await fetch('/api/user/me', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to sync user');
    setUser(data.user);
    return data.user;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const authToken = await firebaseUser.getIdToken();
          setToken(authToken);
          localStorage.setItem('token', authToken); // FIX: components read from localStorage
          await syncUser(authToken);
        } catch (error) {
          console.error('Error syncing user:', error);
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
        }
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      }
      setLoading(false);
    });

    return () => unsubscribe();
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
    <AuthContext.Provider value={{ user, token, loading, logout, updateUser, syncUser }}>
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
