import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { navLinks } from "../data/event";
import { LanguageSwitcher } from "../components/i18n/LanguageSwitcher";

/** Public chrome — header CSS adopted from index 2.html */
export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation("common");
  const { pathname } = useLocation();
  const onRegister = pathname.startsWith("/register");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("home-menu-open", open);
    return () => document.body.classList.remove("home-menu-open");
  }, [open]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 961px)");
    const onDesktopChange = () => {
      if (desktop.matches) setOpen(false);
    };
    onDesktopChange();
    desktop.addEventListener("change", onDesktopChange);
    return () => desktop.removeEventListener("change", onDesktopChange);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="public-chrome flex min-h-dvh w-full flex-col">
      <header className="home-header">
        <div className="home-container home-header-inner">
          <Link to="/" className="home-brand" onClick={() => setOpen(false)}>
            <img className="home-brand-aca" src="/assets/logo-aca.png" alt={t("brand.aca")} />
            <span className="home-brand-divider" aria-hidden />
            <img className="home-brand-isippe" src="/assets/logo-isippe.png" alt="ISIPPE 2026" />
          </Link>

          <nav className="home-nav" aria-label={t("nav.main")}>
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) => (isActive ? "home-nav-active" : undefined)}
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>

          {!onRegister ? (
            <Link to="/register" className="home-header-register">
              {t("actions.registerNow")}{" "}
              <span className="home-arrow" aria-hidden>
                →
              </span>
            </Link>
          ) : null}

          <button
            type="button"
            className="home-menu-btn"
            aria-label={open ? t("actions.closeMenu") : t("actions.openMenu")}
            aria-expanded={open}
            aria-controls="home-mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} strokeWidth={2.25} /> : <Menu size={22} strokeWidth={2.25} />}
          </button>
        </div>

        <button
          type="button"
          className={`home-menu-backdrop${open ? " open" : ""}`}
          aria-label={t("actions.closeMenu")}
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        />

        <nav
          id="home-mobile-nav"
          className={`home-mobile-nav${open ? " open" : ""}`}
          aria-label={t("nav.mobile")}
          hidden={!open}
        >
          <div className="home-mobile-nav-inner">
            <div className="home-mobile-nav-tools">
              <LanguageSwitcher />
            </div>
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) => (isActive ? "home-nav-active" : undefined)}
                onClick={() => setOpen(false)}
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
            {!onRegister ? (
              <Link
                to="/register"
                className="home-mobile-register"
                onClick={() => setOpen(false)}
              >
                {t("actions.registerNow")}{" "}
                <span className="home-arrow" aria-hidden>
                  →
                </span>
              </Link>
            ) : null}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-[#081522] text-white">
        <div className="home-container grid gap-4 py-9 md:grid-cols-[2fr_1fr_1fr] md:gap-12">
          <div>
            <p className="text-[15px] font-semibold">{t("brand.acaIsippe")}</p>
            <p className="mt-2 text-xs leading-relaxed text-[#cbd5df]">{t("event.fullName")}</p>
            <p className="mt-1 text-xs text-[#cbd5df]">
              {t("event.dates")} · {t("event.venueShort")}
            </p>
          </div>
          <nav className="grid gap-1 text-xs text-[#cbd5df]" aria-label={t("nav.footer")}>
            {navLinks.map((item) => (
              <Link key={item.to} to={item.to} className="hover:text-white">
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>
          <nav className="grid gap-1 text-xs text-[#cbd5df]" aria-label={t("nav.footer")}>
            <Link to="/participant-login" className="hover:text-white">
              {t("nav.participantLogin")}
            </Link>
            <Link to="/admin-login" className="hover:text-white">
              {t("nav.adminLogin")}
            </Link>
          </nav>
          <p className="border-t border-[#2a3743] pt-4 text-[11px] text-[#9eabb8] md:col-span-3">
            {t("brand.orsCopyright", { year: 2026 })}
          </p>
        </div>
      </footer>
    </div>
  );
}
