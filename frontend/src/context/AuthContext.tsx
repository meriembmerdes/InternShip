import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth.service';
import type { AuthResponse, AuthUser, LoginFormData, RegisterFormData } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginFormData) => Promise<AuthResponse>;
  register: (payload: RegisterFormData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'internflow_token';

export function AuthProvider({ children }: { children: ReactNode }) {
const [user, setUser] = useState<AuthUser | null>(null);
const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
    const hydrate = async () => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) {
        setIsLoading(false);
        return;
    }

    try {
        const { data } = await authService.getMe();
        setUser(data);
        setToken(savedToken);
    } catch {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
    } finally {
        setIsLoading(false);
    }
    };

    void hydrate();
}, []);

const login = async (payload: LoginFormData): Promise<AuthResponse> => {
    const { data } = await authService.login(payload);
    localStorage.setItem(TOKEN_KEY, data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
    return data;
};

const register = async (payload: RegisterFormData): Promise<AuthResponse> => {
    const { data } = await authService.register(payload);
    localStorage.setItem(TOKEN_KEY, data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
    return data;
};

const logout = async () => {
    try {
    await authService.logout();
    } catch {
      // Silence server-side logout issues and clear client state.
    } finally {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    }
};

const value = useMemo<AuthContextValue>(
    () => ({
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(user && token),
    login,
    register,
    logout,
    }),
    [user, token, isLoading],
);

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
const context = useContext(AuthContext);
if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
}

return context;
}

export function getStoredToken() {
return localStorage.getItem(TOKEN_KEY);
}

export function setStoredAuth(response: AuthResponse) {
localStorage.setItem(TOKEN_KEY, response.accessToken);
}
