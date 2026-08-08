import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoIosArrowDown, IoIosArrowUp, IoMdClose } from "react-icons/io";
import { RiMenu3Line } from "react-icons/ri";
import { FaBrain } from "react-icons/fa";
import { TbBrandCake, TbBrandSocketIo, TbMessage2Filled } from "react-icons/tb";
import { IoLogoAppleAr, IoLogoBuffer, IoLogoPython } from "react-icons/io5";
import { LiaReact } from "react-icons/lia";
import { useNavigate } from "react-router";

import logo from "../../assets/logo.png";
import { clearAccessToken, hasUsableAccessToken } from "@/lib/auth";
import LanguageSelector from "../../i18n/LanguageSelector";
import LocalizedLink from "../../i18n/LocalizedLink";
import { Button1, Button2 } from "../components/Button";

const serviceItems = [
  { key: "aiAutomation", to: "/services", icon: FaBrain },
  { key: "consultation", to: "/contact/sales", icon: TbMessage2Filled },
  { key: "brandDevelopment", to: "/services", icon: TbBrandCake },
  { key: "logoDevelopment", to: "/services", icon: IoLogoBuffer },
  { key: "codestraSrl", to: "/about", icon: IoLogoAppleAr },
  { key: "reactJs", to: "/services", icon: LiaReact },
  { key: "python", to: "/services", icon: IoLogoPython },
  { key: "realtimeSync", to: "/services", icon: TbBrandSocketIo },
] as const;
const industryItems = [
  ["logistics-ai", "Transportation and logistics"],
  ["legal-ai", "Legal services"],
  ["healthcare-ai", "Healthcare"],
  ["real-estate-ai", "Real estate"],
] as const;

function ServicesMenu({ mobile = false, close }: { mobile?: boolean; close?: () => void }) {
  const { t } = useTranslation("navigation");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); close?.(); } };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);
  return <div className="relative">
    <button type="button" aria-expanded={open} className="flex min-h-11 items-center gap-2" onClick={() => setOpen((value) => !value)}>
      {t("services")}{open ? <IoIosArrowUp /> : <IoIosArrowDown />}
    </button>
    {open && <ul className={`${mobile ? "relative mt-2 w-full" : "absolute top-12 w-60"} z-20 space-y-1 rounded-lg border border-neutral-800 bg-neutral-900 p-3`}>
      {serviceItems.map(({key,to,icon:Icon}) => <li key={key}>
        <LocalizedLink to={to} onClick={close} className="flex min-h-11 items-center gap-2 rounded-full px-4 py-2 hover:bg-[#FFD700] hover:text-black">
          <Icon aria-hidden="true" />{t(`servicesMenu.${key}`)}
        </LocalizedLink>
      </li>)}
    </ul>}
  </div>;
}

function IndustriesMenu({ mobile = false, close }: { mobile?: boolean; close?: () => void }) {
  const { t } = useTranslation("navigation");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); close?.(); } };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);
  return <div className="relative">
    <button type="button" aria-expanded={open} className="flex min-h-11 items-center gap-2" onClick={() => setOpen((value) => !value)}>
      {t("industries", "Industries")}{open ? <IoIosArrowUp aria-hidden="true" /> : <IoIosArrowDown aria-hidden="true" />}
    </button>
    {open && <ul className={`${mobile ? "relative mt-2 w-full" : "absolute top-12 w-64"} z-20 space-y-1 rounded-lg border border-neutral-800 bg-neutral-900 p-3`}>
      <li><LocalizedLink to="/industries" onClick={close} className="flex min-h-11 items-center rounded-full px-4 py-2 font-semibold hover:bg-[#FFD700] hover:text-black">{t("viewAllIndustries", "View all industries")}</LocalizedLink></li>
      {industryItems.map(([slug, label]) => <li key={slug}><LocalizedLink to={`/industries/${slug}`} onClick={close} className="flex min-h-11 items-center rounded-full px-4 py-2 hover:bg-[#FFD700] hover:text-black">{label}</LocalizedLink></li>)}
    </ul>}
  </div>;
}

export default function Navbar() {
  const { t } = useTranslation("navigation");
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const authenticated = hasUsableAccessToken();
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menu.current?.querySelector<HTMLElement>("a,button,select")?.focus();
    const keydown = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener("keydown", keydown);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", keydown); };
  }, [open]);
  const logout = () => { clearAccessToken(); navigate("/", {replace:true}); };
  const close = () => setOpen(false);

  return <header className="relative flex justify-center pt-3 lg:pt-10">
    <nav aria-label={t("menu")} className="fixed z-50 flex w-[95%] items-center justify-between rounded-lg border border-[#1b1b1b] bg-[#121212]/80 p-2 px-5 text-xs backdrop-blur-3xl lg:w-[80%] xl:w-[80%] 2xl:w-[60%]">
      <LocalizedLink to="/" className="w-20 lg:w-32" aria-label="Codestra"><img src={logo} alt="Codestra" /></LocalizedLink>
      <div className="hidden items-center gap-7 lg:flex">
        <LocalizedLink to="/">{t("home")}</LocalizedLink><LocalizedLink to="/about">{t("about")}</LocalizedLink>
        <ServicesMenu /><IndustriesMenu /><LocalizedLink to="/case-studies">{t("caseStudies")}</LocalizedLink>
        <LocalizedLink to="/contact">{t("contact")}</LocalizedLink><LocalizedLink to="/hiring/positions">{t("joinTeam")}</LocalizedLink>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden xl:block"><LanguageSelector id="header-language" /></div>
        {authenticated ? <><LocalizedLink to="/auth/dashboard"><Button1 text={t("dashboard")} /></LocalizedLink><Button2 text={t("logout")} onClick={logout} /></> : <><LocalizedLink to="/login"><Button1 text={t("login")} /></LocalizedLink><LocalizedLink to="/signup"><Button2 text={t("signup")} /></LocalizedLink></>}
        <button ref={trigger} type="button" className="flex min-h-11 min-w-11 items-center justify-center text-lg lg:hidden" aria-label={open?t("closeMenu"):t("openMenu")} aria-expanded={open} aria-controls="global-mobile-menu" onClick={() => setOpen((value) => !value)}>{open?<IoMdClose/>:<RiMenu3Line/>}</button>
      </div>
    </nav>
    {open && <div ref={menu} id="global-mobile-menu" role="dialog" aria-modal="true" aria-label={t("menu")} className="fixed inset-x-4 top-20 z-40 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-lg border border-[#1b1b1b] bg-[#121212]/95 p-5 text-lg backdrop-blur-3xl lg:hidden">
      <div className="flex flex-col gap-5"><LocalizedLink onClick={close} to="/">{t("home")}</LocalizedLink><LocalizedLink onClick={close} to="/about">{t("about")}</LocalizedLink><ServicesMenu mobile close={close}/><IndustriesMenu mobile close={close}/><LocalizedLink onClick={close} to="/case-studies">{t("caseStudies")}</LocalizedLink><LocalizedLink onClick={close} to="/contact">{t("contact")}</LocalizedLink><LocalizedLink onClick={close} to="/hiring/positions">{t("joinTeam")}</LocalizedLink><LanguageSelector id="mobile-language" /></div>
    </div>}
  </header>;
}
