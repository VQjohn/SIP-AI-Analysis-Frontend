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
      <div className="controls-grid">
        <div className="control-block">
          <div className="control-heading">
            <span className="control-label">Primary range</span>
          </div>
          <div className="range-inputs">
            <label>
              From
              <input
                type="date"
                value={rangeFrom}
                onChange={(e) => onFromChange(e.target.value)}
              />
            </label>
            <span className="range-sep" aria-hidden="true">
              –
            </span>
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
        </div>

        <div className={`control-block compare-block${compareEnabled ? "" : " is-off"}`}>
          <div className="control-heading">
            <label className="compare-toggle">
              <input
                type="checkbox"
                checked={compareEnabled}
                onChange={(e) => onCompareEnabledChange(e.target.checked)}
              />
              <span>Compare range</span>
            </label>
            {compareEnabled && (
              <button
                type="button"
                className="btn-text"
                onClick={onSuggestPrevious}
              >
                Use previous period
              </button>
            )}
          </div>
          {compareEnabled ? (
            <>
              <div className="range-inputs">
                <label>
                  From
                  <input
                    type="date"
                    value={compareFrom}
                    max={compareMaxDate || undefined}
                    onChange={(e) => onCompareFromChange(e.target.value)}
                  />
                </label>
                <span className="range-sep" aria-hidden="true">
                  –
                </span>
                <label>
                  To
                  <input
                    type="date"
                    value={compareTo}
                    min={compareFrom || undefined}
                    max={compareMaxDate || undefined}
                    onChange={(e) => onCompareToChange(e.target.value)}
                  />
                </label>
              </div>
              {compareValidationError && (
                <p className="phase-note is-error" role="alert">
                  {compareValidationError}
                </p>
              )}
            </>
          ) : (
            <p className="compare-hint">Turn on to compare against an earlier date range.</p>
          )}
        </div>
      </div>

      <div className="controls-footer">
        <p className="phase-note" dangerouslySetInnerHTML={{ __html: phaseNote }} />
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
