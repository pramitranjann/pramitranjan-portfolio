import initialLayoutJson from "../public/pixle-nudge-layout.json";

/**
 * The source-backed document used by Pixle Nudge's component workflow.
 *
 * This module intentionally contains no server-only imports. The editor,
 * preview frame, and route handler all use the same serializable contract.
 */

export type PixleComponentId = "repo-button" | "repo-card";

export type PixlePrimitive = string | number | boolean | null;
export type PixleProps = Record<string, PixlePrimitive>;
export type PixleVariants = Record<string, string>;

export type PixleEditableProp = {
  key: string;
  label: string;
  control: "text" | "number" | "color" | "select" | "url";
  options?: readonly { label: string; value: string }[];
};

export type PixleVariantAxis = {
  key: string;
  label: string;
  options: readonly { label: string; value: string }[];
  defaultValue: string;
};

export type PixleComponentPreview = {
  label: string;
  description: string;
  kind: "button" | "card";
};

export type PixleComponentDefinition = {
  componentId: PixleComponentId;
  name: string;
  importPath: string;
  defaultProps: PixleProps;
  defaultVariants: PixleVariants;
  editableProps: readonly PixleEditableProp[];
  variantAxes: readonly PixleVariantAxis[];
  preview: PixleComponentPreview;
  acceptedSlotTypes: readonly string[];
};

/**
 * Component metadata is deliberately declarative. A renderer can import the
 * listed source component without shipping any of the editor-only UI.
 */
export const componentRegistry: Readonly<
  Record<PixleComponentId, PixleComponentDefinition>
> = {
  "repo-button": {
    componentId: "repo-button",
    name: "Button",
    importPath: "@/components/pixle-library/RepoButton",
    defaultProps: { label: "Button", href: "#", icon: null },
    defaultVariants: { tone: "primary", size: "medium", state: "default" },
    editableProps: [
      { key: "label", label: "Label", control: "text" },
      { key: "href", label: "Link", control: "url" },
      {
        key: "icon",
        label: "Icon",
        control: "select",
        options: [
          { label: "None", value: "" },
          { label: "Vercel", value: "vercel" },
        ],
      },
    ],
    variantAxes: [
      {
        key: "tone",
        label: "Tone",
        defaultValue: "primary",
        options: [
          { label: "Primary", value: "primary" },
          { label: "Secondary", value: "secondary" },
          { label: "Quiet", value: "quiet" },
        ],
      },
      {
        key: "size",
        label: "Size",
        defaultValue: "medium",
        options: [
          { label: "Small", value: "small" },
          { label: "Medium", value: "medium" },
          { label: "Large", value: "large" },
        ],
      },
      {
        key: "state",
        label: "State",
        defaultValue: "default",
        options: [
          { label: "Default", value: "default" },
          { label: "Hover", value: "hover" },
          { label: "Disabled", value: "disabled" },
          { label: "Loading", value: "loading" },
        ],
      },
    ],
    preview: {
      kind: "button",
      label: "Primary action",
      description: "A reusable call-to-action with tone, size, and state.",
    },
    acceptedSlotTypes: ["actions", "content", "footer"],
  },
  "repo-card": {
    componentId: "repo-card",
    name: "Card",
    importPath: "@/components/pixle-library/RepoCard",
    defaultProps: {
      eyebrow: "Component",
      title: "Card title",
      body: "A reusable piece of page content.",
    },
    defaultVariants: { tone: "surface", emphasis: "normal" },
    editableProps: [
      { key: "eyebrow", label: "Eyebrow", control: "text" },
      { key: "title", label: "Title", control: "text" },
      { key: "body", label: "Body", control: "text" },
    ],
    variantAxes: [
      {
        key: "tone",
        label: "Tone",
        defaultValue: "surface",
        options: [
          { label: "Surface", value: "surface" },
          { label: "Subtle", value: "subtle" },
          { label: "Inverted", value: "inverted" },
        ],
      },
      {
        key: "emphasis",
        label: "Emphasis",
        defaultValue: "normal",
        options: [
          { label: "Normal", value: "normal" },
          { label: "Featured", value: "featured" },
        ],
      },
    ],
    preview: {
      kind: "card",
      label: "Content card",
      description: "A reusable content block with editable copy and tone.",
    },
    acceptedSlotTypes: ["content", "sidebar", "footer"],
  },
};

