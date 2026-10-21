import { findGame, testimonials, type Testimonial } from "@/lib/catalog";

function TestimonialCard({ t, featured = false }: { t: Testimonial; featured?: boolean }) {
  const game = t.game === "all" ? null : findGame(t.game);
  return (
    <figure className={`bm-testi-card${featured ? " bm-testi-card--feat" : ""}`}>
      <span className="bm-testi-rating" aria-label="Rated 5 out of 5 stars">
        ★★★★★
      </span>
      <blockquote>{t.quote}</blockquote>
      <figcaption className="bm-testi-meta bm-mono">
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
  const game = findGame(gameSlug);
  if (!game) return null;

  const pool = testimonials.filter((t) => t.service === serviceSlug);
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
  return <TestiCarousel items={testimonials} />;
}

/** Seamless infinite carousel: list rendered twice, track shifted -50% with a GPU transform. */
function TestiCarousel({ items }: { items: Testimonial[] }) {
  const dur = Math.max(30, items.length * 7);
  return (
    <div className="bm-testi-carousel">
      <div className="bm-testi-track" style={{ animationDuration: `${dur}s` }}>
        {[0, 1].map((copy) => (
          <div className="bm-testi-set" key={copy} aria-hidden={copy === 1 || undefined}>
            {items.map((t) => (
              <TestimonialCard key={`${copy}-${t.name}-${t.game}-${t.service}`} t={t} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
