export type Attribution = Record<
  | "utm_source"
  | "utm_medium"
  | "utm_campaign"
  | "utm_term"
  | "utm_content"
  | "gclid"
  | "fbclid",
  string
>;

type VisitAttribution = {
  first: Attribution;
  latest: Attribution;
  firstVisitTimestamp: string;
  latestVisitTimestamp: string;
  landingPageUrl: string;
  referrer: string;
  anonymousSessionId: string;
};

const ATTRIBUTION_KEY = "codestra_attribution_v1";
const SESSION_KEY = "codestra_anonymous_session_id";
const keys: (keyof Attribution)[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
];

const readCampaign = (): Attribution => {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    keys.map((key) => [key, params.get(key) ?? ""]),
  ) as Attribution;
};

export const getAnonymousSessionId = () => {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
};

export const captureAttribution = (): VisitAttribution => {
  const now = new Date().toISOString();
  const campaign = readCampaign();
  let stored: VisitAttribution | null = null;
  try {
    stored = JSON.parse(
      localStorage.getItem(ATTRIBUTION_KEY) ?? "null",
    ) as VisitAttribution | null;
  } catch {
    stored = null;
  }
  const value: VisitAttribution = {
    first: stored?.first ?? campaign,
    latest: campaign,
    firstVisitTimestamp: stored?.firstVisitTimestamp ?? now,
    latestVisitTimestamp: now,
    landingPageUrl: stored?.landingPageUrl ?? window.location.href,
    referrer: stored?.referrer ?? document.referrer,
    anonymousSessionId: getAnonymousSessionId(),
  };
  localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(value));
  return value;
};
