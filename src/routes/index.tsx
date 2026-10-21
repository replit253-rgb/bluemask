import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Lock, ShieldCheck, Zap } from "lucide-react";
import { discordLink, games, services } from "@/lib/catalog";
import { products, type Product } from "@/lib/products";
import { getStoredProducts } from "@/lib/admin-store";
import { getPageFromDB, type PageContent } from "@/lib/db";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
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
      {
        property: "og:title",
        content: "BlueMask Gaming Store — Game Accounts, Middleman & Top Up",
      },
      {
        property: "og:description",
        content:
          "Buy and sell accounts, middleman, and top up for strategy games. Reach BlueMask on Discord.",
      },
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
  const [productList, setProductList] = useState<Product[]>([]);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    setProductList(getStoredProducts());
    getPageFromDB("home").then((p) => setPageContent(p));
  }, []);

  const activeCatalog = productList.length > 0 ? productList : products;

  return (
    <main className="bm">
      <SiteHeader />

      {/* Hero Section */}
      <section className="bm-hero">
        <img
          className="bm-hero-image"
          src={pageContent?.heroImage || "/assets/aistudio/bg_fe70fe49.jpg"}
          alt="BlueMask Gaming Store"
          fetchPriority="high"
        />
        <div className="bm-hero-content">
          <h1 className="bm-hero-title">
            {pageContent?.heroTitle ? (
              pageContent.heroTitle
            ) : (
              <>
                BlueMask<span className="text-sky-400">Gaming Store</span>
              </>
            )}
          </h1>
          <p className="bm-lead">
            {pageContent?.heroSubtitle
              ? pageContent.heroSubtitle
              : "Verified strategy game accounts, secure middleman escrow, and direct top-ups for competitive players."}
          </p>

          <div className="bm-hero-actions">
            <Button asChild className="bm-btn bm-btn-primary">
              <Link to="/akun" search={{}}>
                Explore Accounts <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="bm-btn bm-btn-outline">
              <Link to="/layanan">
                Middleman & Services <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="bm-trust-ribbon">
            <span>
              <ShieldCheck className="w-4 h-4 text-sky-400" /> Middleman Escrow Protection
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <Zap className="w-4 h-4 text-amber-400" /> Instant Discord Delivery
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <Check className="w-4 h-4 text-emerald-400" /> 100% Verified Credentials
            </span>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bm-section--full bm-section-services">
        <div className="bm-section-head">
          <div>
            <span className="text-xs font-semibold tracking-wider text-sky-400 uppercase">
              Core Services
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">Middleman & Trading Services</h2>
          </div>
          <Link to="/layanan" className="bm-text-link">
            All services <ArrowUpRight />
          </Link>
        </div>
        <ServiceCards />
      </section>

      {/* Featured Accounts Section */}
      <section id="akun" className="bm-section--full">
        <div className="bm-section-head">
          <div>
            <span className="text-xs font-semibold tracking-wider text-sky-400 uppercase">
              Catalog
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">
              Available Accounts Ready to Play
            </h2>
          </div>
          <Link className="bm-text-link" to="/akun" search={{}}>
            View all accounts <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
        <ProductGrid items={activeCatalog.filter((p) => p.status === "tersedia").slice(0, 6)} />
        <div className="mt-8 text-center md:hidden">
          <Link className="bm-btn bm-btn-outline w-full" to="/akun" search={{}}>
            See all accounts <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Game Catalog Section */}
      <section id="game" className="bm-section--full">
        <div className="bm-section-head">
          <div>
            <span className="text-xs font-semibold tracking-wider text-sky-400 uppercase">
              Games
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">Choose Your Battlefield</h2>
          </div>
          <Link to="/games" className="bm-text-link">
            All games <ArrowUpRight />
          </Link>
        </div>
        <div className="bm-cards bm-cards--4">
          {games.map((g) => (
            <Link key={g.slug} to="/akun" search={{ game: g.slug }} className="bm-card group">
              <div className="bm-card-img">
                <img
                  src={g.image}
                  alt={g.imageAlt}
                  width={928}
                  height={720}
                  loading="lazy"
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="bm-card-body">
                <span className="text-xs text-muted-foreground">{g.genre}</span>
                <h3 className="font-semibold text-base text-foreground mt-1">{g.name}</h3>
                <span className="bm-text-link mt-auto pt-3 text-sky-400">
                  Explore accounts <ArrowUpRight />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Security Pillars Section */}
      <section className="bm-section--full bg-secondary/20">
        <div className="bm-section-head mb-8">
          <div>
            <span className="text-xs font-semibold tracking-wider text-sky-400 uppercase">
              Trust & Safety
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">Why Players Trade with BlueMask</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-lg bg-sky-950/60 border border-sky-800/40 flex items-center justify-center text-sky-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-2">Escrow Middleman</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We hold the account credentials and payment until both buyer and seller verify full
              delivery. No unauthorized releases.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-2">Verified Ownership</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every listed account undergoes credential inspection, binding email checks, and VIP
              status verification before listing.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-2">Direct Discord Concierge</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Live human coordination on Discord. Fast turnarounds on Whiteout Survival, Kingshot,
              and strategy game transfers.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bm-section--full">
        <div className="bm-section-head">
          <div>
            <span className="text-xs font-semibold tracking-wider text-sky-400 uppercase">
              Reviews
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">From Players Who Traded With Us</h2>
          </div>
        </div>
        <HomeTestimonials />
      </section>

      {/* FAQ Section */}
      <section className="bm-section--full">
        <div className="bm-section-head">
          <div>
            <span className="text-xs font-semibold tracking-wider text-sky-400 uppercase">
              Support
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">Frequently Asked Questions</h2>
          </div>
        </div>
        <div className="max-w-3xl">
          {faqs.map((f, i) => (
            <div key={f.q} className="border-b border-border/40 py-5">
              <button
                className="flex w-full items-center justify-between text-left font-semibold text-foreground hover:text-primary transition-colors"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                {f.q}
                <span className="ml-4 text-sky-400">{openIndex === i ? "—" : "+"}</span>
              </button>
              {openIndex === i && (
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
