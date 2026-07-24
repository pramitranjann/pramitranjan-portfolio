function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React */

const NAVY = "#002840";
const MINT = "#27D8B2";
const ERR = "#DB2C4D";
const SUCCESS = "#30BC53";
const WARNING = "#FFC212";
/* DS motion — restrained fades, ease-in-out; no springs, no press-scale */
const EASE = "ease-in-out";
const DRAWER_EASE = "ease-in-out";

/* P1-8 — proposed extensions to design-system/colors_and_type.css (documented, not yet tokens):
   · CAT_COLORS — categorical ramp reusing DS status + brand tokens (the DS has no categorical
     palette); one ramp shared by field-type chips, option dots and member avatars. The member
     subset skips --warning (white initials fail contrast on it).
   · WARNING_FG #B5720B — readable amber text where --warning #FFC212 fails contrast on white.
   · --alfie-accent #2F6DF7 / --alfie-accent-fill #B3D3FF — Alfie AI accent pair (vivid blue,
     sampled from Pramit's reference). Accent carries sparkle/border/icon; fill is reserved for
     large non-text washes; chips and washes (nudge banner, accept bar) use rgba(47,109,247,.08).
     Replaces --info on Alfie surfaces only — info-cyan #03B2CB stays a categorical hue below.
   · Text on Alfie tint/fill surfaces uses --swipey-navy (ALFIE_INK) — blue-on-blue text failed
     Pramit's review twice (#2F6DF7 2.9:1 on fill, then #1D4ED8 "still off" perceptually at 6:1).
   · Dashed border on AI pills — deliberate "unconfirmed" affordance the DS lacks, paired with
     the sparkle icon so AI state never rides on color alone. */
const WARNING_FG = "#B5720B";
const CAT_COLORS = ["#03B2CB", SUCCESS, WARNING, ERR, MINT, NAVY];
const MEMBERS = ["TAN WEI LING", "Rajesh Nair", "Nurul Hakim", "Daniel Ong"];
const MEMBER_COLORS = [NAVY, "#03B2CB", SUCCESS, ERR];
const initialsOf = name => name.split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();

/* ───────────────── Alfie AI visual language ─────────────────
   AI accent = proposed --alfie-accent token pair (see extensions note above). */
const ALFIE = "#2F6DF7";
const ALFIE_FILL = "#B3D3FF";
const ALFIE_TINT = "rgba(47,109,247,.08)";
const ALFIE_INK = NAVY; /* label text on Alfie tint/fill — navy for contrast; blue identity lives in border/sparkle/badge */

const prefersReducedMotion = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

/* small sparkle — same star path as the alfie SNavIcon */
const Sparkle = ({
  size = 14,
  color = ALFIE,
  strokeWidth = 1.5
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: color,
  strokeWidth: strokeWidth,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  style: {
    flexShrink: 0
  }
}, /*#__PURE__*/React.createElement("path", {
  d: "M12 3l2.2 4.6L19 8.5l-3.5 3.4.8 4.9L12 14.6l-4.3 2.2.8-4.9L5 8.5l4.8-.9L12 3z"
}));

/* Suggestions Alfie offers (Feature 1). key doubles as the "assisted" tag on created columns. */
const ALFIE_FIELDS = [{
  key: "client",
  label: "Client",
  type: "dropdown",
  options: ["Acme Co", "TechNova", "Bright Labs"],
  why: "Common for marketing agencies",
  source: "recent similar transactions"
}, {
  key: "billable",
  label: "Billable?",
  type: "checkbox",
  options: [],
  why: "Seen on 12 receipts",
  source: "12 receipts"
}, {
  key: "campaign",
  label: "Campaign",
  type: "dropdown",
  options: ["Brand Refresh", "Q3 Launch", "Always-on"],
  why: "Matches your active campaigns",
  source: "your active campaigns"
}, {
  key: "gst",
  label: "GST Amount",
  type: "number",
  options: [],
  why: "Read from 12 receipts",
  source: "the receipt"
}, {
  key: "project",
  label: "Project",
  type: "dropdown",
  options: ["Falcon", "Atlas", "Orbit"],
  why: "Mentioned in 14 transaction notes",
  source: "your transaction notes"
}];
/* P2-8 — provenance shown in pill popover + accept bar; falls back gracefully when a field has no source */
const alfieSourceOf = key => (ALFIE_FIELDS.find(s => s.key === key) || {}).source || null;
const alfieFieldByKey = key => ALFIE_FIELDS.find(s => s.key === key) || null;

/* One extra dropdown option Alfie proposes per assisted dropdown field (Feature 4). */
const ALFIE_OPTION = {
  client: {
    value: "Bright Labs Sdn Bhd",
    why: "seen on 20 Jun receipt"
  },
  project: {
    value: "Zephyr",
    why: "mentioned in 3 recent notes"
  },
  campaign: {
    value: "Holiday Blitz",
    why: "seen on 5 receipts"
  }
};

/* Auto-fill strategies for assisted columns (Feature 2/3). Returns "" to skip a row.
   ci = running index across card rows only. */
const parseAmt = amt => parseFloat(String(amt).replace(/[^0-9.]/g, "")) || 0;
const AI_FILL = {
  gst: r => {
    const n = parseAmt(r.amt);
    return n > 0 ? (n * 0.06).toFixed(2) : "";
  },
  client: (r, ci) => ["Acme Co", "TechNova", "Bright Labs"][ci % 3],
  project: (r, ci) => ci < 8 ? ["Falcon", "Atlas", "Orbit"][ci % 3] : ""
};

/* slide-in helper (enter animation only) — double rAF: a single rAF can flip state
   before the first paint, so the hidden start frame never renders and the enter skips */
const useSlideIn = () => {
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => {
    let id2;
    const id = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setShown(true));
    });
    return () => {
      cancelAnimationFrame(id);
      if (id2) cancelAnimationFrame(id2);
    };
  }, []);
  return shown;
};

/* ponytail: press-scale removed per DS motion (fades only, no transforms);
   kept as a no-op so the ~60 call sites stay untouched. Delete with the sites if ever refactored. */
const press = {};

/* P2-10 — make a non-button interactive div behave like a button for keyboard/AT:
   role + tabIndex + Enter/Space activation. Spread alongside existing style/handlers. */
const activate = fn => ({
  role: "button",
  tabIndex: 0,
  onClick: fn,
  onKeyDown: e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn(e);
    }
  }
});

/* P2-10 — Escape-to-close + basic Tab focus trap for a drawer panel. Returns a ref for the panel. */
const useDrawerA11y = onClose => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const node = ref.current;
    /* [data-inert] marks the hidden pane of the unified field drawer — its controls stay mounted but leave the tab ring */
    const focusables = () => node ? Array.from(node.querySelectorAll('button, [href], input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])')).filter(el => !el.disabled && el.offsetParent !== null && !el.closest('[data-inert="true"]')) : [];
    if (node && !node.contains(document.activeElement)) {
      const f = focusables()[0];
      if (f) f.focus();
    }
    const onKey = e => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose && onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0],
        last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return ref;
};

/* ───────────────── Sidebar ───────────────── */

const SNavIcon = ({
  kind
}) => {
  const s = {
    width: 19,
    height: 19,
    stroke: "currentColor",
    fill: "none",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };
  switch (kind) {
    case "dashboard":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 24 24"
      }, s), /*#__PURE__*/React.createElement("rect", {
        x: "3",
        y: "3",
        width: "7",
        height: "9",
        rx: "1.5"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "14",
        y: "3",
        width: "7",
        height: "5",
        rx: "1.5"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "14",
        y: "12",
        width: "7",
        height: "9",
        rx: "1.5"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "3",
        y: "16",
        width: "7",
        height: "5",
        rx: "1.5"
      }));
    case "tasks":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 24 24"
      }, s), /*#__PURE__*/React.createElement("rect", {
        x: "4",
        y: "4",
        width: "16",
        height: "16",
        rx: "2.5"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M8 9.5l2 2 4-4"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M8 16h8"
      }));
    case "card":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 24 24"
      }, s), /*#__PURE__*/React.createElement("rect", {
        x: "3",
        y: "6",
        width: "18",
        height: "13",
        rx: "2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M3 10h18"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M7 15h4"
      }));
    case "payouts":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 24 24"
      }, s), /*#__PURE__*/React.createElement("path", {
        d: "M3 7h13a3 3 0 013 3v6a3 3 0 01-3 3H6a3 3 0 01-3-3V7z"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M3 7l3-3h10"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "16",
        cy: "13",
        r: "1.4",
        fill: "currentColor",
        stroke: "none"
      }));
    case "transactions":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 24 24"
      }, s), /*#__PURE__*/React.createElement("path", {
        d: "M4 7h13l-3-3"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M20 17H7l3 3"
      }));
    case "funds":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 24 24"
      }, s), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "9"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M12 7v10"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M15 9.5c-.6-.9-1.7-1.5-3-1.5-1.7 0-3 1-3 2.2 0 1.4 1.4 1.8 3 2.3 1.6.5 3 .9 3 2.3 0 1.2-1.3 2.2-3 2.2-1.3 0-2.4-.6-3-1.5"
      }));
    case "accounting":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 24 24"
      }, s), /*#__PURE__*/React.createElement("path", {
        d: "M5 4h11l3 3v13a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M9 11h6M9 15h6M9 7h3"
      }));
    case "insights":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 24 24"
      }, s), /*#__PURE__*/React.createElement("path", {
        d: "M3 3v18h18"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M7 15l4-5 3 3 5-7"
      }));
    case "alfie":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 24 24"
      }, s), /*#__PURE__*/React.createElement("path", {
        d: "M12 3l2.2 4.6L19 8.5l-3.5 3.4.8 4.9L12 14.6l-4.3 2.2.8-4.9L5 8.5l4.8-.9L12 3z"
      }));
    case "settings":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 24 24"
      }, s), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "3"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M19.4 12a7.4 7.4 0 00-.1-1.2l2.1-1.6-2-3.5-2.5 1a7 7 0 00-2-1.2L14.5 3h-4l-.4 2.5a7 7 0 00-2 1.2l-2.5-1-2 3.5L5.7 11a7.4 7.4 0 00-.1 1.2c0 .4 0 .8.1 1.2L3.6 15l2 3.5 2.5-1a7 7 0 002 1.2l.4 2.5h4l.4-2.5a7 7 0 002-1.2l2.5 1 2-3.5-2.1-1.6c.1-.4.1-.8.1-1.2z"
      }));
    case "chevron":
      return /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 24 24",
        width: "14",
        height: "14",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M9 18l6-6-6-6"
      }));
    default:
      return null;
  }
};
const NavRow = ({
  icon,
  label,
  active,
  sub,
  expandable,
  expanded
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 13,
    padding: sub ? "9px 18px 9px 46px" : "10px 18px",
    cursor: "pointer",
    borderLeft: `3px solid ${active ? MINT : "transparent"}`,
    paddingLeft: (sub ? 46 : 18) - (active ? 3 : 0),
    background: active ? "rgba(39,216,178,.16)" : "transparent",
    color: active ? MINT : "rgba(255,255,255,.82)",
    fontSize: 13.5,
    fontWeight: 500
  }
}, icon && /*#__PURE__*/React.createElement("span", {
  style: {
    width: 19,
    height: 19,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  }
}, /*#__PURE__*/React.createElement(SNavIcon, {
  kind: icon
})), /*#__PURE__*/React.createElement("span", {
  style: {
    flex: 1
  }
}, label), expandable && /*#__PURE__*/React.createElement("span", {
  style: {
    opacity: .6,
    transform: expanded ? "rotate(90deg)" : "none"
  }
}, /*#__PURE__*/React.createElement(SNavIcon, {
  kind: "chevron"
})));
const Sidebar = () => {
  const [expenseOpen] = React.useState(true);
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 231,
      background: NAVY,
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Quicksand, sans-serif",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px 18px 14px",
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: "50%",
      background: MINT,
      color: NAVY,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: 13
    }
  }, "MA"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 500,
      color: "rgba(255,255,255,.5)"
    }
  }, "Workspace"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14.5,
      color: "#fff",
      lineHeight: "19px",
      marginTop: 1
    }
  }, "Marketing Agency"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: "rgba(255,255,255,.5)",
      lineHeight: "14px"
    }
  }, "Switch workspace"))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: "rgba(255,255,255,.08)",
      margin: "0 18px 8px"
    }
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement(NavRow, {
    icon: "dashboard",
    label: "Dashboard"
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "tasks",
    label: "Tasks"
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "card",
    label: "Cards"
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "payouts",
    label: "Payouts"
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "transactions",
    label: "Transactions",
    active: true
  }), /*#__PURE__*/React.createElement(NavRow, {
    label: "Expense",
    sub: true,
    expandable: true,
    expanded: expenseOpen
  }), /*#__PURE__*/React.createElement(NavRow, {
    label: "Internal Transfers",
    sub: true
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "funds",
    label: "Funds"
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "accounting",
    label: "Accounting"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative"
    }
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "insights",
    label: "Biz Insights"
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "alfie",
    label: "Alfie AI"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "8px 14px 10px",
      background: "rgba(255,255,255,.06)",
      borderRadius: 14,
      padding: "10px 12px",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 7,
      right: 9,
      color: "rgba(255,255,255,.5)",
      fontSize: 14,
      cursor: "pointer",
      lineHeight: 1
    }
  }, "\xD7"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-block",
      fontSize: 10,
      fontWeight: 600,
      border: "1px solid rgba(39,216,178,.6)",
      color: MINT,
      padding: "2px 8px",
      borderRadius: 9999,
      marginBottom: 6
    }
  }, "Freemium"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: MINT,
      lineHeight: "16px"
    }
  }, "Upgrade plan"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "rgba(255,255,255,.6)",
      marginTop: 4,
      marginBottom: 10,
      lineHeight: 1.4
    }
  }, "Get additional cards and enable spend customisation"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: MINT,
      color: NAVY,
      border: "none",
      padding: "7px 14px",
      borderRadius: 8,
      fontFamily: "Poppins, sans-serif",
      fontSize: 11,
      fontWeight: 700,
      cursor: "pointer"
    }
  }, "View plans")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 13,
      padding: "12px 18px",
      cursor: "pointer",
      color: "rgba(255,255,255,.82)",
      fontSize: 13.5,
      fontWeight: 500,
      borderTop: "1px solid rgba(255,255,255,.08)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 19,
      height: 19,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(SNavIcon, {
    kind: "settings"
  })), "Settings"));
};

/* ───────────────── Header icons ───────────────── */

const HeaderIcon = ({
  kind
}) => {
  const s = {
    width: 22,
    height: 22,
    fill: "none",
    stroke: NAVY,
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };
  switch (kind) {
    case "help":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 24 24"
      }, s), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "12",
        r: "9"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M9.2 9.2a2.8 2.8 0 015.4 1c0 1.9-2.6 2-2.6 3.5"
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "17",
        r: ".6",
        fill: NAVY,
        stroke: "none"
      }));
    case "guide":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 24 24"
      }, s), /*#__PURE__*/React.createElement("path", {
        d: "M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5z"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M4 5.5v15"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M8 8h8M8 11.5h6"
      }));
    case "user":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 24 24"
      }, s), /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "8",
        r: "3.5"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M5 20c.7-3.6 3.5-5.5 7-5.5s6.3 1.9 7 5.5"
      }));
    case "logout":
      return /*#__PURE__*/React.createElement("svg", _extends({
        viewBox: "0 0 24 24"
      }, s), /*#__PURE__*/React.createElement("path", {
        d: "M14 4h4a1 1 0 011 1v14a1 1 0 01-1 1h-4"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M10 12H3m0 0l3.5-3.5M3 12l3.5 3.5"
      }));
    default:
      return null;
  }
};
const DownloadIcon = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  width: "22",
  height: "22",
  fill: "none",
  stroke: "#fff",
  strokeWidth: "1.5",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M12 3v11m0 0l-4-4m4 4l4-4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2"
}));
const SearchIcon = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  width: "18",
  height: "18",
  fill: "none",
  stroke: "#939393",
  strokeWidth: "1.5",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("circle", {
  cx: "11",
  cy: "11",
  r: "7"
}), /*#__PURE__*/React.createElement("path", {
  d: "M21 21l-4-4"
}));

/* ───────────────── Transaction-type + account icons ───────────────── */

