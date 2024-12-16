import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import logo from '@/assets/cringelogomedium.svg';
import { Link } from '@/components/link/link';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useNavigate } from 'react-router-dom';
import { useRegister } from '@/lib/auth';

const FormSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

export const RegisterRoute = () => {
  const { toast } = useToast();
  const register = useRegister();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await register.mutateAsync(data);

      toast({
        title: 'Registration successful',
        description: 'Your account has been created successfully.',
      });

      // Navigate to the login page after successful registration
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: 'There was an error creating your account. Please try again.',
        variant: 'destructive',
      });
    }
  }

  return (
    <main className="text-foreground bg-background font-inter selection:bg-primary/50 max-h-[100dvh] overflow-auto flex flex-col h-screen min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
      <img src={logo} className="size-24" />
      <p className="font-semibold text-4xl mt-2">CringeGPT™</p>
      <p className="text-muted-foreground mt-1">Create an account. Experience Cringe.</p>
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="email" placeholder="Email" {...field} />
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
              <Button className="w-full" type="submit">
                Create Account
              </Button>
            </div>
          </form>
        </Form>
        <div className="flex pt-2 text-sm gap-1 text-center justify-center">
          <p className="text-muted-foreground">Already have an account?</p>
          <Link to="/login" className="text-sm hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
};
