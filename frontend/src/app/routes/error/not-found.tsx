import { Link } from '@/components/link/link.tsx';
import { Button } from '@/components/ui/button.tsx';
import { SquareArrowOutUpRight } from 'lucide-react';

export const NotFoundRoute = () => {
  return (
    <main className="flex flex-col h-screen min-h-full place-items-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-primary font-semibold text-3xl">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-muted-foreground sm:text-5xl">
          Page not found!
        </h1>
        <div className="mt-2 text-xl leading-7 text-primary">Ermmmm...</div>
        <div className="mt-6 text-base leading-7 text-muted-foreground">
          The requested page doesn't exist - sorry about that. Have you considered typing in the
          correct URL? #skillissue
        </div>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link to="/" replace>
            <Button
              variant="outline"
              className="border border-primary font-semibold hover:bg-primary/20"
            >
              Go home
            </Button>
          </Link>
          <a
            href="#"
            className="text-sm font-semibold text-muted-foreground justify-items-center items-center flex gap-2 hover:text-primary hover:underline"
          >
            <span>Create Issue</span>
            <SquareArrowOutUpRight className="size-4" />
          </a>
        </div>
      </div>
    </main>
  );
};
