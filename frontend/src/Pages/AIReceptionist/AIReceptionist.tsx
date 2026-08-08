import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiGlobe,
  FiMessageSquare,
  FiPlay,
  FiShield,
  FiShuffle,
  FiUserCheck,
  FiX,
  FiZap,
} from "react-icons/fi";

import Footer from "../../Components/Layouts/Footer";
import LocalizedLink from "../../i18n/LocalizedLink";
import heroImage from "../../assets/ai-receptionist-hero.webp";
import AIReceptionistNav from "./AIReceptionistNav";
import LeadForm from "./LeadForm";
import {
  analyticsConsentGranted,
  setAnalyticsConsent,
  trackEvent,
} from "./analytics";
import { captureAttribution } from "./attribution";
import { faqItems, industrySolutions, pricingPlans } from "./config";
import "./ai-receptionist.css";

const placeholderAudio =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
const demoPhone = import.meta.env.VITE_PUBLIC_DEMO_PHONE as string | undefined;

const scenarios = [
  {
    title: "New sales inquiry",
    language: "English",
    intent: "Sales inquiry",
    action: "Qualified lead and sales callback",
    crm: "Mock Odoo lead queued",
    transcript:
      "Caller: We need an AI receptionist for three locations.\nAI: I can help collect your requirements and arrange a live demo.",
  },
  {
    title: "Appointment scheduling",
    language: "English",
    intent: "Book appointment",
    action: "Available time selected",
    crm: "Appointment activity prepared",
    transcript:
      "Caller: Can I schedule a consultation Tuesday afternoon?\nAI: I found an available time at 2:30 PM.",
  },
  {
    title: "Customer support",
    language: "English",
    intent: "Support request",
    action: "Context captured and routed",
    crm: "Support follow-up prepared",
    transcript:
      "Caller: I need help with my account.\nAI: I will collect the issue and route it with complete context.",
  },
  {
    title: "After-hours lead capture",
    language: "English",
    intent: "Urgent quote request",
    action: "Callback requested",
    crm: "After-hours lead queued",
    transcript:
      "Caller: Your office is closed, but I need a quote.\nAI: I can capture the details now and arrange a callback.",
  },
  {
    title: "Spanish conversation",
    language: "Spanish",
    intent: "Consulta de ventas",
    action: "Demo requested in Spanish",
    crm: "Spanish-language lead queued",
    transcript:
      "Cliente: Necesito información sobre la recepcionista virtual.\nIA: Claro. Puedo recopilar sus necesidades y programar una demostración.",
  },
  {
    title: "Urgent employee transfer",
    language: "English",
    intent: "Urgent escalation",
    action: "Transferred with context",
    crm: "Transfer outcome recorded",
    transcript:
      "Caller: I need to speak with operations urgently.\nAI: I will connect you and send the reason for your call.",
  },
] as const;

function usePageMetadata() {
  const { t, i18n } = useTranslation("seo");
  useEffect(() => {
    const title = t("aiReceptionist.title");
    const description = t("aiReceptionist.description");
    document.title = title;
    const upsert = (selector: string, attributes: Record<string, string>) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement("meta");
        document.head.appendChild(element);
      }
      Object.entries(attributes).forEach(([key, value]) =>
        element?.setAttribute(key, value),
      );
    };
    upsert('meta[name="description"]', {
      name: "description",
      content: description,
    });
    upsert('meta[property="og:title"]', {
      property: "og:title",
      content: title,
    });
    upsert('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    });
    upsert('meta[property="og:url"]', {
      property: "og:url",
      content: `https://codestra.co/${i18n.resolvedLanguage ?? "en"}/ai-receptionist`,
    });
    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `https://codestra.co/${i18n.resolvedLanguage ?? "en"}/ai-receptionist`;
    const structured = document.createElement("script");
    structured.type = "application/ld+json";
    structured.dataset.codestraAi = "true";
    structured.text = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          name: "Codestra",
          url: "https://codestra.co",
        },
        {
          "@type": "Product",
          name: "Codestra AI Receptionist",
          brand: { "@type": "Organization", name: "Codestra" },
          description,
          url: `https://codestra.co/${i18n.resolvedLanguage ?? "en"}/ai-receptionist`,
        },
        {
          "@type": "FAQPage",
          mainEntity: faqItems.map(([name, text]) => ({
            "@type": "Question",
            name,
            acceptedAnswer: { "@type": "Answer", text },
          })),
        },
      ],
    });
    document.head.appendChild(structured);
    return () => {
      structured.remove();
    };
  }, [i18n.resolvedLanguage, t]);
}

