import { formatValue, varianceLabel } from "../lib/metrics";

function MetricIcon({ metricKey }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true,
  };

  switch (metricKey) {
    case "totalLeads":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="3.2" fill="currentColor" />
          <circle cx="16" cy="16" r="3.2" fill="currentColor" />
        </svg>
      );
    case "replied":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
          <rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" />
        </svg>
      );
    case "contactRate":
      return (
        <svg {...common}>
          <path
            d="M7.5 3.5c.6-.6 1.6-.5 2.1.2l1.5 2.1c.4.6.3 1.4-.2 1.9l-1 1a12.5 12.5 0 0 0 5.4 5.4l1-1c.5-.5 1.3-.6 1.9-.2l2.1 1.5c.7.5.8 1.5.2 2.1l-1.3 1.3c-.6.6-1.5.9-2.4.7C10.8 17.7 6.3 13.2 5.5 7.1c-.2-.9.1-1.8.7-2.4L7.5 3.5Z"
            fill="currentColor"
          />
        </svg>
      );
    case "signUps":
      return (
        <svg {...common}>
          <path
            d="M5 12.5 10 17.5 19 7"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "conversionRate":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 7v5l3.2 2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" fill="currentColor" />
        </svg>
      );
  }
}

export default function KpiSummary({
  cards = [],
  loading = false,
  rangeLabel = "",
  varianceLabelText = "vs previous period",
}) {
  return (
    <section className="kpi-section" aria-label="Key performance indicators">
      {(rangeLabel || varianceLabelText) && (
        <div className="kpi-section-meta">
          {rangeLabel && (
            <p className="phase-note">
              Averages for <strong>{rangeLabel}</strong>
            </p>
          )}
          {varianceLabelText && (
            <p className="phase-note kpi-variance-note">{varianceLabelText}</p>
          )}
        </div>
      )}
      <div className="kpi-strip">
        {cards.map(({ key, def, cell, favorable }) => {
          const pillClass =
            cell.variance == null || favorable == null
              ? "na"
              : favorable
                ? "good"
                : "bad";
          const arrow = cell.up == null ? null : cell.up ? "▲" : "▼";

          return (
            <article key={key} className="kpi-card">
              <div className="kpi-card-top">
                <span className="kpi-icon">
                  <MetricIcon metricKey={key} />
                </span>
                <h3 className="kpi-label">{def.label}</h3>
              </div>
              <p className="kpi-value">
                {loading || cell.value == null ? "—" : formatValue(def, cell)}
              </p>
              <div className="kpi-card-bottom">
                <span className={`var-pill ${pillClass}`}>
                  {arrow && (
                    <span className="arrow" aria-hidden="true">
                      {arrow}
                    </span>
                  )}
                  {loading || cell.variance == null ? "N/A" : varianceLabel(cell)}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
