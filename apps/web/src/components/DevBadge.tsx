/**
 * Development builds say so beside the brand, matching the DEV badge on the Dock icon.
 * One surface and border keep the label legible on page chrome and on the icon artwork.
 */
export function DevBadge({ className }: { className?: string }) {
  if (!import.meta.env.DEV) return null;
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none shrink-0 rounded-sm border border-warning bg-background px-1.5 py-0.5 text-[10px] font-semibold leading-none tracking-wide text-foreground${className ? ` ${className}` : ""}`}
    >
      DEV
    </span>
  );
}
