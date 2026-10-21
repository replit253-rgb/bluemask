import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { discordLink, games, services } from "@/lib/catalog";
import { perks, products, stats } from "@/lib/products";
import { Marquee, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { ProductGrid } from "@/components/Products";
import { HomeTestimonials } from "@/components/Testimonials";
import { ServiceCards } from "@/components/ServiceCards";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BlueMask Gaming Store — Game Accounts, Middleman & Top Up" },
      {
        name: "description",
        content:
          "Buy and sell accounts, middleman, and top up at BlueMask Gaming Store for Whiteout Survival, Kingshot, Rise of Kingdoms, and Call of Dragons.",
      },
        { property: "og:title", content: "BlueMask Gaming Store — Game Accounts, Middleman & Top Up" },
        { property: "og:description", content: "Buy and sell accounts, middleman, and top up for strategy games. Reach BlueMask on Discord." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const faqs = [
  {
    q: "How do I order an account?",
    a: "Pick an account from the collection, then message BlueMask on Discord to confirm availability and complete your purchase. Every listing links straight to our Discord.",
  },
  {
    q: "Is trading with BlueMask safe?",
    a: "Yes. Every deal goes through our verified process — secure checkout, guided transfer, and an account guarantee so you're never left on your own.",
  },
  {
    q: "What is the middleman service?",
    a: "If you're trading with another player, BlueMask acts as the trusted middleman: we hold the account and the payment until both sides have delivered, then release them.",
  },
  {
    q: "How fast are game top ups?",
    a: "Top ups for Whiteout Survival, Kingshot, Rise of Kingdoms and Call of Dragons are processed as soon as your payment is confirmed — usually within minutes.",
  },
  {
    q: "Can I sell my account here?",
    a: "Absolutely. Contact BlueMask on Discord with your account details and we'll verify it, list it, and handle the sale for you.",
  },
];

function Index() {
  return (
    <main className="bm">
      <SiteHeader />

      <section className="bm-hero">
        <img className="bm-hero-image" src={games[1].image} alt={games[1].imageAlt} fetchPriority="high" />
        <div className="bm-hero-content">
          <span className="bm-eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
          <h1 className="bm-hero-title">BlueMask<span>Gaming Store.</span></h1>
          <p className="bm-lead">Great accounts. Safer trades.<br />More possibilities in every game.</p>
          <div className="bm-hero-rating"><strong>4.9</strong><i aria-hidden="true">★★★★★</i><span>340+ orders completed</span></div>
          <div className="bm-hero-actions"><Button asChild className="bm-pill"><Link to="/akun" search={{}}>Explore accounts <ArrowUpRight /></Link></Button><Button asChild variant="outline" className="bm-pill bm-pill--hero"><Link to="/layanan">Our services <ArrowUpRight /></Link></Button></div>
          <span className="bm-hero-caption">Accounts / Middleman / Top Up</span>
        </div>
      </section>
      <section className="bm-section bm-section-services"><div className="bm-section-head"><div><span className="bm-eyebrow">BUILT AROUND YOUR GAME</span><h2>Three services.<br />One trusted place.</h2></div><Link to="/layanan" className="bm-text-link">All services <ArrowUpRight /></Link></div><ServiceCards /></section>

      <Marquee items={games.map((g) => g.name)} />

      <section id="game" className="bm-section"><div className="bm-section-head"><div><span className="bm-eyebrow">THE COLLECTION</span><h2>Choose your battlefield.</h2></div><Link to="/games" className="bm-text-link">All games <ArrowUpRight /></Link></div><div className="bm-cards bm-cards--4">{games.map(g => <Link key={g.slug} to="/akun" search={{ game: g.slug }} className="bm-card"><div className="bm-card-img"><img src={g.image} alt={g.imageAlt} width={928} height={720} loading="lazy" /></div><div className="bm-card-body"><span className="bm-mono bm-card-meta">{g.genre}</span><h3>{g.name}</h3><span className="bm-text-link">Explore accounts <ArrowUpRight /></span></div></Link>)}</div></section>

      <section id="akun" className="bm-section">
        <div className="bm-section-head">
          <span className="bm-mono">(03) Latest accounts</span>
          <h2>Pick an account, order on Discord.</h2>
        </div>
        <ProductGrid items={products.filter((p) => p.status === "tersedia").slice(0, 6)} />
        <Link className="bm-pill" to="/akun" search={{}}>See all accounts <ArrowUpRight aria-hidden="true" /></Link>
      </section>

      <section className="bm-section bm-ink">
        <div className="bm-stats">
          {stats.map((s) => (
            <div key={s.label}><strong>{s.value}</strong><span className="bm-mono">{s.label}</span></div>
          ))}
        </div>
        <ul className="bm-perks">
          {perks.map((k, i) => (
            <li key={k.title}><span className="bm-mono">0{i + 1}</span><h3>{k.title}</h3><p>{k.text}</p></li>
          ))}
        </ul>
      </section>

      <section className="bm-section">
        <div className="bm-section-head">
          <span className="bm-mono">(04) Testimonials</span>
          <h2>From people who've traded with us.</h2>
        </div>
        <HomeTestimonials />
      </section>

      <section className="bm-section">
        <div className="bm-section-head">
          <span className="bm-mono">(05) FAQ</span>
          <h2>Questions, answered.</h2>
        </div>
        <div className="bm-faq">
          {faqs.map((f) => (
            <details key={f.q} className="bm-faq-item">
              <summary>
                <span>{f.q}</span>
                <span className="bm-faq-icon" aria-hidden="true">+</span>
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
