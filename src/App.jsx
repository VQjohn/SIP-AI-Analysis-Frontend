import { useEffect, useMemo, useState } from "react";
import { getApiBase, getReport, getReportMeta } from "./api/client";
import DateControls from "./components/DateControls";
import PerformanceCharts from "./components/PerformanceCharts";
import MetricsTable from "./components/MetricsTable";
import AiOverview from "./components/AiOverview";
import { DEFAULT_FROM, DEFAULT_META, DEFAULT_TO } from "./data/reportData";
import { normalizeRange } from "./lib/metrics";

export default function App() {
  const [meta, setMeta] = useState(DEFAULT_META);
  const [periods, setPeriods] = useState([]);
  const [activePreset, setActivePreset] = useState("all");
  const [rangeFrom, setRangeFrom] = useState(DEFAULT_FROM);
  const [rangeTo, setRangeTo] = useState(DEFAULT_TO);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [dataSource, setDataSource] = useState("loading");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMeta() {
      try {
        const { data, source } = await getReportMeta();
        if (cancelled) return;
        setMeta({ ...DEFAULT_META, ...data });
        const from = data.defaults?.from || data.presets?.[0]?.from || DEFAULT_FROM;
        const to = data.defaults?.to || data.presets?.[0]?.to || DEFAULT_TO;
        setRangeFrom(from);
        setRangeTo(to);
        setDataSource(source);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load report meta");
      }
    }

    loadMeta();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadReport() {
      if (!rangeFrom || !rangeTo) return;
      setLoading(true);
      setError("");
      try {
        const { data, source } = await getReport(rangeFrom, rangeTo);
        if (cancelled) return;
        setPeriods(data.periods || []);
        setDataSource(source);
      } catch (err) {
        if (!cancelled) {
          setPeriods([]);
          setError(err.message || "Failed to load report");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadReport();
    return () => {
      cancelled = true;
    };
  }, [rangeFrom, rangeTo]);

  const phaseNote = useMemo(() => {
    if (loading) return "Loading report periods…";
    if (!periods.length) return "No overlapping report periods for this range.";
    const phases = [...new Set(periods.map((p) => p.phase))];
    return `Showing <strong>${periods.length}</strong> period${
      periods.length > 1 ? "s" : ""
    } · ${phases.join(" · ")}`;
  }, [periods, loading]);

  function applyRange(from, to, presetId) {
    const next = normalizeRange(from, to);
    setRangeFrom(next.from);
    setRangeTo(next.to);
    setActivePreset(presetId || "custom");
  }

  function handleApplyCustom() {
    if (!rangeFrom || !rangeTo) return;
    applyRange(rangeFrom, rangeTo, "custom");
  }

  return (
    <>
      <div className="page">
        <header className="hero">
          <h1>AI Daily Average</h1>
          <p>
            Select a date range to compare lead conversion metrics across portfolio
            phases — charts and table update together.
          </p>
          <p className="phase-note" style={{ marginTop: "0.75rem" }}>
            Data source:{" "}
            <strong>
              {dataSource === "api"
                ? `API (${getApiBase()})`
                : dataSource === "sample"
                  ? "sample JSON (/sample)"
                  : "loading…"}
            </strong>
          </p>
        </header>

        {error && (
          <div className="panel" style={{ marginBottom: "1rem", color: "#b91c1c" }}>
            {error}
          </div>
        )}

        <DateControls
          presets={meta.presets || DEFAULT_META.presets}
          activePreset={activePreset}
          rangeFrom={rangeFrom}
          rangeTo={rangeTo}
          phaseNote={phaseNote}
          onPreset={applyRange}
          onFromChange={setRangeFrom}
          onToChange={setRangeTo}
          onApplyCustom={handleApplyCustom}
        />

        <PerformanceCharts
          periods={periods}
          metrics={meta.metrics || DEFAULT_META.metrics}
          volumeKeys={meta.volumeKeys || DEFAULT_META.volumeKeys}
          rateKeys={meta.rateKeys || DEFAULT_META.rateKeys}
          colors={meta.colors || DEFAULT_META.colors}
        />
        <MetricsTable periods={periods} metrics={meta.metrics || DEFAULT_META.metrics} />
      </div>

      <AiOverview
        periods={periods}
        metrics={meta.metrics || DEFAULT_META.metrics}
        rangeFrom={rangeFrom}
        rangeTo={rangeTo}
        open={overviewOpen}
        onToggle={() => setOverviewOpen((v) => !v)}
      />
    </>
  );
}
