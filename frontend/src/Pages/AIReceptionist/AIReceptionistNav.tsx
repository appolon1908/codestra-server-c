import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { FiMenu, FiX } from "react-icons/fi";

import logo from "../../assets/logo.png";
import { trackEvent } from "./analytics";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../../i18n/LanguageSelector";
import LocalizedLink from "../../i18n/LocalizedLink";
import { localeFromPath, localizePath } from "../../i18n/locale-resolver";

const navigation = [
  ["product", "product"], ["howItWorks", "how-it-works"], ["solutions", "solutions"],
  ["industries", "industries"], ["integrations", "integrations"], ["pricing", "pricing"],
  ["security", "security"], ["resources", "faq"],
] as const;

export default function AIReceptionistNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(["navigation", "common"]);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const scrollTo = (id: string) => {
    const local = document.getElementById(id);
    if (local) local.scrollIntoView({ behavior: "smooth", block: "start" });
    else {
      const locale = localeFromPath(location.pathname) ?? "en";
      const destination = id === "industries" || id === "pricing" || id === "security" ? `/${id}` : `/ai-receptionist#${id}`;
      navigate(localizePath(destination, locale));
    }
    setOpen(false);
  };

  const navLinks = navigation.map(([label, id]) => (
    <button key={id} type="button" onClick={() => scrollTo(id)}>
      {t(label)}
    </button>
  ));

  return (
    <header className="ai-header">
      <nav className="ai-nav" aria-label={t("menu")}>
        <LocalizedLink to="/" className="ai-nav-logo" aria-label={t("common:codestraHome")}>
          <img src={logo} alt="Codestra" />
        </LocalizedLink>
        <div className="ai-nav-links">{navLinks}</div>
        <div className="ai-nav-actions">
          <LocalizedLink className="ai-nav-signin" to="/login">{t("signIn")}</LocalizedLink>
          <LocalizedLink
            className="ai-button ai-button--primary ai-nav-demo"
            to="/book-demo"
            onClick={() =>
              void trackEvent("cta_click", {
                ctaName: "Book a Live Demo",
                section: "navigation",
              })
            }
          >
            {t("bookDemo")}
          </LocalizedLink>
          <button className="ai-nav-try" type="button" onClick={() => scrollTo("demo")}>{t("tryAi")}</button>
          <LanguageSelector id="ai-nav-language" />
          <button
            ref={triggerRef}
            className="ai-menu-trigger"
            type="button"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
            aria-controls="ai-mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>
      {open && (
        <div
          ref={menuRef}
          id="ai-mobile-menu"
          className="ai-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={t("menu")}
        >
          {navLinks}
          <LocalizedLink to="/login" onClick={() => setOpen(false)}>{t("signIn")}</LocalizedLink>
          <LocalizedLink to="/book-demo" onClick={() => setOpen(false)}>{t("bookDemo")}</LocalizedLink>
          <button type="button" onClick={() => scrollTo("demo")}>{t("tryAi")}</button>
          <LanguageSelector id="ai-mobile-language" />
        </div>
      )}
    </header>
  );
}
