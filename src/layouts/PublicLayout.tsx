import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { navLinks } from "../data/event";
import { LanguageSwitcher } from "../components/i18n/LanguageSwitcher";
import { cn } from "../lib/cn";
import { pageContainer } from "../lib/pageContainer";

/** Public chrome — Tailwind (no home.css) */
export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation("common");
  const { pathname } = useLocation();
  const onRegister = pathname.startsWith("/register");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", open);
    return () => document.body.classList.remove("overflow-hidden");
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
    <div className="flex min-h-dvh w-full flex-col text-[#0b1016]">
      <header className="sticky top-0 z-50 h-[94px] border-b border-[#e5e9ee] bg-white max-[960px]:h-[76px] max-[640px]:h-16">
        <div className={cn(pageContainer, "flex h-full min-w-0 items-center gap-3")}>
          <Link
            to="/"
            className="flex min-w-0 max-w-[calc(100%-52px)] flex-1 items-center min-[961px]:max-w-none min-[961px]:flex-none"
            onClick={() => setOpen(false)}
          >
            <img
              className="block h-auto w-[184px] max-w-[40%] shrink object-contain max-[1400px]:w-[155px] max-[960px]:w-[125px] max-[640px]:w-[min(98px,27vw)] min-[961px]:max-w-none"
              src="/assets/logo-ministry.png"
              alt={t("brand.aca")}
            />
            <span
              className="mx-[25px] ml-[18px] h-[54px] max-h-[70%] w-px shrink-0 bg-[#aeb6bf] max-[1400px]:mr-4 max-[960px]:mx-[13px] max-[960px]:ml-2.5 max-[960px]:h-[42px] max-[640px]:mx-2 max-[640px]:ml-1.5 max-[640px]:h-[34px]"
              aria-hidden
            />
            <img
              className="block h-20 w-auto max-w-[52%] shrink object-contain max-[960px]:h-[50px] max-[960px]:max-h-[50px] min-[961px]:max-w-none"
              height={170}
              src="/assets/logo-aca.png"
              alt="Ministry of Investments, Trade and Industry"
            />
          </Link>

          <nav
            className="ml-auto hidden h-full shrink-0 items-center gap-7 max-[1400px]:gap-[18px] min-[961px]:flex"
            aria-label={t("nav.main")}
          >
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "relative whitespace-nowrap py-[39px] pb-[35px] text-[13px] font-medium text-[#0b1016] max-[1400px]:text-[12px]",
                    isActive &&
                      "font-bold after:absolute after:inset-x-0 after:bottom-7 after:h-[3px] after:bg-[#ed1c24] after:content-['']",
                  )
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>

          {!onRegister ? (
            <Link
              to="/register"
              className="ml-7 hidden h-[47px] min-w-[160px] shrink-0 items-center justify-center gap-[13px] rounded-[7px] bg-[#075fd8] text-[15px] font-bold text-white hover:brightness-[0.96] max-[1400px]:ml-3.5 max-[1400px]:h-11 max-[1400px]:min-w-[148px] max-[1400px]:text-[14px] min-[961px]:inline-flex"
            >
              {t("actions.registerNow")}{" "}
              <span className="text-[23px] leading-none" aria-hidden>
                →
              </span>
            </Link>
          ) : null}

          <button
            type="button"
            className={cn(
              "ml-auto grid h-11 w-11 min-w-11 place-items-center rounded-lg bg-[#f3f6f9] text-[#0b1016] hover:bg-[#e8eef5] min-[961px]:hidden",
              "max-[640px]:h-[42px] max-[640px]:w-[42px] max-[640px]:min-w-[42px]",
              open && "bg-[#e8eef5]",
            )}
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
          className={cn(
            "fixed inset-x-0 bottom-0 top-[94px] z-40 border-0 bg-[rgba(8,16,28,.42)] p-0 max-[960px]:top-[76px] max-[640px]:top-16 min-[961px]:hidden",
            open ? "block" : "hidden",
          )}
          aria-label={t("actions.closeMenu")}
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        />

        <nav
          id="home-mobile-nav"
          className={cn(
            "absolute inset-x-0 top-full z-[45] max-h-[min(70vh,calc(100dvh-94px))] overflow-y-auto border-t border-[#e5e9ee] bg-white py-2 pb-4 shadow-[0_16px_32px_rgba(8,16,28,.12)] max-[960px]:max-h-[min(70vh,calc(100dvh-76px))] max-[640px]:max-h-[min(70vh,calc(100dvh-64px))] min-[961px]:hidden",
            open ? "block" : "hidden",
          )}
          aria-label={t("nav.mobile")}
          hidden={!open}
        >
          <div className={pageContainer}>
            <div className="flex justify-end py-2 pb-3">
              <LanguageSwitcher />
            </div>
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "block border-b border-[#edf0f3] px-1 py-3.5 text-[15px] font-semibold text-[#0b1016] last:border-b-0 max-[640px]:py-[13px] max-[640px]:text-[14px]",
                    isActive && "font-extrabold text-[#075fd8]",
                  )
                }
                onClick={() => setOpen(false)}
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
            {!onRegister ? (
              <Link
                to="/register"
                className="mt-3.5 flex min-h-12 items-center justify-center gap-2.5 rounded-lg bg-[#075fd8] px-[18px] text-[15px] font-bold text-white hover:brightness-[0.96]"
                onClick={() => setOpen(false)}
              >
                {t("actions.registerNow")}{" "}
                <span className="text-[23px] leading-none" aria-hidden>
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
        <div className={cn(pageContainer, "grid gap-4 py-9 md:grid-cols-[2fr_1fr_1fr] md:gap-12")}>
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
