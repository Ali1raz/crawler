import { authClient } from '#/lib/auth-client';
import { Button } from '#/components/ui/button';

import { Input } from '#/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { loginSchema, type LoginSchemaType } from './schema';
import { SignInWithGithub } from './signin-with-github';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { useTransition } from 'react';
import { parseAsString, useQueryState } from 'nuqs';

export function LoginForm() {
  const router = useRouter();
  const [returnTo] = useQueryState('returnTo', parseAsString);
  const [isEmailPending, startEmailTransition] = useTransition();
  const redirectTo = returnTo && returnTo.startsWith('/') ? returnTo : '/dashboard';

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginSchemaType) {
    startEmailTransition(async () => {
      await authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
          callbackURL: redirectTo,
        },
        {
          onError: ({ error }) => {
            toast.error(error.message);
          },
          onSuccess: () => {
            toast.success('Login success');
            router.navigate({ href: redirectTo });
          },
        },
      );
    });
  }

  return (
    <div className="grid gap-4">
      <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="flex flex-col gap-4">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  {...field}
                  type="email"
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="m@example.com"
                  autoComplete="email"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                </div>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  type="password"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </form>
      <Field className="mt-4 space-y-2">
        <Button disabled={isEmailPending} type="submit" form="login-form">
          {isEmailPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
            </>
          ) : (
            <>Login</>
          )}
        </Button>

        <SignInWithGithub />
      </Field>

      <div className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          search={{ returnTo: returnTo ?? undefined }}
          className="text-primary hover:underline underline-offset-4"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
