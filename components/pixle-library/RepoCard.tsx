import type { ReactNode } from "react";
import type { PixleComponentMarkerAttributes } from "./RepoButton";

export type RepoCardProps = {
  eyebrow?: string;
  title: string;
  body: string;
  action?: ReactNode;
  className?: string;
  markerAttributes?: PixleComponentMarkerAttributes;
};

/** A neutral source-owned card primitive for future page slots. */
export function RepoCard({
  eyebrow,
  title,
  body,
  action,
  className,
  markerAttributes,
}: RepoCardProps) {
  return (
    <section className={className} {...markerAttributes}>
      {eyebrow ? <span>{eyebrow}</span> : null}
      <h2>{title}</h2>
      <p>{body}</p>
      {action}
    </section>
  );
}
