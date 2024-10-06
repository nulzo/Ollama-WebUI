import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import logo from '@/assets/cringelogomedium.svg';
import { Link } from '@/components/link/link';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLogin } from '@/lib/auth';

// Define schema with both username and password
const FormSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

export const LoginRoute = () => {
  const { toast } = useToast();
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await login.mutateAsync(data);
      
      // Get the redirect URL from the location state or default to '/'
      const from = location.state?.from?.pathname || '/';
      
      toast({
        title: 'Login successful',
        description: 'You have been successfully logged in.',
      });

      // Navigate to the redirect URL
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    }
  }

  return (
    <main className="text-foreground bg-background font-inter selection:bg-primary/50 max-h-[100dvh] overflow-auto flex flex-col h-screen min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
      <img src={logo} className="size-24" />
      <p className="font-semibold text-4xl">CringeGPT™</p>
      <p className="text-muted-foreground">An Open Source Software provided by CringeAI</p>
      <div className="pt-8 w-[325px] flex justify-center flex-col">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input autoComplete="off" placeholder="Username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4 gap-1">
              <Button className="w-full">Sign In</Button>
            </div>
          </form>
        </Form>
        <div className="flex pt-2 text-sm gap-1 text-center justify-center">
          <p className="text-muted-foreground">Don't have an account?</p>
          <Link to="/create-account" className="text-sm hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </main>
  );
};
