import { configureAuth } from 'react-query-auth';
import { Navigate, useLocation } from 'react-router-dom';
import { z } from 'zod';

import { AuthResponse, User } from '@/types/api';

import { api } from '@/lib/api-client';

const getUser = async (): Promise<User | null> => {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }

  try {
    // Updated endpoint to fetch the current user
    const response = await api.get<User>('/users/me/');
    return response;
  } catch (error) {
    console.error('Error fetching user:', error);
    localStorage.removeItem('token');
    return null;
  }
};

export const logout = async () => {
  await api.post('/auth/logout/');
  localStorage.removeItem('token');
};

export const loginInputSchema = z.object({
  username: z.string().min(1, 'Required'),
  password: z.string().min(5, 'Required'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

const loginWithEmailAndPassword = async (data: LoginInput): Promise<AuthResponse> => {
  const response = await api.post<{ token: string; user: User }>('/auth/login/', data);
  localStorage.setItem('token', response.token);
  return { user: response.user, token: response.token };
};

export const registerInputSchema = z.object({
  username: z.string().min(1, 'Required'),
  email: z.string().min(1, 'Required').email('Invalid email'),
  password: z.string().min(5, 'Required'),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;

const registerWithEmailAndPassword = async (data: RegisterInput): Promise<AuthResponse> => {
  const response = await api.post<{ token: string; user: User }>('/auth/register/', data);
  localStorage.setItem('token', response.token);
  return { user: response.user, token: response.token };
};

const authConfig = {
  userFn: getUser,
  loginFn: async (data: LoginInput) => {
    const response = await loginWithEmailAndPassword(data);
    return response.user;
  },
  registerFn: async (data: RegisterInput) => {
    const response = await registerWithEmailAndPassword(data);
    return response.user;
  },
  logoutFn: logout,
};

export const { useUser, useLogin, useLogout, useRegister, AuthLoader } = configureAuth(authConfig);

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();
  const location = useLocation();

  if (!user.data) {
    return <Navigate to={`/login?redirectTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
};
