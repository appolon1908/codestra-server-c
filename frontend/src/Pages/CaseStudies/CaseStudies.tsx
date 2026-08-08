import Footer from "@/Components/Layouts/Footer";
import Navbar from "@/Components/Layouts/Navbar";
import { Button1, Button2 } from "@/Components/components/Button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CiCirclePlus } from "react-icons/ci";
import LocalizedLink from "../../i18n/LocalizedLink";

type CaseItem = { title: string; category: string; summary: string; details: string[]; status: string };

const CaseStudies = () => {
  const { t } = useTranslation("caseStudies");
  const cases = t("cases", { returnObjects: true }) as CaseItem[];
  const categories = t("categories", { returnObjects: true }) as string[];
  const faq = t("faq.items", { returnObjects: true }) as Array<{ question: string; answer: string }>;
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const visibleCases = activeCategory === categories[0] ? cases : cases.filter((item) => item.category === activeCategory);

  return (
    <div>
      <Navbar />
      <main className="2xl:px-[25rem] xl:px-[10rem] lg:px-[8rem] px-5 lg:pt-[10rem] pt-[8rem]">
        <header className="text-center" data-aos="fade-up" data-aos-duration="500">
          <h1 className="text-4xl pb-3">{t("hero.title")}</h1>
          <p>{t("hero.body")}</p>
        </header>

        <section className="lg:pt-[6rem] pt-[4rem]" aria-labelledby="case-filter-title">
          <h2 id="case-filter-title" className="sr-only">{t("filterLabel")}</h2>
          <div className="flex flex-wrap rounded-lg items-center bg-neutral-900 p-2 border border-neutral-800 gap-3 justify-center">
            {categories.map((category) => <button type="button" key={category} aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)} className={`${activeCategory === category ? "bg-neutral-800" : ""} min-h-11 p-2 px-4 rounded-full`}>{category}</button>)}
          </div>
          <div className="grid lg:grid-cols-3 grid-cols-1 gap-6 pt-10">
            {visibleCases.map((item) => <article key={item.title} className="bg-neutral-950 border border-neutral-800 p-6 rounded-2xl"><span className="text-xs text-[#FFD700]">{item.status}</span><h2 className="text-xl pt-3">{item.title}</h2><p className="text-xs text-neutral-400 pt-2">{item.category}</p><p className="text-sm pt-4">{item.summary}</p><button type="button" className="mt-5 min-h-11 inline-flex items-center gap-2" onClick={() => setSelectedCase(item)}>{t("viewDetails")} <CiCirclePlus /></button></article>)}
          </div>
        </section>

        {selectedCase && <div className="demo-modal-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedCase(null); }}><section className="demo-modal" role="dialog" aria-modal="true" aria-labelledby="case-dialog-title"><button type="button" className="ai-modal-close" aria-label={t("close")} onClick={() => setSelectedCase(null)}>×</button><span className="text-xs text-[#FFD700]">{selectedCase.status}</span><h2 id="case-dialog-title" className="text-2xl pt-3">{selectedCase.title}</h2><p className="pt-3">{selectedCase.summary}</p><ul className="pt-5 space-y-3">{selectedCase.details.map((detail) => <li key={detail}>{detail}</li>)}</ul></section></div>}

        <section className="lg:pt-[8rem] pt-[5rem]">
          <h2 className="lg:text-3xl text-2xl font-semibold">{t("faq.title")}</h2>
          <div className="flex flex-col gap-4 pt-8">{faq.map((item) => <details key={item.question} className="bg-neutral-950 border border-neutral-800 p-5 rounded-xl"><summary className="cursor-pointer min-h-11">{item.question}</summary><p className="pt-4 text-neutral-300">{item.answer}</p></details>)}</div>
          <p className="text-sm pt-6">{t("faq.notice")}</p>
        </section>

        <section className="lg:pt-[8rem] pt-[5rem]">
          <h2 className="lg:text-3xl text-2xl">{t("design.title")}</h2>
          <p className="pt-4">{t("design.body")}</p>
        </section>

        <section className="lg:pt-[5rem] pt-[3rem] lg:mt-[5rem] mt-[3rem] border-t border-neutral-800 flex lg:flex-row flex-col gap-5 justify-between items-center">
          <div><h2 className="lg:text-3xl text-2xl">{t("final.title")}</h2><p className="pt-3">{t("final.body")}</p></div>
          <div className="flex items-center gap-5"><LocalizedLink to="/signup"><Button2 text={t("final.start")} /></LocalizedLink><LocalizedLink to="/contact/sales"><Button1 text={t("final.sales")} /></LocalizedLink></div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CaseStudies;
