import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { games, services, isServiceAvailable } from "@/lib/catalog";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "Games — reedmoon Gaming Store" },
      {
        name: "description",
        content:
          "Explore Whiteout Survival, Kingshot, Rise of Kingdoms and Call of Dragons accounts and services at reedmoon.",
      },
      { property: "og:title", content: "Games — reedmoon Gaming Store" },
      {
        property: "og:description",
        content: "Choose your game and explore reedmoon accounts, middleman and top ups.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GamesPage,
});
export function GameCards() {
  return (
    <div className="bm-cards bm-cards--4">
      {games.map((g) => (
        <article key={g.slug} className="bm-card">
          <div className="bm-card-img">
            <img src={g.image} alt={g.imageAlt} width={928} height={720} loading="lazy" />
            <span className="bm-card-badge bm-mono">{g.number}</span>
          </div>
          <div className="bm-card-body">
            <span className="bm-mono bm-card-meta">{g.genre}</span>
            <h3>{g.name}</h3>
            <div className="bm-service-games">
              {services
                .filter((s) => isServiceAvailable(s.slug, g.slug))
                .map((s) => (
                  <Link
                    key={s.slug}
                    to="/services/$service/$game"
                    params={{ service: s.slug, game: g.slug }}
                  >
                    {s.name}
                    <ArrowUpRight />
                  </Link>
                ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
function GamesPage() {
  return (
    <main className="bm">
      <SiteHeader />
      <section className="bm-section">
        <span className="bm-eyebrow">THE COLLECTION</span>
        <h1 className="bm-page-title">Accounts for Sale</h1>
        <p className="bm-lead">Four worlds. Your next adventure.</p>
        <GameCards />
      </section>
      <SiteFooter />
    </main>
  );
}
