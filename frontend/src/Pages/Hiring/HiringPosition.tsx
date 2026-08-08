import { Button1 } from "@/Components/components/Button";
import Footer from "@/Components/Layouts/Footer";
import Navbar from "@/Components/Layouts/Navbar";
import { useTranslation } from "react-i18next";
import { IoMdCheckmarkCircle } from "react-icons/io";
import LocalizedLink from "../../i18n/LocalizedLink";

type Role = { title: string; requirements: string[] };

const HiringPosition = () => {
  const { t } = useTranslation("hiring");
  const roles = t("roles", { returnObjects: true }) as Role[];
  return <><Navbar /><main className="2xl:px-[25rem] xl:px-[10rem] lg:px-[8rem] px-5 lg:pt-[10rem] pt-[8rem] text-center">
    <h1 className="lg:text-3xl text-2xl pb-3">{t("title")}</h1><p>{t("intro")}</p>
    <div className="text-left mt-10 grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-8 lg:text-sm text-xs">
      {roles.map((role) => <article key={role.title} className="bg-[#151517] p-10 rounded-2xl border border-neutral-800"><h2 className="text-lg">{role.title}</h2><ul className="pt-4 space-y-4">{role.requirements.map((requirement) => <li key={requirement} className="flex items-start gap-2"><IoMdCheckmarkCircle aria-hidden="true" className="text-lg shrink-0"/><span>{requirement}</span></li>)}</ul><div className="mt-5"><LocalizedLink to="/contact"><Button1 text={t("apply")} /></LocalizedLink></div></article>)}
    </div>
  </main><Footer /></>;
};
export default HiringPosition;
