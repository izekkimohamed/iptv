import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Scores - Sports Updates',
  description: 'Get real-time sports scores and match updates.',
};

import LiveScores from '@/shared/components/365/LiveScores';

function page() {
  return <LiveScores />;
}

export default page;
