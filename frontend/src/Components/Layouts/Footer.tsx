import logo from "../../assets/logo.png";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../../i18n/LanguageSelector";
import LocalizedLink from "../../i18n/LocalizedLink";

const serviceLinks = [
  "softwareDevelopment", "mobileDevelopment", "aiDevelopment", "softwareConsulting", "uiUx", "webDesign", "branding",
];
const industryLinks = [
  ["finance", "financial-services-ai"], ["healthcare", "healthcare-ai"], ["gaming", "gaming-entertainment-ai"], ["realEstate", "real-estate-ai"], ["education", "education-ai"], ["web3", "industries"],
];

const Footer = () => {
  const { t } = useTranslation(["common", "navigation", "legal"]);
  return (
  <footer className="flex lg:flex-row flex-col lg:gap-14 gap-8 text-sm 2xl:px-[25rem] xl:px-[10rem] lg:px-[5rem] px-8 bg-[#08090A] border-t border-neutral-800 lg:py-20 pt-10 pb-10 lg:mt-[10rem] mt-[5rem] justify-between overflow-hidden">
    <div>
      <h2 className="text-base text-white font-bold">{t("common:office")}</h2>
      <div className="text-xs">
        <div className="pb-3 pt-3 border-b border-neutral-800">
          <a
            className="pb-2 block hover:text-[#FFD700]"
            href="tel:+18097347580"
          >
            809-734-7580
          </a>
          <p>
            Codestra, Condominio Progreso Business Center, Av. Lope de Vega 13,
            Santo Domingo 10130
          </p>
        </div>
        <div className="pb-3 pt-3 border-b border-neutral-800">
          <a
            className="pb-2 block hover:text-[#FFD700]"
            href="tel:+13465446979"
          >
            +1 346-544-6979
          </a>
          <p>20634 Longen Baugh RD Cypress TX, USA 77433</p>
        </div>
        <div className="pb-3 pt-3">
          <a
            className="hover:text-[#FFD700] inline-flex min-h-6 items-center"
            href="mailto:support@codestra.co"
          >
            support@codestra.co
          </a>
          <LocalizedLink to="/" className="block pt-4" aria-label={t("common:codestraHome")}>
            <img src={logo} alt="Codestra" className="w-24" />
          </LocalizedLink>
          <div className="pt-5">
            <p className="pb-3">{t("common:footer.craftsmanship")}</p>
            <p>{t("common:footer.reliableProducts")}</p>
          </div>
        </div>
      </div>
    </div>
    <div className="flex lg:flex-row flex-col lg:gap-28 gap-8 text-white">
      <ul className="space-y-5 text-sm lg:border-none border-t lg:pt-0 pt-5 border-neutral-800 min-w-0">
        <li className="text-base font-bold">{t("common:services")}</li>
        {serviceLinks.map((item) => (
          <li key={item}>
            <LocalizedLink className="hover:text-[#FFD700]" to="/services">
              {t(`common:footer.services.${item}`)}
            </LocalizedLink>
          </li>
        ))}
      </ul>
      <ul className="space-y-5 lg:border-none border-t lg:pt-0 pt-5 border-neutral-800 min-w-0">
        <li className="text-base font-bold">{t("common:industries")}</li>
        {industryLinks.map(([item, path]) => (
          <li key={item} className="min-w-0">
            <LocalizedLink className="inline-block max-w-full whitespace-normal break-words hover:text-[#FFD700]" to={path === "industries" ? "/industries" : `/industries/${path}`}>
              {t(`common:footer.industries.${item}`)}
            </LocalizedLink>
          </li>
        ))}
      </ul>
      <ul className="space-y-5 lg:border-none border-t lg:pt-0 pt-5 border-neutral-800">
        <li className="text-base font-bold">{t("common:company")}</li>
        <li>
          <LocalizedLink className="hover:text-[#FFD700]" to="/about">
            {t("navigation:about")}
          </LocalizedLink>
        </li>
        <li>
          <LocalizedLink className="hover:text-[#FFD700]" to="/contact">
            {t("navigation:contact")}
          </LocalizedLink>
        </li>
        <li>
          <LocalizedLink className="hover:text-[#FFD700]" to="/case-studies">
            {t("common:footer.ourWork")}
          </LocalizedLink>
        </li>
        <li>
          <LocalizedLink className="hover:text-[#FFD700]" to="/privacy">
            {t("legal:privacy")}
          </LocalizedLink>
        </li>
        <li>
          <LocalizedLink className="hover:text-[#FFD700]" to="/terms">
            {t("legal:terms")}
          </LocalizedLink>
        </li>
        <li>
          <LocalizedLink className="hover:text-[#FFD700]" to="/security">
            {t("legal:security")}
          </LocalizedLink>
        </li>
        <li>
          <LocalizedLink
            className="hover:text-[#FFD700]"
            to="/ai-receptionist#integrations"
          >
            {t("navigation:integrations")}
          </LocalizedLink>
        </li>
        <li>
          <LocalizedLink className="hover:text-[#FFD700]" to="/pricing">
            {t("navigation:pricing")}
          </LocalizedLink>
        </li>
        <li>
          <a
            className="hover:text-[#FFD700]"
            href="https://www.linkedin.com/company/codestra"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </li>
        <li>
          <LanguageSelector id="footer-language" />
        </li>
        <li className="text-xs text-neutral-400">
          {t("common:copyright", { year: new Date().getFullYear() })}
        </li>
      </ul>
    </div>
  </footer>
  );
};

export default Footer;
