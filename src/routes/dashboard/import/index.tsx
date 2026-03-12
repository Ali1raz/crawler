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
import { createFileRoute } from '@tanstack/react-router';
import { Globe, LinkIcon } from 'lucide-react';
export const Route = createFileRoute('/dashboard/import/')({
  component: RouteComponent,
});

function RouteComponent() {
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
                <BulkImportForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
