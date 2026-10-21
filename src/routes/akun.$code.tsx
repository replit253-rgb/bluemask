import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowUpRight, BadgeCheck, Check, ShieldCheck } from "lucide-react";
import { discordLink, findGame } from "@/lib/catalog";
import { findProduct, formatRupiah, productsForGame } from "@/lib/products";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { OrderButton, ProductGrid } from "@/components/Products";

export const Route = createFileRoute("/akun/$code")({
  loader: ({ params }) => {
    const p = findProduct(params.code);
    if (!p) throw notFound();
    return { code: p.code };
  },
  head: ({ loaderData }) => {
    const p = loaderData && findProduct(loaderData.code);
    const g = p && findGame(p.game);
    const title = p && g ? `${g.name} ${p.title} — BlueMask` : "Account not found — BlueMask";
    const desc = p
      ? `${p.title}. ${formatRupiah(p.price)}. Order safely through the BlueMask Discord.`
      : "This account is unavailable.";
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
  { title: "Verified Listing", text: "Reviewed by the BlueMask team before publication." },
  {
    title: "Secure Checkout",
    text: "Payment runs only through the official channels the team gives you.",
  },
  { title: "Guided Transfer", text: "Support during the account handover, step by step." },
  { title: "Account Guarantee", text: "Help if the account doesn't match the listing." },
  { title: "Dedicated Support", text: "Assistance before and after the purchase." },
];

/** Overview copy built only from the product's own static data. */
const overviewFor = (
  p: NonNullable<ReturnType<typeof findProduct>>,
  game: NonNullable<ReturnType<typeof findGame>>,
) => {
  const specs = p.stats.map((s) => `${s.label.toLowerCase()} ${s.value}`).join(", ");
  const extras = p.highlights.join(". ").replace(/\.$/, "");
  return `This ${game.name} account includes ${specs}. ${extras}. Review the full account details and screenshots on Discord before purchasing — the team walks you through every transfer step.`;
};

function ProductPage() {
  const { code } = Route.useLoaderData();
  const p = findProduct(code);
  const game = p && findGame(p.game);
  if (!p || !game) return null;
  const more = productsForGame(p.game).filter((x) => x.code !== p.code);
  const sold = p.status === "terjual";

  return (
    <main className="bm">
      <SiteHeader />
      <section className="bm-detail-hero">
        <nav className="bm-breadcrumb bm-mono" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">›</span>
          <Link to="/akun">Accounts</Link>
          <span aria-hidden="true">›</span>
          <Link to="/akun" search={{ game: game.slug }}>
            {game.name} accounts
          </Link>
          <span aria-hidden="true">›</span>
          <span>{p.code}</span>
        </nav>
        <div className="bm-product">
          <div className="bm-gallery">
            <figure className="bm-product-img">
              <img
                src={game.image}
                alt={game.imageAlt}
                width={1024}
                height={768}
                fetchPriority="high"
              />
              <span className="bm-card-badge bm-mono">{p.badge}</span>
              {sold && <span className="bm-card-sold bm-mono">Sold</span>}
            </figure>
            <a className="bm-gallery-tile" href={discordLink} target="_blank" rel="noreferrer">
              <span>
                <span className="bm-mono bm-card-meta">View full gallery</span>
                <strong>Review the full account details before purchasing</strong>
              </span>
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
          <div className="bm-product-info">
            <span className="bm-mono bm-card-meta">
              {game.name} · {p.code}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-2">{p.title}</h1>
            <div
              className="bm-price-wrap"
              style={{ margin: "20px 0 24px", gap: "12px", alignItems: "baseline" }}
            >
              <strong className="text-3xl font-extrabold text-foreground tabular-nums">
                {formatRupiah(Math.round(p.price * 0.8))}
              </strong>
              <span className="text-base text-muted-foreground line-through tabular-nums">
                {formatRupiah(p.price)}
              </span>
              <span className="text-xs font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/50 px-2 py-0.5 rounded">
                20% OFF
              </span>
            </div>
            <OrderButton p={p} />
            <p className="bm-mono bm-note">
              <ShieldCheck aria-hidden="true" /> Deals happen only through the official BlueMask
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
        <dl className="bm-specs bm-specs--listing">
          {p.stats.map((s) => (
            <div key={s.label}>
              <dt className="bm-mono">{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
        <p className="bm-listing-note">
          <BadgeCheck aria-hidden="true" /> Sample listing. Review the product details, screenshots,
          and transfer requirements in a Discord ticket before purchasing.
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