const ExpenseIcon = () => /*#__PURE__*/React.createElement("span", {
  style: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: "#F2F2F2",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  }
}, /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  width: "13",
  height: "13",
  fill: "none",
  stroke: NAVY,
  strokeWidth: "1.5",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("circle", {
  cx: "11.5",
  cy: "13",
  r: "9"
}), /*#__PURE__*/React.createElement("path", {
  d: "M11.5 18V8"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14.4 9.8c-.6-.8-1.6-1.3-2.9-1.3-1.6 0-2.9.9-2.9 2.1 0 1.3 1.3 1.7 2.9 2.2 1.5.5 2.9.8 2.9 2.1 0 1.2-1.3 2.1-2.9 2.1-1.2 0-2.3-.5-2.9-1.3"
})));
const AccountTypeIcon = ({
  kind
}) => /*#__PURE__*/React.createElement("span", {
  style: {
    width: 20,
    height: 20,
    color: NAVY,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  }
}, kind === "card" ? /*#__PURE__*/React.createElement("svg", {
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("rect", {
  x: "2.5",
  y: "5.5",
  width: "19",
  height: "13",
  rx: "2"
}), /*#__PURE__*/React.createElement("line", {
  x1: "2.5",
  y1: "10",
  x2: "21.5",
  y2: "10"
})) : /*#__PURE__*/React.createElement("svg", {
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.5",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"
})));
const PaperclipIcon = () => /*#__PURE__*/React.createElement("svg", {
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "#CBCBCB",
  strokeWidth: "1.5",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M21 11l-8.5 8.5a5 5 0 01-7-7L14 4a3.5 3.5 0 014.9 4.9L10.4 17.4a2 2 0 01-2.8-2.8L15 7"
}));
const CommentIcon = () => /*#__PURE__*/React.createElement("svg", {
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "#CBCBCB",
  strokeWidth: "1.5",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M4 5h16a1 1 0 011 1v9a1 1 0 01-1 1H9l-4 3v-3H4a1 1 0 01-1-1V6a1 1 0 011-1z"
}));

/* ───────────────── Data ───────────────── */

const ROWS = [{
  date: "20 Jun 2026 | 08:12 PM",
  badge: "Declined",
  title: "Sample Merchant",
  acctType: "card",
  acct: "TAN WEI LING",
  acctSub: "Rajesh Mastercard ***8394",
  amt: "RM 265.20",
  amtSub: "USD 64.80",
  status: "Declined",
  reason: "PIN Validation not possible"
}, {
  date: "20 Jun 2026 | 08:12 PM",
  badge: "Declined",
  title: "Sample Merchant",
  acctType: "card",
  acct: "TAN WEI LING",
  acctSub: "Rajesh Mastercard ***8394",
  amt: "RM 101.00",
  amtSub: "USD 100.00",
  status: "Declined",
  reason: "Do Not Honor"
}, {
  date: "20 Jun 2026 | 08:12 PM",
  badge: "Expenses",
  title: "Sample Merchant",
  acctType: "card",
  acct: "TAN WEI LING",
  acctSub: "Rajesh Mastercard ***8394",
  amt: "RM 0.00",
  amtSub: "USD 0.00",
  status: "Success",
  approval: "pending"
}, {
  date: "19 Jun 2026 | 10:35 AM",
  badge: "Declined",
  title: "Demo Merchant KL",
  acctType: "card",
  acct: "TAN WEI LING",
  acctSub: "New Rajesh ***1547",
  amt: "RM 100.00",
  status: "Declined",
  reason: "Oops, merchant restricted b..."
}, {
  date: "19 Jun 2026 | 10:34 AM",
  badge: "Declined",
  title: "Corner Cafe KL",
  acctType: "card",
  acct: "TAN WEI LING",
  acctSub: "New Rajesh ***1547",
  amt: "RM 100.00",
  status: "Declined",
  reason: "Oops, merchant restricted b..."
}, {
  date: "19 Jun 2026 | 10:34 AM",
  badge: "Declined",
  title: "Corner Cafe KL",
  acctType: "card",
  acct: "TAN WEI LING",
  acctSub: "New Rajesh ***1547",
  amt: "RM 100.00",
  status: "Declined",
  reason: "Oops, merchant restricted b..."
}, {
  date: "19 Jun 2026 | 10:34 AM",
  badge: "Declined",
  title: "Corner Cafe KL",
  acctType: "card",
  acct: "TAN WEI LING",
  acctSub: "New Rajesh ***1547",
  amt: "RM 100.00",
  status: "Declined",
  reason: "Oops, merchant restricted b..."
}, {
  date: "19 Jun 2026 | 10:34 AM",
  badge: "Declined",
  title: "Corner Cafe KL",
  acctType: "card",
  acct: "TAN WEI LING",
  acctSub: "New Rajesh ***1547",
  amt: "RM 100.00",
  status: "Declined",
  reason: "Oops, merchant restricted b..."
}, {
  date: "19 Jun 2026 | 10:34 AM",
  badge: "Declined",
  title: "Corner Cafe KL",
  acctType: "card",
  acct: "TAN WEI LING",
  acctSub: "New Rajesh ***1547",
  amt: "RM 100.00",
  status: "Declined",
  reason: "Oops, merchant restricted b..."
}, {
  date: "19 Jun 2026 | 10:33 AM",
  badge: "Declined",
  title: "Corner Cafe KL",
  acctType: "card",
  acct: "TAN WEI LING",
  acctSub: "New Rajesh ***1547",
  amt: "RM 100.00",
  status: "Declined",
  reason: "Oops, merchant restricted b..."
}, {
  date: "19 Jun 2026 | 10:33 AM",
  badge: "Declined",
  title: "Corner Cafe KL",
  acctType: "card",
  acct: "TAN WEI LING",
  acctSub: "New Rajesh ***1547",
  amt: "RM 100.00",
  status: "Declined",
  reason: "Oops, merchant restricted b..."
}, {
  date: "19 Jun 2026 | 10:32 AM",
  badge: "Declined",
  title: "Corner Cafe KL",
  acctType: "card",
  acct: "TAN WEI LING",
  acctSub: "New Rajesh ***1547",
  amt: "RM 100.00",
  status: "Declined",
  reason: "Oops, merchant restricted b..."
}, {
  date: "19 Jun 2026 | 10:31 AM",
  badge: "Declined",
  title: "Corner Cafe KL",
  acctType: "card",
  acct: "TAN WEI LING",
  acctSub: "New Rajesh ***1547",
  amt: "RM 100.00",
  status: "Declined",
  reason: "Oops, merchant restricted b..."
}, {
  date: "04 Jun 2026 | 02:00 PM",
  badge: "CHARGES",
  title: null,
  acctType: "doc",
  acct: "00140100200168",
  acctSub: "Swipey Virtual Account",
  amt: "RM 12.50",
  status: "Success",
  approval: "pending"
}, {
  date: "01 Apr 2026 | 07:44 PM",
  badge: "Expenses",
  title: "Sample Merchant",
  acctType: "card",
  acct: "TAN WEI LING",
  acctSub: "Rajesh Mastercard ***8394",
  amt: "RM 0.00",
  amtSub: "USD 0.00",
  status: "Success",
  approval: "pending"
}, {
  date: "28 Mar 2026 | 03:21 PM",
  badge: "Expenses",
  title: "Grab Malaysia",
  acctType: "card",
  acct: "TAN WEI LING",
  acctSub: "Rajesh Mastercard ***8394",
  amt: "RM 38.40",
  status: "Success",
  approval: "pending"
}, {
  date: "27 Mar 2026 | 11:05 AM",
  badge: "Expenses",
  title: "Shopee Pay",
  acctType: "card",
  acct: "TAN WEI LING",
  acctSub: "New Rajesh ***1547",
  amt: "RM 220.00",
  status: "Success",
  approval: "pending"
}, {
  date: "26 Mar 2026 | 09:48 AM",
  badge: "CHARGES",
  title: null,
  acctType: "doc",
  acct: "00140100200168",
  acctSub: "Swipey Virtual Account",
  amt: "RM 5.00",
  status: "Success",
  approval: "pending"
}, {
  date: "25 Mar 2026 | 06:12 PM",
  badge: "Expenses",
  title: "Lazada Malaysia",
  acctType: "card",
  acct: "TAN WEI LING",
  acctSub: "Rajesh Mastercard ***8394",
  amt: "RM 149.90",
  status: "Success",
  approval: "pending"
}, {
  date: "28 Mar 2026 | 10:12 AM",
  badge: "Cashback",
  title: null,
  acctType: "doc",
  acct: "00140100200179",
  acctSub: "Swipey Virtual Account",
  amt: "RM 592.13",
  status: "Success",
  approval: "pending"
}, {
  date: "03 Jul 2023 | 03:50 PM",
  badge: "PAY_OUT",
  title: null,
  acctType: "doc",
  acct: "00140100200179",
  acctSub: "Swipey Virtual Account",
  amt: "RM 98,804.17",
  status: "Success",
  approval: "pending"
}];
const BADGE_STYLE = {
  Declined: {
    color: ERR
  },
  Expenses: {
    color: "#939393"
  },
  CHARGES: {
    color: NAVY
  },
  PAY_OUT: {
    color: NAVY
  },
  Cashback: {
    color: NAVY
  }
};
const SYSTEM_BADGES = ["CHARGES", "PAY_OUT", "Cashback"];
const CashbackIcon = () => /*#__PURE__*/React.createElement("span", {
  style: {
    width: 22,
    height: 22,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: NAVY
  }
}, /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  width: "20",
  height: "20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.5",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("rect", {
  x: "2",
  y: "6",
  width: "20",
  height: "12",
  rx: "2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M2 10h20"
}), /*#__PURE__*/React.createElement("path", {
  d: "M11 15h3"
}), /*#__PURE__*/React.createElement("path", {
  d: "M7 15l-2-2 2-2"
})));
const BASE_META = [{
  key: "date",
  label: "Date & Time"
}, {
  key: "details",
  label: "Transaction Details"
}, {
  key: "account",
  label: "Related Account"
}, {
  key: "documents",
  label: "Documents"
}, {
  key: "amount",
  label: "Amount"
}, {
  key: "status",
  label: "Status"
}, {
  key: "approval",
  label: "Approval"
}];
const COL_WIDTH = {
  date: "170px",
  details: "minmax(220px,1.3fr)",
  account: "minmax(220px,1.3fr)",
  documents: "100px",
  amount: "minmax(120px,140px)",
  status: "minmax(180px,1fr)",
  approval: "160px"
};
/* unified: widths follow the single ordered list; base uses fixed widths, custom flexes */
const buildCols = (visible, withSelect) => `${withSelect ? "40px " : ""}${visible.map(m => m.custom ? "minmax(150px,1fr)" : COL_WIDTH[m.key]).join(" ")} 52px`;

/* ───────────────── Field types ───────────────── */

/* chip colors come from CAT_COLORS — the shared on-palette categorical ramp (P1-8) */
const FIELD_TYPES = [{
  type: "text",
  label: "Text",
  color: "#03B2CB"
}, {
  type: "dropdown",
  label: "Dropdown",
  color: SUCCESS
}, {
  type: "number",
  label: "Number",
  color: ERR
}, {
  type: "date",
  label: "Date",
  color: WARNING
}, {
  type: "checkbox",
  label: "Checkbox",
  color: MINT
}, {
  type: "member",
  label: "Member",
  color: NAVY
}];
const typeLabelOf = type => (FIELD_TYPES.find(f => f.type === type) || {}).label || type;
const FieldTypeIcon = ({
  type,
  color,
  size = 18
}) => {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };
  let g;
  switch (type) {
    case "dropdown":
      g = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
        x: "3",
        y: "6",
        width: "18",
        height: "8",
        rx: "2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M8 18l4 3 4-3"
      }));
      break;
    case "number":
      g = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
        d: "M5 9h14M5 15h14M9 4l-2 16M17 4l-2 16"
      }));
      break;
    case "date":
      g = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
        x: "3",
        y: "4.5",
        width: "18",
        height: "16",
        rx: "2"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M3 9h18M8 3v3M16 3v3"
      }));
      break;
    case "checkbox":
      g = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
        x: "4",
        y: "4",
        width: "16",
        height: "16",
        rx: "3"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M8 12l3 3 5-6"
      }));
      break;
    case "member":
      g = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
        cx: "12",
        cy: "8",
        r: "3.5"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M5 20c.7-3.6 3.5-5.5 7-5.5s6.3 1.9 7 5.5"
      }));
      break;
    default:
      g = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
        d: "M5 6h14M12 6v13M9 19h6"
      }));
  }
  return /*#__PURE__*/React.createElement("span", {
    style: {
      color,
      display: "inline-flex",
      width: size + 2,
      justifyContent: "center",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", p, g));
};
const OPT_COLORS = CAT_COLORS; /* option dots share the categorical ramp (P1-8) */

/* ───────────────── Custom-column cell (click-to-edit) ───────────────── */

const CustomCell = ({
  col,
  value,
  onChange,
  suggested,
  onConfirm,
  suggestedOption,
  onAddOption,
  required
}) => {
  const [editing, setEditing] = React.useState(false); // input / option-list open
  const [aiMenu, setAiMenu] = React.useState(false); // Accept/Edit mini popover
  const src = col && col.alfie ? alfieSourceOf(col.alfie) : null; // P2-8 provenance
  const emptyRequired = required && !value && col.type !== "checkbox"; // P2-9 flag
  const reqDot = /*#__PURE__*/React.createElement("span", {
    title: "Required \u2014 needs a value",
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: WARNING,
      flexShrink: 0
    }
  });

  /* Accept/Edit popover shared by suggested textual + dropdown cells */
  const acceptEditPopover = onEdit => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: () => setAiMenu(false),
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 30
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "calc(100% + 6px)",
      left: 0,
      zIndex: 31,
      background: "#fff",
      borderRadius: 8,
      boxShadow: "0 8px 24px rgba(0,40,64,.08)",
      border: "1px solid #C0EEE4",
      padding: 12,
      minWidth: 196
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement(Sparkle, {
    size: 13
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 11,
      fontWeight: 600,
      color: ALFIE
    }
  }, "Suggested by Alfie")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 14,
      fontWeight: 600,
      color: NAVY,
      marginBottom: src ? 4 : 11,
      fontVariantNumeric: col.type === "number" ? "tabular-nums" : "normal"
    }
  }, value), src && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 11.5,
      color: "#939393",
      marginBottom: 11,
      lineHeight: 1.4
    }
  }, "From ", src), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", _extends({
    onClick: () => {
      setAiMenu(false);
      onConfirm && onConfirm();
    }
  }, press, {
    style: {
      flex: 1,
      background: NAVY,
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "8px 0",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer",
      transition: `transform .12s ${EASE}`
    }
  }), "Accept"), /*#__PURE__*/React.createElement("button", _extends({
    onClick: () => {
      setAiMenu(false);
      onEdit();
    }
  }, press, {
    style: {
      flex: 1,
      background: "#fff",
      color: "#4A4A4A",
      border: "1px solid #E7E7E7",
      borderRadius: 8,
      padding: "8px 0",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer",
      transition: `transform .12s ${EASE}`
    }
  }), "Edit"))));

  /* suggested textual (text/number/date) cell — info-tinted AI state until accepted/edited */
  if (suggested && (col.type === "text" || col.type === "number" || col.type === "date") && !editing) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement("div", _extends({}, activate(() => setAiMenu(true)), {
      title: "Suggested by Alfie" + (src ? " — from " + src : ""),
      "aria-label": "Alfie suggested " + value + (src ? ", from " + src : ""),
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        cursor: "pointer",
        background: ALFIE_TINT,
        border: `1px dashed ${ALFIE}`,
        borderRadius: 8,
        padding: "5px 10px",
        fontFamily: "Quicksand, sans-serif",
        fontSize: 13,
        fontWeight: 500
      }
    }), /*#__PURE__*/React.createElement(Sparkle, {
      size: 12
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#1F1F1F",
        opacity: .8,
        fontVariantNumeric: col.type === "number" ? "tabular-nums" : "normal"
      }
    }, value)), aiMenu && acceptEditPopover(() => setEditing(true)));
  }
  if (col.type === "checkbox") {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement("button", _extends({
      onClick: () => onChange(!value),
      role: "switch",
      "aria-checked": !!value,
      "aria-label": col.label || "Checkbox",
      style: {
        width: 20,
        height: 20,
        borderRadius: 6,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: value ? "none" : "1.5px solid #BDBCBC",
        background: value ? MINT : "#fff",
        transition: `background .15s ${EASE}, transform .12s ${EASE}`
      }
    }, press), value && /*#__PURE__*/React.createElement("svg", {
      width: "13",
      height: "13",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "3",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M20 6L9 17l-5-5"
    }))));
  }
  if (col.type === "text" || col.type === "number" || col.type === "date") {
    const inputType = col.type === "number" ? "number" : col.type === "date" ? "date" : "text";
    const placeholder = col.type === "number" ? "Add number" : col.type === "date" ? "Add date" : "Add text";
    return editing ? /*#__PURE__*/React.createElement("input", {
      autoFocus: true,
      type: inputType,
      defaultValue: value || "",
      onBlur: e => {
        onChange(e.target.value);
        setEditing(false);
      },
      onKeyDown: e => {
        if (e.key === "Enter") {
          onChange(e.target.value);
          setEditing(false);
        }
        if (e.key === "Escape") setEditing(false);
      },
      style: {
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid " + MINT,
        borderRadius: 6,
        padding: "6px 8px",
        fontFamily: "Poppins, sans-serif",
        fontSize: 13,
        color: "#1F1F1F",
        outline: "none"
      }
    }) : /*#__PURE__*/React.createElement("div", _extends({}, activate(() => setEditing(true)), {
      title: emptyRequired ? "Required — needs a value" : undefined,
      style: {
        cursor: "text",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "Quicksand, sans-serif",
        fontSize: 13,
        color: value ? "#1F1F1F" : emptyRequired ? WARNING_FG : "#CBCBCB",
        padding: "6px 4px",
        borderRadius: 6,
        minHeight: 18,
        fontVariantNumeric: col.type === "number" ? "tabular-nums" : "normal"
      }
    }), emptyRequired && reqDot, value || (emptyRequired ? "Required" : placeholder));
  }

  /* dropdown + member share the popover pattern */
  const isMember = col.type === "member";
  const opts = isMember ? MEMBERS : col.options || [];
  const dotFor = (o, i) => {
    if (isMember) {
      return /*#__PURE__*/React.createElement("span", {
        style: {
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: MEMBER_COLORS[i % MEMBER_COLORS.length],
          color: "#fff",
          fontSize: 9,
          fontWeight: 700,
          fontFamily: "Quicksand, sans-serif",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }
      }, initialsOf(o));
    }
    return /*#__PURE__*/React.createElement("span", {
      style: {
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: OPT_COLORS[i % OPT_COLORS.length],
        flexShrink: 0
      }
    });
  };
  const selIdx = opts.indexOf(value);
  const suggestedTrigger = /*#__PURE__*/React.createElement("div", _extends({}, activate(() => setAiMenu(true)), {
    title: "Suggested by Alfie" + (src ? " — from " + src : ""),
    "aria-label": "Alfie suggested " + value + (src ? ", from " + src : ""),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      cursor: "pointer",
      background: ALFIE_TINT,
      border: `1px dashed ${ALFIE}`,
      borderRadius: 9999,
      padding: "4px 11px",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 12.5,
      fontWeight: 600,
      color: "#1F1F1F"
    }
  }), /*#__PURE__*/React.createElement(Sparkle, {
    size: 12
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .8
    }
  }, value));
  const trigger = suggested ? suggestedTrigger : isMember && value ? /*#__PURE__*/React.createElement("div", _extends({}, activate(() => setEditing(o => !o)), {
    "aria-label": col.label + ": " + value,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      cursor: "pointer",
      background: "rgba(39,216,178,.12)",
      borderRadius: 9999,
      padding: "4px 11px 4px 4px",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 12.5,
      fontWeight: 600,
      color: NAVY
    }
  }), dotFor(value, selIdx < 0 ? 0 : selIdx), " ", value) : /*#__PURE__*/React.createElement("div", _extends({}, activate(() => setEditing(o => !o)), {
    title: emptyRequired ? "Required — needs a value" : undefined,
    "aria-label": (col.label || "") + (value ? ": " + value : emptyRequired ? ": required, empty" : ": empty"),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      cursor: "pointer",
      background: value ? "rgba(39,216,178,.14)" : "#F2F2F2",
      color: value ? NAVY : emptyRequired ? WARNING_FG : "#939393",
      boxShadow: emptyRequired ? "inset 0 0 0 1px rgba(255,194,18,.8)" : "none",
      borderRadius: 9999,
      padding: "5px 11px",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 12.5,
      fontWeight: 600
    }
  }), value && !isMember && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: "50%",
      background: OPT_COLORS[(selIdx < 0 ? 0 : selIdx) % OPT_COLORS.length],
      flexShrink: 0
    }
  }), !value && emptyRequired && reqDot, value || (isMember ? "Assign" : emptyRequired ? "Required" : "Select"), /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 9l6 6 6-6"
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, trigger, aiMenu && acceptEditPopover(() => {
    setAiMenu(false);
    setEditing(true);
  }), editing && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: () => setEditing(false),
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 30
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "calc(100% + 6px)",
      left: 0,
      zIndex: 31,
      background: "#fff",
      borderRadius: 8,
      boxShadow: "0 8px 24px rgba(0,40,64,.08)",
      border: "1px solid #C0EEE4",
      padding: 6,
      minWidth: 196
    }
  }, opts.map((o, i) => /*#__PURE__*/React.createElement("div", _extends({
    key: o
  }, activate(() => {
    onChange(o === value ? "" : o);
    setEditing(false);
  }), {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      padding: "8px 10px",
      borderRadius: 8,
      cursor: "pointer",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 13,
      color: "#1F1F1F",
      background: o === value ? "rgba(39,216,178,.12)" : "transparent"
    },
    onMouseEnter: e => e.currentTarget.style.background = "#F8F8F8",
    onMouseLeave: e => e.currentTarget.style.background = o === value ? "rgba(39,216,178,.12)" : "transparent"
  }), dotFor(o, i), " ", o)), opts.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 10px",
      color: "#CBCBCB",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 13
    }
  }, "No options."), suggestedOption && /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid #C0EEE4",
      marginTop: 6,
      paddingTop: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "2px 10px 5px"
    }
  }, /*#__PURE__*/React.createElement(Sparkle, {
    size: 12
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 11,
      fontWeight: 600,
      color: ALFIE
    }
  }, "Suggested by Alfie")), /*#__PURE__*/React.createElement("div", _extends({}, activate(() => {
    onAddOption && onAddOption(suggestedOption.value);
    setEditing(false);
  }), {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      padding: "8px 10px",
      borderRadius: 8,
      cursor: "pointer",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 13,
      color: NAVY,
      background: ALFIE_TINT
    },
    onMouseEnter: e => e.currentTarget.style.background = "rgba(47,109,247,.18)",
    onMouseLeave: e => e.currentTarget.style.background = ALFIE_TINT
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      borderRadius: "50%",
      background: ALFIE,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, suggestedOption.value), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      fontSize: 11,
      color: "#939393",
      whiteSpace: "nowrap"
    }
  }, suggestedOption.why))))));
};

