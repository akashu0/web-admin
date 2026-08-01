import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Initials for an avatar fallback, e.g. "Sarah Jenkins" -> "SJ". */
export function initials(name?: string | null): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Relative "time ago" string from an ISO date. */
export function timeAgo(input?: string | number | Date | null): string {
  if (!input) return "—";
  const then = new Date(input).getTime();
  if (Number.isNaN(then)) return "—";
  const diff = Date.now() - then;
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day === 1) return "Yesterday";
  if (day < 7) return `${day}d ago`;
  return new Date(input).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * A date as yyyy-mm-dd in the LOCAL timezone — the form value a date field holds.
 *
 * `toISOString().slice(0, 10)` is the tempting one-liner and it is wrong east of
 * Greenwich after 18:30: it shifts to UTC first and hands back tomorrow. `sv-SE`
 * is the ISO shape on the local clock.
 */
export function dateKey(d: Date): string {
  return d.toLocaleDateString("sv-SE");
}

/** Format an ISO date as "Oct 12, 2023". */
export function formatDate(input?: string | number | Date | null): string {
  if (!input) return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Turn a snake_case / kebab backend key into a Title Case label. */
export function humanize(value?: string | null): string {
  if (!value) return "";
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
