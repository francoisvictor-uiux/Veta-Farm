import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { login as apiLogin, type LoginRequest, type LoginResponse, getToken, setToken, clearToken, getStoredUser, setStoredUser } from './api';

interface AuthContextType {
  user: LoginResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dto: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginResponse | null>(() => getStoredUser());
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    // Sync from localStorage on mount
    const storedToken = getToken();
    const storedUser = getStoredUser();
    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUser(storedUser);
    }
  }, []);

  const handleLogin = useCallback(async (dto: LoginRequest) => {
    setIsLoading(true);
    try {
      const result = await apiLogin(dto);
      if (result.isSuccess && result.data) {
        setToken(result.data.token);
        setStoredUser(result.data);
        setTokenState(result.data.token);
        setUser(result.data);
      } else {
        throw new Error(result.message || 'فشل تسجيل الدخول');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
    window.location.hash = '#/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login: handleLogin, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
