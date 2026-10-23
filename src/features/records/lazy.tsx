'use client';
import dynamic from 'next/dynamic';

// Formulir memuat Zod dan pemeriksaan isian; dimuat terpisah agar halaman cepat tampil.
export const RecordFormSheet = dynamic(() => import('./record-form').then((module) => module.RecordFormSheet), { ssr: false });
export const CsvImportSheet = dynamic(() => import('./csv-import').then((module) => module.CsvImportSheet), { ssr: false });
