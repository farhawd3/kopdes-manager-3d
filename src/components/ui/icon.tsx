import {
  Armchair,
  Bell,
  BookUser,
  Box,
  Briefcase,
  CalendarDays,
  CircleHelp,
  FileText,
  FolderKanban,
  House,
  ListChecks,
  NotebookPen,
  Package,
  Settings,
  Store,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

/** Ikon halaman menurut nama di `nav.ts`; hanya ikon menu yang didaftarkan agar bundel tetap kecil. */
const PAGE_ICONS: Record<string, LucideIcon> = {
  house: House,
  'list-checks': ListChecks,
  'folder-kanban': FolderKanban,
  'calendar-days': CalendarDays,
  'notebook-pen': NotebookPen,
  'file-text': FileText,
  'book-user': BookUser,
  store: Store,
  package: Package,
  armchair: Armchair,
  users: Users,
  wallet: Wallet,
  briefcase: Briefcase,
  box: Box,
  settings: Settings,
  'circle-help': CircleHelp,
  bell: Bell,
};

export function PageIcon({ name, className }: { name: string; className?: string }) {
  const Icon = PAGE_ICONS[name] ?? Box;
  return <Icon className={className} aria-hidden="true" strokeWidth={1.9} />;
}
