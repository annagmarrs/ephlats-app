import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-900 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full border rounded-xl px-4 min-h-[48px] text-neutral-900 placeholder-neutral-400
          focus:outline-none focus:ring-2 focus:ring-purple-primary focus:border-transparent
          transition-colors
          ${error ? 'border-error focus:ring-error' : 'border-neutral-300'}
          ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
      {hint && !error && <p className="mt-1 text-sm text-neutral-600">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className = '', id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-900 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full border rounded-xl px-4 py-3 text-neutral-900 placeholder-neutral-400
          focus:outline-none focus:ring-2 focus:ring-purple-primary focus:border-transparent
          transition-colors resize-none
          ${error ? 'border-error focus:ring-error' : 'border-neutral-300'}
          ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
      {hint && !error && <p className="mt-1 text-sm text-neutral-600">{hint}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, className = '', id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-900 mb-1.5">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`w-full border rounded-xl px-4 min-h-[48px] text-neutral-900
          focus:outline-none focus:ring-2 focus:ring-purple-primary focus:border-transparent
          transition-colors bg-white
          ${error ? 'border-error focus:ring-error' : 'border-neutral-300'}
          ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}
