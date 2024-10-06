import React from 'react';
import { AuthLoader } from '@/lib/auth';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <AuthLoader renderLoading={() => <div>Loading...</div>}>{children}</AuthLoader>;
};
