import { createContext, useContext, useState } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);
const key = 'lab1bd_session';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  });

  async function login(correo, password) {
    const result = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo, password }),
    });
    localStorage.setItem(key, JSON.stringify(result));
    setSession(result);
  }

  function logout() {
    localStorage.removeItem(key);
    setSession(null);
  }

  return <AuthContext.Provider value={{ session, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
