import { createFileRoute } from '@tanstack/react-router';
import { Globe2Icon } from 'lucide-react';

export const Route = createFileRoute('/dashboard/items/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      Hello "/dashboard/items/"!
      <div>Ali</div>
    </div>
  );
}
