"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  componentDefaultsFor,
  componentRegistry,
  createPixleInstance,
  initialPixleLayout,
  insertPixleCanvasInstance,
  insertPixleInstance,
  isPixleComponentId,
  movePixleCanvasInstance,
  movePixleInstance,
  readPixleLayout,
  removePixleCanvasInstance,
  removePixleInstance,
  resolvedInstance,
  updatePixleComponentDefaults,
  updatePixleCanvasInstance,
  updatePixleInstance,
  type PixleCanvasInstance,
  type PixleComponentId,
  type PixleLayoutDocument,
  type PixlePrimitive,
} from "../lib/pixle-nudge-components";
import {
  emptyStore,
  replaceRulesForPage,
  rulesForPage,
  sameRuleIdentity,
  type Guides,
  type Rule,
  type Store,
  type ViewportPreset,
  VIEWPORT_FRAME_WIDTHS,
  viewportForWidth,
} from "../lib/pixle-nudge-model";

type TextEdit = {
  el: Element;
  path: number[];
  initial: string;
  value: string;
};

type ResizeDirection = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

type Viewport = {
  scrollX: number;
  scrollY: number;
  width: number;
  height: number;
};

type GuideDrag = {
  axis: "x" | "y";
  index?: number;
};

type LayerEntry = {
  el: Element;
  key: string;
  depth: number;
  name: string;
  hasChildren: boolean;
  ancestorKeys: string[];
  instanceId?: string;
  componentId?: PixleComponentId;
  slotId?: string;
  slotType?: string;
};

type LeftPanelTab = "layers" | "components";
type ComponentEditScope = "instance" | "component";

type StagePoint = {
  x: number;
  y: number;
};

type StageGeometry = {
  root: HTMLElement;
  naturalLeft: number;
  naturalTop: number;
  width: number;
};

type CanvasCamera = {
  left: number;
  top: number;
  zoom: number;
};

type CanvasInstanceDrag = {
  pointerId: number;
  instanceId: string;
  x0: number;
  y0: number;
  originX: number;
  originY: number;
};

type ElementBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type SnapCandidates = {
  x: number[];
  y: number[];
};

type SmartGuide = {
  axis: "x" | "y";
  value: number;
  distance?: number;
  labelAt?: number;
  snapped?: boolean;
};

type MarqueeBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type GroupItem = {
  el: Element;
  base: Rule;
  box: ElementBox;
};

type GroupDrag = {
  x0: number;
  y0: number;
  box: ElementBox;
  items: GroupItem[];
  snap: SnapCandidates;
};

type GroupResize = GroupDrag & {
  direction: ResizeDirection;
};

const SNAP_THRESHOLD_SCREEN = 6;

type ResettableRuleProperty =
  | "x"
  | "y"
  | "width"
  | "height"
  | "color"
  | "backgroundColor"
  | "fontFamily"
  | "fontSize"
  | "fontWeight"
  | "lineHeight"
  | "letterSpacing";

const ROOT_ID = "pixle-nudge-root";
const SHEET_ID = "pixle-nudge-sheet";
const PREVIEW_SHEET_ID = "pixle-nudge-preview-sheet";
const STAGE_SHEET_ID = "pixle-nudge-stage-sheet";
const FRAME_CHROME_SHEET_ID = "pixel-nudge-frame-chrome";
const STAGE_ATTR = "data-pixle-stage";
const SOURCE_HIDDEN_ATTR = "data-pixle-source-hidden";
const FRAME_QUERY = "__pixle_nudge_frame";
const FRAME_READY_MESSAGE = "pixle-nudge-frame-ready";
const PREVIEW_ATTR = "data-pixle-preview";
const originalElementText = new Map<Element, string>();
const originalTextNodes = new Map<Text, string>();
const RESIZE_DIRECTIONS: ResizeDirection[] = [
  "nw",
  "n",
  "ne",
  "e",
  "se",
  "s",
  "sw",
  "w",
];
const VIEWPORT_OPTIONS: { preset: ViewportPreset; label: string }[] = [
  { preset: "desktop", label: "Desktop" },
  { preset: "tablet", label: "Tablet" },
  { preset: "mobile", label: "Mobile" },
];
const VIEWPORT_FRAME_HEIGHTS: Readonly<Record<ViewportPreset, number>> = {
  desktop: 900,
  tablet: 1024,
  mobile: 844,
};

function ownerDocument(el: Element): Document {
  return el.ownerDocument;
}

function ownerWindow(el: Element): Window {
  return ownerDocument(el).defaultView ?? window;
}

function editorRectFor(el: Element): DOMRect {
  const rect = el.getBoundingClientRect();
  const frame = ownerWindow(el).frameElement as HTMLElement | null;
  if (!frame) return rect;
  const frameRect = frame.getBoundingClientRect();
  const scaleX = frame.offsetWidth ? frameRect.width / frame.offsetWidth : 1;
  const scaleY = frame.offsetHeight ? frameRect.height / frame.offsetHeight : 1;
  return DOMRect.fromRect({
    x: frameRect.left + rect.left * scaleX,
    y: frameRect.top + rect.top * scaleY,
    width: rect.width * scaleX,
    height: rect.height * scaleY,
  });
}

function editorPointFor(event: MouseEvent | PointerEvent | WheelEvent): StagePoint {
  const target = event.target as Node | null;
  const doc = target?.ownerDocument;
  const frame = doc?.defaultView?.frameElement as HTMLElement | null;
  if (!frame) return { x: event.clientX, y: event.clientY };
  const frameRect = frame.getBoundingClientRect();
  const scaleX = frame.offsetWidth ? frameRect.width / frame.offsetWidth : 1;
  const scaleY = frame.offsetHeight ? frameRect.height / frame.offsetHeight : 1;
  return {
    x: frameRect.left + event.clientX * scaleX,
    y: frameRect.top + event.clientY * scaleY,
  };
}

function pageKey() {
  if (typeof window === "undefined") return "/";
  return window.location.pathname || "/";
}

function uniqueSel(el: Element): string {
  const doc = ownerDocument(el);
  const instanceId = el.getAttribute("data-pixle-instance-id");
  if (instanceId) {
    return `[data-pixle-instance-id="${CSS.escape(instanceId)}"]`;
  }
  if (el.id && doc.querySelectorAll(`#${CSS.escape(el.id)}`).length === 1) {
    return `#${CSS.escape(el.id)}`;
  }
  const parts: string[] = [];
  let node: Element | null = el;
  while (node && node !== doc.body) {
    const parent: Element | null = node.parentElement;
    if (!parent) break;
    const tag = node.tagName.toLowerCase();
    const same = [...parent.children].filter((c) => c.tagName === node!.tagName);
    const n = same.indexOf(node) + 1;
    parts.unshift(same.length > 1 ? `${tag}:nth-of-type(${n})` : tag);
    node = parent;
  }
  return `body > ${parts.join(" > ")}`;
}

function isChrome(el: EventTarget | null): boolean {
  if (!el || !('nodeType' in el) || (el as Node).nodeType !== Node.ELEMENT_NODE) {
    return false;
  }
  return Boolean((el as Element).closest(`#${ROOT_ID}`));
}

function pick(el: Element | null): Element | null {
  if (!el) return null;
  const doc = ownerDocument(el);
  if (el === doc.documentElement || el === doc.body) return null;
  if (el.closest(`#${ROOT_ID}`)) return null;
  if (el.closest("nextjs-portal")) return null;
  return el;
}

function boxFor(el: Element): ElementBox {
  const rect = editorRectFor(el);
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

function boundsForElements(elements: Element[]): ElementBox | null {
  const boxes = elements
    .filter((el) => el.isConnected)
    .map(boxFor)
    .filter((box) => box.width > 0 && box.height > 0);
  if (!boxes.length) return null;
  const left = Math.min(...boxes.map((box) => box.left));
  const top = Math.min(...boxes.map((box) => box.top));
  const right = Math.max(...boxes.map((box) => box.left + box.width));
  const bottom = Math.max(...boxes.map((box) => box.top + box.height));
  return { left, top, width: right - left, height: bottom - top };
}

function marqueeSelectionFor(
  box: MarqueeBox,
  surfaceDocument: Document,
  store: Store,
  preset?: ViewportPreset,
): Element[] {
  const root = findPageRoot(surfaceDocument);
  if (!root) return [];
  const doc = ownerDocument(root);
  const candidates = [root, ...root.querySelectorAll("*")].filter((el) => {
    if (
      el === root ||
      el === doc.documentElement ||
      el === doc.body ||
      el.closest(`#${ROOT_ID}`) ||
      el.closest("nextjs-portal") ||
      !el.isConnected ||
      isHiddenForSnapping(el) ||
      isElementLocked(store, el, preset) ||
      isElementDeleted(store, el, preset)
    ) {
      return false;
    }
    const rect = editorRectFor(el);
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.right >= box.left &&
      rect.left <= box.left + box.width &&
      rect.bottom >= box.top &&
      rect.top <= box.top + box.height
    );
  });
  return candidates.filter(
    (el) => !candidates.some((other) => other !== el && el.contains(other)),
  );
}

function isHiddenForSnapping(el: Element): boolean {
  if (el.hasAttribute("hidden") || el.getAttribute("aria-hidden") === "true") {
    return true;
  }
  const style = ownerWindow(el).getComputedStyle(el);
  return (
    style.display === "none" ||
    style.visibility === "hidden" ||
    style.visibility === "collapse" ||
    style.opacity === "0"
  );
}

function guideScreenPosition(
  el: Element,
  value: number,
  axis: "x" | "y",
): number {
  const frame = ownerWindow(el).frameElement as HTMLElement | null;
  if (!frame) return value;
  const rect = frame.getBoundingClientRect();
  const scale =
    axis === "x"
      ? frame.offsetWidth
        ? rect.width / frame.offsetWidth
        : 1
      : frame.offsetHeight
        ? rect.height / frame.offsetHeight
        : 1;
  return (axis === "x" ? rect.left : rect.top) + value * scale;
}

function snapCandidatesFor(
  selected: Element | Element[],
  store: Store,
  preset?: ViewportPreset,
): SnapCandidates {
  const selectedElements = Array.isArray(selected) ? selected : [selected];
  const doc = ownerDocument(selectedElements[0]);
  const root = findPageRoot(doc);
  const x: number[] = [];
  const y: number[] = [];
  doc.querySelectorAll("*").forEach((el) => {
    if (
      selectedElements.some((item) => item === el || item.contains(el)) ||
      el === doc.documentElement ||
      el === doc.body ||
      el === root ||
      el.closest(`#${ROOT_ID}`) ||
      el.closest("nextjs-portal") ||
      !el.isConnected ||
      isHiddenForSnapping(el) ||
      isElementDeleted(store, el, preset)
    ) {
      return;
    }
    const rect = editorRectFor(el);
    if (rect.width <= 0 || rect.height <= 0 || !el.getClientRects().length) {
      return;
    }
    x.push(rect.left, rect.left + rect.width / 2, rect.right);
    y.push(rect.top, rect.top + rect.height / 2, rect.bottom);
  });
  const guides = guidesFor(store);
  x.push(
    ...guides.x.map((value) =>
      guideScreenPosition(selectedElements[0], value, "x"),
    ),
  );
  y.push(
    ...guides.y.map((value) =>
      guideScreenPosition(selectedElements[0], value, "y"),
    ),
  );
  return {
    x: [...new Set(x.map(round))],
    y: [...new Set(y.map(round))],
  };
}

function nearestSnap(
  value: number,
  candidates: number[],
): { value: number; correction: number } | null {
  let nearest: number | null = null;
  let distance = Number.POSITIVE_INFINITY;
  candidates.forEach((candidate) => {
    const nextDistance = Math.abs(candidate - value);
    if (nextDistance < distance) {
      nearest = candidate;
      distance = nextDistance;
    }
  });
  if (nearest == null || distance > SNAP_THRESHOLD_SCREEN) return null;
  return { value: nearest, correction: nearest - value };
}

function bestSnap(
  values: number[],
  candidates: number[],
): { value: number; correction: number; distance: number } | null {
  let best: { value: number; correction: number; distance: number } | null = null;
  values.forEach((value) => {
    const match = nearestSnap(value, candidates);
    if (!match) return;
    const distance = Math.abs(match.correction);
    if (!best || distance < best.distance) {
      best = { ...match, distance };
    }
  });
  return best;
}

function closestGap(
  low: number,
  high: number,
  candidates: number[],
): { value: number; distance: number } | null {
  let nearest: { value: number; distance: number } | null = null;
  candidates.forEach((candidate) => {
    const distance = candidate < low ? low - candidate : candidate > high ? candidate - high : null;
    if (distance != null && (!nearest || distance < nearest.distance)) {
      nearest = { value: candidate, distance };
    }
  });
  return nearest;
}

function rulesFor(store: Store, preset?: ViewportPreset): Rule[] {
  return rulesForPage(store, pageKey(), preset);
}

function writeScopeFor(preset?: ViewportPreset): ViewportPreset | undefined {
  return preset === "desktop" ? undefined : preset;
}

function guidesFor(store: Store): Guides {
  return store.guides?.[pageKey()] ?? { x: [], y: [] };
}

function replaceGuides(store: Store, guides: Guides): Store {
  return {
    ...store,
    guides: { ...store.guides, [pageKey()]: guides },
  };
}

function ruleFor(store: Store, el: Element, preset?: ViewportPreset): Rule {
  const sel = uniqueSel(el);
  return (
    rulesFor(store, preset).find(
      (rule) => rule.sel === sel && !Array.isArray(rule.textPath),
    ) ?? {
      sel,
      x: 0,
      y: 0,
      scale: 1,
    }
  );
}

function upsertRule(
  store: Store,
  next: Rule,
  preset?: ViewportPreset,
): Store {
  const key = pageKey();
  const scope = writeScopeFor(preset);
  const list = [
    ...(scope
      ? store.responsive?.[key]?.[scope] ?? []
      : store.pages[key] ?? []),
  ];
  const i = list.findIndex(
    (rule) => sameRuleIdentity(rule, next),
  );
  if (i >= 0) list[i] = next;
  else list.push(next);
  return replaceRulesForPage(store, key, list, scope);
}

function hasRuleOverride(rule: Rule) {
  return (
    rule.x !== 0 ||
    rule.y !== 0 ||
    (rule.scale ?? 1) !== 1 ||
    rule.width != null ||
    rule.height != null ||
    rule.color != null ||
    rule.backgroundColor != null ||
    rule.fontFamily != null ||
    rule.fontSize != null ||
    rule.fontWeight != null ||
    rule.lineHeight != null ||
    rule.letterSpacing != null ||
    rule.text != null ||
    rule.visible === false ||
    rule.locked === true ||
    rule.deleted === true
  );
}

function replaceOrRemoveRule(
  store: Store,
  next: Rule,
  preset?: ViewportPreset,
): Store {
  if (hasRuleOverride(next)) return upsertRule(store, next, preset);
  const key = pageKey();
  const scope = writeScopeFor(preset);
  const list = (
    scope ? store.responsive?.[key]?.[scope] ?? [] : store.pages[key] ?? []
  ).filter((rule) => !sameRuleIdentity(rule, next));
  return replaceRulesForPage(store, key, list, scope);
}

function removeRulesForElement(
  store: Store,
  el: Element,
  preset?: ViewportPreset,
): Store {
  const key = pageKey();
  const sel = uniqueSel(el);
  const scope = writeScopeFor(preset);
  const list = (
    scope ? store.responsive?.[key]?.[scope] ?? [] : store.pages[key] ?? []
  ).filter((rule) => rule.sel !== sel);
  return replaceRulesForPage(store, key, list, scope);
}

function isElementLocked(store: Store, el: Element, preset?: ViewportPreset) {
  const body = ownerDocument(el).body;
  let current: Element | null = el;
  while (current && current !== body) {
    if (ruleFor(store, current, preset).locked === true) return true;
    current = current.parentElement;
  }
  return false;
}

function isElementDeleted(store: Store, el: Element, preset?: ViewportPreset) {
  const body = ownerDocument(el).body;
  let current: Element | null = el;
  while (current && current !== body) {
    if (ruleFor(store, current, preset).deleted === true) return true;
    current = current.parentElement;
  }
  return false;
}

function textNodePath(root: Element, node: Node): number[] | null {
  const path: number[] = [];
  let current: Node | null = node;
  while (current && current !== root) {
    const parent: Node | null = current.parentNode;
    if (!parent) return null;
    const index = [...parent.childNodes].indexOf(current as ChildNode);
    if (index < 0) return null;
    path.unshift(index);
    current = parent;
  }
  return current === root ? path : null;
}

function textNodeFromPath(root: Element, path: number[]): Text | null {
  let current: Node = root;
  for (const index of path) {
    const next = current.childNodes[index];
    if (!next) return null;
    current = next;
  }
  return current.nodeType === Node.TEXT_NODE ? (current as Text) : null;
}

function textNodeAtPoint(root: Element, x: number, y: number): Text | null {
  const doc = ownerDocument(root) as Document & {
    caretPositionFromPoint?: (
      x: number,
      y: number,
    ) => { offsetNode: Node } | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };
  const pointed =
    doc.caretPositionFromPoint?.(x, y)?.offsetNode ??
    doc.caretRangeFromPoint?.(x, y)?.startContainer ??
    null;
  if (
    pointed?.nodeType === Node.TEXT_NODE &&
    pointed.parentElement &&
    root.contains(pointed.parentElement)
  ) {
    return pointed as Text;
  }

  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (node.textContent?.trim()) return node as Text;
    node = walker.nextNode();
  }
  return null;
}

function clampDimension(value: number) {
  return Math.max(8, value);
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function clampZoom(value: number) {
  return Math.max(0.25, Math.min(2, value));
}

function styleNumber(value: string | undefined, fallback = 0) {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) ? parsed : fallback;
}

function colorToHex(value: string | null | undefined, fallback: string) {
  if (!value || value === "transparent") return fallback;
  if (/^#[0-9a-f]{6}$/i.test(value)) return value.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    return `#${value
      .slice(1)
      .split("")
      .map((part) => part + part)
      .join("")}`.toLowerCase();
  }
  const parts = value.match(/[\d.]+/g)?.map(Number);
  if (!parts || parts.length < 3) return fallback;
  return `#${parts
    .slice(0, 3)
    .map((part) => Math.max(0, Math.min(255, Math.round(part))).toString(16).padStart(2, "0"))
    .join("")}`;
}

function rulerStep(zoom: number) {
  return [10, 20, 50, 100, 200, 500, 1000].find(
    (step) => step * zoom >= 72,
  ) ?? 2000;
}

function rulerMarks(start: number, size: number, step: number) {
  const first = Math.floor(start / step) * step;
  const marks: number[] = [];
  for (let value = first; value <= start + size + step; value += step) {
    marks.push(value);
  }
  return marks;
}

function resizeHandlePosition(
  direction: ResizeDirection,
  box: { top: number; left: number; w: number; h: number },
) {
  const top = direction.includes("n")
    ? box.top - 8
    : direction.includes("s")
      ? box.top + box.h - 8
      : box.top + box.h / 2 - 8;
  const left = direction.includes("w")
    ? box.left - 8
    : direction.includes("e")
      ? box.left + box.w - 8
      : box.left + box.w / 2 - 8;
  return { top, left };
}

function ruleDeclarations(rule: Rule, el: Element) {
  const declarations = [
    `translate:${rule.x}px ${rule.y}px!important`,
    `scale:${rule.scale ?? 1}!important`,
    "transform-origin:top left!important",
  ];
  if (rule.width != null) {
    declarations.push(`width:${clampDimension(rule.width)}px!important`);
  }
  if (rule.height != null) {
    declarations.push(`height:${clampDimension(rule.height)}px!important`);
  }
  if (rule.width != null || rule.height != null) {
    declarations.push("box-sizing:border-box!important");
    if (ownerWindow(el).getComputedStyle(el).display === "inline") {
      declarations.push("display:inline-block!important");
    }
  }
  if (rule.color) declarations.push(`color:${rule.color}!important`);
  if (rule.backgroundColor) {
    declarations.push(`background-color:${rule.backgroundColor}!important`);
  }
  if (rule.fontFamily) {
    declarations.push(`font-family:${JSON.stringify(rule.fontFamily)}!important`);
  }
  if (rule.fontSize != null) {
    declarations.push(`font-size:${rule.fontSize}px!important`);
  }
  if (rule.fontWeight != null) {
    declarations.push(`font-weight:${rule.fontWeight}!important`);
  }
  if (rule.lineHeight != null) {
    declarations.push(`line-height:${rule.lineHeight}px!important`);
  }
  if (rule.letterSpacing != null) {
    declarations.push(`letter-spacing:${rule.letterSpacing}px!important`);
  }
  if (rule.visible === false || rule.deleted === true) {
    declarations.push("display:none!important");
  }
  return declarations;
}

function applyRulePreviews(previews: { el: Element; rule: Rule }[]) {
  const doc = previews[0]?.el.ownerDocument ?? document;
  let sheet = doc.getElementById(
    PREVIEW_SHEET_ID,
  ) as HTMLStyleElement | null;
  if (!sheet) {
    sheet = doc.createElement("style");
    sheet.id = PREVIEW_SHEET_ID;
    doc.head.appendChild(sheet);
  }
  doc.querySelectorAll(`[${PREVIEW_ATTR}]`).forEach((previewed) => {
    previewed.removeAttribute(PREVIEW_ATTR);
  });
  sheet.textContent = previews
    .map(({ el, rule }, index) => {
      el.setAttribute(PREVIEW_ATTR, String(index));
      return `[${PREVIEW_ATTR}="${index}"]{${[
        ...ruleDeclarations(rule, el),
        "transition:none!important",
        "will-change:transform!important",
      ].join(";")};}`;
    })
    .join("");
}

function applyRulePreview(el: Element, rule: Rule) {
  applyRulePreviews([{ el, rule }]);
}

function clearRulePreview(doc: Document = document) {
  doc.querySelectorAll(`[${PREVIEW_ATTR}]`).forEach((previewed) => {
    previewed.removeAttribute(PREVIEW_ATTR);
  });
  const sheet = doc.getElementById(PREVIEW_SHEET_ID);
  if (sheet) sheet.textContent = "";
}

function syncSelectionChrome(el: Element) {
  const root = document.getElementById(ROOT_ID);
  if (!root) return;
  const rect = editorRectFor(el);
  const box = { top: rect.top, left: rect.left, w: rect.width, h: rect.height };
  const frame = root.querySelector<HTMLElement>(".pn-frame.is-sel");
  if (frame) {
    frame.style.top = `${box.top}px`;
    frame.style.left = `${box.left}px`;
    frame.style.width = `${box.w}px`;
    frame.style.height = `${box.h}px`;
  }
  const rulerX = root.querySelector<HTMLElement>(".pn-ruler-selection-x");
  if (rulerX) {
    rulerX.style.left = `${box.left}px`;
    rulerX.style.width = `${box.w}px`;
  }
  const rulerY = root.querySelector<HTMLElement>(".pn-ruler-selection-y");
  if (rulerY) {
    rulerY.style.top = `${box.top}px`;
    rulerY.style.height = `${box.h}px`;
  }
  RESIZE_DIRECTIONS.forEach((direction) => {
    const handle = root.querySelector<HTMLElement>(`.pn-handle.${direction}`);
    if (!handle) return;
    const position = resizeHandlePosition(direction, box);
    handle.style.top = `${position.top}px`;
    handle.style.left = `${position.left}px`;
  });
}

function syncGroupChrome(box: ElementBox) {
  const root = document.getElementById(ROOT_ID);
  if (!root) return;
  const frame = root.querySelector<HTMLElement>(".pn-frame.is-group");
  if (frame) {
    frame.style.top = `${box.top}px`;
    frame.style.left = `${box.left}px`;
    frame.style.width = `${box.width}px`;
    frame.style.height = `${box.height}px`;
  }
  RESIZE_DIRECTIONS.forEach((direction) => {
    const handle = root.querySelector<HTMLElement>(
      `.pn-handle.is-group-handle.${direction}`,
    );
    if (!handle) return;
    const position = resizeHandlePosition(direction, {
      top: box.top,
      left: box.left,
      w: box.width,
      h: box.height,
    });
    handle.style.top = `${position.top}px`;
    handle.style.left = `${position.left}px`;
  });
}

function syncSelectionFrames(elements: Element[]) {
  const root = document.getElementById(ROOT_ID);
  if (!root) return;
  root
    .querySelectorAll<HTMLElement>(".pn-frame.is-secondary")
    .forEach((frame, index) => {
      const el = elements[index];
      if (!el?.isConnected) return;
      const rect = editorRectFor(el);
      frame.style.top = `${rect.top}px`;
      frame.style.left = `${rect.left}px`;
      frame.style.width = `${rect.width}px`;
      frame.style.height = `${rect.height}px`;
    });
}

function findPageRoot(doc: Document = document) {
  const main = doc.querySelector("main");
  if (main) {
    let root: Element = main;
    while (root.parentElement && root.parentElement !== doc.body) {
      root = root.parentElement;
    }
    if (root.parentElement === doc.body) return root as HTMLElement;
  }
  return (
    [...doc.body.children].find(
      (el) =>
        el.id !== ROOT_ID &&
        el.tagName !== "SCRIPT" &&
        el.tagName !== "STYLE" &&
        el.tagName !== "NEXTJS-PORTAL" &&
        el.tagName !== "NEXT-ROUTE-ANNOUNCER",
    ) as HTMLElement | undefined
  ) ?? null;
}

function layerName(el: Element) {
  const tag = el.tagName.toLowerCase();
  if (el.id) return `${tag}#${el.id}`;
  const semantic =
    el.getAttribute("aria-label") ??
    el.getAttribute("alt") ??
    el.getAttribute("title");
  const directText = [...el.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent?.trim())
    .filter(Boolean)
    .join(" ");
  const detail = (semantic ?? directText).trim().replace(/\s+/g, " ");
  return detail ? `${tag} · ${detail.slice(0, 32)}` : tag;
}

