import { Badge } from '#/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card';
import { Skeleton } from '#/components/ui/skeleton';
import { CopyToClipboardButton } from '#/components/copy-to-clipboard-button';
import { getItems } from '#/data/get-items';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Input } from '#/components/ui/input';
import { Button } from '#/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select';
import { ItemStatus } from '#/generated/prisma/enums';
import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import { Suspense, use } from 'react';
import { Clock, User } from 'lucide-react';

const statusOptions = ['all', ...Object.values(ItemStatus)] as const;
type StatusOption = 'all' | ItemStatus;

const filterParsers = {
  search: parseAsString.withDefault(''),
  status: parseAsStringEnum([...statusOptions]).withDefault('all'),
};

export const Route = createFileRoute('/dashboard/items/')({
  validateSearch: (search) => ({
    search: typeof search.search === 'string' ? search.search : undefined,
    status:
      typeof search.status === 'string' &&
      (statusOptions as readonly string[]).includes(search.status) &&
      search.status !== 'all'
        ? (search.status as StatusOption)
        : undefined,
  }),
  loaderDeps: ({ search }) => ({
    search: search.search ?? '',
    status: search.status ?? 'all',
  }),
  component: RouteComponent,
  loader: ({ deps }) => ({ itemsPromise: getItems({ data: deps }) }),
});

function RouteComponent() {
  const { itemsPromise } = Route.useLoaderData();
  const [filters, setFilters] = useQueryStates(filterParsers, {
    history: 'replace',
    clearOnDefault: true,
    shallow: false,
    limitUrlUpdates: { method: 'debounce', timeMs: 500 },
  });

  const hasActiveFilters = filters.search || filters.status !== 'all';

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Your saved items</h1>
        <p className="text-muted-foreground">
          Here are the items you've saved from your crawls.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Search items..."
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value || null })}
        />
        <Select
          value={filters.status}
          onValueChange={(value) =>
            setFilters({
              status: value === 'all' ? null : (value as StatusOption),
            })
          }
        >
          <SelectTrigger className="w-35">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.values(ItemStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={() => setFilters({ search: null, status: null })}
          >
            Clear filters
          </Button>
        )}
      </div>

      <Suspense fallback={<ItemsSkeleton />}>
        <ItemsList
          data={itemsPromise}
          hasActiveFilters={!!hasActiveFilters}
          onClear={() => setFilters({ search: null, status: null })}
        />
      </Suspense>
    </div>
  );
}

function ItemsList({
  data,
  hasActiveFilters,
  onClear,
}: {
  data: ReturnType<typeof getItems>;
  hasActiveFilters: boolean;
  onClear: () => void;
}) {
  const items = use(data);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-5 text-center">
        <div>
          <p className="text-lg font-semibold text-foreground mb-2">
            No items found
          </p>
          <p className="text-muted-foreground">
            {hasActiveFilters
              ? 'Try adjusting your search or filters'
              : 'No saved items yet. Start by saving items from your crawls.'}
          </p>
        </div>
        {hasActiveFilters && (
          <Button variant="outline" onClick={onClear}>
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => (
        <Card
          key={item.id}
          className="group overflow-hidden transition-all hover:shadow-lg pt-0"
        >
          <Link
            to="/dashboard/items/$itemId"
            params={{
              itemId: item.id,
            }}
            className="block"
          >
            <div className="aspect-video w-full overflow-hidden bg-muted">
              {item.ogImage ? (
                <img
                  src={item.ogImage}
                  alt={item.title || 'Saved Item Thumbnail'}
                  className="w-full h-full hover:scale-105 transition-transform object-cover"
                />
              ) : null}
            </div>
          </Link>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <Badge
                variant={item.status === 'COMPLETED' ? 'default' : 'secondary'}
              >
                {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
              </Badge>
              <CopyToClipboardButton link={item.url} />
            </div>
            <CardTitle className="group-hover:text-primary text-xl leading-normal font-semibold hover:underline line-clamp-2 transition-colors underline-offset-4">
              <Link
                to="/dashboard/items/$itemId"
                params={{
                  itemId: item.id,
                }}
              >
                {item.title}
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center mt-auto justify-between">
            <p className="flex items-center gap-2">
              <User className="size-4" />
              {item.author || 'Unknown Author'}
            </p>
            <span className="text-sm text-muted-foreground">
              <Clock className="size-4" />
              {new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ItemsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="overflow-hidden pt-0">
          <Skeleton className="aspect-video w-full rounded-none" />
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="h-5 w-full mt-1" />
            <Skeleton className="h-5 w-3/4" />
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
