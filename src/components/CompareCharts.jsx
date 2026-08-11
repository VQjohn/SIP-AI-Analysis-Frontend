import { useEffect, useMemo, useRef } from "react";
import Chart from "chart.js/auto";
import { DEFAULT_META } from "../data/reportData";
import { formatRangeLabel } from "../lib/metrics";

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        boxWidth: 12,
        boxHeight: 12,
        usePointStyle: true,
        pointStyle: "circle",
        font: { family: "'DM Sans', sans-serif", size: 11 },
        color: "#3d4f5c",
        padding: 14,
      },
    },
    tooltip: {
      backgroundColor: "#14212b",
      titleFont: { family: "'DM Sans', sans-serif", size: 12 },
      bodyFont: { family: "'DM Sans', sans-serif", size: 12 },
      padding: 10,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { family: "'DM Sans', sans-serif", size: 11 }, color: "#6b7c88" },
    },
    y: {
      beginAtZero: true,
      grid: { color: "rgba(213, 221, 227, 0.9)" },
      border: { display: false },
      ticks: { font: { family: "'DM Sans', sans-serif", size: 11 }, color: "#6b7c88" },
    },
  },
  animation: { duration: 650, easing: "easeOutQuart" },
};

function mergeTimeline(primaryPeriods, comparePeriods) {
  const map = new Map();

  primaryPeriods.forEach((p) => {
    map.set(p.id, {
      id: p.id,
      label: p.label,
      start: p.start,
      primary: p,
      compare: null,
    });
  });

  comparePeriods.forEach((p) => {
    const existing = map.get(p.id);
    if (existing) {
      existing.compare = p;
    } else {
      map.set(p.id, {
        id: p.id,
        label: p.label,
        start: p.start,
        primary: null,
        compare: p,
      });
    }
  });

  return [...map.values()].sort((a, b) => a.start.localeCompare(b.start));
}

export default function CompareCharts({
  primaryPeriods,
  comparePeriods,
  primaryFrom,
  primaryTo,
  compareFrom,
  compareTo,
  metrics = DEFAULT_META.metrics,
  volumeKeys = DEFAULT_META.volumeKeys,
  rateKeys = DEFAULT_META.rateKeys,
}) {
  const volumeRef = useRef(null);
  const rateRef = useRef(null);
  const volumeChart = useRef(null);
  const rateChart = useRef(null);

  const timeline = useMemo(
    () => mergeTimeline(primaryPeriods, comparePeriods),
    [primaryPeriods, comparePeriods]
  );

  const primaryRange = formatRangeLabel(primaryFrom, primaryTo);
  const compareRange = formatRangeLabel(compareFrom, compareTo);
  const chartKey = `${primaryFrom}_${primaryTo}_${compareFrom}_${compareTo}_${timeline.map((t) => t.id).join("-")}`;

  useEffect(() => {
    if (volumeChart.current) volumeChart.current.destroy();
    if (rateChart.current) rateChart.current.destroy();

    const labels = timeline.length
      ? timeline.map((t) => t.label)
      : ["No overlapping periods"];

    const focusVolumeKeys = volumeKeys.filter((key) =>
      ["totalLeads", "signUps", "lostLeads"].includes(key)
    );

    const volumePalette = {
      totalLeads: { primary: "#0f766e", compare: "#99f6e4" },
      signUps: { primary: "#ca8a04", compare: "#fde68a" },
      lostLeads: { primary: "#dc2626", compare: "#fecaca" },
    };

    const volumeDatasets = focusVolumeKeys.flatMap((key) => {
      const def = metrics.find((m) => m.key === key) || { label: key };
      const short = def.label.replace(" Count", "").replace(" AI", "");
      const palette = volumePalette[key] || { primary: "#0f766e", compare: "#94a3b8" };
      return [
        {
          label: `${short} · ${primaryRange}`,
          data: timeline.map((t) => t.primary?.metrics?.[key]?.value ?? null),
          backgroundColor: palette.primary,
          borderRadius: 6,
          maxBarThickness: 22,
        },
        {
          label: `${short} · ${compareRange}`,
          data: timeline.map((t) => t.compare?.metrics?.[key]?.value ?? null),
          backgroundColor: palette.compare,
          borderRadius: 6,
          maxBarThickness: 22,
        },
      ];
    });

    volumeChart.current = new Chart(volumeRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: timeline.length ? volumeDatasets : [],
      },
      options: {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          legend: {
            ...commonOptions.plugins.legend,
            labels: {
              ...commonOptions.plugins.legend.labels,
              font: { family: "'DM Sans', sans-serif", size: 10 },
            },
          },
        },
      },
    });

    const rateDatasets = rateKeys.flatMap((key) => {
      const def = metrics.find((m) => m.key === key) || { label: key };
      const color = {
        contactRate: "#0f766e",
        conversionRate: "#0369a1",
        lostRate: "#be123c",
      }[key] || "#64748b";

      return [
        {
          label: `${def.label} · ${primaryRange}`,
          data: timeline.map((t) => t.primary?.metrics?.[key]?.value ?? null),
          borderColor: color,
          backgroundColor: color,
          tension: 0.35,
          spanGaps: false,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: "#fff",
          pointBorderWidth: 2,
          borderWidth: 2.5,
        },
        {
          label: `${def.label} · ${compareRange}`,
          data: timeline.map((t) => t.compare?.metrics?.[key]?.value ?? null),
          borderColor: color,
          backgroundColor: "#fff",
          borderDash: [6, 4],
          tension: 0.35,
          spanGaps: false,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: "#fff",
          pointBorderWidth: 2,
          borderWidth: 2,
        },
      ];
    });

    rateChart.current = new Chart(rateRef.current, {
      type: "line",
      data: {
        labels,
        datasets: timeline.length ? rateDatasets : [],
      },
      options: {
        ...commonOptions,
        scales: {
          ...commonOptions.scales,
          y: {
            ...commonOptions.scales.y,
            ticks: {
              ...commonOptions.scales.y.ticks,
              callback: (v) => `${v}%`,
            },
          },
        },
      },
    });

    return () => {
      volumeChart.current?.destroy();
      rateChart.current?.destroy();
    };
  }, [chartKey, timeline, metrics, volumeKeys, rateKeys, primaryRange, compareRange]);

  return (
    <section className="charts compare-charts" aria-label="Date comparison charts">
      <article className="chart-card">
        <h2>Volume by selected dates</h2>
        <p className="chart-sub">
          Primary <strong>{primaryRange}</strong> vs Compare <strong>{compareRange}</strong> —
          bars change with the periods inside each date selection
        </p>
        <div className="chart-wrap chart-wrap-tall">
          <canvas ref={volumeRef} aria-label="Volume comparison by date" />
        </div>
      </article>
      <article className="chart-card">
        <h2>Rates by selected dates</h2>
        <p className="chart-sub">
          Solid lines = Primary · Dashed lines = Compare · X-axis follows report periods in
          range
        </p>
        <div className="chart-wrap chart-wrap-tall">
          <canvas ref={rateRef} aria-label="Rate comparison by date" />
        </div>
      </article>
    </section>
  );
}
