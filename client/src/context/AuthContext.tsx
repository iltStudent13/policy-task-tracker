import { useState, useCallback, type ReactNode } from "react";
import api, { TOKEN_KEY, USER_KEY } from "../services/api";
import type { User, LoginResponse, Role, RegisterPayload } from "../types";
import AuthContext from "./AuthContextValue";

function getStoredUser() {
  const storedUser = localStorage.getItem(USER_KEY);
  if (!storedUser) {
    return null;
  }
  try {
    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [loading, setLoading] = useState<boolean>(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async ({
      name,
      email,
      password,
      role,
    }: {
      name: string;
      email: string;
      password: string;
      role?: Role;
    }) => {
      setLoading(true);
      try {
        await api.post<RegisterPayload>("/auth/register", {
          name,
          email,
          password,
          role,
        });
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