function LeadModal({
  open,
  onClose,
  cta,
  industry,
}: {
  open: boolean;
  onClose: () => void;
  cta: string;
  industry: string;
}) {
  const { t } = useTranslation("ai-receptionist");
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    titleRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => !element.hasAttribute("hidden"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === titleRef.current) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      returnFocusRef.current?.focus();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="demo-modal-overlay ai-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="demo-modal ai-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
      >
        <button
          className="ai-modal-close"
          onClick={onClose}
          aria-label={t("modal.close")}
        >
          <FiX />
        </button>
        <p className="ai-eyebrow">{t("modal.eyebrow")}</p>
        <h2 ref={titleRef} tabIndex={-1} id="lead-modal-title">{t("cta.demo")}</h2>
        <p className="ai-muted">{t("modal.body")}</p>
        <LeadForm ctaClicked={cta} industrySelected={industry} endpoint="/api/v1/demo-requests" compact />
      </div>
    </div>
  );
}

function CTA({
  kind,
  children,
  onOpen,
  section,
}: {
  kind: "demo" | "pricing";
  children: React.ReactNode;
  onOpen: (cta: string) => void;
  section: string;
}) {
  const className = "ai-button ai-button--secondary";
  if (kind === "pricing")
    return (
      <button
        className={className}
        onClick={() =>
          document
            .getElementById("pricing")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      >
        {children}
      </button>
    );
  return (
    <button
      className={className}
      onClick={() => {
        onOpen(String(children));
        void trackEvent("lead_form_opened", {
          ctaName: String(children),
          section,
        });
      }}
    >
      {children}
    </button>
  );
}

function CallAiLink({ section, primary = false }: { section: string; primary?: boolean }) {
  const { t } = useTranslation("ai-receptionist");
  if (!demoPhone || !/^\+[1-9]\d{7,14}$/.test(demoPhone)) return null;
  return <a className={`ai-button ${primary ? "ai-button--primary" : "ai-button--secondary"}`} href={`tel:${demoPhone}`}
    onClick={() => void trackEvent("phone_demo_click", { ctaName: "Call the AI Now", section })}>{t("cta.call")}</a>;
}

export default function AIReceptionist() {
  const { t } = useTranslation("ai-receptionist");
  const heroHeadline = t("hero.headline");
  usePageMetadata();
  const [modal, setModal] = useState({ open: false, cta: "Book a Live Demo" });
  const closeLead = useCallback(
    () => setModal((current) => ({ ...current, open: false })),
    [],
  );
  useEffect(() => {
    if (!window.location.hash) return;
    window.requestAnimationFrame(() =>
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: "start" }),
    );
  }, []);
  const [industryIndex, setIndustryIndex] = useState(0);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [analyticsChoice, setAnalyticsChoice] = useState(
    analyticsConsentGranted(),
  );
  const [calculator, setCalculator] = useState({
    calls: 1200,
    missed: 18,
    value: 350,
    conversion: 22,
  });
  const [calculated, setCalculated] = useState(false);
  const [typedHeadline, setTypedHeadline] = useState("");
  const selectedIndustry = industrySolutions[industryIndex];
  const selectedScenario = scenarios[scenarioIndex];
  const missedCalls = Math.round((calculator.calls * calculator.missed) / 100);
  const missedOpportunities = Math.round(
    (missedCalls * calculator.conversion) / 100,
  );
  const monthlyLost = Math.round(missedOpportunities * calculator.value);

  useEffect(() => {
    captureAttribution();
    void trackEvent("page_view", { section: "page" });
  }, []);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTypedHeadline(heroHeadline);
      return;
    }
    if (typedHeadline === heroHeadline) return;
    const timer = window.setTimeout(() => {
      setTypedHeadline(heroHeadline.slice(0, typedHeadline.length + 1));
    }, 55);
    return () => window.clearTimeout(timer);
  }, [typedHeadline, heroHeadline]);
  useEffect(() => { setTypedHeadline(""); }, [heroHeadline]);
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(
      ".ai-card, .ai-price, .ai-steps li, .ai-capability-list article, .ai-dashboard, .ai-industry-panel, .ai-security-grid span",
    );
    elements.forEach((element) => element.classList.add("ai-reveal"));
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("ai-reveal--visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.15, rootMargin: "0px 0px -40px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            void trackEvent("section_view", { section: entry.target.id });
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.35 },
    );
    document
      .querySelectorAll<HTMLElement>(".ai-page section[id]")
      .forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const openLead = (cta: string) => setModal({ open: true, cta });
  const updateCalculator = (key: keyof typeof calculator, value: string) =>
    setCalculator((current) => ({
      ...current,
      [key]: Math.max(0, Number(value) || 0),
    }));
  const integrationBadges = [
    ["Odoo", "Supported"],
    ["VICIdial", "Planned"],
    ["n8n", "Supported"],
    ["Google Calendar", "Supported"],
    ["Microsoft Outlook", "Planned"],
    ["Salesforce", "Planned"],
    ["HubSpot", "Planned"],
    ["Shopify", "Planned"],
  ];
  const capabilities = t("capabilities.items", { returnObjects: true }) as Array<{ title: string; body: string }>;
  const benefits = t("benefits.items", { returnObjects: true }) as Array<{ title: string; body: string }>;

  return (
    <div className="ai-page">
      <AIReceptionistNav />
      <main>
        <section id="product" className="ai-hero ai-shell">
          <div className="ai-hero-copy">
            <p className="ai-eyebrow">{t("hero.eyebrow")}</p>
            <h1
              className="ai-typing-title"
              aria-label={heroHeadline}
            >
              <span aria-hidden="true">{typedHeadline}</span>
            </h1>
            <p className="ai-lede">
              {t("hero.body")}
            </p>
            <div className="ai-actions">
              <CallAiLink section="hero" primary />
              <button
                className="ai-button ai-button--secondary"
                onClick={() => openLead("Book a Live Demo")}
              >
                {t("cta.demo")}
              </button>
            </div>
            <LocalizedLink className="ai-text-link" to="/pricing#pricing">{t("cta.pricing")} <FiArrowRight /></LocalizedLink>
            <div className="ai-mini-proof">
              <span>
                <FiClock /> {t("proof.available")}
              </span>
              <span>
                <FiGlobe /> {t("proof.languages")}
              </span>
              <span>
                <FiShuffle /> {t("proof.routing")}
              </span>
            </div>
          </div>
          <div className="ai-hero-visual">
            <img
              src={heroImage}
              width="1000"
              height="1000"
              alt={t("preview.imageAlt")}
            />
            <div
              className="ai-call-console"
              aria-label={t("preview.label")}
            >
              <div className="ai-call-console__header">
                <span className="ai-live-dot" /> {t("preview.activeCall")}{" "}
                <span>02:14</span>
              </div>
              <div className="ai-caller">
                <strong>{t("preview.customer")}</strong>
                <span>{t("preview.detectedSpanish")}</span>
              </div>
              <div className="ai-transcript">
                <p>
                  <b>{t("preview.caller")}</b> {t("preview.callerLine")}
                </p>
                <p>
                  <b>AI</b> {t("preview.aiLine")}
                </p>
              </div>
              <div className="ai-console-grid">
                <span>
                  <FiMessageSquare /> {t("preview.intent")}<strong>{t("preview.bookDemo")}</strong>
                </span>
                <span>
                  <FiUserCheck /> {t("preview.lead")}<strong>{t("preview.qualified")}</strong>
                </span>
                <span>
                  <FiCalendar /> {t("preview.appointment")}<strong>{t("preview.booked")}</strong>
                </span>
                <span>
                  <FiShuffle /> Odoo CRM<strong>{t("preview.queued")}</strong>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="integrations" className="ai-integration-section">
          <div className="ai-shell">
            <p className="ai-section-kicker">
              {t("sections.integrations")}
            </p>
            <div className="ai-integration-strip">
              {integrationBadges.map(([name, status]) => (
                <div key={name}>
                  <strong>{name}</strong>
                  <span>{t(`integrationStatus.${status.toLowerCase()}`)}</span>
                </div>
              ))}
            </div>
            <p className="ai-disclaimer">
              {t("integrations.disclaimer")}
            </p>
          </div>
        </section>

        <section id="solutions" className="ai-section ai-shell">
          <div className="ai-section-heading">
            <p className="ai-eyebrow">{t("benefitsEyebrow")}</p>
            <h2>{t("sections.benefits")}</h2>
          </div>
          <div className="ai-benefit-grid">
            {benefits.map(({ title, body }, index) => {
              const C = [FiClock, FiGlobe, FiShuffle, FiZap][index];
              return (
                <article key={title} className="ai-card">
                  <C />
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              );
            })}
          </div>
          <button
            className="ai-text-link"
            onClick={() =>
              document
                .getElementById("demo")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            {t("cta.sample")} <FiArrowRight />
          </button>
        </section>

        <section id="calculator" className="ai-section ai-section--surface">
          <div className="ai-shell ai-calculator-layout">
            <div>
              <p className="ai-eyebrow">{t("sections.calculatorEyebrow")}</p>
              <h2>
                {t("sections.calculator")}
              </h2>
              <p className="ai-muted">{t("ui.calculatorIntro")}</p>
              <div className="ai-calculator-fields">
                {[
                  ["calls", "Monthly incoming calls", 1],
                  ["missed", "Percentage currently missed", 1],
                  ["value", "Average lead value", 1],
                  ["conversion", "Lead-to-sale conversion rate", 1],
                ].map(([key, label, step]) => (
                  <label key={String(key)}>
                    {String(label)}
                    <input
                      type="number"
                      min="0"
                      step={Number(step)}
                      value={calculator[key as keyof typeof calculator]}
                      onChange={(event) =>
                        updateCalculator(
                          key as keyof typeof calculator,
                          event.target.value,
                        )
                      }
                      onFocus={() =>
                        void trackEvent("calculator_started", {
                          section: "calculator",
                        })
                      }
                    />
                  </label>
                ))}
              </div>
              <button
                className="ai-button ai-button--secondary"
                onClick={() => {
                  setCalculated(true);
                  void trackEvent("calculator_completed", {
                    ctaName: "Calculate My Missed-Call Cost",
                    section: "calculator",
                  });
                }}
              >
                {t("cta.calculate")}
              </button>
            </div>
            <div
              className={`ai-results ${calculated ? "ai-results--active" : ""}`}
              aria-live="polite"
            >
              <span>
                {t("calculator.missedCalls")}
                <strong>{missedCalls.toLocaleString()}</strong>
              </span>
              <span>
                {t("calculator.missedOpportunities")}
                <strong>{missedOpportunities.toLocaleString()}</strong>
              </span>
              <span>
                {t("calculator.monthlyRevenue")}
                <strong>${monthlyLost.toLocaleString()}</strong>
              </span>
              <span>
                {t("calculator.annualRevenue")}
                <strong>${(monthlyLost * 12).toLocaleString()}</strong>
              </span>
              <small>{t("calculator.note")}</small>
            </div>
          </div>
        </section>

        <section id="demo" className="ai-section ai-shell">
          <div className="ai-section-heading">
            <p className="ai-eyebrow">{t("sections.demoEyebrow")}</p>
            <h2>{t("sections.demo")}</h2>
          </div>
          <div className="ai-demo-layout">
            <div
              className="ai-scenario-list"
              role="tablist"
              aria-label={t("ui.demoScenarios")}
            >
              {scenarios.map((scenario, index) => (
                <button
                  key={scenario.title}
                  role="tab"
                  aria-selected={scenarioIndex === index}
                  onClick={() => setScenarioIndex(index)}
                >
                  {scenario.title}
                </button>
              ))}
            </div>
            <div className="ai-demo-player">
              <div className="ai-player-heading">
                <button
                  aria-label={t("ui.demoPlay")}
                  onClick={(event) => {
                    const audio =
                      event.currentTarget.parentElement?.parentElement?.querySelector(
                        "audio",
                      );
                    audio?.play();
                    void trackEvent("audio_demo_started", { section: "demo" });
                  }}
                >
                  <FiPlay />
                </button>
                <div>
                  <p className="ai-eyebrow">{t("demo.placeholder")}</p>
                  <h3>{selectedScenario.title}</h3>
                </div>
              </div>
              <audio
                controls
                preload="metadata"
                src={placeholderAudio}
                onPlay={() =>
                  void trackEvent("audio_demo_started", { section: "demo" })
                }
                onEnded={() =>
                  void trackEvent("audio_demo_completed", { section: "demo" })
                }
              >
                {t("demo.audioUnsupported")}
              </audio>
              <div className="ai-waveform" aria-hidden="true">
                {Array.from({ length: 34 }, (_, index) => (
                  <span
                    key={index}
                    style={{ height: `${18 + ((index * 17) % 48)}%` }}
                  />
                ))}
              </div>
              <pre>{selectedScenario.transcript}</pre>
              <div
                className="ai-carousel-controls"
                aria-label={t("ui.demoCarousel")}
              >
                <button
                  type="button"
                  aria-label={t("ui.demoPrevious")}
                  onClick={() =>
                    setScenarioIndex(
                      (index) =>
                        (index - 1 + scenarios.length) % scenarios.length,
                    )
                  }
                >
                  ←
                </button>
                <span>
                  {scenarioIndex + 1} / {scenarios.length}
                </span>
                <button
                  type="button"
                  aria-label={t("ui.demoNext")}
                  onClick={() =>
                    setScenarioIndex((index) => (index + 1) % scenarios.length)
                  }
                >
                  →
                </button>
              </div>
              <div className="ai-demo-meta">
                <span>
                  {t("demo.detectedLanguage")}<strong>{selectedScenario.language}</strong>
                </span>
                <span>
                  {t("demo.detectedIntent")}<strong>{selectedScenario.intent}</strong>
                </span>
                <span>
                  {t("demo.actionPerformed")}<strong>{selectedScenario.action}</strong>
                </span>
                <span>
                  {t("demo.crmOutcome")}<strong>{selectedScenario.crm}</strong>
                </span>
              </div>
              <p className="ai-disclaimer">{t("ui.demoDisclaimer")}</p>
            </div>
          </div>
          <div className="ai-actions ai-actions--center">
            <CallAiLink section="demo" primary />
            <button
              className="ai-button ai-button--secondary"
              onClick={() =>
                document
                  .querySelector<HTMLAudioElement>(".ai-demo-player audio")
                  ?.play()
              }
            >
              {t("cta.listen")}
            </button>
          </div>
        </section>

        <section id="capabilities" className="ai-section ai-section--surface">
          <div className="ai-shell">
            <div className="ai-section-heading">
              <p className="ai-eyebrow">{t("capabilities.eyebrow")}</p>
              <h2>{t("sections.capabilities")}</h2>
            </div>
            <div className="ai-capability-list">
              {capabilities.map(({ title, body }, index) => (
                <article key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                  <FiCheck />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="ai-section ai-shell">
          <div className="ai-section-heading">
            <p className="ai-eyebrow">{t("setup.eyebrow")}</p>
            <h2>{t("sections.setup")}</h2>
          </div>
          <ol className="ai-steps">
            <li>
              <span>1</span>
              <h3>{t("setup.steps.information.title")}</h3>
              <p>{t("setup.steps.information.body")}</p>
            </li>
            <li>
              <span>2</span>
              <h3>{t("setup.steps.personalize.title")}</h3>
              <p>{t("setup.steps.personalize.body")}</p>
            </li>
            <li>
              <span>3</span>
              <h3>{t("setup.steps.launch.title")}</h3>
              <p>{t("setup.steps.launch.body")}</p>
            </li>
          </ol>
          <div className="ai-actions ai-actions--center">
            <CTA kind="demo" onOpen={openLead} section="setup">
              {t("setup.create")}
            </CTA>
            <CTA kind="demo" onOpen={openLead} section="setup">
              {t("setup.specialist")}
            </CTA>
          </div>
        </section>

        <section id="industries" className="ai-section ai-section--surface">
          <div className="ai-shell">
            <div className="ai-section-heading">
              <p className="ai-eyebrow">{t("sections.industriesEyebrow")}</p>
              <h2>{t("sections.industries")}</h2>
            </div>
            <div
              className="ai-industry-tabs"
              role="tablist"
              aria-label={t("ui.industryLabel")}
            >
              {industrySolutions.map((industry, index) => (
                <button
                  key={industry.id}
                  role="tab"
                  aria-selected={industryIndex === index}
                  onClick={() => {
                    setIndustryIndex(index);
                    void trackEvent("industry_selected", {
                      ctaName: industry.label,
                      section: "industries",
                    });
                  }}
                >
                  {industry.label}
                </button>
              ))}
            </div>
            <div className="ai-industry-panel" role="tabpanel">
              <div>
                <p className="ai-eyebrow">{selectedIndustry.label}</p>
                <h3>{selectedIndustry.headline}</h3>
                <p>{selectedIndustry.description}</p>
                <button
                  className="ai-button ai-button--primary"
                  onClick={() => openLead("Book a Live Demo")}
                >
                  {t("cta.demo")}
                </button>
              </div>
              <div className="ai-industry-columns">
                <div>
                  <strong>{t("industry.intake")}</strong>
                  {selectedIndustry.intake.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <div>
                  <strong>{t("industry.actions")}</strong>
                  {selectedIndustry.actions.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <div>
                  <strong>{t("industry.routing")}</strong>
                  {selectedIndustry.routing.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="analytics" className="ai-section ai-shell">
          <div className="ai-section-heading">
            <p className="ai-eyebrow">{t("sections.dashboardEyebrow")}</p>
            <h2>{t("sections.dashboard")}</h2>
            <p className="ai-muted">{t("ui.dashboardSample")}</p>
          </div>
          <div className="ai-dashboard">
            <div className="ai-dashboard-stats">
              {[
                ["Total calls", "1,284"],
                ["Answered calls", "1,198"],
                ["AI resolution rate", "68%"],
                ["Transfer success", "94%"],
                ["Leads captured", "173"],
                ["Appointments booked", "86"],
                ["Conversion rate", "18.4%"],
                ["Caller sentiment", "Positive"],
              ].map(([label, value]) => (
                <span key={label}>
                  <small>{label}</small>
                  <strong>{value}</strong>
                </span>
              ))}
            </div>
            <div className="ai-dashboard-detail">
              <div>
                <h3>{t("dashboard.languageDistribution")}</h3>
                <div className="ai-bar">
                  <span style={{ width: "58%" }}>{t("dashboard.languages.english")}</span>
                </div>
                <div className="ai-bar">
                  <span style={{ width: "29%" }}>{t("dashboard.languages.spanish")}</span>
                </div>
                <div className="ai-bar">
                  <span style={{ width: "13%" }}>{t("dashboard.languages.frenchCreole")}</span>
                </div>
              </div>
              <div>
                <h3>{t("dashboard.recentTranscripts")}</h3>
                <ul>
                  <li>
                    <span>{t("dashboard.calls.salesInquiry")}</span>
                    <strong>{t("dashboard.calls.leadCaptured")}</strong>
                  </li>
                  <li>
                    <span>{t("dashboard.calls.pickupScheduling")}</span>
                    <strong>{t("dashboard.calls.appointmentBooked")}</strong>
                  </li>
                  <li>
                    <span>{t("dashboard.calls.unknownPolicy")}</span>
                    <strong>{t("dashboard.calls.humanFollowUp")}</strong>
                  </li>
                </ul>
              </div>
              <div>
                <h3>{t("dashboard.campaignAttribution")}</h3>
                <p>{t("dashboard.attributionSample")}</p>
                <h3>{t("dashboard.unansweredQuestions")}</h3>
                <p>{t("ui.unansweredSample")}</p>
              </div>
            </div>
          </div>
          <div className="ai-actions ai-actions--center">
            <button
              className="ai-button ai-button--secondary"
              onClick={() => openLead("View the Analytics Dashboard")}
            >
              {t("cta.analytics")}
            </button>
          </div>
        </section>

        <section id="security" className="ai-section ai-section--surface">
          <div className="ai-shell ai-security-layout">
            <div>
              <p className="ai-eyebrow">{t("sections.securityEyebrow")}</p>
              <h2>{t("sections.security")}</h2>
              <p className="ai-muted">{t("ui.securityBody")}</p>
              <LocalizedLink className="ai-button ai-button--secondary" to="/security">
                {t("cta.security")}
              </LocalizedLink>
            </div>
            <div className="ai-security-grid">
              {[
                "Encrypted connections",
                "Role-based access",
                "Configurable recording consent",
                "Configurable data retention",
                "Audit history",
                "Approved knowledge sources",
                "Human escalation",
                "Restricted AI actions",
                "Secret management",
                "Rate limiting",
                "Bot protection",
                "Privacy controls",
              ].map((item) => (
                <span key={item}>
                  <FiShield />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="results" className="ai-section ai-shell">
          <div className="ai-section-heading">
            <p className="ai-eyebrow">{t("sections.resultsEyebrow")}</p>
            <h2>{t("sections.results")}</h2>
          </div>
          <article className="ai-placeholder-case">
            <span>{t("results.placeholder")}</span>
            <h3>{t("results.title")}</h3>
            <p>{t("ui.resultsBody")}</p>
            <LocalizedLink to="/contact">
              {t("results.submit")} <FiArrowRight />
            </LocalizedLink>
          </article>
        </section>

        <section
          id="pricing"
          className="ai-section ai-section--surface"
          onMouseEnter={() =>
            void trackEvent("pricing_viewed", { section: "pricing" })
          }
        >
          <div className="ai-shell">
            <div className="ai-section-heading">
              <p className="ai-eyebrow">{t("sections.pricingEyebrow")}</p>
              <h2>{t("sections.pricing")}</h2>
              <p className="ai-muted">{t("ui.pricingNote")}</p>
            </div>
            <div className="ai-pricing-grid">
              {pricingPlans.map((plan, index) => (
                <article
                  key={plan.name}
                  className={
                    index === 1 ? "ai-price ai-price--featured" : "ai-price"
                  }
                >
                  <span>
                    {index === 1 ? "Most requested" : "Configured plan"}
                  </span>
                  <h3>{plan.name}</h3>
                  <strong>{plan.monthlyPrice}</strong>
                  <dl>
                    <div>
                      <dt>{t("pricing.includedMinutes")}</dt>
                      <dd>{plan.includedMinutes}</dd>
                    </div>
                    <div>
                      <dt>{t("pricing.additionalMinutes")}</dt>
                      <dd>{plan.additionalMinuteRate}</dd>
                    </div>
                    <div>
                      <dt>{t("pricing.receptionists")}</dt>
                      <dd>{plan.receptionists}</dd>
                    </div>
                    <div>
                      <dt>{t("pricing.concurrentCalls")}</dt>
                      <dd>{plan.concurrentCalls}</dd>
                    </div>
                    <div>
                      <dt>{t("pricing.languages")}</dt>
                      <dd>{plan.languages}</dd>
                    </div>
                    <div>
                      <dt>{t("pricing.integrations")}</dt>
                      <dd>{plan.integrations}</dd>
                    </div>
                    <div>
                      <dt>{t("pricing.analytics")}</dt>
                      <dd>{plan.analytics}</dd>
                    </div>
                    <div>
                      <dt>{t("pricing.support")}</dt>
                      <dd>{plan.support}</dd>
                    </div>
                  </dl>
                  <LocalizedLink className="ai-button ai-button--secondary"
                    aria-label={t("ui.planLabel", { cta: plan.cta, name: plan.name })}
                    to={plan.name === "Call Center" ? "/contact/sales?solution=ai_receptionist&cta=pricing" : "/request-pricing?industry=overview&solution=ai_receptionist&cta=pricing"}
                    onClick={() => void trackEvent("cta_click", { ctaName: plan.cta, section: "pricing" })}>{plan.cta}<span className="ai-sr-only"> {t("ui.planName", { name: plan.name })}</span></LocalizedLink>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="ai-section ai-shell">
          <div className="ai-section-heading">
            <p className="ai-eyebrow">{t("sections.faqEyebrow")}</p>
            <h2>{t("sections.faq")}</h2>
          </div>
          <div className="ai-faq">
            {faqItems.map(([question, answer], index) => (
              <div key={question}>
                <h3>
                  <button
                    aria-expanded={openFaq === index}
                    aria-controls={`faq-answer-${index}`}
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    {question}
                    <FiChevronDown />
                  </button>
                </h3>
                <div id={`faq-answer-${index}`} hidden={openFaq !== index}>
                  <p>{answer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="final-cta" className="ai-section ai-final-cta ai-shell">
          <p className="ai-eyebrow">{t("final.eyebrow")}</p>
          <h2>{t("sections.final")}</h2>
          <p>{t("ui.finalBody")}</p>
          <div className="ai-actions ai-actions--center">
            <CallAiLink section="final-cta" primary />
            <button
              className="ai-button ai-button--secondary"
              onClick={() => openLead("Book a Live Demo")}
            >
              {t("cta.demo")}
            </button>
            <LocalizedLink className="ai-button ai-button--secondary" to="/request-pricing?industry=overview&solution=ai_receptionist&cta=final">{t("cta.requestPricing")}</LocalizedLink>
          </div>
        </section>
      </main>
      <div className="ai-consent-banner" hidden={analyticsChoice}>
        <p>{t("ui.consentBody")}</p>
        <button
          onClick={() => {
            setAnalyticsConsent(false);
            setAnalyticsChoice(true);
          }}
        >
          {t("consent.decline")}
        </button>
        <button
          className="ai-button ai-button--secondary"
          onClick={() => {
            setAnalyticsConsent(true);
            setAnalyticsChoice(true);
            void trackEvent("page_view", { section: "consent" });
          }}
        >
          {t("consent.allow")}
        </button>
      </div>
      <Footer />
      <LeadModal
        open={modal.open}
        onClose={closeLead}
        cta={modal.cta}
        industry={selectedIndustry.label}
      />
    </div>
  );
}
