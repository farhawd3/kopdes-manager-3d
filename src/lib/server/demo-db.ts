import 'server-only';
import { randomUUID } from 'node:crypto';
import { sampleData } from '@/features/demo/sample-data';
import { references } from '@/features/records/catalog';
import { today } from '@/lib/date';

/**
 * Pengganti klien Supabase untuk mode demo. Hanya mendukung bagian PostgREST yang dipakai
 * aplikasi (filter eq/gt/gte/lte/in/ilike/or, order, range, limit, single) dan RPC aplikasi.
 * Data hidup di memori proses: bertahan selama `npm run dev` berjalan, kembali ke data contoh
 * saat server dimulai ulang.
 */
type Row = Record<string, unknown> & { id: string };
type DbError = { code: string; message: string };
type Result = { data: unknown; error: DbError | null; count?: number };

type Store = Record<string, Row[]>;
const holder = globalThis as typeof globalThis & { __kopdesDemo?: Store };
function store(): Store {
  holder.__kopdesDemo ??= {
    hub_records: sampleData(today()).map((r) => ({ ...r }) as Row),
  };
  return holder.__kopdesDemo;
}
/** Hanya untuk tes: kembalikan data contoh awal. */
export function resetDemo() {
  delete holder.__kopdesDemo;
}

const clone = <T>(v: T): T => structuredClone(v);
const failure = (code: string, message: string): Result => ({
  data: null,
  error: { code, message },
});

/** Nilai kolom, termasuk `data->>field` (teks, null bila tidak ada) seperti PostgREST. */
function columnValue(row: Row, path: string): string | null {
  if (path.startsWith('data->>')) {
    const v = (row.data as Record<string, unknown> | undefined)?.[path.slice(7)];
    if (v === undefined || v === null) return null;
    return typeof v === 'object' ? JSON.stringify(v) : String(v);
  }
  const v = row[path];
  return v === undefined || v === null ? null : String(v);
}

type Filter = (row: Row) => boolean;
function operatorFilter(path: string, op: string, arg: unknown): Filter {
  return (row) => {
    const v = columnValue(row, path);
    if (op === 'in') {
      const values = Array.isArray(arg)
        ? arg.map(String)
        : String(arg)
            .replace(/^\(|\)$/g, '')
            .split(',');
      return v !== null && values.includes(v);
    }
    if (v === null) return false;
    const a = String(arg);
    if (op === 'eq') return v === a;
    if (op === 'gt') return v > a;
    if (op === 'gte') return v >= a;
    if (op === 'lt') return v < a;
    if (op === 'lte') return v <= a;
    if (op === 'ilike') {
      // % = apa saja, _ = satu karakter, \x = karakter x apa adanya.
      const escape = (c: string) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      let pattern = '';
      for (let i = 0; i < a.length; i++) {
        const c = a[i];
        if (c === '\\' && i + 1 < a.length) pattern += escape(a[++i]);
        else pattern += c === '%' ? '.*' : c === '_' ? '.' : escape(c);
      }
      return new RegExp(`^${pattern}$`, 'is').test(v);
    }
    return false;
  };
}
/** `a.in.(x,y),b.gte.2026-01-01` → gabungan OR. Koma di dalam kurung tidak memisah. */
function orFilter(text: string): Filter {
  const parts: string[] = [];
  let depth = 0,
    from = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')') depth--;
    else if (text[i] === ',' && !depth) {
      parts.push(text.slice(from, i));
      from = i + 1;
    }
  }
  parts.push(text.slice(from));
  const filters = parts.map((b) => {
    const m = /^(.+?)\.(eq|gt|gte|lt|lte|in|ilike)\.(.*)$/.exec(b.trim());
    if (!m) throw new Error(`Filter demo tidak dikenal: ${b}`);
    return operatorFilter(m[1], m[2], m[3]);
  });
  return (row) => filters.some((s) => s(row));
}