export type PixleComponentInstance = {
  id: string;
  componentId: PixleComponentId;
  /** Local overrides only. Registry and component defaults resolve at render time. */
  props: PixleProps;
  variants: PixleVariants;
};

export type PixleSlot = PixleComponentInstance[];

export type PixleCanvasInstance = PixleComponentInstance & {
  x: number;
  y: number;
};

export type PixlePageLayout = {
  slots: Record<string, PixleSlot>;
  canvas: PixleCanvasInstance[];
};

export type PixleComponentDefaults = {
  props: PixleProps;
  variants: PixleVariants;
};

export type PixleLayoutDocument = {
  version: 1;
  componentDefaults: Partial<Record<PixleComponentId, PixleComponentDefaults>>;
  pages: Record<string, PixlePageLayout>;
};

const EMPTY_PAGE: PixlePageLayout = { slots: {}, canvas: [] };

export const emptyPixleLayout = (): PixleLayoutDocument => ({
  version: 1,
  componentDefaults: {},
  pages: {},
});

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isPrimitive(value: unknown): value is PixlePrimitive {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function normalizeProps(value: unknown): PixleProps {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => isPrimitive(entry)),
  ) as PixleProps;
}

function normalizeVariants(value: unknown): PixleVariants {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => typeof entry === "string"),
  ) as PixleVariants;
}

export function isPixleComponentId(value: unknown): value is PixleComponentId {
  return typeof value === "string" && value in componentRegistry;
}

export function normalizeInstance(value: unknown): PixleComponentInstance | null {
  if (!isRecord(value) || typeof value.id !== "string" || !value.id) return null;
  if (!isPixleComponentId(value.componentId)) return null;
  return {
    id: value.id,
    componentId: value.componentId,
    props: normalizeProps(value.props),
    variants: normalizeVariants(value.variants),
  };
}

export function isPixleComponentInstance(
  value: unknown,
): value is PixleComponentInstance {
  return normalizeInstance(value) !== null;
}

function normalizeSlots(value: unknown): Record<string, PixleSlot> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, instances]) => Array.isArray(instances))
      .map(([slotId, instances]) => {
        const candidates = instances as unknown[];
        return [
          slotId,
          candidates
          .map(normalizeInstance)
          .filter((instance): instance is PixleComponentInstance => instance !== null),
        ];
      }),
  );
}

function normalizeCanvas(value: unknown): PixleCanvasInstance[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((candidate) => {
    const instance = normalizeInstance(candidate);
    if (!instance || !isRecord(candidate)) return [];
    const x = typeof candidate.x === "number" && Number.isFinite(candidate.x)
      ? candidate.x
      : 0;
    const y = typeof candidate.y === "number" && Number.isFinite(candidate.y)
      ? candidate.y
      : 0;
    return [{ ...instance, x, y }];
  });
}

function normalizePages(value: unknown): Record<string, PixlePageLayout> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([pathname, page]) => pathname.startsWith("/") && isRecord(page))
      .map(([pathname, page]) => {
        const record = page as Record<string, unknown>;
        return [
          pathname,
          {
            slots: normalizeSlots(record.slots),
            canvas: normalizeCanvas(record.canvas),
          },
        ];
      }),
  );
}

function normalizeComponentDefaults(
  value: unknown,
): PixleLayoutDocument["componentDefaults"] {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([componentId]) => isPixleComponentId(componentId))
      .map(([componentId, defaults]) => {
        const value = isRecord(defaults) ? defaults : {};
        return [
          componentId,
          {
            props: normalizeProps(value.props),
            variants: normalizeVariants(value.variants),
          },
        ];
      }),
  ) as PixleLayoutDocument["componentDefaults"];
}

/** Normalize untrusted JSON while retaining only supported source components. */
export function normalizePixleLayout(value: unknown): PixleLayoutDocument {
  if (!isRecord(value)) return emptyPixleLayout();
  return {
    version: 1,
    componentDefaults: normalizeComponentDefaults(value.componentDefaults),
    pages: normalizePages(value.pages),
  };
}

export function isPixleLayoutDocument(value: unknown): value is PixleLayoutDocument {
  if (!isRecord(value) || value.version !== 1) return false;
  const normalized = normalizePixleLayout(value);
  return JSON.stringify(normalized) === JSON.stringify(value);
}

export const initialPixleLayout = normalizePixleLayout(initialLayoutJson);

