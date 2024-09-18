import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import logo from '@/assets/cringelogomedium.svg';
import { Link } from '@/components/link/link';
import { toast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

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
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: 'Login attempt:',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <main className="text-foreground bg-background font-inter selection:bg-primary/50 h-screen max-h-[100dvh] overflow-auto flex flex-row flex flex-col h-screen min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
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
