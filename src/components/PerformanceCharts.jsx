import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { DEFAULT_META } from "../data/reportData";

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

export default function PerformanceCharts({
  periods,
  compareMode = false,
  primaryAggregate = null,
  compareAggregate = null,
  primaryLabel = "Primary",
  compareLabel = "Compare",
  metrics = DEFAULT_META.metrics,
  volumeKeys = DEFAULT_META.volumeKeys,
  rateKeys = DEFAULT_META.rateKeys,
  colors = DEFAULT_META.colors,
}) {
  const volumeRef = useRef(null);
  const rateRef = useRef(null);
  const volumeChart = useRef(null);
  const rateChart = useRef(null);

  useEffect(() => {
    if (volumeChart.current) volumeChart.current.destroy();
    if (rateChart.current) rateChart.current.destroy();

    if (compareMode && primaryAggregate && compareAggregate) {
      const volumeLabels = volumeKeys.map((key) => {
        const def = metrics.find((m) => m.key === key);
        return (def?.label || key).replace(" Count", "").replace(" AI", "");
      });
      const rateLabels = rateKeys.map((key) => {
        const def = metrics.find((m) => m.key === key);
        return def?.label || key;
      });

      volumeChart.current = new Chart(volumeRef.current, {
        type: "bar",
        data: {
          labels: volumeLabels,
          datasets: [
            {
              label: primaryLabel,
              data: volumeKeys.map((key) => primaryAggregate.metrics[key]?.value ?? 0),
              backgroundColor: "#0f766e",
              borderRadius: 6,
              maxBarThickness: 36,
            },
            {
              label: compareLabel,
              data: volumeKeys.map((key) => compareAggregate.metrics[key]?.value ?? 0),
              backgroundColor: "#94a3b8",
              borderRadius: 6,
              maxBarThickness: 36,
            },
          ],
        },
        options: commonOptions,
      });

      rateChart.current = new Chart(rateRef.current, {
        type: "bar",
        data: {
          labels: rateLabels,
          datasets: [
            {
              label: primaryLabel,
              data: rateKeys.map((key) => primaryAggregate.metrics[key]?.value ?? 0),
              backgroundColor: "#0369a1",
              borderRadius: 6,
              maxBarThickness: 36,
            },
            {
              label: compareLabel,
              data: rateKeys.map((key) => compareAggregate.metrics[key]?.value ?? 0),
              backgroundColor: "#cbd5e1",
              borderRadius: 6,
              maxBarThickness: 36,
            },
          ],
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
    } else {
      const labels = periods.map((p) => p.label);
      const empty = !periods.length;

      volumeChart.current = new Chart(volumeRef.current, {
        type: "bar",
        data: {
          labels: empty ? ["No data"] : labels,
          datasets: empty
            ? []
            : volumeKeys.map((key) => {
                const def = metrics.find((m) => m.key === key) || { label: key };
                return {
                  label: def.label.replace(" Count", "").replace(" AI", ""),
                  data: periods.map((p) => p.metrics[key]?.value ?? 0),
                  backgroundColor: colors[key],
                  borderRadius: 6,
                  maxBarThickness: 28,
                };
              }),
        },
        options: commonOptions,
      });

      rateChart.current = new Chart(rateRef.current, {
        type: "line",
        data: {
          labels: empty ? ["No data"] : labels,
          datasets: empty
            ? []
            : rateKeys.map((key) => {
                const def = metrics.find((m) => m.key === key) || { label: key };
                return {
                  label: def.label,
                  data: periods.map((p) => p.metrics[key]?.value ?? 0),
                  borderColor: colors[key],
                  backgroundColor: `${colors[key]}22`,
                  tension: 0.35,
                  fill: false,
                  pointRadius: 5,
                  pointHoverRadius: 7,
                  pointBackgroundColor: "#fff",
                  pointBorderWidth: 2,
                  borderWidth: 2.5,
                };
              }),
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
    }

    return () => {
      volumeChart.current?.destroy();
      rateChart.current?.destroy();
    };
  }, [
    periods,
    compareMode,
    primaryAggregate,
    compareAggregate,
    primaryLabel,
    compareLabel,
    metrics,
    volumeKeys,
    rateKeys,
    colors,
  ]);

  return (
    <section className="charts" aria-label="Performance charts">
      <article className="chart-card">
        <h2>{compareMode ? "Volume comparison" : "Volume metrics"}</h2>
        <p className="chart-sub">
          {compareMode
            ? "Averaged volume metrics for each selected date range"
            : "Daily averages — leads, replies, sign-ups, and lost leads"}
        </p>
        <div className="chart-wrap">
          <canvas ref={volumeRef} aria-label="Volume metrics chart" />
        </div>
      </article>
      <article className="chart-card">
        <h2>{compareMode ? "Rate comparison" : "Rate trends"}</h2>
        <p className="chart-sub">
          {compareMode
            ? "Averaged contact, conversion, and lost-leads rates"
            : "Contact, conversion, and lost-leads rates (%)"}
        </p>
        <div className="chart-wrap">
          <canvas ref={rateRef} aria-label="Rate metrics chart" />
        </div>
      </article>
    </section>
  );
}
