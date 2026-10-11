'use client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DateInput } from '@/components/ui/DateField';
import { Modal } from '@/components/ui/Modal';
import { useState } from 'react';
import { X, Repeat, Clock, Calendar } from 'lucide-react';
import { Select } from '@/components/ui/Select';

export function RecursiveScheduleModal({
  currentType = 'tidak',
  currentTime = '09:00',
  currentEndDate = '',
  onClose,
  onSave,
}: {
  currentType?: string;
  currentTime?: string;
  currentEndDate?: string;
  onClose: () => void;
  onSave: (schedule: {
    recurrence: string;
    recurrence_time: string;
    recurrence_end_date: string;
  }) => void;
}) {
  const [repeatType, setRepeatType] = useState(
    ['harian', 'mingguan', 'bulanan'].includes(currentType) ? currentType : 'tidak',
  );
  const [time, setTime] = useState(currentTime || '09:00');
  const [endDate, setEndDate] = useState(currentEndDate);
  const enabled = repeatType !== 'tidak';



  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      recurrence: repeatType,
      recurrence_time: enabled ? time : '09:00',
      recurrence_end_date: enabled ? endDate : '',
    });
    onClose();
  }

  return (
    <Modal aria-labelledby="recursive-title" onDismiss={onClose}>
      <div className="sprint-modal-card">
        <header className="sprint-modal-head">
          <div className="title-with-badge">
            <span className="sprint-icon-pill">
              <Repeat size={18} />
            </span>
            <h2 id="recursive-title">Jadwal berulang</h2>
          </div>
          <Button type="button" className="close-btn" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </Button>
        </header>

        <form onSubmit={handleSubmit} className="sprint-form">
          <label className="field-group">
            <span className="field-label">Ulangi tugas</span>
            <Select
              value={repeatType}
              onChange={setRepeatType}
              options={[
                { value: 'tidak', label: 'Tidak berulang' },
                { value: 'harian', label: 'Setiap hari' },
                { value: 'mingguan', label: 'Setiap minggu' },
                { value: 'bulanan', label: 'Setiap bulan' },
              ]}
              ariaLabel="Tipe Perulangan"
            />
          </label>

          <label className="field-group">
            <span className="field-label">
              <Clock size={16} aria-hidden="true" /> Jam catatan (WIB)
            </span>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="text-input"
              disabled={!enabled}
              required={enabled}
            />
          </label>

          <label className="field-group">
            <span className="field-label">
              <Calendar size={16} aria-hidden="true" /> Batas pengulangan (opsional)
            </span>
            <DateInput
              aria-label="Batas pengulangan"
              value={endDate}
              onValueChange={(value) => setEndDate(value)}
              className="text-input"
              disabled={!enabled}
            />
          </label>

          <p className="recurrence-explanation">
            {enabled
              ? 'Tugas berikutnya dibuat saat tugas ini ditandai selesai. Jam hanya catatan, bukan pengingat otomatis.'
              : 'Pilih pola pengulangan untuk mengatur jam dan batas tanggal.'}
          </p>
          <div className="sprint-form-actions">
            <Button type="button" className="btn-cancel" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" className="btn-save-sprint">
              Simpan pengulangan
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
