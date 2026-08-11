import { useMemo, useState } from "react";
import DateControls from "./components/DateControls";
import PerformanceCharts from "./components/PerformanceCharts";
import MetricsTable from "./components/MetricsTable";
import AiOverview from "./components/AiOverview";
import { DEFAULT_FROM, DEFAULT_TO } from "./data/reportData";
import { filterPeriods, normalizeRange } from "./lib/metrics";

export default function App() {
  const [activePreset, setActivePreset] = useState("all");
  const [rangeFrom, setRangeFrom] = useState(DEFAULT_FROM);
  const [rangeTo, setRangeTo] = useState(DEFAULT_TO);
  const [overviewOpen, setOverviewOpen] = useState(false);

  const periods = useMemo(
    () => filterPeriods(rangeFrom, rangeTo),
    [rangeFrom, rangeTo]
  );

  const phaseNote = useMemo(() => {
    if (!periods.length) return "No overlapping report periods for this range.";
    const phases = [...new Set(periods.map((p) => p.phase))];
    return `Showing <strong>${periods.length}</strong> period${
      periods.length > 1 ? "s" : ""
    } · ${phases.join(" · ")}`;
  }, [periods]);

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
        </header>

        <DateControls
          activePreset={activePreset}
          rangeFrom={rangeFrom}
          rangeTo={rangeTo}
          phaseNote={phaseNote}
          onPreset={applyRange}
          onFromChange={setRangeFrom}
          onToChange={setRangeTo}
          onApplyCustom={handleApplyCustom}
        />

        <PerformanceCharts periods={periods} />
        <MetricsTable periods={periods} />
      </div>

      <AiOverview
        periods={periods}
        open={overviewOpen}
        onToggle={() => setOverviewOpen((v) => !v)}
      />
    </>
  );
}
