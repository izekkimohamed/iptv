import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Movies - Watch Films',
  description: 'Browse and watch your favorite movies.',
};

import { MoviesPageContent } from './page-client';

export default function MoviesPage() {
  return <MoviesPageContent />;
}
