import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowUpRight, BadgeCheck, Check, ShieldCheck } from "lucide-react";
import { discordLink, findGame } from "@/lib/catalog";
import {
  findProduct,
  formatCurrency,
  getEffectivePrice,
  productsForGame,
  type Product,
} from "@/lib/products";
import { getProductsFromDB } from "@/lib/db";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { OrderButton, ProductGrid } from "@/components/Products";

export const Route = createFileRoute("/accounts/$code")({
  loader: ({ params }) => {
    return { code: params.code };
  },
  head: ({ loaderData, params }) => {
    const code = loaderData?.code || params.code;
    const p = findProduct(code);
    const g = p && findGame(p.game);
    const title = p && g ? `${g.name} ${p.title} — reedmoon` : `Account ${code} — reedmoon`;
    const desc = p
      ? `${p.title}. ${formatCurrency(p.price)}. Order safely through the reedmoon Discord.`
      : "Gaming account details and verified middleman transfer at reedmoon.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});

const flow = [
  { title: "Click order", text: "Your order message is copied automatically and Discord opens." },
  {
    title: "Open a ticket",
    text: "Paste the message in the ticket channel. The team sends account screenshots.",
  },
  {
    title: "Pay safely",
    text: "The middleman holds your payment until the account is transferred.",
  },
  {
    title: "Get your account",
    text: "Log in, change the binding, done. The guarantee still applies.",
  },
];

const included = [
  { title: "Verified Listing", text: "Reviewed by the reedmoon team before publication." },
  {
    title: "Secure Checkout",
    text: "Payment runs only through the official channels the team gives you.",
  },
  { title: "Guided Transfer", text: "Support during the account handover, step by step." },
  { title: "Account Guarantee", text: "Help if the account doesn't match the listing." },
  { title: "Dedicated Support", text: "Assistance before and after the purchase." },
];

/** Overview copy built only from the product's own static data. */
const overviewFor = (p: Product, game: NonNullable<ReturnType<typeof findGame>>) => {
  if (p.description && p.description.trim().length > 0) {
    return p.description;
  }
  const specs = p.stats.map((s) => `${s.label.toLowerCase()} ${s.value}`).join(", ");
  const extras = p.highlights.join(". ").replace(/\.$/, "");
  return `This ${game.name} account includes ${specs}. ${extras}. Review the full account details and screenshots on Discord before purchasing — the team walks you through every transfer step.`;
};

function ProductPage() {
  const { code } = Route.useLoaderData();
  const [product, setProduct] = useState<Product | undefined>(() => findProduct(code));
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    getProductsFromDB().then((list) => {
      const match = list.find((item) => item.code.toLowerCase() === code.toLowerCase());
      if (match) {
        setProduct(match);
      }
    });
  }, [code]);

  const p = product;
  const game = p ? findGame(p.game) : undefined;

  // Sync active image with product image
  const displayImage = activeImage || p?.image || game?.image || "";

  if (!p || !game) {
    return (
      <main className="bm">
        <SiteHeader />
        <section className="bm-section text-center py-20">
          <h1 className="text-2xl font-bold mb-3">Looking for account {code}...</h1>
          <p className="text-muted-foreground mb-6">
            If this account was just created or moved, it may take a second to synchronize.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/accounts" className="bm-pill">
              Browse All Accounts
            </Link>
            <a
              href={discordLink}
              target="_blank"
              rel="noreferrer"
              className="bm-pill bm-pill--ghost"
            >
              Contact on Discord
            </a>
          </div>
        </section>
        <SiteFooter />
      </main>
    );
  }

  const more = productsForGame(p.game).filter((x) => x.code !== p.code);
  const sold = p.status === "terjual";
  const allImages = [...(p.image ? [p.image] : [game.image]), ...(p.screenshots || [])].filter(
    Boolean,
  );

  return (
    <main className="bm">
      <SiteHeader />
      <section className="bm-detail-hero">
        <nav className="bm-breadcrumb bm-mono" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">›</span>
          <Link to="/accounts">Accounts</Link>
          <span aria-hidden="true">›</span>
          <Link to="/accounts" search={{ game: game.slug }}>
            {game.name} accounts
          </Link>
          <span aria-hidden="true">›</span>
          <span>{p.code}</span>
        </nav>
        <div className="bm-product">
          <div className="bm-gallery">
            <figure className="bm-product-img relative">
              <img
                src={displayImage}
                alt={p.title || game.imageAlt}
                width={1024}
                height={768}
                fetchPriority="high"
                className="w-full h-full object-cover rounded-lg transition-all duration-300"
              />
              <span className="bm-card-badge bm-mono">{p.badge}</span>
              {sold && <span className="bm-card-sold bm-mono">Sold</span>}
            </figure>

            {/* Screenshots Gallery Uploaded From Device */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 pt-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`relative w-16 h-12 rounded-md overflow-hidden border-2 transition-all shrink-0 ${
                      displayImage === img
                        ? "border-primary ring-2 ring-primary/40"
                        : "border-border/60 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Screenshot ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <a className="bm-gallery-tile" href={discordLink} target="_blank" rel="noreferrer">
              <span>
                <span className="bm-mono bm-card-meta">
                  {allImages.length > 1
                    ? `${allImages.length} images uploaded`
                    : "View full gallery"}
                </span>
                <strong>Review full screenshots & verify credentials on Discord</strong>
              </span>
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
          <div className="bm-product-info">
            <div className="flex items-center gap-2">
              <span className="bm-mono bm-card-meta">
                {game.name} · {p.code}
              </span>
              {p.server && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-secondary text-secondary-foreground border border-border">
                  {p.server}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-2">{p.title}</h1>
            {(() => {
              const hasDiscount = p.hasDiscount && p.discountPercent && p.discountPercent > 0;
              const effectivePrice = getEffectivePrice(p);
              return (
                <div
                  className="bm-price-wrap"
                  style={{ margin: "20px 0 24px", gap: "12px", alignItems: "baseline" }}
                >
                  <strong className="text-3xl font-extrabold text-foreground tabular-nums">
                    {formatCurrency(effectivePrice)}
                  </strong>
                  {hasDiscount && (
                    <>
                      <span className="text-base text-muted-foreground line-through tabular-nums">
                        {formatCurrency(p.price)}
                      </span>
                      <span className="text-xs font-semibold text-red-400 bg-red-950/60 border border-red-800/50 px-2 py-0.5 rounded">
                        {p.discountPercent}% OFF
                      </span>
                    </>
                  )}
                </div>
              );
            })()}
            <OrderButton p={p} />
            <p className="bm-mono bm-note">
              <ShieldCheck aria-hidden="true" /> Deals happen only through the official reedmoon
              Discord. Never transfer to a personal bank account.
            </p>
            <div className="bm-included">
              <h2>What's included?</h2>
              <ul>
                {included.map((item) => (
                  <li key={item.title}>
                    <Check aria-hidden="true" />
                    <span>
                      <strong>{item.title}</strong>
                      <p>{item.text}</p>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bm-section">
        <div className="bm-section-head">
          <span className="bm-mono">(01) Listing</span>
          <h2>Account overview.</h2>
        </div>
        <p className="bm-overview">{overviewFor(p, game)}</p>
        {p.highlights && p.highlights.length > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-secondary/40 border border-border/50">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Key Highlights
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {p.highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-2 text-foreground">
                  <Check className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <dl className="bm-specs bm-specs--listing">
          {p.stats.map((s) => (
            <div key={s.label}>
              <dt className="bm-mono">{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
        <p className="bm-listing-note">
          <BadgeCheck aria-hidden="true" /> Verified listing. Review the product details,
          screenshots, and transfer requirements in a Discord ticket before purchasing.
        </p>
      </section>

      <section className="bm-section bm-ink">
        <div className="bm-section-head">
          <span className="bm-mono">(02) How to order</span>
          <h2>From click to login.</h2>
        </div>
        <ol className="bm-steps bm-steps--inv">
          {flow.map((s, i) => (
            <li key={s.title}>
              <span className="bm-step-no">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {more.length > 0 && (
        <section className="bm-section">
          <div className="bm-section-head">
            <div>
              <span className="text-xs font-semibold tracking-wider text-sky-400 uppercase">
                Similar Listings
              </span>
              <h2 className="text-2xl font-bold mt-1">More {game.name} accounts</h2>
            </div>
          </div>
          <ProductGrid items={more} />
        </section>
      )}
      <SiteFooter />
    </main>
  );
}