/** Return a copy-safe page layout, including an empty page for new routes. */
export function readPixleLayout(
  pathname: string,
  layout: PixleLayoutDocument = initialPixleLayout,
): PixlePageLayout {
  const page = layout.pages[pathname] ?? EMPTY_PAGE;
  return {
    slots: cloneSlots(page.slots),
    canvas: page.canvas.map((instance) => ({
      ...instance,
      props: { ...instance.props },
      variants: { ...instance.variants },
    })),
  };
}

export function componentDefaultsFor(
  layout: PixleLayoutDocument,
  componentId: PixleComponentId,
): PixleComponentDefaults {
  return {
    props: {
      ...componentRegistry[componentId].defaultProps,
      ...normalizeProps(layout.componentDefaults[componentId]?.props),
    },
    variants: {
      ...componentRegistry[componentId].defaultVariants,
      ...normalizeVariants(layout.componentDefaults[componentId]?.variants),
    },
  };
}

export function resolvedInstance(
  layout: PixleLayoutDocument,
  instance: PixleComponentInstance,
): PixleComponentInstance {
  return {
    ...instance,
    props: {
      ...componentDefaultsFor(layout, instance.componentId).props,
      ...instance.props,
    },
    variants: {
      ...componentDefaultsFor(layout, instance.componentId).variants,
      ...instance.variants,
    },
  };
}

export function createPixleInstance(
  componentId: PixleComponentId,
  overrides: Partial<Omit<PixleComponentInstance, "id" | "componentId">> & {
    id?: string;
  } = {},
): PixleComponentInstance {
  return {
    id: overrides.id?.trim() || createInstanceId(componentId),
    componentId,
    props: normalizeProps(overrides.props),
    variants: normalizeVariants(overrides.variants),
  };
}

function createInstanceId(componentId: PixleComponentId): string {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return `${componentId}-${suffix}`;
}

function cloneSlots(slots: Record<string, PixleSlot>): Record<string, PixleSlot> {
  return Object.fromEntries(
    Object.entries(slots).map(([slotId, instances]) => [
      slotId,
      instances.map((instance) => ({
        ...instance,
        props: { ...instance.props },
        variants: { ...instance.variants },
      })),
    ]),
  );
}

function withSlots(
  layout: PixleLayoutDocument,
  pathname: string,
  apply: (slots: Record<string, PixleSlot>) => Record<string, PixleSlot>,
): PixleLayoutDocument {
  const page = readPixleLayout(pathname, layout);
  return {
    ...layout,
    pages: {
      ...layout.pages,
      [pathname]: { ...page, slots: apply(page.slots) },
    },
  };
}

function withCanvas(
  layout: PixleLayoutDocument,
  pathname: string,
  apply: (canvas: PixleCanvasInstance[]) => PixleCanvasInstance[],
): PixleLayoutDocument {
  const page = readPixleLayout(pathname, layout);
  return {
    ...layout,
    pages: {
      ...layout.pages,
      [pathname]: { ...page, canvas: apply(page.canvas) },
    },
  };
}

export function insertPixleCanvasInstance(
  layout: PixleLayoutDocument,
  pathname: string,
  instance: PixleComponentInstance,
  position: { x: number; y: number },
): PixleLayoutDocument {
  const nextInstance = normalizeInstance(instance);
  if (!nextInstance) return layout;
  return withCanvas(layout, pathname, (canvas) => [
    ...canvas,
    { ...nextInstance, x: position.x, y: position.y },
  ]);
}

export function movePixleCanvasInstance(
  layout: PixleLayoutDocument,
  pathname: string,
  instanceId: string,
  position: { x: number; y: number },
): PixleLayoutDocument {
  return withCanvas(layout, pathname, (canvas) =>
    canvas.map((instance) =>
      instance.id === instanceId ? { ...instance, ...position } : instance,
    ),
  );
}

export function removePixleCanvasInstance(
  layout: PixleLayoutDocument,
  pathname: string,
  instanceId: string,
): PixleLayoutDocument {
  return withCanvas(layout, pathname, (canvas) =>
    canvas.filter((instance) => instance.id !== instanceId),
  );
}

export function updatePixleCanvasInstance(
  layout: PixleLayoutDocument,
  pathname: string,
  instanceId: string,
  update: Partial<Pick<PixleComponentInstance, "props" | "variants">>,
): PixleLayoutDocument {
  return withCanvas(layout, pathname, (canvas) =>
    canvas.map((instance) =>
      instance.id === instanceId
        ? {
            ...instance,
            props: { ...instance.props, ...normalizeProps(update.props) },
            variants: {
              ...instance.variants,
              ...normalizeVariants(update.variants),
            },
          }
        : instance,
    ),
  );
}

