import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/services/api.service';

type User = {
  id: string;
  email: string;
  name?: string;
  organizationId?: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string, organizationName?: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isGuest: false,
  login: async () => {},
  register: async () => {},
  loginAsGuest: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in or in guest mode
    const checkAuth = async () => {
      try {
        const guestMode = localStorage.getItem('guest_mode') === 'true';
        if (guestMode) {
          setIsGuest(true);
          setIsLoading(false);
          return;
        }

        const token = localStorage.getItem('auth_token');
        if (token) {
          const { user } = await apiService.getCurrentUser();
          setUser(user);
        }
      } catch (error) {
        // Not authenticated
        apiService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { user } = await apiService.login(email, password);
    setUser(user);
    setIsGuest(false);
    localStorage.removeItem('guest_mode');
  };

  const register = async (email: string, password: string, name?: string, organizationName?: string) => {
    const { user } = await apiService.register(email, password, name, organizationName);
    setUser(user);
    setIsGuest(false);
    localStorage.removeItem('guest_mode');
  };

  const loginAsGuest = () => {
    setUser(null);
    setIsGuest(true);
    localStorage.setItem('guest_mode', 'true');
    localStorage.removeItem('auth_token');
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem('guest_mode');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isGuest,
        login,
        register,
        loginAsGuest,
        logout,
        isAuthenticated: !!user || isGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

