import type { Checklist } from '@/features/records/schemas';
import { readiness } from '@/lib/progress';
import { Legend } from '@/components/ui/Legend';
const dimensions = ['legalitas', 'fisik', 'sdm', 'sop', 'sistem'] as const;
export function ReadinessRadar({ items }: { items: Checklist[] }) {
  const values = dimensions.map((dimension) =>
    readiness(items.filter((item) => item.dimension === dimension)),
  );
  const point = (index: number, radius: number) =>
    `${100 + Math.sin((index * Math.PI * 2) / 5) * radius},${90 - Math.cos((index * Math.PI * 2) / 5) * radius}`;
  return (
    <details className="readiness-details">
      <summary>Kesiapan lima dimensi</summary>
      <div className="readiness-breakdown">
      {values.some(value => value !== null) && (
      <svg
        className="radar"
        viewBox="0 0 200 180"
        role="img"
        aria-label="Radar legalitas, fisik, SDM, SOP, sistem"
      >
        <polygon
          points={dimensions.map((_, index) => point(index, 70)).join(' ')}
          fill="none"
          stroke="var(--line)"
        />
        {dimensions.map((_, index) => (
          <line
            key={index}
            x1="100"
            y1="90"
            x2={100 + Math.sin((index * Math.PI * 2) / 5) * 70}
            y2={90 - Math.cos((index * Math.PI * 2) / 5) * 70}
            stroke="var(--line)"
          />
        ))}
        <polygon
          points={values.map((value, index) => point(index, (value || 0) * 0.7)).join(' ')}
          fill="var(--brand-soft)"
          stroke="var(--brand)"
          strokeWidth="2"
        />
      </svg>
      )}
      <Legend label="Nilai kesiapan per dimensi" items={dimensions.map((dimension, index) => ({
        key: dimension,
        label: dimension === 'sdm' ? 'SDM' : dimension === 'sop' ? 'SOP' : dimension[0].toUpperCase() + dimension.slice(1),
        value: values[index] === null ? 'Belum dinilai' : `${values[index]}%`,
        color: 'var(--brand)',
      }))} />
      </div>
    </details>
  );
}
