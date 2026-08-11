import { filterPeriods } from "../lib/metrics";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(
  /\/$/,
  ""
);

async function readJson(response) {
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json();
}

async function fetchApi(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
  });
  return readJson(response);
}

async function fetchSample(path) {
  const response = await fetch(path, { headers: { Accept: "application/json" } });
  return readJson(response);
}

export async function getReportMeta() {
  try {
    const data = await fetchApi("/report/meta");
    return { data, source: "api" };
  } catch {
    const data = await fetchSample("/sample/meta.json");
    return { data, source: "sample" };
  }
}

export async function getReport(from, to) {
  try {
    const query = new URLSearchParams();
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    const data = await fetchApi(`/report?${query.toString()}`);
    return { data, source: "api" };
  } catch {
    const sample = await fetchSample("/sample/report.json");
    const periods = filterPeriods(from, to, sample.periods || []);
    return {
      data: { from, to, periods },
      source: "sample",
    };
  }
}

export async function getOverview(from, to) {
  try {
    const query = new URLSearchParams({ from, to });
    const data = await fetchApi(`/overview?${query.toString()}`);
    return { data: data.overview, source: "api" };
  } catch {
    const sample = await fetchSample("/sample/overview.json");
    const sameRange =
      sample.from === from && sample.to === to ? sample.overview : null;
    return {
      data: sameRange,
      source: "sample",
      useLocalFallback: !sameRange,
    };
  }
}

export function getApiBase() {
  return API_BASE;
}
