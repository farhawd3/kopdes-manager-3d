import Link from 'next/link';
import { Menu, Plus } from 'lucide-react';
import { IkonHalaman } from './IkonHalaman';
import { Button } from './Button';

export function BottomNav({ path, calendar, menu, onAction, onMenu }: {
  path: string; calendar: boolean; menu: boolean; onAction: () => void; onMenu: () => void;
}) {
  const items = [
    { label: 'Beranda', href: '/beranda' },
    { label: 'Tugas', href: '/tugas' },
    { label: 'Tambah', action: onAction, Icon: Plus },
    { label: 'Dunia', href: '/dunia-koperasi' },
    { label: 'Menu', action: onMenu, Icon: Menu },
  ];
  return <nav className="ui-bottom-nav" aria-label="Navigasi cepat">
    {items.map(({ label, href, Icon, action }) => {
      const content = <><span className="ui-bottom-icon">{href ? <IkonHalaman href={href} size={24} /> : Icon && <Icon />}</span><span>{label}</span></>;
      return href
        ? <Link key={label} href={href} className="ui-bottom-item" aria-label={label} aria-current={path === href && !(href === '/tugas' && calendar) ? 'page' : undefined}>{content}</Link>
        : <Button key={label} type="button" className="ui-bottom-item" onClick={action} data-action={label === 'Tambah'} aria-label={label === 'Tambah' ? 'Tambah catatan' : 'Semua halaman'} aria-expanded={label === 'Menu' ? menu : undefined}>{content}</Button>;
    })}
  </nav>;
}