/* ───────────────── Toggle ───────────────── */

const ToggleSwitch = ({
  on,
  onClick,
  label
}) => /*#__PURE__*/React.createElement("button", {
  onClick: onClick,
  role: "switch",
  "aria-checked": !!on,
  "aria-label": label,
  style: {
    width: 40,
    height: 23,
    borderRadius: 9999,
    border: "none",
    cursor: "pointer",
    background: on ? MINT : "#CBCBCB",
    position: "relative",
    transition: `background .15s ${EASE}`,
    flexShrink: 0
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    position: "absolute",
    top: 2.5,
    left: on ? 19 : 2.5,
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "#fff",
    transition: `left .15s ${EASE}`,
    boxShadow: "0 1px 2px rgba(0,0,0,.07)"
  }
}));

/* ───────────────── Column header (click-to-edit) ───────────────── */

/* brief one-shot highlight on a freshly created column header — opacity fade only */
const FieldFlash = () => {
  const [on, setOn] = React.useState(true);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setOn(false)));
    return () => cancelAnimationFrame(id);
  }, []);
  return /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      position: "absolute",
      inset: -1,
      borderRadius: 6,
      background: "rgba(255,255,255,.65)",
      opacity: on ? 1 : 0,
      transition: `opacity 1.2s ${EASE}`,
      pointerEvents: "none",
      zIndex: 0
    }
  });
};
const ColumnHeader = ({
  meta,
  required,
  onEdit,
  flash,
  pendingCount = 0,
  onAcceptAll,
  onReopen
}) => {
  const [hover, setHover] = React.useState(false);
  const [menu, setMenu] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!flash || !ref.current || !ref.current.scrollIntoView) return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ref.current.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      inline: "center",
      block: "nearest"
    });
  }, [flash]);
  return /*#__PURE__*/React.createElement("div", _extends({
    ref: ref
  }, activate(onEdit), {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    title: "Edit " + meta.label,
    "aria-label": "Edit " + meta.label,
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      minWidth: 0,
      cursor: "pointer",
      background: hover ? "rgba(0,40,64,.10)" : "transparent",
      borderRadius: 6,
      padding: "5px 8px",
      margin: "-5px -8px",
      transition: "background .15s ease-in-out"
    }
  }), flash && /*#__PURE__*/React.createElement(FieldFlash, null), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      zIndex: 1,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, meta.label, required && /*#__PURE__*/React.createElement("span", null, " *")), pendingCount > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      zIndex: 2,
      marginLeft: 6,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", _extends({}, activate(e => {
    e.stopPropagation();
    setMenu(m => !m);
  }), {
    title: pendingCount + " Alfie suggestions to review",
    "aria-label": pendingCount + " Alfie suggestions to review"
  }, press, {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      background: "#fff",
      border: `1px solid ${ALFIE}`,
      borderRadius: 9999,
      padding: "1px 7px 1px 5px",
      cursor: "pointer",
      transition: `transform .12s ${EASE}`
    }
  }), /*#__PURE__*/React.createElement(Sparkle, {
    size: 11
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 11,
      fontWeight: 700,
      color: ALFIE,
      fontVariantNumeric: "tabular-nums"
    }
  }, pendingCount)), menu && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: e => {
      e.stopPropagation();
      setMenu(false);
    },
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 30
    }
  }), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: "absolute",
      top: "calc(100% + 8px)",
      right: 0,
      zIndex: 31,
      width: 214,
      background: "#fff",
      borderRadius: 8,
      boxShadow: "0 8px 24px rgba(0,40,64,.08)",
      border: "1px solid #C0EEE4",
      padding: 12,
      cursor: "default"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement(Sparkle, {
    size: 13
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 11,
      fontWeight: 600,
      color: ALFIE
    }
  }, "Suggested by Alfie")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 12.5,
      color: "#4A4A4A",
      marginBottom: 11,
      lineHeight: 1.4
    }
  }, pendingCount, " value", pendingCount === 1 ? "" : "s", " waiting in \u2018", meta.label, "\u2019"), /*#__PURE__*/React.createElement("button", _extends({
    onClick: e => {
      e.stopPropagation();
      setMenu(false);
      onAcceptAll && onAcceptAll();
    }
  }, press, {
    style: {
      width: "100%",
      background: NAVY,
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "9px 0",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer",
      transition: `transform .12s ${EASE}`
    }
  }), "Accept all"), /*#__PURE__*/React.createElement("button", _extends({
    onClick: e => {
      e.stopPropagation();
      setMenu(false);
      onReopen && onReopen();
    }
  }, press, {
    style: {
      width: "100%",
      marginTop: 8,
      background: "#fff",
      color: "#4A4A4A",
      border: "1px solid #E7E7E7",
      borderRadius: 8,
      padding: "9px 0",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer",
      transition: `transform .12s ${EASE}`
    }
  }), "Show accept bar")))));
};

/* ───────────────── Draining delete bar / toast ───────────────── */

const DrainBar = () => {
  const [w, setW] = React.useState(100);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setW(0));
    return () => cancelAnimationFrame(id);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 3,
      background: "rgba(219,44,77,.18)",
      borderRadius: 2,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: w + "%",
      background: ERR,
      transition: "width 5s linear"
    }
  }));
};
const PendingToasts = ({
  items,
  onUndo
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    position: "fixed",
    left: "50%",
    bottom: 26,
    transform: "translateX(-50%)",
    zIndex: 75,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    alignItems: "center",
    fontFamily: "Quicksand, sans-serif"
  }
}, items.map(m => /*#__PURE__*/React.createElement("div", {
  key: m.key,
  style: {
    minWidth: 320,
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 8px 24px rgba(0,40,64,.08)",
    border: "1px solid #C0EEE4",
    overflow: "hidden"
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "13px 16px"
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 14,
    fontWeight: 600,
    color: NAVY
  }
}, "Deleting \u201C", m.label, "\u201D"), /*#__PURE__*/React.createElement("button", _extends({
  onClick: () => onUndo(m.key)
}, press, {
  style: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: MINT,
    fontFamily: "Poppins, sans-serif",
    fontSize: 13,
    fontWeight: 700,
    transition: `transform .12s ${EASE}`
  }
}), "Undo")), /*#__PURE__*/React.createElement(DrainBar, null))));

/* ───────────────── Field Manager drawer ───────────────── */

const HandleIcon = () => /*#__PURE__*/React.createElement("svg", {
  width: "12",
  height: "18",
  viewBox: "0 0 12 18",
  fill: "currentColor"
}, /*#__PURE__*/React.createElement("circle", {
  cx: "3",
  cy: "3",
  r: "1.4"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "9",
  cy: "3",
  r: "1.4"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "3",
  cy: "9",
  r: "1.4"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "9",
  cy: "9",
  r: "1.4"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "3",
  cy: "15",
  r: "1.4"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "9",
  cy: "15",
  r: "1.4"
}));
const TrashIcon = () => /*#__PURE__*/React.createElement("svg", {
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.5",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"
}));
const LockIcon = ({
  size = 13,
  color = NAVY
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: color,
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  style: {
    flexShrink: 0
  }
}, /*#__PURE__*/React.createElement("rect", {
  x: "5",
  y: "11",
  width: "14",
  height: "9",
  rx: "2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M8 11V8a4 4 0 018 0v3"
}));
const closeSvg = /*#__PURE__*/React.createElement("svg", {
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M6 6l12 12M18 6 6 18"
}));
const iconBtn = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  background: "#F2F2F2",
  border: "none",
  cursor: "pointer",
  color: "#4A4A4A",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  transition: `transform .12s ${EASE}`
};
const ROW_GRID = "18px 1fr 58px 78px 24px";

/* Scroll affordance, top edge only — a 24px white scrim once scrolled down, so
   content visibly slides under the header. Pointer-transparent, opacity-only
   (kept under reduced motion — it's comprehension, not decoration). The bottom
   affordance is no longer a scrim: the drawer footer is a translucent overlay
   (footerOverlay) that below-fold content visibly ghosts beneath — a fade here
   would whiten the exact content that preview exists to show, so it's gone,
   along with the ResizeObserver that only the bottom edge needed.
   `style` lands on the scroll container (padding etc.). */
const ScrollFade = ({
  style,
  children
}) => {
  const [top, setTop] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      flex: 1,
      minHeight: 0,
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onScroll: e => setTop(e.currentTarget.scrollTop > 2),
    style: {
      overflowY: "auto",
      flex: 1,
      minWidth: 0,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", null, children)), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      height: 24,
      background: "linear-gradient(to bottom, #fff, rgba(255,255,255,0))",
      opacity: top ? 1 : 0,
      transition: `opacity .2s ${EASE}`,
      pointerEvents: "none"
    }
  }));
};

/* Drawer footer as a translucent overlay INSIDE the scroll region: absolutely
   positioned at the pane's bottom edge, so whenever content continues past the
   fold it stays physically visible — ghosted and cut off mid-element under the
   glass — instead of merely hinted by a gradient. Panes using it give their
   ScrollFade paddingBottom = FOOTER_CLEARANCE so the last control can always
   scroll clear of the footer. The footer itself keeps normal pointer-events
   (buttons stay clickable); the ghosted strip beneath is visual only since the
   overlay paints and hit-tests above it. */
/* ponytail: CSS.supports check once at module load — no @supports in inline styles */
const BLUR_OK = typeof CSS !== "undefined" && !!CSS.supports && (CSS.supports("backdrop-filter", "blur(8px)") || CSS.supports("-webkit-backdrop-filter", "blur(8px)"));
const footerOverlay = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1,
  background: BLUR_OK ? "rgba(255,255,255,.82)" : "rgba(255,255,255,.94)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  borderTop: "1px solid #C0EEE4"
};
const FOOTER_CLEARANCE = 96; /* tallest footer ≈ 75px + breathing room */

/* "Alfie suggests" as a dismissable card (Design Lab: "Dismissable suggests card").
   Dismiss fades the card out (300ms; instant under reduced motion) and hides it for the session. */
