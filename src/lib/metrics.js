export function parseDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function overlaps(period, from, to) {
  const pStart = parseDate(period.start);
  const pEnd = parseDate(period.end);
  const rStart = parseDate(from);
  const rEnd = parseDate(to);
  return pStart <= rEnd && pEnd >= rStart;
}

export function filterPeriods(from, to, periods = []) {
  if (!from || !to) return periods;
  return periods.filter((p) => overlaps(p, from, to));
}

export function formatValue(metricDef, cell) {
  if (metricDef.kind === "rate") return `${cell.value}%`;
  return String(cell.value);
}

export function isFavorable(metricDef, cell) {
  if (cell.variance == null || cell.up == null) return null;
  if (metricDef.invert) return !cell.up;
  return cell.up;
}

export function varianceLabel(cell) {
  if (cell.variance == null) return "N/A";
  const sign = cell.up ? "+" : "−";
  const unit = cell.unit === "ppts" ? "ppts" : "%";
  return `${sign}${cell.variance}${unit}`;
}

export function phaseGroups(periods) {
  const groups = [];
  periods.forEach((p) => {
    const last = groups[groups.length - 1];
    if (last && last.phase === p.phase && last.phaseSub === p.phaseSub) {
      last.span += 2;
      last.periods.push(p);
    } else {
      groups.push({ phase: p.phase, phaseSub: p.phaseSub, span: 2, periods: [p] });
    }
  });
  return groups;
}

export function fmtNum(v) {
  return String(v);
}

export function deltaText(first, last, key, kind, metricsDefs = []) {
  const a = first.metrics[key].value;
  const b = last.metrics[key].value;
  const diff = +(b - a).toFixed(1);
  if (diff === 0) return { diff: 0, label: "unchanged" };
  const sign = diff > 0 ? "+" : "";
  const unit = kind === "rate" ? "ppts" : "";
  const def = metricsDefs.find((m) => m.key === key);
  return {
    diff,
    label: `${sign}${diff}${unit}`,
    improved: def?.invert ? diff < 0 : diff > 0,
  };
}

export function normalizeRange(from, to) {
  if (parseDate(from) > parseDate(to)) return { from: to, to: from };
  return { from, to };
}

export function toIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatRangeLabel(from, to) {
  if (!from || !to) return "—";
  return `${from} → ${to}`;
}

/** Suggest a compare range of equal length immediately before the primary range. */
export function suggestPreviousRange(from, to) {
  const start = parseDate(from);
  const end = parseDate(to);
  const dayMs = 24 * 60 * 60 * 1000;
  const lengthDays = Math.round((end - start) / dayMs) + 1;
  const prevEnd = new Date(start.getTime() - dayMs);
  const prevStart = new Date(prevEnd.getTime() - (lengthDays - 1) * dayMs);
  return {
    from: toIsoDate(prevStart),
    to: toIsoDate(prevEnd),
  };
}

/** Compare range must fully end before the primary range starts. */
export function isCompareBeforePrimary(compareFrom, compareTo, primaryFrom, primaryTo) {
  if (!compareFrom || !compareTo || !primaryFrom || !primaryTo) return false;
  const compare = normalizeRange(compareFrom, compareTo);
  const primary = normalizeRange(primaryFrom, primaryTo);
  return parseDate(compare.to) < parseDate(primary.from);
}

/** Latest allowed compare "To" date = day before primary From. */
export function maxCompareToDate(primaryFrom) {
  if (!primaryFrom) return "";
  const dayMs = 24 * 60 * 60 * 1000;
  return toIsoDate(new Date(parseDate(primaryFrom).getTime() - dayMs));
}

export function validateCompareRange(compareFrom, compareTo, primaryFrom, primaryTo) {
  if (!compareFrom || !compareTo) {
    return "Set both compare From and To dates, or turn off comparison.";
  }

  const compare = normalizeRange(compareFrom, compareTo);
  const primary = normalizeRange(primaryFrom, primaryTo);

  if (parseDate(compare.to) >= parseDate(primary.from)) {
    return `Compare range must end before the primary range starts (before ${primary.from}).`;
  }

  if (parseDate(compare.from) > parseDate(compare.to)) {
    return "Compare From date must be on or before Compare To date.";
  }

  return "";
}

/** Average metric values across periods in a selected date range. */
export function aggregatePeriods(periods, metricsDefs = [], label = "Selected range") {
  if (!periods.length) return null;

  const metrics = {};
  metricsDefs.forEach((def) => {
    const values = periods
      .map((p) => p.metrics?.[def.key]?.value)
      .filter((v) => typeof v === "number" && !Number.isNaN(v));
    const units = periods.map((p) => p.metrics?.[def.key]?.unit).filter(Boolean);
    const avg =
      values.length > 0
        ? +(values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2)
        : 0;
    metrics[def.key] = {
      value: avg,
      variance: null,
      unit: units[0] || (def.kind === "rate" ? "ppts" : "%"),
      up: null,
    };
  });

  return {
    id: "aggregate",
    label,
    start: periods[0].start,
    end: periods[periods.length - 1].end,
    phase: periods.length === 1 ? periods[0].phase : "Aggregated selection",
    phaseSub:
      periods.length === 1
        ? periods[0].phaseSub
        : `${periods.length} periods averaged`,
    metrics,
    periodCount: periods.length,
  };
}

export function buildComparisonRows(primary, compare, metricsDefs = []) {
  if (!primary || !compare) return [];

  return metricsDefs.map((def) => {
    const a = primary.metrics[def.key]?.value ?? 0;
    const b = compare.metrics[def.key]?.value ?? 0;
    const diff = +(a - b).toFixed(2);
    const improved = def.invert ? diff < 0 : diff > 0;
    const unchanged = diff === 0;
    const unit = def.kind === "rate" ? "ppts" : "";
    const sign = diff > 0 ? "+" : "";

    return {
      key: def.key,
      label: def.label,
      kind: def.kind,
      invert: def.invert,
      primary: a,
      compare: b,
      diff,
      diffLabel: unchanged ? "0" : `${sign}${diff}${unit}`,
      improved: unchanged ? null : improved,
    };
  });
}
