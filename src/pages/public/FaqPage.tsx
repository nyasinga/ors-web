import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  CreditCard,
  FileText,
  Handshake,
  Headset,
  MapPin,
  Ticket,
  User,
  Users,
} from "lucide-react";
import { faqCategories, faqsByCategory } from "../../data/publicContent";

const icons = {
  FileText,
  User,
  CreditCard,
  Handshake,
  Users,
  Ticket,
  MapPin,
  Headset,
} as const;

/** FAQ — structure & CSS adopted from isippe3-faq-pure-html-responsive */
export function FaqPage() {
  const { t } = useTranslation("common");
  const [category, setCategory] = useState<(typeof faqCategories)[number]["id"]>("general");
  const [openId, setOpenId] = useState<string | null>(null);

  const active = faqCategories.find((c) => c.id === category) ?? faqCategories[0];
  const items = useMemo(() => faqsByCategory[category] ?? [], [category]);

  return (
    <div className="faq-page">
      <section className="faq-hero">
        <div className="home-container faq-hero-inner">
          <div className="faq-hero-copy">
            <div className="faq-accent" aria-hidden>
              <span />
              <span />
            </div>
            <h1 className="faq-hero-title">Frequently Asked Questions</h1>
            <p>
              Find answers to common questions about ISIPPE-3 registration, payments, participation
              and more.
            </p>
            <div className="faq-event-row">
              <div className="faq-event-item">
                <div className="faq-icon">
                  <CalendarDays size={32} strokeWidth={2} />
                </div>
                <strong>{t("event.datesShort")}</strong>
              </div>
              <div className="faq-event-divider" aria-hidden />
              <div className="faq-event-item">
                <div className="faq-icon">
                  <MapPin size={32} strokeWidth={0} fill="currentColor" />
                </div>
                <div>
                  <strong>{t("event.city")}</strong>
                  <small>{t("event.venue")}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="faq-section" id="faq">
        <div className="home-container faq-layout">
          <aside className="faq-category-panel" aria-label="FAQ categories">
            {faqCategories.map((cat) => {
              const Icon = icons[cat.icon];
              const isActive = cat.id === category;
              const count = faqsByCategory[cat.id]?.length ?? 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`faq-category${isActive ? " active" : ""}`}
                  onClick={() => {
                    setCategory(cat.id);
                    setOpenId(null);
                  }}
                >
                  <span className="faq-category-icon">
                    <Icon size={25} strokeWidth={1.75} />
                  </span>
                  <span className="faq-category-label">{cat.label}</span>
                  <span className="faq-count">{count}</span>
                  <span className="faq-chev" aria-hidden>
                    ›
                  </span>
                </button>
              );
            })}
          </aside>

          <section className="faq-questions-panel">
            <h2>{active.label}</h2>
            <p className="faq-intro">{active.intro}</p>
            <div>
              {items.map((item, index) => {
                const id = String(index);
                const open = openId === id;
                return (
                  <div key={item.q} className="faq-item">
                    <button
                      type="button"
                      className={`faq-question${open ? " open" : ""}`}
                      aria-expanded={open}
                      onClick={() => setOpenId(open ? null : id)}
                    >
                      <span>{item.q}</span>
                      <span className="faq-plus" aria-hidden>
                        {open ? "−" : "+"}
                      </span>
                    </button>
                    <div className="faq-answer">{item.a}</div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
