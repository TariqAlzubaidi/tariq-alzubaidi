import type { ButtonHTMLAttributes, ReactNode } from "react";

type PortfolioButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  tone?: "solid" | "outline";
  compact?: boolean;
};

export function PortfolioButton({
  children,
  className = "",
  tone = "outline",
  compact = false,
  ...props
}: PortfolioButtonProps) {
  return (
    <button
      className={`portfolio-button ${tone === "solid" ? "portfolio-button-solid" : "portfolio-button-outline"} ${compact ? "portfolio-button-compact" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}