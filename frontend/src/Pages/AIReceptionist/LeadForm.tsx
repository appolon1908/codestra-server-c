import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { captureAttribution } from "./attribution";
import { trackEvent } from "./analytics";
import { localeNames, supportedLocales } from "../../i18n/locale-types";

const industryOptions = [
  ["logistics", "logistics-ai"], ["legal", "legal-ai"], ["healthcare", "healthcare-ai"],
  ["senior_care", "senior-care-ai"], ["real_estate", "real-estate-ai"], ["financial_services", "financial-services-ai"],
  ["ecommerce", "ecommerce-ai"], ["hospitality", "hospitality-ai"], ["construction", "construction-ai"],
  ["agriculture", "agriculture-ai"], ["education", "education-ai"], ["dental", "dental-ai"],
  ["veterinary", "veterinary-ai"], ["automotive", "automotive-ai"], ["restaurant", "restaurant-ai"],
  ["manufacturing", "manufacturing-ai"], ["recruitment", "recruitment-ai"], ["nonprofit", "nonprofit-ai"],
  ["public_services", "public-services-ai"], ["energy", "energy-ai"], ["telecom_it", "telecom-it-ai"],
  ["wellness", "wellness-ai"], ["security_services", "security-services-ai"], ["marketing_media", "marketing-media-ai"],
  ["gaming_entertainment", "gaming-entertainment-ai"],
] as const;

export type LeadFormValues = {
  full_name: string;
  business_name: string;
  work_email: string;
  phone_number: string;
  country: string;
  preferred_language: string;
  industry: string;
  employee_count: string;
  monthly_call_volume: string;
  product_interest: string;
  preferred_demo_date: string;
  preferred_demo_time: string;
  message: string;
  consent: boolean;
  honeypot: string;
};

type Props = {
  ctaClicked?: string;
  industrySelected?: string;
  solutionSelected?: string;
  qualifyingQuestions?: string[];
  compact?: boolean;
  endpoint?: "/api/v1/leads" | "/api/v1/demo-requests" | "/api/v1/pricing-requests" | "/api/v1/contact-requests";
  submitLabel?: string;
};

