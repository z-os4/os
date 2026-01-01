/**
 * ColorPicker Component
 *
 * Color selection with preset swatches and custom color input.
 *
 * @example
 * ```tsx
 * <ColorPicker
 *   value={color}
 *   onChange={setColor}
 *   label="Theme Color"
 *   presets={['#ff0000', '#00ff00', '#0000ff']}
 * />
 * ```
 */

import React, { useId, forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { SIZE_CLASSES, GLASS_STYLES, type FormSize } from './types';

export interface ColorPickerProps {
  /** Current color value (hex format) */
  value: string;
  /** Change handler */
  onChange: (color: string) => void;
  /** Field label */
  label?: string;
  /** Preset color swatches */
  presets?: string[];
  /** Error message */
  error?: string;
  /** Hint text */
  hint?: string;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Whether field is required */
  required?: boolean;
  /** Allow alpha channel */
  showAlpha?: boolean;
  /** Size variant */
  size?: FormSize;
  /** Additional class name */
  className?: string;
  /** Name attribute */
  name?: string;
}

// Default preset colors
const DEFAULT_PRESETS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ffffff', '#a3a3a3', '#000000',
];

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

// Convert hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Convert HSL to hex
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  return rgbToHex(
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  );
}

// Validate hex color
function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

export const ColorPicker = forwardRef<HTMLButtonElement, ColorPickerProps>(
  (
    {
      value,
      onChange,
      label,
      presets = DEFAULT_PRESETS,
      error,
      hint,
      disabled = false,
      required = false,
      showAlpha = false,
      size = 'md',
      className,
      name,
    },
    ref
  ) => {
    const id = useId();
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const sizeClasses = SIZE_CLASSES[size];

    const [isOpen, setIsOpen] = useState(false);
    const [hexInput, setHexInput] = useState(value);

    const containerRef = useRef<HTMLDivElement>(null);

    // Sync hex input with value
    useEffect(() => {
      setHexInput(value);
    }, [value]);

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    // Handle hex input change
    const handleHexChange = useCallback(
      (input: string) => {
        // Ensure it starts with #
        if (!input.startsWith('#')) {
          input = '#' + input;
        }
        setHexInput(input);

        // Only update if valid
        if (isValidHex(input)) {
          onChange(input.toLowerCase());
        }
      },
      [onChange]
    );

    // Handle preset click
    const handlePresetClick = useCallback(
      (color: string) => {
        onChange(color.toLowerCase());
      },
      [onChange]
    );

    // Get current HSL for sliders
    const hsl = hexToHsl(value) ?? { h: 0, s: 100, l: 50 };

    // Handle HSL slider changes
    const handleHueChange = useCallback(
      (h: number) => {
        onChange(hslToHex(h, hsl.s, hsl.l));
      },
      [hsl.s, hsl.l, onChange]
    );

    const handleSaturationChange = useCallback(
      (s: number) => {
        onChange(hslToHex(hsl.h, s, hsl.l));
      },
      [hsl.h, hsl.l, onChange]
    );

    const handleLightnessChange = useCallback(
      (l: number) => {
        onChange(hslToHex(hsl.h, hsl.s, l));
      },
      [hsl.h, hsl.s, onChange]
    );

    // Color swatch size based on form size
    const swatchSize = size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-10 h-10';
    const presetSwatchSize = 'w-6 h-6';

    return (
      <div ref={containerRef} className={cn('w-full relative', className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'block font-medium text-white/90',
              sizeClasses.label,
              required && "after:content-['*'] after:ml-0.5 after:text-red-400"
            )}
          >
            {label}
          </label>
        )}

        {/* Trigger button */}
        <button
          ref={ref}
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-invalid={!!error}
          aria-describedby={cn(error && errorId, hint && !error && hintId) || undefined}
          className={cn(
            'w-full flex items-center gap-3 rounded-lg transition-all duration-200',
            GLASS_STYLES.base,
            GLASS_STYLES.focus,
            sizeClasses.input,
            error && GLASS_STYLES.error,
            disabled && GLASS_STYLES.disabled
          )}
        >
          {/* Color swatch */}
          <div
            className={cn(
              'rounded border border-white/20 flex-shrink-0',
              swatchSize
            )}
            style={{ backgroundColor: value }}
          />

          {/* Color value */}
          <span className="text-white font-mono text-sm uppercase">{value}</span>
        </button>

        {/* Hidden input for form submission */}
        {name && <input type="hidden" name={name} value={value} />}

        {/* Picker popup */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              role="dialog"
              aria-label="Color picker"
              className={cn(
                'absolute z-50 mt-1 p-4 rounded-lg w-64',
                GLASS_STYLES.base,
                'shadow-lg shadow-black/20'
              )}
            >
              {/* Current color preview */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-lg border border-white/20"
                  style={{ backgroundColor: value }}
                />
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className={cn(
                    'flex-1 px-2 py-1.5 rounded bg-white/5 text-white text-sm font-mono uppercase',
                    'border border-white/10 focus:outline-none focus:border-white/30'
                  )}
                  maxLength={7}
                />
              </div>

              {/* HSL Sliders */}
              <div className="space-y-3 mb-4">
                {/* Hue slider */}
                <div>
                  <div className="flex justify-between text-xs text-white/50 mb-1">
                    <span>Hue</span>
                    <span>{hsl.h}deg</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="359"
                    value={hsl.h}
                    onChange={(e) => handleHueChange(Number(e.target.value))}
                    className="w-full h-3 rounded-full appearance-none cursor-pointer"
                    style={{
                      background:
                        'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
                    }}
                  />
                </div>

                {/* Saturation slider */}
                <div>
                  <div className="flex justify-between text-xs text-white/50 mb-1">
                    <span>Saturation</span>
                    <span>{hsl.s}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hsl.s}
                    onChange={(e) => handleSaturationChange(Number(e.target.value))}
                    className="w-full h-3 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${hslToHex(hsl.h, 0, hsl.l)}, ${hslToHex(hsl.h, 100, hsl.l)})`,
                    }}
                  />
                </div>

                {/* Lightness slider */}
                <div>
                  <div className="flex justify-between text-xs text-white/50 mb-1">
                    <span>Lightness</span>
                    <span>{hsl.l}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hsl.l}
                    onChange={(e) => handleLightnessChange(Number(e.target.value))}
                    className="w-full h-3 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #000, ${hslToHex(hsl.h, hsl.s, 50)}, #fff)`,
                    }}
                  />
                </div>
              </div>

              {/* Preset swatches */}
              {presets.length > 0 && (
                <div>
                  <div className="text-xs text-white/50 mb-2">Presets</div>
                  <div className="grid grid-cols-10 gap-1">
                    {presets.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handlePresetClick(color)}
                        className={cn(
                          'rounded border transition-transform hover:scale-110',
                          presetSwatchSize,
                          value.toLowerCase() === color.toLowerCase()
                            ? 'border-white ring-2 ring-blue-500'
                            : 'border-white/20'
                        )}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-red-400" role="alert">
            {error}
          </p>
        )}

        {/* Hint text */}
        {hint && !error && (
          <p id={hintId} className="mt-1.5 text-xs text-white/50">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

ColorPicker.displayName = 'ColorPicker';
