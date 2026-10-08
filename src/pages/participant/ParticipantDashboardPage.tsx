import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  CalendarDays,
  FileText,
  Hash,
  Mail,
  MapPin,
  Plane,
  Users,
} from "lucide-react";
import { useEventCopy } from "../../i18n/useEventCopy";
import { participantPass, participantSessions } from "../../data/dashboards";

const days = [
  { id: "12", label: "Thu, 12 Nov" },
  { id: "13", label: "Fri, 13 Nov" },
  { id: "14", label: "Sat, 14 Nov" },
];

const whatsNext = [
  {
    icon: Mail,
    title: "Check your email",
    text: "We have sent a confirmation email with your ticket and event details.",
  },
  {
    icon: CalendarDays,
    title: "Explore the programme",
    text: "View sessions, speakers and plan your attendance.",
  },
  {
    icon: Plane,
    title: "Plan your travel",
    text: "Find venue information, hotels and travel guidance.",
  },
  {
    icon: Users,
    title: "Join the event",
    text: "Attend the sessions and networking events.",
  },
];

const quickActions = [
  {
    to: "/programme",
    title: "View Programme",
    text: "Explore sessions and schedules",
    icon: CalendarDays,
    primary: true,
  },
  {
    to: "/speakers",
    title: "Meet the Speakers",
    text: "View speaker profiles",
    icon: Users,
    primary: false,
  },
  {
    to: "/venue",
    title: "Venue Information",
    text: "KICC, Nairobi, Kenya",
    icon: MapPin,
    primary: false,
  },
  {
    to: "/faq",
    title: "Download Documents",
    text: "Tickets, receipts and more",
    icon: FileText,
    primary: false,
  },
];

/** Participant dashboard — structure & CSS from HTML package */
export function ParticipantDashboardPage() {
  const event = useEventCopy();
  const [day, setDay] = useState("12");

  const sessions =
    day === "12"
      ? participantSessions
      : day === "13"
        ? participantSessions.slice(1, 3)
        : participantSessions.slice(2);

  return (
    <>
      <section className="pd-hero">
        <div className="pd-hero-bg" aria-hidden />
        <div className="pd-hero-inner">
          <div className="pd-crumb">Welcome,</div>
          <h1 className="pd-hero-title">{participantPass.name}</h1>
          <div className="pd-welcome">ISIPPE-3 Participant</div>
          <div className="pd-event-row">
            <div className="pd-event">
              <CalendarDays size={28} strokeWidth={2} />
              <strong>{event.dates}</strong>
            </div>
            <div className="pd-divider" aria-hidden />
            <div className="pd-venue">
              <MapPin size={29} strokeWidth={0} fill="currentColor" />
              <div>
                Kenyatta International
                <br />
                Convention Centre (KICC)
                <small>{event.city}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pd-content">
        <div className="pd-top-grid">
          <section className="pd-card pd-pass-card">
            <h2 className="pd-card-title">Your Event Pass</h2>
            <div className="pd-pass-body">
              <div>
                <div className="pd-qr-box">
                  <img src="/assets/qr-ticket.png" alt="Event QR ticket" />
                </div>
                <button type="button" className="pd-download">
                  ⇩ &nbsp; Download QR Ticket
                </button>
              </div>
              <div className="pd-pass-details">
                <div className="pd-detail">
                  <strong>Registration ID</strong>
                  <span>{participantPass.registrationId}</span>
                </div>
                <div className="pd-detail">
                  <strong>Participant Type</strong>
                  <span>{participantPass.type}</span>
                </div>
                <div className="pd-detail">
                  <strong>Full Name</strong>
                  <span>{participantPass.fullName}</span>
                </div>
                <div className="pd-detail">
                  <strong>Organisation</strong>
                  <span>{participantPass.organisation}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="pd-card pd-info-card">
            <h2 className="pd-card-title">Event Information</h2>
            <div className="pd-info-list">
              <div className="pd-info-row">
                <CalendarDays size={23} strokeWidth={2} />
                <b>Dates</b>
                <span>{event.dates}</span>
              </div>
              <div className="pd-info-row">
                <MapPin size={23} strokeWidth={0} fill="currentColor" />
                <b>Venue</b>
                <span>
                  {event.venue}, {event.city}
                </span>
              </div>
              <div className="pd-info-row">
                <Users size={23} strokeWidth={2} />
                <b>Your Participation</b>
                <span>{participantPass.type}</span>
              </div>
              <div className="pd-info-row">
                <Award size={23} strokeWidth={2} />
                <b>Registration Fee</b>
                <span>
                  {participantPass.fee} <i className="pd-fee">Paid via eCitizen</i>
                </span>
              </div>
              <div className="pd-info-row">
                <Hash size={23} strokeWidth={2} />
                <b>Payment Reference</b>
                <span>{participantPass.paymentRef}</span>
              </div>
              <div className="pd-info-row">
                <span
                  style={{
                    width: 23,
                    height: 23,
                    borderRadius: "50%",
                    background: "#078047",
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                  aria-hidden
                >
                  ✓
                </span>
                <b>Payment Status</b>
                <span style={{ color: "#078047", fontWeight: 700 }}>{participantPass.status}</span>
              </div>
            </div>
          </section>

          <section className="pd-card pd-next-card">
            <h2 className="pd-card-title">What&apos;s Next?</h2>
            {whatsNext.map((item) => (
              <div key={item.title} className="pd-next-row">
                <item.icon size={25} strokeWidth={2} />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </section>
        </div>

        <div className="pd-quick">
          {quickActions.map((a) => (
            <Link
              key={a.title}
              to={a.to}
              className={`pd-quick-card${a.primary ? " primary" : ""}`}
            >
              <span className="pd-quick-icon">
                <a.icon size={28} strokeWidth={1.8} />
              </span>
              <span>
                <strong>{a.title}</strong>
                <p>{a.text}</p>
              </span>
              <span className="pd-quick-arrow" aria-hidden>
                →
              </span>
            </Link>
          ))}
        </div>

        <div className="pd-lower">
          <section className="pd-card pd-programme">
            <div className="pd-programme-head">
              <h2>▣ &nbsp;Event Programme</h2>
              <Link to="/programme">View Full Programme &nbsp;→</Link>
            </div>
            <div className="pd-days">
              {days.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`pd-day${day === d.id ? " active" : ""}`}
                  onClick={() => setDay(d.id)}
                >
                  {d.label}
                </button>
              ))}
            </div>
            {sessions.map((s) => (
              <div key={s.id} className="pd-session">
                <span className="pd-session-time">{s.time}</span>
                <span className="pd-session-title">
                  <strong>{s.title}</strong>
                  <small>{s.place}</small>
                </span>
                <span className={`pd-tag${s.tone === "green" ? " green" : ""}`}>{s.badge}</span>
              </div>
            ))}
          </section>

          <div className="pd-right-lower">
            <section className="pd-card pd-venue-card">
              <div className="pd-venue-img" role="img" aria-label="KICC venue" />
              <div className="pd-venue-body">
                <h3>Venue Information</h3>
                <p>
                  📍 &nbsp; {event.venue}, {event.city}
                </p>
                <Link className="pd-outline-btn" to="/venue">
                  View Venue Details &nbsp; →
                </Link>
              </div>
            </section>
            <section className="pd-help">
              <h3>Need Assistance?</h3>
              <p>For support, please contact us:</p>
              <a href={`mailto:${event.supportEmail}`}>✉ &nbsp; {event.supportEmail}</a>
              <br />
              <a href={`tel:${event.supportPhone}`}>☎ &nbsp; {event.supportPhone}</a>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
