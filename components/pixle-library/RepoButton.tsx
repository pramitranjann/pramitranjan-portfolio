import Image from "next/image";

export type RepoButtonProps = {
  label: string;
  href: string;
  tone?: "primary" | "secondary";
  icon?: "vercel";
  className?: string;
  markerAttributes?: PixleComponentMarkerAttributes;
};

export type PixleComponentMarkerAttributes = {
  "data-pixle-instance-id": string;
  "data-pixle-component-id": string;
  "data-pixle-slot-id": string;
  "data-pixle-variant-tone"?: string;
  "data-pixle-variant-state"?: string;
  "data-pixle-variant-size"?: string;
  "data-pixle-variant-emphasis"?: string;
};

/**
 * A small, source-owned link button used by the starter page and exposed to
 * Pixle Nudge as a component-library entry. Styling remains at the page slot
 * so the rendered instance preserves the page's existing visual language.
 */
export function RepoButton({
  label,
  href,
  icon,
  className,
  markerAttributes,
}: RepoButtonProps) {
  const disabled = markerAttributes?.["data-pixle-variant-state"] === "disabled";

  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      {...markerAttributes}
    >
      {icon === "vercel" ? (
        <Image src="/vercel.svg" alt="" width={16} height={14} aria-hidden />
      ) : null}
      {label}
    </a>
  );
}
