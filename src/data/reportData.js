export const METRICS = [
  { key: "totalLeads", label: "Total Leads* Count", kind: "count", invert: false },
  { key: "replied", label: "Replied Cust. Count", kind: "count", invert: false },
  { key: "contactRate", label: "Contact Rate", kind: "rate", invert: false },
  { key: "signUps", label: "Sign Ups AI", kind: "count", invert: false },
  { key: "conversionRate", label: "Conversion Rate", kind: "rate", invert: false },
  { key: "lostLeads", label: "Lost Leads AI", kind: "count", invert: true },
  { key: "lostRate", label: "Lost Leads Rate", kind: "rate", invert: true },
];

export const PERIODS = [
  {
    id: "p1",
    start: "2026-06-19",
    end: "2026-06-25",
    label: "Jun 19–25",
    phase: "New All 10Gbps Portfolio",
    phaseSub: "Spiel more Consultative. No drawer",
    metrics: {
      totalLeads: { value: 23, variance: 79, unit: "%", up: true },
      replied: { value: 17, variance: 96, unit: "%", up: true },
      contactRate: { value: 74, variance: 11, unit: "ppts", up: true },
      signUps: { value: 2.9, variance: 10, unit: "%", up: true },
      conversionRate: { value: 17, variance: 8, unit: "ppts", up: false },
      lostLeads: { value: 2.0, variance: null, unit: "%", up: null },
      lostRate: { value: 12, variance: null, unit: "ppts", up: null },
    },
  },
  {
    id: "p2",
    start: "2026-06-26",
    end: "2026-07-05",
    label: "Jun 26–5 Jul",
    phase: "New All 10Gbps Portfolio",
    phaseSub: "Spiel more Consultative. No drawer",
    metrics: {
      totalLeads: { value: 20, variance: 11, unit: "%", up: false },
      replied: { value: 13, variance: 20, unit: "%", up: false },
      contactRate: { value: 66, variance: 8, unit: "ppts", up: false },
      signUps: { value: 2.6, variance: 9, unit: "%", up: false },
      conversionRate: { value: 20, variance: 3, unit: "ppts", up: true },
      lostLeads: { value: 1.1, variance: 45, unit: "%", up: false },
      lostRate: { value: 17, variance: 5, unit: "ppts", up: true },
    },
  },
  {
    id: "p3",
    start: "2026-07-06",
    end: "2026-07-19",
    label: "Jul 6–19",
    phase: "Start of Retail hand-off",
    phaseSub: "Duplicate and existing customer",
    metrics: {
      totalLeads: { value: 23.1, variance: 19, unit: "%", up: true },
      replied: { value: 16.8, variance: 30, unit: "%", up: true },
      contactRate: { value: 72.8, variance: 6.3, unit: "ppts", up: true },
      signUps: { value: 1.3, variance: 50, unit: "%", up: false },
      conversionRate: { value: 7.7, variance: 12.4, unit: "ppts", up: false },
      lostLeads: { value: 2.4, variance: 118, unit: "%", up: true },
      lostRate: { value: 15, variance: 2, unit: "ppts", up: false },
    },
  },
];

export const PRESETS = [
  { id: "all", label: "All periods", from: "2026-06-19", to: "2026-07-19" },
  { id: "p1", label: "Jun 19–25", from: "2026-06-19", to: "2026-06-25" },
  { id: "p2", label: "Jun 26–Jul 5", from: "2026-06-26", to: "2026-07-05" },
  { id: "portfolio", label: "10Gbps Portfolio", from: "2026-06-19", to: "2026-07-05" },
  { id: "retail", label: "Retail hand-off", from: "2026-07-06", to: "2026-07-19" },
];

export const VOLUME_KEYS = ["totalLeads", "replied", "signUps", "lostLeads"];
export const RATE_KEYS = ["contactRate", "conversionRate", "lostRate"];

export const COLORS = {
  totalLeads: "#0f766e",
  replied: "#0ea5e9",
  signUps: "#ca8a04",
  lostLeads: "#dc2626",
  contactRate: "#0f766e",
  conversionRate: "#0369a1",
  lostRate: "#be123c",
};

export const DEFAULT_FROM = "2026-06-19";
export const DEFAULT_TO = "2026-07-19";