const AlfieSuggestsCard = ({
  heading,
  headingSize = 14,
  onDismiss,
  style,
  children
}) => {
  const [closing, setClosing] = React.useState(false);
  const dismiss = () => {
    if (prefersReducedMotion()) {
      onDismiss();
      return;
    }
    setClosing(true);
    setTimeout(onDismiss, 300);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      border: "1px solid rgba(47,109,247,.28)",
      borderRadius: 16,
      boxShadow: "0 0 2px rgba(47,109,247,.25)",
      padding: 14,
      opacity: closing ? 0 : 1,
      transition: `opacity .3s ${EASE}`,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Sparkle, {
    size: 15
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: headingSize,
      fontWeight: 700,
      color: ALFIE
    }
  }, heading), /*#__PURE__*/React.createElement("button", _extends({
    onClick: dismiss,
    "aria-label": "Dismiss Alfie suggestions",
    title: "Dismiss for this session"
  }, press, {
    style: {
      marginLeft: "auto",
      width: 24,
      height: 24,
      borderRadius: "50%",
      border: "none",
      background: "transparent",
      color: "#707070",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 6l12 12M18 6 6 18"
  })))), children);
};
const ManagerView = ({
  orderedAll,
  hidden,
  required,
  pending,
  onClose,
  onReorder,
  onToggleHidden,
  onToggleRequired,
  onEdit,
  onDeleteRequest,
  onUndo,
  onAddField,
  lab,
  suggestions,
  onPickSuggestion,
  suggestsDismissed,
  onDismissSuggests
}) => {
  const [armed, setArmed] = React.useState(null);
  const [dragKey, setDragKey] = React.useState(null);
  const keys = orderedAll.map(m => m.key);
  const onDragOver = (e, overKey) => {
    e.preventDefault();
    if (!dragKey || dragKey === overKey) return;
    const cur = keys.indexOf(dragKey);
    const tgt = keys.indexOf(overKey);
    if (cur < 0 || tgt < 0) return;
    const next = keys.slice();
    next.splice(cur, 1);
    next.splice(tgt, 0, dragKey);
    onReorder(next);
  };
  const endDrag = () => {
    setDragKey(null);
    setArmed(null);
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "20px 24px",
      borderBottom: "1px solid #C0EEE4"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 19,
      fontWeight: 700,
      color: NAVY
    }
  }, "Manage fields"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 12,
      color: "#939393",
      marginTop: 2
    }
  }, "Reorder, show/hide, and edit table columns")), /*#__PURE__*/React.createElement("button", _extends({
    onClick: onClose,
    "aria-label": "Close",
    style: iconBtn
  }, press), closeSvg)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      margin: "12px 24px 0",
      padding: "9px 12px",
      background: "rgba(39,216,178,.10)",
      border: "1px solid rgba(39,216,178,.28)",
      borderRadius: 8
    }
  }, /*#__PURE__*/React.createElement(LockIcon, null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 11.5,
      color: "#4A4A4A",
      lineHeight: 1.4
    }
  }, "Only admins can manage fields. You\u2019re an ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: NAVY
    }
  }, "Admin"), ".")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: ROW_GRID,
      gap: 12,
      alignItems: "center",
      padding: "10px 24px 6px",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 12,
      fontWeight: 500,
      color: "#939393"
    }
  }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null, "Field"), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: "center"
    }
  }, "Show"), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: "center"
    }
  }, "Required"), /*#__PURE__*/React.createElement("span", null)), /*#__PURE__*/React.createElement(ScrollFade, {
    style: {
      padding: `0 14px ${FOOTER_CLEARANCE}px`
    }
  }, orderedAll.map(m => {
    const isPending = pending.includes(m.key);
    const isDragged = dragKey === m.key;
    const common = {
      alignItems: "center",
      padding: "11px 10px",
      borderRadius: 8,
      marginTop: 4,
      background: isPending ? "rgba(219,44,77,.06)" : isDragged ? "#fff" : "transparent",
      boxShadow: isDragged ? "0 2px 4px rgba(0,0,0,.07)" : "none",
      borderTop: isDragged ? `2px solid ${MINT}` : "2px solid transparent",
      transform: isDragged ? "scale(1.01)" : "none",
      transition: `background .15s ${EASE}, box-shadow .15s ${EASE}`
    };
    const label = /*#__PURE__*/React.createElement("div", _extends({}, isPending ? {} : activate(() => onEdit(m.key)), {
      title: isPending ? undefined : "Edit " + m.label,
      style: {
        minWidth: 0,
        cursor: isPending ? "default" : "pointer"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "Quicksand, sans-serif",
        fontSize: 13.5,
        fontWeight: 500,
        color: isPending ? ERR : "#1F1F1F",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, m.label), m.custom && !isPending && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "Quicksand, sans-serif",
        fontSize: 11.5,
        color: "#939393",
        marginTop: 1
      }
    }, "Custom \xB7 ", typeLabelOf(m.col.type)), m.custom && !isPending && m.col.desc && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "Quicksand, sans-serif",
        fontSize: 11,
        color: "#A4A4A4",
        marginTop: 1,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, m.col.desc), isPending && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 6,
        marginRight: 8
      }
    }, /*#__PURE__*/React.createElement(DrainBar, null)));
    if (isPending) {
      return /*#__PURE__*/React.createElement("div", {
        key: m.key,
        style: {
          ...common,
          display: "flex",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 18,
          flexShrink: 0
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, label), /*#__PURE__*/React.createElement("button", _extends({
        onClick: () => onUndo(m.key)
      }, press, {
        style: {
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: MINT,
          fontFamily: "Poppins, sans-serif",
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0,
          transition: `transform .12s ${EASE}`
        }
      }), "Undo"));
    }
    return /*#__PURE__*/React.createElement("div", {
      key: m.key,
      draggable: armed === m.key,
      onDragStart: e => {
        e.dataTransfer.setData("text/plain", m.key);
        e.dataTransfer.effectAllowed = "move";
        setDragKey(m.key);
      },
      onDragOver: e => onDragOver(e, m.key),
      onDragEnd: endDrag,
      style: {
        ...common,
        display: "grid",
        gridTemplateColumns: ROW_GRID,
        gap: 12
      },
      onMouseEnter: e => {
        if (!isDragged) e.currentTarget.style.background = "#F8F8F8";
      },
      onMouseLeave: e => {
        if (!isDragged) e.currentTarget.style.background = "transparent";
      }
    }, /*#__PURE__*/React.createElement("span", {
      onMouseDown: () => setArmed(m.key),
      onMouseUp: () => setArmed(null),
      style: {
        color: "#CBCBCB",
        cursor: "grab",
        display: "inline-flex",
        justifyContent: "center",
        flexShrink: 0,
        touchAction: "none"
      }
    }, /*#__PURE__*/React.createElement(HandleIcon, null)), label, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(ToggleSwitch, {
      on: !hidden.includes(m.key),
      onClick: () => onToggleHidden(m.key),
      label: "Show " + m.label
    })), m.custom ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(ToggleSwitch, {
      on: required.includes(m.key),
      onClick: () => onToggleRequired(m.key),
      label: "Required " + m.label
    })) : /*#__PURE__*/React.createElement("span", {
      title: "System field \u2014 always populated",
      style: {
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#CBCBCB",
        fontFamily: "Quicksand, sans-serif",
        fontSize: 16
      }
    }, "\u2014"), m.custom ? /*#__PURE__*/React.createElement("button", _extends({
      onClick: () => onDeleteRequest(m.key),
      "aria-label": "Delete field",
      title: "Delete field",
      style: {
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: ERR,
        display: "inline-flex",
        justifyContent: "center",
        padding: 0,
        transition: `transform .12s ${EASE}`
      }
    }, press), /*#__PURE__*/React.createElement(TrashIcon, null)) : /*#__PURE__*/React.createElement("span", {
      style: {
        width: 24
      }
    }));
  }), lab && lab.suggestedFields && suggestions && suggestions.length > 0 && (() => {
    const sugRows = suggestions.slice(0, 3).map(sug => /*#__PURE__*/React.createElement("div", _extends({
      key: sug.key
    }, activate(() => onPickSuggestion(sug)), {
      title: sug.why,
      "aria-label": "Add suggested field " + sug.label
    }, press, {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "11px 12px",
        marginTop: 6,
        borderRadius: 8,
        cursor: "pointer",
        background: ALFIE_TINT,
        border: "1px solid rgba(47,109,247,.22)",
        transition: `transform .12s ${EASE}, background .15s ${EASE}`
      },
      onMouseEnter: e => e.currentTarget.style.background = "rgba(47,109,247,.16)",
      onMouseLeave: e => e.currentTarget.style.background = ALFIE_TINT
    }), /*#__PURE__*/React.createElement(FieldTypeIcon, {
      type: sug.type,
      color: ALFIE,
      size: 18
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "Quicksand, sans-serif",
        fontSize: 13.5,
        fontWeight: 600,
        color: "#1F1F1F"
      }
    }, sug.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "Quicksand, sans-serif",
        fontSize: 11.5,
        color: "#939393",
        marginTop: 1
      }
    }, typeLabelOf(sug.type), " \xB7 ", sug.why)), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        width: 26,
        height: 26,
        borderRadius: "50%",
        background: "#fff",
        alignItems: "center",
        justifyContent: "center",
        color: ALFIE,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.4",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M12 5v14M5 12h14"
    })))));
    /* Design Lab "Dismissable suggests card": card presentation (default) vs legacy inline */
    return lab.suggestsCard ? !suggestsDismissed && /*#__PURE__*/React.createElement(AlfieSuggestsCard, {
      heading: "Alfie suggests",
      headingSize: 13.5,
      onDismiss: onDismissSuggests,
      style: {
        margin: "18px 0 4px"
      }
    }, sugRows) : /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 18,
        paddingTop: 14,
        borderTop: "1px dashed rgba(47,109,247,.35)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "0 10px 10px"
      }
    }, /*#__PURE__*/React.createElement(Sparkle, {
      size: 15
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "Quicksand, sans-serif",
        fontSize: 13.5,
        fontWeight: 700,
        color: ALFIE
      }
    }, "Alfie suggests")), sugRows);
  })()), /*#__PURE__*/React.createElement("div", {
    style: {
      ...footerOverlay,
      padding: "14px 24px"
    }
  }, /*#__PURE__*/React.createElement("button", _extends({
    onClick: onAddField
  }, press, {
    style: {
      width: "100%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      background: NAVY,
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "12px 16px",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 14.5,
      fontWeight: 700,
      cursor: "pointer",
      transition: `transform .12s ${EASE}`
    }
  }), /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M5 12h14"
  })), "Add field")));
};

/* ───────────────── Field editor view (create + edit; lives inside the unified drawer) ───────────────── */

