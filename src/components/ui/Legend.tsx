'use client';
import type { ReactNode } from 'react';
import { Button } from './Button';

export interface LegendItem {
  key: string;
  label: string;
  value?: ReactNode;
  color: string;
}
export function Legend({
  label,
  items,
  selected,
  onSelect,
}: {
  label: string;
  items: LegendItem[];
  selected?: string;
  onSelect?: (key: string) => void;
}) {
  return (
    <ul className="ui-legend" aria-label={label}>
      {items.map((item) => {
        const content = (
          <>
            <span className="ui-legend-dot" style={{ background: item.color }} aria-hidden="true" />
            <span>{item.label}</span>
            {item.value !== undefined && <strong>{item.value}</strong>}
          </>
        );
        return (
          <li key={item.key}>
            {onSelect ? (
              <Button
                type="button"
                variant="ghost"
                aria-pressed={selected === item.key}
                onClick={() => onSelect(item.key)}
              >
                {content}
              </Button>
            ) : (
              <div className="ui-legend-item">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
