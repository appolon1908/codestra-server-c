import type { ComponentProps } from "react";
import { Link, useLocation } from "react-router";
import { localeFromPath, localizePath } from "./locale-resolver";

export default function LocalizedLink({ to, ...props }: ComponentProps<typeof Link>) {
  const location = useLocation();
  const locale = localeFromPath(location.pathname) ?? "en";
  const localized = typeof to === "string" && to.startsWith("/") ? localizePath(to, locale) : to;
  return <Link to={localized} {...props} />;
}
