import { Button } from '../ui/button';

export const MainErrorFallback = () => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center text-red-500" role="alert">
      <h1 className="flex align-middle items-center gap-2 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        This is awkward ...
      </h1>
      <p className="text-xl text-muted-foreground">
        A <em className="font-bold">serious</em> error has occured. Please refresh the page.
      </p>
      <div className="mt-6 flex gap-2 items-center align-middle text-foreground">
        <Button variant="link" onClick={() => window.location.assign(window.location.origin)}>
          Homepage
        </Button>
        <div className="flex items-center align-middle h-full">or</div>
        <Button variant="link" onClick={() => window.location.assign(window.location.origin)}>
          Refresh Page
        </Button>
      </div>
    </div>
  );
};
