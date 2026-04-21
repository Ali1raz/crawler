import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@tanstack/react-router';
import { useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { authClient } from '#/lib/auth-client';
import { toast } from 'sonner';
import type { User } from 'better-auth';
import { parseAsString, useQueryState } from 'nuqs';

export const profleSchema = z.object({
  name: z.string().min(1, 'Name is required!'),
});

export type ProfleSchemaType = z.infer<typeof profleSchema>;

export function Profileform({ user }: { user: User }) {
  const router = useRouter();
  const [returnTo] = useQueryState('returnTo', parseAsString);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfleSchemaType>({
    resolver: zodResolver(profleSchema),
    defaultValues: {
      name: user.name || '',
    },
  });

  async function onSubmit(values: ProfleSchemaType) {
    startTransition(async () => {
      await authClient.updateUser({
        name: values.name,
        fetchOptions: {
          onError: ({ error }) => {
            toast.error(error.message);
          },
          onSuccess: () => {
            router.navigate({
              href: returnTo && returnTo.startsWith('/') ? returnTo : '/',
            });
            toast.success('Profile updated successfully!');
          },
        },
      });
    });
  }
  return (
    <div className="grid gap-4">
      <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="flex flex-col gap-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Your Name</FieldLabel>
                <Input
                  {...field}
                  type="text"
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Ali Raza"
                  autoComplete="name"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </form>
      <Field className="sm:mt-4 mt-2 grid sm:grid-cols-2">
        <Button disabled={isPending} type="submit" form="profile-form">
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Updating profile...
            </>
          ) : (
            <>Update Profile</>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.navigate({ to: returnTo || '/' })}
        >
          Back
        </Button>
      </Field>
    </div>
  );
}
