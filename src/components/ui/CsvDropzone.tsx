'use client';
import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseCsv } from '@/lib/csv';

export function CsvDropzone({
  onDataParsed,
  label = 'Tarik & lepas file CSV untuk impor atau klik untuk telusuri',
  supportedFormat = 'Format CSV (.csv)',
  disabled = false,
}: {
  onDataParsed: (rows: Record<string, string>[]) => void;
  label?: string;
  supportedFormat?: string;
  disabled?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parsedCount, setParsedCount] = useState<number | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function parseCsvContent(text: string) {
    try {
      const records = parseCsv(text);

      setParsedCount(records.length);
      setError('');
      onDataParsed(records);
    } catch (err) {
      setError((err as Error).message || 'Gagal membaca format CSV.');
      setParsedCount(null);
    }
  }

  function handleFile(file: File) {
    if (disabled) return;
    setParsedCount(null);
    if (file.size > 5_000_000) {
      setError('Berkas CSV maksimal 5 MB.');
      return;
    }
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      setError('Harap pilih file dengan format .csv');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCsvContent(text || '');
    };
    reader.onerror = () => setError('Gagal membaca file.');
    reader.readAsText(file);
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Pilih berkas CSV"
      aria-disabled={disabled}
      className={`csv-dropzone ${isDragging ? 'dragging' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        if (disabled) return;
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFile(e.dataTransfer.files[0]);
        }
      }}
      onClick={() => {
        if (!disabled) fileInputRef.current?.click();
      }}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        aria-label="Berkas CSV"
        tabIndex={-1}
        disabled={disabled}
        accept=".csv,text/csv"
        className="sr-only"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
          e.target.value = '';
        }}
      />
      <div className="dropzone-icon-wrap">
        <UploadCloud size={42} className="cloud-icon" />
      </div>
      <div className="dropzone-text">
        <h4>{fileName || label}</h4>
        <p>{supportedFormat}</p>
      </div>

      {parsedCount !== null && (
        <div className="dropzone-success">
          <CheckCircle2 size={16} />
          <span>{parsedCount} baris data berhasil dibaca</span>
        </div>
      )}

      {error && (
        <div className="dropzone-error" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
