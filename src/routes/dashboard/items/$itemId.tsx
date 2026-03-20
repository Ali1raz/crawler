import { MessageResponse } from '#/components/ai-elements/message';
import { CopyToClipboardButton } from '#/components/copy-to-clipboard-button';
import { Button, buttonVariants } from '#/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '#/components/ui/collapsible';
import { getItemById } from '#/data/get-items';
import { cn } from '#/lib/utils';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  Clock,
  Loader2,
  Sparkles,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { toast } from 'sonner';
import { saveSummaryTags } from '#/data/generate-summary';
import { Badge } from '#/components/ui/badge';

export const Route = createFileRoute('/dashboard/items/$itemId')({
  component: RouteComponent,
  loader: ({ params }) => getItemById({ data: { itemId: params.itemId } }),
});

function RouteComponent() {
  const item = Route.useLoaderData();
  const [contentOpen, setContentOpen] = useState(false);
  const router = useRouter();

  const { complete, completion, isLoading } = useCompletion({
    api: '/api/ai/summary',
    streamProtocol: 'text',
    initialCompletion: item.summary || undefined,
    body: {
      itemId: item.id,
    },
    onError: (error) => toast.error(error.message),
    onFinish: async (_, completion) => {
      try {
        await saveSummaryTags({
          data: { id: item.id, summary: completion },
        });
        toast.success('Summary and tags generated successfully!');
        await router.invalidate();
      } catch {
        toast.error('Summary generated but failed to save. Please try again.');
        // don't invalidate — loader data would be stale/mismatched with displayed completion
      }
    },
  });
  const summaryText = completion || item.summary;

  function handleGenerateSummary() {
    if (!item.content) {
      toast.error('No content available to summarize');
      return;
    }

    complete('Generate summary'); // server uses item.content from DB
  }

  return (
    <div className="space-y-6 md:px-6">
      <Link
        to="/dashboard/items"
        className={buttonVariants({ variant: 'outline' })}
        search={(prev) => ({
          search: prev.search,
          status: prev.status,
        })}
      >
        <ArrowLeft className="size-4" />
        Back to items
      </Link>
      <div className="relative rounded-lg w-full overflow-hidden bg-muted">
        {item.ogImage ? (
          <img
            src={item.ogImage}
            alt={item.title || 'Saved Item Thumbnail'}
            className="w-full max-h-80 hover:scale-105 transition-transform object-cover"
          />
        ) : null}
      </div>
      <div className="space-y-4">
        <div className="flex md:items-center flex-col md:flex-row justify-between md:gap-4 gap-2">
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

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between w-full">
              <h1>Summary</h1>
              {item.content && !summaryText && (
                <Button
                  onClick={handleGenerateSummary}
                  disabled={isLoading}
                  size="sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles />
                      Generate summary
                    </>
                  )}
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              {item.summary
                ? 'Saved AI summary'
                : 'Generate a concise summary from the saved content.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summaryText ? (
              <MessageResponse>{summaryText}</MessageResponse>
            ) : (
              <p className="text-muted-foreground italic">
                {item.content
                  ? 'No summary yet. Generate one with AI.'
                  : 'No content available to summarize.'}
              </p>
            )}
          </CardContent>
        </Card>

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
