import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import logo from '@/assets/cringelogomedium.svg';
import { Link } from '@/components/link/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLogin } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';

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
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

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
      
      toast({
        title: "Success",
        description: "Login successful",
      });
  
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Login failed",
      });
    }
  }

  return (
    <main className="flex flex-col place-items-center bg-background selection:bg-primary/50 px-6 lg:px-8 py-24 sm:py-32 h-screen min-h-full max-h-[100dvh] font-inter text-foreground overflow-auto">
      <img src={logo} className="size-24" />
      <p className="mt-2 font-semibold text-4xl">CringeGPT™</p>
      <p className="mt-1 text-muted-foreground">An Open Source Software provided by CringeAI</p>
      <div className="flex flex-col justify-center pt-8 w-[325px]">
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
            <div className="flex justify-end gap-1 pt-4">
              <Button className="w-full">Sign In</Button>
            </div>
            <div className="flex justify-end gap-1">
              <Button variant="secondary" className="w-full">
                Private Chat
              </Button>
            </div>
          </form>
        </Form>
        <div className="flex justify-center gap-1 pt-2 text-center text-sm">
          <p className="text-muted-foreground">Don't have an account?</p>
          <Link to="/register" className="text-sm hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </main>
  );
};
