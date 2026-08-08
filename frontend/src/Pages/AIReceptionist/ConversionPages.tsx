import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import Footer from "../../Components/Layouts/Footer";
import AIReceptionistNav from "./AIReceptionistNav";
import LeadForm from "./LeadForm";
import "./ai-receptionist.css";
import { industryConfigs } from "../Industries/industryConfig";
import LocalizedLink from "../../i18n/LocalizedLink";

const industries: Record<string, string> = {
  logistics: "Transportation and logistics", legal: "Law firms and legal services",
  healthcare: "Private healthcare", senior_care: "Senior care and medical transportation",
  real_estate: "Real estate and property management", financial_services: "Financial services and insurance",
  ecommerce: "Retail and e-commerce", hospitality: "Hotels, travel and hospitality",
  construction: "Construction and home services", agriculture: "Agriculture and food production",
  education: "Education and training", dental: "Dental practices", veterinary: "Veterinary practices",
  automotive: "Automotive dealerships and repair", restaurant: "Restaurants and food service",
  manufacturing: "Manufacturing", recruitment: "Recruitment and human resources",
  nonprofit: "Nonprofits and community organizations", public_services: "Government and public services",
  energy: "Energy, solar and utilities", telecom_it: "Telecommunications and managed IT",
  wellness: "Beauty, wellness and fitness", security_services: "Security and alarm companies",
  marketing_media: "Marketing agencies and media", gaming_entertainment: "Gaming and entertainment",
};
const safeContext = (params: URLSearchParams) => {
  const code = params.get("industry") || "";
  const industry = industries[code] ? code : "";
  const solution = /^[a-z0-9_]{1,100}$/.test(params.get("solution") || "") ? params.get("solution")! : "";
  const cta = /^[a-z0-9_]{1,40}$/.test(params.get("cta") || "") ? params.get("cta")! : "request_demo";
  return { industry, solution, cta };
};

export function BookDemoPage() {
  const {t}=useTranslation("conversion");
  const [params] = useSearchParams();
  const { industry, solution, cta } = safeContext(params);
  const questions = industryConfigs.find((item) => item.name === industries[industry])?.qualifyingQuestions.slice(0, 3) ?? [];
  return (
    <div className="ai-page">
      <AIReceptionistNav />
      <main className="ai-shell ai-section" style={{ paddingTop: 140 }}>
        <p className="ai-eyebrow">{t("demo.eyebrow")}</p>
        <h1 style={{ fontSize: "clamp(2.5rem,5vw,4.5rem)" }}>
          {t("demo.title")}
        </h1>
        <p className="ai-lede">
          {t("demo.body")}
        </p>
        <div className="ai-card">
          <LeadForm
            ctaClicked={cta}
            industrySelected={industry}
            solutionSelected={solution}
            qualifyingQuestions={questions}
            endpoint="/api/v1/demo-requests"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function RequestPricingPage() {
  const {t}=useTranslation("conversion");
  const [params] = useSearchParams();
  const { industry, solution } = safeContext(params);
  const questions = industryConfigs.find((item) => item.name === industries[industry])?.qualifyingQuestions.slice(0, 3) ?? [];
  return (
    <div className="ai-page">
      <AIReceptionistNav />
      <main className="ai-shell ai-section" style={{ paddingTop: 140 }}>
        <p className="ai-eyebrow">{t("pricing.eyebrow")}</p>
        <h1 style={{ fontSize: "clamp(2.5rem,5vw,4.5rem)" }}>{t("pricing.title")}</h1>
        <p className="ai-lede">{t("pricing.body")}</p>
        <div className="ai-card"><LeadForm ctaClicked="request_pricing" industrySelected={industry} solutionSelected={solution} qualifyingQuestions={questions} endpoint="/api/v1/pricing-requests" submitLabel={t("pricing.title")} /></div>
      </main>
      <Footer />
    </div>
  );
}

export function ThankYouPage() {
  const {t}=useTranslation("conversion");
  return (
    <div className="ai-page">
      <AIReceptionistNav />
      <main
        className="ai-shell ai-section"
        style={{ paddingTop: 160, minHeight: "65vh" }}
      >
        <p className="ai-eyebrow">{t("thanks.eyebrow")}</p>
        <h1 style={{ fontSize: "clamp(2.5rem,5vw,4.5rem)" }}>{t("thanks.title")}</h1>
        <p className="ai-lede">
          {t("thanks.body")}
        </p>
        <LocalizedLink className="ai-button ai-button--primary" to="/ai-receptionist">{t("thanks.return")}</LocalizedLink>
      </main>
      <Footer />
    </div>
  );
}

export function SecurityPage() {
  const {t}=useTranslation("conversion");
  return (
    <div className="ai-page">
      <AIReceptionistNav />
      <main
        className="ai-shell ai-section"
        style={{ paddingTop: 150, minHeight: "65vh" }}
      >
        <p className="ai-eyebrow">{t("security.eyebrow")}</p>
        <h1 style={{ fontSize: "clamp(2.5rem,5vw,4.5rem)" }}>
          {t("security.title")}
        </h1>
        <p className="ai-lede">
          {t("security.body")}
        </p>
        <LocalizedLink className="ai-button ai-button--secondary" to="/contact/sales">{t("security.contact")}</LocalizedLink>
      </main>
      <Footer />
    </div>
  );
}

export function TermsPage() {
  const {t}=useTranslation("conversion");
  return (
    <div className="ai-page">
      <AIReceptionistNav />
      <main
        className="ai-shell ai-section"
        style={{ paddingTop: 150, minHeight: "65vh" }}
      >
        <p className="ai-eyebrow">{t("terms.eyebrow")}</p>
        <h1 style={{ fontSize: "clamp(2.5rem,5vw,4.5rem)" }}>{t("terms.title")}</h1>
        <p className="ai-lede">
          {t("terms.body")}
        </p>
        <LocalizedLink className="ai-button ai-button--secondary" to="/contact">{t("terms.contact")}</LocalizedLink>
      </main>
      <Footer />
    </div>
  );
}
