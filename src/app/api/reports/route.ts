import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/server/auth';
import { sameOrigin, failure, readJson } from '@/lib/server/http';
import { db } from '@/lib/server/db';
import { date } from '@/features/records/schemas';
import { list } from '@/features/records/service';
import { reportSnapshot } from '@/features/notes/report-snapshot';

export async function GET(request: Request) {
  try {
    await requireSession();
    const { offset } = z
      .object({ offset: z.coerce.number().int().min(0).max(1_000_000).default(0) })
      .parse(Object.fromEntries(new URL(request.url).searchParams));
    const { data, error } = await db()
      .from('manager_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(offset, offset + 99);
    if (error) throw new Error('Laporan gagal dimuat.');
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await requireSession();
    const body = z
      .object({
        id: z.string().uuid().optional(),
        title: z.string().min(1).max(200),
        start: date,
        end: date,
        notes: z.string().max(10000),
        status: z.enum(['draft', 'final']).optional(),
      })
      .strict()
      .parse(await readJson(request));
    if (body.start > body.end) throw new Error('Periode tidak sah.');

    const [organization, tasks, decisions, risks, milestones, cashEntries] = await Promise.all([
      list('organization'),
      list('work-items'),
      list('decisions'),
      list('risks'),
      list('milestones'),
      list('cash-entries'),
    ]);

    const snapshot = {
      ...reportSnapshot(
        {
          organization,
          'work-items': tasks,
          decisions,
          risks,
          milestones,
          'cash-entries': cashEntries,
        },
        body.start,
        body.end,
      ),
      notes: body.notes,
      status: body.status || 'final',
    };

    if (body.id) {
      const { data, error } = await db()
        .from('manager_reports')
        .update({
          title: body.title,
          period_start: body.start,
          period_end: body.end,
          snapshot,
          status: snapshot.status,
        })
        .eq('id', body.id)
        .select('*')
        .single();
      if (error) throw new Error('Laporan gagal diperbarui.');
      return NextResponse.json(data);
    } else {
      const { data, error } = await db()
        .from('manager_reports')
        .insert({
          title: body.title,
          period_start: body.start,
          period_end: body.end,
          snapshot,
          status: snapshot.status,
        })
        .select('*')
        .single();
      if (error) throw new Error('Snapshot laporan gagal disimpan.');
      return NextResponse.json(data);
    }
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: Request) {
  try {
    sameOrigin(request);
    await requireSession();
    const body = z
      .object({
        id: z.string().uuid(),
        status: z.enum(['draft', 'final']).optional(),
        notes: z.string().max(10000).optional(),
      })
      .strict()
      .parse(await readJson(request));

    const { data: existing, error: fetchErr } = await db()
      .from('manager_reports')
      .select('*')
      .eq('id', body.id)
      .single();
    if (fetchErr || !existing) throw new Error('Laporan tidak ditemukan.');

    const status =
      body.status ??
      z
        .enum(['draft', 'final'])
        .parse((existing.snapshot as Record<string, unknown>).status ?? existing.status ?? 'final');
    const snapshot = {
      ...(existing.snapshot as Record<string, unknown>),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      status,
    };

    const { data, error } = await db()
      .from('manager_reports')
      .update({ snapshot, status })
      .eq('id', body.id)
      .select('*')
      .single();
    if (error) throw new Error('Status laporan gagal diperbarui.');
    return NextResponse.json(data);
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    await requireSession();
    const { searchParams } = new URL(request.url);
    const input = searchParams.has('id') ? { id: searchParams.get('id') } : await readJson(request);
    const { id } = z.object({ id: z.string().uuid() }).strict().parse(input);
    const { error } = await db().from('manager_reports').delete().eq('id', id);
    if (error) throw new Error('Laporan gagal dihapus.');
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return failure(error);
  }
}
