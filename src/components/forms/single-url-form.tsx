import { Controller, useForm } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  singleUrlImportSchema,
  type SingleUrlImportSchemaType,
} from './schema';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { useTransition } from 'react';

export function SingleUrlForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<SingleUrlImportSchemaType>({
    resolver: zodResolver(singleUrlImportSchema),
    defaultValues: {
      url: '',
    },
  });

  async function formSubmit(values: SingleUrlImportSchemaType) {
    startTransition(async () => {
      console.log('Submitting URL:', values.url);
      //   await scrapeUrlFn({ url: values.url });
    });
  }

  return (
    <div className="grid gap-4 w-full">
      <form id="single-url-form" onSubmit={form.handleSubmit(formSubmit)}>
        <FieldGroup className="flex flex-col gap-4">
          <Controller
            name="url"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>URL</FieldLabel>
                <Input
                  {...field}
                  type="url"
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="https://example.com"
                  autoComplete="url"
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
        <Button disabled={isPending} type="submit" form="single-url-form">
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>Import</>
          )}
        </Button>
      </Field>
    </div>
  );
}
