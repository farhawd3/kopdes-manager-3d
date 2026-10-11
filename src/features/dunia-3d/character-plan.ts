import type { WorldModel } from './model/world-model';
import { listedIn, sameName } from './model/schedule';
import type { Item } from '../records/schemas';
import type { Bidang } from './bidang';
import { rupaDariStaf, type RupaKarakter } from './karakter';
import { geraiStaf, infoGerai, type GeraiId } from './gerai';

export type CharacterAction = 'rest' | 'plan' | 'work' | 'meeting' | 'gym' | 'manage' | 'serve';
/** Ruang kantor, atau ruang unit di kawasan gerai (`gerai:<id>`). */
export type Area = Bidang | `gerai:${GeraiId}`;
export type CharacterPlan = {
  id: string;
  name: string;
  area: Area;
  action: CharacterAction;
  reason: string;
  /** Berubah saat catatan sumber berubah; figur berjalan ulang hanya bila ruang tujuannya berganti. */
  key: string;
  rupa: RupaKarakter;
  mascot?: boolean;
};

export const ACTION_LABEL: Record<CharacterAction, string> = {
  rest: 'Istirahat',
  plan: 'Menyusun tugas',
  work: 'Mengerjakan tugas',
  meeting: 'Rapat',
  gym: 'Kegiatan',
  manage: 'Di meja manajer',
  serve: 'Melayani gerai',
};

/** Batas figur di kanvas agar tetap ringan; daftar tim di kartu tetap memuat semua anggota. */
export const MAX_FIGURES = 12;

/** Tugas yang sedang dikerjakan ditempatkan di ruang seksinya; seksi lain di Ruang kerja. */
function ruangKerja(section: unknown): Bidang {
  if (section === 'layanan anggota' || section === 'administrasi & keuangan') return 'kas';
  if (section === 'gudang & logistik') return 'stok';
  if (section === 'usaha & gerai') return 'karyawan';
  return 'kerja';
}

export const isOffice = (area: Area): area is Bidang => !area.startsWith('gerai:');

/**
 * Catatan web menentukan ruang figur. Urutan: rapat berlangsung → Rapat; jurnal hari ini yang
 * terhubung ke tugasnya → Gym & kegiatan; manajer (nama di Pengaturan) → Ruang manajer; tugas proses → ruang seksinya; staf unit gerai yang sudah buka → unitnya; tugas
 * terbuka yang belum dikerjakan → Ruang kerja; tanpa tugas atau kegiatan → Ngopi & istirahat.
 * bukan pencatatan kehadiran atau hasil kerja.
 */
export function monitoringPlans(model: WorldModel): CharacterPlan[] {
  const gerai = infoGerai(model);
  const meetingOf = (name: string) =>
    model.currentMeeting && listedIn(model.currentMeeting.data.participants, name) ? model.currentMeeting : undefined;
  const plans = model.staff
    .filter((s) => s.data.status !== 'nonaktif')
    .map((staff): CharacterPlan => {
      const name = String(staff.data.title);
      const manajer = sameName(name, model.manager);
      const task = model.tasks.find((t) => t.data.status === 'proses' && sameName(t.data.assignee, name));
      const activity = model.activities.find((a) =>
        model.tasks.some((t) => t.id === a.data.work_item_id && sameName(t.data.assignee, name)),
      );
      const training = model.trainings.find((t) => t.data.staff_id === staff.id);
      const meeting = meetingOf(name);
      const open = model.tasks.find((t) => sameName(t.data.assignee, name));
      const unit = geraiStaf(staff, gerai);
      let action: CharacterAction, area: Area, source: Item | undefined;
      if (meeting) [action, area, source] = ['meeting', 'rapat', meeting];
      else if (activity) [action, area, source] = ['gym', 'gym', activity];
      else if (training) [action, area, source] = ['gym', 'gym', training];
      else if (manajer) [action, area, source] = ['manage', 'manajer', task || open];
      else if (task) [action, area, source] = ['work', ruangKerja(staff.data.section), task];
      else if (unit) [action, area, source] = ['serve', `gerai:${unit.id}`, unit.unit];
      else if (open) [action, area, source] = ['plan', 'kerja', open];
      else [action, area, source] = ['rest', 'istirahat', undefined];
      return {
        id: staff.id,
        name,
        area,
        action,
        reason: source
          ? `${source === training ? 'Pelatihan: ' : ''}${String(source.data.title)}`
          : 'Tidak ada tugas atau kegiatan tercatat',
        key: source ? source.id + source.updated_at + String(source.data.status || '') : '',
        rupa: rupaDariStaf(staff.data, manajer),
      };
    });
  // Manajer selalu tampil: dari Tim bila tercatat, selain itu figur dari nama di Pengaturan.
  if (!plans.some((p) => sameName(p.name, model.manager))) {
    const meeting = meetingOf(model.manager);
    const unassigned = model.activities.find(
      (activity) => !plans.some((p) => p.action === 'gym' && p.key.startsWith(activity.id)),
    );
    const source = meeting || unassigned;
    plans.unshift({
      id: '__manager',
      name: model.manager,
      area: meeting ? 'rapat' : unassigned ? 'gym' : 'manajer',
      action: meeting ? 'meeting' : unassigned ? 'gym' : 'manage',
      reason: source ? String(source.data.title) : 'Meja manajer',
      key: source ? source.id + source.updated_at : '',
      rupa: rupaDariStaf({}, true),
      mascot: true,
    });
  }
  return plans;
}
