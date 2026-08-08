import { Button2 } from "@/Components/components/Button";
import Footer from "@/Components/Layouts/Footer";
import Navbar from "@/Components/Layouts/Navbar";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import LocalizedLink from "../../i18n/LocalizedLink";

type ServiceSection = { title: string; body?: string; items?: string[] };

const Services = () => {
  const { t } = useTranslation("services");
  const sections = t("sections", { returnObjects: true }) as ServiceSection[];

  return (
    <div>
      <Navbar />
      <main>
        <section className="myBg2 2xl:px-[25rem] 2xl:!h-[65vh] xl:!h-[80vh] lg:!h-[80vh] !h-[50vh] xl:px-[10rem] lg:px-[8rem] px-5 lg:pt-[11rem] pt-[8rem]">
          <div className="2xl:w-[60%] xl:w-[70%] lg:w-[80%] w-full font-semibold space-y-6">
            <h1 className="2xl:text-4xl xl:text-3xl lg:text-3xl text-xl lg:pb-5 pb-0 !leading-normal">
              {t("hero.title")}
            </h1>
            <p className="lg:text-lg text-sm">{t("hero.body")}</p>
            <LocalizedLink to="/contact/sales">
              <Button2 text={t("hero.cta")} />
            </LocalizedLink>
          </div>
        </section>

        <div className="2xl:px-[25rem] xl:px-[10rem] lg:px-[8rem] lg:space-y-14 space-y-10 px-5 lg:text-sm text-xs">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="lg:text-xl text-base font-semibold pb-3">
                {section.title}
              </h2>
              {section.body && (
                <p className={section.items ? "pb-3" : undefined}>
                  {section.body}
                </p>
              )}
              {section.items && (
                <ul className="space-y-4">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <IoCheckmarkCircleSharp className="text-2xl shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Services;
