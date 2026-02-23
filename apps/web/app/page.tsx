import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IPTV Home - Your Streaming Hub',
  description: 'Browse and watch your favorite movies, series, and live channels all in one place.',
};

import { IPTVHomePageClient } from './page-client';

export default function IPTVHomePage() {
  return <IPTVHomePageClient />;
}
