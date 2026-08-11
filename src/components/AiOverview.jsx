import { useEffect, useState } from "react";
import { getOverview } from "../api/client";
import { buildOverview } from "../lib/analysis";

export default function AiOverview({
  periods,
  metrics,
  rangeFrom,
  rangeTo,
  open,
  onToggle,
}) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await getOverview(rangeFrom, rangeTo);
        if (cancelled) return;
        if (result.data) {
          setOverview(result.data);
        } else {
          setOverview(buildOverview(periods, metrics));
        }
      } catch {
        if (!cancelled) setOverview(buildOverview(periods, metrics));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open, rangeFrom, rangeTo, periods, metrics]);

  const items = overview?.improvements?.items || [];
  const retailLearn = overview?.improvements?.retailLearn;

  return (
    <div className="overview-dock">
      {open && (
        <section className="panel overview" aria-label="AI analysis overview">
          <div className="overview-header">
            <h2>AI overview</h2>
            <span className="overview-badge">
              <span className="dot" aria-hidden="true" />
              Analyzed for selected range
            </span>
          </div>

          {loading || !overview ? (
            <p className="overview-empty">Generating overview…</p>
          ) : !overview.insights?.length ? (
            <p className="overview-empty">{overview.summary}</p>
          ) : (
            <>
              <p
                className="overview-summary"
                dangerouslySetInnerHTML={{ __html: overview.summary }}
              />
              <div className="insight-grid">
                {overview.insights.map((i) => (
                  <article key={`${i.tag}-${i.type}`} className={`insight ${i.type}`}>
                    <span className="insight-tag">{i.tag}</span>
                    <p dangerouslySetInnerHTML={{ __html: i.text }} />
                  </article>
                ))}
              </div>

              {items.length > 0 && (
                <div className="improve-block">
                  <h3>How AI can convert more customers</h3>
                  <p className="improve-lead">
                    Actions to raise AI Sign Ups and Conversion Rate — using what Retail
                    already proves converts.
                  </p>
                  <ol className="improve-list">
                    {items.map((item, idx) => (
                      <li key={item.title}>
                        <span className="improve-num">{idx + 1}</span>
                        <div>
                          <strong>{item.title}</strong>
                          <span dangerouslySetInnerHTML={{ __html: item.detail }} />
                        </div>
                      </li>
                    ))}
                  </ol>

                  {retailLearn && (
                    <div className="retail-learn">
                      <h4>What Retail did that converted customers</h4>
                      <p dangerouslySetInnerHTML={{ __html: retailLearn.summary }} />
                      <h4>Implement in the AI prompt</h4>
                      <ul className="prompt-tips">
                        {retailLearn.prompts.map((p) => (
                          <li key={p.why}>
                            <span className="why">{p.why}</span>
                            <code>{p.text}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      )}

      <button
        type="button"
        className={`btn-overview${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-controls="overviewSection"
        onClick={onToggle}
      >
        {open ? "Hide AI overview" : "Generate AI overview"}
      </button>
    </div>
  );
}
