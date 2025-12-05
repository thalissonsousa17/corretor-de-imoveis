import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: "CORRETOR" | "CLIENTE";
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await axios.post("/api/logout");
    } catch (error) {
      console.error("Erro ao fazer logout no servidor, mas prosseguindo com o cliente:", error);
    }

    setUser(null);
    router.push("/login");
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get("/api/users/me", { withCredentials: true });
        if (response.data.user) {
          setUser(response.data.user as User);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
