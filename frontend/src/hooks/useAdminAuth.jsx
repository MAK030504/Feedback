import { createContext, useContext, useMemo, useState } from "react";
import { loginAdmin } from "../services/adminApi";

const STORAGE_KEY = "mlsa_admin_token";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => window.localStorage.getItem(STORAGE_KEY));
  const [admin, setAdmin] = useState(null);

  const signIn = async (username, password) => {
    const data = await loginAdmin(username, password);
    window.localStorage.setItem(STORAGE_KEY, data.token);
    setToken(data.token);
    setAdmin(data.admin);
    return data;
  };

  const signOut = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setAdmin(null);
  };

  const value = useMemo(
    () => ({
      token,
      admin,
      isAuthenticated: Boolean(token),
      signIn,
      signOut,
    }),
    [token, admin],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return context;
};
