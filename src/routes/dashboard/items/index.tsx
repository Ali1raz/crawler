import { Badge } from '#/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card';
import { CopyToClipboardButton } from '#/components/copy-to-clipboard-button';
import { getItems } from '#/data/get-items';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Input } from '#/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select';
import { ItemStatus } from '#/generated/prisma/enums';
import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';

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
  loader: ({ deps }) => getItems({ data: deps }),
});

function RouteComponent() {
  const items = Route.useLoaderData();
  const [filters, setFilters] = useQueryStates(filterParsers);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Your saved items</h1>
        <p className="text-muted-foreground">
          Here are the items you've saved from your crawls.
        </p>
      </div>

      {/* filters: search input and select status */}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <Card
            key={item.id}
            className="group overflow-hidden transition-all hover:shadow-lg pt-0"
          >
            <Link to="/dashboard" className="block">
              <div className="aspect-video w-full overflow-hidden bg-muted">
                {item.ogImage ? (
                  <img
                    src={item.ogImage}
                    alt={item.title || 'Saved Item Thumbnail'}
                    className="w-full h-full group-hover:scale-105 transition-transform object-cover"
                  />
                ) : null}
              </div>
            </Link>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant={
                    item.status === 'COMPLETED' ? 'default' : 'secondary'
                  }
                >
                  {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                </Badge>
                <CopyToClipboardButton link={item.url} />
              </div>
              <CardTitle className="group-hover:text-primary text-xl leading-normal font-semibold hover:underline line-clamp-2 transition-colors underline-offset-4">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center mt-auto justify-between">
              <p>{item.author || 'Unknown Author'}</p>

              <span className="text-sm text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
