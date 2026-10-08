import { useTranslation } from "react-i18next";
import {
  Bus,
  CalendarDays,
  Globe2,
  MapPin,
  Shield,
  Users,
  Wifi,
} from "lucide-react";

const benefits = [
  {
    icon: MapPin,
    filled: true,
    title: "Central Location",
    text: (
      <>
        In the heart of
        <br />
        Nairobi CBD
      </>
    ),
  },
  {
    icon: Users,
    title: "World-Class Facilities",
    text: (
      <>
        Modern conference
        <br />
        and exhibition spaces
      </>
    ),
  },
  {
    icon: Shield,
    title: "Secure & Accessible",
    text: (
      <>
        High security and
        <br />
        easy access
      </>
    ),
  },
  {
    icon: Wifi,
    title: "Modern Amenities",
    text: (
      <>
        High-speed internet
        <br />
        and full support services
      </>
    ),
  },
  {
    icon: Bus,
    title: "Convenient Access",
    text: (
      <>
        Close to major hotels
        <br />
        and transport links
      </>
    ),
  },
] as const;

const spaces = [
  {
    name: "Plenary Hall",
    text: "Main hall for opening, closing and high-level plenary sessions.",
    capacity: "Capacity: 1,000+ delegates",
    image: "/assets/venue-plenary-hall.jpg",
    alt: "KICC Plenary Hall",
  },
  {
    name: "Breakout Rooms",
    text: "Parallel thematic sessions and workshops.",
    capacity: "Capacity: 100 – 300 delegates",
    image: "/assets/venue-breakout-rooms.jpg",
    alt: "KICC Breakout Rooms",
  },
  {
    name: "Exhibition Area",
    text: "Showcase innovations, solutions and services.",
    capacity: "Capacity: 50+ exhibitors",
    image: "/assets/venue-exhibition-area.jpg",
    alt: "KICC Exhibition Area",
  },
  {
    name: "Meeting Rooms",
    text: "Bilateral meetings and side events.",
    capacity: "Capacity: 20 – 50 delegates",
    image: "/assets/venue-meeting-rooms.jpg",
    alt: "KICC Meeting Rooms",
  },
] as const;

/** Venue — structure & CSS adopted from isippe3-venue-pure-html-responsive */
export function VenuePage() {
  const { t } = useTranslation("common");

  return (
    <div className="venue-page">
      <section className="venue-hero" id="venue">
        <div className="home-container venue-hero-inner">
          <div className="venue-hero-copy">
            <div className="venue-accent" aria-hidden>
              <span />
              <span />
            </div>
            <p className="venue-section-label">Venue</p>
            <h1 className="venue-hero-title">
              Kenyatta International
              <br />
              Convention Centre (KICC)
            </h1>
            <p className="venue-hero-description">
              ISIPPE-3 will be held at the iconic Kenyatta International Convention Centre (KICC), a
              world-class venue in the heart of Nairobi, Kenya.
            </p>
            <div className="venue-event-row">
              <div className="venue-event-item">
                <div className="venue-event-icon">
                  <CalendarDays size={32} strokeWidth={2} />
                </div>
                <strong>{t("event.datesShort")}</strong>
              </div>
              <div className="venue-event-divider" aria-hidden />
              <div className="venue-event-item">
                <div className="venue-event-icon">
                  <MapPin size={32} strokeWidth={0} fill="currentColor" />
                </div>
                <strong>KICC, Nairobi, Kenya</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="venue-benefits">
        <div className="home-container venue-benefit-grid">
          {benefits.map((item) => (
            <article key={item.title} className="venue-benefit">
              <div className="venue-benefit-icon">
                {"filled" in item && item.filled ? (
                  <item.icon size={39} strokeWidth={0} fill="currentColor" />
                ) : (
                  <item.icon size={39} strokeWidth={1.7} />
                )}
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="venue-about" id="about-kicc">
        <div className="home-container venue-about-grid">
          <div className="venue-about-copy">
            <h2>About KICC</h2>
            <p>
              The Kenyatta International Convention Centre (KICC) is Kenya&apos;s premier conference
              and exhibition venue, known for its state-of-the-art facilities, accessibility and
              iconic status.
            </p>
            <p>
              KICC provides a professional and inspiring environment for global conferences,
              exhibitions and high-level meetings, making it the perfect venue for ISIPPE-3.
            </p>
            <a
              className="venue-btn"
              href="https://www.kicc.co.ke"
              target="_blank"
              rel="noreferrer"
            >
              <Globe2 size={18} strokeWidth={2} />
              Visit KICC Website{" "}
              <span className="venue-arrow" aria-hidden>
                →
              </span>
            </a>
          </div>

          <div className="venue-map-card">
            <img src="/assets/venue-map.jpg" alt="Map showing KICC in Nairobi" />
            <a
              className="venue-map-button"
              href="https://maps.google.com/?q=Kenyatta+International+Convention+Centre"
              target="_blank"
              rel="noreferrer"
            >
              View on Google Maps{" "}
              <span className="venue-arrow" aria-hidden>
                →
              </span>
            </a>
          </div>
        </div>
      </section>

      <section className="venue-spaces" id="spaces">
        <div className="home-container">
          <div className="venue-spaces-header">
            <div className="venue-spaces-title-wrap">
              <div className="venue-accent" aria-hidden>
                <span />
                <span />
              </div>
              <h2>Venue Spaces</h2>
              <p className="venue-spaces-intro">
                ISIPPE-3 will utilise multiple spaces at KICC to deliver an engaging and seamless
                experience.
              </p>
            </div>
            <a className="venue-see-all" href="#spaces">
              See All{" "}
              <span className="venue-arrow" aria-hidden>
                →
              </span>
            </a>
          </div>

          <div className="venue-space-grid">
            {spaces.map((space) => (
              <article key={space.name} className="venue-space-card">
                <img className="venue-space-image" src={space.image} alt={space.alt} />
                <div className="venue-space-body">
                  <h3>{space.name}</h3>
                  <p>{space.text}</p>
                  <div className="venue-capacity">
                    <Users size={19} strokeWidth={0} fill="currentColor" />
                    {space.capacity}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
