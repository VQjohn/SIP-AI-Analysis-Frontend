import { Fragment } from "react";
import { METRICS } from "../data/reportData";
import {
  formatValue,
  isFavorable,
  phaseGroups,
  varianceLabel,
} from "../lib/metrics";

function VariancePill({ metricDef, cell }) {
  if (cell.variance == null) {
    return <span className="var-pill na">N/A</span>;
  }
  const good = isFavorable(metricDef, cell);
  const cls = good ? "good" : "bad";
  const arrow = cell.up ? "▲" : "▼";
  return (
    <span className={`var-pill ${cls}`}>
      <span className="arrow" aria-hidden="true">
        {arrow}
      </span>
      {varianceLabel(cell)}
    </span>
  );
}

export default function MetricsTable({ periods }) {
  if (!periods.length) {
    return (
      <section className="panel table-panel" aria-label="Metrics table">
        <h2>Metrics detail</h2>
        <p className="chart-sub">
          Values and Variance vs last week · green = favorable · red = unfavorable
        </p>
        <div className="empty-state">No periods overlap the selected date range.</div>
      </section>
    );
  }

  const groups = phaseGroups(periods);

  return (
    <section className="panel table-panel" aria-label="Metrics table">
      <h2>Metrics detail</h2>
      <p className="chart-sub">
        Values and Variance vs last week · green = favorable · red = unfavorable
      </p>
      <div className="table-scroll">
        <table className="metrics">
          <thead>
            <tr className="phase">
              <th rowSpan={3}>Metric</th>
              {groups.map((g) => (
                <th key={`${g.phase}-${g.phaseSub}`} colSpan={g.span}>
                  {g.phase}
                  <span className="phase-sub">{g.phaseSub}</span>
                </th>
              ))}
            </tr>
            <tr className="dates">
              {periods.map((p) => (
                <th key={p.id} colSpan={2}>
                  {p.label}
                </th>
              ))}
            </tr>
            <tr className="subhead">
              {periods.map((p) => (
                <Fragment key={p.id}>
                  <th>Value</th>
                  <th>Variance, LW</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRICS.map((m) => (
              <tr key={m.key}>
                <td>{m.label}</td>
                {periods.map((p) => {
                  const cell = p.metrics[m.key];
                  return (
                    <Fragment key={`${p.id}-${m.key}`}>
                      <td>
                        <div className="cell-stack">
                          <span className="metric-value">{formatValue(m, cell)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="cell-stack">
                          <VariancePill metricDef={m} cell={cell} />
                        </div>
                      </td>
                    </Fragment>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