const EditorView = ({
  mode,
  field,
  preset,
  initialRequired,
  initialHidden,
  onBack,
  onSubmit,
  onDelete,
  lab,
  suggestions,
  suggestsDismissed,
  onDismissSuggests
}) => {
  const isBase = !!(field && !field.custom);
  const col = field && field.custom ? field.col : null;
  const [alfieKey, setAlfieKey] = React.useState(preset ? preset.key : col && col.alfie ? col.alfie : null);
  const [name, setName] = React.useState(preset ? preset.label : field ? field.label : "");
  const [type, setType] = React.useState(preset ? preset.type : col ? col.type : "text");
  const [desc, setDesc] = React.useState(col ? col.desc || "" : "");
  const [options, setOptions] = React.useState(preset && preset.type === "dropdown" ? preset.options.slice() : col && col.type === "dropdown" ? col.options.length ? col.options.slice() : ["Option 1", "Option 2"] : ["Option 1", "Option 2"]);
  const [defOptIdx, setDefOptIdx] = React.useState(col && col.type === "dropdown" && col.def ? Math.max(0, col.options.indexOf(col.def)) : null);
  const [defText, setDefText] = React.useState(col && (col.type === "text" || col.type === "number" || col.type === "date") ? col.def || "" : "");
  const [defBool, setDefBool] = React.useState(col && col.type === "checkbox" ? !!col.def : false);
  const [defMember, setDefMember] = React.useState(col && col.type === "member" ? col.def || "" : "");
  const [required, setRequired] = React.useState(!!initialRequired);
  const [shownOnList, setShownOnList] = React.useState(!initialHidden);
  const cleanOptions = options.map(o => o.trim()).filter(Boolean);
  const canSave = name.trim() && (isBase || type !== "dropdown" || cleanOptions.length > 0);
  const submit = () => {
    if (!canSave) return;
    let def;
    if (type === "dropdown") def = defOptIdx != null && cleanOptions[defOptIdx] ? cleanOptions[defOptIdx] : "";else if (type === "checkbox") def = defBool;else if (type === "member") def = defMember;else def = defText;
    onSubmit({
      id: field ? field.key : undefined,
      base: isBase,
      label: name.trim(),
      type,
      options: type === "dropdown" ? cleanOptions : [],
      def,
      desc: desc.trim(),
      required,
      hidden: !shownOnList,
      alfie: alfieKey
    });
  };

  /* Feature 1 — apply an Alfie suggestion into the form */
  const applySuggestion = sug => {
    setName(sug.label);
    setType(sug.type);
    if (sug.type === "dropdown") setOptions(sug.options.length ? sug.options.slice() : ["Option 1", "Option 2"]);
    setDefOptIdx(null);
    setAlfieKey(sug.key);
  };
  const ghostOpt = alfieKey && ALFIE_OPTION[alfieKey];
  const showGhostOption = lab && lab.optionSuggest && type === "dropdown" && ghostOpt && !options.map(o => o.trim()).includes(ghostOpt.value);
  const fieldLabel = {
    display: "block",
    fontFamily: "Quicksand, sans-serif",
    fontSize: 14,
    fontWeight: 600,
    color: "#4A4A4A",
    marginBottom: 8
  };
  const textInput = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #E7E7E7",
    borderRadius: 8,
    padding: "12px 14px",
    fontFamily: "Poppins, sans-serif",
    fontSize: 15,
    outline: "none",
    color: NAVY
  };
  const title = mode === "create" ? "New field" : isBase ? "Edit column" : "Edit field";

  /* reference-pill chips: 8% accent tint, vivid blue border + sparkle, ink label (AA on the tint) */
  const suggestChips = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }
  }, suggestions.map(sug => {
    const active = alfieKey === sug.key;
    return /*#__PURE__*/React.createElement("button", _extends({
      key: sug.key,
      onClick: () => applySuggestion(sug),
      title: sug.why
    }, press, {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "8px 12px",
        borderRadius: 9999,
        cursor: "pointer",
        background: ALFIE_TINT,
        border: `1px solid ${ALFIE}`,
        boxShadow: active ? `inset 0 0 0 1px ${ALFIE}` : "none",
        fontFamily: "Poppins, sans-serif",
        fontSize: 12.5,
        fontWeight: 600,
        color: ALFIE_INK,
        transition: `box-shadow .15s ${EASE}`
      }
    }), /*#__PURE__*/React.createElement(Sparkle, {
      size: 12
    }), sug.label, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        fontWeight: 600,
        color: ALFIE_INK,
        background: "#fff",
        border: "1px solid rgba(47,109,247,.22)",
        borderRadius: 6,
        padding: "1px 6px"
      }
    }, typeLabelOf(sug.type)));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 11.5,
      color: "#939393",
      marginTop: 8
    }
  }, "Tap one to prefill this field \u2014 then just hit Create."));
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "20px 24px",
      borderBottom: "1px solid #C0EEE4"
    }
  }, /*#__PURE__*/React.createElement("button", _extends({
    onClick: onBack,
    "aria-label": "Back to manage fields",
    title: "Back to manage fields",
    style: iconBtn
  }, press), /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M15 18l-6-6 6-6"
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      color: NAVY,
      flex: 1
    }
  }, title)), /*#__PURE__*/React.createElement(ScrollFade, {
    style: {
      padding: `22px 24px ${FOOTER_CLEARANCE}px`
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: fieldLabel
  }, "Field name ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: ERR
    }
  }, "*")), /*#__PURE__*/React.createElement("input", {
    autoFocus: true,
    value: name,
    onChange: e => setName(e.target.value),
    placeholder: "Enter name...",
    style: {
      ...textInput,
      border: "1px solid #BDBCBC"
    }
  }), mode === "create" && lab && lab.suggestedFields && suggestions && suggestions.length > 0 && (lab.suggestsCard ? !suggestsDismissed && /*#__PURE__*/React.createElement(AlfieSuggestsCard, {
    heading: "Suggested by Alfie",
    onDismiss: onDismissSuggests,
    style: {
      marginTop: 22
    }
  }, suggestChips) : /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Sparkle, {
    size: 15
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 14,
      fontWeight: 700,
      color: ALFIE
    }
  }, "Suggested by Alfie")), suggestChips)), isBase && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: fieldLabel
  }, "Field type"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      border: "1px solid #C0EEE4",
      background: "#F8F8F8",
      borderRadius: 8,
      padding: "12px 14px",
      cursor: "not-allowed"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "#939393",
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 15,
      fontWeight: 600,
      color: "#707070"
    }
  }, "System field")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 11.5,
      color: "#939393",
      marginTop: 8
    }
  }, "System field \u2014 type can't change")), !isBase && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: fieldLabel
  }, "Field type"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 10
    }
  }, FIELD_TYPES.map(f => {
    const sel = type === f.type;
    return /*#__PURE__*/React.createElement("button", {
      key: f.type,
      onClick: () => setType(f.type),
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 7,
        padding: "14px 8px",
        borderRadius: 8,
        cursor: "pointer",
        background: sel ? "rgba(39,216,178,.1)" : "#fff",
        border: sel ? `1.5px solid ${MINT}` : "1.5px solid #C0EEE4",
        transition: `background .15s ${EASE}, border-color .15s ${EASE}`
      }
    }, /*#__PURE__*/React.createElement(FieldTypeIcon, {
      type: f.type,
      color: f.color,
      size: 20
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "Quicksand, sans-serif",
        fontSize: 13,
        fontWeight: 600,
        color: NAVY
      }
    }, f.label));
  }))), !isBase && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: fieldLabel
  }, "Description ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#A4A4A4",
      fontWeight: 500
    }
  }, "(optional)")), /*#__PURE__*/React.createElement("input", {
    value: desc,
    onChange: e => setDesc(e.target.value),
    placeholder: "Help text shown in Manage fields...",
    style: {
      ...textInput,
      fontSize: 14
    }
  })), !isBase && type === "dropdown" && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: fieldLabel
  }, "Dropdown options ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: ERR
    }
  }, "*")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, options.map((o, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      border: "1px solid #E7E7E7",
      borderRadius: 8,
      padding: "10px 12px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      height: 16,
      borderRadius: "50%",
      background: OPT_COLORS[i % OPT_COLORS.length],
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: o,
    onChange: e => setOptions(prev => prev.map((x, j) => j === i ? e.target.value : x)),
    style: {
      flex: 1,
      border: "none",
      outline: "none",
      fontFamily: "Poppins, sans-serif",
      fontSize: 15,
      color: NAVY,
      background: "transparent"
    }
  }), /*#__PURE__*/React.createElement("span", _extends({}, activate(() => setDefOptIdx(defOptIdx === i ? null : i)), {
    "aria-label": defOptIdx === i ? "Default option" : "Set as default",
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 13,
      color: defOptIdx === i ? MINT : "#939393",
      cursor: "pointer",
      whiteSpace: "nowrap"
    }
  }), defOptIdx === i ? "Default" : "Set default"), options.length > 1 && /*#__PURE__*/React.createElement("span", _extends({}, activate(() => {
    setOptions(prev => prev.filter((_, j) => j !== i));
    setDefOptIdx(d => d === i ? null : d != null && d > i ? d - 1 : d);
  }), {
    "aria-label": "Remove option",
    style: {
      color: "#939393",
      cursor: "pointer",
      display: "inline-flex"
    }
  }), /*#__PURE__*/React.createElement(TrashIcon, null)))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setOptions(prev => [...prev, "Option " + (prev.length + 1)]),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      border: "1px solid #E7E7E7",
      borderRadius: 8,
      padding: "11px 12px",
      background: "#fff",
      cursor: "pointer",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 15,
      color: "#707070"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M5 12h14"
  })), " Add option"), showGhostOption && /*#__PURE__*/React.createElement("button", _extends({
    onClick: () => setOptions(prev => [...prev, ghostOpt.value]),
    title: ghostOpt.why
  }, press, {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      border: `1px dashed ${ALFIE}`,
      borderRadius: 8,
      padding: "11px 12px",
      background: ALFIE_TINT,
      cursor: "pointer",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 14.5,
      fontWeight: 600,
      color: ALFIE_INK,
      transition: `transform .12s ${EASE}`
    }
  }), /*#__PURE__*/React.createElement(Sparkle, {
    size: 15
  }), " Add \u2018", ghostOpt.value, "\u2019 ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 12,
      fontWeight: 500,
      color: "#939393"
    }
  }, "(suggested \xB7 ", ghostOpt.why, ")")))), !isBase && (type === "text" || type === "number" || type === "date") && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: fieldLabel
  }, "Default value ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#A4A4A4",
      fontWeight: 500
    }
  }, "(optional)")), /*#__PURE__*/React.createElement("input", {
    type: type === "number" ? "number" : type === "date" ? "date" : "text",
    value: defText,
    onChange: e => setDefText(e.target.value),
    placeholder: type === "number" ? "e.g. 0" : type === "date" ? "" : "Default text...",
    style: textInput
  })), !isBase && type === "checkbox" && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      ...fieldLabel,
      marginBottom: 0
    }
  }, "Checked by default"), /*#__PURE__*/React.createElement(ToggleSwitch, {
    on: defBool,
    onClick: () => setDefBool(v => !v)
  })), !isBase && type === "member" && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: fieldLabel
  }, "Default member ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#A4A4A4",
      fontWeight: 500
    }
  }, "(optional)")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }
  }, MEMBERS.map((mName, i) => {
    const sel = defMember === mName;
    return /*#__PURE__*/React.createElement("button", {
      key: mName,
      onClick: () => setDefMember(sel ? "" : mName),
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px 6px 6px",
        borderRadius: 9999,
        cursor: "pointer",
        background: sel ? "rgba(39,216,178,.12)" : "#F8F8F8",
        border: sel ? `1.5px solid ${MINT}` : "1.5px solid transparent",
        fontFamily: "Poppins, sans-serif",
        fontSize: 12.5,
        fontWeight: 600,
        color: NAVY
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: MEMBER_COLORS[i % MEMBER_COLORS.length],
        color: "#fff",
        fontSize: 9,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, initialsOf(mName)), mName);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      borderTop: "1px solid #C0EEE4",
      paddingTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "13px 0",
      borderBottom: "1px solid #C0EEE4"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 13.5,
      fontWeight: 500,
      color: "#1F1F1F"
    }
  }, "Show on list"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 11.5,
      color: "#939393",
      marginTop: 2
    }
  }, "Display this column in the table")), /*#__PURE__*/React.createElement(ToggleSwitch, {
    on: shownOnList,
    onClick: () => setShownOnList(v => !v)
  }))), !isBase && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 0 4px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 13.5,
      fontWeight: 500,
      color: "#1F1F1F"
    }
  }, "Required to submit expense"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 11.5,
      color: "#939393",
      marginTop: 2
    }
  }, "Employees must fill this before submitting")), /*#__PURE__*/React.createElement(ToggleSwitch, {
    on: required,
    onClick: () => setRequired(v => !v),
    label: "Required to submit expense"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...footerOverlay,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "16px 24px"
    }
  }, /*#__PURE__*/React.createElement("div", null, mode === "edit" && field && field.custom && onDelete && /*#__PURE__*/React.createElement("button", _extends({
    onClick: onDelete
  }, press, {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      background: "#fff",
      border: "1px solid rgba(219,44,77,.35)",
      borderRadius: 8,
      padding: "11px 18px",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 14,
      fontWeight: 700,
      color: ERR,
      cursor: "pointer",
      transition: `transform .12s ${EASE}`
    }
  }), /*#__PURE__*/React.createElement(TrashIcon, null), " Delete")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", _extends({
    onClick: onBack
  }, press, {
    style: {
      background: "#fff",
      border: "1px solid #E7E7E7",
      borderRadius: 8,
      padding: "11px 22px",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 14,
      fontWeight: 700,
      color: "#4A4A4A",
      cursor: "pointer",
      transition: `transform .12s ${EASE}`
    }
  }), "Cancel"), /*#__PURE__*/React.createElement("button", _extends({
    onClick: submit,
    disabled: !canSave
  }, canSave ? press : {}, {
    style: {
      background: canSave ? NAVY : "#CBCBCB",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "11px 26px",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 14,
      fontWeight: 700,
      cursor: canSave ? "pointer" : "not-allowed",
      transition: `transform .12s ${EASE}`
    }
  }), mode === "create" ? "Create" : "Save"))));
};

/* ───────────────── Unified field drawer (manager ⇄ editor) ─────────────────
   One right-side container, fixed 468px × 100vh for both views. The shell itself
   enters and exits with a slide-from-right + fade, 300ms ease-in-out, from every
   entry point; the parent delays unmount 300ms so the exit can play. The views swap
   inside it via a 48px horizontal slide + cross-fade, 300ms ease-in-out
   (plain fade under prefers-reduced-motion). Single focus trap on the panel;
   Escape steps editor → manager → closed. The hidden pane stays mounted during
   the 300ms exit but is marked data-inert (skipped by the trap) and
   visibility-hidden once the fade completes. */

const ViewPane = ({
  id,
  active,
  dir,
  reduce,
  children
}) => {
  const shown = useSlideIn(); /* mounts one frame hidden so entries transition */
  const a = active && shown;
  return /*#__PURE__*/React.createElement("div", {
    "data-view": id,
    "data-inert": a ? undefined : "true",
    "aria-hidden": a ? undefined : "true",
    tabIndex: -1,
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      background: "#fff",
      outline: "none",
      opacity: a ? 1 : 0,
      transform: reduce ? "none" : `translateX(${a ? 0 : dir * 48}px)`,
      pointerEvents: a ? "auto" : "none",
      visibility: a ? "visible" : "hidden",
      transition: `opacity .3s ${EASE}${reduce ? "" : `, transform .3s ${EASE}`}, visibility 0s linear ${a ? "0s" : ".3s"}`
    }
  }, children);
};
const FieldDrawer = ({
  open,
  view,
  onClose,
  onBack,
  manager,
  editorView
}) => {
  /* shell enter/exit: parent keeps the drawer mounted for 300ms after open flips
     false, so the slide-out + fade can play before unmount (instant under reduced motion) */
  const entered = useSlideIn();
  const shown = open && entered;
  const reduce = prefersReducedMotion();
  const panelRef = useDrawerA11y(view === "editor" ? onBack : onClose);

  /* keep the outgoing editor mounted for its 300ms exit, then let it unmount */
  const lastEditor = React.useRef(null);
  if (editorView) lastEditor.current = editorView;
  const [editorMounted, setEditorMounted] = React.useState(!!editorView);
  React.useEffect(() => {
    if (editorView) {
      setEditorMounted(true);
      return;
    }
    if (prefersReducedMotion()) {
      setEditorMounted(false);
      lastEditor.current = null;
      return;
    }
    const id = setTimeout(() => {
      setEditorMounted(false);
      lastEditor.current = null;
    }, 300);
    return () => clearTimeout(id);
  }, [editorView]);

  /* focus follows the active view — double rAF so the pane is visible/focusable first */
  React.useEffect(() => {
    let id2;
    const id = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => {
        const node = panelRef.current;
        if (!node) return;
        const pane = node.querySelector(`[data-view="${view}"]`);
        if (!pane || pane.contains(document.activeElement)) return;
        const target = view === "editor" && pane.querySelector("input") || pane;
        target.focus({
          preventScroll: true
        });
      });
    });
    return () => {
      cancelAnimationFrame(id);
      if (id2) cancelAnimationFrame(id2);
    };
  }, [view]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 69,
      background: "rgba(0,40,64,.12)",
      opacity: shown ? 1 : 0,
      transition: `opacity .3s ${EASE}`,
      pointerEvents: open ? "auto" : "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    ref: panelRef,
    role: "dialog",
    "aria-modal": "true",
    "aria-label": view === "editor" ? "Field editor" : "Manage fields",
    style: {
      position: "fixed",
      top: 0,
      right: 0,
      height: "100vh",
      width: 468,
      maxWidth: "92vw",
      background: "#fff",
      zIndex: 70,
      overflow: "hidden",
      boxShadow: "0 8px 24px rgba(0,40,64,.08)",
      fontFamily: "Quicksand, sans-serif",
      transform: reduce ? "none" : shown ? "translateX(0)" : "translateX(100%)",
      opacity: shown ? 1 : 0,
      transition: `transform .3s ${DRAWER_EASE}, opacity .3s ${EASE}`,
      pointerEvents: open ? "auto" : "none"
    }
  }, /*#__PURE__*/React.createElement(ViewPane, {
    id: "manager",
    active: view === "manager",
    dir: -1,
    reduce: reduce
  }, manager), editorMounted && (editorView || lastEditor.current) && /*#__PURE__*/React.createElement(ViewPane, {
    id: "editor",
    active: view === "editor",
    dir: 1,
    reduce: reduce
  }, editorView || lastEditor.current)));
};

/* ───────────────── Delete confirmation modal ───────────────── */

