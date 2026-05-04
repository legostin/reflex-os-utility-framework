import * as React from "react";
import { cn } from "../cn";

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number;
}

export function Spinner({ size = 16, className, ...rest }: SpinnerProps) {
  return (
    <svg
      role="img"
      aria-label="Loading"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn("animate-spin text-reflex-fg-muted", className)}
      {...rest}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" fill="none" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: boolean;
}

export function Skeleton({ rounded = true, className, ...rest }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-reflex-surface-3 animate-pulse",
        rounded ? "rounded" : "",
        className,
      )}
      {...rest}
    />
  );
}