/** Pemeriksaan unik pada hub_records, setara indeks unik di migrasi. */
function conflicts(rows: Row[], incoming: Row): boolean {
  const d = incoming.data as Record<string, unknown>;
  return rows.some((r) => {
    if (r.id === incoming.id) return false;
    const rd = r.data as Record<string, unknown>;
    if (incoming.entity === 'organization' && r.entity === 'organization') return true;
    if (incoming.entity === 'workstreams' && r.entity === 'workstreams' && rd.code === d.code)
      return true;
    if (
      incoming.entity === 'routine-checks' &&
      r.entity === 'routine-checks' &&
      rd.routine_id === d.routine_id &&
      rd.date === d.date
    )
      return true;
    return false;
  });
}
/** Pemicu hapus: catatan yang masih dirujuk tidak boleh dihapus. */
function isReferenced(rows: Row[], id: string): boolean {
  return rows.some((r) => {
    const d = r.data as Record<string, unknown>;
    if (Object.keys(references).some((f) => d[f] === id)) return true;
    return Array.isArray(d.dependencies) && d.dependencies.includes(id);
  });
}

class Query implements PromiseLike<Result> {
  private filters: Filter[] = [];
  private orders: [string, boolean][] = [];
  private bounds?: [number, number];
  private action: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private payload?: Record<string, unknown>;
  private singleMode?: 'single' | 'maybe';
  private withCount = false;
  constructor(private table: string) {}
  select(_columns?: string, options?: { count?: 'exact' }) {
    this.withCount = options?.count === 'exact';
    return this;
  }
  insert(v: Record<string, unknown>) {
    this.action = 'insert';
    this.payload = v;
    return this;
  }
  update(v: Record<string, unknown>) {
    this.action = 'update';
    this.payload = v;
    return this;
  }
  delete() {
    this.action = 'delete';
    return this;
  }
  eq(p: string, v: unknown) {
    return this.addFilter(operatorFilter(p, 'eq', v));
  }
  gt(p: string, v: unknown) {
    return this.addFilter(operatorFilter(p, 'gt', v));
  }
  gte(p: string, v: unknown) {
    return this.addFilter(operatorFilter(p, 'gte', v));
  }
  lte(p: string, v: unknown) {
    return this.addFilter(operatorFilter(p, 'lte', v));
  }
  in(p: string, v: unknown[]) {
    return this.addFilter(operatorFilter(p, 'in', v));
  }
  ilike(p: string, v: string) {
    return this.addFilter(operatorFilter(p, 'ilike', v));
  }
  or(text: string) {
    return this.addFilter(orFilter(text));
  }
  order(p: string, options?: { ascending?: boolean }) {
    this.orders.push([p, options?.ascending !== false]);
    return this;
  }
  range(a: number, b: number) {
    this.bounds = [a, b];
    return this;
  }
  limit(n: number) {
    this.bounds = [0, n - 1];
    return this;
  }
  single() {
    this.singleMode = 'single';
    return this;
  }
  maybeSingle() {
    this.singleMode = 'maybe';
    return this;
  }
  private addFilter(s: Filter) {
    this.filters.push(s);
    return this;
  }
  then<A = Result, B = never>(
    ok?: ((v: Result) => A | PromiseLike<A>) | null,
    onRejected?: ((e: unknown) => B | PromiseLike<B>) | null,
  ): PromiseLike<A | B> {
    return Promise.resolve()
      .then(() => this.run())
      .then(ok, onRejected);
  }
  private run(): Result {
    const rows = (store()[this.table] ??= []);
    const matching = () => rows.filter((r) => this.filters.every((s) => s(r)));
    let result: Row[];
    let count = 0;
    if (this.action === 'insert') {
      const now = new Date().toISOString();
      const incoming = {
        id: randomUUID(),
        created_at: now,
        updated_at: now,
        ...this.payload,
      } as Row;
      if (this.table === 'hub_records' && conflicts(rows, incoming))
        return failure('23505', 'duplicate key value');
      rows.push(incoming);
      result = [incoming];
    } else if (this.action === 'update') {
      result = matching();
      for (const r of result) {
        if (this.table === 'hub_records' && conflicts(rows, { ...r, ...this.payload } as Row))
          return failure('23505', 'duplicate key value');
        Object.assign(r, clone(this.payload), { updated_at: new Date().toISOString() });
      }
    } else if (this.action === 'delete') {
      result = matching();
      for (const r of result) {
        if (this.table === 'hub_records' && isReferenced(rows, r.id))
          return failure('P0001', 'Record is still referenced');
      }
      store()[this.table] = rows.filter((r) => !result.includes(r));
    } else {
      result = matching();
      count = result.length;
      for (const [p, ascending] of [...this.orders].reverse())
        result.sort((a, b) => {
          const x = columnValue(a, p) ?? '',
            y = columnValue(b, p) ?? '';
          return x === y ? 0 : (x < y ? -1 : 1) * (ascending ? 1 : -1);
        });
      if (this.bounds) result = result.slice(this.bounds[0], this.bounds[1] + 1);
    }
    if (this.singleMode) {
      if (result.length > 1 || (this.singleMode === 'single' && !result.length))
        return failure('PGRST116', 'JSON object requested, multiple (or no) rows returned');
      return { data: result[0] ? clone(result[0]) : null, error: null };
    }
    return { data: clone(result), error: null, ...(this.withCount ? { count } : {}) };
  }
}