export default function LeadForm({
  ctaClicked = "Book a Live Demo",
  industrySelected = "",
  solutionSelected = "",
  qualifyingQuestions = [],
  compact = false,
  endpoint = "/api/v1/leads",
  submitLabel = "Book a Live Demo",
}: Props) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(["forms", "industries"]);
  const formId = useId().replace(/:/g, "");
  const submissionInFlight = useRef(false);
  const [serverState, setServerState] = useState<{
    type: "idle" | "loading" | "error" | "success";
    message: string;
  }>({ type: "idle", message: "" });
  const [qualificationAnswers, setQualificationAnswers] = useState<Record<string, string>>({});
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
  const safeSavedContext = useMemo(() => {
    try {
      return JSON.parse(window.sessionStorage.getItem("codestra.lead_form_context") ?? "{}") as Partial<LeadFormValues>;
    } catch {
      return {};
    }
  }, []);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LeadFormValues>({
    defaultValues: {
      ...safeSavedContext,
      preferred_language: i18n.resolvedLanguage ?? "en",
      industry: industrySelected || safeSavedContext.industry || "",
      product_interest: solutionSelected || safeSavedContext.product_interest || "ai_receptionist",
      consent: false,
      honeypot: "",
    },
  });

  useEffect(() => {
    const subscription = watch((values) => {
      const safeContext = {
        country: values.country ?? "",
        preferred_language: values.preferred_language ?? "",
        industry: values.industry ?? "",
        employee_count: values.employee_count ?? "",
        monthly_call_volume: values.monthly_call_volume ?? "",
        product_interest: values.product_interest ?? "",
        preferred_demo_date: values.preferred_demo_date ?? "",
        preferred_demo_time: values.preferred_demo_time ?? "",
      };
      try { window.sessionStorage.setItem("codestra.lead_form_context", JSON.stringify(safeContext)); } catch { /* optional storage */ }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const submit = async (values: LeadFormValues) => {
    if (submissionInFlight.current) return;
    submissionInFlight.current = true;
    setServerState({ type: "loading", message: "" });
    await trackEvent("lead_submitted", {
      ctaName: ctaClicked,
      section: "lead-form",
    });
    if (industrySelected) {
      await trackEvent("industry_lead_submitted", {
        ctaName: ctaClicked,
        section: "lead-form",
        industry: industrySelected,
        solution: solutionSelected,
      });
    }
    const visit = captureAttribution();
    const qualificationSummary = Object.entries(qualificationAnswers).filter(([, answer]) => answer.trim()).map(([question, answer]) => `${question}: ${answer.trim()}`).join("\n");
    const payload = {
      ...values,
      preferred_language: i18n.resolvedLanguage ?? "en",
      content_locale: i18n.resolvedLanguage ?? "en",
      country_code: (() => { try { return window.sessionStorage.getItem("codestra.country_code") ?? ""; } catch { return ""; } })(),
      locale_source: (() => { try { return window.sessionStorage.getItem("codestra.locale_source") ?? "url"; } catch { return "url"; } })(),
      translation_version: import.meta.env.VITE_APP_REVISION ?? "development",
      message: [values.message, qualificationSummary].filter(Boolean).join("\n\n"),
      solution: solutionSelected,
      attribution: {
        ...visit.latest,
        first_touch: visit.first,
        first_visit_timestamp: visit.firstVisitTimestamp,
        latest_visit_timestamp: visit.latestVisitTimestamp,
      },
      landing_page_url: visit.landingPageUrl,
      referrer: visit.referrer,
      cta_clicked: ctaClicked,
      anonymous_session_id: visit.anonymousSessionId,
    };
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT ?? ""}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify(payload),
        },
      );
      const body = (await response.json().catch(() => ({}))) as {
        code?: string;
        message?: string;
        request_id?: string;
      };
      if (response.ok) {
        try { window.sessionStorage.removeItem("codestra.lead_form_context"); } catch { /* optional storage */ }
        await trackEvent("lead_delivery_succeeded", {
          ctaName: ctaClicked,
          section: "lead-form",
        });
        setServerState({
          type: "success",
          message: t("success"),
        });
        window.setTimeout(
          () =>
            navigate(
              `/${i18n.resolvedLanguage ?? "en"}/thank-you?request_id=${encodeURIComponent(body.request_id ?? "")}`,
            ),
          650,
        );
        return;
      }
      const message =
        response.status === 409
          ? t("duplicate")
          : response.status === 429
            ? t("rateLimit")
            : (body.message ??
              t("serverError"));
      setServerState({ type: "error", message });
      await trackEvent("lead_delivery_failed", {
        ctaName: ctaClicked,
        section: "lead-form",
      });
      submissionInFlight.current = false;
    } catch {
      setServerState({
        type: "error",
        message:
          t("networkError"),
      });
      await trackEvent("lead_delivery_failed", {
        ctaName: ctaClicked,
        section: "lead-form",
      });
      submissionInFlight.current = false;
    }
  };

  const onInvalid = () => {
    void trackEvent("lead_form_validation_failed", {
      ctaName: ctaClicked,
      section: "lead-form",
    });
  };
  const fieldClass = "ai-field";

  return (
    <form
      className={`ai-lead-form ${compact ? "ai-lead-form--compact" : ""}`}
      onSubmit={handleSubmit(submit, onInvalid)}
      onFocus={() =>
        void trackEvent("lead_form_started", {
          ctaName: ctaClicked,
          section: "lead-form",
        })
      }
      noValidate
    >
      <div className="demo-form-grid">
        <div className="ai-form-field">
          <label htmlFor={`${formId}-full-name`}>{t("fullName.label")}</label>
          <input
            id={`${formId}-full-name`}
            className={fieldClass}
            type="text"
            autoComplete="name"
            aria-invalid={Boolean(errors.full_name)}
            aria-describedby={errors.full_name ? `${formId}-full-name-error` : undefined}
            {...register("full_name", { required: t("fullName.required") })}
          />
          {errors.full_name && (
            <span id={`${formId}-full-name-error`} className="ai-error" role="alert">{errors.full_name.message}</span>
          )}
        </div>
        <div className="ai-form-field">
          <label htmlFor={`${formId}-business-name`}>{t("businessName.label")}</label>
          <input
            id={`${formId}-business-name`}
            className={fieldClass}
            type="text"
            autoComplete="organization"
            aria-invalid={Boolean(errors.business_name)}
            aria-describedby={errors.business_name ? `${formId}-business-name-error` : undefined}
            {...register("business_name", {
              required: t("businessName.required"),
            })}
          />
          {errors.business_name && (
            <span id={`${formId}-business-name-error`} className="ai-error" role="alert">{errors.business_name.message}</span>
          )}
        </div>
        <div className="ai-form-field">
          <label htmlFor={`${formId}-work-email`}>{t("email.label")}</label>
          <input
            id={`${formId}-work-email`}
            className={fieldClass}
            type="email"
            autoComplete="email"
            inputMode="email"
            aria-invalid={Boolean(errors.work_email)}
            aria-describedby={errors.work_email ? `${formId}-work-email-error` : undefined}
            {...register("work_email", {
              required: t("email.required"),
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t("email.invalid") },
            })}
          />
          {errors.work_email && (
            <span id={`${formId}-work-email-error`} className="ai-error" role="alert">{errors.work_email.message}</span>
          )}
        </div>
        <div className="ai-form-field">
          <label htmlFor={`${formId}-phone-number`}>{t("phone.label")}</label>
          <input
            id={`${formId}-phone-number`}
            className={fieldClass}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            aria-invalid={Boolean(errors.phone_number)}
            aria-describedby={errors.phone_number ? `${formId}-phone-number-error` : undefined}
            {...register("phone_number", {
              required: t("phone.required"),
              minLength: { value: 7, message: t("phone.invalid") },
            })}
          />
          {errors.phone_number && (
            <span id={`${formId}-phone-number-error`} className="ai-error" role="alert">{errors.phone_number.message}</span>
          )}
        </div>
        <div className="ai-form-field">
          <label htmlFor={`${formId}-country`}>{t("country.label")}</label>
          <select
            id={`${formId}-country`}
            className={fieldClass}
            autoComplete="country-name"
            aria-invalid={Boolean(errors.country)}
            aria-describedby={errors.country ? `${formId}-country-error` : undefined}
            {...register("country", { required: t("country.required") })}
          >
            <option value="">{t("forms:country.select")}</option>
            <option value="US">{t("forms:country.us")}</option>
            <option value="DO">{t("forms:country.do")}</option>
            <option value="CA">{t("forms:country.ca")}</option>
            <option value="HT">{t("forms:country.ht")}</option>
            <option value="MX">{t("forms:country.mx")}</option>
            <option value="OTHER">{t("forms:country.other")}</option>
          </select>
          {errors.country && <span id={`${formId}-country-error`} className="ai-error" role="alert">{errors.country.message}</span>}
        </div>
        <div className="ai-form-field">
          <label htmlFor={`${formId}-preferred-language`}>{t("preferredLanguage.label")}</label>
          <select id={`${formId}-preferred-language`} className={fieldClass} autoComplete="language" {...register("preferred_language")}>
            {supportedLocales.map((locale) => <option value={locale} key={locale}>{localeNames[locale]}</option>)}
          </select>
        </div>
        <div className="ai-form-field">
          <label htmlFor={`${formId}-industry`}>{t("industry.label")}</label>
          <select
            id={`${formId}-industry`}
            className={fieldClass}
            aria-invalid={Boolean(errors.industry)}
            aria-describedby={errors.industry ? `${formId}-industry-error` : undefined}
            {...register("industry", { required: t("forms:industry.required") })}
          >
            <option value="">{t("forms:industry.select")}</option>
            {industryOptions.map(([value, slug]) => <option value={value} key={value}>{t(`industries:content.${slug}.name`)}</option>)}
          </select>
          {errors.industry && (
            <span id={`${formId}-industry-error`} className="ai-error" role="alert">{errors.industry.message}</span>
          )}
        </div>
        <div className="ai-form-field">
          <label htmlFor={`${formId}-employee-count`}>{t("employees.label")}</label>
          <select
            id={`${formId}-employee-count`}
            className={fieldClass}
            aria-invalid={Boolean(errors.employee_count)}
            aria-describedby={errors.employee_count ? `${formId}-employee-count-error` : undefined}
            {...register("employee_count", { required: t("forms:employees.required") })}
          >
            <option value="">{t("forms:employees.select")}</option>
            <option>1-10</option>
            <option>11-50</option>
            <option>51-250</option>
            <option>251+</option>
          </select>
          {errors.employee_count && <span id={`${formId}-employee-count-error`} className="ai-error" role="alert">{errors.employee_count.message}</span>}
        </div>
        <div className="ai-form-field">
          <label htmlFor={`${formId}-monthly-call-volume`}>{t("monthlyVolume.label")}</label>
          <select
            id={`${formId}-monthly-call-volume`}
            className={fieldClass}
            aria-invalid={Boolean(errors.monthly_call_volume)}
            aria-describedby={errors.monthly_call_volume ? `${formId}-monthly-call-volume-error` : undefined}
            {...register("monthly_call_volume", { required: t("forms:monthlyVolume.required") })}
          >
            <option value="">{t("forms:monthlyVolume.select")}</option>
            <option value="under_500">{t("forms:monthlyVolume.under500")}</option>
            <option>500-1000</option>
            <option>1000-5000</option>
            <option>5000+</option>
          </select>
          {errors.monthly_call_volume && <span id={`${formId}-monthly-call-volume-error`} className="ai-error" role="alert">{errors.monthly_call_volume.message}</span>}
        </div>
        <div className="ai-form-field">
          <label htmlFor={`${formId}-product-interest`}>{t("productInterest.label")}</label>
          <select id={`${formId}-product-interest`} className={fieldClass} {...register("product_interest", { onChange: (event) => void trackEvent("solution_selected", { section: "lead-form", ctaName: String(event.target.value), industry: industrySelected, solution: String(event.target.value) }) })}>
            <option value="ai_receptionist">{t("forms:products.receptionist")}</option>
            <option value="ai_receptionist_odoo">{t("forms:products.receptionistOdoo")}</option>
            <option value="call_center_automation">{t("forms:products.callCenter")}</option>
            <option value="custom_voice_ai">{t("forms:products.customVoice")}</option>
          </select>
        </div>
        <div className="ai-form-field">
          <label htmlFor={`${formId}-preferred-demo-date`}>{t("demoDate.label")}</label>
          <input
            id={`${formId}-preferred-demo-date`}
            className={fieldClass}
            type="date"
            autoComplete="off"
            min={new Date().toISOString().slice(0, 10)}
            {...register("preferred_demo_date")}
          />
        </div>
        <div className="ai-form-field">
          <label htmlFor={`${formId}-preferred-demo-time`}>{t("demoTime.label")}</label>
          <input
            id={`${formId}-preferred-demo-time`}
            className={fieldClass}
            type="time"
            autoComplete="off"
            {...register("preferred_demo_time")}
          />
        </div>
      </div>
      {qualifyingQuestions.length > 0 && <fieldset className="ai-progressive-qualification demo-form-full"><legend>{t("forms:qualification.legend")}</legend><p className="ai-muted">{t("forms:qualification.help")}</p><div className="demo-form-grid">{qualifyingQuestions.map((question, index) => <div className="ai-form-field" key={question}><label htmlFor={`${formId}-qualification-${index}`}>{question}</label><input id={`${formId}-qualification-${index}`} name={`qualification_${index}`} className={fieldClass} value={qualificationAnswers[question] ?? ""} onChange={(event) => setQualificationAnswers((current) => ({...current, [question]: event.target.value}))} onBlur={() => { if (qualificationAnswers[question]?.trim()) void trackEvent("qualifying_question_answered", {section:"lead-form", ctaName:question}); }} autoComplete="off" /></div>)}</div></fieldset>}
      <div className="ai-form-field demo-form-full">
        <label htmlFor={`${formId}-message`}>{t("message.label")}</label>
        <textarea
          id={`${formId}-message`}
          className={`${fieldClass} ai-textarea`}
          rows={4}
          autoComplete="off"
          {...register("message")}
        />
      </div>
      <div className="form-honeypot" aria-hidden="true">
        <label htmlFor={`${formId}-website`}>{t("forms:honeypot")}</label>
        <input id={`${formId}-website`} type="text" tabIndex={-1} autoComplete="off" {...register("honeypot")} />
      </div>
      <label className="ai-consent demo-form-full" htmlFor={`${formId}-consent`}>
        <input
          id={`${formId}-consent`}
          type="checkbox"
          aria-invalid={Boolean(errors.consent)}
          aria-describedby={errors.consent ? `${formId}-consent-error` : undefined}
          {...register("consent", { required: t("consent.required") })}
        />
        <span>
          {t("consent.label")}
        </span>
      </label>
      {errors.consent && (
        <span id={`${formId}-consent-error`} className="ai-error demo-form-full" role="alert">
          {errors.consent.message}
        </span>
      )}
      {serverState.type === "error" && (
        <div className="ai-form-message ai-form-message--error demo-form-full" role="alert" aria-live="assertive">
          {serverState.message}
        </div>
      )}
      {serverState.type === "success" && (
        <div className="ai-form-message ai-form-message--success demo-form-full" role="status" aria-live="polite">
          {serverState.message}
        </div>
      )}
      <button
        className="ai-button ai-button--primary ai-button--wide demo-form-full"
        type="submit"
        disabled={serverState.type === "loading" || serverState.type === "success"}
      >
        {serverState.type === "loading" ? t("submitting") : (submitLabel === "Book a Live Demo" ? t("submit") : submitLabel)}
      </button>
    </form>
  );
}
