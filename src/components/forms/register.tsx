import { authClient } from '#/lib/auth-client';
import { Button } from '#/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '#/components/ui/form';
import { Input } from '#/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { registerSchema, type RegisterSchemaType } from './schema';
import { useTransition } from 'react';
import { SignInWithGithub } from './signin-with-github';

export function RegisterForm() {
  const [isEmailPending, startEmailTransition] = useTransition();

  const router = useRouter();

  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  function onSubmit(values: RegisterSchemaType) {
    startEmailTransition(async () => {
      const { error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      if (error) {
        toast.error(error.message ?? 'Registration failed');
        return;
      } else {
        toast.success('Account created!');
        router.navigate({ to: '/dashboard' });
      }
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" autoComplete="name" {...field} />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  {...field}
                />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="my-4 space-y-2">
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting || isEmailPending}
          >
            {(form.formState.isSubmitting || isEmailPending) && (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            )}
            {form.formState.isSubmitting
              ? 'Creating account…'
              : 'Create Account'}
          </Button>

          <SignInWithGithub />
        </div>

        <p className="text-center text-sm">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </form>
    </Form>
  );
}
