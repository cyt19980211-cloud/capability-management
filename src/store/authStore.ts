import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState } from '../types';

interface AuthStore extends AuthState {
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  getUsers: () => Promise<User[]>;
  addUser: (username: string, password: string, role: 'admin' | 'user') => Promise<{ success: boolean; message?: string }>;
  updateUser: (id: string, username: string, password?: string, role?: 'admin' | 'user') => Promise<{ success: boolean; message?: string }>;
  deleteUser: (id: string) => Promise<{ success: boolean; message?: string }>;
}

const DEFAULT_USERS = [
  { id: 'admin', username: 'admin', password: 'admin123', role: 'admin' as const, createdAt: '2024-01-01' },
  { id: 'test', username: 'test', password: 'test123', role: 'user' as const, createdAt: '2024-01-01' }
];

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });
  return response.json();
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,

      login: async (username: string, password: string) => {
        try {
          const isVercel = window.location.hostname.includes('vercel.app') || 
                           window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
          
          if (isVercel) {
            const result = await apiRequest<{ success: boolean; token?: string; user?: User; message?: string }>('/api/login', {
              method: 'POST',
              body: JSON.stringify({ username, password }),
            });
            
            if (result.success && result.token && result.user) {
              localStorage.setItem('auth_token', result.token);
              set({ isAuthenticated: true, user: result.user, token: result.token });
              return { success: true };
            }
            return { success: false, message: result.message || '登录失败' };
          } else {
            const users = JSON.parse(localStorage.getItem('local_users') || JSON.stringify(DEFAULT_USERS));
            const user = users.find((u: any) => u.username === username && u.password === password);
            
            if (user) {
              const token = btoa(JSON.stringify({ userId: user.id, username: user.username, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
              localStorage.setItem('auth_token', token);
              set({ 
                isAuthenticated: true, 
                user: { id: user.id, username: user.username, role: user.role, createdAt: user.createdAt },
                token 
              });
              return { success: true };
            }
            return { success: false, message: '用户名或密码错误' };
          }
        } catch (error) {
          return { success: false, message: '网络错误，请重试' };
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        set({ isAuthenticated: false, user: null, token: null });
      },

      getUsers: async () => {
        try {
          const isVercel = window.location.hostname.includes('vercel.app') || 
                           window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
          
          if (isVercel) {
            const result = await apiRequest<{ success: boolean; users?: User[]; message?: string }>('/api/users');
            return result.users || [];
          } else {
            const users = JSON.parse(localStorage.getItem('local_users') || JSON.stringify(DEFAULT_USERS));
            return users.map((u: any) => ({ id: u.id, username: u.username, role: u.role, createdAt: u.createdAt }));
          }
        } catch (error) {
          return [];
        }
      },

      addUser: async (username: string, password: string, role: 'admin' | 'user') => {
        try {
          const isVercel = window.location.hostname.includes('vercel.app') || 
                           window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
          
          if (isVercel) {
            const result = await apiRequest<{ success: boolean; message?: string }>('/api/users', {
              method: 'POST',
              body: JSON.stringify({ username, password, role }),
            });
            return result;
          } else {
            const users = JSON.parse(localStorage.getItem('local_users') || JSON.stringify(DEFAULT_USERS));
            if (users.find((u: any) => u.username === username)) {
              return { success: false, message: '用户名已存在' };
            }
            const newUser = {
              id: Date.now().toString(),
              username,
              password,
              role,
              createdAt: new Date().toISOString().split('T')[0]
            };
            users.push(newUser);
            localStorage.setItem('local_users', JSON.stringify(users));
            return { success: true };
          }
        } catch (error) {
          return { success: false, message: '网络错误' };
        }
      },

      updateUser: async (id: string, username: string, password?: string, role?: 'admin' | 'user') => {
        try {
          const isVercel = window.location.hostname.includes('vercel.app') || 
                           window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
          
          if (isVercel) {
            const result = await apiRequest<{ success: boolean; message?: string }>(`/api/users/${id}`, {
              method: 'PUT',
              body: JSON.stringify({ username, password, role }),
            });
            return result;
          } else {
            const users = JSON.parse(localStorage.getItem('local_users') || JSON.stringify(DEFAULT_USERS));
            const userIndex = users.findIndex((u: any) => u.id === id);
            if (userIndex === -1) {
              return { success: false, message: '用户不存在' };
            }
            users[userIndex].username = username;
            if (password) users[userIndex].password = password;
            if (role) users[userIndex].role = role;
            localStorage.setItem('local_users', JSON.stringify(users));
            return { success: true };
          }
        } catch (error) {
          return { success: false, message: '网络错误' };
        }
      },

      deleteUser: async (id: string) => {
        try {
          const isVercel = window.location.hostname.includes('vercel.app') || 
                           window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
          
          if (isVercel) {
            const result = await apiRequest<{ success: boolean; message?: string }>(`/api/users/${id}`, {
              method: 'DELETE',
            });
            return result;
          } else {
            let users = JSON.parse(localStorage.getItem('local_users') || JSON.stringify(DEFAULT_USERS));
            users = users.filter((u: any) => u.id !== id);
            localStorage.setItem('local_users', JSON.stringify(users));
            return { success: true };
          }
        } catch (error) {
          return { success: false, message: '网络错误' };
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated, user: state.user, token: state.token }),
    }
  )
);
