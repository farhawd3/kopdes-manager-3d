import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
export async function readJson(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError('JSON kosong.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 5_000_000) {
      await reader.cancel();
      throw new Error('PAYLOAD_TOO_LARGE');
    }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
function normalizedOrigin(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    if (
      !['https:', 'http:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    )
      return null;
    return url.origin;
  } catch {
    return null;
  }
}
export function sameOrigin(request: Request) {
  const allowed = new Set<string>();
  const onVercel = process.env.VERCEL === '1';
  const configured = normalizedOrigin(process.env.HUB_APP_ORIGIN);
  if (configured && (!onVercel || configured.startsWith('https://'))) allowed.add(configured);
  // Hanya metadata server Vercel; Host/Forwarded dari permintaan bukan sumber kepercayaan.
  if (onVercel) {
    const hosts = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL];
    if (process.env.VERCEL_ENV === 'production')
      hosts.push(process.env.VERCEL_PROJECT_PRODUCTION_URL);
    for (const host of hosts) {
      if (!host || !/^[a-z0-9.-]+$/i.test(host)) continue;
      const origin = normalizedOrigin(`https://${host}`);
      if (origin) allowed.add(origin);
    }
  } else if (!process.env.HUB_APP_ORIGIN && process.env.NODE_ENV !== 'production') {
    allowed.add(new URL(request.url).origin);
  }
  const origin = normalizedOrigin(request.headers.get('origin'));
  if (!origin || !allowed.has(origin)) throw new Error('ORIGIN_FORBIDDEN');
}
export function failure(error: unknown) {
  if (error instanceof SyntaxError)
    return NextResponse.json({ error: 'Format JSON tidak sah.' }, { status: 400 });
  if (error instanceof ZodError)
    return NextResponse.json(
      { error: error.issues.map((item) => `${item.path.join('.')}: ${item.message}`).join('; ') },
      { status: 400 },
    );
  const message = error instanceof Error ? error.message : 'Permintaan gagal.';
  const status =
    message === 'UNAUTHORIZED'
      ? 401
      : message === 'FORBIDDEN' || message === 'ORIGIN_FORBIDDEN'
        ? 403
        : message === 'PAYLOAD_TOO_LARGE'
          ? 413
          : 503;
  return NextResponse.json(
    {
      error:
        message === 'UNAUTHORIZED'
          ? 'Sesi berakhir. Buka halaman PIN.'
          : message === 'ORIGIN_FORBIDDEN'
            ? 'Asal permintaan tidak diizinkan. Alamat aplikasi perlu disesuaikan pada konfigurasi hosting.'
            : message === 'FORBIDDEN'
              ? 'Permintaan tidak diizinkan.'
              : message,
    },
    { status },
  );
}
