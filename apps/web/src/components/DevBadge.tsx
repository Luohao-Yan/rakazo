/**
 * Development builds say so beside the brand, matching the DEV badge on the Dock icon.
 * `solid` keeps the label readable when it sits on an image rather than page chrome.
 */
export function DevBadge({
  className,
  variant = "outline",
}: {
  className?: string;
  variant?: "outline" | "solid";
}) {
  if (!import.meta.env.DEV) return null;
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] font-semibold leading-none tracking-wide ${
        variant === "solid"
          ? "border border-warning bg-background text-foreground"
          : "border border-warning/60 text-warning"
      }${className ? ` ${className}` : ""}`}
    >
      DEV
    </span>
  );
}
