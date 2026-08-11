import { PRESETS } from "../data/reportData";

export default function DateControls({
  activePreset,
  rangeFrom,
  rangeTo,
  phaseNote,
  onPreset,
  onFromChange,
  onToChange,
  onApplyCustom,
}) {
  return (
    <section className="panel controls" aria-label="Date range controls">
      <div className="control-block" style={{ flex: "1 1 280px" }}>
        <span className="control-label">Period presets</span>
        <div className="presets">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`preset${activePreset === p.id ? " active" : ""}`}
              onClick={() => onPreset(p.from, p.to, p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="phase-note" dangerouslySetInnerHTML={{ __html: phaseNote }} />
      </div>
      <div className="control-block">
        <span className="control-label">Custom range</span>
        <div className="range-inputs">
          <label>
            From
            <input type="date" value={rangeFrom} onChange={(e) => onFromChange(e.target.value)} />
          </label>
          <label>
            To
            <input type="date" value={rangeTo} onChange={(e) => onToChange(e.target.value)} />
          </label>
          <button type="button" className="btn-apply" onClick={onApplyCustom}>
            Apply
          </button>
        </div>
      </div>
    </section>
  );
}
