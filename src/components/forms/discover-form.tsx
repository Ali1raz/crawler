import { useForm } from '@tanstack/react-form';
import { discoverSchema } from './schema';
import { useTransition } from 'react';
import { FieldError, FieldGroup, Field } from '../ui/field';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import type { SearchResultWeb } from '@mendable/firecrawl-js';
import { discoverWebLinks } from '#/actions/discover-web-linsk';
import { toast } from 'sonner';

export function DiscoverForm({
  setSearchResults,
}: {
  setSearchResults: (results: Array<SearchResultWeb>) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    defaultValues: {
      query: '',
    },
    validators: {
      onSubmit: discoverSchema,
    },

    onSubmit: ({ value }) => {
      startTransition(async () => {
        try {
          const items = await discoverWebLinks({ data: value });
          const safeItems = Array.isArray(items) ? items : [];

          setSearchResults(safeItems);
          toast.success(`Found ${safeItems.length} web results!`);
        } catch (e: unknown) {
          setSearchResults([]);
          toast.error(
            `Failed to discover links. ${e instanceof Error ? e.message : 'Unknown error'}`,
          );
        }
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldGroup className="flex sm:flex-row sm:items-baseline gap-4">
        <form.Field
          name="query"
          children={(field) => {
            return (
              <Field data-invalid={!field.state.meta.isValid} className="gap-1">
                {/* <FieldLabel htmlFor={field.name}>Query</FieldLabel> */}
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={!field.state.meta.isValid}
                  placeholder="React server components, Flutter, etc."
                  autoComplete="query"
                />
                {!field.state.meta.isValid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            );
          }}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Searching...
            </>
          ) : (
            'Search'
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