const DeleteConfirmModal = ({
  label,
  count,
  onCancel,
  onConfirm
}) => {
  const shown = useSlideIn();
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: onCancel,
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,40,64,.4)",
      zIndex: 80,
      opacity: shown ? 1 : 0,
      transition: `opacity .3s ${EASE}`
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 81,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 400,
      maxWidth: "92vw",
      background: "#fff",
      borderRadius: 16,
      padding: "26px 26px 20px",
      boxShadow: "0 8px 24px rgba(0,40,64,.08)",
      fontFamily: "Quicksand, sans-serif",
      pointerEvents: "auto",
      opacity: shown ? 1 : 0,
      transition: `opacity .3s ${EASE}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 19,
      fontWeight: 700,
      color: NAVY,
      textWrap: "balance"
    }
  }, "Delete \u201C", label, "\u201D?"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 13.5,
      color: "#4A4A4A",
      marginTop: 10,
      lineHeight: 1.5
    }
  }, "Values entered on ", count, " transactions will be removed."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 12,
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("button", _extends({
    onClick: onCancel
  }, press, {
    style: {
      background: "#fff",
      border: "1px solid #E7E7E7",
      borderRadius: 8,
      padding: "10px 20px",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 14,
      fontWeight: 700,
      color: "#4A4A4A",
      cursor: "pointer",
      transition: `transform .12s ${EASE}`
    }
  }), "Cancel"), /*#__PURE__*/React.createElement("button", _extends({
    onClick: onConfirm
  }, press, {
    style: {
      background: ERR,
      border: "none",
      borderRadius: 8,
      padding: "10px 22px",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 14,
      fontWeight: 700,
      color: "#fff",
      cursor: "pointer",
      transition: `transform .12s ${EASE}`
    }
  }), "Delete")))));
};

/* ───────────────── Row ───────────────── */

const Row = ({
  r,
  last,
  onApprove,
  onReject,
  cols,
  orderedVisible,
  stickyLeft,
  onCellChange,
  onOpen,
  lab,
  onConfirmCell,
  onAddOption,
  optionSuggestFor,
  selected,
  onToggleSelect,
  requiredKeys
}) => {
  const baseCell = {
    date: /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "Quicksand, sans-serif",
        fontSize: 13,
        fontWeight: 400,
        color: "#4A4A4A"
      }
    }, r.date),
    details: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        minWidth: 0
      }
    }, r.badge === "Expenses" && /*#__PURE__*/React.createElement(ExpenseIcon, null), r.badge === "Cashback" && /*#__PURE__*/React.createElement(CashbackIcon, null), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, !SYSTEM_BADGES.includes(r.badge) ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "Quicksand, sans-serif",
        fontSize: 11,
        fontWeight: 600,
        color: BADGE_STYLE[r.badge].color,
        marginBottom: 2
      }
    }, r.badge) : null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "Quicksand, sans-serif",
        fontSize: 15,
        fontWeight: 700,
        color: SYSTEM_BADGES.includes(r.badge) ? NAVY : "#1F1F1F"
      }
    }, SYSTEM_BADGES.includes(r.badge) ? r.badge : r.title))),
    account: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement(AccountTypeIcon, {
      kind: r.acctType
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "Quicksand, sans-serif",
        fontSize: 15,
        fontWeight: 700,
        color: NAVY
      }
    }, r.acct), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "Quicksand, sans-serif",
        fontSize: 12,
        color: "#939393",
        marginTop: 2
      }
    }, r.acctSub))),
    documents: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(PaperclipIcon, null), /*#__PURE__*/React.createElement(CommentIcon, null)),
    amount: /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "Quicksand, sans-serif",
        fontSize: 15,
        fontWeight: 700,
        color: "#1F1F1F",
        fontVariantNumeric: "tabular-nums"
      }
    }, r.amt), r.amtSub && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "Quicksand, sans-serif",
        fontSize: 12,
        color: "#939393",
        marginTop: 2,
        fontVariantNumeric: "tabular-nums"
      }
    }, r.amtSub)),
    status: /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: r.status === "Success" ? SUCCESS : WARNING,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "Quicksand, sans-serif",
        fontSize: 13.5,
        fontWeight: 500,
        color: "#4A4A4A"
      }
    }, r.status)), r.reason && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "Quicksand, sans-serif",
        fontSize: 11.5,
        color: ERR,
        marginTop: 3,
        marginLeft: 15,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, r.reason)),
    approval: r.status === "Success" && r.approval === "pending" ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: e => {
        e.stopPropagation();
        onApprove?.();
      },
      style: {
        background: SUCCESS,
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "7px 13px",
        fontFamily: "Poppins, sans-serif",
        fontSize: 12.5,
        fontWeight: 600,
        cursor: "pointer"
      }
    }, "Approve"), /*#__PURE__*/React.createElement("button", {
      onClick: e => {
        e.stopPropagation();
        onReject?.();
      },
      style: {
        background: "#fff",
        color: ERR,
        border: "1px solid rgba(219,44,77,.35)",
        borderRadius: 8,
        padding: "7px 13px",
        fontFamily: "Poppins, sans-serif",
        fontSize: 12.5,
        fontWeight: 600,
        cursor: "pointer"
      }
    }, "Reject")) : r.approval === "approved" ? /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "Quicksand, sans-serif",
        fontSize: 12.5,
        fontWeight: 600,
        color: SUCCESS
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.4",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M20 6L9 17l-5-5"
    })), "Approved") : r.approval === "rejected" ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "Quicksand, sans-serif",
        fontSize: 12.5,
        fontWeight: 600,
        color: ERR
      }
    }, "Rejected") : /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "Quicksand, sans-serif",
        fontSize: 12.5,
        color: "#CBCBCB"
      }
    }, "\u2014")
  };
  const cellValue = col => r.custom && Object.prototype.hasOwnProperty.call(r.custom, col.id) ? r.custom[col.id] : col.def;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onOpen,
    style: {
      display: "grid",
      gridTemplateColumns: cols,
      alignItems: "center",
      padding: "16px 28px",
      gap: 14,
      borderBottom: last ? "none" : "1px solid #C0EEE4",
      cursor: "pointer",
      background: selected ? "#EBFBF6" : "#fff"
    },
    onMouseEnter: e => {
      if (!selected) {
        e.currentTarget.style.background = "#F8F8F8";
        e.currentTarget.querySelectorAll("[data-sticky-gap]").forEach(el => el.style.boxShadow = "14px 0 0 #F8F8F8");
      }
    },
    onMouseLeave: e => {
      if (!selected) {
        e.currentTarget.style.background = "#fff";
        e.currentTarget.querySelectorAll("[data-sticky-gap]").forEach(el => el.style.boxShadow = "14px 0 0 #fff");
      }
    }
  }, /*#__PURE__*/React.createElement("div", {
    "data-sticky-gap": true,
    onClick: e => e.stopPropagation(),
    style: {
      position: "sticky",
      left: stickyLeft && stickyLeft.select || 0,
      zIndex: 1,
      background: "inherit",
      boxShadow: "14px 0 0 " + (selected ? "#EBFBF6" : "#fff"),
      alignSelf: "stretch",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(SelectCheck, {
    checked: selected,
    onToggle: onToggleSelect,
    label: "Select row"
  })), orderedVisible.map(m => m.custom ? /*#__PURE__*/React.createElement("div", {
    key: m.key,
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement(CustomCell, {
    col: m.col,
    value: cellValue(m.col),
    onChange: v => onCellChange(m.col.id, v),
    suggested: !!(lab && lab.autofill && r.aiPending && r.aiPending[m.col.id]),
    onConfirm: () => onConfirmCell(m.col.id),
    required: !!(requiredKeys && requiredKeys.includes(m.key)),
    suggestedOption: optionSuggestFor ? optionSuggestFor(m.col) : null,
    onAddOption: val => onAddOption(m.col.id, val)
  })) : stickyLeft && stickyLeft[m.key] != null ? /*#__PURE__*/React.createElement("div", {
    key: m.key,
    "data-sticky-gap": true,
    style: {
      position: "sticky",
      left: stickyLeft[m.key],
      zIndex: 1,
      background: "inherit",
      boxShadow: "14px 0 0 #fff",
      alignSelf: "stretch",
      display: "flex",
      alignItems: "center"
    }
  }, baseCell[m.key]) : /*#__PURE__*/React.createElement(React.Fragment, {
    key: m.key
  }, baseCell[m.key])), /*#__PURE__*/React.createElement("div", null));
};

/* ───────────────── Transaction detail drawer ───────────────── */

const DetailRow = ({
  label,
  value,
  valueColor,
  isLink
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 0",
    borderBottom: "1px solid #C0EEE4",
    gap: 16
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: "Quicksand, sans-serif",
    fontSize: 15,
    color: "#4A4A4A"
  }
}, label), /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: "Quicksand, sans-serif",
    fontSize: 15,
    fontWeight: 700,
    color: isLink ? MINT : valueColor || NAVY,
    textAlign: "right",
    cursor: isLink ? "pointer" : "default"
  }
}, value));
const TransactionDrawer = ({
  r,
  onClose,
  customFields,
  requiredKeys,
  lab,
  onCellChange,
  onConfirmCell,
  onAddOption,
  optionSuggestFor
}) => {
  if (!r) return null;
  const cellValue = col => r.custom && Object.prototype.hasOwnProperty.call(r.custom, col.id) ? r.custom[col.id] : col.def;
  const last4 = (r.acctSub.match(/(\d{4})\D*$/) || [])[1];
  const isDeclined = r.status === "Declined";
  const txnNo = "1026" + String(Math.abs(r.date.length * 977 + r.amt.length * 31)).padStart(8, "0").slice(0, 8);
  const isDoc = r.acctType === "doc";
  const cardEl = /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      border: "1px solid #C0EEE4",
      borderRadius: 14,
      padding: "6px 22px",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(DetailRow, {
    label: "Status",
    value: r.status,
    valueColor: isDeclined ? ERR : SUCCESS
  }), isDoc ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(DetailRow, {
    label: "Account number",
    value: r.acct
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: "Account name",
    value: r.acctSub
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(DetailRow, {
    label: "Card ending in",
    value: last4 ? "* " + last4 : "—"
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: "Card name",
    value: r.acctSub ? r.acctSub.replace(/\s*\*+\s*\d+$/, "") : "—"
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: "Merchant name",
    value: (r.title || r.acct || "—").toUpperCase()
  })), /*#__PURE__*/React.createElement(DetailRow, {
    label: "Date & Time",
    value: r.date
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: "Category",
    value: r.badge === "CHARGES" ? "Charges" : r.badge === "Expenses" ? "Spending" : r.badge === "Cashback" ? "Cashback" : r.badge === "PAY_OUT" ? "Payout" : r.badge
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: "Transaction No.",
    value: txnNo
  }), !isDoc && /*#__PURE__*/React.createElement(DetailRow, {
    label: "Employee name",
    value: r.acct
  }), /*#__PURE__*/React.createElement(DetailRow, {
    label: "Notes",
    value: "Add note",
    isLink: true
  }));
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,40,64,.4)",
      zIndex: 60
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      top: 0,
      right: 0,
      height: "100vh",
      width: 560,
      maxWidth: "92vw",
      background: "#fff",
      zIndex: 61,
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 8px 24px rgba(0,40,64,.08)",
      fontFamily: "Quicksand, sans-serif"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "20px 28px",
      borderBottom: "1px solid #C0EEE4",
      background: "#F8F8F8"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20,
      fontWeight: 700,
      color: NAVY
    }
  }, "Transaction detail"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      background: "transparent",
      border: "none",
      cursor: "pointer",
      color: NAVY,
      display: "inline-flex",
      padding: 4
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 6l12 12M18 6 6 18"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowY: "auto",
      flex: 1,
      padding: "22px 28px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#F8F8F8",
      borderRadius: 14,
      padding: "22px 24px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 46,
      height: 46,
      borderRadius: "50%",
      background: "#fff",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "24",
    height: "24",
    fill: "none",
    stroke: NAVY,
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M11 17V7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13.9 8.8c-.6-.8-1.6-1.3-2.9-1.3-1.6 0-2.9.9-2.9 2.1 0 1.3 1.3 1.7 2.9 2.2 1.5.5 2.9.8 2.9 2.1 0 1.2-1.3 2.1-2.9 2.1-1.2 0-2.3-.5-2.9-1.3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 5l3 3-3 3"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 14,
      color: "#707070"
    }
  }, r.badge === "CHARGES" ? "Charges" : r.badge === "Expenses" ? "Spending" : r.badge === "Cashback" ? "Cashback" : r.badge === "PAY_OUT" ? "Payout" : r.badge), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 30,
      fontWeight: 700,
      color: NAVY,
      lineHeight: "36px"
    }
  }, r.amt), r.amtSub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 15,
      color: "#707070"
    }
  }, r.amtSub))), cardEl, customFields && customFields.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      border: "1px solid #C0EEE4",
      borderRadius: 14,
      padding: "6px 22px",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: NAVY,
      padding: "14px 0 4px"
    }
  }, "Custom fields"), customFields.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: m.key,
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 16,
      padding: "13px 0",
      borderBottom: i === customFields.length - 1 ? "none" : "1px solid #C0EEE4",
      minHeight: 30
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 15,
      color: "#4A4A4A",
      flexShrink: 0
    }
  }, m.label), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      display: "flex",
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(CustomCell, {
    col: m.col,
    value: cellValue(m.col),
    onChange: v => onCellChange(m.col.id, v),
    suggested: !!(lab && lab.autofill && r.aiPending && r.aiPending[m.col.id]),
    onConfirm: () => onConfirmCell(m.col.id),
    required: !!(requiredKeys && requiredKeys.includes(m.key)),
    suggestedOption: optionSuggestFor ? optionSuggestFor(m.col) : null,
    onAddOption: val => onAddOption(m.col.id, val)
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      border: "1px solid #C0EEE4",
      borderRadius: 14,
      padding: "18px 22px 26px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: NAVY
    }
  }, "Documents"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: MINT,
      cursor: "pointer"
    }
  }, "Upload")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
      padding: "10px 0"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "72",
    height: "72",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#CBCBCB",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M13 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V9z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13 3v6h6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 13h4M9 16h5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "17",
    cy: "17",
    r: "4",
    fill: "#fff"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17 15.4v3.2M15.4 17h3.2"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 15,
      color: "#A4A4A4"
    }
  }, "No documents uploaded"))))));
};

/* ───────────────── Alfie: slim accept bar (Feature 2) ───────────────── */

const AlfieAcceptBar = ({
  label,
  count,
  source,
  onAcceptAll,
  onReviewLater
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "9px 28px",
    background: ALFIE_TINT,
    borderBottom: "1px solid rgba(47,109,247,.16)",
    fontFamily: "Quicksand, sans-serif"
  }
}, /*#__PURE__*/React.createElement(Sparkle, {
  size: 15
}), /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 12.5,
    fontWeight: 500,
    color: NAVY
  }
}, "Alfie filled ", /*#__PURE__*/React.createElement("b", {
  style: {
    fontVariantNumeric: "tabular-nums"
  }
}, count), " value", count === 1 ? "" : "s", " in \u2018", label, "\u2019", source ? " from " + source : ""), /*#__PURE__*/React.createElement("div", {
  style: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: 8
  }
}, /*#__PURE__*/React.createElement("button", _extends({
  onClick: onAcceptAll
}, press, {
  style: {
    background: NAVY,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "6px 14px",
    fontFamily: "Quicksand, sans-serif",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
    transition: `transform .12s ${EASE}`
  }
}), "Accept all"), /*#__PURE__*/React.createElement("button", _extends({
  onClick: onReviewLater
}, press, {
  style: {
    background: "transparent",
    color: ALFIE_INK,
    border: "none",
    borderRadius: 8,
    padding: "6px 10px",
    fontFamily: "Quicksand, sans-serif",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
    transition: `transform .12s ${EASE}`
  }
}), "Review later")));

/* ───────────────── Bulk edit (P2-11) ───────────────── */

/* keyboard-accessible checkbox (native semantics via role + aria) */
const SelectCheck = ({
  checked,
  indeterminate,
  onToggle,
  label
}) => /*#__PURE__*/React.createElement("button", _extends({
  onClick: e => {
    e.stopPropagation();
    onToggle();
  },
  role: "checkbox",
  "aria-checked": indeterminate ? "mixed" : !!checked,
  "aria-label": label
}, press, {
  style: {
    width: 18,
    height: 18,
    borderRadius: 6,
    flexShrink: 0,
    cursor: "pointer",
    padding: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: checked || indeterminate ? "none" : "1.5px solid #BDBCBC",
    background: checked || indeterminate ? MINT : "#fff",
    transition: `background .12s ${EASE}, transform .12s ${EASE}`
  }
}), indeterminate ? /*#__PURE__*/React.createElement("span", {
  style: {
    width: 9,
    height: 2,
    background: "#fff",
    borderRadius: 2
  }
}) : checked && /*#__PURE__*/React.createElement("svg", {
  width: "12",
  height: "12",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "#fff",
  strokeWidth: "3",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M20 6L9 17l-5-5"
})));

/* floating bar: set one dropdown/member custom field to a value across all selected rows */
const BulkBar = ({
  count,
  fields,
  onApply,
  onClear
}) => {
  const [fieldId, setFieldId] = React.useState("");
  const [value, setValue] = React.useState("");
  const field = fields.find(f => f.key === fieldId) || null;
  const values = field ? field.col.type === "member" ? MEMBERS : field.col.options || [] : [];
  const canApply = field && value !== "";
  const selectStyle = {
    appearance: "none",
    WebkitAppearance: "none",
    background: "#fff",
    border: "1px solid #E7E7E7",
    borderRadius: 8,
    padding: "8px 30px 8px 12px",
    fontFamily: "Poppins, sans-serif",
    fontSize: 13,
    fontWeight: 500,
    color: NAVY,
    cursor: "pointer",
    outline: "none",
    backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23002840' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg>\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center"
  };
  return /*#__PURE__*/React.createElement("div", {
    role: "region",
    "aria-label": "Bulk edit selected rows",
    style: {
      position: "fixed",
      left: "50%",
      bottom: 26,
      transform: "translateX(-50%)",
      zIndex: 76,
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 16px",
      background: "#fff",
      borderRadius: 14,
      boxShadow: "0 8px 24px rgba(0,40,64,.08)",
      border: "1px solid #C0EEE4",
      fontFamily: "Quicksand, sans-serif"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 26,
      height: 26,
      padding: "0 8px",
      borderRadius: 9999,
      background: NAVY,
      color: "#fff",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 12.5,
      fontWeight: 700,
      fontVariantNumeric: "tabular-nums"
    }
  }, count), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: NAVY
    }
  }, "selected"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 24,
      background: "#C0EEE4"
    }
  }), fields.length === 0 ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 12.5,
      color: "#939393",
      maxWidth: 260
    }
  }, "Add a dropdown or member field to bulk-set values.") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 13,
      color: "#4A4A4A"
    }
  }, "Set"), /*#__PURE__*/React.createElement("select", {
    "aria-label": "Field to set",
    value: fieldId,
    onChange: e => {
      setFieldId(e.target.value);
      setValue("");
    },
    style: selectStyle
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Field\u2026"), fields.map(f => /*#__PURE__*/React.createElement("option", {
    key: f.key,
    value: f.key
  }, f.label))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 13,
      color: "#4A4A4A"
    }
  }, "to"), /*#__PURE__*/React.createElement("select", {
    "aria-label": "Value to set",
    value: value,
    onChange: e => setValue(e.target.value),
    disabled: !field,
    style: {
      ...selectStyle,
      opacity: field ? 1 : .5,
      cursor: field ? "pointer" : "not-allowed"
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Value\u2026"), values.map(v => /*#__PURE__*/React.createElement("option", {
    key: v,
    value: v
  }, v))), /*#__PURE__*/React.createElement("button", _extends({
    onClick: () => canApply && onApply(field.col.id, value),
    disabled: !canApply
  }, canApply ? press : {}, {
    style: {
      background: canApply ? NAVY : "#CBCBCB",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "9px 18px",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 13.5,
      fontWeight: 700,
      cursor: canApply ? "pointer" : "not-allowed",
      transition: `transform .12s ${EASE}`
    }
  }), "Apply")), /*#__PURE__*/React.createElement("button", _extends({
    onClick: onClear,
    "aria-label": "Clear selection"
  }, press, {
    style: {
      width: 30,
      height: 30,
      borderRadius: "50%",
      background: "#F2F2F2",
      border: "none",
      color: "#4A4A4A",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      transition: `transform .12s ${EASE}`
    }
  }), /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 6l12 12M18 6 6 18"
  }))));
};

/* ───────────────── Alfie: proactive nudge (Feature 3) ───────────────── */

const AlfieNudge = ({
  onCreate,
  onDismiss
}) => {
  const shown = useSlideIn();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      marginBottom: 16,
      padding: "14px 18px",
      background: ALFIE_TINT,
      border: `1px solid rgba(47,109,247,.28)`,
      borderRadius: 14,
      boxShadow: "0 0 2px rgba(47,109,247,.25)",
      fontFamily: "Quicksand, sans-serif",
      opacity: shown ? 1 : 0,
      transition: `opacity .4s ${EASE}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 38,
      borderRadius: "50%",
      background: "#fff",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Sparkle, {
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 15,
      fontWeight: 700,
      color: ALFIE_INK,
      marginBottom: 3
    }
  }, "Alfie noticed something"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 13.5,
      color: "#1F1F1F",
      lineHeight: 1.45,
      textWrap: "pretty"
    }
  }, "You\u2019ve mentioned projects in the notes of 14 transactions. Want to track them properly?")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", _extends({
    onClick: onCreate
  }, press, {
    style: {
      background: NAVY,
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "10px 16px",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 13.5,
      fontWeight: 700,
      cursor: "pointer",
      transition: `transform .12s ${EASE}`
    }
  }), "Create \u2018Project\u2019 field"), /*#__PURE__*/React.createElement("button", _extends({
    onClick: onDismiss
  }, press, {
    style: {
      background: "transparent",
      color: "#707070",
      border: "none",
      borderRadius: 8,
      padding: "10px 12px",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 13.5,
      fontWeight: 700,
      cursor: "pointer",
      transition: `transform .12s ${EASE}`
    }
  }), "Dismiss")));
};

