import React from 'react';
import { useUser } from '@/lib/auth';
import logo from '@/assets/cringenobackground.svg';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-2">
        {/* <Loader2 className="size-10 animate-spin" /> */}
        <img src={logo} alt="logo" className="size-10 animate-spin" />
        <span className="text-sm text-muted-foreground">Personalizing your experience...</span>
      </div>
    );
  }

  return <>{children}</>;
};
