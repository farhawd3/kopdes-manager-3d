import { expect, it } from 'vitest';
import { getWorldModel } from '@/features/dunia-3d/model/world-model';
import { monitoringPlans } from '@/features/dunia-3d/character-plan';
import type { Item } from '@/features/records/schemas';

const row = (id: string, data: Item['data']): Item => ({ id, data, created_at: '', updated_at: '' });

it('pelatihan bertanggal hari ini menempatkan figur stafnya di Gym', () => {
  const now = new Date('2026-10-10T03:00:00Z');
  const model = getWorldModel(
    {
      staff: [row('s1', { title: 'Ani', status: 'aktif' }), row('s2', { title: 'Budi', status: 'aktif' })],
      trainings: [
        row('t1', { title: 'Pelatihan kasir', staff_id: 's1', date: '2026-10-10' }),
        row('t2', { title: 'Penyimpanan obat', staff_id: 's2', date: '2026-10-15' }),
      ],
    },
    now,
  );
  const plans = monitoringPlans(model);
  const ani = plans.find((p) => p.id === 's1')!;
  expect(ani.area).toBe('gym');
  expect(ani.reason).toBe('Pelatihan: Pelatihan kasir');
  expect(plans.find((p) => p.id === 's2')!.area).not.toBe('gym');
  expect(model.activity).toBe('gym');
});
