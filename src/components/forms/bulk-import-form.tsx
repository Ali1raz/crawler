import { Controller, useForm } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { bulkImportSchema, type BulkImportSchemaType } from './schema';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { useTransition } from 'react';

export function BulkImportForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<BulkImportSchemaType>({
    resolver: zodResolver(bulkImportSchema),
    defaultValues: {
      url: '',
      searchQuery: '',
    },
  });

  async function formSubmit(values: BulkImportSchemaType) {
    startTransition(async () => {
      console.log('Bulk import:', values);
      // await bulkImportFn({ url: values.url, searchQuery: values.searchQuery });
    });
  }

  return (
    <div className="grid gap-4 w-full">
      <form id="bulk-import-form" onSubmit={form.handleSubmit(formSubmit)}>
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
          <Controller
            name="searchQuery"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Search Query</FieldLabel>
                <Input
                  {...field}
                  type="text"
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. docs, blog"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </form>
      <Field className="mt-4">
        <Button disabled={isPending} type="submit" form="bulk-import-form">
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
