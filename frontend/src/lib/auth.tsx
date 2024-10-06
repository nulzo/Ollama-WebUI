import { configureAuth } from 'react-query-auth';
import { Navigate, useLocation } from 'react-router-dom';
import { z } from 'zod';

import { AuthResponse, User } from '@/types/api';
import { api } from './api-client';

const getUser = async (): Promise<User | null> => {
  const token = localStorage.getItem('token');
  console.log('Token in getUser:', token);
  if (!token) return null;

  try {
    return await api.get('/user/');
  } catch (error) {
    localStorage.removeItem('token');
    return null;
  }
};

export const logout = async () => {
  await api.post('/auth/logout/');
  localStorage.removeItem('token');
}

export const loginInputSchema = z.object({
  username: z.string().min(1, 'Required'),
  password: z.string().min(1, 'Required'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
const loginWithEmailAndPassword = async (data: LoginInput): Promise<AuthResponse> => {
  try {
    const response: User = await api.post('/auth/login/', data);

    if (response) {
      const { token, user_id, email } = response;
      localStorage.setItem('token', token);
      return { 
        user: { user_id, email, token },
        token 
      };
    } else {
      throw new Error('Login failed: No data in response');
    }
  } catch (error) {
    throw error;
  }
};

export const registerInputSchema = z.object({
  username: z.string().min(1, 'Required'),
  email: z.string().min(1, 'Required').email('Invalid email'),
  password: z.string().min(1, 'Required'),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;
const registerWithEmailAndPassword = async (data: RegisterInput): Promise<AuthResponse> => {
  const response: User = await api.post('/auth/register/', data);
  const { token, user_id, email } = response;
  localStorage.setItem('token', token);
  return { user: { user_id, email, token }, token };
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

export const { useUser, useLogin, useLogout, useRegister, AuthLoader } = configureAuth<
  User | null,
  unknown,
  LoginInput,
  RegisterInput
>(authConfig);

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { data: user, isLoading, isError } = useUser();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    console.error('Error loading user');
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <Navigate to={`/login?redirectTo=${encodeURIComponent(location.pathname)}`} replace />
    );
  }

  return children;
};
