export default function DateControls({
  rangeFrom,
  rangeTo,
  compareFrom,
  compareTo,
  compareEnabled,
  compareMaxDate = "",
  compareValidationError = "",
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
            <input
              type="date"
              value={rangeTo}
              min={rangeFrom || undefined}
              onChange={(e) => onToChange(e.target.value)}
            />
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
            Compare with a past range
          </label>
        </span>
        <div className={`range-inputs${compareEnabled ? "" : " is-disabled"}`}>
          <label>
            From
            <input
              type="date"
              value={compareFrom}
              max={compareMaxDate || undefined}
              disabled={!compareEnabled}
              onChange={(e) => onCompareFromChange(e.target.value)}
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={compareTo}
              min={compareFrom || undefined}
              max={compareMaxDate || undefined}
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
        {compareEnabled && (
          <p className={`phase-note${compareValidationError ? " is-error" : ""}`}>
            {compareValidationError ||
              `Compare range must end before primary starts${
                compareMaxDate ? ` (on or before ${compareMaxDate})` : ""
              }.`}
          </p>
        )}
      </div>

      <div className="control-block control-actions">
        <span className="control-label">Actions</span>
        <button
          type="button"
          className="btn-apply"
          onClick={onApply}
          disabled={compareEnabled && Boolean(compareValidationError)}
        >
          {compareEnabled ? "Compare ranges" : "Apply range"}
        </button>
      </div>
    </section>
  );
}
