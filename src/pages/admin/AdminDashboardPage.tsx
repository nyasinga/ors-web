import { Link } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  CreditCard,
  FileBarChart,
  IdCard,
  MessageSquare,
  Mic2,
  Users,
  Zap,
} from "lucide-react";
import {
  adminKpis,
  paymentBars,
  paymentSummary,
  recentRegistrations,
  topCountries,
  upcomingEvents,
} from "../../data/dashboards";
import { useAuthUser } from "../../hooks/useAuthUser";
import { useEventCopy } from "../../i18n/useEventCopy";
import { displayName } from "../../lib/auth";

const kpiIcons = [Users, IdCard, Mic2, Building2];

const sparkPaths = [
  "M0 29C20 29 20 26 38 28S58 19 72 23S90 17 103 20S119 8 134 14S151 6 163 10S172 2 180 5",
  "M0 30C20 30 24 25 42 28S63 18 80 23S97 19 112 18S128 8 144 12S160 6 180 3",
  "M0 30C20 29 30 28 45 28S63 23 77 25S92 17 105 20S120 11 137 16S153 5 165 9S174 3 180 3",
  "M0 31C18 31 28 25 44 28S62 21 76 23S92 17 107 20S120 12 136 16S150 9 164 12S174 4 180 4",
];

const chartHeights = [35, 43, 56, 67, 48, 72, 61, 52, 69, 79, 61, 88, 73, 65, 77, 86, 93, 78, 96];

const countryWidths = [92, 38, 33, 28, 24, 20, 14, 12, 48];

