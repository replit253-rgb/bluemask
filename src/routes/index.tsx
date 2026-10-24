import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Lock, ShieldCheck, Zap, Clock, Tag, Award } from "lucide-react";
import { games } from "@/lib/catalog";
import { getFaqsFromDB, getPageFromDB, type FAQ, type PageContent } from "@/lib/db";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { HomeTestimonials } from "@/components/Testimonials";
import { ServiceCards } from "@/components/ServiceCards";
import { HomeGamesShowcase } from "@/components/HomeGamesShowcase";
import { FeaturedAccountsShowcase } from "@/components/FeaturedAccountsShowcase";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RedMoon — Game Accounts, Middleman & Top Up Terpercaya" },
      {
        name: "description",
        content:
          "Toko game terpercaya RedMoon — Jual beli akun game aman, top up termurah, dan jasa middleman/rekber untuk Whiteout Survival, Kingshot, Rise of Kingdoms, dan Call of Dragons.",
      },
      {
        property: "og:title",
        content: "RedMoon — Game Accounts, Middleman & Top Up Terpercaya",
      },
      {
        property: "og:description",
        content:
          "Beli dan jual akun game, top up termurah, dan jasa middleman terpercaya bergaransi di RedMoon.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://redmoon-shop.com/" },
      { property: "og:image", content: "https://redmoon-shop.com/logo.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "RedMoon — Game Accounts, Middleman & Top Up Terpercaya" },
      {
        name: "twitter:description",
        content:
          "Beli dan jual akun game, top up termurah, dan jasa middleman terpercaya bergaransi di RedMoon.",
      },
      { name: "twitter:image", content: "https://redmoon-shop.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "https://redmoon-shop.com/" }],
  }),
  component: Index,
});

function Index() {
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    getPageFromDB("home").then((p) => setPageContent(p));
    getFaqsFromDB().then(
      (items) => setFaqs(items),
      (error: unknown) => console.error("Failed to load FAQs from PostgreSQL:", error),
    );
  }, []);

  return (
    <main className="bm">
      <SiteHeader />

      {/* Hero Section */}
      <section className="bm-hero">
        <picture>
          <source
            media="(max-width: 768px)"
            srcSet={pageContent?.heroImageMobile || "/bg-hero-mobile.png"}
          />
          <img
            className="bm-hero-image"
            src={
              pageContent?.heroImage &&
              !pageContent.heroImage.includes("bg_fe70fe49.jpg") &&
              pageContent.heroImage !== "/bg-mobile.jpeg"
                ? pageContent.heroImage
                : "/bg-hero-deskrop.png"
            }
            alt="RedMoon"
            fetchPriority="high"
          />
        </picture>
        <div className="bm-hero-content">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-semibold mb-4 tracking-wide shadow-sm backdrop-blur-md">
            TRUSTED GAMING ACCOUNT MARKETPLACE
          </div>
          <h1 className="bm-hero-title">
            {pageContent?.heroTitle && !pageContent.heroTitle.includes("BlueMask") ? (
              pageContent.heroTitle
            ) : (
              <>
                Red<span className="text-red-500">Moon</span>
              </>
            )}
          </h1>

          {/* Social Proof / Rating Card in Hero */}
          <div className="flex items-center gap-3 mb-6 p-3 px-4 bg-card/90 border border-border/80 rounded-xl shadow-lg backdrop-blur-md w-fit">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>
            <div className="flex items-center gap-1 font-bold text-foreground text-sm">
              <span>4.9</span>
              <span className="text-xs text-muted-foreground font-normal">/ 5.0</span>
            </div>
            <span className="text-xs text-muted-foreground border-l border-border pl-3">
              340++ reviews
            </span>
          </div>

          <p className="bm-lead">
            {pageContent?.heroSubtitle
              ? pageContent.heroSubtitle
              : "Verified strategy game accounts, secure middleman escrow, and direct top-ups for competitive players."}
          </p>

          <div className="bm-hero-actions">
            <Button asChild className="bm-btn bm-btn-primary">
              <Link to="/accounts" search={{}}>
                Explore Accounts <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="bm-btn bm-btn-outline">
              <Link to="/services">
                Middleman & Services <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="bm-trust-ribbon">
            <span>
              <ShieldCheck className="w-4 h-4 text-red-500" /> Middleman Service
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

      {/* Main Home Highlights Display */}
      <section className="relative z-10 border-b border-border/40 bg-card/60 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4 p-5 rounded-xl border border-border/60 bg-card/80 hover:border-red-500/50 transition-all duration-200 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-500 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground mb-1">Lifetime Warranty</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Protection and support if any issue happens with your order.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl border border-border/60 bg-card/80 hover:border-emerald-500/50 transition-all duration-200 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground mb-1">Best Price</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Carefully reviewed listings to offer strong value and fair pricing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl border border-border/60 bg-card/80 hover:border-amber-500/50 transition-all duration-200 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground mb-1">4 Years Experience</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Trusted track record with 340++ satisfied gamers since 2022.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bm-section--full bm-section-services">
        <div className="bm-section-head">
          <div>
            <span className="text-xs font-semibold tracking-wider text-red-500 uppercase">
              Core Services
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">Middleman & Trading Services</h2>
          </div>
          <Link to="/services" className="bm-text-link">
            All services <ArrowUpRight />
          </Link>
        </div>
        <ServiceCards />
      </section>

      {/* Featured Accounts Section (Dynamic & Live Synced with Admin) */}
      <FeaturedAccountsShowcase />

      {/* Game Catalog Section (Dynamic & Live Synced with Admin) */}
      <HomeGamesShowcase />

      {/* Security Pillars Section */}
      <section className="bm-section--full bg-secondary/20">
        <div className="bm-section-head mb-8">
          <div>
            <span className="text-xs font-semibold tracking-wider text-red-500 uppercase">
              Trust & Safety
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">Why Players Trade with RedMoon</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-500 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-2">Middleman Service</h3>
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
            <span className="text-xs font-semibold tracking-wider text-red-500 uppercase">
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
            <span className="text-xs font-semibold tracking-wider text-red-500 uppercase">
              Support
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">Frequently Asked Questions</h2>
          </div>
        </div>
        <div className="max-w-3xl">
          {faqs.map((f, i) => (
            <div key={f.id} className="border-b border-border/40 py-5">
              <button
                className="flex w-full items-center justify-between text-left font-semibold text-foreground hover:text-primary transition-colors"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                {f.question}
                <span className="ml-4 text-red-500">{openIndex === i ? "—" : "+"}</span>
              </button>
              {openIndex === i && (
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
