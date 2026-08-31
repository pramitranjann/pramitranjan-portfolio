/**
 * Persisted data shared by the Pixle Nudge editor and its route handler.
 *
 * The base `pages` and `guides` fields intentionally retain their original
 * shape. Responsive rules are an optional extension so existing data files
 * continue to load unchanged.
 */

export type ViewportPreset = "desktop" | "tablet" | "mobile";

export const VIEWPORT_PRESETS = [
  "desktop",
  "tablet",
  "mobile",
] as const satisfies readonly ViewportPreset[];

/** Widths used by the editor's responsive frames, in design pixels. */
export const VIEWPORT_FRAME_WIDTHS: Readonly<Record<ViewportPreset, number>> = {
  desktop: 1440,
  tablet: 768,
  mobile: 390,
};

export const DESKTOP_FRAME_WIDTH = VIEWPORT_FRAME_WIDTHS.desktop;
export const TABLET_FRAME_WIDTH = VIEWPORT_FRAME_WIDTHS.tablet;
export const MOBILE_FRAME_WIDTH = VIEWPORT_FRAME_WIDTHS.mobile;

// Short aliases keep the constants convenient for editor integrations while
// retaining one source of truth for the frame dimensions.
export const FRAME_WIDTHS = VIEWPORT_FRAME_WIDTHS;
export const VIEWPORT_WIDTHS = VIEWPORT_FRAME_WIDTHS;

export type Rule = {
  sel: string;
  x: number;
  y: number;
  width?: number | null;
  height?: number | null;
  scale?: number;
  color?: string | null;
  backgroundColor?: string | null;
  fontFamily?: string | null;
  fontSize?: number | null;
  fontWeight?: number | null;
  lineHeight?: number | null;
  letterSpacing?: number | null;
  text?: string | null;
  textPath?: number[] | null;
  visible?: boolean;
  locked?: boolean;
  deleted?: boolean;
};

export type Guides = {
  x: number[];
  y: number[];
};

export type ResponsivePages = Record<
  string,
  Partial<Record<ViewportPreset, Rule[]>>
>;

export type Store = {
  version: 1;
  pages: Record<string, Rule[]>;
  guides?: Record<string, Guides>;
  responsive?: ResponsivePages;
};

export const emptyStore = (): Store => ({
  version: 1,
  pages: {},
  guides: {},
});

/**
 * Select a stable editor preset from a browser/frame width.
 *
 * The thresholds leave the common 390px and 768px frames in their expected
 * buckets while avoiding a surprising desktop preset on tablet-sized screens.
 */
export function viewportForWidth(width: number): ViewportPreset {
  if (!Number.isFinite(width) || width <= 480) return "mobile";
  if (width <= 1024) return "tablet";
  return "desktop";
}

/** A stable, serializable identity for a text node path. */
export function textPathIdentity(textPath?: number[] | null): string {
  return JSON.stringify(Array.isArray(textPath) ? textPath : null);
}

/**
 * A stable identity for a rule. Selector and text-node path together identify
 * the edited target; absent and null text paths intentionally mean the same
 * element-level rule, matching the legacy editor behavior.
 */
export function ruleIdentity(
  rule: Pick<Rule, "sel" | "textPath">,
): string;
export function ruleIdentity(
  sel: string,
  textPath?: number[] | null,
): string;
export function ruleIdentity(
  ruleOrSelector: Pick<Rule, "sel" | "textPath"> | string,
  textPath?: number[] | null,
): string {
  const sel =
    typeof ruleOrSelector === "string" ? ruleOrSelector : ruleOrSelector.sel;
  const path =
    typeof ruleOrSelector === "string" ? textPath : ruleOrSelector.textPath;
  return JSON.stringify([sel, Array.isArray(path) ? path : null]);
}

export const ruleKey = ruleIdentity;
export const textPathKey = textPathIdentity;

