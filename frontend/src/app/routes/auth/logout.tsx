import logo from '@/assets/cringelogomedium.svg';
import { Link } from '@/components/link/link';
import { useLogout, useUser } from '@/lib/auth';
import { Check, Circle } from 'lucide-react';
import { useMount } from '@/hooks/use-mount';

export const LogoutRoute = () => {
  const { mutate: logout } = useLogout();
  const user = useUser();

  useMount(() => {
    if (user?.data) {
      logout();
    }
  });

  return (
    <main className="text-foreground bg-background font-inter selection:bg-primary/50 max-h-[100dvh] overflow-auto flex flex-col h-screen min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
      <img src={logo} className="size-24" />
      <p className="font-semibold text-4xl mt-2">CringeGPT™</p>
      <div className="pt-16 w-[500px] flex justify-center flex-col">
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-4 w-full items-center transition-all justify-evenly min-h-24">
            <div className="w-[40%] h-0 border border-border animate-fade animate-once animate-duration-1000 animate-delay-[250ms] animate-ease-in-out" />
            <div className="relative w-12 h-12 flex items-center justify-center">
              <Circle
                strokeWidth={2}
                className="absolute size-12 stroke-success animate-fade animate-once animate-duration-1000 animate-delay-[250ms] animate-ease-in-out"
              />
              <Check
                strokeWidth={3}
                className="absolute size-6 stroke-success animate-spin animate-once animate-duration-500 animate-delay-100 animate-ease-in-out"
              />
            </div>
            <div className="w-[40%] h-0 border border-border animate-fade animate-once animate-duration-1000 animate-delay-[250ms] animate-ease-in-out" />
          </div>
        </div>
        <div className="mt-1.5 flex flex-col items-center text-xs text-center justify-center gap-1 animate-fade animate-once animate-duration-1000 animate-delay-[250ms] animate-ease-in-out">
          <div className="text-muted-foreground text-md mt-2">
            You have been successfully logged out.
          </div>
          <div className="flex gap-1">
            Please
            <Link to="/login" className="underline hover:text-primary">
              click here
            </Link>
            to login again
          </div>
        </div>
      </div>
    </main>
  );
};
