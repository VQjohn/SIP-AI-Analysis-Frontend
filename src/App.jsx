import { useEffect, useMemo, useState } from "react";
import { getApiBase, getReport, getReportMeta } from "./api/client";
import DateControls from "./components/DateControls";
import PerformanceCharts from "./components/PerformanceCharts";
import CompareCharts from "./components/CompareCharts";
import MetricsTable from "./components/MetricsTable";
import CompareResults from "./components/CompareResults";
import AiOverview from "./components/AiOverview";
import { DEFAULT_FROM, DEFAULT_META, DEFAULT_TO } from "./data/reportData";
import {
  aggregatePeriods,
  buildComparisonRows,
  formatRangeLabel,
  maxCompareToDate,
  normalizeRange,
  suggestPreviousRange,
  validateCompareRange,
} from "./lib/metrics";

export default function App() {
  const [meta, setMeta] = useState(DEFAULT_META);

  const [draftFrom, setDraftFrom] = useState(DEFAULT_FROM);
  const [draftTo, setDraftTo] = useState(DEFAULT_TO);
  const [draftCompareFrom, setDraftCompareFrom] = useState("2026-06-19");
  const [draftCompareTo, setDraftCompareTo] = useState("2026-07-05");
  const [compareEnabled, setCompareEnabled] = useState(false);

  const [appliedFrom, setAppliedFrom] = useState(DEFAULT_FROM);
  const [appliedTo, setAppliedTo] = useState(DEFAULT_TO);
  const [appliedCompareFrom, setAppliedCompareFrom] = useState("");
  const [appliedCompareTo, setAppliedCompareTo] = useState("");
  const [compareActive, setCompareActive] = useState(false);

  const [periods, setPeriods] = useState([]);
  const [comparePeriods, setComparePeriods] = useState([]);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [dataSource, setDataSource] = useState("loading");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const metrics = meta.metrics || DEFAULT_META.metrics;

  useEffect(() => {
    let cancelled = false;

    async function loadMeta() {
      try {
        const { data, source } = await getReportMeta();
        if (cancelled) return;
        setMeta({ ...DEFAULT_META, ...data });
        const from = data.defaults?.from || DEFAULT_FROM;
        const to = data.defaults?.to || DEFAULT_TO;
        setDraftFrom(from);
        setDraftTo(to);
        setAppliedFrom(from);
        setAppliedTo(to);
        const prev = suggestPreviousRange(from, to);
        setDraftCompareFrom(prev.from);
        setDraftCompareTo(prev.to);
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

    async function loadReports() {
      if (!appliedFrom || !appliedTo) return;
      setLoading(true);
      setError("");
      try {
        const primary = await getReport(appliedFrom, appliedTo);
        if (cancelled) return;
        setPeriods(primary.data.periods || []);
        setDataSource(primary.source);

        if (compareActive && appliedCompareFrom && appliedCompareTo) {
          const compare = await getReport(appliedCompareFrom, appliedCompareTo);
          if (cancelled) return;
          setComparePeriods(compare.data.periods || []);
          if (compare.source === "api") setDataSource("api");
        } else {
          setComparePeriods([]);
        }
      } catch (err) {
        if (!cancelled) {
          setPeriods([]);
          setComparePeriods([]);
          setError(err.message || "Failed to load report");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadReports();
    return () => {
      cancelled = true;
    };
  }, [appliedFrom, appliedTo, appliedCompareFrom, appliedCompareTo, compareActive]);

  const primaryAggregate = useMemo(
    () =>
      aggregatePeriods(
        periods,
        metrics,
        `Primary (${formatRangeLabel(appliedFrom, appliedTo)})`
      ),
    [periods, metrics, appliedFrom, appliedTo]
  );

  const compareAggregate = useMemo(
    () =>
      aggregatePeriods(
        comparePeriods,
        metrics,
        `Compare (${formatRangeLabel(appliedCompareFrom, appliedCompareTo)})`
      ),
    [comparePeriods, metrics, appliedCompareFrom, appliedCompareTo]
  );

  const comparisonRows = useMemo(() => {
    if (!compareActive || !primaryAggregate || !compareAggregate) return [];
    return buildComparisonRows(primaryAggregate, compareAggregate, metrics);
  }, [compareActive, primaryAggregate, compareAggregate, metrics]);

  const phaseNote = useMemo(() => {
    if (loading) return "Loading report for selected dates…";
    if (!periods.length) return "No overlapping report periods for the primary range.";
    if (compareActive) {
      return `Primary: <strong>${periods.length}</strong> period(s) · Compare: <strong>${comparePeriods.length}</strong> period(s)`;
    }
    const phases = [...new Set(periods.map((p) => p.phase))];
    return `Showing <strong>${periods.length}</strong> period${
      periods.length > 1 ? "s" : ""
    } · ${phases.join(" · ")}`;
  }, [periods, comparePeriods, compareActive, loading]);

  const compareValidationError = useMemo(() => {
    if (!compareEnabled) return "";
    if (!draftFrom || !draftTo) return "";
    if (!draftCompareFrom && !draftCompareTo) return "";
    return validateCompareRange(
      draftCompareFrom,
      draftCompareTo,
      draftFrom,
      draftTo
    );
  }, [
    compareEnabled,
    draftFrom,
    draftTo,
    draftCompareFrom,
    draftCompareTo,
  ]);

  function handleApply() {
    if (!draftFrom || !draftTo) return;
    const primary = normalizeRange(draftFrom, draftTo);
    setDraftFrom(primary.from);
    setDraftTo(primary.to);
    setAppliedFrom(primary.from);
    setAppliedTo(primary.to);

    if (compareEnabled) {
      const validationError = validateCompareRange(
        draftCompareFrom,
        draftCompareTo,
        primary.from,
        primary.to
      );
      if (validationError) {
        setError(validationError);
        setCompareActive(false);
        setAppliedCompareFrom("");
        setAppliedCompareTo("");
        setComparePeriods([]);
        return;
      }

      const compare = normalizeRange(draftCompareFrom, draftCompareTo);
      setDraftCompareFrom(compare.from);
      setDraftCompareTo(compare.to);
      setAppliedCompareFrom(compare.from);
      setAppliedCompareTo(compare.to);
      setCompareActive(true);
    } else {
      setAppliedCompareFrom("");
      setAppliedCompareTo("");
      setCompareActive(false);
      setComparePeriods([]);
    }
    setError("");
  }

  function handleSuggestPrevious() {
    if (!draftFrom || !draftTo) return;
    const primary = normalizeRange(draftFrom, draftTo);
    const prev = suggestPreviousRange(primary.from, primary.to);
    setDraftCompareFrom(prev.from);
    setDraftCompareTo(prev.to);
    setCompareEnabled(true);
  }

  function handleCompareEnabledChange(enabled) {
    setCompareEnabled(enabled);
    if (!enabled) {
      setCompareActive(false);
      setAppliedCompareFrom("");
      setAppliedCompareTo("");
      setComparePeriods([]);
    } else if (!draftCompareFrom || !draftCompareTo) {
      handleSuggestPrevious();
    }
  }

  return (
    <>
      <div className="page">
        <header className="hero">
          <h1>AI Daily Average</h1>
          <p>
            Choose date ranges to analyze lead conversion metrics — optionally compare
            two selections side by side.
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
          rangeFrom={draftFrom}
          rangeTo={draftTo}
          compareFrom={draftCompareFrom}
          compareTo={draftCompareTo}
          compareEnabled={compareEnabled}
          compareMaxDate={maxCompareToDate(draftFrom)}
          compareValidationError={compareValidationError}
          phaseNote={phaseNote}
          onFromChange={setDraftFrom}
          onToChange={setDraftTo}
          onCompareFromChange={setDraftCompareFrom}
          onCompareToChange={setDraftCompareTo}
          onCompareEnabledChange={handleCompareEnabledChange}
          onApply={handleApply}
          onSuggestPrevious={handleSuggestPrevious}
        />

        {compareActive ? (
          <>
            <CompareResults
              primaryLabel="Primary"
              compareLabel="Compare"
              primaryFrom={appliedFrom}
              primaryTo={appliedTo}
              compareFrom={appliedCompareFrom}
              compareTo={appliedCompareTo}
              rows={comparisonRows}
              metrics={metrics}
            />
            <CompareCharts
              key={`${appliedFrom}-${appliedTo}-${appliedCompareFrom}-${appliedCompareTo}`}
              primaryPeriods={periods}
              comparePeriods={comparePeriods}
              primaryFrom={appliedFrom}
              primaryTo={appliedTo}
              compareFrom={appliedCompareFrom}
              compareTo={appliedCompareTo}
              metrics={metrics}
              volumeKeys={meta.volumeKeys || DEFAULT_META.volumeKeys}
              rateKeys={meta.rateKeys || DEFAULT_META.rateKeys}
            />
            <PerformanceCharts
              key={`primary-${appliedFrom}-${appliedTo}`}
              heading="Primary"
              rangeLabel={formatRangeLabel(appliedFrom, appliedTo)}
              periods={periods}
              metrics={metrics}
              volumeKeys={meta.volumeKeys || DEFAULT_META.volumeKeys}
              rateKeys={meta.rateKeys || DEFAULT_META.rateKeys}
              colors={meta.colors || DEFAULT_META.colors}
            />
            <PerformanceCharts
              key={`compare-${appliedCompareFrom}-${appliedCompareTo}`}
              heading="Compare"
              rangeLabel={formatRangeLabel(appliedCompareFrom, appliedCompareTo)}
              periods={comparePeriods}
              metrics={metrics}
              volumeKeys={meta.volumeKeys || DEFAULT_META.volumeKeys}
              rateKeys={meta.rateKeys || DEFAULT_META.rateKeys}
              colors={meta.colors || DEFAULT_META.colors}
            />
          </>
        ) : (
          <>
            <PerformanceCharts
              key={`single-${appliedFrom}-${appliedTo}`}
              rangeLabel={formatRangeLabel(appliedFrom, appliedTo)}
              periods={periods}
              metrics={metrics}
              volumeKeys={meta.volumeKeys || DEFAULT_META.volumeKeys}
              rateKeys={meta.rateKeys || DEFAULT_META.rateKeys}
              colors={meta.colors || DEFAULT_META.colors}
            />
            <MetricsTable periods={periods} metrics={metrics} />
          </>
        )}
      </div>

      <AiOverview
        periods={periods}
        metrics={metrics}
        rangeFrom={appliedFrom}
        rangeTo={appliedTo}
        open={overviewOpen}
        onToggle={() => setOverviewOpen((v) => !v)}
      />
    </>
  );
}
