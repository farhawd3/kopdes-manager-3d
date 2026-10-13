import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    // Kotak centang dan radio tidak memakai gaya kolom teks (lebar penuh, tinggi 42 px).
    const pilihan = props.type === 'checkbox' || props.type === 'radio';
    return <input {...props} ref={ref} className={cn(pilihan ? 'ui-check' : 'ui-input', className)} />;
  },
);
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea {...props} ref={ref} className={cn('ui-input', className)} />;
  },
);
