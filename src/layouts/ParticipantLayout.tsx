import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  CalendarDays,
  ClipboardCheck,
  FileText,
  Headset,
  Home,
  LogOut,
  MapPin,
  Megaphone,
  Users,
} from "lucide-react";
import { participantPass } from "../data/dashboards";
import { cn } from "../lib/cn";

const sideLinks = [
  { to: "/me", label: "Dashboard", icon: Home, end: true },
  { to: "/me", label: "My Registration", icon: ClipboardCheck, end: true },
  { to: "/programme", label: "Programme", icon: CalendarDays },
  { to: "/speakers", label: "Speakers", icon: Users },
  { to: "/venue", label: "Venue & Travel", icon: MapPin },
  { to: "/faq", label: "Documents", icon: FileText },
  { to: "/faq", label: "Updates", icon: Megaphone },
  { to: "/faq", label: "Help & Support", icon: Headset },
];

const topLinks = [
  { to: "/", label: "Home" },
  { to: "/programme", label: "Programme" },
  { to: "/speakers", label: "Speakers" },
  { to: "/venue", label: "Venue" },
  { to: "/faq", label: "FAQ" },
];

/** Brand logo sizing steps down with the header across breakpoints. */
const brandAca = cn(
  "block h-[52px] w-auto max-w-[190px] object-contain",
  "max-[1120px]:h-11 max-[1120px]:max-w-[150px]",
  "max-[850px]:h-[38px] max-[850px]:max-w-[120px]",
  "max-[600px]:h-[34px] max-[600px]:max-w-[100px]",
);

const brandIsippe = cn(
  "block h-[52px] w-auto max-w-[250px] object-contain",
  "max-[1120px]:h-11 max-[1120px]:max-w-[200px]",
  "max-[850px]:h-[38px] max-[850px]:max-w-[160px]",
  "max-[600px]:h-[34px] max-[600px]:max-w-[140px]",
);

const sideLinkBase = cn(
  "mb-[6px] flex h-[47px] items-center gap-[14px] rounded-[12px] px-3 text-[12px] text-[#07164d]",
  "[transition:background_0.15s_ease,box-shadow_0.15s_ease,color_0.15s_ease]",
);

const sideLinkIdle = "hover:bg-[rgba(238,245,255,0.85)]";

const sideLinkActive =
  "bg-[linear-gradient(180deg,#e5f0ff,#d8e9ff)] font-bold text-[#0754cf] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_4px_14px_rgba(8,100,232,0.12)]";

const mobileLink = "block border-b border-[#e8eef5] px-5 py-[14px] text-[13px] font-semibold";

