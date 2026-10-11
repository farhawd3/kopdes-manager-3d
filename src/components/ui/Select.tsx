'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { usePopoverPlacement } from './usePopoverPlacement';
import { Button } from './Button';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: (SelectOption | string)[];
  placeholder?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  ariaLabel?: string;
  style?: React.CSSProperties;
}

export function Select({
  value: controlledValue,
  defaultValue = '',
  onChange,
  options: rawOptions,
  placeholder = 'Pilih...',
  name,
  id: customId,
  disabled = false,
  required = false,
  className = '',
  ariaLabel,
  style,
}: SelectProps) {
  const generatedId = useId();
  const selectId = customId || generatedId;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const rootRef = usePopoverPlacement(isOpen);

  // Normalize options to { value, label, icon }
  const options = useMemo<SelectOption[]>(() => {
    return rawOptions.map((opt) => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [rawOptions]);

  // Selected option
  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === currentValue);
  }, [options, currentValue]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen, rootRef]);

  // Auto scroll highlighted item into view
  useEffect(() => {
    if (!isOpen || highlightedIndex < 0 || !menuRef.current) return;
    const items = menuRef.current.querySelectorAll<HTMLButtonElement>('[role="option"]');
    const targetItem = items[highlightedIndex];
    if (targetItem) {
      targetItem.scrollIntoView?.({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  function handleSelect(optionValue: string) {
    if (disabled) return;
    if (!isControlled) {
      setInternalValue(optionValue);
    }
    onChange?.(optionValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (disabled) return;

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          const currentIndex = options.findIndex((opt) => opt.value === currentValue);
          setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
        } else {
          setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        }
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          const currentIndex = options.findIndex((opt) => opt.value === currentValue);
          setHighlightedIndex(currentIndex >= 0 ? currentIndex : options.length - 1);
        } else {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        }
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        if (isOpen) {
          if (highlightedIndex >= 0 && highlightedIndex < options.length) {
            handleSelect(options[highlightedIndex].value);
          } else {
            setIsOpen(false);
          }
        } else {
          setIsOpen(true);
          const currentIndex = options.findIndex((opt) => opt.value === currentValue);
          setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
        }
        break;
      }
      case 'Escape': {
        if (isOpen) {
          event.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
        }
        break;
      }
      case 'Tab': {
        if (isOpen) {
          setIsOpen(false);
        }
        break;
      }
    }
  }

  const displayLabel = selectedOption?.label || placeholder;

  return (
    <div
      ref={rootRef}
      className={`custom-select-wrap ${isOpen ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}
      style={style}
      onKeyDown={handleKeyDown}
    >
      <select
        id={selectId}
        name={name}
        aria-label={ariaLabel}
        aria-hidden={ariaLabel !== 'Catatan untuk disematkan'}
        disabled={disabled}
        required={required}
        onInvalid={(event) => {
          event.preventDefault();
          setIsOpen(true);
          triggerRef.current?.focus();
        }}
        onFocus={() => triggerRef.current?.focus()}
        value={currentValue}
        onChange={(e) => handleSelect(e.target.value)}
        tabIndex={-1}
        className="custom-select-native"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
        }}
      >
        {options.map((opt, i) => (
          <option key={opt.value || `opt-${i}`} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <Button
        ref={triggerRef}
        type="button"
        id={`${selectId}-trigger`}
        className="ui-select-trigger"
        aria-haspopup="listbox"
        aria-label={ariaLabel ? `${ariaLabel}: ${displayLabel}` : displayLabel}
        aria-controls={`${selectId}-menu`}
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setIsOpen((prev) => {
            const next = !prev;
            if (next) {
              const currentIndex = options.findIndex((opt) => opt.value === currentValue);
              setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
            }
            return next;
          });
        }}
      >
        <span className="custom-select-label-wrap">
          {selectedOption?.icon && (
            <span className="custom-select-prefix-icon">{selectedOption.icon}</span>
          )}
          <span className="custom-select-label">{displayLabel}</span>
        </span>
        <ChevronDown size={15} className="custom-select-chevron" aria-hidden="true" />
      </Button>

      {isOpen && (
        <div
          ref={menuRef}
          className="custom-select-menu"
          id={`${selectId}-menu`}
          data-popover
          role="listbox"
          aria-labelledby={`${selectId}-trigger`}
          tabIndex={-1}
        >
          {options.map((option, index) => {
            const isSelected = option.value === currentValue;
            const isHighlighted = index === highlightedIndex;

            return (
              <button
                key={option.value || `empty-${index}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`custom-select-option ${isSelected ? 'is-selected' : ''} ${
                  isHighlighted ? 'is-highlighted' : ''
                }`}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span className="custom-select-option-content">
                  {option.icon && <span className="custom-select-option-icon">{option.icon}</span>}
                  <span className="custom-select-option-text">{option.label}</span>
                </span>
                {isSelected && (
                  <Check size={14} className="custom-select-check" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
