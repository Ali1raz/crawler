import { Header } from '#/components/general/header';
import { Hero } from '#/components/general/hero';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  return (
    <div>
      <Header />
      <Hero />
    </div>
  );
}
