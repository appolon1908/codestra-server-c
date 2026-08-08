import { captureAttribution, getAnonymousSessionId } from "./attribution";

export type AnalyticsEventName =
  | "page_view"
  | "section_view"
  | "cta_click"
  | "phone_demo_click"
  | "audio_demo_started"
  | "audio_demo_completed"
  | "industry_selected"
  | "calculator_started"
  | "calculator_completed"
  | "pricing_viewed"
  | "lead_form_opened"
  | "lead_form_started"
  | "lead_form_validation_failed"
  | "lead_submitted"
  | "lead_delivery_succeeded"
  | "lead_delivery_failed"
  | "demo_requested"
  | "industry_page_view"
  | "cta_impression"
  | "workflow_viewed"
  | "integration_viewed"
  | "scenario_selected"
  | "phone_click"
  | "form_field_error"
  | "form_abandoned"
  | "form_submitted"
  | "submission_accepted"
  | "pricing_requested"
  | "consultation_requested"
  | "thank_you_viewed"
  | "industry_directory_viewed"
  | "industry_search_used"
  | "industry_filter_selected"
  | "industry_card_viewed"
  | "industry_card_clicked"
  | "related_industry_clicked"
  | "solution_selected"
  | "qualifying_question_answered"
  | "industry_demo_started"
  | "industry_demo_completed"
  | "industry_roi_completed"
  | "industry_lead_submitted";

export const analyticsConsentGranted = () =>
  localStorage.getItem("codestra_analytics_consent") === "granted";
export const setAnalyticsConsent = (granted: boolean) =>
  localStorage.setItem(
    "codestra_analytics_consent",
    granted ? "granted" : "denied",
  );

export const trackEvent = async (
  eventName: AnalyticsEventName,
  details: { ctaName?: string; section?: string; industry?: string; solution?: string; ctaPosition?: string } = {},
) => {
  if (!analyticsConsentGranted()) return;
  const visit = captureAttribution();
  const width = window.innerWidth;
  const payload = {
    event_name: eventName,
    anonymous_session_id: getAnonymousSessionId(),
    occurred_at: new Date().toISOString(),
    page_path: window.location.pathname,
    cta_name: details.ctaName ?? "",
    section: details.section ?? "",
    industry: details.industry ?? "",
    solution: details.solution ?? "",
    cta_position: details.ctaPosition ?? details.section ?? "",
    attribution: visit.latest,
    device_category:
      width < 768 ? "mobile" : width < 1100 ? "tablet" : "desktop",
    language: navigator.language.slice(0, 16),
    consent_state: "granted",
  };
  try {
    await fetch(
      `${import.meta.env.VITE_API_ENDPOINT ?? ""}/api/v1/analytics/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      },
    );
  } catch {
    /* Analytics must never interrupt the visitor. */
  }
};
