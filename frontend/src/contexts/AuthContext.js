import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext(null);
const API = `${process.env.REACT_APP_https://webs-fq0b.onrender.com}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("access_token"));

  const axiosAuth = useCallback(() => {
    const instance = axios.create({
      baseURL: API,
      withCredentials: true,
    });
    if (token) {
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    return instance;
  }, [token]);

  const checkAuth = useCallback(async () => {
    try {
      const api = axiosAuth();
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem("access_token");
    } finally {
      setLoading(false);
    }
  }, [axiosAuth]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const { data } = await axios.post(`${API}/auth/login`, { email, password }, { withCredentials: true });
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
      setToken(data.access_token);
    }
    setUser(data.user);
    return data;
  };

  const register = async (email, password, name, role) => {
    const { data } = await axios.post(`${API}/auth/register`, { email, password, name, role }, { withCredentials: true });
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
      setToken(data.access_token);
    }
    setUser(data.user);
    return data;
  };

  const adminRegister = async (email, password, name, secretCode) => {
    const { data } = await axios.post(`${API}/auth/admin-register`, { email, password, name, secret_code: secretCode }, { withCredentials: true });
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
      setToken(data.access_token);
    }
    setUser(data.user);
    return data;
  };

  const googleCallback = async (credential, role) => {
    const { data } = await axios.post(`${API}/auth/google-callback`, { credential, role }, { withCredentials: true });
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
      setToken(data.access_token);
    }
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch {}
    setUser(null);
    setToken(null);
    localStorage.removeItem("access_token");
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, adminRegister, googleCallback, logout, updateUser, axiosAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
