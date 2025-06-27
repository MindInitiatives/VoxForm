/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { FieldError } from 'react-hook-form';

type FormFieldProps = {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'select' | 'checkbox' | 'date';
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlur?: () => void;
  error?: FieldError | string;
  required?: boolean;
  options?: { value: string; label: string }[];
  min?: string;
  step?: string;
  className?: string;
  active?: boolean;
  onFocus?: () => void;
};

export const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  required,
  options,
  min,
  step,
  className = '',
  active = false,
  onFocus
}: FormFieldProps) => {
  const baseClasses = `block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${className}`;
  const errorClasses = 'border-red-500 focus:border-red-500 focus:ring-red-500';

  return (
    <div className={`space-y-1 ${type === 'checkbox' ? 'flex items-center' : ''}`}>
      <label htmlFor={name} className={`block text-sm font-medium ${error ? 'text-red-600' : 'text-gray-700'}`}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      
      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          className={`${baseClasses} ${error ? errorClasses : ''} ${active ? 'ring-2 ring-indigo-200' : ''}`}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'checkbox' ? (
        <div className="flex items-center h-5">
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            className={`h-4 w-4 rounded ${error ? errorClasses : 'border-gray-300 text-indigo-600 focus:ring-indigo-500'}`}
          />
        </div>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          min={min}
          step={step}
          className={`${baseClasses} ${error ? errorClasses : ''} ${active ? 'ring-2 ring-indigo-200' : ''}`}
        />
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {typeof error === 'string' ? error : error.message}
        </p>
      )}
    </div>
  );
};