import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-[#161B26] border text-white text-sm rounded-lg px-3.5 py-2.5 transition-all duration-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#E5A93C] focus:border-[#E5A93C] ${
            icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-red-500/70 focus:ring-red-400 focus:border-red-400'
              : 'border-[#2B3242] hover:border-slate-600'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      {!error && helperText && (
        <p className="text-xs text-slate-400 mt-1">{helperText}</p>
      )}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={4}
        className={`w-full bg-[#161B26] border text-white text-sm rounded-lg p-3.5 transition-all duration-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#E5A93C] focus:border-[#E5A93C] resize-y ${
          error
            ? 'border-red-500/70 focus:ring-red-400 focus:border-red-400'
            : 'border-[#2B3242] hover:border-slate-600'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      {!error && helperText && (
        <p className="text-xs text-slate-400 mt-1">{helperText}</p>
      )}
    </div>
  );
};
