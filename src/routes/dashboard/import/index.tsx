import { BulkImportForm } from '#/components/forms/bulk-import-form';
import { SingleUrlForm } from '#/components/forms/single-url-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Globe, LinkIcon, Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import type { SearchResultWeb } from '@mendable/firecrawl-js';
import { Label } from '#/components/ui/label';
import { Checkbox } from '#/components/ui/checkbox';
import { toast } from 'sonner';
import { bulkScrape } from '#/actions/scrape-single';
import { Button } from '#/components/ui/button';

export const Route = createFileRoute('/dashboard/import/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [bulkImportPending, setBulkImportPending] = useTransition();

  const [urls, setUrls] = useState<Array<SearchResultWeb>>([]);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());

  function handleSelectAll() {
    if (selectedUrls.size === urls.length) {
      setSelectedUrls(new Set());
    } else {
      setSelectedUrls(new Set(urls.map((u) => u.url)));
    }
  }

  function handleSingleUrlSelect(url: string) {
    const newSelectedUrls = new Set(selectedUrls);
    if (newSelectedUrls.has(url)) {
      newSelectedUrls.delete(url);
    } else {
      newSelectedUrls.add(url);
    }
    setSelectedUrls(newSelectedUrls);
  }

  function bulkImportSelectedUrls() {
    setBulkImportPending(async () => {
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
    <div className="flex items-center flex-col gap-8 justify-center h-full">
      <div className="w-full text-center my-2">
        <h1 className="text-2xl font-bold">Import content</h1>
        <p className="text-muted-foreground">
          Save web pages to your library for later reading
        </p>
      </div>
      <div className="w-full max-w-4xl mx-auto">
        <Tabs defaultValue="single">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="single">
              <div className="flex items-center gap-2">
                <LinkIcon />
                Single page
              </div>
            </TabsTrigger>
            <TabsTrigger value="bulk">
              <div className="flex items-center gap-2">
                <Globe className="size-4" />
                Bulk Import
              </div>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle>Import a single web page</CardTitle>
                <CardDescription>
                  Scrape and save content from any web page!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SingleUrlForm />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Import multiple web pages</CardTitle>
                <CardDescription>
                  Scrape and save content from multiple web pages!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BulkImportForm setUrls={setUrls} />
              </CardContent>
            </Card>

            {/* Bulk links here */}
            {
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between w-full">
                    <h1 className="text-xl font-bold">
                      Discovered Links ({urls.length})
                    </h1>
                    <div className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        id="select-all"
                        name="select-all"
                        checked={
                          selectedUrls.size === urls.length && urls.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                      <Label htmlFor="select-all">
                        {selectedUrls.size === urls.length && urls.length > 0
                          ? 'Deselect All'
                          : 'Select All'}
                      </Label>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="">
                  <div className="grid gap-4 max-h-96 overflow-scroll">
                    {urls.map((url, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg group hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center max-w-full overflow-hidden gap-4">
                          <Checkbox
                            id={`checkbox-${index}`}
                            name={`checkbox-${index}`}
                            checked={selectedUrls.has(url.url)}
                            onCheckedChange={() =>
                              handleSingleUrlSelect(url.url)
                            }
                          />
                          <div className="flex flex-col gap-2">
                            <Link
                              to={url.url}
                              className="font-medium text-ellipsis line-clamp-2 max-w-full hover:underline group-hover:text-primary underline-offset-4 transition"
                              target="_blank"
                            >
                              {url.title || url.url}
                            </Link>
                            <p className="text-muted-foreground text-sm text-ellipsis line-clamp-2 max-w-full">
                              {url.description || 'No description found'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={bulkImportSelectedUrls}
                    className="mt-4"
                    disabled={selectedUrls.size === 0 || bulkImportPending}
                  >
                    {bulkImportPending ? (
                      <>
                        <Loader2 className="animate-spin size-4" />
                        Scraping...
                      </>
                    ) : urls.length > 0 ? (
                      selectedUrls.size === 0 ? (
                        'Select URLs to import'
                      ) : (
                        `Scrape ${selectedUrls.size} URL${selectedUrls.size > 1 ? 's' : ''}`
                      )
                    ) : (
                      'Import URLs to scrape'
                    )}
                  </Button>
                </CardContent>
              </Card>
            }
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
