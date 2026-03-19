import { useForm } from '@tanstack/react-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { bulkImportSchema } from './schema';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { mapUrls } from '#/actions/scrape-single';
import type { SearchResultWeb } from '@mendable/firecrawl-js';

interface BulkImportFormProps {
  setUrls: (urls: SearchResultWeb[]) => void;
}

export function BulkImportForm({ setUrls }: BulkImportFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    defaultValues: {
      url: '',
      searchQuery: '',
    },
    validators: {
      onSubmit: bulkImportSchema,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        const urls = await mapUrls({ data: value });
        setUrls(urls);
        toast.success(`Found ${urls.length} urls!`);
      });
    },
  });

  return (
    <div className="grid gap-4 w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field
            name="url"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !!field.state.meta.errors.length;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>URL</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="https://example.com"
                    autoComplete="url"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
          <form.Field
            name="searchQuery"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !!field.state.meta.errors.length;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Search Query</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="e.g. docs, blog"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Import Urls'
            )}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
