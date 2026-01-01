/**
 * FileInput Component
 *
 * File upload with drag & drop support and glass styling.
 *
 * @example
 * ```tsx
 * <FileInput
 *   value={files}
 *   onChange={setFiles}
 *   label="Upload documents"
 *   accept=".pdf,.doc,.docx"
 *   multiple
 * />
 * ```
 */

import React, {
  useId,
  forwardRef,
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { SIZE_CLASSES, GLASS_STYLES, type FormSize } from './types';

export interface FileInputProps {
  /** Selected files */
  value: File[];
  /** Change handler */
  onChange: (files: File[]) => void;
  /** Field label */
  label?: string;
  /** Accepted file types (e.g., ".pdf,.jpg" or "image/*") */
  accept?: string;
  /** Allow multiple files */
  multiple?: boolean;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Maximum number of files */
  maxFiles?: number;
  /** Error message */
  error?: string;
  /** Hint text */
  hint?: string;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Whether field is required */
  required?: boolean;
  /** Size variant */
  size?: FormSize;
  /** Additional class name */
  className?: string;
  /** Name attribute */
  name?: string;
}

// Icons
const UploadIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const FileIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Get file extension
function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toUpperCase();
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      value,
      onChange,
      label,
      accept,
      multiple = false,
      maxSize,
      maxFiles,
      error,
      hint,
      disabled = false,
      required = false,
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

    const [isDragging, setIsDragging] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Use forwarded ref or internal ref
    const fileInputRef = (ref as React.RefObject<HTMLInputElement>) || inputRef;

    // Clear local error when external error changes
    useEffect(() => {
      if (error) {
        setLocalError(null);
      }
    }, [error]);

    // Validate files
    const validateFiles = useCallback(
      (files: File[]): { valid: File[]; error: string | null } => {
        let validFiles = [...files];
        let validationError: string | null = null;

        // Check max files
        if (maxFiles && validFiles.length > maxFiles) {
          validFiles = validFiles.slice(0, maxFiles);
          validationError = `Maximum ${maxFiles} file(s) allowed`;
        }

        // Check file sizes
        if (maxSize) {
          const oversized = validFiles.filter((f) => f.size > maxSize);
          if (oversized.length > 0) {
            validFiles = validFiles.filter((f) => f.size <= maxSize);
            validationError = `Files must be smaller than ${formatFileSize(maxSize)}`;
          }
        }

        return { valid: validFiles, error: validationError };
      },
      [maxFiles, maxSize]
    );

    // Handle file selection
    const handleFiles = useCallback(
      (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);
        const { valid, error: validationError } = validateFiles(fileArray);

        setLocalError(validationError);

        if (multiple) {
          // Combine with existing, respecting maxFiles
          const combined = [...value, ...valid];
          const maxed = maxFiles ? combined.slice(0, maxFiles) : combined;
          onChange(maxed);
        } else {
          onChange(valid.slice(0, 1));
        }
      },
      [multiple, value, maxFiles, onChange, validateFiles]
    );

    // Handle file removal
    const handleRemove = useCallback(
      (index: number) => {
        const newFiles = value.filter((_, i) => i !== index);
        onChange(newFiles);
        setLocalError(null);
      },
      [value, onChange]
    );

    // Handle clear all
    const handleClear = useCallback(() => {
      onChange([]);
      setLocalError(null);
    }, [onChange]);

    // Drag handlers
    const handleDragEnter = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
          setIsDragging(true);
        }
      },
      [disabled]
    );

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (!disabled) {
          handleFiles(e.dataTransfer.files);
        }
      },
      [disabled, handleFiles]
    );

    // Click to select files
    const handleClick = useCallback(() => {
      if (!disabled && fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, [disabled, fileInputRef]);

    // Handle input change
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        // Reset input so same file can be selected again
        if (e.target) {
          e.target.value = '';
        }
      },
      [handleFiles]
    );

    const displayError = error || localError;
    const hasFiles = value.length > 0;

    return (
      <div className={cn('w-full', className)}>
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

        {/* Drop zone */}
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            'relative rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer',
            'flex flex-col items-center justify-center',
            size === 'sm' ? 'p-4' : size === 'md' ? 'p-6' : 'p-8',
            isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : hasFiles
              ? 'border-white/20 bg-black/20'
              : 'border-white/20 bg-black/40 hover:bg-white/5 hover:border-white/30',
            displayError && 'border-red-500/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-describedby={cn(displayError && errorId, hint && !displayError && hintId) || undefined}
        >
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            id={id}
            type="file"
            name={name}
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={handleInputChange}
            className="sr-only"
            aria-invalid={!!displayError}
          />

          {/* Empty state */}
          {!hasFiles && (
            <>
              <UploadIcon
                className={cn(
                  'mb-3',
                  size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : 'w-12 h-12',
                  isDragging ? 'text-blue-400' : 'text-white/40'
                )}
              />
              <p className="text-sm text-white/70 mb-1">
                {isDragging ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-xs text-white/40">or click to browse</p>
              {accept && (
                <p className="text-xs text-white/30 mt-2">
                  Accepted: {accept}
                </p>
              )}
            </>
          )}

          {/* File list */}
          {hasFiles && (
            <div className="w-full space-y-2">
              <AnimatePresence mode="popLayout">
                {value.map((file, index) => (
                  <motion.div
                    key={`${file.name}-${file.size}-${index}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded bg-white/5 border border-white/10'
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FileIcon className="w-5 h-5 text-white/40 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{file.name}</p>
                      <p className="text-xs text-white/40">
                        {getFileExtension(file.name)} - {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      disabled={disabled}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      aria-label={`Remove ${file.name}`}
                    >
                      <XIcon className="w-4 h-4 text-white/40" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add more button */}
              {multiple && (!maxFiles || value.length < maxFiles) && (
                <div className="pt-2 flex justify-center">
                  <span className="text-xs text-blue-400">+ Add more files</span>
                </div>
              )}

              {/* Clear all button */}
              {value.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  disabled={disabled}
                  className="w-full mt-2 py-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {displayError && (
          <p id={errorId} className="mt-1.5 text-xs text-red-400" role="alert">
            {displayError}
          </p>
        )}

        {/* Hint text */}
        {hint && !displayError && (
          <p id={hintId} className="mt-1.5 text-xs text-white/50">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';
