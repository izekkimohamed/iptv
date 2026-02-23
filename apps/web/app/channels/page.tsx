import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Channels - IPTV Streaming',
  description: 'Watch live TV channels from your playlists.',
};

import { ChannelsPageContent } from './page-client';

export default function ChannelsPage() {
  return <ChannelsPageContent />;
}
