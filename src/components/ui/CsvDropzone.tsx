'use client';
import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';

export function CsvDropzone({
  onDataParsed,
  label = 'Tarik & lepas file CSV untuk impor atau klik untuk telusuri',
  supportedFormat = 'Format CSV (.csv)',
}: {
  onDataParsed: (rows: Record<string, string>[]) => void;
  label?: string;
  supportedFormat?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parsedCount, setParsedCount] = useState<number | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function parseCsvContent(text: string) {
    try {
      const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length < 2) {
        throw new Error('File CSV kosong atau tidak memiliki baris data.');
      }
      const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
      const records: Record<string, string>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] || '';
        });
        records.push(row);
      }

      setParsedCount(records.length);
      setError('');
      onDataParsed(records);
    } catch (err) {
      setError((err as Error).message || 'Gagal membaca format CSV.');
      setParsedCount(null);
    }
  }

  function handleFile(file: File) {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('Harap pilih file dengan format .csv');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) parseCsvContent(text);
    };
    reader.onerror = () => setError('Gagal membaca file.');
    reader.readAsText(file);
  }

  return (
    <div
      className={`csv-dropzone ${isDragging ? 'dragging' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
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
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
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
          <span>{parsedCount} baris data berhasil dimuat</span>
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