/** Admin dashboard — structure & CSS from isippe3-admin-dashboard HTML package */
export function AdminDashboardPage() {
  const event = useEventCopy();
  const user = useAuthUser();
  const welcomeName = displayName(user);

  return (
    <>
      <section className="ad-hero">
        <div className="ad-hero-inner">
          <div className="ad-welcome">
            <h1>Welcome back, {welcomeName}</h1>
            <p>Event registration and key activities at a glance.</p>
          </div>
          <div className="ad-event">
            <span className="ad-event-cal" aria-hidden>
              <CalendarDays size={28} strokeWidth={2} />
            </span>
            <div>
              <div className="ad-date">{event.dates}</div>
              <div className="ad-venue">
                Kenyatta International Convention Centre (KICC)
                <br />
                Nairobi, Kenya
              </div>
            </div>
          </div>
          <img
            className="ad-hero-logo"
            src="/assets/logo-isippe.png"
            alt="ISIPPE 2026"
          />
        </div>
      </section>

      <section className="ad-content">
        <div className="ad-stats">
          {adminKpis.map((kpi, i) => {
            const Icon = kpiIcons[i];
            return (
              <div key={kpi.label} className="ad-card ad-stat">
                <div className="ad-si">
                  <Icon size={26} strokeWidth={1.8} />
                </div>
                <div>
                  <div className="ad-val">{kpi.value}</div>
                  <div className="ad-lab">{kpi.label}</div>
                  <div className="ad-chg">{kpi.trend}</div>
                </div>
                <svg className="ad-spark" viewBox="0 0 180 35" aria-hidden>
                  <path d={sparkPaths[i]} />
                </svg>
              </div>
            );
          })}
        </div>

        <div className="ad-paygrid">
          <section className="ad-card ad-pay">
            <div className="ad-head">
              <h2>
                <CreditCard size={16} strokeWidth={2} aria-hidden />
                Payments Overview
              </h2>
              <button type="button" className="ad-period">
                Last 30 Days ⌄
              </button>
            </div>
            <div className="ad-metrics">
              {paymentSummary.map((item) => (
                <div key={item.label} className={`ad-metric${item.up ? "" : " down"}`}>
                  <strong>{item.value}</strong>
                  <small>{item.label}</small>
                  <b>{item.trend}</b>
                </div>
              ))}
            </div>
            <div className="ad-chart" aria-hidden>
              {chartHeights.map((h, i) => (
                <i
                  key={`${paymentBars[i]?.day ?? i}-${h}`}
                  className="ad-bar"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="ad-months">
              <span>Sep 01</span>
              <span>Sep 05</span>
              <span>Sep 10</span>
              <span>Sep 15</span>
              <span>Sep 20</span>
              <span>Sep 25</span>
              <span>Sep 30</span>
            </div>
          </section>

          <section className="ad-card ad-donutcard">
            <div className="ad-head">
              <h2>Payments by Method</h2>
            </div>
            <div className="ad-donutwrap">
              <div className="ad-donut">
                <div className="ad-dlab">
                  KES
                  <b>1.25M</b>
                  Total
                </div>
              </div>
              <div className="ad-legend">
                <div>
                  <i className="ad-dot" />
                  M-Pesa　55%
                </div>
                <div>
                  <i className="ad-dot green" />
                  Card　25%
                </div>
                <div>
                  <i className="ad-dot yellow" />
                  Bank Transfer　12%
                </div>
                <div>
                  <i className="ad-dot purple" />
                  Other　8%
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="ad-bottom">
          <section className="ad-card ad-list">
            <div className="ad-listhead">
              <h2>
                <CalendarDays size={14} strokeWidth={2} aria-hidden />
                Upcoming Events
              </h2>
              <Link className="ad-all" to="/admin/events">
                View All →
              </Link>
            </div>
            {upcomingEvents.map((ev) => (
              <div key={`${ev.day}-${ev.title}`} className="ad-eventrow">
                <div className="ad-datebox">
                  <b>{ev.month}</b>
                  <strong>{ev.day}</strong>
                </div>
                <div>
                  <div className="ad-etitle">{ev.title}</div>
                  <div className="ad-emeta">
                    ⌖ {ev.time}　|　⌖ {ev.place}
                  </div>
                </div>
                <span className={`ad-status${ev.status === "Draft" ? " draft" : ""}`}>
                  {ev.status === "Published" ? "✓ Published" : "⌄ Draft"}
                </span>
              </div>
            ))}
          </section>

          <section className="ad-card ad-list">
            <div className="ad-listhead">
              <h2>
                <Users size={14} strokeWidth={2} aria-hidden />
                Recent Registrations
              </h2>
              <Link className="ad-all" to="/admin/events/isippe-3/participants">
                View All →
              </Link>
            </div>
            <table className="ad-recent">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Organization</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.map((r) => (
                  <tr key={r.name}>
                    <td>
                      <span className="ad-initial">{r.initials}</span>
                      {r.name}
                    </td>
                    <td>{r.org}</td>
                    <td>{r.type}</td>
                    <td>
                      <span className={r.status === "Confirmed" ? "ad-confirmed" : "ad-pending"}>
                        {r.status}
                      </span>
                    </td>
                    <td>{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="ad-card ad-list">
            <div className="ad-listhead">
              <h2>◉ Top Countries</h2>
              <Link className="ad-all" to="/admin/events/isippe-3/participants">
                View All
              </Link>
            </div>
            {topCountries.map((c, i) => (
              <div key={c.name} className="ad-country">
                <span className="ad-flag">{c.flag}</span>
                <span>{c.name}</span>
                <span className="ad-cbar">
                  <i style={{ width: `${countryWidths[i] ?? 20}%` }} />
                </span>
                <b>{c.count}</b>
              </div>
            ))}
          </section>
        </div>

        <div className="ad-quick">
          <div className="ad-qt">
            <Zap size={16} strokeWidth={2.25} aria-hidden />
            Quick Actions
          </div>
          <Link className="ad-qa" to="/admin/events">
            <CalendarDays size={14} strokeWidth={2} aria-hidden />
            Manage Event <span>›</span>
          </Link>
          <Link className="ad-qa" to="/admin/payments">
            <CreditCard size={14} strokeWidth={2} aria-hidden />
            View Payments <span>›</span>
          </Link>
          <Link className="ad-qa" to="/admin/messages">
            <MessageSquare size={14} strokeWidth={2} aria-hidden />
            Send Message <span>›</span>
          </Link>
          <Link className="ad-qa" to="/admin/events/isippe-3/reports">
            <FileBarChart size={14} strokeWidth={2} aria-hidden />
            View Reports <span>›</span>
          </Link>
        </div>
      </section>
    </>
  );
}
