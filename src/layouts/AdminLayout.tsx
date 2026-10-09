import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  CreditCard,
  Home,
  LogOut,
  Menu,
  Mail,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import { useAuthUser } from "../hooks/useAuthUser";
import {
  clearAuthSession,
  displayName,
  getValidAuthToken,
  initialsFrom,
  roleLabel,
} from "../lib/auth";
import { cn } from "../lib/cn";

const links = [
  { to: "/admin", label: "Dashboard", icon: Home, end: true },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/messages", label: "Messages", icon: Mail, badge: 3 },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex h-[52px] items-center gap-3.5 rounded-xl px-3.5 text-[12px] font-medium text-[#07164d] transition",
    isActive
      ? "bg-gradient-to-b from-[#e5f0ff] to-[#d8e9ff] font-bold text-[#065bd8] shadow-[inset_0_1px_0_rgba(255,255,255,.85),0_4px_14px_rgba(8,100,232,.12)]"
      : "hover:bg-[rgba(238,245,255,.85)]",
  );

/** Admin shell — Tailwind (no admin-dashboard.css) */
export function AdminLayout() {
  const [mobileNav, setMobileNav] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useAuthUser();
  const name = displayName(user);
  const role = roleLabel(user);
  const initials = initialsFrom(user);
  const isDashboard = pathname === "/admin" || pathname === "/admin/";
  const isEventsList = pathname === "/admin/events" || pathname === "/admin/events/";
  const isEventDetails = /^\/admin\/events\/(?!new(?:\/|$))[^/]+/.test(pathname);
  const bareOutlet = isDashboard || isEventsList || isEventDetails;
  const menuId = useId();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileNav(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (getValidAuthToken()) return;
    clearAuthSession();
    navigate("/admin-login", { replace: true, state: { from: pathname } });
  }, [navigate, pathname, user]);

  useEffect(() => {
    if (!mobileNav) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNav(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNav]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserMenuOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      if (!userMenuRef.current?.contains(e.target as Node)) setUserMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [userMenuOpen]);

  const logout = () => {
    setUserMenuOpen(false);
    clearAuthSession();
    navigate("/admin-login", { replace: true });
  };

  const brand = (
    <Link
      to="/admin"
      className="mb-3.5 flex h-20 items-center justify-start rounded-b-[14px] border-b border-[#e6eef7] bg-gradient-to-b from-white/[.92] to-white/[.55] px-1.5"
      aria-label="Anti Counterfeit Authority"
      onClick={() => setMobileNav(false)}
    >
      <img src="/assets/logo-aca.png" alt="" className="h-16 w-[168px] object-contain" />
    </Link>
  );

  const nav = (
    <>
      <nav className="flex flex-col gap-2" aria-label="Admin">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={navLinkClass}
            onClick={() => setMobileNav(false)}
          >
            <span className="grid w-[23px] shrink-0 place-items-center">
              <item.icon size={18} strokeWidth={2} />
            </span>
            {item.label}
            {item.badge ? (
              <span className="ml-auto grid h-[18px] w-[18px] place-items-center rounded-full bg-[#ed2024] text-[9px] font-bold text-white shadow-[0_2px_6px_rgba(237,32,36,.35)]">
                {item.badge}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>
      <nav className="mt-auto flex flex-col gap-2 pt-[18px]">
        <NavLink
          to="/admin/settings/general"
          className={navLinkClass}
          onClick={() => setMobileNav(false)}
        >
          <span className="grid w-[23px] shrink-0 place-items-center">
            <Settings size={18} strokeWidth={2} />
          </span>
          Settings
        </NavLink>
        <button
          type="button"
          className="flex h-[52px] w-full items-center gap-3.5 rounded-xl px-3.5 text-left text-[12px] font-medium text-[#d11f24] hover:bg-[#fff0f0]"
          onClick={logout}
        >
          <span className="grid w-[23px] shrink-0 place-items-center">
            <LogOut size={18} strokeWidth={2} />
          </span>
          Log out
        </button>
      </nav>
    </>
  );

  return (
    <div className="min-h-dvh bg-white font-sans text-[#07164d] antialiased">
      <div className="grid min-h-dvh grid-cols-1 bg-white md:grid-cols-[220px_1fr]">
        <aside className="relative z-[2] hidden flex-col overflow-hidden border-r border-[#e2ecf5] bg-gradient-to-b from-[#f8fcff] via-[#f3f8fd] to-[#edf5fb] px-3 pb-[18px] pt-3 shadow-[inset_-1px_0_0_rgba(220,232,245,.9)] md:flex">
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[min(52%,420px)] bg-[url('/assets/admin-sidebar-waves.svg')] bg-left-bottom bg-no-repeat"
            style={{ backgroundSize: "100% 100%" }}
            aria-hidden
          />
          <div className="relative z-[1] flex min-h-0 flex-1 flex-col">{brand}{nav}</div>
        </aside>

        <div className="flex min-w-0 flex-col bg-white">
          <header className="flex h-[71px] shrink-0 items-center gap-3 border-b border-[#edf2f8] px-3 sm:gap-3 sm:px-5">
            <button
              type="button"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[#eaf4ff] text-[#07164d] md:hidden"
              aria-label={mobileNav ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileNav}
              onClick={() => setMobileNav((v) => !v)}
            >
              {mobileNav ? <X size={18} /> : <Menu size={18} />}
            </button>

            <label className="flex h-10 min-w-0 max-w-[min(720px,58%)] flex-1 items-center gap-3 rounded-[10px] bg-[#eaf4ff] px-3.5 text-[11px] text-[#657596]">
              <Search size={18} strokeWidth={2.25} className="shrink-0 text-[#07164d]" aria-hidden />
              <span className="sr-only">Search</span>
              <input
                type="search"
                className="min-w-0 flex-1 border-0 bg-transparent font-inherit text-[#07164d] outline-none placeholder:text-[#657596]"
                placeholder="Search events, participants, delegates, sessions..."
              />
            </label>

            <div className="ml-auto flex shrink-0 items-center gap-4 sm:gap-6">
              <button
                type="button"
                className="relative grid place-items-center text-[#07164d]"
                aria-label="Notifications"
              >
                <Bell size={22} strokeWidth={1.8} />
                <span className="absolute -right-[7px] -top-[5px] grid h-[18px] w-[18px] place-items-center rounded-full bg-[#ed2024] text-[9px] font-bold text-white">
                  3
                </span>
              </button>

              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  className="flex items-center gap-2.5 text-inherit"
                  title={user?.email || name}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  aria-controls={menuId}
                  onClick={() => setUserMenuOpen((v) => !v)}
                >
                  <span className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full bg-[#0b51c6] text-[12px] font-bold text-white">
                    {initials}
                  </span>
                  <div className="hidden text-left sm:block">
                    <div className="text-[11px] font-bold">{name}</div>
                    <div className="text-[9px] text-[#657596]">{role}</div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "ml-2 text-[#657596] transition-transform",
                      userMenuOpen && "rotate-180",
                    )}
                    size={16}
                    aria-hidden
                  />
                </button>

                {userMenuOpen ? (
                  <div
                    id={menuId}
                    role="menu"
                    className="absolute right-0 top-[calc(100%+10px)] z-40 w-[min(260px,78vw)] rounded-xl border border-[#e1ebf5] bg-white p-2 shadow-[0_12px_32px_rgba(7,22,77,.14)]"
                  >
                    <div className="mb-1.5 flex items-center gap-2.5 border-b border-[#eef3f9] px-2.5 pb-3 pt-2.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0b51c6] text-[11px] font-bold text-white">
                        {initials}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold">{name}</div>
                        <div className="truncate text-[9px] text-[#657596]">
                          {user?.email || role}
                        </div>
                      </div>
                    </div>
                    <Link
                      role="menuitem"
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[12px] font-semibold text-[#07164d] hover:bg-[#eef5ff]"
                      to="/admin/settings/account"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={16} strokeWidth={2} aria-hidden />
                      Account & Profile
                    </Link>
                    <Link
                      role="menuitem"
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[12px] font-semibold text-[#07164d] hover:bg-[#eef5ff]"
                      to="/admin/settings/general"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings size={16} strokeWidth={2} aria-hidden />
                      Settings
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[12px] font-semibold text-[#d11f24] hover:bg-[#fff0f0]"
                      onClick={logout}
                    >
                      <LogOut size={16} strokeWidth={2} aria-hidden />
                      Log out
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          {bareOutlet ? (
            <Outlet />
          ) : (
            <div className="min-w-0 flex-1 bg-gradient-to-b from-[#fbfdff] to-transparent to-[48px] px-[clamp(14px,1.6vw,22px)] py-[19px] pb-[22px] [&>h1]:tracking-tight">
              <Outlet />
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        className={cn(
          "fixed inset-0 z-40 bg-[rgba(7,22,77,.35)] transition-opacity md:hidden",
          mobileNav ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-label="Close navigation"
        tabIndex={mobileNav ? 0 : -1}
        onClick={() => setMobileNav(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(280px,86vw)] flex-col overflow-hidden bg-gradient-to-b from-[#f8fcff] via-[#f3f8fd] to-[#edf5fb] px-3 pb-[18px] pt-3 shadow-xl transition-transform md:hidden",
          mobileNav ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!mobileNav}
      >
        {brand}
        {nav}
      </aside>
    </div>
  );
}
