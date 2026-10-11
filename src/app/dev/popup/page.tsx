import { notFound } from 'next/navigation';
import { PopupGallery } from '@/features/qa/PopupGallery';
export default function Page() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return <PopupGallery />;
}