function saveWorkItem(args: Record<string, unknown>): Result {
  const rows = store().hub_records;
  const now = new Date().toISOString();
  let record: Row;
  let previousStatus: unknown;
  if (args.record_id) {
    const existing = rows.find((r) => r.id === args.record_id && r.entity === 'work-items');
    if (!existing) return failure('P0001', 'Missing record');
    previousStatus = (existing.data as Record<string, unknown>).status;
    Object.assign(existing, { data: clone(args.payload), updated_at: now });
    record = existing;
  } else {
    record = {
      id: randomUUID(),
      entity: 'work-items',
      data: clone(args.payload),
      created_at: now,
      updated_at: now,
    };
    rows.push(record);
  }
  const payload = args.payload as Record<string, unknown>;
  const recurrenceKey = `${record.id}:${payload.due_date}`;
  if (
    payload.status === 'selesai' &&
    previousStatus !== 'selesai' &&
    args.next_payload &&
    !rows.some((row) => row.recurrence_key === recurrenceKey)
  )
    rows.push({
      id: randomUUID(),
      entity: 'work-items',
      data: clone(args.next_payload),
      recurrence_key: recurrenceKey,
      created_at: now,
      updated_at: now,
    });
  return { data: clone(record), error: null };
}

function postStockMovement(p: Record<string, unknown>): Result {
  const rows = store().hub_records;
  const quantity = Number(p.quantity);
  const direction = { masuk: 1, 'koreksi tambah': 1, keluar: -1, 'koreksi kurang': -1 }[
    String(p.kind)
  ];
  if (!direction || !Number.isInteger(quantity) || quantity <= 0)
    return failure('P0001', 'Invalid amount or quantity');
  const item = rows.find((r) => r.entity === 'inventory-items' && r.id === p.item_id);
  if (!item) return failure('P0001', 'Missing related record');
  const d = item.data as Record<string, unknown>;
  const before = Number(d.book_quantity),
    after = before + direction * quantity;
  if (after < 0) return failure('P0001', 'Stock would be negative');
  d.book_quantity = after;
  const now = new Date().toISOString();
  const id = randomUUID();
  rows.push({
    id,
    entity: 'stock-movements',
    data: { ...clone(p), book_before: before, book_after: after },
    created_at: now,
    updated_at: now,
  });
  return { data: id, error: null };
}

const client = {
  from: (table: string) => new Query(table),
  rpc: async (name: string, args: Record<string, unknown> = {}): Promise<Result> => {
    if (
      [
        'hub_operations_ready',
        'hub_logistics_ready',
        'hub_administration_ready',
        'hub_routines_ready',
      ].includes(name)
    )
      return { data: true, error: null };
    if (name === 'save_work_item') return saveWorkItem(args);
    if (name === 'hub_post_stock_movement')
      return postStockMovement(args.p_data as Record<string, unknown>);
    // PIN, sesi, dan pemulihan cadangan tidak berlaku di mode demo.
    return failure('P0001', `Fungsi ${name} tidak tersedia di mode demo.`);
  },
};

/** Klien demo berbentuk sama dengan klien Supabase untuk bagian yang dipakai aplikasi. */
export function demoDb() {
  return client;
}
