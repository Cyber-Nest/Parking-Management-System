"use client";

import React from "react";

interface ActionButtonProps {
  icon: React.ReactElement;
  color?: string;
  variant?: "default" | "danger";
  onClick?: () => void;
  disabled?: boolean;
}

export const ActionButton = ({
  icon,
  color,
  variant = "default",
  onClick,
  disabled = false,
}: ActionButtonProps) => {
  const getButtonStyles = () => {
    if (variant === "danger") {
      return {
        className: "hover:border-red-300 dark:hover:border-red-700",
        color: "#EF4444",
      };
    }
    return {
      className: "hover:border-[var(--color-primary-light)] dark:hover:border-[var(--color-primary)]",
      color: color || "var(--color-primary)",
    };
  };

  const { className: hoverClass, color: buttonColor } = getButtonStyles();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        p-2 sm:p-2.5 rounded-xl border border-[var(--color-border)] 
        bg-[var(--color-surface)] dark:bg-[var(--color-surface-soft)]
        hover:shadow-sm transition-all group 
        ${hoverClass}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
      style={{
        color: buttonColor,
      }}
    >
      <div className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon as React.ReactElement<any>, { 
          size: 15,
          className: "w-[15px] h-[15px] sm:w-[15px] sm:h-[15px]"
        })}
      </div>
    </button>
  );
};