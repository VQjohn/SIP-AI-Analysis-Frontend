/** Fallback defaults when sample/meta has not loaded yet. */
export const DEFAULT_FROM = "2026-06-19";
export const DEFAULT_TO = "2026-07-19";

export const DEFAULT_META = {
  metrics: [
    { key: "totalLeads", label: "Total Leads* Count", kind: "count", invert: false },
    { key: "replied", label: "Replied Cust. Count", kind: "count", invert: false },
    { key: "contactRate", label: "Contact Rate", kind: "rate", invert: false },
    { key: "signUps", label: "Sign Ups AI", kind: "count", invert: false },
    { key: "conversionRate", label: "Conversion Rate", kind: "rate", invert: false },
    { key: "lostLeads", label: "Lost Leads AI", kind: "count", invert: true },
    { key: "lostRate", label: "Lost Leads Rate", kind: "rate", invert: true },
  ],
  volumeKeys: ["totalLeads", "replied", "signUps", "lostLeads"],
  rateKeys: ["contactRate", "conversionRate", "lostRate"],
  colors: {
    totalLeads: "#0f766e",
    replied: "#0ea5e9",
    signUps: "#ca8a04",
    lostLeads: "#dc2626",
    contactRate: "#0f766e",
    conversionRate: "#0369a1",
    lostRate: "#be123c",
  },
  presets: [
    { id: "all", label: "All periods", from: "2026-06-19", to: "2026-07-19" },
    { id: "p1", label: "Jun 19–25", from: "2026-06-19", to: "2026-06-25" },
    { id: "p2", label: "Jun 26–Jul 5", from: "2026-06-26", to: "2026-07-05" },
    { id: "portfolio", label: "10Gbps Portfolio", from: "2026-06-19", to: "2026-07-05" },
    { id: "retail", label: "Retail hand-off", from: "2026-07-06", to: "2026-07-19" },
  ],
  defaults: { from: DEFAULT_FROM, to: DEFAULT_TO },
};