export function sameTextPath(
  a?: number[] | null,
  b?: number[] | null,
): boolean {
  if (!Array.isArray(a) || !Array.isArray(b)) return a == null && b == null;
  return a.length === b.length && a.every((part, index) => part === b[index]);
}

export function sameRuleIdentity(
  a: Pick<Rule, "sel" | "textPath">,
  b: Pick<Rule, "sel" | "textPath">,
): boolean {
  return a.sel === b.sel && sameTextPath(a.textPath, b.textPath);
}

/**
 * Resolve the rules that should be replayed for a page and viewport.
 * Responsive entries overlay matching base rules and append new responsive
 * targets that do not exist in the base page.
 */
export function rulesForPage(
  store: Store,
  path: string,
  preset?: ViewportPreset,
): Rule[] {
  const baseRules = store.pages?.[path] ?? [];
  const rules = baseRules.map((rule) => ({
    ...rule,
    textPath: Array.isArray(rule.textPath) ? [...rule.textPath] : rule.textPath,
  }));

  if (!preset) return rules;

  const overrides = store.responsive?.[path]?.[preset] ?? [];
  for (const override of overrides) {
    const index = rules.findIndex((rule) => sameRuleIdentity(rule, override));
    const next = {
      ...(index >= 0 ? rules[index] : undefined),
      ...override,
      textPath: Array.isArray(override.textPath)
        ? [...override.textPath]
        : override.textPath,
    };
    if (index >= 0) rules[index] = next;
    else rules.push(next);
  }

  return rules;
}

/**
 * Replace one page's base or responsive rules without mutating the store or
 * any of its existing page maps.
 */
export function replaceRulesForPage(
  store: Store,
  path: string,
  rules: Rule[],
  preset?: ViewportPreset,
): Store {
  const nextRules = rules.map((rule) => ({
    ...rule,
    textPath: Array.isArray(rule.textPath) ? [...rule.textPath] : rule.textPath,
  }));

  if (!preset) {
    return {
      ...store,
      pages: { ...store.pages, [path]: nextRules },
    };
  }

  return {
    ...store,
    responsive: {
      ...store.responsive,
      [path]: {
        ...store.responsive?.[path],
        [preset]: nextRules,
      },
    },
  };
}

/** Replace part or all of a store while retaining the version-1 contract. */
export function replaceStore(store: Store, next: Partial<Store>): Store {
  return {
    ...store,
    ...next,
    version: 1,
    pages: { ...(next.pages ?? store.pages) },
    ...(next.guides ?? store.guides
      ? { guides: { ...(next.guides ?? store.guides) } }
      : {}),
    ...(next.responsive ?? store.responsive
      ? { responsive: { ...(next.responsive ?? store.responsive) } }
      : {}),
  };
}

export function isViewportPreset(value: string): value is ViewportPreset {
  return (VIEWPORT_PRESETS as readonly string[]).includes(value);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Shallow persistence validation used by the route handler. */
export function isPages(value: unknown): value is Record<string, Rule[]> {
  return (
    isRecord(value) &&
    Object.values(value).every((rules) => Array.isArray(rules))
  );
}

export function isGuides(value: unknown): value is Record<string, Guides> {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (guides) =>
        isRecord(guides) &&
        Array.isArray(guides.x) &&
        Array.isArray(guides.y),
    )
  );
}

export function isResponsivePages(value: unknown): value is ResponsivePages {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (presets) =>
        isRecord(presets) &&
        Object.entries(presets).every(
          ([preset, rules]) => isViewportPreset(preset) && Array.isArray(rules),
        ),
    )
  );
}

/** Normalize untrusted persisted JSON without changing valid page data. */
export function normalizeStore(value: unknown): Store {
  if (!isRecord(value)) return emptyStore();

  const store: Store = {
    version: 1,
    pages: isPages(value.pages) ? value.pages : {},
    guides: isGuides(value.guides) ? value.guides : {},
  };
  if (isResponsivePages(value.responsive)) store.responsive = value.responsive;
  return store;
}
