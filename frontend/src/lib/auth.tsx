import { configureAuth } from 'react-query-auth';
import { Navigate, useLocation } from 'react-router-dom';
import { z } from 'zod';

import { AuthResponse, User } from '@/types/api';

import { api } from '@/lib/api-client';

const getUser = async (): Promise<User | null> => {
  const token = localStorage.getItem('authToken');
  console.log('Token from localStorage:', token);
  if (!token) {
    console.log('No token found, returning null');
    return null;
  }

  try {
    const response = await api.get('/user/current/');
    console.log('Current User:', response);
    return response;
  } catch (error) {
    console.error('Error fetching user:', error);
    localStorage.removeItem('authToken');
    return null;
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout/');
  } catch (error) {
    console.error('Error during logout:', error);
  }
  localStorage.removeItem('authToken');
};

export const loginInputSchema = z.object({
  username: z.string().min(1, 'Required'),
  password: z.string().min(5, 'Required'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

const loginWithEmailAndPassword = async (data: LoginInput): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/login/', data);
    const { token, user } = response;
    localStorage.setItem('authToken', token);
    return { user };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

const registerWithEmailAndPassword = async (data: RegisterInput): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/register/', data);
    const { token, user } = response;
    localStorage.setItem('authToken', token);
    return { user };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

const authConfig = {
  userFn: getUser,
  loginFn: loginWithEmailAndPassword,
  registerFn: registerWithEmailAndPassword,
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
