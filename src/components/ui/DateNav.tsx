import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, IconButton } from './Button';
export function DateNav({ onPrevious, onToday, onNext, previousLabel = 'Periode sebelumnya', nextLabel = 'Periode berikutnya' }: {
  onPrevious: () => void; onToday: () => void; onNext: () => void; previousLabel?: string; nextLabel?: string;
}) {
  return <div className="ui-date-nav" role="group" aria-label="Navigasi tanggal">
    <IconButton type="button" aria-label={previousLabel} onClick={onPrevious}><ChevronLeft /></IconButton>
    <Button type="button" onClick={onToday}>Hari ini</Button>
    <IconButton type="button" aria-label={nextLabel} onClick={onNext}><ChevronRight /></IconButton>
  </div>;
}
