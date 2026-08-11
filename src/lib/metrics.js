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
