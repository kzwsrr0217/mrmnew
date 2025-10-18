// mrmnew/frontend/src/auth/AuthContext.tsx

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { getNotifications } from '../services/api.service';

interface NotificationData {
  openTickets: any[];
  pendingApprovals: any[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  notifications: NotificationData;
  fetchNotifications: () => void; // Hozzáadjuk ezt, hogy manuálisan is frissíthessünk
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [notifications, setNotifications] = useState<NotificationData>({ openTickets: [], pendingApprovals: [] });
  const isAuthenticated = !!user;

  const fetchNotifications = async () => {
    if (isAuthenticated) {
      try {
        const res = await getNotifications();
        setNotifications(res.data);
      } catch (error) {
        console.error("Értesítések betöltése sikertelen", error);
        setNotifications({ openTickets: [], pendingApprovals: [] }); 
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [isAuthenticated]);

  const login = (token: string, userData: any) => {
    localStorage.setItem('access_token', token);
    const userToStore = {
      id: userData.id,
      username: userData.username,
      role: userData.role,
    };
    localStorage.setItem('user', JSON.stringify(userToStore));
    setUser(userToStore);
    
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    setNotifications({ openTickets: [], pendingApprovals: [] });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, notifications, fetchNotifications, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}