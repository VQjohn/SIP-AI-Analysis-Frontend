export default function DateControls({
  rangeFrom,
  rangeTo,
  compareFrom,
  compareTo,
  compareEnabled,
  phaseNote,
  onFromChange,
  onToChange,
  onCompareFromChange,
  onCompareToChange,
  onCompareEnabledChange,
  onApply,
  onSuggestPrevious,
}) {
  return (
    <section className="panel controls" aria-label="Date range comparison controls">
      <div className="control-block" style={{ flex: "1 1 320px" }}>
        <span className="control-label">Primary range</span>
        <div className="range-inputs">
          <label>
            From
            <input type="date" value={rangeFrom} onChange={(e) => onFromChange(e.target.value)} />
          </label>
          <label>
            To
            <input type="date" value={rangeTo} onChange={(e) => onToChange(e.target.value)} />
          </label>
        </div>
        <p className="phase-note" dangerouslySetInnerHTML={{ __html: phaseNote }} />
      </div>

      <div className="control-block" style={{ flex: "1 1 320px" }}>
        <span className="control-label">
          <label className="compare-toggle">
            <input
              type="checkbox"
              checked={compareEnabled}
              onChange={(e) => onCompareEnabledChange(e.target.checked)}
            />
            Compare with another range
          </label>
        </span>
        <div className={`range-inputs${compareEnabled ? "" : " is-disabled"}`}>
          <label>
            From
            <input
              type="date"
              value={compareFrom}
              disabled={!compareEnabled}
              onChange={(e) => onCompareFromChange(e.target.value)}
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={compareTo}
              disabled={!compareEnabled}
              onChange={(e) => onCompareToChange(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="btn-secondary"
            disabled={!compareEnabled}
            onClick={onSuggestPrevious}
          >
            Use previous period
          </button>
        </div>
      </div>

      <div className="control-block control-actions">
        <span className="control-label">Actions</span>
        <button type="button" className="btn-apply" onClick={onApply}>
          {compareEnabled ? "Compare ranges" : "Apply range"}
        </button>
      </div>
    </section>
  );
}
