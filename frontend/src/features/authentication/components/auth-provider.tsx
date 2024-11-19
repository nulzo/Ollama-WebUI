import React from 'react';
import { useUser } from '@/lib/auth';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};
