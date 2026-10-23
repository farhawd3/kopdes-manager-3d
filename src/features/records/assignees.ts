import type { Item } from './schemas';

export type AssigneeOption = { name: string; role: string };

/**
 * Orang yang bisa dipilih sebagai penanggung jawab: manajer (dari profil), lalu staf Tim yang tidak
 * nonaktif. Nama lama yang tidak ada di Tim tetap ditawarkan agar data lama tidak hilang.
 */
export function assigneeOptions(staff: Item[], manager: string, current: string): AssigneeOption[] {
  const options: AssigneeOption[] = [];
  const exists = (name: string) =>
    options.some((option) => option.name.toLowerCase() === name.trim().toLowerCase());
  if (manager.trim()) options.push({ name: manager.trim(), role: 'Manajer' });
  for (const person of staff) {
    const name = String(person.data.title || '').trim();
    if (!name || person.data.status === 'nonaktif' || exists(name)) continue;
    options.push({ name, role: String(person.data.role || '') || 'Tim' });
  }
  if (current.trim() && !exists(current))
    options.push({ name: current.trim(), role: 'Tidak ada di Tim' });
  return options;
}
