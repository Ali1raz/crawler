import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { authClient } from '#/lib/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { registerSchema, type RegisterSchemaType } from './schema';
import { SignInWithGithub } from './signin-with-github';
import { parseAsString, useQueryState } from 'nuqs';

export function RegisterForm() {
  const router = useRouter();
  const [returnTo] = useQueryState('returnTo', parseAsString);
  const [isEmailPending, startEmailTransition] = useTransition();
  const redirectTo = returnTo && returnTo.startsWith('/') ? returnTo : '/dashboard';

  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  function onSubmit(values: RegisterSchemaType) {
    startEmailTransition(async () => {
      await authClient.signUp.email(
        {
          name: values.name,
          email: values.email,
          password: values.password,
          callbackURL: redirectTo,
        },
        {
          onError: ({ error }) => {
            toast.error(error.message ?? 'Registration failed');
          },
          onSuccess: () => {
            toast.success('Account created!');
            router.navigate({ href: redirectTo });
          },
        },
      );
    });
  }

  return (
    <div className="grid gap-4">
      <form id="register-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="flex flex-col gap-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="John"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
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
        <Button disabled={isEmailPending} type="submit" form="register-form">
          {isEmailPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
            </>
          ) : (
            <>Register</>
          )}
        </Button>

        <SignInWithGithub />
      </Field>

      <div className="text-center text-sm">
        Already have an account?{' '}
        <Link
          to="/login"
          search={{ returnTo: returnTo ?? undefined }}
          className="text-primary hover:underline underline-offset-4"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