export function insertPixleInstance(
  layout: PixleLayoutDocument,
  pathname: string,
  slotId: string,
  instance: PixleComponentInstance,
  index?: number,
): PixleLayoutDocument {
  const nextInstance = normalizeInstance(instance);
  if (!nextInstance || !slotId) return layout;
  return withSlots(layout, pathname, (slots) => {
    const slot = [...(slots[slotId] ?? [])];
    const position = Math.max(0, Math.min(index ?? slot.length, slot.length));
    slot.splice(position, 0, nextInstance);
    return { ...slots, [slotId]: slot };
  });
}

export function reorderPixleInstance(
  layout: PixleLayoutDocument,
  pathname: string,
  slotId: string,
  instanceId: string,
  toIndex: number,
): PixleLayoutDocument {
  return withSlots(layout, pathname, (slots) => {
    const slot = [...(slots[slotId] ?? [])];
    const fromIndex = slot.findIndex((instance) => instance.id === instanceId);
    if (fromIndex < 0) return slots;
    const [instance] = slot.splice(fromIndex, 1);
    slot.splice(Math.max(0, Math.min(toIndex, slot.length)), 0, instance);
    return { ...slots, [slotId]: slot };
  });
}

export function movePixleInstance(
  layout: PixleLayoutDocument,
  pathname: string,
  fromSlotId: string,
  toSlotId: string,
  instanceId: string,
  toIndex?: number,
): PixleLayoutDocument {
  if (fromSlotId === toSlotId) {
    return reorderPixleInstance(layout, pathname, fromSlotId, instanceId, toIndex ?? 0);
  }
  const source = readPixleLayout(pathname, layout).slots[fromSlotId] ?? [];
  const instance = source.find((candidate) => candidate.id === instanceId);
  if (!instance || !toSlotId) return layout;
  const withoutSource = withSlots(layout, pathname, (slots) => ({
    ...slots,
    [fromSlotId]: (slots[fromSlotId] ?? []).filter(
      (candidate) => candidate.id !== instanceId,
    ),
  }));
  return insertPixleInstance(withoutSource, pathname, toSlotId, instance, toIndex);
}

export function removePixleInstance(
  layout: PixleLayoutDocument,
  pathname: string,
  slotId: string,
  instanceId: string,
): PixleLayoutDocument {
  return withSlots(layout, pathname, (slots) => ({
    ...slots,
    [slotId]: (slots[slotId] ?? []).filter(
      (instance) => instance.id !== instanceId,
    ),
  }));
}

export function updatePixleInstance(
  layout: PixleLayoutDocument,
  pathname: string,
  slotId: string,
  instanceId: string,
  update: Partial<Pick<PixleComponentInstance, "props" | "variants">>,
): PixleLayoutDocument {
  return withSlots(layout, pathname, (slots) => ({
    ...slots,
    [slotId]: (slots[slotId] ?? []).map((instance) =>
      instance.id === instanceId
        ? {
            ...instance,
            props: { ...instance.props, ...normalizeProps(update.props) },
            variants: {
              ...instance.variants,
              ...normalizeVariants(update.variants),
            },
          }
        : instance,
    ),
  }));
}

export function updatePixleComponentDefaults(
  layout: PixleLayoutDocument,
  componentId: PixleComponentId,
  update: Partial<PixleComponentDefaults>,
): PixleLayoutDocument {
  const current = layout.componentDefaults[componentId];
  return {
    ...layout,
    componentDefaults: {
      ...layout.componentDefaults,
      [componentId]: {
        props: {
          ...normalizeProps(current?.props),
          ...normalizeProps(update.props),
        },
        variants: {
          ...normalizeVariants(current?.variants),
          ...normalizeVariants(update.variants),
        },
      },
    },
  };
}

/** Merge a PATCH payload without allowing omitted branches to erase the store. */
export function patchPixleLayout(
  current: PixleLayoutDocument,
  patch: unknown,
): PixleLayoutDocument {
  if (!isRecord(patch)) return current;
  const normalized = normalizePixleLayout(patch);
  return {
    version: 1,
    componentDefaults:
      "componentDefaults" in patch
        ? normalized.componentDefaults
        : current.componentDefaults,
    pages: "pages" in patch ? normalized.pages : current.pages,
  };
}
