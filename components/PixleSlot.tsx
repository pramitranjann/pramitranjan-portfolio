import {
  componentRegistry,
  initialPixleLayout,
  readPixleLayout,
  resolvedInstance,
  type PixleComponentId,
  type PixleComponentInstance,
  type PixleProps,
  type PixleVariants,
} from "../lib/pixle-nudge-components";
import { RepoButton } from "./pixle-library/RepoButton";
import { RepoCard } from "./pixle-library/RepoCard";

type PixleSlotProps = {
  pathname?: string;
  slotId: string;
  slotType: string;
  className?: string;
  componentClassName?: (
    componentId: PixleComponentId,
    variants: PixleVariants,
  ) => string | undefined;
};

function stringValue(props: PixleProps, key: string, fallback = ""): string {
  const value = props[key];
  return typeof value === "string" ? value : fallback;
}

function markerAttributes(
  instance: PixleComponentInstance,
  slotId: string,
) {
  return {
    "data-pixle-instance-id": instance.id,
    "data-pixle-component-id": instance.componentId,
    "data-pixle-slot-id": slotId,
    "data-pixle-variant-tone": instance.variants.tone,
    "data-pixle-variant-state": instance.variants.state,
    "data-pixle-variant-size": instance.variants.size,
    "data-pixle-variant-emphasis": instance.variants.emphasis,
  };
}

function renderInstance(
  instance: PixleComponentInstance,
  slotId: string,
  className?: string,
) {
  const marker = markerAttributes(instance, slotId);

  switch (instance.componentId) {
    case "repo-button":
      return (
        <RepoButton
          key={instance.id}
          label={stringValue(instance.props, "label", "Button")}
          href={stringValue(instance.props, "href", "#")}
          icon={
            instance.props.icon === "vercel" ? "vercel" : undefined
          }
          className={className}
          markerAttributes={marker}
        />
      );
    case "repo-card":
      return (
        <RepoCard
          key={instance.id}
          eyebrow={stringValue(instance.props, "eyebrow")}
          title={stringValue(instance.props, "title", "Card title")}
          body={stringValue(
            instance.props,
            "body",
            "A reusable piece of page content.",
          )}
          className={className}
          markerAttributes={marker}
        />
      );
  }
}

/**
 * Server-side, source-backed component slot. The layout document owns order,
 * instances, props, and component defaults; the editor only interacts through
 * the emitted identifiers rather than rearranging arbitrary browser DOM.
 */
export async function PixleSlot({
  pathname = "/",
  slotId,
  slotType,
  className,
  componentClassName,
}: PixleSlotProps) {
  const page = readPixleLayout(pathname);
  const instances = page.slots[slotId] ?? [];
  const acceptedComponents = Object.values(componentRegistry)
    .filter((component) => component.acceptedSlotTypes.includes(slotType))
    .map((component) => component.componentId)
    .join(",");

  return (
    <div
      className={className}
      data-pixle-slot-id={slotId}
      data-pixle-slot-type={slotType}
      data-pixle-slot-accepts={acceptedComponents}
    >
      {instances.map((instance) => {
        const resolved = resolvedInstance(initialPixleLayout, instance);
        return renderInstance(
          resolved,
          slotId,
          componentClassName?.(resolved.componentId, resolved.variants),
        );
      })}
    </div>
  );
}