function layersFor(root: Element): LayerEntry[] {
  return [root, ...root.querySelectorAll("*")]
    .filter(
      (el) =>
        el.tagName !== "SCRIPT" &&
        el.tagName !== "STYLE" &&
        el.tagName !== "NOSCRIPT",
    )
    .slice(0, 300)
    .map((el) => {
      let depth = 0;
      let current = el;
      while (current !== root && current.parentElement) {
        depth += 1;
        current = current.parentElement;
      }
      const rawComponentId = el.getAttribute("data-pixle-component-id");
      const componentId = isPixleComponentId(rawComponentId)
        ? rawComponentId
        : undefined;
      const instanceId = el.getAttribute("data-pixle-instance-id") ?? undefined;
      const slotId = el.getAttribute("data-pixle-slot-id") ?? undefined;
      const slotType = el.getAttribute("data-pixle-slot-type") ?? undefined;
      const ancestorKeys: string[] = [];
      let ancestor = el.parentElement;
      while (ancestor && root.contains(ancestor)) {
        ancestorKeys.unshift(uniqueSel(ancestor));
        if (ancestor === root) break;
        ancestor = ancestor.parentElement;
      }
      return {
        el,
        key: uniqueSel(el),
        depth,
        name:
          componentId && instanceId
            ? `${componentRegistry[componentId].name} · ${instanceId}`
            : slotId && slotType
              ? `Slot · ${slotId}`
            : layerName(el),
        hasChildren: [...el.children].some(
          (child) =>
            child.tagName !== "SCRIPT" &&
            child.tagName !== "STYLE" &&
            child.tagName !== "NOSCRIPT",
        ),
        ancestorKeys,
        instanceId,
        componentId,
        slotId,
        slotType,
      };
    });
}

function applyStore(
  store: Store,
  preset?: ViewportPreset,
  doc: Document = document,
) {
  // A newly-mounted preview iframe briefly exposes an about:blank document
  // without a head. Wait for the embedded app to hydrate before installing
  // the runtime rule sheet.
  if (!doc.head) return;
  let sheet = doc.getElementById(SHEET_ID) as HTMLStyleElement | null;
  if (!sheet) {
    sheet = doc.createElement("style");
    sheet.id = SHEET_ID;
    doc.head.appendChild(sheet);
  }
  doc.querySelectorAll("[data-pixle]").forEach((el) => {
    el.removeAttribute("data-pixle");
  });
  originalElementText.forEach((text, el) => {
    if (!el.isConnected) {
      originalElementText.delete(el);
      return;
    }
    if (el.textContent !== text) el.textContent = text;
  });
  originalTextNodes.forEach((text, node) => {
    if (!node.isConnected) {
      originalTextNodes.delete(node);
      return;
    }
    if (node.textContent !== text) node.textContent = text;
  });
  const rules = rulesFor(store, preset);
  const css: string[] = [];
  let movementIndex = 0;
  rules.forEach((rule) => {
    const el = doc.querySelector(rule.sel);
    if (!el) return;

    if (Array.isArray(rule.textPath)) {
      const textNode = textNodeFromPath(el, rule.textPath);
      if (textNode && rule.text != null && textNode.textContent !== rule.text) {
        if (!originalTextNodes.has(textNode)) {
          originalTextNodes.set(textNode, textNode.textContent ?? "");
        }
        textNode.textContent = rule.text;
      }
      return;
    }

    const i = movementIndex++;
    el.setAttribute("data-pixle", String(i));
    const declarations = ruleDeclarations(rule, el);
    css.push(`[data-pixle="${i}"]{${declarations.join(";")};}`);
    if (rule.text != null) {
      if (el.childElementCount === 0) {
        if (!originalElementText.has(el)) {
          originalElementText.set(el, el.textContent ?? "");
        }
        if (el.textContent !== rule.text) el.textContent = rule.text;
      } else {
        const tn = [...el.childNodes].find(
          (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
        );
        if (tn && tn.textContent !== rule.text) {
          const textNode = tn as Text;
          if (!originalTextNodes.has(textNode)) {
            originalTextNodes.set(textNode, textNode.textContent ?? "");
          }
          textNode.textContent = rule.text;
        }
      }
    }
  });
  sheet.textContent = css.join("");
}

function ColorControl({
  label,
  value,
  dirty,
  onChange,
  onReset,
}: {
  label: string;
  value: string;
  dirty: boolean;
  onChange: (value: string) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState(value);

  const update = (next: string) => {
    setDraft(next);
    if (/^#[0-9a-f]{6}$/i.test(next)) onChange(next.toLowerCase());
  };

  return (
    <div className="pn-color">
      <input
        aria-label={`${label} color`}
        type="color"
        value={value}
        onInput={(e) => update(e.currentTarget.value)}
        onChange={(e) => update(e.target.value)}
      />
      <label className="pn-color-copy">
        <span>{label}</span>
        <input
          aria-label={`${label} color hex`}
          value={draft}
          maxLength={7}
          spellCheck={false}
          onChange={(e) => update(e.target.value)}
          onBlur={() => setDraft(value)}
        />
      </label>
      <ResetControl label={label} dirty={dirty} onReset={onReset} />
    </div>
  );
}

function ResetControl({
  label,
  dirty,
  onReset,
}: {
  label: string;
  dirty: boolean;
  onReset: () => void;
}) {
  return (
    <button
      type="button"
      className="pn-reset-control"
      aria-label={`Reset ${label}`}
      title={`Reset ${label}`}
      disabled={!dirty}
      onClick={onReset}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4.2 5.1H1.8V2.7" />
        <path d="M2.1 5a6 6 0 1 1-.1 5.8" />
      </svg>
    </button>
  );
}

function LayerIcon({
  type,
}: {
  type:
    | "search"
    | "visible"
    | "hidden"
    | "locked"
    | "unlocked"
    | "restore";
}) {
  if (type === "search") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="7" cy="7" r="4.5" />
        <path d="m10.4 10.4 3.1 3.1" />
      </svg>
    );
  }
  if (type === "visible" || type === "hidden") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M1.4 8s2.4-4 6.6-4 6.6 4 6.6 4-2.4 4-6.6 4S1.4 8 1.4 8Z" />
        <circle cx="8" cy="8" r="1.8" />
        {type === "hidden" && <path d="m2 2 12 12" />}
      </svg>
    );
  }
  if (type === "restore") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4.2 5.1H1.8V2.7" />
        <path d="M2.1 5a6 6 0 1 1-.1 5.8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="3.2" y="7" width="9.6" height="6.8" rx="1.4" />
      <path d={type === "locked" ? "M5.2 7V5a2.8 2.8 0 0 1 5.6 0v2" : "M10.8 7V5a2.8 2.8 0 0 0-5.5-.8"} />
    </svg>
  );
}

function DisclosureIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      className={collapsed ? "is-collapsed" : ""}
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path d="m5.5 3.5 4.5 4.5-4.5 4.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="m4 4 8 8M12 4l-8 8" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 4.5h10M6 2.5h4l.8 2H5.2l.8-2Z" />
      <path d="m4.5 4.5.6 9h5.8l.6-9M6.7 7v4M9.3 7v4" />
    </svg>
  );
}

function DragHandleIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="5.5" cy="4" r="1" />
      <circle cx="10.5" cy="4" r="1" />
      <circle cx="5.5" cy="8" r="1" />
      <circle cx="10.5" cy="8" r="1" />
      <circle cx="5.5" cy="12" r="1" />
      <circle cx="10.5" cy="12" r="1" />
    </svg>
  );
}

function CanvasInstanceIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 2.8 13.2 8 8 13.2 2.8 8 8 2.8Z" />
    </svg>
  );
}

function DetachedCanvasPreview({
  instance,
}: {
  instance: PixleCanvasInstance;
}) {
  const label = (key: string, fallback: string) => {
    const value = instance.props[key];
    return typeof value === "string" && value.trim() ? value : fallback;
  };
  if (instance.componentId === "repo-button") {
    return (
      <div
        className={`pn-canvas-button is-${instance.variants.tone ?? "primary"} is-${instance.variants.size ?? "medium"} is-${instance.variants.state ?? "default"}`}
      >
        {label("label", "Button")}
      </div>
    );
  }
  return (
    <article
      className={`pn-canvas-card is-${instance.variants.tone ?? "surface"} is-${instance.variants.emphasis ?? "normal"}`}
    >
      <span>{label("eyebrow", "Component")}</span>
      <strong>{label("title", "Card title")}</strong>
      <p>{label("body", "A reusable piece of page content.")}</p>
    </article>
  );
}

function DockIcon({ docked }: { docked: boolean }) {
  return (
    <svg className="pn-context-icon" viewBox="0 0 16 16" aria-hidden="true">
      <g className={`pn-icon-state${docked ? " is-active" : ""}`}>
        <rect x="2.2" y="2.2" width="11.6" height="11.6" rx="1.8" />
        <path d="M5.4 2.5v11" />
      </g>
      <g className={`pn-icon-state${docked ? "" : " is-active"}`}>
        <rect x="2.2" y="2.2" width="11.6" height="11.6" rx="1.8" />
        <path d="M8 5.3h5.5M10.7 2.6v5.5" />
      </g>
    </svg>
  );
}

