import type { Metadata } from 'next';
import { HelpPage } from '@/features/settings/help-page';

export const metadata: Metadata = { title: 'Bantuan' };

export default function Page() {
  return <HelpPage />;
}
