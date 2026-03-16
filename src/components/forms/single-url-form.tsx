import { useForm } from '@tanstack/react-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { singleUrlImportSchema } from './schema';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { useTransition } from 'react';
import { scrapeUrlFn } from '#/actions/scrape-single';
import { toast } from 'sonner';

export function SingleUrlForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    defaultValues: {
      url: '',
    },
    validators: {
      onSubmit: singleUrlImportSchema,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        // console.log('Submitting URL:', value.url);
        await scrapeUrlFn({ data: value });
        toast.success('URL scraped successfully!');
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

          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Import Url'
            )}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
