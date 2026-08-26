import type { SVGProps } from "react";

/**
 * Notes logo — a compact "N" held inside a rounded note tile.
 * Geometry matches `public/logo-mark.svg`; `currentColor` keeps it visible in
 * light and dark themes.
 */
export function LogoMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      height="32"
      viewBox="0 0 32 32"
      width="32"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Notes</title>
      <rect
        height="26"
        rx="6"
        stroke="currentColor"
        strokeWidth="2"
        width="26"
        x="3"
        y="3"
      />
      <path
        d="M10 22V10L22 22V10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}