/* ───────────────── Design Lab panel (prototype chrome, bottom-left) ───────────────── */

const LAB_TOGGLES = [{
  key: "suggestedFields",
  label: "Suggested fields"
}, {
  key: "autofill",
  label: "Auto-fill columns"
}, {
  key: "nudge",
  label: "Proactive nudge"
}, {
  key: "optionSuggest",
  label: "Option suggestions"
}, {
  key: "suggestsCard",
  label: "Dismissable suggests card"
}];
const DesignLabPanel = ({
  lab,
  onToggle
}) => {
  const [open, setOpen] = React.useState(false);
  const FlaskIcon = () => /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "17",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: ALFIE,
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M9 3h6M10 3v6.5L5.2 17a2 2 0 001.7 3h10.2a2 2 0 001.7-3L14 9.5V3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7.5 14h9"
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      left: 16,
      bottom: 16,
      zIndex: 90,
      fontFamily: "Quicksand, sans-serif"
    }
  }, open ? /*#__PURE__*/React.createElement("div", {
    style: {
      width: 250,
      background: "#fff",
      border: "1px solid #C0EEE4",
      borderRadius: 14,
      boxShadow: "0 8px 24px rgba(0,40,64,.08)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      padding: "13px 15px 11px",
      borderBottom: "1px solid #C0EEE4"
    }
  }, /*#__PURE__*/React.createElement(FlaskIcon, null), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      fontWeight: 700,
      color: NAVY
    }
  }, "Design Lab"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 10.5,
      color: "#939393"
    }
  }, "Prototype-only toggles")), /*#__PURE__*/React.createElement("button", _extends({
    onClick: () => setOpen(false),
    "aria-label": "Collapse"
  }, press, {
    style: {
      width: 26,
      height: 26,
      borderRadius: 8,
      border: "none",
      background: "#F8F8F8",
      color: "#707070",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      transition: `transform .12s ${EASE}`
    }
  }), /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 15l6-6 6 6"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 15px 12px"
    }
  }, LAB_TOGGLES.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.key,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "9px 0"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 13,
      fontWeight: 500,
      color: "#1F1F1F"
    }
  }, t.label), /*#__PURE__*/React.createElement(ToggleSwitch, {
    on: lab[t.key],
    onClick: () => onToggle(t.key)
  }))))) : /*#__PURE__*/React.createElement("button", _extends({
    onClick: () => setOpen(true)
  }, press, {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 9,
      background: "#fff",
      border: "1px solid #C0EEE4",
      borderRadius: 9999,
      boxShadow: "0 8px 24px rgba(0,40,64,.08)",
      padding: "10px 16px",
      cursor: "pointer",
      transition: `transform .12s ${EASE}`
    }
  }), /*#__PURE__*/React.createElement(FlaskIcon, null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 700,
      color: NAVY
    }
  }, "Design Lab")));
};

/* ───────────────── Filters (P1-5, prototype scope) ───────────────── */

const STATUS_VALUES = [...new Set(ROWS.map(r => r.status))];
const FILTERABLE_TYPES = ["dropdown", "member", "checkbox"];
const FilterCheckRow = ({
  label,
  checked,
  onClick
}) => /*#__PURE__*/React.createElement("div", _extends({}, activate(onClick), {
  role: "checkbox",
  "aria-checked": !!checked,
  "aria-label": label,
  style: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "7px 8px",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "Quicksand, sans-serif",
    fontSize: 13,
    color: "#1F1F1F"
  },
  onMouseEnter: e => e.currentTarget.style.background = "#F8F8F8",
  onMouseLeave: e => e.currentTarget.style.background = "transparent"
}), /*#__PURE__*/React.createElement("span", {
  style: {
    width: 18,
    height: 18,
    borderRadius: 6,
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: checked ? "none" : "1.5px solid #BDBCBC",
    background: checked ? MINT : "#fff",
    transition: `background .12s ${EASE}`
  }
}, checked && /*#__PURE__*/React.createElement("svg", {
  width: "12",
  height: "12",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "#fff",
  strokeWidth: "3",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M20 6L9 17l-5-5"
}))), /*#__PURE__*/React.createElement("span", {
  style: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  }
}, label));
const FiltersPopover = ({
  customFields,
  filters,
  onToggle,
  onClear,
  onClose
}) => {
  const shown = useSlideIn();
  const sections = [{
    key: "status",
    label: "Status",
    values: STATUS_VALUES
  }, ...customFields.map(m => ({
    key: m.col.id,
    label: m.label,
    values: m.col.type === "checkbox" ? ["Yes", "No"] : m.col.type === "member" ? MEMBERS : m.col.options || []
  }))];
  const active = Object.values(filters).reduce((n, a) => n + (a ? a.length : 0), 0);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 40
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "calc(100% + 8px)",
      left: 0,
      zIndex: 41,
      width: 264,
      maxHeight: 440,
      overflowY: "auto",
      background: "#fff",
      borderRadius: 8,
      boxShadow: "0 8px 24px rgba(0,40,64,.08)",
      border: "1px solid #C0EEE4",
      padding: 8,
      fontFamily: "Quicksand, sans-serif",
      opacity: shown ? 1 : 0,
      transition: `opacity .15s ${EASE}`
    }
  }, sections.map(sec => /*#__PURE__*/React.createElement("div", {
    key: sec.key,
    style: {
      padding: "6px 4px 8px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Quicksand, sans-serif",
      fontSize: 12,
      fontWeight: 500,
      color: "#939393",
      padding: "2px 8px 4px"
    }
  }, sec.label), sec.values.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "6px 8px",
      color: "#CBCBCB",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 12.5
    }
  }, "No options") : sec.values.map(v => /*#__PURE__*/React.createElement(FilterCheckRow, {
    key: v,
    label: v,
    checked: (filters[sec.key] || []).includes(v),
    onClick: () => onToggle(sec.key, v)
  })))), active > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid #C0EEE4",
      padding: "8px 6px 2px",
      display: "flex",
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("button", _extends({
    onClick: onClear
  }, press, {
    style: {
      background: "transparent",
      border: "none",
      cursor: "pointer",
      color: MINT,
      fontFamily: "Quicksand, sans-serif",
      fontSize: 13,
      fontWeight: 700
    }
  }), "Clear all"))));
};

/* ───────────────── Screen ───────────────── */

