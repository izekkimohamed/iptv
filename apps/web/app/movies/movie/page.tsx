import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Movie Details - Watch Movies',
  description: 'View movie details and start watching your favorite films.',
};

import { MoviePageContent } from './page-client';

export default function Page() {
  return <MoviePageContent />;
}
