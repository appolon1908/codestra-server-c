import { ArrowRight, BookOpen, Boxes, CheckCircle2, GraduationCap, Headphones, Search, ShieldCheck, Users } from "lucide-react";
import { Link, useLocation, useParams } from "react-router";

type Area = "marketplace" | "sales" | "customer" | "partner" | "developer" | "documentation" | "academy" | "support" | "status";

const copy = {
  en: {
    marketplace: ["Codestra Marketplace", "Discover approved AI employees, workflows, integrations, and industry solutions.", "Browse catalog"],
    sales: ["Sales Command Center", "Prepare verified prospects with controlled discovery, enrichment, scoring, and review.", "View discovery jobs"],
    customer: ["Customer portal", "Manage workspaces, entitlements, integrations, support, usage, and training.", "View account"],
    partner: ["Partner portal", "Build expertise, register opportunities, and request marketplace publication.", "Start onboarding"],
    developer: ["Developer portal", "Build secure integrations with versioned APIs, webhooks, SDK guidance, and sandbox references.", "Read API guides"],
    documentation: ["Documentation", "Versioned guidance for Codestra products, administration, integrations, and security.", "Search documentation"],
    academy: ["Codestra Academy", "Role-based learning for customers, partners, developers, agents, and supervisors.", "Browse courses"],
    support: ["Support center", "Find answers, open a request, and review service commitments.", "Request support"],
    status: ["Platform status", "Approved public service health and incident updates.", "View history"],
  },
  es: {
    marketplace: ["Marketplace de Codestra", "Descubre empleados de IA, flujos, integraciones y soluciones aprobadas.", "Explorar catálogo"],
    sales: ["Centro de ventas", "Prepara prospectos verificados con descubrimiento, enriquecimiento y revisión controlados.", "Ver trabajos"],
    customer: ["Portal de clientes", "Administra espacios, derechos, integraciones, soporte, uso y formación.", "Ver cuenta"],
    partner: ["Portal de socios", "Desarrolla experiencia, registra oportunidades y solicita publicaciones.", "Iniciar registro"],
    developer: ["Portal de desarrolladores", "Crea integraciones seguras con APIs versionadas, webhooks y sandbox.", "Leer guías"],
    documentation: ["Documentación", "Guías versionadas para productos, administración, integraciones y seguridad.", "Buscar documentación"],
    academy: ["Academia Codestra", "Aprendizaje por rol para clientes, socios, desarrolladores y agentes.", "Ver cursos"],
    support: ["Centro de soporte", "Encuentra respuestas, abre una solicitud y revisa compromisos de servicio.", "Solicitar soporte"],
    status: ["Estado de la plataforma", "Salud pública aprobada y actualizaciones de incidentes.", "Ver historial"],
  },
} as const;

const sections: Record<Area, string[]> = {
  marketplace: ["Categories", "Products", "Publishers", "Trials", "Installations", "Updates", "Rollbacks", "Reviews", "Documentation"],
  sales: ["Discovery", "Jobs", "Companies", "Contacts", "Enrichment", "Validation", "Duplicates", "Research", "Scoring", "Intent", "Prospect lists", "CRM submissions", "Reconciliation", "Audit"],
  customer: ["Account", "Subscription", "Usage", "Entitlements", "Workspaces", "Users", "AI employees", "Integrations", "Marketplace", "Support", "Incidents", "SLA", "Billing", "Training", "Documentation", "Data export"],
  partner: ["Onboarding", "Profile", "Certification", "Training", "Referrals", "Lead registration", "Publishing requests", "Support"],
  developer: ["API documentation", "Authentication", "SDKs", "Connectors", "Webhooks", "Code samples", "Sandbox", "Changelog", "API-key requests"],
  documentation: ["Getting started", "AI Workforce", "Marketplace", "Integrations", "Voice AI", "Data Factory", "Sales Platform", "Security", "Administration", "Troubleshooting", "Release notes"],
  academy: ["Courses", "Lessons", "Quizzes", "Certificates", "Customer onboarding", "Partner certification", "Developer certification", "Agent training"],
  support: ["Knowledge base", "Support request", "Incidents", "Service levels", "Troubleshooting", "Contact"],
  status: ["Platform", "Marketplace", "Website", "Customer portal", "AI services", "Voice services", "Integrations", "Maintenance", "Incident history"],
};

const icons = [Boxes, Search, Users, BookOpen, ShieldCheck, GraduationCap, Headphones, CheckCircle2];

export default function PlatformHub({ area }: { area: Area }) {
  const { locale = "en" } = useParams();
  const location = useLocation();
  const language = locale === "es" ? "es" : "en";
  const [title, description, action] = copy[language][area];
  const selected = decodeURIComponent(location.pathname.split("/").filter(Boolean).at(-1) || "");
  return (
    <main className="min-h-screen bg-[#070a0f] text-white">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3 focus:text-black">Skip to content</a>
      <header className="border-b border-white/10 bg-[#070a0f]/90 backdrop-blur">
        <nav aria-label="Primary" className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to={`/${locale}`} className="text-xl font-bold tracking-tight">CODESTRA</Link>
          <div className="flex items-center gap-4 text-sm text-white/75">
            <Link to={`/${locale}/marketplace`}>Marketplace</Link><Link to={`/${locale}/documentation`}>Docs</Link><Link to={`/${locale}/support`}>Support</Link>
          </div>
        </nav>
      </header>
      <section id="content" className="mx-auto max-w-7xl px-5 pb-12 pt-16">
        <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">Staging-ready · approval controlled</span>
        <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">{description}</p>
        <button className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-slate-950 focus:outline-none focus:ring-4 focus:ring-cyan-200/40">{action}<ArrowRight size={18} aria-hidden="true" /></button>
      </section>
      <section aria-label={`${title} sections`} className="mx-auto grid max-w-7xl gap-4 px-5 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {sections[area].map((label, index) => {
          const Icon = icons[index % icons.length]; const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return <Link key={label} to={`/${locale}/${area === "customer" ? "portal" : area}/${slug}`} className={`group rounded-2xl border p-6 transition hover:-translate-y-0.5 hover:border-cyan-300/50 focus:outline-none focus:ring-4 focus:ring-cyan-200/30 ${selected === slug ? "border-cyan-300/60 bg-cyan-300/10" : "border-white/10 bg-white/[.035]"}`}>
            <Icon className="text-cyan-300" aria-hidden="true" /><h2 className="mt-5 text-xl font-semibold">{label}</h2><p className="mt-2 text-sm leading-6 text-slate-400">Available through the Codestra gateway. Privileged actions require middleware authorization and approval.</p>
          </Link>;
        })}
      </section>
    </main>
  );
}
