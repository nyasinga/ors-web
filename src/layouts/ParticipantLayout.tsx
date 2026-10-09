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

/** Participant shell — structure & CSS from HTML package */
export function ParticipantLayout() {
  const [mobileNav, setMobileNav] = useState(false);
  const initials = participantPass.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="participant-dash">
      <div className="pd-shell">
        <header className="pd-header">
          <div className="pd-container pd-header-inner">
            <Link to="/" className="pd-brand" aria-label="ISIPPE-3">
              <img className="pd-aca" src="/assets/logo-aca.png" alt="Anti Counterfeit Authority" />
              <span className="pd-brand-divider" aria-hidden />
              <img className="pd-isippe" src="/assets/logo-isippe.png" alt="ISIPPE 2026" />
            </Link>
            <nav className="pd-nav" aria-label="Quick links">
              {topLinks.map((l) => (
                <Link key={l.to} to={l.to}>
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="pd-profile">
              <div className="pd-avatar">{initials}</div>
              <div>
                <strong>{participantPass.name}</strong>
                <small>Participant</small>
              </div>
              <span className="pd-chev" aria-hidden>
                ⌄
              </span>
            </div>
            <button
              type="button"
              className="pd-menu"
              aria-label="Open menu"
              aria-expanded={mobileNav}
              onClick={() => setMobileNav((v) => !v)}
            >
              <span className="pd-hamb" />
            </button>
          </div>
          <nav className={`pd-mobile-nav${mobileNav ? " open" : ""}`} aria-label="Mobile">
            {topLinks.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMobileNav(false)}>
                {l.label}
              </Link>
            ))}
            {sideLinks.map((l) => (
              <Link key={l.label} to={l.to} onClick={() => setMobileNav(false)}>
                {l.label}
              </Link>
            ))}
            <Link to="/" onClick={() => setMobileNav(false)}>
              Sign out
            </Link>
          </nav>
        </header>

        <div className="pd-layout">
          <aside className="pd-sidebar" aria-label="Participant">
            {sideLinks.map((item) => {
              const linkBody = (
                <>
                  <span className="pd-side-icon">
                    <item.icon size={21} strokeWidth={1.8} />
                  </span>
                  {item.label}
                </>
              );
              // Only Dashboard owns /me active state (My Registration shares the route for now)
              if (item.label === "My Registration") {
                return (
                  <Link key={item.label} to={item.to} className="pd-side-link">
                    {linkBody}
                  </Link>
                );
              }
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `pd-side-link${isActive ? " active" : ""}`}
                >
                  {linkBody}
                </NavLink>
              );
            })}
            <Link to="/" className="pd-side-link pd-side-signout">
              <span className="pd-side-icon">
                <LogOut size={21} strokeWidth={1.8} />
              </span>
              Sign out
            </Link>
          </aside>

          <main className="pd-main">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
