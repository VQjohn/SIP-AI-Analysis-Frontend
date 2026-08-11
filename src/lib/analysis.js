import { METRICS } from "../data/reportData";
import { deltaText, fmtNum, isFavorable } from "./metrics";

export function buildConversionImprovements(periods) {
  const last = periods[periods.length - 1];
  const first = periods[0];
  const m = last.metrics;
  const multi = periods.length > 1;
  const convLow = m.conversionRate.value < 12;
  const signUpsSoft = m.signUps.value < 2;
  const lostHigh = m.lostLeads.value >= 2 || m.lostRate.value >= 14;
  const contactStrong = m.contactRate.value >= 70;
  const convDrop = multi
    ? last.metrics.conversionRate.value - first.metrics.conversionRate.value
    : 0;

  const items = [];

  items.push({
    title:
      contactStrong && (convLow || signUpsSoft)
        ? "Close more of the customers AI already contacts"
        : "Tighten AI close asks after reply",
    detail: contactStrong
      ? `Contact Rate is strong at <strong>${fmtNum(m.contactRate.value)}%</strong>, but Sign Ups AI is only <strong>${fmtNum(m.signUps.value)}</strong> and Conversion <strong>${fmtNum(m.conversionRate.value)}%</strong>. Improve the post-reply close: clearer offer, urgency, and next-step CTA so more replied customers become AI sign-ups.`
      : `Raise both reach and close quality — ask for the sign-up decision sooner after a positive reply, with a simple plan recommendation and one clear CTA.`,
  });

  items.push({
    title:
      convLow || convDrop < 0
        ? "Strengthen AI consultative spiel to lift conversion"
        : "Keep optimizing the winning spiel",
    detail:
      convDrop < 0
        ? `Conversion fell from <strong>${fmtNum(first.metrics.conversionRate.value)}%</strong> to <strong>${fmtNum(m.conversionRate.value)}%</strong>. Refresh AI scripts for objections (price, speed, existing plan) and A/B test consultative vs promotional wording to recover close rate.`
        : `Conversion sits at <strong>${fmtNum(m.conversionRate.value)}%</strong>. Keep refining objection handling and plan matching so AI converts a higher share of contacted leads.`,
  });

  items.push({
    title: lostHigh
      ? "Reduce AI lost leads before they drop"
      : "Prevent mid-funnel drop-offs in AI chat",
    detail: lostHigh
      ? `Lost Leads AI is <strong>${fmtNum(m.lostLeads.value)}</strong> (rate <strong>${fmtNum(m.lostRate.value)}%</strong>). Add same-session recovery prompts, follow-up sequences, and clearer value proof when customers hesitate — convert them inside AI instead of letting them go cold.`
      : `Add timed follow-ups and value reminders for hesitant replies so fewer warm leads stall before sign-up.`,
  });

  items.push({
    title: "Prioritize high-intent leads for AI close effort",
    detail: signUpsSoft
      ? `With Sign Ups AI at <strong>${fmtNum(m.signUps.value)}</strong>, score intent (timeline, plan interest, eligibility) and put AI close energy on the hottest replies first — fewer shallow chats, more completed conversions.`
      : `Use intent scoring so AI spends more turns on leads most likely to sign up, and keep light nurture for lower-intent replies.`,
  });

  const retailPeriod = periods.find((p) => p.phase.includes("Retail")) || last;
  const rm = retailPeriod.metrics;
  const retailLearn = {
    summary:
      `During Retail hand-off (<strong>${retailPeriod.label}</strong>), AI Sign Ups dropped to ` +
      `<strong>${fmtNum(rm.signUps.value)}</strong> and Conversion to <strong>${fmtNum(rm.conversionRate.value)}%</strong>, ` +
      `while Contact Rate stayed relatively healthy at <strong>${fmtNum(rm.contactRate.value)}%</strong>. ` +
      `Retail converted the fallout AI did not finish — especially <strong>duplicate and existing customers</strong> — ` +
      `by clarifying account status, matching the right plan, and closing the same leads AI had already engaged.`,
    prompts: [
      {
        why: "Retail win → AI prompt: own the existing/duplicate customer path",
        text: "If the customer is an existing or duplicate account, do not stop at a soft hand-off. Confirm account status, explain upgrade/retention options clearly, and ask for a sign-up decision in the same conversation.",
      },
      {
        why: "Retail win → AI prompt: recover hesitant fallout before losing the lead",
        text: "When a customer hesitates after contact, treat it as a recoverable close: restate the value, handle price/speed/existing-plan objections, offer one best-fit plan, and ask a direct close question before marking the lead lost.",
      },
      {
        why: "Retail win → AI prompt: consultative close, not just contact",
        text: 'After a reply, act like a Retail closer: diagnose need, recommend one plan, remove friction (eligibility, install, billing), and use a clear CTA — "Shall I proceed with your sign-up now?"',
      },
      {
        why: "Retail win → AI prompt: keep context and finish the sale",
        text: "Never restart discovery if intent is already known. Reuse what the customer said (speed need, budget, existing plan), personalize the offer, and complete conversion in-chat whenever the customer is eligible.",
      },
    ],
  };

  return { items, retailLearn };
}

