import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Organization } from "../api/auth";

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  token: string | null;
  login: (token: string, user: User, organization: Organization) => void;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("proqure_token");
      const storedUser = localStorage.getItem("proqure_user");
      const storedOrg = localStorage.getItem("proqure_org");

      if (storedToken && storedUser && storedOrg) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setOrganization(JSON.parse(storedOrg));
      }
    } catch (e) {
      console.error("Error loading stored auth state", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User, newOrg: Organization) => {
    localStorage.setItem("proqure_token", newToken);
    localStorage.setItem("proqure_user", JSON.stringify(newUser));
    localStorage.setItem("proqure_org", JSON.stringify(newOrg));
    setToken(newToken);
    setUser(newUser);
    setOrganization(newOrg);
  };

  const logout = () => {
    localStorage.removeItem("proqure_token");
    localStorage.removeItem("proqure_user");
    localStorage.removeItem("proqure_org");
    setToken(null);
    setUser(null);
    setOrganization(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        token,
        login,
        logout,
        isLoading,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
