import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useParams, useSearchParams } from "react-router";
import Footer from "../../Components/Layouts/Footer";
import LocalizedLink from "../../i18n/LocalizedLink";
import AIReceptionistNav from "../AIReceptionist/AIReceptionistNav";
import { trackEvent } from "../AIReceptionist/analytics";
import { industryBySlug, industryConfigs, type IndustryConfig } from "./industryConfig";
import "../AIReceptionist/ai-receptionist.css";
import "./industry-platform.css";

const codes: Record<string, string> = {
  "logistics-ai": "logistics", "legal-ai": "legal", "healthcare-ai": "healthcare",
  "senior-care-ai": "senior_care", "real-estate-ai": "real_estate",
  "financial-services-ai": "financial_services", "ecommerce-ai": "ecommerce",
  "hospitality-ai": "hospitality", "construction-ai": "construction", "agriculture-ai": "agriculture",
  "education-ai": "education", "dental-ai": "dental", "veterinary-ai": "veterinary",
  "automotive-ai": "automotive", "restaurant-ai": "restaurant", "manufacturing-ai": "manufacturing",
  "recruitment-ai": "recruitment", "nonprofit-ai": "nonprofit", "public-services-ai": "public_services",
  "energy-ai": "energy", "telecom-it-ai": "telecom_it", "wellness-ai": "wellness",
  "security-services-ai": "security_services", "marketing-media-ai": "marketing_media",
  "gaming-entertainment-ai": "gaming_entertainment",
};

const legacyCategories: Record<string, string> = {
  "healthcare-ai":"Healthcare and Care", "senior-care-ai":"Healthcare and Care",
  "legal-ai":"Professional Services", "financial-services-ai":"Professional Services", "real-estate-ai":"Professional Services",
  "ecommerce-ai":"Commerce and Hospitality", "hospitality-ai":"Commerce and Hospitality",
  "logistics-ai":"Operations and Infrastructure", "construction-ai":"Operations and Infrastructure",
  "agriculture-ai":"Agriculture and Production",
};
const categoryOf = (item: IndustryConfig) => item.category ?? legacyCategories[item.slug] ?? "Technology and Media";

function Cta({ to, children, primary = false, section, industry = "overview", solution = "industry_ai" }: { to: string; children: React.ReactNode; primary?: boolean; section: string; industry?: string; solution?: string }) {
  return <LocalizedLink className={`ai-button ${primary ? "ai-button--primary" : "ai-button--secondary"}`} to={to}
    onClick={() => { void trackEvent("cta_click", { ctaName: String(children), section, industry, solution }); if (section === "industry-card") void trackEvent("industry_card_clicked", { ctaName: String(children), section, industry, solution }); if (section === "related") void trackEvent("related_industry_clicked", { ctaName: String(children), section, industry, solution }); }}>{children}</LocalizedLink>;
}

