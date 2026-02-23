import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Series - Browse TV Shows',
  description: 'Explore and watch your favorite TV series and shows.',
};

import { SeriesPageContent } from './page-client';

export default function SeriesPage() {
  return <SeriesPageContent />;
}
