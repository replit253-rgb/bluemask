import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { findGame, gamesForService, type Service } from "@/lib/catalog";
import { Marquee, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { ProductGrid } from "@/components/Products";
import { TopUpGrid } from "@/components/TopUp";
import type { Product } from "@/lib/products";
import { getProductsFromDB, getServicesFromDB } from "@/lib/db";
import { useStoreSettings } from "@/hooks/use-store-settings";

export const Route = createFileRoute("/services/$service/$game")({
  loader: async ({ params }) => {
    const serviceSlug = params.service === "jual-beli-akun" ? "buy-sell-accounts" : params.service;
    const serviceList = await getServicesFromDB();
    const service = serviceList.find((item) => item.slug === serviceSlug);
    const game = findGame(params.game);
    if (!service || !game || (service.gameSlugs && !service.gameSlugs.includes(game.slug))) {
      throw notFound();
    }
    return { service, game, serviceList };
  },
  head: ({ loaderData, params }) => {
    const s = loaderData?.service;
    const g = loaderData?.game;
    if (!s || !g)
      return {
        meta: [
          { title: "Page unavailable — RedMoon" },
          { name: "description", content: "This RedMoon service page is unavailable." },
          { property: "og:title", content: "Page unavailable — RedMoon" },
          { property: "og:description", content: "This RedMoon service page is unavailable." },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary" },
          { name: "robots", content: "noindex" },
        ],
      };
    const title = `${s.name} ${g.name} — RedMoon Gaming Store`;
    const desc =
      s.slug === "top-up"
        ? `Affordable, safe ${g.name} top ups with RedMoon. Pick a pack, send your player ID, and it lands in your account.`
        : `${s.intro} For ${g.name} accounts.`;
    const url = `/services/${params.service}/${params.game}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ServicePage,
});

function ServicePage() {
  const { service, game, serviceList } = Route.useLoaderData();
  const [products, setProducts] = useState<Product[]>([]);
  const { discordLink } = useStoreSettings();

  useEffect(() => {
    let isMounted = true;
    void getProductsFromDB().then(
      (storedProducts) => {
        if (isMounted) setProducts(storedProducts);
      },
      (error: unknown) => {
        console.error("Failed to load accounts from PostgreSQL:", error);
      },
    );
    return () => {
      isMounted = false;
    };
  }, []);

  const isTopUp = service.slug === "top-up";
  const checklist = service.checklist ?? game.accountPoints;
  const serviceGames = gamesForService(service);
  const gameIndex = serviceGames.findIndex((g) => g.slug === game.slug) + 1;
  const isAvailableForGame = (item: Service) =>
    !item.gameSlugs || item.gameSlugs.includes(game.slug);

  const related = [
    ...serviceList
      .filter((item) => item.slug !== service.slug && isAvailableForGame(item))
      .map((s) => ({ s, g: game })),
    ...serviceGames.filter((g) => g.slug !== game.slug).map((g) => ({ s: service, g })),
  ];

  return (
    <main className="bm">
      <SiteHeader />

      <section className="bm-detail-hero">
        <div className="bm-hero-meta bm-mono">
          <Link to="/">← Index</Link>
          <Link to="/services">{service.name}</Link>
          <span>
            {String(gameIndex).padStart(2, "0")} / {String(serviceGames.length).padStart(2, "0")}
          </span>
        </div>
        <h1 className="bm-detail-title">
          {service.name}
          <span>{game.name}</span>
        </h1>
        <div className="bm-detail-grid">
          <p className="bm-lead">
            {service.tagline} {service.intro}
          </p>
          <a className="bm-pill" href={discordLink} target="_blank" rel="noreferrer">
            Start on Discord <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
        <figure className="bm-detail-figure">
          <img src={game.image} alt={game.imageAlt} width={928} height={720} fetchPriority="high" />
          <figcaption className="bm-mono">
            Fig. {game.number} — {game.genre}
          </figcaption>
        </figure>
      </section>

      {isTopUp && (
        <section className="bm-section">
          <div className="bm-section-head">
            <span className="bm-mono">(01) Prices</span>
            <h2>{game.name} top up packs.</h2>
          </div>
          <TopUpGrid gameSlug={game.slug} />
        </section>
      )}

      <section className="bm-section">
        <div className="bm-section-head">
          <span className="bm-mono">({isTopUp ? "02" : "01"}) Process</span>
          <h2>How it works.</h2>
        </div>
        <ol className="bm-steps">
          {service.steps.map((step, i) => (
            <li key={step.title}>
              <span className="bm-step-no">{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bm-section bm-ink">
        <div className="bm-section-head">
          <span className="bm-mono">({isTopUp ? "03" : "02"}) Prepare</span>
          <h2>{isTopUp ? "What you need to top up." : `${game.name} account info.`}</h2>
        </div>
        <ul className="bm-checklist">
          {checklist.map((p, i) => (
            <li key={p}>
              <span className="bm-mono">0{i + 1}</span>
              {p}
            </li>
          ))}
        </ul>
      </section>

      {(service.slug === "buy-sell-accounts" || service.slug === "jual-beli-akun") && (
        <section className="bm-section">
          <div className="bm-section-head">
            <span className="bm-mono">(03) Stock</span>
            <h2>Available {game.name} accounts.</h2>
          </div>
          <ProductGrid items={products.filter((product) => product.game === game.slug)} />
        </section>
      )}

      <Marquee items={[service.name, game.name, "RedMoon"]} />

      <section className="bm-section">
        <div className="bm-section-head">
          <span className="bm-mono">(04) More</span>
          <h2>Keep exploring.</h2>
        </div>
        <ul className="bm-index">
          {related.map(({ s, g }) => (
            <li key={s.slug + g.slug} className="bm-index-row bm-index-row--link">
              <Link
                to="/services/$service/$game"
                params={{ service: s.slug, game: g.slug }}
                className="bm-row-link"
              >
                <span className="bm-mono bm-index-no">{g.number}</span>
                <h3>
                  {s.name} — {g.name}
                </h3>
                <ArrowUpRight aria-hidden="true" className="bm-row-arrow" />
              </Link>
              <img
                className="bm-index-peek"
                src={g.image}
                alt=""
                width={928}
                height={720}
                loading="lazy"
              />
            </li>
          ))}
        </ul>
      </section>

      <SiteFooter />
    </main>
  );
}
