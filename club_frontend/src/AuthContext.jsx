import { createContext, useContext, useEffect, useState } from 'react';
import api from './apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAccess = window.localStorage.getItem('accessToken');
    const storedRefresh = window.localStorage.getItem('refreshToken');
    const storedUser = window.localStorage.getItem('authUser');
    if (storedAccess) {
      setAccessToken(storedAccess);
    }
    if (storedRefresh) {
      setRefreshToken(storedRefresh);
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // ignore parse errors
      }
    }
    setLoading(false);
  }, []);

  const fetchAndStoreUser = async (username) => {
    try {
      const res = await api.get('users/');
      const me = (res.data || []).find((u) => u.username === username);
      if (me) {
        const authUser = { username: me.username, club: me.club };
        setUser(authUser);
        window.localStorage.setItem('authUser', JSON.stringify(authUser));
      } else {
        setUser({ username });
      }
    } catch {
      setUser({ username });
    }
  };

  const login = async (username, password) => {
    const response = await api.post('login/', { username, password });
    const { access, refresh } = response.data;

    window.localStorage.setItem('accessToken', access);
    window.localStorage.setItem('refreshToken', refresh);

    setAccessToken(access);
    setRefreshToken(refresh);
    await fetchAndStoreUser(username);
  };

  const logout = () => {
    window.localStorage.removeItem('accessToken');
    window.localStorage.removeItem('refreshToken');
    window.localStorage.removeItem('authUser');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const value = {
    accessToken,
    refreshToken,
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!accessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}


