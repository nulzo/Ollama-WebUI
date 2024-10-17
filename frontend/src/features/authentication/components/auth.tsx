import { configureAuth } from 'react-query-auth';
import { Navigate, useLocation } from 'react-router-dom';
import { z } from 'zod';

import { AuthResponse, User } from '@/types/api';

import { api } from '@/lib/api-client';

const getUser = async (): Promise<User | null> => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token); // Debugging line
  if (!token) {
    console.log('No token found, returning null'); // Debugging line
    return null;
  }

  try {
    // Updated endpoint to fetch the current user
    const response = await api.get('/users/me/');
    console.log('Current User:', response);
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
  const response = await api.post('/auth/login/', data);
  const { token, user_id, email } = response.data;
  localStorage.setItem('token', token);
  return { user: { id: user_id, email } };
};

export const registerInputSchema = z.object({
  username: z.string().min(1, 'Required'),
  email: z.string().min(1, 'Required').email('Invalid email'),
  password: z.string().min(5, 'Required'),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;

const registerWithEmailAndPassword = async (data: RegisterInput): Promise<AuthResponse> => {
  const response = await api.post('/auth/register/', data);
  const { token, user_id, email } = response.data;
  localStorage.setItem('token', token);
  return { user: { id: user_id, email } };
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
    return (
      <Navigate to={`/login?redirectTo=${encodeURIComponent(location.pathname)}`} replace />
    );
  }

  return children;
};