const FieldManagerExplorer = () => {
  /* useTweaks removed — approval workflow fixed to "List view", so the Approval column always renders in the table */
  const [query, setQuery] = React.useState("");
  const [rowsState, setRowsState] = React.useState(ROWS);
  const setApproval = (row, approval) => setRowsState(prev => prev.map(x => x === row ? {
    ...x,
    approval
  } : x));
  const [customColumns, setCustomColumns] = React.useState([]);
  const [order, setOrder] = React.useState(() => BASE_META.map(m => m.key));
  const [hidden, setHidden] = React.useState([]);
  const [required, setRequired] = React.useState([]);
  const [baseLabels, setBaseLabels] = React.useState({});
  const [managerOpen, setManagerOpen] = React.useState(false);
  /* keep the field drawer mounted through its 300ms exit slide (instant under reduced motion) */
  const [drawerMounted, setDrawerMounted] = React.useState(false);
  React.useEffect(() => {
    if (managerOpen) {
      setDrawerMounted(true);
      return;
    }
    if (prefersReducedMotion()) {
      setDrawerMounted(false);
      return;
    }
    const id = setTimeout(() => setDrawerMounted(false), 300);
    return () => clearTimeout(id);
  }, [managerOpen]);
  const [editor, setEditor] = React.useState(null); // { mode, key? }
  const [confirmKey, setConfirmKey] = React.useState(null);
  const [pending, setPending] = React.useState([]);
  const timers = React.useRef({});
  const [selectedIdx, setSelectedIdx] = React.useState(null);
  const [flashId, setFlashId] = React.useState(null); // freshly created column to reveal + highlight
  const scrollRef = React.useRef(null);
  const headerRowRef = React.useRef(null);
  const flashTimer = React.useRef(null);
  /* sticky-left offsets for pinned select/Date/Details columns, measured from actual rendered widths (not assumed mins) */
  const [stickyLeft, setStickyLeft] = React.useState({
    select: 0,
    date: 0,
    details: 0
  });

  /* P2-11 — bulk select (indices into rowsState; order is stable, rows are never added/removed) */
  const [selected, setSelected] = React.useState(() => new Set());

  /* Alfie / Design Lab state */
  const [lab, setLab] = React.useState({
    suggestedFields: true,
    autofill: true,
    nudge: true,
    optionSuggest: true,
    suggestsCard: true
  });
  /* change 3 — "Alfie suggests" card dismissal is session-scoped (shared by manager + editor views) */
  const [suggestsDismissed, setSuggestsDismissed] = React.useState(false);
  const toggleLab = k => setLab(p => ({
    ...p,
    [k]: !p[k]
  }));
  const [nudgeReady, setNudgeReady] = React.useState(false);
  const [nudgeDismissed, setNudgeDismissed] = React.useState(false);
  const [reviewLater, setReviewLater] = React.useState([]);

  /* Filters (P1-5) */
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [filters, setFilters] = React.useState({});
  React.useEffect(() => () => {
    Object.values(timers.current).forEach(clearTimeout);
    if (flashTimer.current) clearTimeout(flashTimer.current);
  }, []);

  /* nudge appears ~1.5s after load */
  React.useEffect(() => {
    const id = setTimeout(() => setNudgeReady(true), 1500);
    return () => clearTimeout(id);
  }, []);
  const resolveMeta = key => {
    const b = BASE_META.find(m => m.key === key);
    if (b) return {
      key,
      label: baseLabels[key] || b.label,
      custom: false,
      col: null
    };
    const c = customColumns.find(x => x.id === key);
    return c ? {
      key,
      label: c.label,
      custom: true,
      col: c
    } : null;
  };
  const orderedAll = order.map(resolveMeta).filter(Boolean);
  const orderedVisible = orderedAll.filter(m => !hidden.includes(m.key));
  const cols = buildCols(orderedVisible, true);

  /* P1-5 filters + P1-4 search across custom values */
  const filterableFields = orderedVisible.filter(m => m.custom && FILTERABLE_TYPES.includes(m.col.type));
  const activeFilterEntries = Object.entries(filters).filter(([, v]) => v && v.length > 0);
  const fieldLabelForKey = key => key === "status" ? "Status" : (customColumns.find(c => c.id === key) || {}).label || key;
  const toggleFilterValue = (key, val) => setFilters(prev => {
    const cur = prev[key] || [];
    const next = cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val];
    const copy = {
      ...prev
    };
    if (next.length) copy[key] = next;else delete copy[key];
    return copy;
  });
  const clearFilters = () => setFilters({});
  const activeFilterChips = activeFilterEntries.flatMap(([key, vals]) => vals.map(val => ({
    key,
    val,
    label: fieldLabelForKey(key)
  })));
  const matchesFilters = r => activeFilterEntries.every(([key, vals]) => {
    if (key === "status") return vals.includes(r.status);
    const col = customColumns.find(c => c.id === key);
    if (!col) return true;
    const cv = r.custom && key in r.custom ? r.custom[key] : col.def;
    if (col.type === "checkbox") return vals.includes(cv ? "Yes" : "No");
    return vals.includes(cv);
  });
  const rows = rowsState.filter(r => {
    if (query) {
      const hay = ((r.title || "") + " " + r.acct + " " + r.acctSub + " " + r.amt + " " + r.status + " " + Object.values(r.custom || {}).join(" ")).toLowerCase();
      if (!hay.includes(query.toLowerCase())) return false;
    }
    return matchesFilters(r);
  });

  /* P2-11 — selection derived from the currently-visible (filtered) rows */
  const rowIndices = rows.map(r => rowsState.indexOf(r));
  const allSelected = rowIndices.length > 0 && rowIndices.every(i => selected.has(i));
  const someSelected = rowIndices.some(i => selected.has(i));
  const toggleSelect = idx => setSelected(prev => {
    const n = new Set(prev);
    n.has(idx) ? n.delete(idx) : n.add(idx);
    return n;
  });
  const toggleSelectAll = () => setSelected(prev => {
    const n = new Set(prev);
    if (allSelected) rowIndices.forEach(i => n.delete(i));else rowIndices.forEach(i => n.add(i));
    return n;
  });
  const clearSelection = () => setSelected(new Set());
  const bulkFields = orderedVisible.filter(m => m.custom && (m.col.type === "dropdown" || m.col.type === "member"));
  const bulkSetValue = (colId, value) => {
    setRowsState(prev => prev.map((x, i) => selected.has(i) ? clearPending({
      ...x,
      custom: {
        ...(x.custom || {}),
        [colId]: value
      }
    }, colId) : x));
    clearSelection();
  };

  /* left-sticky pins for Date & Time and Transaction Details — measured from the rendered header cells (see layout effect below) so a reordered flexible column upstream doesn't throw off the pin */
  React.useLayoutEffect(() => {
    const row = headerRowRef.current;
    if (!row) return;
    const measure = () => {
      /* offsetLeft of a *stuck* sticky cell reports natural + scrollLeft; measuring while
         horizontally scrolled (e.g. on window resize) would corrupt the pins. Neutralise scroll
         synchronously (restored before paint, so no flicker) to always read the natural offset. */
      const scroller = scrollRef.current;
      const prevScroll = scroller ? scroller.scrollLeft : 0;
      if (prevScroll) scroller.scrollLeft = 0;
      const next = {};
      ["select", "date", "details"].forEach(key => {
        const el = row.querySelector(`[data-col-key="${key}"]`);
        if (el) next[key] = el.offsetLeft;
      });
      if (prevScroll) scroller.scrollLeft = prevScroll;
      setStickyLeft(prev => prev.select === next.select && prev.date === next.date && prev.details === next.details ? prev : {
        ...prev,
        ...next
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [orderedVisible]);

  /* Feature 2 — one accept-bar per visible assisted column with unconfirmed cells */
  const pendingBars = !lab.autofill ? [] : orderedVisible.filter(m => m.custom && m.col.alfie && !reviewLater.includes(m.col.id)).map(m => ({
    key: m.col.id,
    label: m.label,
    source: alfieSourceOf(m.col.alfie),
    count: rowsState.filter(r => r.aiPending && r.aiPending[m.col.id]).length
  })).filter(b => b.count > 0);
  /* P1-7 — count of unconfirmed suggestions per column (for the header re-surface badge) */
  const pendingCountFor = key => rowsState.filter(r => r.aiPending && r.aiPending[key]).length;
  const toggleHidden = k => setHidden(p => p.includes(k) ? p.filter(x => x !== k) : [...p, k]);
  const toggleRequired = k => setRequired(p => p.includes(k) ? p.filter(x => x !== k) : [...p, k]);
  /* editing/confirming a cell drops its "suggested" flag */
  const clearPending = (r, colId) => {
    if (!r.aiPending || !(colId in r.aiPending)) return r;
    const next = {
      ...r.aiPending
    };
    delete next[colId];
    return {
      ...r,
      aiPending: next
    };
  };
  const setCellValue = (row, colId, value) => setRowsState(prev => prev.map(x => x === row ? clearPending({
    ...x,
    custom: {
      ...(x.custom || {}),
      [colId]: value
    }
  }, colId) : x));
  const confirmCell = (row, colId) => setRowsState(prev => prev.map(x => x === row ? clearPending(x, colId) : x));
  const confirmColumn = colId => setRowsState(prev => prev.map(x => x.aiPending && colId in x.aiPending ? clearPending(x, colId) : x));
  const addOptionToField = (row, colId, optValue) => {
    setCustomColumns(cs => cs.map(c => c.id === colId && !c.options.includes(optValue) ? {
      ...c,
      options: [...c.options, optValue]
    } : c));
    setCellValue(row, colId, optValue);
  };

  /* Feature 2/3 — pre-populate card rows with suggested (unconfirmed) values */
  const applyFill = (colId, alfieKey) => {
    const fn = AI_FILL[alfieKey];
    if (!fn) return;
    setRowsState(prev => {
      let ci = -1;
      return prev.map(r => {
        if (r.acctType !== "card") return r;
        ci += 1;
        const v = fn(r, ci);
        if (v === "" || v == null) return r;
        return {
          ...r,
          custom: {
            ...(r.custom || {}),
            [colId]: v
          },
          aiPending: {
            ...(r.aiPending || {}),
            [colId]: true
          }
        };
      });
    });
  };

  /* Feature 4 — the extra option Alfie proposes for an assisted dropdown, if not already present */
  const optionSuggestFor = col => {
    if (!lab.optionSuggest || col.type !== "dropdown" || !col.alfie) return null;
    const s = ALFIE_OPTION[col.alfie];
    if (!s || (col.options || []).includes(s.value)) return null;
    return s;
  };

  /* Feature 1 — suggestions not yet added as columns */
  const availableSuggestions = ALFIE_FIELDS.filter(s => !customColumns.some(c => c.alfie === s.key));
  const valueCount = key => rowsState.filter(r => r.custom && r.custom[key]).length;
  const startDelete = key => {
    setConfirmKey(null);
    setPending(p => p.includes(key) ? p : [...p, key]);
    timers.current[key] = setTimeout(() => finalizeDelete(key), 5000);
  };
  const undoDelete = key => {
    clearTimeout(timers.current[key]);
    delete timers.current[key];
    setPending(p => p.filter(k => k !== key));
  };
  const finalizeDelete = key => {
    delete timers.current[key];
    setPending(p => p.filter(k => k !== key));
    setCustomColumns(c => c.filter(x => x.id !== key));
    setOrder(o => o.filter(k => k !== key));
    setHidden(h => h.filter(k => k !== key));
    setRequired(rq => rq.filter(k => k !== key));
  };
  const saveField = p => {
    // required / hidden flags apply for every field
    const setFlag = (arr, key, on) => on ? arr.includes(key) ? arr : [...arr, key] : arr.filter(x => x !== key);
    if (p.base) {
      setBaseLabels(bl => ({
        ...bl,
        [p.id]: p.label
      }));
      setRequired(rq => setFlag(rq, p.id, p.required));
      setHidden(h => setFlag(h, p.id, p.hidden));
    } else if (p.id) {
      setCustomColumns(cs => cs.map(c => c.id === p.id ? {
        ...c,
        label: p.label,
        type: p.type,
        options: p.options,
        def: p.def,
        desc: p.desc
      } : c));
      setRequired(rq => setFlag(rq, p.id, p.required));
      setHidden(h => setFlag(h, p.id, p.hidden));
    } else {
      const id = "c" + Date.now();
      setCustomColumns(cs => [...cs, {
        id,
        label: p.label,
        type: p.type,
        options: p.options,
        def: p.def,
        desc: p.desc,
        alfie: p.alfie || null
      }]);
      // insert right after Status so a new column lands in view, not far off-screen right; admin can reorder later
      setOrder(o => {
        const i = o.indexOf("status");
        return i === -1 ? [...o, id] : [...o.slice(0, i + 1), id, ...o.slice(i + 1)];
      });
      setRequired(rq => setFlag(rq, id, p.required));
      setHidden(h => setFlag(h, id, p.hidden));
      if (lab.autofill && p.alfie && AI_FILL[p.alfie]) applyFill(id, p.alfie);
      // reveal + highlight the new column (ColumnHeader scrolls itself into view; flash fades over 1.2s)
      setFlashId(id);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlashId(null), 1500);
      setManagerOpen(false); // creating closes the drawer so the highlighted new column is visible
    }
    setEditor(null);
  };

  /* Feature 3 — nudge "Create" adds the Project field directly */
  const createProjectFromNudge = () => {
    const sug = alfieFieldByKey("project");
    saveField({
      base: false,
      label: sug.label,
      type: sug.type,
      options: sug.options.slice(),
      def: "",
      desc: "",
      required: false,
      hidden: false,
      alfie: sug.key
    });
  };
  const openRow = r => setSelectedIdx(rowsState.indexOf(r));
  const filtersBtn = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    border: "1px solid #E7E7E7",
    borderRadius: 8,
    padding: "10px 16px",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,.07)",
    fontFamily: "Poppins, sans-serif",
    fontSize: 14,
    fontWeight: 600,
    color: NAVY,
    transition: `transform .12s ${EASE}`
  };
  const editorField = editor && editor.key ? resolveMeta(editor.key) : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      minHeight: "100vh",
      height: "100vh",
      background: "#F2F2F2",
      WebkitFontSmoothing: "antialiased"
    },
    "data-screen-label": "Transactions"
  }, /*#__PURE__*/React.createElement(Sidebar, null), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      minWidth: 0,
      padding: "0 0 26px",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      display: "flex",
      flexDirection: "column",
      padding: "26px 34px 0",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      font: "700 24px/30px Quicksand, sans-serif",
      color: NAVY,
      margin: 0,
      textWrap: "balance"
    }
  }, "Welcome back, TAN WEI LING"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 22
    }
  }, ["help", "guide", "user", "logout"].map(k => /*#__PURE__*/React.createElement("span", {
    key: k,
    style: {
      cursor: "pointer",
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement(HeaderIcon, {
    kind: k
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 26,
      borderBottom: "1px solid #C0EEE4",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "0 0 12px",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 15,
      fontWeight: 700,
      color: NAVY,
      borderBottom: "2px solid " + MINT,
      marginBottom: -1
    }
  }, "Transactions")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 18,
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("button", _extends({
    onClick: () => setFiltersOpen(o => !o),
    style: {
      ...filtersBtn,
      borderColor: filtersOpen || activeFilterChips.length ? MINT : "#E7E7E7"
    }
  }, press), /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "15",
    height: "15",
    fill: "none",
    stroke: MINT,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 5h18l-7 8v5l-4 2v-7L3 5z"
  })), "Filters", activeFilterChips.length > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 18,
      height: 18,
      padding: "0 5px",
      borderRadius: 9999,
      background: MINT,
      color: NAVY,
      fontFamily: "Quicksand, sans-serif",
      fontSize: 11,
      fontWeight: 700,
      fontVariantNumeric: "tabular-nums"
    }
  }, activeFilterChips.length), /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "14",
    height: "14",
    fill: "none",
    stroke: NAVY,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      transform: filtersOpen ? "rotate(180deg)" : "none",
      transition: `transform .15s ${EASE}`
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 9l6 6 6-6"
  }))), filtersOpen && /*#__PURE__*/React.createElement(FiltersPopover, {
    customFields: filterableFields,
    filters: filters,
    onToggle: toggleFilterValue,
    onClear: clearFilters,
    onClose: () => setFiltersOpen(false)
  })), /*#__PURE__*/React.createElement("button", _extends({
    onClick: () => setManagerOpen(true),
    style: filtersBtn
  }, press), /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "16",
    height: "16",
    fill: "none",
    stroke: MINT,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 6h10M4 12h16M4 18h7"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "17",
    cy: "6",
    r: "2.4"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "14",
    cy: "18",
    r: "2.4"
  })), "Manage fields")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "#fff",
      border: "1px solid #E7E7E7",
      borderRadius: 9999,
      padding: "10px 16px",
      width: 260,
      boxShadow: "0 2px 4px rgba(0,0,0,.07)"
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: query,
    onChange: e => setQuery(e.target.value),
    placeholder: "Search transactions",
    style: {
      flex: 1,
      border: "none",
      outline: "none",
      background: "transparent",
      fontFamily: "Poppins, sans-serif",
      fontSize: 13.5,
      color: NAVY
    }
  }), /*#__PURE__*/React.createElement(SearchIcon, null)), /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": "Export transactions",
    title: "Export transactions",
    style: {
      width: 46,
      height: 42,
      borderRadius: 8,
      background: NAVY,
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      boxShadow: "0 2px 4px rgba(0,0,0,.07)",
      transition: `transform .12s ${EASE}`
    }
  }, press), /*#__PURE__*/React.createElement(DownloadIcon, null)))), activeFilterChips.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 8,
      marginBottom: 16
    }
  }, activeFilterChips.map(chip => /*#__PURE__*/React.createElement("span", {
    key: chip.key + "|" + chip.val,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: "#fff",
      border: "1px solid #E7E7E7",
      borderRadius: 9999,
      padding: "5px 6px 5px 12px",
      fontFamily: "Quicksand, sans-serif",
      fontSize: 12.5,
      fontWeight: 500,
      color: NAVY,
      boxShadow: "0 2px 4px rgba(0,0,0,.07)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#939393"
    }
  }, chip.label, ":"), "\xA0", chip.val, /*#__PURE__*/React.createElement("button", _extends({
    onClick: () => toggleFilterValue(chip.key, chip.val),
    "aria-label": "Remove filter " + chip.label + " " + chip.val
  }, press, {
    style: {
      width: 18,
      height: 18,
      borderRadius: "50%",
      border: "none",
      background: "#F2F2F2",
      color: "#4A4A4A",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      transition: `transform .12s ${EASE}`
    }
  }), /*#__PURE__*/React.createElement("svg", {
    width: "10",
    height: "10",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 6l12 12M18 6 6 18"
  }))))), /*#__PURE__*/React.createElement("button", _extends({
    onClick: clearFilters
  }, press, {
    style: {
      background: "transparent",
      border: "none",
      cursor: "pointer",
      color: MINT,
      fontFamily: "Quicksand, sans-serif",
      fontSize: 13,
      fontWeight: 700,
      padding: "4px 6px"
    }
  }), "Clear all")), lab.nudge && nudgeReady && !nudgeDismissed && !customColumns.some(c => c.alfie === "project") && /*#__PURE__*/React.createElement(AlfieNudge, {
    onCreate: createProjectFromNudge,
    onDismiss: () => setNudgeDismissed(true)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff",
      borderRadius: 14,
      flex: 1,
      minHeight: 0,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      border: "1px solid #C0EEE4",
      boxShadow: "0 0 2px rgba(39,216,178,.25)"
    }
  }, pendingBars.map(b => /*#__PURE__*/React.createElement(AlfieAcceptBar, {
    key: b.key,
    label: b.label,
    count: b.count,
    source: b.source,
    onAcceptAll: () => confirmColumn(b.key),
    onReviewLater: () => setReviewLater(p => [...p, b.key])
  })), /*#__PURE__*/React.createElement("div", {
    ref: scrollRef,
    style: {
      flex: 1,
      minHeight: 0,
      overflow: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: "max-content"
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: headerRowRef,
    style: {
      position: "sticky",
      top: 0,
      zIndex: 3,
      display: "grid",
      gridTemplateColumns: cols,
      padding: "14px 28px",
      gap: 14,
      background: MINT,
      fontFamily: "Quicksand, sans-serif",
      fontSize: 13,
      fontWeight: 600,
      color: "#fff",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    "data-col-key": "select",
    style: {
      position: "sticky",
      left: stickyLeft.select,
      zIndex: 2,
      background: MINT,
      boxShadow: "14px 0 0 " + MINT,
      alignSelf: "stretch",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(SelectCheck, {
    checked: allSelected,
    indeterminate: !allSelected && someSelected,
    onToggle: toggleSelectAll,
    label: allSelected ? "Deselect all rows" : "Select all rows"
  })), orderedVisible.map(m => {
    const pc = lab.autofill && m.custom && reviewLater.includes(m.key) ? pendingCountFor(m.key) : 0;
    /* header click lands on the editor view of the unified drawer; back from there reveals the manager */
    const header = /*#__PURE__*/React.createElement(ColumnHeader, {
      meta: m,
      required: required.includes(m.key),
      flash: m.key === flashId,
      onEdit: () => {
        setManagerOpen(true);
        setEditor({
          mode: "edit",
          key: m.key
        });
      },
      pendingCount: pc,
      onAcceptAll: () => confirmColumn(m.key),
      onReopen: () => setReviewLater(p => p.filter(k => k !== m.key))
    });
    return stickyLeft[m.key] != null
    /* zIndex 2 (not 1): the non-sticky ColumnHeader label spans carry zIndex 1 to sit above FieldFlash — a sticky cell at the same level would let a scrolled label paint through the mint band. */ ? /*#__PURE__*/React.createElement("div", {
      key: m.key,
      "data-col-key": m.key,
      style: {
        position: "sticky",
        left: stickyLeft[m.key],
        zIndex: 2,
        background: MINT,
        boxShadow: "14px 0 0 " + MINT,
        alignSelf: "stretch",
        display: "flex",
        alignItems: "center"
      }
    }, header) : /*#__PURE__*/React.createElement(React.Fragment, {
      key: m.key
    }, header);
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": "Manage fields",
    onClick: () => setManagerOpen(true),
    style: {
      width: 28,
      height: 28,
      borderRadius: 8,
      border: "none",
      background: "rgba(255,255,255,.22)",
      color: "#fff",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      transition: `transform .12s ${EASE}`
    }
  }, press), /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M5 12h14"
  }))))), rows.map((r, i) => /*#__PURE__*/React.createElement(Row, {
    key: i,
    r: r,
    last: i === rows.length - 1,
    cols: cols,
    orderedVisible: orderedVisible,
    stickyLeft: stickyLeft,
    onOpen: () => openRow(r),
    onCellChange: (colId, v) => setCellValue(r, colId, v),
    onApprove: () => setApproval(r, "approved"),
    onReject: () => setApproval(r, "rejected"),
    lab: lab,
    onConfirmCell: colId => confirmCell(r, colId),
    onAddOption: (colId, val) => addOptionToField(r, colId, val),
    optionSuggestFor: optionSuggestFor,
    selected: selected.has(rowIndices[i]),
    onToggleSelect: () => toggleSelect(rowIndices[i]),
    requiredKeys: required
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "#707070",
      fontSize: 13.5,
      fontWeight: 500,
      padding: "14px 0 0"
    }
  }, "Showing ", rows.length, " of ", ROWS.length, " transactions")), selectedIdx != null && rowsState[selectedIdx] && /*#__PURE__*/React.createElement(TransactionDrawer, {
    r: rowsState[selectedIdx],
    onClose: () => setSelectedIdx(null),
    customFields: orderedVisible.filter(m => m.custom),
    requiredKeys: required,
    lab: lab,
    onCellChange: (colId, v) => setCellValue(rowsState[selectedIdx], colId, v),
    onConfirmCell: colId => confirmCell(rowsState[selectedIdx], colId),
    onAddOption: (colId, val) => addOptionToField(rowsState[selectedIdx], colId, val),
    optionSuggestFor: optionSuggestFor
  }), drawerMounted && /*#__PURE__*/React.createElement(FieldDrawer, {
    open: managerOpen,
    view: editor ? "editor" : "manager",
    onClose: () => {
      setManagerOpen(false);
      setEditor(null);
    },
    onBack: () => setEditor(null),
    manager: /*#__PURE__*/React.createElement(ManagerView, {
      orderedAll: orderedAll,
      hidden: hidden,
      required: required,
      pending: pending,
      onClose: () => {
        setManagerOpen(false);
        setEditor(null);
      },
      onReorder: setOrder,
      onToggleHidden: toggleHidden,
      onToggleRequired: toggleRequired,
      onEdit: key => setEditor({
        mode: "edit",
        key
      }),
      onDeleteRequest: key => setConfirmKey(key),
      onUndo: undoDelete,
      onAddField: () => setEditor({
        mode: "create"
      }),
      lab: lab,
      suggestions: availableSuggestions,
      onPickSuggestion: sug => setEditor({
        mode: "create",
        preset: sug
      }),
      suggestsDismissed: suggestsDismissed,
      onDismissSuggests: () => setSuggestsDismissed(true)
    }),
    editorView: editor ? /*#__PURE__*/React.createElement(EditorView, {
      key: editor.mode + ":" + (editor.key || "") + ":" + (editor.preset ? editor.preset.key : ""),
      mode: editor.mode,
      field: editorField,
      preset: editor.preset || null,
      initialRequired: editor.key ? required.includes(editor.key) : false,
      initialHidden: editor.key ? hidden.includes(editor.key) : false,
      onBack: () => setEditor(null),
      onSubmit: saveField,
      onDelete: editorField && editorField.custom ? () => {
        const k = editor.key;
        setEditor(null);
        setConfirmKey(k);
      } : undefined,
      lab: lab,
      suggestions: availableSuggestions,
      suggestsDismissed: suggestsDismissed,
      onDismissSuggests: () => setSuggestsDismissed(true)
    }) : null
  }), confirmKey && resolveMeta(confirmKey) && /*#__PURE__*/React.createElement(DeleteConfirmModal, {
    label: resolveMeta(confirmKey).label,
    count: valueCount(confirmKey),
    onCancel: () => setConfirmKey(null),
    onConfirm: () => startDelete(confirmKey)
  }), !managerOpen && pending.length > 0 && /*#__PURE__*/React.createElement(PendingToasts, {
    items: pending.map(resolveMeta).filter(Boolean),
    onUndo: undoDelete
  }), selected.size > 0 && !(!managerOpen && pending.length > 0) && /*#__PURE__*/React.createElement(BulkBar, {
    count: selected.size,
    fields: bulkFields,
    onApply: bulkSetValue,
    onClear: clearSelection
  }), /*#__PURE__*/React.createElement(DesignLabPanel, {
    lab: lab,
    onToggle: toggleLab
  })));
};
window.FieldManagerExplorer = FieldManagerExplorer;