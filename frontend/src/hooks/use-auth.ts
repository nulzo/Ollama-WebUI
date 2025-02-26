import { useUser } from '@/lib/auth';
import { User } from '@/types/user';

export function useAuth() {
  const { data: user, isLoading } = useUser();

  return {
    user: user as User | undefined,
    isLoading,
    isAuthenticated: !!user,
  };
}
