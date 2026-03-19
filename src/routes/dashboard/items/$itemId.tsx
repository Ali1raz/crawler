import { MessageResponse } from '#/components/ai-elements/message';
import { CopyToClipboardButton } from '#/components/copy-to-clipboard-button';
import { Button, buttonVariants } from '#/components/ui/button';
import { Card, CardContent } from '#/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '#/components/ui/collapsible';
import { getItemById } from '#/data/get-items';
import { cn } from '#/lib/utils';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  Clock,
  User,
} from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/items/$itemId')({
  component: RouteComponent,
  loader: ({ params }) => getItemById({ data: { itemId: params.itemId } }),
});

function RouteComponent() {
  const item = Route.useLoaderData();
  const [contentOpen, setContentOpen] = useState(false);

  return (
    <div className="space-y-6 px-6">
      <Link
        to="/dashboard/items"
        className={buttonVariants({ variant: 'outline' })}
        search={(prev) => ({
          search: prev.search,
          status: prev.status,
        })}
      >
        <ArrowLeft className="inline-block" />
        Back to items
      </Link>
      <div className="relative rounded-lg aspect-video w-full overflow-hidden bg-muted">
        {item.ogImage ? (
          <img
            src={item.ogImage}
            alt={item.title || 'Saved Item Thumbnail'}
            className="w-full h-full hover:scale-105 transition-transform object-cover"
          />
        ) : null}
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-ellipsis">
            {item.title || item.url}
          </h1>
          <div className="flex items-center gap-2">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm flex items-center gap-1 hover:underline"
            >
              Visit Source <ArrowUpRight className="size-4" />
            </a>
            <CopyToClipboardButton link={item.url} />
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-4">
          <p className="flex items-center gap-1">
            <User className="size-4" />
            {item.author || 'Unknown Author'}
          </p>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="size-4" /> created on{' '}
            {new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="size-4" /> published on{' '}
            {new Date(item.publishedAt || item.updatedAt).toLocaleDateString(
              'en-US',
              {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              },
            )}
          </span>
        </div>

        {item.content && (
          <Collapsible open={contentOpen} onOpenChange={setContentOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="font-medium">See Full Content</span>
                <ChevronDown
                  className={cn(
                    contentOpen ? 'rotate-180' : '',
                    'size-4 transition-transform duration-200',
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="mt-2">
                <CardContent>
                  <MessageResponse className="max-w-full">
                    {item.content}
                  </MessageResponse>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}
