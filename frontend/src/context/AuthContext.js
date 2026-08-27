'use client';
import { createContext } from 'react';
export const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  authLoading: true,
  isMounted: false,
});
