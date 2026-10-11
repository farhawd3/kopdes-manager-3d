import { notFound, redirect } from 'next/navigation';
import { navigation } from '@/features/records/catalog';
import { WorkspacePage } from '@/features/workspace/WorkspacePage';
export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const { slug } = await params;
  if (slug === 'riwayat-proyek') {
    const query = await searchParams;
    const id = typeof query?.id === 'string' ? query.id : '';
    redirect('/proyek?tab=riwayat' + (id ? '&id=' + encodeURIComponent(id) : ''));
  }
  // Perlu perhatian kini bagian Beranda; tautan lama tetap berfungsi.
  if (slug === 'tindak-lanjut') redirect('/beranda#perhatian');
  if (!navigation.some(([href]) => href === `/${slug}`)) notFound();
  return <WorkspacePage key={slug} slug={slug} />;
}