export function IndustriesDirectory() {
  const { t } = useTranslation("industries");
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const category = params.get("category") ?? "All";
  const [filtersOpen, setFiltersOpen] = useState(false);
  const localizedIndustries = industryConfigs.map((item) => ({
    ...item,
    ...(t(`content.${item.slug}`, { returnObjects: true }) as Partial<IndustryConfig>),
    slug: item.slug,
    campaign: item.campaign,
  }));
  const categories = ["All", ...Array.from(new Set(localizedIndustries.map(categoryOf)))];
  const filtered = localizedIndustries.filter((item) => (category === "All" || categoryOf(item) === category) && `${item.name} ${item.summary} ${item.actions.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  const update = (next: { q?: string; category?: string }) => {
    const copy = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) {
      if (value && value !== "All") copy.set(key, value);
      else copy.delete(key);
    }
    setParams(copy, { replace: true });
  };
  useEffect(() => { void trackEvent("industry_directory_viewed", { section: "industry-overview", industry: "overview" }); }, []);
  return <div className="ai-page"><AIReceptionistNav /><main>
    <section className="ai-shell ai-section industry-directory-hero"><p className="ai-eyebrow">{t("directory.eyebrow")}</p><h1>{t("directory.title")}</h1><p className="ai-lede">{t("directory.body")}</p><div className="ai-actions"><Cta to="/industries/logistics-ai" primary section="directory-hero">{t("directory.logistics")}</Cta><Cta to="/book-demo?industry=overview&solution=industry_ai&cta=hero" section="directory-hero">{t("directory.demo")}</Cta></div></section>
    <section className="ai-shell ai-section"><div className="ai-section-heading"><p className="ai-eyebrow">{t("directory.count")}</p><h2>{t("directory.choose")}</h2></div>
      <div className="industry-directory-tools"><label htmlFor="industry-search">{t("directory.search")}</label><input id="industry-search" type="search" value={query} placeholder={t("directory.searchPlaceholder")} onChange={(event) => { update({q:event.target.value}); void trackEvent("industry_search_used", {section:"directory-search", ctaName:event.target.value ? "search" : "cleared"}); }} /><button className="ai-button ai-button--secondary industry-filter-toggle" type="button" aria-expanded={filtersOpen} aria-controls="industry-filters" onClick={() => setFiltersOpen((value) => !value)}>{t("directory.filter")}</button></div>
      <div id="industry-filters" className={`industry-filters ${filtersOpen ? "industry-filters--open" : ""}`} role="group" aria-label={t("directory.categories")}>{categories.map((item) => <button type="button" aria-pressed={category === item} key={item} onClick={() => {update({category:item}); setFiltersOpen(false); void trackEvent("industry_filter_selected", {section:"directory-filter", ctaName:item});}}>{item}</button>)}</div>
      <p className="ai-muted" aria-live="polite">{t("directory.showing", { visible: filtered.length, total: industryConfigs.length })}</p>
      {filtered.length ? <div className="industry-directory-grid">{filtered.map((item, index) => <article className={`ai-card ${index === 0 && !query && category === "All" ? "industry-live-card" : ""}`} key={item.slug} onFocus={() => void trackEvent("industry_card_viewed", {section:"industry-card", industry:codes[item.slug]})} onMouseEnter={() => void trackEvent("industry_card_viewed", {section:"industry-card", industry:codes[item.slug]})}><span>{categoryOf(item)}</span><h3>{item.name}</h3><p>{item.summary}</p><Cta to={`/industries/${item.slug}`} primary={index === 0 && !query && category === "All"} section="industry-card" industry={codes[item.slug]}>{t("directory.explore", { industry: item.name })}</Cta></article>)}</div> : <div className="industry-empty"><h3>{t("directory.empty")}</h3><p>{t("directory.emptyBody")}</p><button className="ai-button ai-button--secondary" type="button" onClick={() => setParams({})}>{t("directory.clear")}</button></div>}
    </section>
  </main><Footer /></div>;
}

export function IndustryPage() {
  const { industrySlug = "" } = useParams();
  const { t } = useTranslation("industries");
  const data = industryBySlug[industrySlug];
  if (!data) return <Navigate to="/industries" replace />;
  const localizedData = {
    ...data,
    ...(t(`content.${data.slug}`, { returnObjects: true }) as Partial<IndustryConfig>),
    slug: data.slug,
    campaign: data.campaign,
  };
  return <IndustryExperience data={localizedData} />;
}

function IndustryExperience({ data }: { data: IndustryConfig }) {
  const { t } = useTranslation("industries");
  const industry = codes[data.slug];
  const solution = `${industry}_ai_platform`;
  const [scenario, setScenario] = useState(0);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [stickyDismissed, setStickyDismissed] = useState(false);
  const [inputs, setInputs] = useState({ volume: 800, missed: 18, value: 300, conversion: 20, wage: 24, minutes: 8 });
  const result = useMemo(() => { const missed = Math.round(inputs.volume * inputs.missed / 100); const opportunities = Math.round(missed * inputs.conversion / 100); const hours = Math.round(inputs.volume * inputs.minutes / 60); return { missed, opportunities, hours, monthly: opportunities * inputs.value, annual: opportunities * inputs.value * 12 }; }, [inputs]);
  useEffect(() => { void trackEvent("industry_page_view", { section: "hero", industry, solution }); }, [data, industry, solution]);
  useEffect(() => { const update = () => setStickyVisible(window.scrollY > Math.min(window.innerHeight * .75, 720)); update(); addEventListener("scroll", update, { passive: true }); return () => removeEventListener("scroll", update); }, []);
  const demo = data.scenarios[scenario];
  const demoUrl = `/book-demo?industry=${industry}&solution=${solution}&cta=hero`;
  return <div className="ai-page"><AIReceptionistNav /><main>
    <nav className="ai-shell industry-breadcrumb" aria-label={t("shared.breadcrumb")}><LocalizedLink to="/">{t("shared.home")}</LocalizedLink><span>/</span><LocalizedLink to="/industries">{t("shared.industries")}</LocalizedLink><span>/</span><span aria-current="page">{data.name}</span></nav>
    <section className="ai-shell ai-section industry-hero"><div><p className="ai-eyebrow">{data.eyebrow}</p><h1 className="ai-typing-title">{data.headline}</h1><p className="ai-lede">{data.summary}</p><div className="ai-actions"><Cta to={demoUrl} primary section="hero" industry={industry} solution={solution}>{data.primaryCta ?? t("shared.requestDemo")}</Cta><a className="ai-button ai-button--secondary" href="#workflow" onClick={() => void trackEvent("workflow_viewed", { section: "hero", industry, solution })}>{t("shared.workflow")}</a></div>{data.disclosures?.map((text) => <p className="industry-disclosure" key={text}>{text}</p>)}</div><div className="industry-console" aria-label={`${t("shared.simulated")} ${data.name}`}><span>{t("shared.simulated")}</span><strong>{demo.title}</strong><p>{t("shared.intent")}: {data.intake[0]}</p><p>{t("shared.route")}: {data.routing[0]}</p><p>{t("shared.odoo")}</p></div></section>
    <section className="ai-section ai-section--surface"><div className="ai-shell"><div className="ai-section-heading"><p className="ai-eyebrow">{t("shared.problemsEyebrow")}</p><h2>{t("shared.problems")}</h2></div><div className="industry-grid">{data.problems.map((item) => <article className="ai-card" key={item}><h3>{item}</h3><p>{t("shared.problemBody")}</p></article>)}</div></div></section>
    <section id="workflow" className="ai-shell ai-section"><div className="ai-section-heading"><p className="ai-eyebrow">{t("shared.workflowEyebrow")}</p><h2>{t("shared.workflowTitle")}</h2></div><div className="industry-workflow"><article><b>1</b><h3>{t("shared.capture")}</h3><p>{data.intake.join(", ")}.</p></article><article><b>2</b><h3>{t("shared.act")}</h3><p>{data.actions.join(", ")}.</p></article><article><b>3</b><h3>{t("shared.routeStep")}</h3><p>{data.routing.join(", ")}.</p></article></div></section>
    <section className="ai-section ai-section--surface"><div className="ai-shell"><div className="ai-section-heading"><p className="ai-eyebrow">{t("shared.catalogEyebrow")}</p><h2>{t("shared.catalog")}</h2></div><div className="industry-grid">{(data.products ?? data.actions).map((item) => <article className="ai-card" key={item}><h3>{item}</h3><p>{t("shared.catalogBody")}</p></article>)}</div></div></section>
    <section id="audio-demo" className="ai-section ai-section--surface"><div className="ai-shell industry-demo"><div><p className="ai-eyebrow">{t("shared.simulationEyebrow")}</p><h2>{t("shared.simulationTitle", { industry: data.name })}</h2><div className="industry-tabs" role="tablist" aria-label={t("shared.simulationLabel")}>{data.scenarios.map((item, index) => <button role="tab" aria-selected={scenario === index} onClick={() => { setScenario(index); void trackEvent("scenario_selected", { section: "scenario", ctaName: item.title, industry, solution }); void trackEvent("industry_demo_started", { section: "scenario", ctaName: item.title, industry, solution }); void trackEvent("industry_demo_completed", { section: "scenario", ctaName: item.title, industry, solution }); }} key={item.title}>{item.title}</button>)}</div></div><div className="industry-console"><span>{t("shared.simulationNotice")}</span><h3>{demo.title}</h3><p>{demo.transcript}</p><strong>{demo.outcome}</strong><div className="industry-wave" aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <i key={i} />)}</div></div></div></section>
    <section id="integrations" className="ai-shell ai-section"><div className="ai-section-heading"><p className="ai-eyebrow">{t("shared.integrationEyebrow")}</p><h2>{t("shared.integration")}</h2></div><div className="industry-integration-grid">{data.integrations.map((item) => <article className="ai-card" key={item.name}><h3>{item.name}</h3><span>{item.status}</span></article>)}</div><p className="ai-muted">{t("shared.integrationNote")}</p></section>
    <section className="ai-section ai-section--surface"><div className="ai-shell industry-roi"><div><p className="ai-eyebrow">{t("calculator.eyebrow")}</p><h2>{t("calculator.title")}</h2><div className="industry-inputs">{([['volume','volume'],['missed','missedPercent'],['value','leadValue'],['conversion','conversion'],['wage','wage'],['minutes','minutes']] as const).map(([key,labelKey]) => <label key={key}>{t(`calculator.inputs.${labelKey}`)}<input type="number" min="0" value={inputs[key]} onChange={(e) => { setInputs({ ...inputs, [key]: Number(e.target.value) }); void trackEvent("industry_roi_completed", {section:"calculator", industry, solution}); }} /></label>)}</div></div><div className="industry-results"><span>{t("calculator.missed")} <b>{result.missed}</b></span><span>{t("calculator.qualified")} <b>{result.opportunities}</b></span><span>{t("calculator.hours")} <b>{result.hours}</b></span><span>{t("calculator.monthly")} <b>${result.monthly.toLocaleString()}</b></span><span>{t("calculator.annual")} <b>${result.annual.toLocaleString()}</b></span><small>{t("calculator.estimate")}</small><Cta to={`/book-demo?industry=${industry}&solution=${solution}&cta=calculator`} primary section="calculator" industry={industry} solution={solution}>{t("calculator.review")}</Cta></div></div></section>
    <section className="ai-shell ai-section industry-security"><div><p className="ai-eyebrow">{t("shared.securityEyebrow")}</p><h2>{t("shared.security")}</h2></div><ul>{["Human escalation", "Role-based access", "Encrypted connections", "Configurable retention", "Approved knowledge sources", "Audit logging", "Consent controls", "Restricted AI actions"].map((item) => <li key={item}>{item}</li>)}</ul></section>
    <section className="ai-section ai-section--surface"><div className="ai-shell"><div className="ai-section-heading"><p className="ai-eyebrow">{t("shared.analyticsEyebrow")}</p><h2>{t("shared.analytics")}</h2></div><div className="industry-dashboard">{[["Total inquiries","1,284"],["Qualified requests","326"],["Actions completed","184"],["Human escalations","72"]].map(([label,value]) => <article key={label}><span>{label}</span><strong>{value}</strong><small>{t("shared.sample")}</small></article>)}</div></div></section>
    <section className="ai-shell ai-section"><div className="ai-section-heading"><p className="ai-eyebrow">{t("shared.qualificationEyebrow")}</p><h2>{t("shared.qualification")}</h2></div><div className="industry-grid">{data.qualifyingQuestions.map((item) => <article className="ai-card" key={item}><h3>{item}</h3><p>{t("shared.qualificationBody")}</p></article>)}</div></section>
    <section className="ai-section ai-section--surface"><div className="ai-shell"><div className="ai-section-heading"><p className="ai-eyebrow">{t("shared.implementationEyebrow")}</p><h2>{t("shared.implementation")}</h2></div><div className="industry-workflow">{(["map","test","canary"] as const).map((step,index)=><article key={step}><b>{index+1}</b><h3>{t(`implementation.${step}.title`)}</h3><p>{t(`implementation.${step}.body`)}</p></article>)}</div></div></section>
    <section className="ai-shell ai-section"><div className="ai-section-heading"><p className="ai-eyebrow">{t("shared.faq")}</p><h2>{t("shared.questions", { industry: data.name })}</h2></div><div className="industry-faq">{data.faq.map(([q,a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>
    <section className="ai-section ai-section--surface"><div className="ai-shell"><div className="ai-section-heading"><p className="ai-eyebrow">{t("shared.relatedEyebrow")}</p><h2>{t("shared.related")}</h2></div><div className="industry-directory-grid">{industryConfigs.filter((item) => item.slug !== data.slug).sort((a, b) => Number(categoryOf(b) === categoryOf(data)) - Number(categoryOf(a) === categoryOf(data))).slice(0, 3).map((item) => <article className="ai-card" key={item.slug}><h3>{item.name}</h3><Cta to={`/industries/${item.slug}`} section="related" industry={codes[item.slug]}>{t("shared.related")}</Cta></article>)}</div></div></section>
    <section className="ai-shell ai-section ai-final-cta"><p className="ai-eyebrow">{t("shared.finalEyebrow")}</p><h2>{t("shared.final")}</h2><p>{t("shared.finalBody")}</p><div className="ai-actions"><Cta to={demoUrl} primary section="final" industry={industry} solution={solution}>{t("shared.requestDemo")}</Cta><Cta to={`/request-pricing?industry=${industry}&solution=${solution}&cta=pricing`} section="final" industry={industry} solution={solution}>{t("shared.requestPricing")}</Cta></div></section>
  </main><Footer />{stickyVisible && !stickyDismissed && <aside className="industry-sticky-cta" aria-label={`${data.name} demo`}><span>{t("shared.reviewWorkflow")}</span><Cta to={`/book-demo?industry=${industry}&solution=${solution}&cta=sticky`} primary section="sticky-mobile" industry={industry} solution={solution}>{t("shared.requestDemo")}</Cta><button type="button" aria-label={t("shared.dismiss")} onClick={() => setStickyDismissed(true)}>×</button></aside>}</div>;
}
