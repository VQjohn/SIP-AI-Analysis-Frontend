import { DEFAULT_META } from "../data/reportData";
import { formatRangeLabel, formatValue } from "../lib/metrics";

export default function CompareResults({
  primaryLabel,
  compareLabel,
  primaryFrom,
  primaryTo,
  compareFrom,
  compareTo,
  rows,
  metrics = DEFAULT_META.metrics,
}) {
  if (!rows.length) {
    return (
      <section className="panel table-panel" aria-label="Comparison results">
        <h2>Comparison</h2>
        <p className="chart-sub">Select two date ranges and click Compare ranges.</p>
        <div className="empty-state">No data available for one or both selected ranges.</div>
      </section>
    );
  }

  return (
    <section className="panel table-panel" aria-label="Comparison results">
      <h2>Comparison</h2>
      <p className="chart-sub">
        <strong>{primaryLabel}</strong> ({formatRangeLabel(primaryFrom, primaryTo)}) vs{" "}
        <strong>{compareLabel}</strong> ({formatRangeLabel(compareFrom, compareTo)}) · values
        averaged across overlapping report periods
      </p>
      <div className="table-scroll">
        <table className="metrics compare-table">
          <thead>
            <tr className="dates">
              <th>Metric</th>
              <th>{primaryLabel}</th>
              <th>{compareLabel}</th>
              <th>Delta (primary − compare)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const def = metrics.find((m) => m.key === row.key) || {
                kind: row.kind,
                key: row.key,
              };
              const deltaClass =
                row.improved === null ? "na" : row.improved ? "good" : "bad";
              return (
                <tr key={row.key}>
                  <td>{row.label}</td>
                  <td>
                    <span className="metric-value">
                      {formatValue(def, { value: row.primary })}
                    </span>
                  </td>
                  <td>
                    <span className="metric-value">
                      {formatValue(def, { value: row.compare })}
                    </span>
                  </td>
                  <td>
                    <span className={`var-pill ${deltaClass}`}>
                      {row.improved !== null && (
                        <span className="arrow" aria-hidden="true">
                          {row.diff > 0 ? "▲" : "▼"}
                        </span>
                      )}
                      {row.diffLabel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
