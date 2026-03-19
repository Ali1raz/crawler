import { Header } from '#/components/general/header';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  return (
    <div>
      <Header />
      <main>ali</main>
    </div>
  );
}