export function buildOverview(periods) {
  if (!periods.length) {
    return {
      summary: "No report periods overlap this date range, so there is nothing to analyze yet.",
      insights: [],
      improvements: { items: [], retailLearn: null },
    };
  }

  const first = periods[0];
  const last = periods[periods.length - 1];
  const phases = [...new Set(periods.map((p) => p.phase))];
  const multi = periods.length > 1;
  const insights = [];

  if (multi) {
    const conv = deltaText(first, last, "conversionRate", "rate");
    const signUps = deltaText(first, last, "signUps", "count");
    const contact = deltaText(first, last, "contactRate", "rate");
    const leads = deltaText(first, last, "totalLeads", "count");
    const lost = deltaText(first, last, "lostLeads", "count");

    const summary =
      `Across <strong>${first.label}</strong> to <strong>${last.label}</strong> (${phases.join(" → ")}), ` +
      `AI conversion moved from <strong>${fmtNum(first.metrics.conversionRate.value)}%</strong> to ` +
      `<strong>${fmtNum(last.metrics.conversionRate.value)}%</strong> (${conv.label}), while Sign Ups AI ` +
      `went from <strong>${fmtNum(first.metrics.signUps.value)}</strong> to ` +
      `<strong>${fmtNum(last.metrics.signUps.value)}</strong> (${signUps.label}). ` +
      (conv.diff < 0 || signUps.diff < 0
        ? "The main story is softer AI close-out despite stable lead intake."
        : "Overall conversion posture looks constructive in this window.");

    if (contact.diff > 0 || leads.diff >= 0) {
      insights.push({
        type: "win",
        tag: "Strength",
        text:
          `Lead engagement held up: Contact Rate is <strong>${fmtNum(last.metrics.contactRate.value)}%</strong>` +
          (contact.diff ? ` (${contact.label} vs first period)` : "") +
          ` with Total Leads at <strong>${fmtNum(last.metrics.totalLeads.value)}</strong>.`,
      });
    }

    if (conv.diff < 0 || signUps.diff < 0) {
      insights.push({
        type: "risk",
        tag: "Risk",
        text:
          `AI close metrics weakened — Conversion Rate <strong>${fmtNum(last.metrics.conversionRate.value)}%</strong> ` +
          `and Sign Ups AI <strong>${fmtNum(last.metrics.signUps.value)}</strong>. ` +
          `Investigate hand-off quality and duplicate/existing-customer mix.`,
      });
    } else {
      insights.push({
        type: "win",
        tag: "Conversion",
        text:
          `Sign-ups and conversion are holding or improving versus the start of the range. ` +
          `Keep the current spiel and routing rules that support this.`,
      });
    }

    if (lost.diff > 0) {
      insights.push({
        type: "watch",
        tag: "Watch",
        text:
          `Lost Leads AI rose to <strong>${fmtNum(last.metrics.lostLeads.value)}</strong> (${lost.label}). ` +
          `Lost Leads Rate is <strong>${fmtNum(last.metrics.lostRate.value)}%</strong> — monitor recovery paths.`,
      });
    } else {
      insights.push({
        type: "action",
        tag: "Next step",
        text:
          `Use this range as a baseline: compare Contact Rate (${fmtNum(last.metrics.contactRate.value)}%) ` +
          `against Conversion Rate (${fmtNum(last.metrics.conversionRate.value)}%) weekly to catch funnel slip early.`,
      });
    }

    if (phases.some((p) => p.includes("Retail"))) {
      insights[insights.length - 1] = {
        type: "action",
        tag: "Next step",
        text:
          `Retail hand-off is in view. Align AI and Retail on duplicate/existing customers so fallout ` +
          `after AI contact can be recovered without dropping reported Sign Ups and Conversion.`,
      };
    }

    return {
      summary,
      insights: insights.slice(0, 3),
      improvements: buildConversionImprovements(periods),
    };
  }

  const p = first;
  const m = p.metrics;
  const favorable = METRICS.filter((def) => isFavorable(def, m[def.key]) === true).length;
  const unfavorable = METRICS.filter((def) => isFavorable(def, m[def.key]) === false).length;

  const summary =
    `For <strong>${p.label}</strong> under <strong>${p.phase}</strong> (${p.phaseSub}), ` +
    `daily averages show <strong>${fmtNum(m.totalLeads.value)}</strong> leads, ` +
    `<strong>${fmtNum(m.contactRate.value)}%</strong> contact rate, ` +
    `<strong>${fmtNum(m.signUps.value)}</strong> AI sign-ups, and ` +
    `<strong>${fmtNum(m.conversionRate.value)}%</strong> conversion. ` +
    `Variance vs last week: <strong>${favorable}</strong> favorable / <strong>${unfavorable}</strong> unfavorable signals.`;

  if (isFavorable(METRICS.find((x) => x.key === "contactRate"), m.contactRate)) {
    insights.push({
      type: "win",
      tag: "Strength",
      text: `Contact Rate at <strong>${fmtNum(m.contactRate.value)}%</strong> is a favorable move — outreach quality is supporting replies.`,
    });
  } else {
    insights.push({
      type: "watch",
      tag: "Watch",
      text: `Contact Rate at <strong>${fmtNum(m.contactRate.value)}%</strong> softened vs last week — check spiel and response timing.`,
    });
  }

  if (
    isFavorable(METRICS.find((x) => x.key === "conversionRate"), m.conversionRate) === false ||
    isFavorable(METRICS.find((x) => x.key === "signUps"), m.signUps) === false
  ) {
    insights.push({
      type: "risk",
      tag: "Risk",
      text:
        `Close-out pressure: Sign Ups AI <strong>${fmtNum(m.signUps.value)}</strong> and Conversion ` +
        `<strong>${fmtNum(m.conversionRate.value)}%</strong> need attention this period.`,
    });
  } else {
    insights.push({
      type: "win",
      tag: "Conversion",
      text:
        `Conversion at <strong>${fmtNum(m.conversionRate.value)}%</strong> with ` +
        `<strong>${fmtNum(m.signUps.value)}</strong> AI sign-ups looks healthy for this window.`,
    });
  }

  insights.push({
    type: "action",
    tag: "Next step",
    text: p.phase.includes("Retail")
      ? `Focus on Retail hand-off continuity for duplicate/existing customers while protecting AI conversion reporting.`
      : `Protect consultative spiel consistency and re-check any drawer/routing changes that could dilute conversion.`,
  });

  return {
    summary,
    insights,
    improvements: buildConversionImprovements(periods),
  };
}
