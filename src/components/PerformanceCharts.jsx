import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { COLORS, METRICS, RATE_KEYS, VOLUME_KEYS } from "../data/reportData";

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

export default function PerformanceCharts({ periods }) {
  const volumeRef = useRef(null);
  const rateRef = useRef(null);
  const volumeChart = useRef(null);
  const rateChart = useRef(null);

  useEffect(() => {
    const labels = periods.map((p) => p.label);
    const empty = !periods.length;

    if (volumeChart.current) volumeChart.current.destroy();
    if (rateChart.current) rateChart.current.destroy();

    volumeChart.current = new Chart(volumeRef.current, {
      type: "bar",
      data: {
        labels: empty ? ["No data"] : labels,
        datasets: empty
          ? []
          : VOLUME_KEYS.map((key) => {
              const def = METRICS.find((m) => m.key === key);
              return {
                label: def.label.replace(" Count", "").replace(" AI", ""),
                data: periods.map((p) => p.metrics[key].value),
                backgroundColor: COLORS[key],
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
          : RATE_KEYS.map((key) => {
              const def = METRICS.find((m) => m.key === key);
              return {
                label: def.label,
                data: periods.map((p) => p.metrics[key].value),
                borderColor: COLORS[key],
                backgroundColor: `${COLORS[key]}22`,
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

    return () => {
      volumeChart.current?.destroy();
      rateChart.current?.destroy();
    };
  }, [periods]);

  return (
    <section className="charts" aria-label="Performance charts">
      <article className="chart-card">
        <h2>Volume metrics</h2>
        <p className="chart-sub">Daily averages — leads, replies, sign-ups, and lost leads</p>
        <div className="chart-wrap">
          <canvas ref={volumeRef} aria-label="Volume metrics bar chart" />
        </div>
      </article>
      <article className="chart-card">
        <h2>Rate trends</h2>
        <p className="chart-sub">Contact, conversion, and lost-leads rates (%)</p>
        <div className="chart-wrap">
          <canvas ref={rateRef} aria-label="Rate trends line chart" />
        </div>
      </article>
    </section>
  );
}
