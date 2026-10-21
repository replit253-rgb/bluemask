import { useEffect, useState } from "react";
import { findGame, testimonials as initialTestimonials, type Testimonial } from "@/lib/catalog";
import { getTestimonialsFromDB } from "@/lib/db";

function TestimonialCard({ t, featured = false }: { t: Testimonial; featured?: boolean }) {
  const game = t.game === "all" ? null : findGame(t.game);
  return (
    <figure className={`bm-testi-card${featured ? " bm-testi-card--feat" : ""}`}>
      {t.image && (
        <div className="mb-3 overflow-hidden rounded-lg border border-border/50 max-h-36">
          <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
        </div>
      )}
      <span className="bm-testi-rating" aria-label="Rated 5 out of 5 stars">
        ★★★★★
      </span>
      <blockquote>{t.quote}</blockquote>
      <figcaption className="bm-testi-meta bm-mono flex items-center justify-between flex-wrap gap-2">
        <span className="bm-testi-name">
          {t.name} · {t.role}
        </span>
        {game && <span>{game.name}</span>}
        <span>{t.date}</span>
      </figcaption>
    </figure>
  );
}

/** Testimonials for one service on its detail page, ordered by game. */
export function TestimonialSection({
  serviceSlug,
  gameSlug,
}: {
  serviceSlug: string;
  gameSlug: string;
}) {
  const [items, setItems] = useState<Testimonial[]>(initialTestimonials);

  useEffect(() => {
    getTestimonialsFromDB().then((data) => {
      if (data && data.length > 0) setItems(data);
    });
  }, []);

  const game = findGame(gameSlug);
  if (!game) return null;

  const pool = items.filter(
    (t) =>
      t.service === serviceSlug ||
      (serviceSlug === "buy-sell-accounts" && t.service === "jual-beli-akun") ||
      (serviceSlug === "jual-beli-akun" && t.service === "buy-sell-accounts"),
  );
  const ordered = [
    ...pool.filter((t) => t.game === gameSlug),
    ...pool.filter((t) => t.game === "all"),
  ];
  if (ordered.length === 0) return null;

  return (
    <section className="bm-section">
      <div className="bm-section-head">
        <span className="bm-mono">(03) Testimonials</span>
        <h2>From people who've traded with us.</h2>
      </div>
      <TestiCarousel items={ordered} />
    </section>
  );
}

/** Testimonial picks for the home page section. */
export function HomeTestimonials() {
  const [items, setItems] = useState<Testimonial[]>(initialTestimonials);

  useEffect(() => {
    getTestimonialsFromDB().then((data) => {
      if (data && data.length > 0) setItems(data);
    });
  }, []);

  return <TestiCarousel items={items} />;
}

/** Seamless infinite carousel: list rendered twice, track shifted -50% with a GPU transform. */
function TestiCarousel({ items }: { items: Testimonial[] }) {
  const dur = Math.max(30, items.length * 7);
  return (
    <div className="bm-testi-carousel">
      <div className="bm-testi-track" style={{ animationDuration: `${dur}s` }}>
        {[0, 1].map((copy) => (
          <div className="bm-testi-set" key={copy} aria-hidden={copy === 1 || undefined}>
            {items.map((t, idx) => (
              <TestimonialCard key={`${copy}-${t.id || idx}-${t.name}`} t={t} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