/** Participant shell — Tailwind port of the former participant-dashboard.css (pd-* / participant-dash) */
export function ParticipantLayout() {
  const [mobileNav, setMobileNav] = useState(false);
  const initials = participantPass.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="box-border min-h-dvh overflow-x-hidden bg-white p-0 text-[#07164d] antialiased [font-family:Inter,Arial,sans-serif]">
      <div className="min-h-dvh w-full overflow-hidden bg-white">
        <header className="relative z-20 h-[93px] border-b border-[#e3ebf4] bg-white max-[850px]:h-[75px]">
          <div className="mx-auto box-border flex h-full w-[min(calc(100%_-_38px),1480px)] max-w-full items-center max-[600px]:w-[calc(100%_-_24px)]">
            <Link to="/" className="flex shrink-0 items-center gap-0" aria-label="ISIPPE-3">
              <img className={brandAca} src="/assets/logo-aca.png" alt="Anti Counterfeit Authority" />
              <span className="mx-[14px] h-12 w-px bg-[#aeb7c2] max-[850px]:mx-[10px] max-[850px]:h-9" aria-hidden />
              <img className={brandIsippe} src="/assets/logo-isippe.png" alt="ISIPPE 2026" />
            </Link>
            <nav className="ml-auto flex items-center gap-[31px] max-[1120px]:gap-[18px] max-[850px]:hidden" aria-label="Quick links">
              {topLinks.map((l) => (
                <Link key={l.to} to={l.to} className="text-[12px] text-[#071642] hover:text-[#075fe5]">
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="ml-[22px] flex h-[51px] min-w-[180px] items-center gap-[10px] rounded-[25px] bg-[#f2f7fd] px-4 max-[1120px]:ml-[10px] max-[1120px]:min-w-[160px] max-[850px]:hidden">
              <div className="grid h-[35px] w-[35px] flex-none place-items-center rounded-[50%] bg-[#075fe5] text-[11px] font-extrabold text-white">
                {initials}
              </div>
              <div>
                <strong className="block text-[12px]">{participantPass.name}</strong>
                <small className="mt-[2px] block text-[10px] text-[#647596]">Participant</small>
              </div>
              <span className="ml-auto text-[20px] text-[#647596]" aria-hidden>
                ⌄
              </span>
            </div>
            <button
              type="button"
              className="ml-auto hidden h-[42px] w-[42px] cursor-pointer bg-transparent p-0 [font-family:inherit] max-[850px]:block"
              aria-label="Open menu"
              aria-expanded={mobileNav}
              onClick={() => setMobileNav((v) => !v)}
            >
              <span className="relative m-auto block h-[18px] w-[25px] border-y-[3px] border-[#111] after:absolute after:inset-x-0 after:top-[5px] after:border-t-[3px] after:border-[#111] after:content-['']" />
            </button>
          </div>
          <nav
            className={cn(
              "absolute inset-x-0 top-[93px] bg-white shadow-[0_10px_25px_#0002] max-[850px]:top-[75px]",
              mobileNav ? "block" : "hidden",
            )}
            aria-label="Mobile"
          >
            {topLinks.map((l) => (
              <Link key={l.to} to={l.to} className={mobileLink} onClick={() => setMobileNav(false)}>
                {l.label}
              </Link>
            ))}
            {sideLinks.map((l) => (
              <Link key={l.label} to={l.to} className={mobileLink} onClick={() => setMobileNav(false)}>
                {l.label}
              </Link>
            ))}
            <Link to="/" className={mobileLink} onClick={() => setMobileNav(false)}>
              Sign out
            </Link>
          </nav>
        </header>

        <div className="grid min-h-[calc(100vh_-_93px)] grid-cols-[194px_1fr] max-[1120px]:grid-cols-[165px_1fr] max-[850px]:block">
          <aside
            className="relative isolate flex flex-col overflow-hidden border-r border-[#e1e9f2] bg-[linear-gradient(180deg,#f8fcff_0%,#f3f8fd_42%,#edf5fb_100%)] px-[10px] py-[17px] before:pointer-events-none before:absolute before:inset-x-0 before:bottom-0 before:top-auto before:z-0 before:h-[min(48%,360px)] before:content-[''] before:[background:url('/assets/admin-sidebar-waves.svg')_left_bottom/100%_100%_no-repeat] max-[850px]:hidden [&>*]:relative [&>*]:z-[1]"
            aria-label="Participant"
          >
            {sideLinks.map((item) => {
              const linkBody = (
                <>
                  <span className="grid h-[22px] w-[22px] flex-none place-items-center">
                    <item.icon className="block h-[21px] w-[21px]" size={21} strokeWidth={1.8} />
                  </span>
                  {item.label}
                </>
              );
              // Only Dashboard owns /me active state (My Registration shares the route for now)
              if (item.label === "My Registration") {
                return (
                  <Link key={item.label} to={item.to} className={cn(sideLinkBase, sideLinkIdle)}>
                    {linkBody}
                  </Link>
                );
              }
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => cn(sideLinkBase, isActive ? sideLinkActive : sideLinkIdle)}
                >
                  {linkBody}
                </NavLink>
              );
            })}
            <Link to="/" className={cn(sideLinkBase, sideLinkIdle, "mt-auto")}>
              <span className="grid h-[22px] w-[22px] flex-none place-items-center">
                <LogOut className="block h-[21px] w-[21px]" size={21} strokeWidth={1.8} />
              </span>
              Sign out
            </Link>
          </aside>

          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
