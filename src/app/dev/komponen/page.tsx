import { notFound } from 'next/navigation';
import { ComponentGallery } from '@/components/ui/ComponentGallery';
export default function Page() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return <ComponentGallery />;
}
