import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Legend } from '@/components/ui/Legend';
import { Progress } from '@/components/ui/Progress';
afterEach(cleanup);
it('pilihan aktif dan nonaktif tetap dapat dikenali tanpa warna',()=>{
 const change=vi.fn();render(<SegmentedControl label="Tampilan" value="daftar" onChange={change} options={[{value:'daftar',label:'Daftar'},{value:'papan',label:'Papan'},{value:'mati',label:'Nonaktif',disabled:true}]} />);
 expect(screen.getByRole('button',{name:'Daftar'}).getAttribute('aria-pressed')).toBe('true');
 fireEvent.click(screen.getByRole('button',{name:'Papan'}));expect(change).toHaveBeenCalledWith('papan');
 fireEvent.click(screen.getByRole('button',{name:'Nonaktif'}));expect(change).toHaveBeenCalledTimes(1);
});
it('legenda mempertahankan label/nilai dan aksi filter',()=>{
 const select=vi.fn();render(<Legend label="Status" selected="rencana" onSelect={select} items={[{key:'rencana',label:'Rencana',value:3,color:'var(--brand)'}]} />);
 const button=screen.getByRole('button',{name:'Rencana 3'});expect(button.getAttribute('aria-pressed')).toBe('true');fireEvent.click(button);expect(select).toHaveBeenCalledWith('rencana');
});
it('nilai kesiapan kosong tidak berubah menjadi angka nol aksesibel',()=>{
 render(<Progress label="Kesiapan" value={null} />);const bar=screen.getByRole('progressbar');expect(bar.hasAttribute('aria-valuenow')).toBe(false);expect(bar.getAttribute('aria-valuetext')).toBe('Belum dinilai');
});
