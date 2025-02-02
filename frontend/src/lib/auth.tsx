import { configureAuth } from 'react-query-auth';
import { Navigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { User } from '@/types/api';
import { api } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';

const getUser = async (): Promise<User | null> => {
  const token = localStorage.getItem('authToken');

  if (!token) return null;

  try {
    const response = await api.get('/users/profile/');
    return response?.data as User;
  } catch (error) {
    console.error('Error fetching user:', error);
    localStorage.removeItem('authToken');
    return null;
  }
};

export const loginInputSchema = z.object({
  username: z.string().min(1, 'Required'),
  password: z.string().min(5, 'Required'),
});

export const registerInputSchema = z.object({
  username: z.string().min(1, 'Required'),
  password: z.string().min(5, 'Required'),
  email: z.string().email('Invalid email address'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
export type RegisterInput = z.infer<typeof registerInputSchema>;
export type AuthResponse = {
  success: true,
  meta: {
    timestamp: string;
    request_id: string;
    version: string;
  },
  status: number;
  data: {
    token: string;
    user: User;
  };
};

const authConfig = {
  userFn: getUser,
  loginFn: async (data: LoginInput) => {
    const response = await api.post<AuthResponse>('/auth/login/', data);
    if (!response.data) {
      throw new Error('No data in response');
    }
    const { token, user } = response.data;
    localStorage.setItem('authToken', token);
    console.log('user', user);
    
    // Return the user directly as required by react-query-auth
    return user;
  },
  registerFn: async (data: RegisterInput) => {
    const response = await api.post('/auth/register/', data);
    const { token, user } = response as { token: string; user: User };
    localStorage.setItem('authToken', token);
    
    // Return the user directly
    return user;
  },
  logoutFn: async () => {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
    localStorage.removeItem('authToken');
  },
};

export const { useUser, useLogin, useLogout, useRegister, AuthLoader } = configureAuth(authConfig);

// Custom hook to handle login with proper query invalidation
export const useAuthLogin = () => {
  const login = useLogin();
  const queryClient = useQueryClient();

  return {
    ...login,
    mutate: async (data: LoginInput) => {
      const user = await login.mutate(data);
      // Force invalidate the user query after login
      await queryClient.invalidateQueries({ queryKey: ['authenticated-user'] });
      return user.data;
    }
  };
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { data: user, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to={`/login?redirectTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
};