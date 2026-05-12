"use client";

import React from "react";

interface IconProps {
  size?: number;
  className?: string;
}

interface FormInputProps {
  label: string;
  placeholder: string;
  icon?: React.ReactElement<IconProps>;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  type?: string;
  textarea?: boolean;
  rows?: number;
}

export const FormInput = ({
  label,
  placeholder,
  icon,
  value,
  onChange,
  type = "text",
  textarea = false,
  rows = 3,
}: FormInputProps) => {
  if (textarea) {
    return (
      <div className="space-y-2">
        <label className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-widest pl-1 block">
          {label}
        </label>

        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors">
              {React.cloneElement(icon, {
                size: 17,
                className: "text-gray-400",
              })}
            </div>
          )}

          <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className={`input w-full ${
              icon ? "pl-11" : "pl-4"
            } pr-4 py-3 text-[13px] bg-white border border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/5 rounded-xl transition-all resize-none`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-widest pl-1 block">
        {label}
      </label>

      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors">
            {React.cloneElement(icon, {
              size: 17,
              className: "text-gray-400",
            })}
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input w-full ${
            icon ? "pl-11" : "pl-4"
          } pr-4 py-3 text-[13px] bg-white border border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/5 rounded-xl transition-all`}
        />
      </div>
    </div>
  );
};
