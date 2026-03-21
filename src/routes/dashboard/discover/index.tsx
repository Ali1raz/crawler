import { DiscoverForm } from '#/components/forms/discover-form';
import { bulkScrape } from '#/actions/scrape-single';
import { Button } from '#/components/ui/button';
import { Checkbox } from '#/components/ui/checkbox';
import { Label } from '#/components/ui/label';
import type { SearchResultWeb } from '@mendable/firecrawl-js';
import { createFileRoute } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '#/components/ui/card';

export const Route = createFileRoute('/dashboard/discover/')({
  component: RouteComponent,
  errorComponent: () => <div>Failed to load discover page</div>,
});

function RouteComponent() {
  const [isImporting, startImportTransition] = useTransition();
  const [searchResults, setSearchResults] = useState<Array<SearchResultWeb>>(
    [],
  );
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());

  function handleSelectAll() {
    if (selectedUrls.size === searchResults.length) {
      setSelectedUrls(new Set());
      return;
    }

    setSelectedUrls(new Set(searchResults.map((result) => result.url)));
  }

  function handleSingleUrlSelect(url: string) {
    const next = new Set(selectedUrls);

    if (next.has(url)) {
      next.delete(url);
    } else {
      next.add(url);
    }

    setSelectedUrls(next);
  }

  function handleImportSelected() {
    startImportTransition(async () => {
      if (selectedUrls.size === 0) {
        toast.error('Please select at least one URL to import');
        return;
      }

      await bulkScrape({
        data: {
          urls: Array.from(selectedUrls),
        },
      });

      toast.success(`Successfully imported ${selectedUrls.size} URLs!`);
    });
  }

  return (
    <div className="md:px-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Discover</h1>
        <p className="text-sm text-muted-foreground">
          Discover new content and explore the web.
        </p>
      </div>

      <div>
        <DiscoverForm
          setSearchResults={(results) => {
            setSearchResults(results);
            setSelectedUrls(new Set());
          }}
        />
      </div>

      <div className="mt-6">
        {searchResults.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">
                Search Results {searchResults.length}
              </h2>
              <div className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  id="select-all-discovered"
                  name="select-all-discovered"
                  checked={
                    selectedUrls.size === searchResults.length &&
                    searchResults.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all-discovered">
                  {selectedUrls.size === searchResults.length &&
                  searchResults.length > 0
                    ? 'Deselect All'
                    : 'Select All'}
                </Label>
              </div>
            </div>

            <div className="space-y-4 overflow-scroll max-h-96">
              {searchResults.map((result, index) => (
                <Card key={result.url} className="hover:bg-secondary/20">
                  <CardContent className="flex items-baseline gap-3">
                    <Checkbox
                      id={`discover-checkbox-${index}`}
                      name={`discover-checkbox-${index}`}
                      checked={selectedUrls.has(result.url)}
                      onCheckedChange={() => handleSingleUrlSelect(result.url)}
                    />
                    <div className="flex flex-col gap-1">
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-ellipsis line-clamp-1"
                      >
                        {result.title || result.url}
                      </a>
                      <p className="text-sm line-clamp-2 text-ellipsis text-muted-foreground">
                        {result.description || 'No description found'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              onClick={handleImportSelected}
              disabled={selectedUrls.size === 0 || isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Importing...
                </>
              ) : selectedUrls.size > 0 ? (
                `Import ${selectedUrls.size} URL${selectedUrls.size > 1 ? 's' : ''}`
              ) : (
                'Select URLs to import'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