function FloatingPanel({
  title,
  meta,
  className,
  initialSide,
  initialTop,
  initialWidth,
  initialHeight,
  minWidth,
  minHeight,
  dockSide,
  onDismiss,
  children,
}: {
  title: string;
  meta?: string;
  className: string;
  initialSide: "left" | "right";
  initialTop: number;
  initialWidth: number;
  initialHeight: number;
  minWidth: number;
  minHeight: number;
  dockSide?: "left" | "right";
  onDismiss: () => void;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const [position, setPosition] = useState(() => ({
    left: initialSide === "left" ? 36 : null,
    top: initialTop,
  }));
  const [size, setSize] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  const [docked, setDocked] = useState(Boolean(dockSide));

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    let frame = 0;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        setSize((current) =>
          current.width === width && current.height === height
            ? current
            : { width, height },
        );
      });
    });
    observer.observe(panel);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <aside
      ref={panelRef}
      className={`pn-floating ${className}${docked ? " is-docked" : ""}`}
      aria-label={title}
      style={
        docked && dockSide
          ? {
              left: dockSide === "left" ? 12 : undefined,
              right: dockSide === "right" ? 12 : undefined,
              top: 36,
              width: initialWidth,
              height: "calc(100vh - 108px)",
              minWidth,
              minHeight,
            }
          : {
              left: position.left ?? undefined,
              right: position.left === null ? 12 : undefined,
              top: position.top,
              width: size.width,
              height: size.height,
              minWidth,
              minHeight,
            }
      }
    >
      <div
        className="pn-floating-header"
        onPointerDown={(event) => {
          if (docked) return;
          if ((event.target as Element).closest("button")) return;
          event.preventDefault();
          const rect = event.currentTarget.parentElement!.getBoundingClientRect();
          dragRef.current = {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            left: rect.left,
            top: position.top,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== event.pointerId) return;
          setPosition({
            left: Math.max(
              24,
              Math.min(
                window.innerWidth - 96,
                drag.left + event.clientX - drag.x,
              ),
            ),
            top: Math.max(
              24,
              Math.min(
                window.innerHeight - 56,
                drag.top + event.clientY - drag.y,
              ),
            ),
          });
        }}
        onPointerUp={(event) => {
          if (dragRef.current?.pointerId === event.pointerId) {
            dragRef.current = null;
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
      >
        <span className="pn-floating-title">{title}</span>
        <span className="pn-floating-actions">
          {meta && <span className="pn-floating-meta">{meta}</span>}
          {dockSide && (
            <button
              type="button"
              className="pn-floating-dock"
              aria-label={`${docked ? "Detach" : "Dock"} ${title}`}
              title={`${docked ? "Detach" : "Dock"} ${title}`}
              onClick={() => setDocked((current) => !current)}
            >
              <DockIcon docked={docked} />
            </button>
          )}
          <button
            type="button"
            className="pn-floating-close"
            aria-label={`Dismiss ${title}`}
            title={`Dismiss ${title}`}
            onClick={onDismiss}
          >
            <CloseIcon />
          </button>
        </span>
      </div>
      <div className="pn-floating-body">{children}</div>
    </aside>
  );
}

export function PixleNudge() {
  const [store, setStore] = useState<Store>(emptyStore);
  const [on, setOn] = useState(false);
  const [embedded, setEmbedded] = useState(false);
  const [frameAvailable, setFrameAvailable] = useState(true);
  const [surfaceVersion, setSurfaceVersion] = useState(0);
  const [activePreset, setActivePreset] = useState<ViewportPreset>("desktop");
  const [zoom, setZoom] = useState(0.5);
  const [canvasCamera, setCanvasCamera] = useState<CanvasCamera>({
    left: 0,
    top: 0,
    zoom: 0.5,
  });
  const [layers, setLayers] = useState<LayerEntry[]>([]);
  const [layerQuery, setLayerQuery] = useState("");
  const [collapsedLayers, setCollapsedLayers] = useState<Set<string>>(
    () => new Set(),
  );
  const [leftPanelTab, setLeftPanelTab] = useState<LeftPanelTab>("layers");
  const [componentQuery, setComponentQuery] = useState("");
  const [componentEditScope, setComponentEditScope] =
    useState<ComponentEditScope>("instance");
  const [componentLayout, setComponentLayout] =
    useState<PixleLayoutDocument>(initialPixleLayout);
  const [selectedCanvasInstanceId, setSelectedCanvasInstanceId] = useState<
    string | null
  >(null);
  const [canvasDropReady, setCanvasDropReady] = useState(false);
  const [canvasDropTarget, setCanvasDropTarget] = useState(false);
  const [layoutStatus, setLayoutStatus] = useState<
    "idle" | "saving" | "saved" | "err"
  >("idle");
  const [showLayers, setShowLayers] = useState(true);
  const [showInspector, setShowInspector] = useState(true);
  const [hover, setHover] = useState<Element | null>(null);
  const [sel, setSel] = useState<Element | null>(null);
  const [selectedElements, setSelectedElements] = useState<Element[]>([]);
  const [marqueeBox, setMarqueeBox] = useState<MarqueeBox | null>(null);
  const [textEdit, setTextEdit] = useState<TextEdit | null>(null);
  const [viewport, setViewport] = useState<Viewport>({
    scrollX: 0,
    scrollY: 0,
    width: 0,
    height: 0,
  });
  const [guideDraft, setGuideDraft] = useState<{
    axis: "x" | "y";
    value: number;
  } | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "err">(
    "idle",
  );
  const [exportStatus, setExportStatus] = useState<
    "idle" | "exporting" | "exported" | "failed"
  >("idle");
  const [exportWarningCount, setExportWarningCount] = useState(0);
  const storeRef = useRef(store);
  const componentLayoutRef = useRef(componentLayout);
  const layoutTimer = useRef<number>(0);
  const layoutReloadPending = useRef(false);
  const pendingSelectedInstanceId = useRef<string | null>(null);
  const componentDragRef = useRef<
    | { kind: "component"; componentId: PixleComponentId }
    | {
        kind: "instance";
        componentId: PixleComponentId;
        instanceId: string;
        fromSlotId: string;
      }
    | null
  >(null);
  const canvasInstanceDrag = useRef<CanvasInstanceDrag | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const frameAvailableRef = useRef(true);
  const unavailableSurfaceDocumentRef = useRef<Document | null>(null);
  const onRef = useRef(on);
  const activePresetRef = useRef(activePreset);
  const stageFrameWidthRef = useRef(VIEWPORT_FRAME_WIDTHS[activePreset]);
  const zoomRef = useRef(zoom);
  const stagePanRef = useRef<StagePoint>({ x: 0, y: 0 });
  const stageGeometryRef = useRef<StageGeometry | null>(null);
  const smartGuideLayerRef = useRef<HTMLDivElement | null>(null);
  const selectionRef = useRef<Element[]>([]);
  const stagePanDrag = useRef<{
    pointerId: number;
    x0: number;
    y0: number;
    pan: StagePoint;
  } | null>(null);
  const spaceHeld = useRef(false);
  const selRef = useRef(sel);
  const textEditRef = useRef(textEdit);
  const drag = useRef<{
    el: Element;
    x0: number;
    y0: number;
    ox: number;
    oy: number;
    base: Rule;
    box: ElementBox;
    snap: SnapCandidates;
  } | null>(null);
  const resizeDrag = useRef<{
    el: Element;
    direction: ResizeDirection;
    x0: number;
    y0: number;
    width: number;
    height: number;
    left: number;
    top: number;
    x: number;
    y: number;
    base: Rule;
    box: ElementBox;
    snap: SnapCandidates;
  } | null>(null);
  const groupDrag = useRef<GroupDrag | null>(null);
  const groupResize = useRef<GroupResize | null>(null);
  const marquee = useRef<{
    pointerId: number;
    x0: number;
    y0: number;
  } | null>(null);
  const guideDrag = useRef<GuideDrag | null>(null);
  const editing = useRef(false);
  const applying = useRef(false);
  const timer = useRef<number>(0);
  const undoStack = useRef<Store[]>([]);
  const redoStack = useRef<Store[]>([]);
  const historyGroup = useRef<string | null>(null);
  const pendingCommit = useRef<{ store: Store; group: string } | null>(null);

  const surfaceDocument = useCallback(() => {
    if (!onRef.current || !frameAvailableRef.current) return document;
    try {
      const frameDocument = frameRef.current?.contentDocument;
      if (frameDocument?.head) return frameDocument;
    } catch {
      // Sandboxed browser hosts can make an otherwise same-origin preview
      // opaque. Do not accidentally edit the hidden source page while the
      // frame-access check is still pending.
    }
    if (!unavailableSurfaceDocumentRef.current) {
      unavailableSurfaceDocumentRef.current =
        document.implementation.createHTMLDocument("Pixel Nudge preview");
    }
    return unavailableSurfaceDocumentRef.current;
  }, []);

  const surfaceRoot = useCallback(
    () => findPageRoot(surfaceDocument()),
    [surfaceDocument],
  );

  const stageRoot = useCallback(
    () =>
      onRef.current && frameAvailableRef.current
        ? frameRef.current
        : findPageRoot(document),
    [],
  );

  const clearComponentDropChrome = useCallback(() => {
    setCanvasDropReady(false);
    setCanvasDropTarget(false);
    const docs = [...new Set([document, surfaceDocument()])];
    docs.forEach((doc) => {
      doc
        .querySelectorAll(
          "[data-pixle-drop-compatible],[data-pixle-drop-target],[data-pixle-drop-edge],[data-pixle-layer-drop]",
        )
        .forEach((element) => {
          element.removeAttribute("data-pixle-drop-compatible");
          element.removeAttribute("data-pixle-drop-target");
          element.removeAttribute("data-pixle-layer-drop");
          element.removeAttribute("data-pixle-drop-edge");
          element.removeAttribute("data-pixle-drop-axis");
        });
    });
  }, [surfaceDocument]);

  const showCompatibleDropSlots = useCallback(
    (componentId: PixleComponentId) => {
      clearComponentDropChrome();
      setCanvasDropReady(true);
      surfaceDocument()
        .querySelectorAll(
          "[data-pixle-slot-id][data-pixle-slot-type][data-pixle-slot-accepts]",
        )
        .forEach((slot) => {
          const accepted = (slot.getAttribute("data-pixle-slot-accepts") ?? "")
            .split(",")
            .includes(componentId);
          if (accepted) slot.setAttribute("data-pixle-drop-compatible", "");
        });
    },
    [clearComponentDropChrome, surfaceDocument],
  );

  const screenToCanvas = useCallback(
    (point: StagePoint): StagePoint => {
      const rect = stageRoot()?.getBoundingClientRect();
      if (!rect) return point;
      return {
        x: (point.x - rect.left) / zoomRef.current,
        y: (point.y - rect.top) / zoomRef.current,
      };
    },
    [stageRoot],
  );

  useEffect(() => {
    const isEmbedded =
      window.self !== window.top &&
      new URLSearchParams(window.location.search).has(FRAME_QUERY);
    const embeddedStateTimer = window.setTimeout(
      () => setEmbedded(isEmbedded),
      0,
    );
    if (isEmbedded) {
      document.documentElement.setAttribute("data-pixle-frame", "");
      const frameChromeSheet = document.createElement("style");
      frameChromeSheet.id = FRAME_CHROME_SHEET_ID;
      frameChromeSheet.textContent = `
        html[data-pixle-frame] nextjs-portal{display:none!important;}
      `;
      document.head.appendChild(frameChromeSheet);
      window.parent.postMessage(FRAME_READY_MESSAGE, window.location.origin);
    }
    return () => {
      window.clearTimeout(embeddedStateTimer);
      document.documentElement.removeAttribute("data-pixle-frame");
      document.getElementById(FRAME_CHROME_SHEET_ID)?.remove();
    };
  }, []);

  useEffect(() => {
    onRef.current = on;
    if (!on) {
      frameAvailableRef.current = true;
      setFrameAvailable(true);
    }
  }, [on]);

  useEffect(() => {
    activePresetRef.current = activePreset;
    stageFrameWidthRef.current = VIEWPORT_FRAME_WIDTHS[activePreset];
  }, [activePreset]);

  const currentPreset = useCallback(
    (): ViewportPreset =>
      onRef.current
        ? activePresetRef.current
        : viewportForWidth(window.innerWidth),
    [],
  );

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    selRef.current = sel;
  }, [sel]);

  useEffect(() => {
    textEditRef.current = textEdit;
  }, [textEdit]);

  useEffect(() => {
    componentLayoutRef.current = componentLayout;
  }, [componentLayout]);

  const selectElements = useCallback((elements: Element[]) => {
    const next = elements.filter((el, index) => el.isConnected && elements.indexOf(el) === index);
    const instanceId = next[next.length - 1]
      ?.closest("[data-pixle-instance-id]")
      ?.getAttribute("data-pixle-instance-id");
    if (instanceId) {
      window.sessionStorage.setItem("pixle-nudge-selected-instance", instanceId);
    } else {
      window.sessionStorage.removeItem("pixle-nudge-selected-instance");
    }
    selectionRef.current = next;
    setSelectedElements(next);
    setSel(next[next.length - 1] ?? null);
    if (next.length) setSelectedCanvasInstanceId(null);
  }, []);

  useEffect(() => {
    if (embedded) return;
    const handleFrameReady = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frameRef.current?.contentWindow ||
        event.data !== FRAME_READY_MESSAGE
      ) {
        return;
      }
      const instanceId =
        pendingSelectedInstanceId.current ??
        window.sessionStorage.getItem("pixle-nudge-selected-instance");
      pendingSelectedInstanceId.current = null;
      setHover(null);
      setSurfaceVersion((version) => version + 1);
      window.setTimeout(() => {
        const restored = instanceId
          ? frameRef.current?.contentDocument?.querySelector(
              `[data-pixle-instance-id="${CSS.escape(instanceId)}"]`,
            ) ?? null
          : null;
        selectElements(restored ? [restored] : []);
      }, 0);
    };
    window.addEventListener("message", handleFrameReady);
    return () => window.removeEventListener("message", handleFrameReady);
  }, [embedded, selectElements]);

  useEffect(() => {
    const root = surfaceRoot();
    if (!on || !root) return;
    const refreshLayers = () => {
      setLayers(layersFor(root));
      const current = selectionRef.current;
      const next = current.filter((el) => el.isConnected);
      if (next.length !== current.length) selectElements(next);
    };
    refreshLayers();
    const layerObserver = new MutationObserver(refreshLayers);
    layerObserver.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => {
      layerObserver.disconnect();
      setLayers([]);
    };
  }, [on, selectElements, surfaceRoot, surfaceVersion]);

  useEffect(() => {
    if (!on) return;
    const surfaceWindow = surfaceDocument().defaultView;
    if (!surfaceWindow) return;
    let frame = 0;
    const syncSurfaceGeometry = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const selected = selectionRef.current.filter((el) => el.isConnected);
        if (selected.length === 1) syncSelectionChrome(selected[0]);
        if (selected.length > 1) {
          const group = boundsForElements(selected);
          if (group) syncGroupChrome(group);
          syncSelectionFrames(selected);
        }
        setViewport((current) => ({ ...current }));
      });
    };
    syncSurfaceGeometry();
    surfaceWindow.addEventListener("scroll", syncSurfaceGeometry, {
      passive: true,
    });
    surfaceWindow.addEventListener("resize", syncSurfaceGeometry);
    return () => {
      window.cancelAnimationFrame(frame);
      surfaceWindow.removeEventListener("scroll", syncSurfaceGeometry);
      surfaceWindow.removeEventListener("resize", syncSurfaceGeometry);
    };
  }, [activePreset, on, surfaceDocument, surfaceVersion]);

  const writeStore = useCallback((next: Store) => {
    setExportStatus("idle");
    setExportWarningCount(0);
    storeRef.current = next;
    applying.current = true;
    applyStore(next, currentPreset(), surfaceDocument());
    applying.current = false;
    setStore(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      setStatus("saving");
      try {
        const res = await fetch("/api/pixle-nudge", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        });
        if (!res.ok) throw new Error("save failed");
        setStatus("saved");
      } catch {
        setStatus("err");
      }
    }, 280);
  }, [currentPreset, surfaceDocument]);

  const writeComponentLayout = useCallback(
    (
      next: PixleLayoutDocument,
      instanceId?: string,
      reloadPreview = true,
    ) => {
      componentLayoutRef.current = next;
      setComponentLayout(next);
      setLayoutStatus("saving");
      layoutReloadPending.current ||= reloadPreview;
      if (instanceId) {
        pendingSelectedInstanceId.current = instanceId;
        window.sessionStorage.setItem(
          "pixle-nudge-selected-instance",
          instanceId,
        );
      }
      window.clearTimeout(layoutTimer.current);
      layoutTimer.current = window.setTimeout(async () => {
        try {
          const response = await fetch("/api/pixle-nudge/layout", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(componentLayoutRef.current),
          });
          if (!response.ok) throw new Error("layout save failed");
          const saved = (await response.json()) as PixleLayoutDocument;
          componentLayoutRef.current = saved;
          setComponentLayout(saved);
          setLayoutStatus("saved");
          const shouldReloadPreview = layoutReloadPending.current;
          layoutReloadPending.current = false;
          if (shouldReloadPreview && frameRef.current) {
            frameRef.current.contentWindow?.location.reload();
          }
        } catch {
          setLayoutStatus("err");
        }
      }, 260);
    },
    [],
  );

  const exportCss = useCallback(async () => {
    setExportStatus("exporting");
    setExportWarningCount(0);
    try {
      const response = await fetch("/api/pixle-nudge/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathname: pageKey(), write: true }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error("export failed");
      const warningCount =
        payload &&
        typeof payload === "object" &&
        "warnings" in payload &&
        Array.isArray(payload.warnings)
          ? payload.warnings.length
          : 0;
      setExportWarningCount(warningCount);
      setExportStatus("exported");
    } catch {
      setExportWarningCount(0);
      setExportStatus("failed");
    }
  }, []);

  const save = useCallback(
    (next: Store, group = "edit") => {
      const current = storeRef.current;
      if (JSON.stringify(current) === JSON.stringify(next)) return;
      if (historyGroup.current !== group) {
        undoStack.current = [...undoStack.current.slice(-99), current];
        redoStack.current = [];
        historyGroup.current = group;
      }
      writeStore(next);
    },
    [writeStore],
  );

  const endHistoryGroup = useCallback(() => {
    historyGroup.current = null;
  }, []);

  const undo = useCallback(() => {
    const previous = undoStack.current.pop();
    if (!previous) return;
    redoStack.current.push(storeRef.current);
    historyGroup.current = null;
    writeStore(previous);
  }, [writeStore]);

  const redo = useCallback(() => {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push(storeRef.current);
    historyGroup.current = null;
    writeStore(next);
  }, [writeStore]);

  const finishTextEdit = useCallback(
    (commit: boolean) => {
      const edit = textEditRef.current;
      if (!edit) return;
      textEditRef.current = null;
      setTextEdit(null);
      editing.current = false;
      if (!commit || edit.value === edit.initial) return;
      save(
        upsertRule(storeRef.current, {
          sel: uniqueSel(edit.el),
          x: 0,
          y: 0,
          text: edit.value,
          textPath: edit.path,
        }, currentPreset()),
        `text:${uniqueSel(edit.el)}:${edit.path.join(".")}`,
      );
    },
    [currentPreset, save],
  );

  const selectViewportPreset = useCallback(
    (preset: ViewportPreset) => {
      if (preset === activePresetRef.current) return;
      finishTextEdit(true);
      activePresetRef.current = preset;
      stageFrameWidthRef.current = VIEWPORT_FRAME_WIDTHS[preset];
      stageGeometryRef.current = null;
      setActivePreset(preset);
      if (onRef.current) {
        applying.current = true;
        applyStore(storeRef.current, preset, surfaceDocument());
        applying.current = false;
      }
    },
    [finishTextEdit, surfaceDocument],
  );

  useEffect(() => {
    return () => {
      window.clearTimeout(timer.current);
      window.clearTimeout(layoutTimer.current);
      clearRulePreview(surfaceDocument());
    };
  }, [surfaceDocument]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/pixle-nudge", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : emptyStore()))
      .then((data: Store) => {
        if (cancelled) return;
        const next =
          data && data.version === 1 && data.pages ? data : emptyStore();
        storeRef.current = next;
        undoStack.current = [];
        redoStack.current = [];
        historyGroup.current = null;
        setStore(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/pixle-nudge/layout", { cache: "no-store" })
      .then((response) =>
        response.ok ? response.json() : initialPixleLayout,
      )
      .then((data: PixleLayoutDocument) => {
        if (cancelled) return;
        componentLayoutRef.current = data;
        setComponentLayout(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    applying.current = true;
    applyStore(store, currentPreset(), surfaceDocument());
    applying.current = false;
  }, [activePreset, currentPreset, on, store, surfaceDocument, surfaceVersion]);

  useEffect(() => {
    const update = () => {
      setViewport({
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        width: window.innerWidth,
        height: window.innerHeight,
      });
      if (!onRef.current) {
        applying.current = true;
        applyStore(
          storeRef.current,
          viewportForWidth(window.innerWidth),
          document,
        );
        applying.current = false;
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [on]);

  useEffect(() => {
    if (embedded) return;
    const source = findPageRoot(document);
    if (!source) return;
    if (on && frameAvailable) source.setAttribute(SOURCE_HIDDEN_ATTR, "");
    else source.removeAttribute(SOURCE_HIDDEN_ATTR);
    return () => source.removeAttribute(SOURCE_HIDDEN_ATTR);
  }, [embedded, frameAvailable, on]);

  const stageBaseFor = useCallback(
    (width: number, nextZoom: number): StagePoint => {
      const leftRail = showLayers ? 264 : 36;
      const rightRail = showInspector ? 316 : 36;
      const availableWidth = Math.max(
        160,
        window.innerWidth - leftRail - rightRail,
      );
      return {
        x:
          leftRail +
          Math.max(20, (availableWidth - width * nextZoom) / 2),
        y: 48,
      };
    },
    [showInspector, showLayers],
  );

  const applyStageView = useCallback(
    (
      root: HTMLElement,
      nextZoom: number,
      nextPan: StagePoint,
      measure = false,
    ) => {
      let geometry = stageGeometryRef.current;
      if (measure || !geometry || geometry.root !== root) {
        root.removeAttribute(STAGE_ATTR);
        const rect = root.getBoundingClientRect();
        geometry = {
          root,
          naturalLeft: rect.left,
          naturalTop: rect.top,
          width: stageFrameWidthRef.current,
        };
        stageGeometryRef.current = geometry;
      }
      const base = stageBaseFor(geometry.width, nextZoom);
      const x = base.x + nextPan.x - geometry.naturalLeft;
      const y = base.y + nextPan.y - geometry.naturalTop;
      let sheet = document.getElementById(
        STAGE_SHEET_ID,
      ) as HTMLStyleElement | null;
      if (!sheet) {
        sheet = document.createElement("style");
        sheet.id = STAGE_SHEET_ID;
        sheet.textContent = `
          html[data-pixle-design],html[data-pixle-design] body{background:#d9dbd7!important;overscroll-behavior:none!important;}
          [${SOURCE_HIDDEN_ATTR}]{visibility:hidden!important;pointer-events:none!important;}
          [${STAGE_ATTR}]{left:var(--pn-stage-x)!important;top:var(--pn-stage-y)!important;width:var(--pn-stage-width)!important;min-width:var(--pn-stage-width)!important;max-width:none!important;transform:none!important;zoom:var(--pn-stage-zoom);outline:1px solid rgba(20,18,14,.14);box-shadow:0 18px 54px rgba(20,18,14,.18);}
        `;
        document.head.appendChild(sheet);
      }
      root.style.setProperty("--pn-stage-x", `${x / nextZoom}px`);
      root.style.setProperty("--pn-stage-y", `${y / nextZoom}px`);
      root.style.setProperty("--pn-stage-zoom", String(nextZoom));
      root.style.setProperty(
        "--pn-stage-width",
        `${stageFrameWidthRef.current}px`,
      );
      const nextCamera = {
        left: base.x + nextPan.x,
        top: base.y + nextPan.y,
        zoom: nextZoom,
      };
      setCanvasCamera((current) =>
        current.left === nextCamera.left &&
        current.top === nextCamera.top &&
        current.zoom === nextCamera.zoom
          ? current
          : nextCamera,
      );
      document.documentElement.setAttribute("data-pixle-design", "");
      root.setAttribute(STAGE_ATTR, "");
      if (selRef.current?.isConnected) syncSelectionChrome(selRef.current);
    },
    [stageBaseFor],
  );

  const setStageView = useCallback(
    (nextZoom: number, nextPan: StagePoint) => {
      zoomRef.current = nextZoom;
      stagePanRef.current = nextPan;
      setZoom(nextZoom);
      const root = stageRoot();
      if (onRef.current && root) {
        applyStageView(root, nextZoom, nextPan);
      }
    },
    [applyStageView, stageRoot],
  );

  const zoomStageAt = useCallback(
    (nextZoomValue: number, anchor: StagePoint) => {
      const geometry = stageGeometryRef.current;
      const currentZoom = zoomRef.current;
      const nextZoom = clampZoom(nextZoomValue);
      if (!geometry || nextZoom === currentZoom) return;
      const currentBase = stageBaseFor(geometry.width, currentZoom);
      const nextBase = stageBaseFor(geometry.width, nextZoom);
      const currentPan = stagePanRef.current;
      const designPoint = {
        x: (anchor.x - currentBase.x - currentPan.x) / currentZoom,
        y: (anchor.y - currentBase.y - currentPan.y) / currentZoom,
      };
      setStageView(nextZoom, {
        x: anchor.x - designPoint.x * nextZoom - nextBase.x,
        y: anchor.y - designPoint.y * nextZoom - nextBase.y,
      });
    },
    [setStageView, stageBaseFor],
  );

  const workspaceCenter = useCallback((): StagePoint => {
    const leftRail = showLayers ? 264 : 36;
    const rightRail = showInspector ? 316 : 36;
    return {
      x: leftRail + (window.innerWidth - leftRail - rightRail) / 2,
      y: window.innerHeight / 2,
    };
  }, [showInspector, showLayers]);

  useEffect(() => {
    if (!on) return;
    const root = stageRoot();
    if (!root) return;
    let frame = 0;

    const positionStage = () => {
      applyStageView(root, zoomRef.current, stagePanRef.current, true);
    };
    const queuePosition = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(positionStage);
    };

    positionStage();
    window.addEventListener("resize", queuePosition);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", queuePosition);
      stageGeometryRef.current = null;
      root.removeAttribute(STAGE_ATTR);
      root.style.removeProperty("--pn-stage-x");
      root.style.removeProperty("--pn-stage-y");
      root.style.removeProperty("--pn-stage-zoom");
      root.style.removeProperty("--pn-stage-width");
      document.documentElement.removeAttribute("data-pixle-design");
      document.documentElement.removeAttribute("data-pixle-pan-ready");
      document.documentElement.removeAttribute("data-pixle-panning");
      document.getElementById(STAGE_SHEET_ID)?.remove();
    };
  }, [applyStageView, on, stageRoot, surfaceVersion]);

  useEffect(() => {
    if (!on) return;
    const root = stageRoot();
    if (!root) return;
    const previousRect = root.getBoundingClientRect();
    stageGeometryRef.current = null;
    const frame = window.requestAnimationFrame(() => {
      const currentPan = stagePanRef.current;
      applyStageView(root, zoomRef.current, currentPan, true);
      const nextRect = root.getBoundingClientRect();
      const anchoredPan = {
        x: currentPan.x + previousRect.left - nextRect.left,
        y: currentPan.y + previousRect.top - nextRect.top,
      };
      stagePanRef.current = anchoredPan;
      applyStageView(root, zoomRef.current, anchoredPan);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activePreset, applyStageView, on, stageRoot, surfaceVersion]);

  useEffect(() => {
    const doc = surfaceDocument();
    const mo = new MutationObserver(() => {
      if (applying.current || editing.current) return;
      applying.current = true;
      applyStore(storeRef.current, currentPreset(), doc);
      applying.current = false;
    });
    mo.observe(doc.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [currentPreset, on, surfaceDocument, surfaceVersion]);

  const bump = useCallback(
    (el: Element, dx: number, dy: number) => {
      const r = ruleFor(storeRef.current, el, currentPreset());
      save(
        upsertRule(
          storeRef.current,
          { ...r, x: r.x + dx, y: r.y + dy },
          currentPreset(),
        ),
        `nudge:${uniqueSel(el)}`,
      );
    },
    [currentPreset, save],
  );

  const adjustZoom = useCallback(
    (delta: number) => {
      zoomStageAt(zoomRef.current + delta, workspaceCenter());
    },
    [workspaceCenter, zoomStageAt],
  );

  const resetStageView = useCallback(() => {
    setStageView(1, { x: 0, y: 0 });
  }, [setStageView]);

  useEffect(() => {
    if (!on) return;
    const doc = surfaceDocument();
    const dropSheet = doc.createElement("style");
    dropSheet.id = "pixle-nudge-component-dnd";
    dropSheet.textContent = `
      [data-pixle-drop-compatible]{position:relative!important;min-height:48px;outline:1.5px dashed rgba(196,92,38,.78)!important;outline-offset:4px!important;background-color:color-mix(in srgb,#c45c26 7%,transparent)!important;box-shadow:inset 0 0 0 1px rgba(196,92,38,.12)!important;transition-property:outline-color,background-color,box-shadow;transition-duration:100ms;transition-timing-function:cubic-bezier(.2,0,0,1);}
      [data-pixle-drop-compatible]::after{content:"Drop here";position:absolute;z-index:20;left:50%;top:50%;translate:-50% -50%;padding:5px 8px;border-radius:999px;background:#c45c26;color:#fff;box-shadow:0 3px 10px rgba(20,18,14,.2);font:600 10px/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:.02em;pointer-events:none;opacity:.72;}
      [data-pixle-drop-target]{outline:2.5px solid #c45c26!important;outline-offset:5px!important;background-color:color-mix(in srgb,#c45c26 14%,transparent)!important;box-shadow:inset 0 0 0 2px rgba(196,92,38,.18),0 0 0 5px rgba(196,92,38,.1)!important;}
      [data-pixle-drop-target]::after{opacity:1;}
      [data-pixle-drop-edge]{position:relative!important;}
      [data-pixle-drop-axis="row"][data-pixle-drop-edge="before"]{box-shadow:-4px 0 0 -1px #c45c26!important;}
      [data-pixle-drop-axis="row"][data-pixle-drop-edge="after"]{box-shadow:4px 0 0 -1px #c45c26!important;}
      [data-pixle-drop-axis="column"][data-pixle-drop-edge="before"]{box-shadow:0 -4px 0 -1px #c45c26!important;}
      [data-pixle-drop-axis="column"][data-pixle-drop-edge="after"]{box-shadow:0 4px 0 -1px #c45c26!important;}
      @media (prefers-reduced-motion:reduce){[data-pixle-drop-compatible]{transition-duration:.01ms!important;}}
    `;
    doc.head.appendChild(dropSheet);
    let highlighted: Element | null = null;
    const clearHighlight = () => {
      highlighted?.removeAttribute("data-pixle-drop-target");
      highlighted = null;
      doc.querySelectorAll("[data-pixle-drop-edge]").forEach((element) => {
        element.removeAttribute("data-pixle-drop-edge");
        element.removeAttribute("data-pixle-drop-axis");
      });
    };
    const slotFromTarget = (target: EventTarget | null) =>
      target && target instanceof doc.defaultView!.Element
        ? target.closest(
            "[data-pixle-slot-id][data-pixle-slot-type]",
          )
        : null;
    const accepts = (slot: Element, componentId: PixleComponentId) =>
      (slot.getAttribute("data-pixle-slot-accepts") ?? "")
        .split(",")
        .includes(componentId);
    const dragOver = (event: DragEvent) => {
      const slot = slotFromTarget(event.target);
      if (!slot) {
        clearHighlight();
        return;
      }
      const draggedComponentId = componentDragRef.current?.componentId ?? null;
      if (!draggedComponentId || !accepts(slot, draggedComponentId)) {
        clearHighlight();
        return;
      }
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
      if (highlighted !== slot) {
        clearHighlight();
        highlighted = slot;
        highlighted.setAttribute("data-pixle-drop-target", "");
      }
      doc
        .querySelectorAll("[data-pixle-drop-edge]")
        .forEach((element) => {
          element.removeAttribute("data-pixle-drop-edge");
          element.removeAttribute("data-pixle-drop-axis");
        });
      const targetRoot =
        event.target && event.target instanceof doc.defaultView!.Element
          ? event.target.closest("[data-pixle-instance-id]")
          : null;
      if (targetRoot) {
        const direction = doc.defaultView
          ?.getComputedStyle(slot)
          .flexDirection.startsWith("row")
          ? "row"
          : "column";
        const rect = targetRoot.getBoundingClientRect();
        const after =
          direction === "row"
            ? event.clientX > rect.left + rect.width / 2
            : event.clientY > rect.top + rect.height / 2;
        targetRoot.setAttribute("data-pixle-drop-axis", direction);
        targetRoot.setAttribute(
          "data-pixle-drop-edge",
          after ? "after" : "before",
        );
      }
    };
    const drop = (event: DragEvent) => {
      const slot = slotFromTarget(event.target);
      clearComponentDropChrome();
      highlighted = null;
      if (!slot) return;
      const slotId = slot.getAttribute("data-pixle-slot-id");
      if (!slotId) return;
      const targetRoot =
        event.target && event.target instanceof doc.defaultView!.Element
          ? event.target.closest("[data-pixle-instance-id]")
          : null;
      const targetId = targetRoot?.getAttribute("data-pixle-instance-id");
      const page = readPixleLayout(pageKey(), componentLayoutRef.current);
      const targetSlot = page.slots[slotId] ?? [];
      let targetIndex = targetId
        ? targetSlot.findIndex((instance) => instance.id === targetId)
        : targetSlot.length;
      if (targetIndex < 0) targetIndex = targetSlot.length;
      if (targetRoot) {
        const direction = doc.defaultView
          ?.getComputedStyle(slot)
          .flexDirection.startsWith("row")
          ? "row"
          : "column";
        const rect = targetRoot.getBoundingClientRect();
        const after =
          direction === "row"
            ? event.clientX > rect.left + rect.width / 2
            : event.clientY > rect.top + rect.height / 2;
        if (after) targetIndex += 1;
      }

      const componentId =
        event.dataTransfer?.getData("application/x-pixle-component") ||
        (componentDragRef.current?.kind === "component"
          ? componentDragRef.current.componentId
          : "");
      if (isPixleComponentId(componentId) && accepts(slot, componentId)) {
        event.preventDefault();
        const instance = createPixleInstance(componentId);
        writeComponentLayout(
          insertPixleInstance(
            componentLayoutRef.current,
            pageKey(),
            slotId,
            instance,
            targetIndex,
          ),
          instance.id,
        );
        componentDragRef.current = null;
        return;
      }

      const instancePayload =
        event.dataTransfer?.getData("application/x-pixle-instance") ||
        (componentDragRef.current?.kind === "instance"
          ? JSON.stringify(componentDragRef.current)
          : "");
      if (!instancePayload) return;
      try {
        const parsed = JSON.parse(instancePayload) as {
          instanceId?: unknown;
          fromSlotId?: unknown;
          componentId?: unknown;
        };
        if (
          typeof parsed.instanceId !== "string" ||
          typeof parsed.fromSlotId !== "string" ||
          !isPixleComponentId(parsed.componentId) ||
          !accepts(slot, parsed.componentId)
        ) {
          return;
        }
        event.preventDefault();
        if (parsed.fromSlotId === slotId) {
          const fromIndex = targetSlot.findIndex(
            (instance) => instance.id === parsed.instanceId,
          );
          if (fromIndex >= 0 && fromIndex < targetIndex) targetIndex -= 1;
        }
        writeComponentLayout(
          movePixleInstance(
            componentLayoutRef.current,
            pageKey(),
            parsed.fromSlotId,
            slotId,
            parsed.instanceId,
            targetIndex,
          ),
          parsed.instanceId,
        );
        componentDragRef.current = null;
      } catch {}
    };
    doc.addEventListener("dragover", dragOver);
    doc.addEventListener("drop", drop);
    doc.addEventListener("dragleave", (event) => {
      if (event.target === doc.documentElement) clearHighlight();
    });
    return () => {
      clearComponentDropChrome();
      componentDragRef.current = null;
      dropSheet.remove();
      doc.removeEventListener("dragover", dragOver);
      doc.removeEventListener("drop", drop);
    };
  }, [clearComponentDropChrome, on, surfaceDocument, surfaceVersion, writeComponentLayout]);

  useEffect(() => {
    if (!on) return;
    const isCanvasTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      if (target.closest("iframe[data-pixle-preview-frame]")) return false;
      return !target.closest(
        `#${ROOT_ID} .pn-floating,#${ROOT_ID} .pn-dock,#${ROOT_ID} .pn-ruler,#${ROOT_ID} .pn-ruler-corner`,
      );
    };
    const dragOver = (event: DragEvent) => {
      if (!componentDragRef.current || !isCanvasTarget(event.target)) {
        setCanvasDropTarget(false);
        return;
      }
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect =
          componentDragRef.current.kind === "component" ? "copy" : "move";
      }
      setCanvasDropTarget(true);
    };
    const drop = (event: DragEvent) => {
      const activeDrag = componentDragRef.current;
      if (!activeDrag || !isCanvasTarget(event.target)) return;
      event.preventDefault();
      const position = {
        x: (event.clientX - canvasCamera.left) / canvasCamera.zoom,
        y: (event.clientY - canvasCamera.top) / canvasCamera.zoom,
      };
      if (activeDrag.kind === "component") {
        const instance = createPixleInstance(activeDrag.componentId);
        writeComponentLayout(
          insertPixleCanvasInstance(
            componentLayoutRef.current,
            pageKey(),
            instance,
            position,
          ),
          undefined,
          false,
        );
        setSelectedCanvasInstanceId(instance.id);
      } else {
        const source =
          readPixleLayout(pageKey(), componentLayoutRef.current).slots[
            activeDrag.fromSlotId
          ] ?? [];
        const instance = source.find(
          (candidate) => candidate.id === activeDrag.instanceId,
        );
        if (instance) {
          const withoutSource = removePixleInstance(
            componentLayoutRef.current,
            pageKey(),
            activeDrag.fromSlotId,
            activeDrag.instanceId,
          );
          writeComponentLayout(
            insertPixleCanvasInstance(
              withoutSource,
              pageKey(),
              instance,
              position,
            ),
          );
          setSelectedCanvasInstanceId(instance.id);
        }
      }
      selectElements([]);
      componentDragRef.current = null;
      clearComponentDropChrome();
    };
    const leave = (event: DragEvent) => {
      if (!event.relatedTarget) setCanvasDropTarget(false);
    };
    document.addEventListener("dragover", dragOver);
    document.addEventListener("drop", drop);
    document.addEventListener("dragleave", leave);
    return () => {
      document.removeEventListener("dragover", dragOver);
      document.removeEventListener("drop", drop);
      document.removeEventListener("dragleave", leave);
    };
  }, [
    canvasCamera.left,
    canvasCamera.top,
    canvasCamera.zoom,
    clearComponentDropChrome,
    on,
    selectElements,
    writeComponentLayout,
  ]);

  useEffect(() => {
    if (!on) return;
    let frame = 0;
    let zoomDelta = 0;
    let panDelta: StagePoint = { x: 0, y: 0 };
    let anchor: StagePoint = workspaceCenter();

    const flushWheel = () => {
      frame = 0;
      if (zoomDelta) {
        const delta = zoomDelta;
        zoomDelta = 0;
        zoomStageAt(
          zoomRef.current * Math.exp(-delta * 0.008),
          anchor,
        );
      }
      if (panDelta.x || panDelta.y) {
        const delta = panDelta;
        panDelta = { x: 0, y: 0 };
        const current = stagePanRef.current;
        setStageView(zoomRef.current, {
          x: current.x - delta.x,
          y: current.y - delta.y,
        });
      }
    };

    const moveStageFromTrackpad = (event: WheelEvent) => {
      if (event.ctrlKey) event.preventDefault();
      if (isChrome(event.target)) return;
      event.preventDefault();
      const unit =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerHeight
            : 1;
      if (event.ctrlKey) {
        zoomDelta += event.deltaY * unit;
        anchor = editorPointFor(event);
      } else {
        panDelta.x += event.deltaX * unit;
        panDelta.y += event.deltaY * unit;
      }
      if (frame) return;
      frame = window.requestAnimationFrame(flushWheel);
    };

    const eventDocuments = [...new Set([document, surfaceDocument()])];
    eventDocuments.forEach((doc) => {
      doc.addEventListener("wheel", moveStageFromTrackpad, {
        capture: true,
        passive: false,
      });
    });
    return () => {
      window.cancelAnimationFrame(frame);
      eventDocuments.forEach((doc) => {
        doc.removeEventListener("wheel", moveStageFromTrackpad, true);
      });
    };
  }, [on, setStageView, surfaceDocument, surfaceVersion, workspaceCenter, zoomStageAt]);

  const patchElement = useCallback(
    (el: Element, patch: Partial<Rule>, group: string) => {
      let current = ruleFor(storeRef.current, el, currentPreset());
      if ("width" in patch || "height" in patch) {
        const rect = editorRectFor(el);
        current = {
          ...current,
          width: round(rect.width / zoomRef.current),
          height: round(rect.height / zoomRef.current),
          scale: 1,
        };
      }
      const next = { ...current, ...patch };
      if (next.visible === true) delete next.visible;
      if (next.locked === false) delete next.locked;
      if (next.deleted === false) delete next.deleted;
      save(
        replaceOrRemoveRule(storeRef.current, next, currentPreset()),
        group,
      );
    },
    [currentPreset, save],
  );

  const patchSelected = useCallback(
    (patch: Partial<Rule>) => {
      const el = selRef.current;
      if (!el) return;
      patchElement(
        el,
        patch,
        `field:${uniqueSel(el)}:${Object.keys(patch).sort().join(",")}`,
      );
    },
    [patchElement],
  );

  const resetSelectedProperties = useCallback(
    (properties: ResettableRuleProperty[]) => {
      const el = selRef.current;
      if (!el) return;
      const next = { ...ruleFor(storeRef.current, el, currentPreset()) };
      properties.forEach((property) => {
        if (property === "x" || property === "y") {
          next[property] = 0;
          return;
        }
        delete next[property];
      });
      save(
        replaceOrRemoveRule(storeRef.current, next, currentPreset()),
        `reset:${uniqueSel(el)}:${properties.join(",")}`,
      );
      endHistoryGroup();
    },
    [currentPreset, endHistoryGroup, save],
  );

  const resetSelectedElement = useCallback(() => {
    const el = selRef.current;
    if (!el) return;
    save(
      removeRulesForElement(storeRef.current, el, currentPreset()),
      `reset-element:${uniqueSel(el)}`,
    );
    endHistoryGroup();
  }, [currentPreset, endHistoryGroup, save]);

  const toggleLayerVisibility = useCallback(
    (el: Element) => {
      const current = ruleFor(storeRef.current, el, currentPreset());
      const visible = current.visible !== false;
      patchElement(el, { visible: !visible }, `visibility:${uniqueSel(el)}`);
      if (visible && selRef.current && (selRef.current === el || el.contains(selRef.current))) {
        selectElements([]);
        setHover(null);
      }
      endHistoryGroup();
    },
    [currentPreset, endHistoryGroup, patchElement, selectElements],
  );

  const toggleLayerLock = useCallback(
    (el: Element) => {
      const current = ruleFor(storeRef.current, el, currentPreset());
      patchElement(el, { locked: current.locked !== true }, `lock:${uniqueSel(el)}`);
      endHistoryGroup();
    },
    [currentPreset, endHistoryGroup, patchElement],
  );

  const deleteSelectedElements = useCallback(() => {
    if (selectedCanvasInstanceId && selectionRef.current.length === 0) {
      writeComponentLayout(
        removePixleCanvasInstance(
          componentLayoutRef.current,
          pageKey(),
          selectedCanvasInstanceId,
        ),
        undefined,
        false,
      );
      setSelectedCanvasInstanceId(null);
      return;
    }
    const selected = selectionRef.current.filter(
      (el) => !isElementLocked(storeRef.current, el, currentPreset()),
    );
    if (!selected.length) return;
    const componentRoots = [...new Set(
      selected
        .map((el) =>
          el.closest(
            "[data-pixle-instance-id][data-pixle-component-id][data-pixle-slot-id]",
          ),
        )
        .filter((el): el is Element => Boolean(el)),
    )];
    if (componentRoots.length) {
      let nextLayout = componentLayoutRef.current;
      componentRoots.forEach((root) => {
        const instanceId = root.getAttribute("data-pixle-instance-id");
        const slotId = root.getAttribute("data-pixle-slot-id");
        if (!instanceId || !slotId) return;
        nextLayout = removePixleInstance(
          nextLayout,
          pageKey(),
          slotId,
          instanceId,
        );
      });
      writeComponentLayout(nextLayout);
      selectElements([]);
      setHover(null);
      endHistoryGroup();
      return;
    }
    let next = storeRef.current;
    selected.forEach((el) => {
      next = replaceOrRemoveRule(next, {
        ...ruleFor(next, el, currentPreset()),
        deleted: true,
      }, currentPreset());
    });
    save(next, `delete:${selected.map(uniqueSel).join(",")}`);
    selectElements([]);
    setHover(null);
    endHistoryGroup();
  }, [
    currentPreset,
    endHistoryGroup,
    save,
    selectElements,
    selectedCanvasInstanceId,
    writeComponentLayout,
  ]);

  const deleteSelectedElement = useCallback(() => {
    const el = selRef.current;
    if (!el && !selectedCanvasInstanceId) return;
    if (el && isElementLocked(storeRef.current, el, currentPreset())) return;
    deleteSelectedElements();
  }, [currentPreset, deleteSelectedElements, selectedCanvasInstanceId]);

  const bumpSelected = useCallback(
    (dx: number, dy: number) => {
      const selected = selectionRef.current.filter(
        (el) => !isElementLocked(storeRef.current, el, currentPreset()),
      );
      if (!selected.length) return;
      let next = storeRef.current;
      selected.forEach((el) => {
        const current = ruleFor(next, el, currentPreset());
        next = upsertRule(next, {
          ...current,
          x: current.x + dx,
          y: current.y + dy,
        }, currentPreset());
      });
      save(next, `nudge:${selected.map(uniqueSel).join(",")}`);
    },
    [currentPreset, save],
  );

  const restoreElement = useCallback(
    (el: Element) => {
      patchElement(el, { deleted: false }, `restore:${uniqueSel(el)}`);
      endHistoryGroup();
    },
    [endHistoryGroup, patchElement],
  );

  const clearSmartGuides = useCallback(() => {
    smartGuideLayerRef.current?.replaceChildren();
  }, []);

  const renderSmartGuides = useCallback(
    (
      currentBox: ElementBox,
      candidates: SnapCandidates,
      snappedX: number | null,
      snappedY: number | null,
    ) => {
      const layer = smartGuideLayerRef.current;
      if (!layer) return;
      const guides: SmartGuide[] = [];
      const xGap = closestGap(
        currentBox.left,
        currentBox.left + currentBox.width,
        candidates.x,
      );
      const yGap = closestGap(
        currentBox.top,
        currentBox.top + currentBox.height,
        candidates.y,
      );
      if (snappedX != null) {
        guides.push({
          axis: "x",
          value: snappedX,
          distance: 0,
          labelAt: currentBox.top + currentBox.height / 2,
          snapped: true,
        });
      } else if (xGap && xGap.distance <= 240) {
        guides.push({
          axis: "x",
          value: xGap.value,
          distance: xGap.distance,
          labelAt: currentBox.top + currentBox.height / 2,
        });
      }
      if (snappedY != null) {
        guides.push({
          axis: "y",
          value: snappedY,
          distance: 0,
          labelAt: currentBox.left + currentBox.width / 2,
          snapped: true,
        });
      } else if (yGap && yGap.distance <= 240) {
        guides.push({
          axis: "y",
          value: yGap.value,
          distance: yGap.distance,
          labelAt: currentBox.left + currentBox.width / 2,
        });
      }
      layer.replaceChildren(
        ...guides.flatMap((guide) => {
          const line = document.createElement("div");
          line.className = `pn-smart-guide pn-smart-guide-${guide.axis}${
            guide.snapped ? " is-snapped" : ""
          }`;
          if (guide.axis === "x") line.style.left = `${guide.value}px`;
          else line.style.top = `${guide.value}px`;
          const label = document.createElement("span");
          label.className = `pn-smart-label pn-smart-label-${guide.axis}`;
          label.textContent = `${Math.round(guide.distance ?? 0)}px`;
          if (guide.axis === "x") {
            label.style.left = `${guide.value}px`;
            label.style.top = `${guide.labelAt ?? currentBox.top}px`;
          } else {
            label.style.left = `${guide.labelAt ?? currentBox.left}px`;
            label.style.top = `${guide.value}px`;
          }
          return [line, label];
        }),
      );
    },
    [],
  );

  useEffect(() => {
    if (!on) return;

    let previewFrame = 0;
    let previewPoint: { x: number; y: number } | null = null;

    const preview = (el: Element, rule: Rule, group: string) => {
      applyRulePreview(el, rule);
      pendingCommit.current = {
        store: upsertRule(storeRef.current, rule, currentPreset()),
        group,
      };
      syncSelectionChrome(el);
    };

    const previewGroup = (
      items: GroupItem[],
      rules: { el: Element; rule: Rule }[],
      group: string,
      nextBox: ElementBox,
    ) => {
      applyRulePreviews(rules);
      let next = storeRef.current;
      rules.forEach(({ rule }) => {
        next = upsertRule(next, rule, currentPreset());
      });
      pendingCommit.current = { store: next, group };
      syncGroupChrome(nextBox);
      syncSelectionFrames(selectionRef.current);
    };

    const snapGroupMove = (d: GroupDrag, point: StagePoint) => {
      const dx = point.x - d.x0;
      const dy = point.y - d.y0;
      const xMatch = bestSnap(
        [
          d.box.left + dx,
          d.box.left + d.box.width / 2 + dx,
          d.box.left + d.box.width + dx,
        ],
        d.snap.x,
      );
      const yMatch = bestSnap(
        [
          d.box.top + dy,
          d.box.top + d.box.height / 2 + dy,
          d.box.top + d.box.height + dy,
        ],
        d.snap.y,
      );
      const xCorrection = xMatch?.correction ?? 0;
      const yCorrection = yMatch?.correction ?? 0;
      return {
        dx: dx + xCorrection,
        dy: dy + yCorrection,
        box: {
          left: d.box.left + dx + xCorrection,
          top: d.box.top + dy + yCorrection,
          width: d.box.width,
          height: d.box.height,
        },
        snappedX: xMatch?.value ?? null,
        snappedY: yMatch?.value ?? null,
      };
    };

    const snapGroupResize = (
      d: GroupResize,
      width: number,
      height: number,
      desiredLeft: number,
      desiredTop: number,
    ) => snapResize(d, width, height, desiredLeft, desiredTop);

    const snapMove = (d: NonNullable<typeof drag.current>, point: StagePoint) => {
      const dx = point.x - d.x0;
      const dy = point.y - d.y0;
      const xMatch = bestSnap(
        [
          d.box.left + dx,
          d.box.left + d.box.width / 2 + dx,
          d.box.left + d.box.width + dx,
        ],
        d.snap.x,
      );
      const yMatch = bestSnap(
        [
          d.box.top + dy,
          d.box.top + d.box.height / 2 + dy,
          d.box.top + d.box.height + dy,
        ],
        d.snap.y,
      );
      const xCorrection = xMatch?.correction ?? 0;
      const yCorrection = yMatch?.correction ?? 0;
      return {
        rule: {
          ...d.base,
          x: Math.round(d.ox + (dx + xCorrection) / zoomRef.current),
          y: Math.round(d.oy + (dy + yCorrection) / zoomRef.current),
        },
        box: {
          top: d.box.top + dy + yCorrection,
          left: d.box.left + dx + xCorrection,
          width: d.box.width,
          height: d.box.height,
        },
        snappedX: xMatch?.value ?? null,
        snappedY: yMatch?.value ?? null,
      };
    };

    const snapResize = (
      d: { direction: ResizeDirection; snap: SnapCandidates },
      width: number,
      height: number,
      desiredLeft: number,
      desiredTop: number,
    ) => {
      let nextWidth = width * zoomRef.current;
      let nextHeight = height * zoomRef.current;
      let nextLeft = desiredLeft;
      let nextTop = desiredTop;
      let snappedX: number | null = null;
      let snappedY: number | null = null;
      if (d.direction.includes("e") || d.direction.includes("w")) {
        const movingEdge = d.direction.includes("e")
          ? desiredLeft + nextWidth
          : desiredLeft;
        const edgeMatch = bestSnap([movingEdge], d.snap.x);
        const centerMatch = bestSnap(
          [desiredLeft + nextWidth / 2],
          d.snap.x,
        );
        const match =
          edgeMatch && centerMatch
            ? edgeMatch.distance <= centerMatch.distance
              ? { ...edgeMatch, mode: "edge" as const }
              : { ...centerMatch, mode: "center" as const }
            : edgeMatch
              ? { ...edgeMatch, mode: "edge" as const }
              : centerMatch
                ? { ...centerMatch, mode: "center" as const }
                : null;
        if (match) {
          const correction =
            match.mode === "center" ? match.correction * 2 : match.correction;
          if (d.direction.includes("e")) nextWidth += correction;
          else {
            nextWidth -= correction;
            nextLeft += correction;
          }
          snappedX = match.value;
        }
      }
      if (d.direction.includes("s") || d.direction.includes("n")) {
        const movingEdge = d.direction.includes("s")
          ? desiredTop + nextHeight
          : desiredTop;
        const edgeMatch = bestSnap([movingEdge], d.snap.y);
        const centerMatch = bestSnap(
          [desiredTop + nextHeight / 2],
          d.snap.y,
        );
        const match =
          edgeMatch && centerMatch
            ? edgeMatch.distance <= centerMatch.distance
              ? { ...edgeMatch, mode: "edge" as const }
              : { ...centerMatch, mode: "center" as const }
            : edgeMatch
              ? { ...edgeMatch, mode: "edge" as const }
              : centerMatch
                ? { ...centerMatch, mode: "center" as const }
                : null;
        if (match) {
          const correction =
            match.mode === "center" ? match.correction * 2 : match.correction;
          if (d.direction.includes("s")) nextHeight += correction;
          else {
            nextHeight -= correction;
            nextTop += correction;
          }
          snappedY = match.value;
        }
      }
      const minSize = 8 * zoomRef.current;
      nextWidth = Math.max(minSize, nextWidth);
      nextHeight = Math.max(minSize, nextHeight);
      return {
        width: nextWidth / zoomRef.current,
        height: nextHeight / zoomRef.current,
        left: nextLeft,
        top: nextTop,
        box: {
          left: nextLeft,
          top: nextTop,
          width: nextWidth,
          height: nextHeight,
        },
        snappedX,
        snappedY,
      };
    };

    const flushPreview = () => {
      previewFrame = 0;
      const point = previewPoint;
      previewPoint = null;
      if (!point) return;

      if (groupResize.current) {
        const d = groupResize.current;
        const dx = (point.x - d.x0) / zoomRef.current;
        const dy = (point.y - d.y0) / zoomRef.current;
        let width = d.box.width / zoomRef.current;
        let height = d.box.height / zoomRef.current;
        if (d.direction.includes("e")) width = clampDimension(width + dx);
        if (d.direction.includes("s")) height = clampDimension(height + dy);
        if (d.direction.includes("w")) width = clampDimension(width - dx);
        if (d.direction.includes("n")) height = clampDimension(height - dy);
        const desiredLeft = d.direction.includes("w")
          ? d.box.left + (d.box.width - width * zoomRef.current)
          : d.box.left;
        const desiredTop = d.direction.includes("n")
          ? d.box.top + (d.box.height - height * zoomRef.current)
          : d.box.top;
        const snapped = snapGroupResize(
          d,
          width,
          height,
          desiredLeft,
          desiredTop,
        );
        const scaleX = snapped.box.width / d.box.width;
        const scaleY = snapped.box.height / d.box.height;
        const provisional: { el: Element; rule: Rule }[] = [];
        const targets: { item: GroupItem; left: number; top: number }[] = [];
        d.items.forEach((item) => {
          const left =
            snapped.box.left + (item.box.left - d.box.left) * scaleX;
          const top = snapped.box.top + (item.box.top - d.box.top) * scaleY;
          const nextWidth = Math.max(8, item.box.width * scaleX) / zoomRef.current;
          const nextHeight = Math.max(8, item.box.height * scaleY) / zoomRef.current;
          provisional.push({
            el: item.el,
            rule: {
              ...item.base,
              width: round(nextWidth),
              height: round(nextHeight),
              scale: 1,
            },
          });
          targets.push({ item, left, top });
        });
        applyRulePreviews(provisional);
        const corrected = provisional.map(({ el, rule }, index) => {
          const target = targets[index];
          const actual = editorRectFor(el);
          return {
            el,
            rule: {
              ...rule,
              x: round(
                target.item.base.x +
                  (target.left - actual.left) / zoomRef.current,
              ),
              y: round(
                target.item.base.y +
                  (target.top - actual.top) / zoomRef.current,
              ),
            },
          };
        });
        previewGroup(
          d.items,
          corrected,
          `resize-group:${d.items.map((item) => uniqueSel(item.el)).join(",")}`,
          snapped.box,
        );
        renderSmartGuides(
          snapped.box,
          d.snap,
          snapped.snappedX,
          snapped.snappedY,
        );
        return;
      }

      if (groupDrag.current) {
        const d = groupDrag.current;
        const snapped = snapGroupMove(d, point);
        const rules = d.items.map((item) => ({
          el: item.el,
          rule: {
            ...item.base,
            x: Math.round(item.base.x + snapped.dx / zoomRef.current),
            y: Math.round(item.base.y + snapped.dy / zoomRef.current),
          },
        }));
        previewGroup(
          d.items,
          rules,
          `move-group:${d.items.map((item) => uniqueSel(item.el)).join(",")}`,
          snapped.box,
        );
        renderSmartGuides(
          snapped.box,
          d.snap,
          snapped.snappedX,
          snapped.snappedY,
        );
        return;
      }

      if (resizeDrag.current) {
        const d = resizeDrag.current;
        const dx = (point.x - d.x0) / zoomRef.current;
        const dy = (point.y - d.y0) / zoomRef.current;
        let width = d.width;
        let height = d.height;

        if (d.direction.includes("e")) width = clampDimension(d.width + dx);
        if (d.direction.includes("s")) height = clampDimension(d.height + dy);
        if (d.direction.includes("w")) width = clampDimension(d.width - dx);
        if (d.direction.includes("n")) height = clampDimension(d.height - dy);
        const desiredLeft = d.direction.includes("w")
          ? d.left + (d.width - width) * zoomRef.current
          : d.left;
        const desiredTop = d.direction.includes("n")
          ? d.top + (d.height - height) * zoomRef.current
          : d.top;
        const snapped = snapResize(d, width, height, desiredLeft, desiredTop);
        width = snapped.width;
        height = snapped.height;
        const provisional = {
          ...d.base,
          x: d.x,
          y: d.y,
          width: round(width),
          height: round(height),
          scale: 1,
        };
        applyRulePreview(d.el, provisional);
        const actual = editorRectFor(d.el);
        const corrected = {
          ...provisional,
          x: round(
            d.x + (snapped.left - actual.left) / zoomRef.current,
          ),
          y: round(d.y + (snapped.top - actual.top) / zoomRef.current),
        };
        preview(d.el, corrected, `resize:${uniqueSel(d.el)}`);
        renderSmartGuides(snapped.box, d.snap, snapped.snappedX, snapped.snappedY);
        return;
      }

      if (drag.current) {
        const d = drag.current;
        const snapped = snapMove(d, point);
        preview(
          d.el,
          snapped.rule,
          `move:${uniqueSel(d.el)}`,
        );
        renderSmartGuides(snapped.box, d.snap, snapped.snappedX, snapped.snappedY);
      }
    };

    const queuePreview = (e: PointerEvent) => {
      previewPoint = editorPointFor(e);
      if (!previewFrame) previewFrame = window.requestAnimationFrame(flushPreview);
    };

    const move = (e: PointerEvent) => {
      const point = editorPointFor(e);
      const activePan = stagePanDrag.current;
      if (activePan && activePan.pointerId === e.pointerId) {
        setStageView(zoomRef.current, {
          x: activePan.pan.x + point.x - activePan.x0,
          y: activePan.pan.y + point.y - activePan.y0,
        });
        return;
      }
      if (guideDrag.current) {
        const axis = guideDrag.current.axis;
        const canvasPoint = screenToCanvas(point);
        setGuideDraft({
          axis,
          value: axis === "x" ? canvasPoint.x : canvasPoint.y,
        });
        return;
      }
      if (marquee.current?.pointerId === e.pointerId) {
        const x = Math.min(marquee.current.x0, point.x);
        const y = Math.min(marquee.current.y0, point.y);
        setMarqueeBox({
          left: x,
          top: y,
          width: Math.abs(point.x - marquee.current.x0),
          height: Math.abs(point.y - marquee.current.y0),
        });
        return;
      }
      if (groupResize.current || groupDrag.current) {
        queuePreview(e);
        return;
      }
      if (resizeDrag.current) {
        queuePreview(e);
        return;
      }
      if (drag.current) {
        queuePreview(e);
        return;
      }
      const targetDocument = (e.target as Node | null)?.ownerDocument ?? document;
      const t = pick(targetDocument.elementFromPoint(e.clientX, e.clientY));
      setHover(
        t && !isElementLocked(storeRef.current, t, currentPreset()) ? t : null,
      );
    };

    const down = (e: PointerEvent) => {
      if (isChrome(e.target)) return;
      const point = editorPointFor(e);
      if (spaceHeld.current || e.button === 1) {
        e.preventDefault();
        e.stopPropagation();
        stagePanDrag.current = {
          pointerId: e.pointerId,
          x0: point.x,
          y0: point.y,
          pan: { ...stagePanRef.current },
        };
        document.documentElement.setAttribute("data-pixle-panning", "");
        (e.target as Element).setPointerCapture?.(e.pointerId);
        return;
      }
      let t = pick(e.target as Element);
      if (e.altKey && t?.parentElement) t = pick(t.parentElement) ?? t;
      if (editing.current) {
        finishTextEdit(true);
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if (!t) {
        if (e.button === 0) {
          marquee.current = {
            pointerId: e.pointerId,
            x0: point.x,
            y0: point.y,
          };
          setMarqueeBox({
            left: point.x,
            top: point.y,
            width: 0,
            height: 0,
          });
          selectElements([]);
          (e.target as Element).setPointerCapture?.(e.pointerId);
        }
        return;
      }
      if (isElementLocked(storeRef.current, t, currentPreset())) return;
      if (editing.current) return;
      if (e.shiftKey) {
        const current = selectionRef.current;
        selectElements(
          current.includes(t)
            ? current.filter((item) => item !== t)
            : [...current, t],
        );
        drag.current = null;
        groupDrag.current = null;
        resizeDrag.current = null;
        groupResize.current = null;
        return;
      }
      const nextSelection = selectionRef.current.includes(t)
        ? selectionRef.current
        : [t];
      selectElements(nextSelection);
      resizeDrag.current = null;
      groupResize.current = null;
      const r = ruleFor(storeRef.current, t, currentPreset());
      const movable = nextSelection.filter(
        (item) => !isElementLocked(storeRef.current, item, currentPreset()),
      );
      if (nextSelection.length > 1 && movable.length > 1) {
        const items = movable.map((el) => ({
          el,
          base: ruleFor(storeRef.current, el, currentPreset()),
          box: boxFor(el),
        }));
        const groupBox = boundsForElements(movable);
        if (!groupBox) return;
        groupDrag.current = {
          x0: point.x,
          y0: point.y,
          box: groupBox,
          items,
          snap: snapCandidatesFor(nextSelection, storeRef.current, currentPreset()),
        };
        drag.current = null;
      } else {
        const initialBox = boxFor(t);
        drag.current = {
          el: t,
          x0: point.x,
          y0: point.y,
          ox: r.x,
          oy: r.y,
          base: r,
          box: initialBox,
          snap: snapCandidatesFor(t, storeRef.current, currentPreset()),
        };
        groupDrag.current = null;
      }
      (e.target as Element).setPointerCapture?.(e.pointerId);
    };

    const up = (e: PointerEvent) => {
      const point = editorPointFor(e);
      if (stagePanDrag.current?.pointerId === e.pointerId) {
        stagePanDrag.current = null;
        document.documentElement.removeAttribute("data-pixle-panning");
        (e.target as Element).releasePointerCapture?.(e.pointerId);
        return;
      }
      if (marquee.current?.pointerId === e.pointerId) {
        const start = marquee.current;
        const box = {
          left: Math.min(start.x0, point.x),
          top: Math.min(start.y0, point.y),
          width: Math.abs(point.x - start.x0),
          height: Math.abs(point.y - start.y0),
        };
        if (e.type !== "pointercancel" && (box.width >= 4 || box.height >= 4)) {
          selectElements(
            marqueeSelectionFor(
              box,
              surfaceDocument(),
              storeRef.current,
              currentPreset(),
            ),
          );
        }
        marquee.current = null;
        setMarqueeBox(null);
        (e.target as Element).releasePointerCapture?.(e.pointerId);
        return;
      }
      if (drag.current || resizeDrag.current || groupDrag.current || groupResize.current) {
        if (e.type !== "pointercancel") {
          previewPoint = point;
          if (previewFrame) window.cancelAnimationFrame(previewFrame);
          flushPreview();
          const commit = pendingCommit.current;
          pendingCommit.current = null;
          if (commit) save(commit.store, commit.group);
        } else {
          previewPoint = null;
          if (previewFrame) window.cancelAnimationFrame(previewFrame);
          pendingCommit.current = null;
        }
        clearRulePreview(surfaceDocument());
      }
      clearSmartGuides();
      const activeGuide = guideDrag.current;
      if (activeGuide) {
        const axis = activeGuide.axis;
        const canvasPoint = screenToCanvas(point);
        const value = round(axis === "x" ? canvasPoint.x : canvasPoint.y);
        const keep = axis === "x" ? point.x > 24 : point.y > 24;
        const current = guidesFor(storeRef.current);
        const values = [...current[axis]];
        if (activeGuide.index == null) {
          if (keep) values.push(value);
        } else if (keep) {
          values[activeGuide.index] = value;
        } else {
          values.splice(activeGuide.index, 1);
        }
        if (keep || activeGuide.index != null) {
          save(
            replaceGuides(storeRef.current, {
              ...current,
              [axis]: values.sort((a, b) => a - b),
            }),
            `guide:${axis}:${activeGuide.index ?? "new"}`,
          );
        }
        guideDrag.current = null;
        setGuideDraft(null);
      }
      drag.current = null;
      resizeDrag.current = null;
      groupDrag.current = null;
      groupResize.current = null;
      endHistoryGroup();
    };

    const dbl = (e: MouseEvent) => {
      if (isChrome(e.target)) return;
      const t = pick(e.target as Element);
      if (!t) return;
      if (isElementLocked(storeRef.current, t, currentPreset())) return;
      e.preventDefault();
      e.stopPropagation();
      const textNode = textNodeAtPoint(t, e.clientX, e.clientY);
      if (!textNode) return;
      const path = textNodePath(t, textNode);
      if (!path) return;
      const value = textNode.textContent ?? "";
      const nextEdit = { el: t, path, initial: value, value };
      editing.current = true;
      textEditRef.current = nextEdit;
      setTextEdit(nextEdit);
      selectElements([t]);
    };

    const click = (e: Event) => {
      if (isChrome(e.target)) return;
      if (!onRef.current) return;
      e.preventDefault();
      e.stopPropagation();
    };

    const key = (e: KeyboardEvent) => {
      if (!onRef.current) return;
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "-" || e.key === "_") {
          e.preventDefault();
          adjustZoom(-0.1);
          return;
        }
        if (e.key === "+" || e.key === "=") {
          e.preventDefault();
          adjustZoom(0.1);
          return;
        }
        if (e.key === "0") {
          e.preventDefault();
          resetStageView();
          return;
        }
      }
      if (isChrome(e.target)) return;
      if (
        e.code === "Space" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !editing.current
      ) {
        e.preventDefault();
        spaceHeld.current = true;
        document.documentElement.setAttribute("data-pixle-pan-ready", "");
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (e.key === "Escape") {
        if (editing.current) {
          e.preventDefault();
          finishTextEdit(false);
          return;
        }
        if (selectionRef.current.length > 1) {
          selectElements([]);
          setHover(null);
          return;
        }
        selectElements([]);
        setHover(null);
        setOn(false);
        return;
      }
      const t = selRef.current;
      if (!t || editing.current) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelectedElements();
        return;
      }
      const step = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        bumpSelected(0, -step);
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        bumpSelected(0, step);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        bumpSelected(-step, 0);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        bumpSelected(step, 0);
      }
    };

    const keyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      spaceHeld.current = false;
      document.documentElement.removeAttribute("data-pixle-pan-ready");
      if (!stagePanDrag.current) {
        document.documentElement.removeAttribute("data-pixle-panning");
      }
    };

    const stopPanning = () => {
      spaceHeld.current = false;
      stagePanDrag.current = null;
      document.documentElement.removeAttribute("data-pixle-pan-ready");
      document.documentElement.removeAttribute("data-pixle-panning");
    };

    const eventDocuments = [...new Set([document, surfaceDocument()])];
    eventDocuments.forEach((doc) => {
      doc.addEventListener("pointermove", move, true);
      doc.addEventListener("pointerdown", down, true);
      doc.addEventListener("pointerup", up, true);
      doc.addEventListener("pointercancel", up, true);
      doc.addEventListener("dblclick", dbl, true);
      doc.addEventListener("click", click, true);
      doc.addEventListener("keydown", key, true);
      doc.addEventListener("keyup", keyUp, true);
    });
    window.addEventListener("blur", stopPanning);
    return () => {
      if (previewFrame) window.cancelAnimationFrame(previewFrame);
      pendingCommit.current = null;
      clearRulePreview(surfaceDocument());
      clearSmartGuides();
      drag.current = null;
      resizeDrag.current = null;
      groupDrag.current = null;
      groupResize.current = null;
      marquee.current = null;
      setMarqueeBox(null);
      eventDocuments.forEach((doc) => {
        doc.removeEventListener("pointermove", move, true);
        doc.removeEventListener("pointerdown", down, true);
        doc.removeEventListener("pointerup", up, true);
        doc.removeEventListener("pointercancel", up, true);
        doc.removeEventListener("dblclick", dbl, true);
        doc.removeEventListener("click", click, true);
        doc.removeEventListener("keydown", key, true);
        doc.removeEventListener("keyup", keyUp, true);
      });
      window.removeEventListener("blur", stopPanning);
      stopPanning();
    };
  }, [
    adjustZoom,
    bump,
    bumpSelected,
    clearSmartGuides,
    currentPreset,
    deleteSelectedElements,
    deleteSelectedElement,
    endHistoryGroup,
    finishTextEdit,
    on,
    redo,
    renderSmartGuides,
    resetStageView,
    save,
    screenToCanvas,
    selectElements,
    setStageView,
    surfaceDocument,
    surfaceVersion,
    undo,
  ]);

  const box = (el: Element | null) => {
    if (!el) return null;
    const r = editorRectFor(el);
    return { top: r.top, left: r.left, w: r.width, h: r.height };
  };
  const hb = box(hover);
  const sb = box(sel);
  const renderPreset = on
    ? activePreset
    : viewportForWidth(viewport.width || VIEWPORT_FRAME_WIDTHS.desktop);
  const connectedSelection = selectedElements.filter((el) => el.isConnected);
  const movableSelection = connectedSelection.filter(
    (el) => !isElementLocked(store, el, renderPreset),
  );
  const selectionBoxes = connectedSelection.map((el) => ({
    el,
    box: box(el),
  }));
  const groupBox =
    connectedSelection.length > 1 ? boundsForElements(movableSelection) : null;
  const isGroupSelection = connectedSelection.length > 1 && Boolean(groupBox);
  const active = sel ? ruleFor(store, sel, renderPreset) : null;
  const selectionLocked = sel
    ? isElementLocked(store, sel, renderPreset)
    : false;
  const computed = sel ? ownerWindow(sel).getComputedStyle(sel) : null;
  const activeWidth = round(active?.width ?? (sb?.w ?? 0) / zoom);
  const activeHeight = round(active?.height ?? (sb?.h ?? 0) / zoom);
  const activeTextColor = colorToHex(
    active?.color ?? computed?.color,
    "#14120e",
  );
  const activeFillColor = colorToHex(
    active?.backgroundColor ?? computed?.backgroundColor,
    "#ffffff",
  );
  const activeFontSize = round(
    active?.fontSize ?? styleNumber(computed?.fontSize, 16),
  );
  const activeFontWeight =
    active?.fontWeight ?? styleNumber(computed?.fontWeight, 400);
  const activeLineHeight = round(
    active?.lineHeight ??
      styleNumber(computed?.lineHeight, activeFontSize * 1.2),
  );
  const activeLetterSpacing = round(
    active?.letterSpacing ?? styleNumber(computed?.letterSpacing, 0),
  );
  const rulerMajorStep = rulerStep(canvasCamera.zoom);
  const rulerMajorPx = rulerMajorStep * canvasCamera.zoom;
  const rulerMinorPx = rulerMajorPx / 10;
  const xMarks = on
    ? rulerMarks(
        (24 - canvasCamera.left) / canvasCamera.zoom,
        Math.max(0, viewport.width - 24) / canvasCamera.zoom,
        rulerMajorStep,
      )
    : [];
  const yMarks = on
    ? rulerMarks(
        (24 - canvasCamera.top) / canvasCamera.zoom,
        Math.max(0, viewport.height - 24) / canvasCamera.zoom,
        rulerMajorStep,
      )
    : [];
  const activeGuides = guidesFor(store);
  const normalizedLayerQuery = layerQuery.trim().toLowerCase();
  const filteredLayers = normalizedLayerQuery
    ? layers.filter((layer) =>
        layer.name.toLowerCase().includes(normalizedLayerQuery),
      )
    : layers.filter(
        (layer) =>
          !layer.ancestorKeys.some((key) => collapsedLayers.has(key)),
      );
  const pageComponentLayout = readPixleLayout(pageKey(), componentLayout);
  const canvasInstances = pageComponentLayout.canvas.map((instance) => ({
    ...instance,
    ...resolvedInstance(componentLayout, instance),
    x: instance.x,
    y: instance.y,
  }));
  const filteredCanvasInstances = canvasInstances.filter((instance) => {
    if (!normalizedLayerQuery) return !collapsedLayers.has("canvas");
    return `${componentRegistry[instance.componentId].name} ${instance.id}`
      .toLowerCase()
      .includes(normalizedLayerQuery);
  });
  const normalizedComponentQuery = componentQuery.trim().toLowerCase();
  const filteredComponents = Object.values(componentRegistry).filter(
    (definition) =>
      !normalizedComponentQuery ||
      `${definition.name} ${definition.preview.label} ${definition.preview.description}`
        .toLowerCase()
        .includes(normalizedComponentQuery),
  );
  const selectedComponentRoot = sel?.closest(
    "[data-pixle-instance-id][data-pixle-component-id][data-pixle-slot-id]",
  );
  const selectedCanvasInstance = selectedCanvasInstanceId
    ? pageComponentLayout.canvas.find(
        (instance) => instance.id === selectedCanvasInstanceId,
      ) ?? null
    : null;
  const selectedInstanceId =
    selectedComponentRoot?.getAttribute("data-pixle-instance-id") ??
    selectedCanvasInstance?.id ??
    null;
  const selectedSlotId =
    selectedComponentRoot?.getAttribute("data-pixle-slot-id") ?? null;
  const selectedComponentIdValue = selectedComponentRoot?.getAttribute(
    "data-pixle-component-id",
  );
  const selectedComponentId = isPixleComponentId(selectedComponentIdValue)
    ? selectedComponentIdValue
    : selectedCanvasInstance?.componentId ?? null;
  const selectedComponentDefinition = selectedComponentId
    ? componentRegistry[selectedComponentId]
    : null;
  const selectedComponentInstance =
    selectedComponentId && selectedInstanceId && selectedSlotId
      ? (pageComponentLayout.slots[selectedSlotId] ?? [])
          .find((instance) => instance.id === selectedInstanceId) ?? null
      : selectedCanvasInstance;
  const resolvedSelectedInstance = selectedComponentInstance
    ? resolvedInstance(componentLayout, selectedComponentInstance)
    : null;
  const selectedComponentDefaults = selectedComponentId
    ? componentDefaultsFor(componentLayout, selectedComponentId)
    : null;
  const selectedComponentValues =
    componentEditScope === "component"
      ? selectedComponentDefaults
      : resolvedSelectedInstance;
  const patchSelectedComponent = (
    branch: "props" | "variants",
    key: string,
    value: PixlePrimitive,
  ) => {
    if (
      !selectedComponentId ||
      !selectedInstanceId ||
      !selectedComponentInstance
    ) {
      return;
    }
    const update =
      branch === "props"
        ? { props: { [key]: value } }
        : { variants: { [key]: String(value) } };
    const next =
      componentEditScope === "component"
        ? updatePixleComponentDefaults(componentLayoutRef.current, selectedComponentId, {
            ...update,
          })
        : selectedSlotId
          ? updatePixleInstance(
              componentLayoutRef.current,
              pageKey(),
              selectedSlotId,
              selectedInstanceId,
              update,
            )
          : updatePixleCanvasInstance(
              componentLayoutRef.current,
              pageKey(),
              selectedInstanceId,
              update,
            );
    writeComponentLayout(
      next,
      selectedInstanceId,
      Boolean(selectedSlotId) || componentEditScope === "component",
    );
  };
  const selectedRuleCount = sel
    ? rulesFor(store, renderPreset).filter(
        (rule) => rule.sel === uniqueSel(sel),
      ).length
    : 0;
  const editorPosition =
    textEdit && sb
      ? {
          top: Math.max(12, sb.top - 54),
          left: Math.max(
            12,
            Math.min(Math.max(12, sb.left), window.innerWidth - 332),
          ),
        }
      : null;
  const previewSrc = (() => {
    if (!on || typeof window === "undefined") return undefined;
    const url = new URL(window.location.href);
    url.searchParams.set(FRAME_QUERY, "1");
    return `${url.pathname}${url.search}${url.hash}`;
  })();

  if (embedded) return null;

  return (
    <div id={ROOT_ID}>
      {on && previewSrc && frameAvailable && (
        <iframe
          ref={frameRef}
          className="pn-stage-frame"
          data-pixle-preview-frame=""
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
          title={`${activePreset} responsive design preview`}
          src={previewSrc}
          width={VIEWPORT_FRAME_WIDTHS[activePreset]}
          height={VIEWPORT_FRAME_HEIGHTS[activePreset]}
          onLoad={() => {
            setHover(null);
            window.setTimeout(() => {
              let usable = false;
              try {
                usable = Boolean(
                  frameRef.current?.contentDocument?.head &&
                    frameRef.current?.contentDocument?.body,
                );
              } catch {
                usable = false;
              }
              if (usable) return;
              frameAvailableRef.current = false;
              setFrameAvailable(false);
              setSurfaceVersion((version) => version + 1);
            }, 0);
          }}
        />
      )}
      {on && canvasDropReady && (
        <div
          className={`pn-canvas-drop-surface is-ready${canvasDropTarget ? " is-target" : ""}`}
          aria-hidden="true"
        />
      )}
      {on &&
        canvasInstances.map((instance) => (
          <div
            className={`pn-canvas-instance${selectedCanvasInstanceId === instance.id ? " is-selected" : ""}`}
            data-pixle-canvas-instance-id={instance.id}
            data-pixle-component-id={instance.componentId}
            role="button"
            tabIndex={0}
            aria-label={`${componentRegistry[instance.componentId].name} ${instance.id}`}
            key={instance.id}
            style={{
              left: canvasCamera.left + instance.x * canvasCamera.zoom,
              top: canvasCamera.top + instance.y * canvasCamera.zoom,
            }}
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              event.preventDefault();
              event.stopPropagation();
              setSelectedCanvasInstanceId(instance.id);
              selectElements([]);
              canvasInstanceDrag.current = {
                pointerId: event.pointerId,
                instanceId: instance.id,
                x0: event.clientX,
                y0: event.clientY,
                originX: instance.x,
                originY: instance.y,
              };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              const activeDrag = canvasInstanceDrag.current;
              if (
                !activeDrag ||
                activeDrag.pointerId !== event.pointerId ||
                activeDrag.instanceId !== instance.id
              ) {
                return;
              }
              const x =
                activeDrag.originX +
                (event.clientX - activeDrag.x0) / canvasCamera.zoom;
              const y =
                activeDrag.originY +
                (event.clientY - activeDrag.y0) / canvasCamera.zoom;
              event.currentTarget.style.left = `${
                canvasCamera.left + x * canvasCamera.zoom
              }px`;
              event.currentTarget.style.top = `${
                canvasCamera.top + y * canvasCamera.zoom
              }px`;
            }}
            onPointerUp={(event) => {
              const activeDrag = canvasInstanceDrag.current;
              if (
                !activeDrag ||
                activeDrag.pointerId !== event.pointerId ||
                activeDrag.instanceId !== instance.id
              ) {
                return;
              }
              const position = {
                x:
                  activeDrag.originX +
                  (event.clientX - activeDrag.x0) / canvasCamera.zoom,
                y:
                  activeDrag.originY +
                  (event.clientY - activeDrag.y0) / canvasCamera.zoom,
              };
              canvasInstanceDrag.current = null;
              writeComponentLayout(
                movePixleCanvasInstance(
                  componentLayoutRef.current,
                  pageKey(),
                  instance.id,
                  position,
                ),
                undefined,
                false,
              );
            }}
          >
            <div
              className="pn-canvas-instance-content"
              style={{ zoom: canvasCamera.zoom }}
            >
              <DetachedCanvasPreview instance={instance} />
            </div>
          </div>
        ))}
      <style>{`
        #${ROOT_ID}{all:initial;font-family:ui-sans-serif,system-ui,sans-serif;}
        #${ROOT_ID} *{box-sizing:border-box;}
        .pn-stage-frame{position:fixed;left:0;top:0;z-index:1;display:block;border:0;background:#fff;color-scheme:normal;}
        .pn-canvas-drop-surface{position:fixed;z-index:2147482995;inset:24px 0 0 24px;pointer-events:none;opacity:0;background:rgba(196,92,38,.035);box-shadow:inset 0 0 0 2px rgba(196,92,38,.68);transition-property:opacity,background-color;transition-duration:100ms;transition-timing-function:cubic-bezier(.2,0,0,1);}
        .pn-canvas-drop-surface::after{content:"Drop on canvas";position:absolute;left:50%;top:32px;translate:-50% 0;padding:6px 10px;border-radius:999px;background:#c45c26;color:#fff;box-shadow:0 4px 14px rgba(20,18,14,.2);font:650 10px/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:.02em;}
        .pn-canvas-drop-surface.is-ready{opacity:.48;}
        .pn-canvas-drop-surface.is-target{opacity:1;background:rgba(196,92,38,.075);}
        .pn-canvas-instance{position:fixed;z-index:2;cursor:grab;touch-action:none;user-select:none;}
        .pn-canvas-instance-content{transform-origin:top left;}
        .pn-canvas-instance:active{cursor:grabbing;}
        .pn-canvas-instance.is-selected{outline:2px solid #c45c26;outline-offset:4px;}
        .pn-canvas-instance:focus-visible{outline:2px solid #c45c26;outline-offset:4px;}
        .pn-canvas-button{display:flex;align-items:center;justify-content:center;min-width:96px;height:40px;padding:0 18px;border-radius:999px;background:#14120e;color:#fff;box-shadow:0 8px 22px rgba(20,18,14,.18);font:650 13px/1 ui-sans-serif,system-ui,sans-serif;white-space:nowrap;}
        .pn-canvas-button.is-secondary{background:#fff;color:#14120e;box-shadow:inset 0 0 0 1px rgba(20,18,14,.14),0 8px 22px rgba(20,18,14,.12);}
        .pn-canvas-button.is-quiet{background:transparent;color:#14120e;box-shadow:inset 0 0 0 1px rgba(20,18,14,.16);}
        .pn-canvas-button.is-small{min-width:80px;height:32px;padding:0 14px;font-size:11px;}
        .pn-canvas-button.is-large{min-width:116px;height:48px;padding:0 22px;font-size:15px;}
        .pn-canvas-button.is-disabled{opacity:.45;}
        .pn-canvas-button.is-loading{color:transparent;}
        .pn-canvas-button.is-loading::after{content:"";width:14px;height:14px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;color:#fff;animation:pn-spin 800ms linear infinite;}
        .pn-canvas-card{width:240px;padding:20px;border-radius:16px;background:#fff;color:#14120e;box-shadow:inset 0 0 0 1px rgba(20,18,14,.09),0 14px 34px rgba(20,18,14,.15);}
        .pn-canvas-card>span{display:block;margin-bottom:9px;color:#777a73;font:650 10px/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;}
        .pn-canvas-card>strong{display:block;font:650 20px/1.15 ui-sans-serif,system-ui,sans-serif;}
        .pn-canvas-card>p{margin:9px 0 0;color:#60635d;font:12px/1.45 ui-sans-serif,system-ui,sans-serif;}
        .pn-canvas-card.is-subtle{background:#eceee9;}
        .pn-canvas-card.is-inverted{background:#14120e;color:#fff;}
        .pn-canvas-card.is-inverted>span,.pn-canvas-card.is-inverted>p{color:#aeb0aa;}
        .pn-canvas-card.is-featured{width:280px;padding:24px;}
        html[data-pixle-pan-ready] [${STAGE_ATTR}],html[data-pixle-pan-ready] [${STAGE_ATTR}] *{cursor:grab!important;}
        html[data-pixle-panning] [${STAGE_ATTR}],html[data-pixle-panning] [${STAGE_ATTR}] *{cursor:grabbing!important;}
        .pn-frame{position:fixed;pointer-events:none;z-index:2147483000;border:1px solid rgba(196,92,38,.85);background:rgba(196,92,38,.08);}
        .pn-frame.is-sel{border-color:#c45c26;background:transparent;}
        .pn-frame.is-secondary{border-color:rgba(196,92,38,.6);background:rgba(196,92,38,.04);}
        .pn-frame.is-group{border:1px solid #c45c26;background:transparent;}
        .pn-marquee{position:fixed;z-index:2147483001;pointer-events:none;border:1px solid rgba(196,92,38,.8);background:rgba(196,92,38,.1);}
        .pn-handle{appearance:none;position:fixed;z-index:2147483002;width:16px;height:16px;padding:0;border:0;background:transparent;touch-action:none;}
        .pn-handle::after{content:"";position:absolute;inset:3px;border:1.5px solid #c45c26;border-radius:2px;background:#fff;box-shadow:0 1px 3px rgba(20,18,14,.18);}
        .pn-handle:focus-visible{outline:2px solid #14120e;outline-offset:2px;}
        .pn-handle.n,.pn-handle.s{cursor:ns-resize;}
        .pn-handle.e,.pn-handle.w{cursor:ew-resize;}
        .pn-handle.ne,.pn-handle.sw{cursor:nesw-resize;}
        .pn-handle.nw,.pn-handle.se{cursor:nwse-resize;}
        .pn-ruler{position:fixed;z-index:2147482998;pointer-events:none;background-color:rgba(248,248,246,.96);color:#6f726d;box-shadow:inset 0 -1px rgba(20,18,14,.14);font:9px/1 ui-monospace,SFMono-Regular,Menlo,monospace;}
        .pn-ruler-x{left:24px;right:0;top:0;height:24px;overflow:hidden;pointer-events:auto;cursor:row-resize;}
        .pn-ruler-y{left:0;top:24px;bottom:0;width:24px;overflow:hidden;pointer-events:auto;cursor:col-resize;box-shadow:inset -1px 0 rgba(20,18,14,.14);}
        .pn-ruler-corner{position:fixed;left:0;top:0;z-index:2147482999;width:24px;height:24px;background:#ecece8;box-shadow:inset -1px -1px rgba(20,18,14,.14);}
        .pn-ruler-label-x{position:absolute;top:3px;transform:translateX(3px);}
        .pn-ruler-label-y{position:absolute;left:3px;transform:translateY(3px) rotate(-90deg);transform-origin:top left;}
        .pn-ruler-selection-x,.pn-ruler-selection-y{position:fixed;z-index:2147482999;pointer-events:none;background:#c45c26;}
        .pn-ruler-selection-x{top:21px;height:3px;}
        .pn-ruler-selection-y{left:21px;width:3px;}
        .pn-guide{appearance:none;position:fixed;z-index:2147482997;padding:0;border:0;background:transparent;pointer-events:auto;touch-action:none;}
        .pn-guide::after{content:"";position:absolute;background:#18a0fb;}
        .pn-guide-x{top:0;bottom:0;width:9px;cursor:col-resize;transform:translateX(-4px);}
        .pn-guide-x::after{left:4px;top:0;bottom:0;width:1px;}
        .pn-guide-y{left:0;right:0;height:9px;cursor:row-resize;transform:translateY(-4px);}
        .pn-guide-y::after{left:0;right:0;top:4px;height:1px;}
        .pn-guide.is-draft::after{background:#c45c26;}
        .pn-smart-guides{position:fixed;inset:0;z-index:2147483001;pointer-events:none;}
        .pn-smart-guide{position:fixed;background:rgba(196,92,38,.42);pointer-events:none;}
        .pn-smart-guide-x{top:24px;bottom:0;width:1px;}
        .pn-smart-guide-y{left:24px;right:0;height:1px;}
        .pn-smart-guide.is-snapped{background:#c45c26;}
        .pn-smart-label{position:fixed;z-index:1;padding:3px 5px;border-radius:5px;background:#c45c26;color:#fff;transform:translate(-50%,-50%);font:600 9px/1 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;}
        .pn-editor{position:fixed;z-index:2147483012;display:flex;align-items:center;gap:6px;width:320px;padding:6px;border-radius:14px;background:#14120e;color:#f3efe4;box-shadow:0 10px 30px rgba(20,18,14,.3);}
        .pn-editor label{padding-left:4px;font:600 10px/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#aeb7aa;}
        .pn-editor input{min-width:0;flex:1;height:30px;border:0;border-radius:8px;background:#f3efe4;color:#14120e;padding:0 9px;font:12px/1 ui-sans-serif,system-ui,sans-serif;outline:none;}
        .pn-editor input:focus{box-shadow:inset 0 0 0 2px #c45c26;}
        .pn-editor button{appearance:none;height:30px;border:0;border-radius:8px;background:#c45c26;color:#fff;padding:0 10px;font:600 11px/1 ui-sans-serif,system-ui,sans-serif;cursor:pointer;transition-property:background-color,scale;transition-duration:120ms;transition-timing-function:cubic-bezier(.2,0,0,1);}
        .pn-editor button:active{scale:.96;}
        .pn-editor button:focus-visible{outline:2px solid #f3efe4;outline-offset:2px;}
        .pn-floating{position:fixed;z-index:2147483010;display:flex;flex-direction:column;max-width:calc(100vw - 48px);max-height:calc(100vh - 48px);overflow:hidden;resize:both;border-radius:14px;background:#1d1d1b;color:#f7f7f2;box-shadow:0 0 0 1px rgba(255,255,255,.06),0 14px 40px rgba(20,18,14,.28);font:12px/1.2 ui-sans-serif,system-ui,sans-serif;}
        .pn-floating::after{content:"";position:absolute;right:5px;bottom:5px;width:8px;height:8px;border-right:1.5px solid #777a73;border-bottom:1.5px solid #777a73;pointer-events:none;}
        .pn-floating.is-docked{resize:none;border-radius:10px;}
        .pn-floating.is-docked::after{display:none;}
        .pn-floating-header{display:flex;align-items:center;justify-content:space-between;min-height:42px;padding:0 8px 0 12px;border-bottom:1px solid rgba(255,255,255,.1);cursor:grab;touch-action:none;user-select:none;}
        .pn-floating-header:active{cursor:grabbing;}
        .pn-floating.is-docked .pn-floating-header{cursor:default;}
        .pn-floating-title{font-weight:650;letter-spacing:.01em;}
        .pn-floating-actions{display:flex;align-items:center;gap:6px;}
        .pn-floating-meta{color:#9ea09a;font:10px/1 ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;}
        .pn-floating-close,.pn-floating-dock{appearance:none;display:grid;place-items:center;width:26px;height:26px;padding:0;border:0;border-radius:7px;background:transparent;color:#9ea09a;cursor:pointer;transition-property:background-color,color,scale;transition-duration:120ms;transition-timing-function:cubic-bezier(.2,0,0,1);}
        .pn-floating-close svg,.pn-floating-dock svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;}
        .pn-context-icon .pn-icon-state{transform-origin:center;opacity:0;scale:.25;filter:blur(4px);transition-property:opacity,scale,filter;transition-duration:300ms;transition-timing-function:cubic-bezier(.2,0,0,1);}
        .pn-context-icon .pn-icon-state.is-active{opacity:1;scale:1;filter:blur(0);}
        .pn-floating-close:hover,.pn-floating-dock:hover{background:rgba(255,255,255,.09);color:#fff;}
        .pn-floating-close:active,.pn-floating-dock:active{scale:.96;}
        .pn-floating-close:focus-visible,.pn-floating-dock:focus-visible{outline:2px solid #f3efe4;outline-offset:1px;}
        .pn-floating-body{min-height:0;flex:1;overflow:auto;}
        .pn-section{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.1);}
        .pn-section-title{margin:0 0 9px;color:#aeb0aa;font:600 10px/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:.07em;text-transform:uppercase;}
        .pn-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;}
        .pn-field{display:flex;align-items:center;min-width:0;height:32px;border-radius:8px;background:#2b2b28;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);}
        .pn-field:focus-within{box-shadow:inset 0 0 0 1.5px #c45c26;}
        .pn-field-label{flex:0 0 28px;padding-left:9px;color:#92958e;font:10px/1 ui-sans-serif,system-ui,sans-serif;text-transform:uppercase;}
        .pn-field input,.pn-field select{min-width:0;width:100%;height:100%;border:0;outline:0;background:transparent;color:#f7f7f2;padding:0 4px 0 2px;font:12px/1 ui-sans-serif,system-ui,sans-serif;}
        .pn-field input[type="number"]{font-variant-numeric:tabular-nums;}
        .pn-wide{grid-column:1/-1;}
        .pn-color-row{display:grid;grid-template-columns:1fr 1fr;gap:7px;}
        .pn-color{display:flex;align-items:center;gap:7px;min-width:0;height:34px;padding:0 8px;border-radius:8px;background:#2b2b28;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);}
        .pn-color:focus-within{box-shadow:inset 0 0 0 1.5px #c45c26;}
        .pn-color input[type="color"]{appearance:none;width:18px;height:18px;flex:0 0 18px;padding:0;border:0;border-radius:4px;background:transparent;overflow:hidden;cursor:pointer;}
        .pn-color input[type="color"]::-webkit-color-swatch-wrapper{padding:0;}
        .pn-color input[type="color"]::-webkit-color-swatch{border:1px solid rgba(255,255,255,.22);border-radius:4px;}
        .pn-color-copy{display:block;min-width:0;flex:1;}
        .pn-color-copy span{display:block;color:#8f928b;font:9px/1 ui-sans-serif,system-ui,sans-serif;text-transform:uppercase;}
        .pn-color-copy input{display:block;width:100%;height:13px;margin-top:2px;padding:0;border:0;outline:0;background:transparent;color:#f7f7f2;font:10px/1 ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;}
        .pn-reset-control{appearance:none;display:grid;place-items:center;flex:0 0 24px;width:24px;height:24px;margin-right:4px;padding:0;border:0;border-radius:6px;background:transparent;color:#9ea09a;cursor:pointer;transition-property:background-color,color,scale;transition-duration:120ms;transition-timing-function:cubic-bezier(.2,0,0,1);}
        .pn-reset-control:hover{background:rgba(255,255,255,.09);color:#fff;}
        .pn-reset-control:active{scale:.96;}
        .pn-reset-control:focus-visible{outline:2px solid #f3efe4;outline-offset:-1px;}
        .pn-reset-control:disabled{visibility:hidden;}
        .pn-reset-control svg,.pn-layer-search svg,.pn-layer-action svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;}
        .pn-inspector-fields{min-width:0;margin:0;padding:0;border:0;}
        .pn-inspector-fields:disabled{opacity:.5;}
        .pn-inspector-empty{display:grid;place-items:center;height:100%;min-height:220px;padding:28px;color:#8f928b;text-align:center;font:11px/1.5 ui-sans-serif,system-ui,sans-serif;}
        .pn-inspector-alert{display:flex;align-items:center;gap:8px;margin:10px 14px 0;padding:9px 10px;border-radius:8px;background:rgba(24,160,251,.12);color:#b9dcf3;font:11px/1.35 ui-sans-serif,system-ui,sans-serif;}
        .pn-inspector-actions{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.1);}
        .pn-inspector-actions span{color:#8f928b;font:10px/1.3 ui-sans-serif,system-ui,sans-serif;}
        .pn-inspector-action-buttons{display:flex;align-items:center;gap:6px;}
        .pn-reset-element,.pn-delete-element{appearance:none;height:30px;padding:0 9px;border:0;border-radius:8px;font:600 11px/1 ui-sans-serif,system-ui,sans-serif;cursor:pointer;transition-property:background-color,color,scale;transition-duration:120ms;transition-timing-function:cubic-bezier(.2,0,0,1);}
        .pn-reset-element{background:#333330;color:#c7c8c2;}
        .pn-reset-element:hover{background:#493027;color:#ffd5c5;}
        .pn-delete-element{background:#493027;color:#ffb49a;}
        .pn-delete-element:hover{background:#653324;color:#ffd5c5;}
        .pn-reset-element:active,.pn-delete-element:active{scale:.96;}
        .pn-reset-element:disabled,.pn-delete-element:disabled{opacity:.4;cursor:default;}
        .pn-reset-element:focus-visible,.pn-delete-element:focus-visible{outline:2px solid #f3efe4;outline-offset:2px;}
        .pn-inspector-hint{padding:10px 14px;color:#aeb0aa;font:10px/1.45 ui-sans-serif,system-ui,sans-serif;}
        .pn-layers .pn-floating-body{display:flex;flex-direction:column;overflow:hidden;}
        .pn-panel-tabs,.pn-scope-tabs{display:grid;grid-template-columns:1fr 1fr;gap:2px;margin:8px 8px 0;padding:2px;border-radius:9px;background:#2b2b28;}
        .pn-panel-tabs button,.pn-scope-tabs button{appearance:none;height:28px;padding:0 8px;border:0;border-radius:7px;background:transparent;color:#9ea09a;font:600 10px/1 ui-sans-serif,system-ui,sans-serif;cursor:pointer;transition-property:background-color,color,scale;transition-duration:120ms;transition-timing-function:cubic-bezier(.2,0,0,1);}
        .pn-panel-tabs button[aria-selected="true"],.pn-scope-tabs button[aria-pressed="true"]{background:#44443f;color:#fff;box-shadow:0 1px 2px rgba(0,0,0,.22);}
        .pn-panel-tabs button:active,.pn-scope-tabs button:active{scale:.96;}
        .pn-panel-tabs button:focus-visible,.pn-scope-tabs button:focus-visible{outline:2px solid #f3efe4;outline-offset:1px;}
        .pn-layer-search{display:flex;align-items:center;gap:7px;flex:0 0 auto;height:42px;margin:8px 8px 2px;padding:0 9px;border-radius:8px;background:#2b2b28;color:#8f928b;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);}
        .pn-layer-search:focus-within{color:#cfd1cb;box-shadow:inset 0 0 0 1.5px #c45c26;}
        .pn-layer-search input{min-width:0;width:100%;height:100%;padding:0;border:0;outline:0;background:transparent;color:#f7f7f2;font:11px/1 ui-sans-serif,system-ui,sans-serif;}
        .pn-layer-search input::placeholder{color:#7f827b;}
        .pn-layers-list{min-height:0;flex:1;overflow:auto;padding:6px;}
        .pn-layer-row{position:relative;display:flex;align-items:center;width:100%;height:30px;border-radius:6px;color:#cfd1cb;}
        .pn-layer-row:hover{background:rgba(255,255,255,.07);color:#fff;}
        .pn-layer-row.is-selected{background:#c45c26;color:#fff;}
        .pn-layer-row.is-hidden .pn-layer{opacity:.46;}
        .pn-layer-row.is-deleted .pn-layer{opacity:.34;text-decoration:line-through;}
        .pn-layer-indent{display:flex;align-items:center;min-width:0;flex:1;height:30px;}
        .pn-layer-disclosure{appearance:none;display:grid;place-items:center;flex:0 0 22px;width:22px;height:26px;padding:0;border:0;border-radius:5px;background:transparent;color:inherit;opacity:.72;cursor:pointer;}
        .pn-layer-disclosure:hover{background:rgba(255,255,255,.1);opacity:1;}
        .pn-layer-disclosure:focus-visible{outline:2px solid #f3efe4;outline-offset:-2px;}
        .pn-layer-disclosure svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;rotate:90deg;transition-property:rotate;transition-duration:120ms;transition-timing-function:cubic-bezier(.2,0,0,1);}
        .pn-layer-disclosure svg.is-collapsed{rotate:0deg;}
        .pn-layer-disclosure-placeholder{flex:0 0 22px;width:22px;}
        .pn-layer{appearance:none;display:block;min-width:0;height:30px;flex:1;overflow:hidden;padding:0;border:0;border-radius:6px;background:transparent;color:inherit;text-align:left;white-space:nowrap;text-overflow:ellipsis;font:11px/1 ui-sans-serif,system-ui,sans-serif;cursor:pointer;}
        .pn-layer:disabled{cursor:default;}
        .pn-layer:focus-visible,.pn-layer-action:focus-visible{outline:2px solid #f3efe4;outline-offset:-2px;}
        .pn-layer-actions{display:flex;align-items:center;flex:0 0 auto;padding-right:2px;}
        .pn-layer-action{appearance:none;display:grid;place-items:center;width:26px;height:26px;padding:0;border:0;border-radius:6px;background:transparent;color:inherit;opacity:.58;cursor:pointer;transition-property:background-color,opacity,scale;transition-duration:120ms;transition-timing-function:cubic-bezier(.2,0,0,1);}
        .pn-layer-action:hover,.pn-layer-action[aria-pressed="true"]{background:rgba(255,255,255,.12);opacity:1;}
        .pn-layer-action:active{scale:.96;}
        .pn-layer-restore{color:#f1b199;opacity:1;}
        .pn-layer-deleted-mark{padding:0 6px;color:#7f827b;font:8px/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:.05em;text-transform:uppercase;}
        .pn-layers-empty{display:grid;place-items:center;min-height:96px;padding:18px;color:#8f928b;text-align:center;font:11px/1.4 ui-sans-serif,system-ui,sans-serif;}
        .pn-component-list{min-height:0;flex:1;overflow:auto;padding:8px;}
        .pn-component-card{appearance:none;display:block;width:100%;margin:0 0 8px;padding:10px;border:0;border-radius:18px;background:#292926;color:#f7f7f2;text-align:left;cursor:grab;box-shadow:0 0 0 1px rgba(255,255,255,.06),0 1px 2px rgba(0,0,0,.18);transition-property:background-color,box-shadow,scale;transition-duration:120ms;transition-timing-function:cubic-bezier(.2,0,0,1);}
        .pn-component-card:hover{background:#333330;box-shadow:0 0 0 1px rgba(255,255,255,.12),0 2px 5px rgba(0,0,0,.22);}
        .pn-component-card:active{cursor:grabbing;scale:.96;}
        .pn-component-card:focus-visible{outline:2px solid #f3efe4;outline-offset:1px;}
        .pn-component-preview{display:flex;align-items:center;justify-content:center;min-height:52px;margin-bottom:9px;border-radius:8px;background:#1d1d1b;color:#fff;box-shadow:0 0 0 1px rgba(255,255,255,.06);}
        .pn-component-preview.is-button::before{content:"Button";padding:7px 12px;border-radius:999px;background:#f3efe4;color:#14120e;font:600 10px/1 ui-sans-serif,system-ui,sans-serif;}
        .pn-component-preview.is-card::before{content:"Card";display:grid;place-items:center;width:72px;height:34px;border-radius:7px;background:#f3efe4;color:#14120e;font:600 10px/1 ui-sans-serif,system-ui,sans-serif;}
        .pn-component-name{display:block;font:650 11px/1.2 ui-sans-serif,system-ui,sans-serif;}
        .pn-component-description{display:block;margin-top:4px;color:#92958e;font:10px/1.35 ui-sans-serif,system-ui,sans-serif;}
        .pn-component-source{display:block;margin-top:6px;color:#c98260;font:9px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;}
        .pn-layer-row[draggable="true"] .pn-layer{cursor:grab;}
        .pn-layer-row[draggable="true"]:active .pn-layer{cursor:grabbing;}
        .pn-layer-grip,.pn-layer-leading-icon{display:inline-grid;place-items:center;vertical-align:middle;width:18px;height:18px;margin-right:3px;color:currentColor;opacity:.58;}
        .pn-layer-grip svg{width:16px;height:16px;fill:currentColor;stroke:none;}
        .pn-layer-leading-icon svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;}
        .pn-layer-row[data-pixle-layer-drop]::before{content:"";position:absolute;z-index:2;left:8px;right:8px;height:2px;border-radius:999px;background:#c45c26;box-shadow:0 0 0 2px rgba(196,92,38,.18);pointer-events:none;}
        .pn-layer-row[data-pixle-layer-drop="before"]::before{top:-1px;}
        .pn-layer-row[data-pixle-layer-drop="after"]::before{bottom:-1px;}
        .pn-layer-row[data-pixle-layer-drop="inside"]{background:rgba(196,92,38,.16);box-shadow:inset 0 0 0 1px rgba(196,92,38,.55);}
        .pn-layer-row[data-pixle-layer-drop="inside"]::before{display:none;}
        .pn-canvas-group{color:#f0b99f;}
        .pn-component-editor{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.1);}
        .pn-component-editor .pn-scope-tabs{margin:0 0 10px;}
        .pn-component-editor-copy{margin:0 0 10px;color:#92958e;font:10px/1.35 ui-sans-serif,system-ui,sans-serif;}
        .pn-component-control{display:grid;grid-template-columns:76px minmax(0,1fr);align-items:center;gap:8px;min-height:34px;margin-top:6px;}
        .pn-component-control label{color:#aeb0aa;font:10px/1.2 ui-sans-serif,system-ui,sans-serif;}
        .pn-component-control input,.pn-component-control select{min-width:0;width:100%;height:30px;padding:0 8px;border:0;outline:0;border-radius:8px;background:#2b2b28;color:#f7f7f2;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);font:11px/1 ui-sans-serif,system-ui,sans-serif;}
        .pn-component-control input:focus,.pn-component-control select:focus{box-shadow:inset 0 0 0 1.5px #c45c26;}
        .pn-layout-status{margin-top:8px;color:#92958e;font:9px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;}
        .pn-dock{position:fixed;right:16px;bottom:16px;z-index:2147483011;display:flex;flex-direction:column;align-items:flex-end;gap:8px;}
        .pn-bar{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:999px;background:#14120e;color:#f3efe4;box-shadow:0 0 0 1px rgba(255,255,255,.07),0 8px 24px rgba(20,18,14,.28);}
        .pn-bar button{appearance:none;border:0;background:#2b2b28;color:#cfd1cb;border-radius:999px;padding:6px 12px;font:600 12px/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:.02em;cursor:pointer;transition-property:background-color,color,scale;transition-duration:120ms;transition-timing-function:cubic-bezier(.2,0,0,1);}
        .pn-bar button:hover{background:#3a3a36;color:#fff;}
        .pn-bar button[aria-pressed="true"]{background:#493027;color:#ffd5c5;}
        .pn-bar .pn-design-toggle[aria-pressed="true"]{background:#c45c26;color:#fff;}
        .pn-bar button:active{scale:.96;}
        .pn-bar>button:disabled{cursor:default;opacity:.45;}
        .pn-bar button:focus-visible{outline:2px solid #f3efe4;outline-offset:2px;}
        .pn-frame-controls{display:flex;align-items:center;gap:2px;padding:2px;border-radius:999px;background:#2b2b28;}
        .pn-bar .pn-frame-controls button{display:flex;align-items:baseline;gap:4px;height:28px;padding:0 8px;border-radius:999px;background:transparent;color:#bfc2ba;font-size:10px;}
        .pn-bar .pn-frame-controls button:hover{background:rgba(255,255,255,.09);color:#f3efe4;}
        .pn-bar .pn-frame-controls button[aria-pressed="true"]{background:#493027;color:#ffd5c5;}
        .pn-frame-width{color:inherit;opacity:.66;font:9px/1 ui-monospace,SFMono-Regular,Menlo,monospace;font-variant-numeric:tabular-nums;}
        .pn-zoom-controls{display:flex;align-items:center;overflow:hidden;border-radius:999px;background:#2b2b28;}
        .pn-bar .pn-zoom-controls button{display:grid;place-items:center;width:28px;height:28px;padding:0;background:transparent;border-radius:999px;font-size:15px;}
        .pn-bar .pn-zoom-controls button:hover{background:rgba(255,255,255,.09);}
        .pn-bar .pn-zoom-controls button:disabled{opacity:.35;cursor:default;}
        .pn-zoom-value{min-width:42px;color:#cfd1cb;text-align:center;font:10px/1 ui-monospace,SFMono-Regular,Menlo,monospace;font-variant-numeric:tabular-nums;}
        .pn-meta{font:11px/1.3 ui-sans-serif,system-ui,sans-serif;color:#cfd4c8;padding-right:4px;max-width:220px;}
        @keyframes pn-spin{to{rotate:360deg;}}
        @media (prefers-reduced-motion:reduce){#${ROOT_ID} *,#${ROOT_ID} *::before,#${ROOT_ID} *::after{animation:none!important;transition-duration:.01ms!important;}}
      `}</style>
      {on && showLayers && (
        <FloatingPanel
          title={leftPanelTab === "layers" ? "Layers" : "Components"}
          meta={
            leftPanelTab === "layers"
              ? normalizedLayerQuery
                ? `${filteredLayers.length + filteredCanvasInstances.length}/${layers.length + canvasInstances.length}`
                : String(layers.length + canvasInstances.length)
              : normalizedComponentQuery
                ? `${filteredComponents.length}/${Object.keys(componentRegistry).length}`
                : String(Object.keys(componentRegistry).length)
          }
          className="pn-layers"
          initialSide="left"
          dockSide="left"
          initialTop={36}
          initialWidth={240}
          initialHeight={520}
          minWidth={180}
          minHeight={180}
          onDismiss={() => setShowLayers(false)}
        >
          <div className="pn-panel-tabs" role="tablist" aria-label="Left panel">
            <button
              type="button"
              role="tab"
              aria-selected={leftPanelTab === "layers"}
              onClick={() => setLeftPanelTab("layers")}
            >
              Layers
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={leftPanelTab === "components"}
              onClick={() => setLeftPanelTab("components")}
            >
              Components
            </button>
          </div>
          <label className="pn-layer-search">
            <LayerIcon type="search" />
            <input
              type="search"
              aria-label={`Search ${leftPanelTab}`}
              placeholder={`Search ${leftPanelTab}`}
              value={leftPanelTab === "layers" ? layerQuery : componentQuery}
              onChange={(event) =>
                leftPanelTab === "layers"
                  ? setLayerQuery(event.target.value)
                  : setComponentQuery(event.target.value)
              }
            />
          </label>
          {leftPanelTab === "layers" ? (
          <div className="pn-layers-list" role="tabpanel">
            {(!normalizedLayerQuery || filteredCanvasInstances.length > 0) && (
              <>
                <div className="pn-layer-row pn-canvas-group">
                  <span className="pn-layer-indent" style={{ marginLeft: 6 }}>
                    <button
                      type="button"
                      className="pn-layer-disclosure"
                      aria-label={`${collapsedLayers.has("canvas") ? "Expand" : "Collapse"} Canvas`}
                      aria-expanded={!collapsedLayers.has("canvas")}
                      onClick={() =>
                        setCollapsedLayers((current) => {
                          const next = new Set(current);
                          if (next.has("canvas")) next.delete("canvas");
                          else next.add("canvas");
                          return next;
                        })
                      }
                    >
                      <DisclosureIcon collapsed={collapsedLayers.has("canvas")} />
                    </button>
                    <span className="pn-layer" title="Detached canvas components">
                      Canvas · {canvasInstances.length}
                    </span>
                  </span>
                </div>
                {filteredCanvasInstances.map((instance) => (
                  <div
                    className={`pn-layer-row pn-canvas-layer${selectedCanvasInstanceId === instance.id ? " is-selected" : ""}`}
                    key={`canvas-${instance.id}`}
                  >
                    <span
                      className="pn-layer-indent"
                      style={{ marginLeft: 18 }}
                    >
                      <span className="pn-layer-leading-icon">
                        <CanvasInstanceIcon />
                      </span>
                      <button
                        type="button"
                        className="pn-layer"
                        title={instance.id}
                        onClick={() => {
                          setSelectedCanvasInstanceId(instance.id);
                          selectElements([]);
                        }}
                      >
                        {componentRegistry[instance.componentId].name} · {instance.id}
                      </button>
                    </span>
                    <span className="pn-layer-actions">
                      <button
                        type="button"
                        className="pn-layer-action"
                        aria-label={`Delete ${instance.id}`}
                        title="Delete canvas component"
                        onClick={() => {
                          writeComponentLayout(
                            removePixleCanvasInstance(
                              componentLayoutRef.current,
                              pageKey(),
                              instance.id,
                            ),
                            undefined,
                            false,
                          );
                          if (selectedCanvasInstanceId === instance.id) {
                            setSelectedCanvasInstanceId(null);
                          }
                        }}
                      >
                        <TrashIcon />
                      </button>
                    </span>
                  </div>
                ))}
              </>
            )}
            {filteredLayers.map((layer, index) => {
              const layerRule = ruleFor(store, layer.el, renderPreset);
              const visible = layerRule.visible !== false;
              const locked = layerRule.locked === true;
              const deleted = layerRule.deleted === true;
              const deletedByParent =
                !deleted &&
                isElementDeleted(store, layer.el, renderPreset);
              return (
                <div
                  className={`pn-layer-row${selectedElements.includes(layer.el) ? " is-selected" : ""}${visible ? "" : " is-hidden"}${deleted || deletedByParent ? " is-deleted" : ""}`}
                  key={
                    layer.instanceId ??
                    (layer.slotType
                      ? `slot-${layer.slotId}`
                      : `${layer.name}-${index}`)
                  }
                  draggable={Boolean(layer.instanceId && layer.componentId && layer.slotId)}
                  onDragStart={(event) => {
                    if (!layer.instanceId || !layer.componentId || !layer.slotId) {
                      event.preventDefault();
                      return;
                    }
                    componentDragRef.current = {
                      kind: "instance",
                      instanceId: layer.instanceId,
                      componentId: layer.componentId,
                      fromSlotId: layer.slotId,
                    };
                    showCompatibleDropSlots(layer.componentId);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData(
                      "application/x-pixle-instance",
                      JSON.stringify({
                        instanceId: layer.instanceId,
                        componentId: layer.componentId,
                        fromSlotId: layer.slotId,
                      }),
                    );
                  }}
                  onDragEnd={() => {
                    componentDragRef.current = null;
                    clearComponentDropChrome();
                  }}
                  onDragOver={(event) => {
                    const activeDrag = componentDragRef.current;
                    if (layer.slotId && activeDrag) {
                      const slotElement = layer.slotType
                        ? layer.el
                        : surfaceDocument().querySelector(
                            `[data-pixle-slot-id="${CSS.escape(layer.slotId)}"][data-pixle-slot-type]`,
                          );
                      const accepted = (
                        slotElement?.getAttribute("data-pixle-slot-accepts") ?? ""
                      )
                        .split(",")
                        .includes(activeDrag.componentId);
                      if (!accepted) return;
                      event.preventDefault();
                      event.dataTransfer.dropEffect =
                        activeDrag.kind === "component" ? "copy" : "move";
                      document
                        .querySelectorAll("[data-pixle-layer-drop]")
                        .forEach((row) =>
                          row.removeAttribute("data-pixle-layer-drop"),
                        );
                      const rect = event.currentTarget.getBoundingClientRect();
                      event.currentTarget.setAttribute(
                        "data-pixle-layer-drop",
                        layer.slotType
                          ? "inside"
                          : event.clientY > rect.top + rect.height / 2
                            ? "after"
                            : "before",
                      );
                    }
                  }}
                  onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      event.currentTarget.removeAttribute("data-pixle-layer-drop");
                    }
                  }}
                  onDrop={(event) => {
                    if (!layer.slotId) return;
                    const activeDrag = componentDragRef.current;
                    const slotElement = layer.slotType
                      ? layer.el
                      : surfaceDocument().querySelector(
                          `[data-pixle-slot-id="${CSS.escape(layer.slotId)}"][data-pixle-slot-type]`,
                        );
                    const accepted =
                      activeDrag &&
                      (slotElement?.getAttribute("data-pixle-slot-accepts") ?? "")
                        .split(",")
                        .includes(activeDrag.componentId);
                    if (!activeDrag || !accepted) return;
                    if (activeDrag.kind === "component") {
                      event.preventDefault();
                      const instance = createPixleInstance(activeDrag.componentId);
                      writeComponentLayout(
                        insertPixleInstance(
                          componentLayoutRef.current,
                          pageKey(),
                          layer.slotId,
                          instance,
                        ),
                        instance.id,
                      );
                      componentDragRef.current = null;
                      clearComponentDropChrome();
                      return;
                    }
                    const payload = event.dataTransfer.getData(
                      "application/x-pixle-instance",
                    ) || JSON.stringify(activeDrag);
                    if (!payload) return;
                    try {
                      const parsed = JSON.parse(payload) as {
                        instanceId?: unknown;
                        fromSlotId?: unknown;
                        componentId?: unknown;
                      };
                      if (
                        typeof parsed.instanceId !== "string" ||
                        typeof parsed.fromSlotId !== "string" ||
                        !isPixleComponentId(parsed.componentId)
                      ) {
                        return;
                      }
                      if (!accepted) return;
                      event.preventDefault();
                      const slot =
                        readPixleLayout(pageKey(), componentLayoutRef.current)
                          .slots[layer.slotId] ?? [];
                      let toIndex = layer.instanceId
                        ? slot.findIndex(
                            (instance) => instance.id === layer.instanceId,
                          )
                        : slot.length;
                      if (
                        event.currentTarget.getAttribute("data-pixle-layer-drop") ===
                        "after"
                      ) {
                        toIndex += 1;
                      }
                      const fromIndex =
                        parsed.fromSlotId === layer.slotId
                          ? slot.findIndex(
                              (instance) => instance.id === parsed.instanceId,
                            )
                          : -1;
                      if (fromIndex >= 0 && fromIndex < toIndex) toIndex -= 1;
                      writeComponentLayout(
                        movePixleInstance(
                          componentLayoutRef.current,
                          pageKey(),
                          parsed.fromSlotId,
                          layer.slotId,
                          parsed.instanceId,
                          Math.max(0, toIndex),
                        ),
                        parsed.instanceId,
                      );
                      clearComponentDropChrome();
                    } catch {}
                  }}
                >
                  <span
                    className="pn-layer-indent"
                    style={{ marginLeft: 6 + Math.min(layer.depth, 9) * 12 }}
                  >
                    {layer.hasChildren ? (
                      <button
                        type="button"
                        className="pn-layer-disclosure"
                        aria-label={`${collapsedLayers.has(layer.key) ? "Expand" : "Collapse"} ${layer.name}`}
                        aria-expanded={!collapsedLayers.has(layer.key)}
                        onClick={() =>
                          setCollapsedLayers((current) => {
                            const next = new Set(current);
                            if (next.has(layer.key)) next.delete(layer.key);
                            else next.add(layer.key);
                            return next;
                          })
                        }
                      >
                        <DisclosureIcon collapsed={collapsedLayers.has(layer.key)} />
                      </button>
                    ) : (
                      <span className="pn-layer-disclosure-placeholder" />
                    )}
                    <button
                      type="button"
                      className="pn-layer"
                      aria-current={layer.el === sel}
                      disabled={deleted || deletedByParent}
                      title={
                        deletedByParent
                          ? `${layer.name} · deleted with parent`
                          : layer.name
                      }
                      onClick={(event) => {
                        if (!layer.el.isConnected) return;
                        if (event.shiftKey) {
                          const current = selectionRef.current;
                          selectElements(
                            current.includes(layer.el)
                              ? current.filter((item) => item !== layer.el)
                              : [...current, layer.el],
                          );
                        } else {
                          selectElements([layer.el]);
                        }
                        setHover(null);
                      }}
                    >
                      {layer.instanceId && layer.componentId && layer.slotId ? (
                        <span className="pn-layer-grip">
                          <DragHandleIcon />
                        </span>
                      ) : null}
                      {layer.name}
                    </button>
                  </span>
                  <span className="pn-layer-actions">
                    {deleted ? (
                      <button
                        type="button"
                        className="pn-layer-action pn-layer-restore"
                        aria-label={`Restore ${layer.name}`}
                        title="Restore deleted layer"
                        onClick={() => restoreElement(layer.el)}
                      >
                        <LayerIcon type="restore" />
                      </button>
                    ) : deletedByParent ? (
                      <span className="pn-layer-deleted-mark">Deleted</span>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="pn-layer-action"
                          aria-label={`${visible ? "Hide" : "Show"} ${layer.name}`}
                          aria-pressed={!visible}
                          title={visible ? "Hide layer" : "Show layer"}
                          onClick={() => toggleLayerVisibility(layer.el)}
                        >
                          <LayerIcon type={visible ? "visible" : "hidden"} />
                        </button>
                        <button
                          type="button"
                          className="pn-layer-action"
                          aria-label={`${locked ? "Unlock" : "Lock"} ${layer.name}`}
                          aria-pressed={locked}
                          title={locked ? "Unlock layer" : "Lock layer"}
                          onClick={() => toggleLayerLock(layer.el)}
                        >
                          <LayerIcon type={locked ? "locked" : "unlocked"} />
                        </button>
                      </>
                    )}
                  </span>
                </div>
              );
            })}
            {filteredLayers.length === 0 && filteredCanvasInstances.length === 0 && (
              <div className="pn-layers-empty">No layers match “{layerQuery}”.</div>
            )}
          </div>
          ) : (
            <div className="pn-component-list" role="tabpanel">
              {filteredComponents.map((definition) => (
                <button
                  type="button"
                  className="pn-component-card"
                  draggable
                  key={definition.componentId}
                  title={`Drag ${definition.name} into a compatible slot`}
                  onDragStart={(event) => {
                    componentDragRef.current = {
                      kind: "component",
                      componentId: definition.componentId,
                    };
                    showCompatibleDropSlots(definition.componentId);
                    event.dataTransfer.effectAllowed = "copy";
                    event.dataTransfer.setData(
                      "application/x-pixle-component",
                      definition.componentId,
                    );
                  }}
                  onDragEnd={() => {
                    componentDragRef.current = null;
                    clearComponentDropChrome();
                  }}
                >
                  <span
                    className={`pn-component-preview is-${definition.preview.kind}`}
                    aria-hidden="true"
                  />
                  <span className="pn-component-name">{definition.name}</span>
                  <span className="pn-component-description">
                    {definition.preview.description}
                  </span>
                  <span className="pn-component-source">
                    {definition.importPath}
                  </span>
                </button>
              ))}
              {filteredComponents.length === 0 && (
                <div className="pn-layers-empty">
                  No components match “{componentQuery}”.
                </div>
              )}
            </div>
          )}
        </FloatingPanel>
      )}
      {on && (
        <>
          <div className="pn-ruler-corner" aria-hidden="true" />
          <div
            className="pn-ruler pn-ruler-x"
            aria-hidden="true"
            style={{
              backgroundImage:
                "linear-gradient(90deg,rgba(20,18,14,.2) 1px,transparent 1px),linear-gradient(90deg,rgba(20,18,14,.42) 1px,transparent 1px)",
              backgroundSize: `${rulerMinorPx}px 100%,${rulerMajorPx}px 100%`,
              backgroundPositionX: `${canvasCamera.left - 24}px`,
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              endHistoryGroup();
              guideDrag.current = { axis: "y" };
              setGuideDraft({
                axis: "y",
                value: screenToCanvas({ x: e.clientX, y: e.clientY }).y,
              });
            }}
          >
            {xMarks.map((mark) => (
              <span
                className="pn-ruler-label-x"
                key={mark}
                style={{
                  left:
                    canvasCamera.left + mark * canvasCamera.zoom - 24,
                }}
              >
                {mark}
              </span>
            ))}
          </div>
          <div
            className="pn-ruler pn-ruler-y"
            aria-hidden="true"
            style={{
              backgroundImage:
                "linear-gradient(180deg,rgba(20,18,14,.2) 1px,transparent 1px),linear-gradient(180deg,rgba(20,18,14,.42) 1px,transparent 1px)",
              backgroundSize: `100% ${rulerMinorPx}px,100% ${rulerMajorPx}px`,
              backgroundPositionY: `${canvasCamera.top - 24}px`,
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              endHistoryGroup();
              guideDrag.current = { axis: "x" };
              setGuideDraft({
                axis: "x",
                value: screenToCanvas({ x: e.clientX, y: e.clientY }).x,
              });
            }}
          >
            {yMarks.map((mark) => (
              <span
                className="pn-ruler-label-y"
                key={mark}
                style={{
                  top: canvasCamera.top + mark * canvasCamera.zoom - 24,
                }}
              >
                {mark}
              </span>
            ))}
          </div>
          {sb && (
            <>
              <div
                className="pn-ruler-selection-x"
                aria-hidden="true"
                style={{ left: sb.left, width: sb.w }}
              />
              <div
                className="pn-ruler-selection-y"
                aria-hidden="true"
                style={{ top: sb.top, height: sb.h }}
              />
            </>
          )}
        </>
      )}
      {on &&
        activeGuides.x.map((value, index) => (
          <button
            type="button"
            className="pn-guide pn-guide-x"
            aria-label={`Vertical guide at ${value}px`}
            title="Drag to move · double-click to remove"
            key={`x-${index}-${value}`}
            style={{ left: canvasCamera.left + value * canvasCamera.zoom }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              endHistoryGroup();
              guideDrag.current = { axis: "x", index };
              setGuideDraft({ axis: "x", value });
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const current = guidesFor(storeRef.current);
              save(
                replaceGuides(storeRef.current, {
                  ...current,
                  x: current.x.filter((_, itemIndex) => itemIndex !== index),
                }),
                `guide-delete:x:${index}`,
              );
              endHistoryGroup();
            }}
          />
        ))}
      {on &&
        activeGuides.y.map((value, index) => (
          <button
            type="button"
            className="pn-guide pn-guide-y"
            aria-label={`Horizontal guide at ${value}px`}
            title="Drag to move · double-click to remove"
            key={`y-${index}-${value}`}
            style={{ top: canvasCamera.top + value * canvasCamera.zoom }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              endHistoryGroup();
              guideDrag.current = { axis: "y", index };
              setGuideDraft({ axis: "y", value });
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const current = guidesFor(storeRef.current);
              save(
                replaceGuides(storeRef.current, {
                  ...current,
                  y: current.y.filter((_, itemIndex) => itemIndex !== index),
                }),
                `guide-delete:y:${index}`,
              );
              endHistoryGroup();
            }}
          />
        ))}
      {on && guideDraft && (
        <div
          className={`pn-guide pn-guide-${guideDraft.axis} is-draft`}
          aria-hidden="true"
          style={
            guideDraft.axis === "x"
              ? {
                  left:
                    canvasCamera.left +
                    guideDraft.value * canvasCamera.zoom,
                  pointerEvents: "none",
                }
              : {
                  top:
                    canvasCamera.top +
                    guideDraft.value * canvasCamera.zoom,
                  pointerEvents: "none",
                }
          }
        />
      )}
      {on && <div ref={smartGuideLayerRef} className="pn-smart-guides" aria-hidden="true" />}
      {on && marqueeBox && (
        <div
          className="pn-marquee"
          aria-hidden="true"
          style={{
            top: marqueeBox.top,
            left: marqueeBox.left,
            width: marqueeBox.width,
            height: marqueeBox.height,
          }}
        />
      )}
      {on && hb && hover !== sel && (
        <div
          className="pn-frame"
          style={{
            top: hb.top,
            left: hb.left,
            width: hb.w,
            height: hb.h,
          }}
        />
      )}
      {on && isGroupSelection && groupBox && (
        <>
          {selectionBoxes.map(({ el, box: itemBox }, index) =>
            itemBox ? (
              <div
                className="pn-frame is-secondary"
                data-pn-selection-index={index}
                key={`selection-${uniqueSel(el)}-${index}`}
                style={{
                  top: itemBox.top,
                  left: itemBox.left,
                  width: itemBox.w,
                  height: itemBox.h,
                }}
              />
            ) : null,
          )}
          <div
            className="pn-frame is-group"
            style={{
              top: groupBox.top,
              left: groupBox.left,
              width: groupBox.width,
              height: groupBox.height,
            }}
          />
          {movableSelection.length > 0 &&
            RESIZE_DIRECTIONS.map((direction) => (
              <button
                type="button"
                className={`pn-handle is-group-handle ${direction}`}
                aria-label={`Resize selected group ${direction}`}
                title={`Resize group ${direction}`}
                key={`group-${direction}`}
                style={resizeHandlePosition(direction, {
                  top: groupBox.top,
                  left: groupBox.left,
                  w: groupBox.width,
                  h: groupBox.height,
                })}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  endHistoryGroup();
                  drag.current = null;
                  groupDrag.current = null;
                  resizeDrag.current = null;
                  const items = movableSelection.map((el) => ({
                    el,
                    base: ruleFor(storeRef.current, el, currentPreset()),
                    box: boxFor(el),
                  }));
                  groupResize.current = {
                    direction,
                    x0: e.clientX,
                    y0: e.clientY,
                    box: groupBox,
                    items,
                    snap: snapCandidatesFor(
                      connectedSelection,
                      storeRef.current,
                      currentPreset(),
                    ),
                  };
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
              />
            ))}
        </>
      )}
      {on && sb && sel && !selectionLocked && !isGroupSelection && (
        <>
          <div
            className="pn-frame is-sel"
            style={{
              top: sb.top,
              left: sb.left,
              width: sb.w,
              height: sb.h,
            }}
          />
          {RESIZE_DIRECTIONS.map((direction) => (
            <button
              type="button"
              className={`pn-handle ${direction}`}
              aria-label={`Resize selected element ${direction}`}
              title={`Resize ${direction}`}
              key={direction}
              style={resizeHandlePosition(direction, sb)}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                endHistoryGroup();
                drag.current = null;
                const rect = editorRectFor(sel);
                const base = {
                  ...ruleFor(storeRef.current, sel, currentPreset()),
                  width: round(rect.width / zoomRef.current),
                  height: round(rect.height / zoomRef.current),
                  scale: 1,
                };
                resizeDrag.current = {
                  el: sel,
                  direction,
                  x0: e.clientX,
                  y0: e.clientY,
                  width: rect.width / zoomRef.current,
                  height: rect.height / zoomRef.current,
                  left: rect.left,
                  top: rect.top,
                  x: base.x,
                  y: base.y,
                  base,
                  box: boxFor(sel),
                  snap: snapCandidatesFor(sel, storeRef.current, currentPreset()),
                };
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
            />
          ))}
        </>
      )}
      {on && showInspector && !sel && !selectedCanvasInstance && (
        <FloatingPanel
          title="Design"
          meta="No selection"
          className="pn-inspector"
          initialSide="right"
          dockSide="right"
          initialTop={36}
          initialWidth={292}
          initialHeight={520}
          minWidth={248}
          minHeight={240}
          onDismiss={() => setShowInspector(false)}
        >
          <div className="pn-inspector-empty">
            Select a layer on the stage or in Layers to inspect it.
          </div>
        </FloatingPanel>
      )}
      {on &&
        showInspector &&
        !sel &&
        selectedCanvasInstance &&
        selectedComponentDefinition &&
        selectedComponentValues && (
          <FloatingPanel
            title="Design"
            meta={`${selectedComponentDefinition.name} · canvas`}
            className="pn-inspector"
            initialSide="right"
            dockSide="right"
            initialTop={36}
            initialWidth={292}
            initialHeight={520}
            minWidth={248}
            minHeight={240}
            onDismiss={() => setShowInspector(false)}
          >
            <section className="pn-component-editor">
              <div
                className="pn-scope-tabs"
                role="group"
                aria-label="Component edit scope"
              >
                <button
                  type="button"
                  aria-pressed={componentEditScope === "instance"}
                  onClick={() => setComponentEditScope("instance")}
                >
                  Instance
                </button>
                <button
                  type="button"
                  aria-pressed={componentEditScope === "component"}
                  onClick={() => setComponentEditScope("component")}
                >
                  Component
                </button>
              </div>
              <p className="pn-component-editor-copy">
                {componentEditScope === "component"
                  ? `Updates every ${selectedComponentDefinition.name} without an instance override.`
                  : `Updates only ${selectedCanvasInstance.id}.`}
              </p>
              {selectedComponentDefinition.editableProps.map((control) => {
                const rawValue = selectedComponentValues.props[control.key];
                const value = rawValue == null ? "" : String(rawValue);
                return (
                  <div
                    className="pn-component-control"
                    key={`canvas-prop-${control.key}`}
                  >
                    <label htmlFor={`pn-canvas-prop-${control.key}`}>
                      {control.label}
                    </label>
                    {control.control === "select" ? (
                      <select
                        id={`pn-canvas-prop-${control.key}`}
                        value={value}
                        onChange={(event) =>
                          patchSelectedComponent(
                            "props",
                            control.key,
                            event.target.value || null,
                          )
                        }
                      >
                        {control.options?.map((option) => (
                          <option value={option.value} key={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={`pn-canvas-prop-${control.key}`}
                        type={
                          control.control === "number"
                            ? "number"
                            : control.control === "color"
                              ? "color"
                              : "text"
                        }
                        inputMode={control.control === "url" ? "url" : undefined}
                        value={value}
                        onChange={(event) =>
                          patchSelectedComponent(
                            "props",
                            control.key,
                            control.control === "number" &&
                              Number.isFinite(event.target.valueAsNumber)
                              ? event.target.valueAsNumber
                              : event.target.value,
                          )
                        }
                      />
                    )}
                  </div>
                );
              })}
              {selectedComponentDefinition.variantAxes.map((axis) => (
                <div
                  className="pn-component-control"
                  key={`canvas-variant-${axis.key}`}
                >
                  <label htmlFor={`pn-canvas-variant-${axis.key}`}>
                    {axis.label}
                  </label>
                  <select
                    id={`pn-canvas-variant-${axis.key}`}
                    value={
                      selectedComponentValues.variants[axis.key] ??
                      axis.defaultValue
                    }
                    onChange={(event) =>
                      patchSelectedComponent(
                        "variants",
                        axis.key,
                        event.target.value,
                      )
                    }
                  >
                    {axis.options.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <div className="pn-layout-status" role="status" aria-live="polite">
                {layoutStatus === "saving"
                  ? "Saving source…"
                  : layoutStatus === "saved"
                    ? "Source saved"
                    : layoutStatus === "err"
                      ? "Source save failed"
                      : "Source-backed"}
              </div>
            </section>
            <div className="pn-inspector-actions">
              <span>Detached from the page frame</span>
              <div className="pn-inspector-action-buttons">
                <button
                  type="button"
                  className="pn-delete-element"
                  onClick={deleteSelectedElements}
                >
                  Delete
                </button>
              </div>
            </div>
          </FloatingPanel>
        )}
      {on && showInspector && sel && sb && active && computed && (
        <FloatingPanel
          title="Design"
          meta={
            isGroupSelection
              ? `${connectedSelection.length} selected`
              : `${sel.tagName.toLowerCase()}${selectionLocked ? " · locked" : ""}`
          }
          className="pn-inspector"
          initialSide="right"
          dockSide="right"
          initialTop={36}
          initialWidth={292}
          initialHeight={520}
          minWidth={248}
          minHeight={240}
          onDismiss={() => setShowInspector(false)}
        >
          {selectedComponentDefinition && selectedComponentValues && !isGroupSelection && (
            <section className="pn-component-editor">
              <div className="pn-scope-tabs" role="group" aria-label="Component edit scope">
                <button
                  type="button"
                  aria-pressed={componentEditScope === "instance"}
                  onClick={() => setComponentEditScope("instance")}
                >
                  Instance
                </button>
                <button
                  type="button"
                  aria-pressed={componentEditScope === "component"}
                  onClick={() => setComponentEditScope("component")}
                >
                  Component
                </button>
              </div>
              <p className="pn-component-editor-copy">
                {componentEditScope === "component"
                  ? `Updates every ${selectedComponentDefinition.name} without an instance override.`
                  : `Updates only ${selectedInstanceId}.`}
              </p>
              {selectedComponentDefinition.editableProps.map((control) => {
                const rawValue = selectedComponentValues.props[control.key];
                const value = rawValue == null ? "" : String(rawValue);
                return (
                  <div className="pn-component-control" key={`prop-${control.key}`}>
                    <label htmlFor={`pn-component-prop-${control.key}`}>
                      {control.label}
                    </label>
                    {control.control === "select" ? (
                      <select
                        id={`pn-component-prop-${control.key}`}
                        value={value}
                        onChange={(event) =>
                          patchSelectedComponent("props", control.key, event.target.value || null)
                        }
                      >
                        {control.options?.map((option) => (
                          <option value={option.value} key={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={`pn-component-prop-${control.key}`}
                        type={control.control === "number" ? "number" : control.control === "color" ? "color" : "text"}
                        inputMode={control.control === "url" ? "url" : undefined}
                        value={value}
                        onChange={(event) =>
                          patchSelectedComponent(
                            "props",
                            control.key,
                            control.control === "number" && Number.isFinite(event.target.valueAsNumber)
                              ? event.target.valueAsNumber
                              : event.target.value,
                          )
                        }
                      />
                    )}
                  </div>
                );
              })}
              {selectedComponentDefinition.variantAxes.map((axis) => (
                <div className="pn-component-control" key={`variant-${axis.key}`}>
                  <label htmlFor={`pn-component-variant-${axis.key}`}>
                    {axis.label}
                  </label>
                  <select
                    id={`pn-component-variant-${axis.key}`}
                    value={selectedComponentValues.variants[axis.key] ?? axis.defaultValue}
                    onChange={(event) =>
                      patchSelectedComponent("variants", axis.key, event.target.value)
                    }
                  >
                    {axis.options.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <div className="pn-layout-status" role="status" aria-live="polite">
                {layoutStatus === "saving"
                  ? "Saving source…"
                  : layoutStatus === "saved"
                    ? "Source saved"
                    : layoutStatus === "err"
                      ? "Source save failed"
                      : "Source-backed"}
              </div>
            </section>
          )}
          {isGroupSelection && (
            <div className="pn-inspector-alert">
              Group selected. Canvas movement and resize apply to the group;
              style fields stay scoped to the primary layer.
            </div>
          )}
          {selectionLocked && !isGroupSelection && (
            <div className="pn-inspector-alert">
              This layer is locked. Unlock it in Layers to edit it.
            </div>
          )}
          <fieldset
            className="pn-inspector-fields"
            disabled={selectionLocked || isGroupSelection}
          >
          <section className="pn-section">
            <h2 className="pn-section-title">Layout</h2>
            <div className="pn-grid">
              <div className="pn-field">
                <label className="pn-field-label" htmlFor="pn-field-x">X</label>
                <input
                  id="pn-field-x"
                  aria-label="X position"
                  type="number"
                  step="1"
                  value={active.x}
                  onChange={(e) => {
                    if (Number.isFinite(e.target.valueAsNumber)) {
                      patchSelected({ x: e.target.valueAsNumber });
                    }
                  }}
                />
                <ResetControl
                  label="X position"
                  dirty={active.x !== 0}
                  onReset={() => resetSelectedProperties(["x"])}
                />
              </div>
              <div className="pn-field">
                <label className="pn-field-label" htmlFor="pn-field-y">Y</label>
                <input
                  id="pn-field-y"
                  aria-label="Y position"
                  type="number"
                  step="1"
                  value={active.y}
                  onChange={(e) => {
                    if (Number.isFinite(e.target.valueAsNumber)) {
                      patchSelected({ y: e.target.valueAsNumber });
                    }
                  }}
                />
                <ResetControl
                  label="Y position"
                  dirty={active.y !== 0}
                  onReset={() => resetSelectedProperties(["y"])}
                />
              </div>
              <div className="pn-field">
                <label className="pn-field-label" htmlFor="pn-field-width">W</label>
                <input
                  id="pn-field-width"
                  aria-label="Width"
                  type="number"
                  min="8"
                  step="1"
                  value={activeWidth}
                  onChange={(e) => {
                    if (Number.isFinite(e.target.valueAsNumber)) {
                      patchSelected({
                        width: clampDimension(e.target.valueAsNumber),
                      });
                    }
                  }}
                />
                <ResetControl
                  label="width"
                  dirty={active.width != null}
                  onReset={() => resetSelectedProperties(["width"])}
                />
              </div>
              <div className="pn-field">
                <label className="pn-field-label" htmlFor="pn-field-height">H</label>
                <input
                  id="pn-field-height"
                  aria-label="Height"
                  type="number"
                  min="8"
                  step="1"
                  value={activeHeight}
                  onChange={(e) => {
                    if (Number.isFinite(e.target.valueAsNumber)) {
                      patchSelected({
                        height: clampDimension(e.target.valueAsNumber),
                      });
                    }
                  }}
                />
                <ResetControl
                  label="height"
                  dirty={active.height != null}
                  onReset={() => resetSelectedProperties(["height"])}
                />
              </div>
            </div>
          </section>
          <section className="pn-section">
            <h2 className="pn-section-title">Colors</h2>
            <div className="pn-color-row">
              <ColorControl
                key={`${active.sel}-text`}
                label="Text"
                value={activeTextColor}
                dirty={active.color != null}
                onChange={(value) => patchSelected({ color: value })}
                onReset={() => resetSelectedProperties(["color"])}
              />
              <ColorControl
                key={`${active.sel}-fill`}
                label="Fill"
                value={activeFillColor}
                dirty={active.backgroundColor != null}
                onChange={(value) =>
                  patchSelected({ backgroundColor: value })
                }
                onReset={() => resetSelectedProperties(["backgroundColor"])}
              />
            </div>
          </section>
          <section className="pn-section">
            <h2 className="pn-section-title">Typography</h2>
            <div className="pn-grid">
              <div className="pn-field pn-wide">
                <label className="pn-field-label" htmlFor="pn-field-font">Font</label>
                <select
                  id="pn-field-font"
                  aria-label="Font family"
                  value={active.fontFamily ?? ""}
                  onChange={(e) =>
                    patchSelected({ fontFamily: e.target.value || null })
                  }
                >
                  <option value="">Current · {computed.fontFamily.split(",")[0]}</option>
                  <option value="system-ui">System UI</option>
                  <option value="Inter">Inter</option>
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="ui-monospace">Monospace</option>
                </select>
                <ResetControl
                  label="font family"
                  dirty={active.fontFamily != null}
                  onReset={() => resetSelectedProperties(["fontFamily"])}
                />
              </div>
              <div className="pn-field">
                <label className="pn-field-label" htmlFor="pn-field-font-size">Size</label>
                <input
                  id="pn-field-font-size"
                  aria-label="Font size"
                  type="number"
                  min="1"
                  step="1"
                  value={activeFontSize}
                  onChange={(e) => {
                    if (Number.isFinite(e.target.valueAsNumber)) {
                      patchSelected({ fontSize: Math.max(1, e.target.valueAsNumber) });
                    }
                  }}
                />
                <ResetControl
                  label="font size"
                  dirty={active.fontSize != null}
                  onReset={() => resetSelectedProperties(["fontSize"])}
                />
              </div>
              <div className="pn-field">
                <label className="pn-field-label" htmlFor="pn-field-font-weight">Weight</label>
                <select
                  id="pn-field-font-weight"
                  aria-label="Font weight"
                  value={activeFontWeight}
                  onChange={(e) =>
                    patchSelected({ fontWeight: Number(e.target.value) })
                  }
                >
                  <option value="300">Light</option>
                  <option value="400">Regular</option>
                  <option value="500">Medium</option>
                  <option value="600">Semibold</option>
                  <option value="700">Bold</option>
                  <option value="800">Extra bold</option>
                </select>
                <ResetControl
                  label="font weight"
                  dirty={active.fontWeight != null}
                  onReset={() => resetSelectedProperties(["fontWeight"])}
                />
              </div>
              <div className="pn-field">
                <label className="pn-field-label" htmlFor="pn-field-line-height">Line</label>
                <input
                  id="pn-field-line-height"
                  aria-label="Line height"
                  type="number"
                  min="1"
                  step="1"
                  value={activeLineHeight}
                  onChange={(e) => {
                    if (Number.isFinite(e.target.valueAsNumber)) {
                      patchSelected({ lineHeight: Math.max(1, e.target.valueAsNumber) });
                    }
                  }}
                />
                <ResetControl
                  label="line height"
                  dirty={active.lineHeight != null}
                  onReset={() => resetSelectedProperties(["lineHeight"])}
                />
              </div>
              <div className="pn-field">
                <label className="pn-field-label" htmlFor="pn-field-letter-spacing">Track</label>
                <input
                  id="pn-field-letter-spacing"
                  aria-label="Letter spacing"
                  type="number"
                  step="0.1"
                  value={activeLetterSpacing}
                  onChange={(e) => {
                    if (Number.isFinite(e.target.valueAsNumber)) {
                      patchSelected({ letterSpacing: e.target.valueAsNumber });
                    }
                  }}
                />
                <ResetControl
                  label="letter spacing"
                  dirty={active.letterSpacing != null}
                  onReset={() => resetSelectedProperties(["letterSpacing"])}
                />
              </div>
            </div>
          </section>
          </fieldset>
          <div className="pn-inspector-actions">
            <span>
              {isGroupSelection
                ? `${connectedSelection.length} selected`
                : selectedRuleCount === 0
                ? "No saved overrides"
                : `${selectedRuleCount} saved ${selectedRuleCount === 1 ? "rule" : "rules"}`}
            </span>
            <div className="pn-inspector-action-buttons">
              <button
                type="button"
                className="pn-reset-element"
                disabled={selectedRuleCount === 0 || isGroupSelection}
                title="Remove all saved overrides"
                onClick={resetSelectedElement}
              >
                Reset
              </button>
              <button
                type="button"
                className="pn-delete-element"
                disabled={isGroupSelection ? movableSelection.length === 0 : selectionLocked}
                title={
                  isGroupSelection
                    ? "Delete unlocked selected layers"
                    : selectionLocked
                      ? "Unlock the layer to delete it"
                      : "Delete element"
                }
                onClick={deleteSelectedElement}
              >
                Delete
              </button>
            </div>
          </div>
          <div className="pn-inspector-hint">
            {isGroupSelection
              ? "Shift-click to add or remove layers · drag the group"
              : "Drag rulers to add guides · drag handles to resize"}
            <br />
            Pinch to zoom · two-finger scroll or Space-drag to pan
            <br />
            Double-click text to edit · Delete removes · ⌘Z undo
          </div>
        </FloatingPanel>
      )}
      {textEdit && editorPosition && (
        <form
          className="pn-editor"
          style={editorPosition}
          onSubmit={(e) => {
            e.preventDefault();
            finishTextEdit(true);
          }}
        >
          <label htmlFor="pn-text-input">Text</label>
          <input
            id="pn-text-input"
            aria-label="Edit text"
            autoFocus
            value={textEdit.value}
            onChange={(e) => {
              const next = { ...textEdit, value: e.target.value };
              textEditRef.current = next;
              setTextEdit(next);
            }}
            onBlur={() => finishTextEdit(true)}
          />
          <button
            type="submit"
            onPointerDown={(e) => e.preventDefault()}
          >
            Save
          </button>
        </form>
      )}
      {process.env.NODE_ENV === "development" && (
        <div className="pn-dock">
          <div className="pn-bar">
            {on && sel && active && (
              <div className="pn-meta" role="status" aria-live="polite">
                {isGroupSelection
                  ? `${connectedSelection.length} layers selected`
                  : `${sel.tagName.toLowerCase()} · ${active.x}px,${active.y}px · ${activeWidth}×${activeHeight}`}
                {status === "saving"
                  ? " · saving"
                  : status === "saved"
                    ? " · saved"
                    : status === "err"
                      ? " · save failed"
                      : ""}
              </div>
            )}
            {on && (
              <>
                <div className="pn-frame-controls" role="group" aria-label="Design frame">
                  {VIEWPORT_OPTIONS.map(({ preset, label }) => (
                    <button
                      key={preset}
                      type="button"
                      aria-pressed={activePreset === preset}
                      aria-label={`${label} frame, ${VIEWPORT_FRAME_WIDTHS[preset]} pixels wide`}
                      title={`${label} frame · ${VIEWPORT_FRAME_WIDTHS[preset]}px`}
                      onClick={() => selectViewportPreset(preset)}
                    >
                      {label}
                      <span className="pn-frame-width">
                        {VIEWPORT_FRAME_WIDTHS[preset]}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="pn-zoom-controls" aria-label="Design zoom">
                  <button
                    type="button"
                    aria-label="Zoom out"
                    title="Zoom out · ⌘−"
                    disabled={zoom <= 0.25}
                    onClick={() => adjustZoom(-0.1)}
                  >
                    −
                  </button>
                  <span className="pn-zoom-value">{Math.round(zoom * 100)}%</span>
                  <button
                    type="button"
                    aria-label="Zoom in"
                    title="Zoom in · ⌘+"
                    disabled={zoom >= 2}
                    onClick={() => adjustZoom(0.1)}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  aria-pressed={showLayers}
                  onClick={() => setShowLayers((visible) => !visible)}
                >
                  Layers
                </button>
                <button
                  type="button"
                  aria-pressed={showInspector}
                  onClick={() => setShowInspector((visible) => !visible)}
                >
                  Inspect
                </button>
                <button
                  type="button"
                  disabled={exportStatus === "exporting"}
                  aria-busy={exportStatus === "exporting"}
                  aria-label={
                    exportStatus === "exporting"
                      ? "Exporting CSS to app/pixle-nudge.generated.css"
                      : exportStatus === "exported"
                        ? `Exported CSS to app/pixle-nudge.generated.css${
                            exportWarningCount > 0
                              ? ` with ${exportWarningCount} warning${
                                  exportWarningCount === 1 ? "" : "s"
                                }`
                              : ""
                          }`
                        : exportStatus === "failed"
                          ? "Export failed for app/pixle-nudge.generated.css"
                          : "Export current pathname CSS to app/pixle-nudge.generated.css"
                  }
                  title={
                    exportStatus === "exported"
                      ? `Exported to app/pixle-nudge.generated.css${
                          exportWarningCount > 0
                            ? ` · ${exportWarningCount} warning${
                                exportWarningCount === 1 ? "" : "s"
                              }`
                            : ""
                        }`
                      : exportStatus === "failed"
                        ? "Export failed · app/pixle-nudge.generated.css"
                        : "Write current pathname CSS to app/pixle-nudge.generated.css"
                  }
                  onClick={exportCss}
                >
                  {exportStatus === "exporting"
                    ? "Exporting…"
                    : exportStatus === "exported"
                      ? `Exported${
                          exportWarningCount > 0
                            ? ` · ${exportWarningCount} warning${
                                exportWarningCount === 1 ? "" : "s"
                              }`
                            : ""
                        }`
                      : exportStatus === "failed"
                        ? "Export failed"
                        : "Export CSS"}
                </button>
              </>
            )}
            <button
              type="button"
              className="pn-design-toggle"
              aria-pressed={on}
              onClick={() => {
                finishTextEdit(false);
                setOn((visible) => {
                  const next = !visible;
                  if (next) {
                    setShowLayers(true);
                    setShowInspector(true);
                  }
                  return next;
                });
                selectElements([]);
                setHover(null);
              }}
            >
              Design
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
