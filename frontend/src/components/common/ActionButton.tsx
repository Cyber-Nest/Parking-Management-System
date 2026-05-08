"use client";

import React from "react";

interface ActionButtonProps {
  icon: React.ReactElement;
  color?: string;
  variant?: "default" | "danger";
  onClick?: () => void;
}

export const ActionButton = ({
  icon,
  color,
  variant = "default",
  onClick,
}: ActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`p-2.5 rounded-xl border border-[var(--color-border)] bg-white hover:shadow-sm transition-all group ${
        variant === "danger"
          ? "hover:border-red-200"
          : "hover:border-[var(--color-primary-light)]"
      }`}
      style={{
        color:
          variant === "danger" ? "#EF4444" : color || "var(--color-primary)",
      }}
    >
      <div className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 15 })}
      </div>
    </button>
  );
};
