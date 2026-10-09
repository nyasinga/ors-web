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
import { clearAuthSession, displayName, initialsFrom, roleLabel } from "../lib/auth";

const links = [
  { to: "/admin", label: "Dashboard", icon: Home, end: true },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/messages", label: "Messages", icon: Mail, badge: 3 },
];

/** Admin shell — structure & CSS from isippe3-admin-dashboard HTML package */
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

  const nav = (
    <>
      <nav className="ad-side" aria-label="Admin">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? "active" : undefined)}
            onClick={() => setMobileNav(false)}
          >
            <span className="ad-ico">
              <item.icon size={18} strokeWidth={2} />
            </span>
            {item.label}
            {item.badge ? <span className="ad-badge">{item.badge}</span> : null}
          </NavLink>
        ))}
      </nav>
      <nav className="ad-side ad-settings">
        <NavLink
          to="/admin/settings/general"
          className={({ isActive }) => (isActive ? "active" : undefined)}
          onClick={() => setMobileNav(false)}
        >
          <span className="ad-ico">
            <Settings size={18} strokeWidth={2} />
          </span>
          Settings
        </NavLink>
        <button type="button" className="ad-logout-link" onClick={logout}>
          <span className="ad-ico">
            <LogOut size={18} strokeWidth={2} />
          </span>
          Log out
        </button>
      </nav>
    </>
  );

  return (
    <div className="admin-dash">
      <div className="ad-shell">
        <aside className="ad-sidebar">
          <Link to="/admin" className="ad-brand" aria-label="Anti Counterfeit Authority">
            <img src="/assets/aca-logo.png" alt="" />
          </Link>
          {nav}
        </aside>

        <div className="ad-main">
          <header className="ad-top">
            <button
              type="button"
              className="ad-menu-btn"
              aria-label={mobileNav ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileNav}
              onClick={() => setMobileNav((v) => !v)}
            >
              {mobileNav ? <X size={18} /> : <Menu size={18} />}
            </button>

            <label className="ad-search">
              <Search size={18} strokeWidth={2.25} aria-hidden />
              <span className="sr-only">Search</span>
              <input
                type="search"
                placeholder="Search events, participants, delegates, sessions..."
              />
            </label>

            <div className="ad-actions">
              <button type="button" className="ad-bell" aria-label="Notifications">
                <Bell size={22} strokeWidth={1.8} />
                <span className="ad-note">3</span>
              </button>

              <div className="ad-user-menu" ref={userMenuRef}>
                <button
                  type="button"
                  className="ad-user"
                  title={user?.email || name}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  aria-controls={menuId}
                  onClick={() => setUserMenuOpen((v) => !v)}
                >
                  <span className="ad-avatar">{initials}</span>
                  <div>
                    <div className="ad-uname">{name}</div>
                    <div className="ad-urole">{role}</div>
                  </div>
                  <ChevronDown
                    className={`ad-down${userMenuOpen ? " open" : ""}`}
                    size={16}
                    aria-hidden
                  />
                </button>

                {userMenuOpen ? (
                  <div className="ad-user-dropdown" id={menuId} role="menu">
                    <div className="ad-user-dropdown-head">
                      <span className="ad-avatar">{initials}</span>
                      <div>
                        <div className="ad-uname">{name}</div>
                        <div className="ad-urole">{user?.email || role}</div>
                      </div>
                    </div>
                    <Link
                      role="menuitem"
                      className="ad-user-dropdown-item"
                      to="/admin/settings/account"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={16} strokeWidth={2} aria-hidden />
                      Account & Profile
                    </Link>
                    <Link
                      role="menuitem"
                      className="ad-user-dropdown-item"
                      to="/admin/settings/general"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings size={16} strokeWidth={2} aria-hidden />
                      Settings
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      className="ad-user-dropdown-item danger"
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

          {bareOutlet ? <Outlet /> : <div className="ad-outlet"><Outlet /></div>}
        </div>
      </div>

      <button
        type="button"
        className={`ad-drawer-backdrop${mobileNav ? " open" : ""}`}
        aria-label="Close navigation"
        tabIndex={mobileNav ? 0 : -1}
        onClick={() => setMobileNav(false)}
      />
      <aside className={`ad-drawer${mobileNav ? " open" : ""}`} aria-hidden={!mobileNav}>
        <Link to="/admin" className="ad-brand" onClick={() => setMobileNav(false)}>
          <img src="/assets/aca-logo.png" alt="" />
        </Link>
        {nav}
      </aside>
    </div>
  );
}
