import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Check,
  Clock,
  ShieldCheck,
  Sparkles,
  Copy,
  ChevronRight,
  Shield,
  Zap,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { discordLink, findGame, findService } from "@/lib/catalog";
import { formatCurrency } from "@/lib/products";
import {
  type TopUpPackage,
  findTopUpPackage,
  topUpForGame,
  topUpMessage,
  enrichTopUpDetails,
} from "@/lib/topup";
import { getTopUpsFromDB } from "@/lib/db";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { TopUpCard } from "@/components/TopUp";

export const Route = createFileRoute("/services/$service/$game/$code")({
  loader: ({ params }) => {
    const service = findService(params.service);
    const game = findGame(params.game);
    if (!service || !game) throw notFound();
    return {
      serviceSlug: service.slug,
      gameSlug: game.slug,
      code: params.code,
    };
  },
  head: ({ loaderData, params }) => {
    const code = loaderData?.code || params.code;
    const item = findTopUpPackage(code);
    const g = item ? findGame(item.game) : findGame(params.game);
    const title =
      item && g
        ? `${item.name} (${g.name}) — Top Up RedMoon`
        : `Top Up Pack ${code} — RedMoon Gaming Store`;
    const desc =
      item?.description ||
      `Top up ${item?.name || code} for ${g?.name || "your game"} safely in USD via RedMoon Discord ticket.`;
    const url = `/services/${params.service}/${params.game}/${params.code}`;

    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: TopUpDetailPage,
});

function TopUpDetailPage() {
  const { serviceSlug, gameSlug, code } = Route.useLoaderData();
  const service = findService(serviceSlug);
  const game = findGame(gameSlug);

  const [pack, setPack] = useState<TopUpPackage | undefined>(() => findTopUpPackage(code));
  const [allPacks, setAllPacks] = useState<TopUpPackage[]>(() =>
    game ? topUpForGame(game.slug) : [],
  );
  const [copied, setCopied] = useState(false);
  const [copiedTextOnly, setCopiedTextOnly] = useState(false);

  useEffect(() => {
    getTopUpsFromDB().then((list) => {
      if (list && list.length > 0) {
        const enriched = list.map(enrichTopUpDetails);
        const match = enriched.find((item) => item.code.toLowerCase() === code.toLowerCase());
        if (match) {
          setPack(match);
        }
        if (game) {
          const gameItems = enriched.filter((item) => item.game === game.slug);
          if (gameItems.length > 0) {
            setAllPacks(gameItems);
          }
        }
      }
    });
  }, [code, game]);

  if (!service || !game || !pack) {
    return (
      <main className="bm min-h-screen">
        <SiteHeader />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Top-Up Package Not Found</h1>
          <p className="text-sm text-slate-400">
            The requested top-up package <span className="font-mono text-red-400">{code}</span>{" "}
            could not be found or has been modified.
          </p>
          <div className="pt-4">
            <Link
              to="/services/$service/$game"
              params={{ service: "top-up", game: gameSlug }}
              className="bm-pill inline-flex items-center gap-1"
            >
              ← Back to {game?.name || "Game"} Top Up
            </Link>
          </div>
        </div>
        <SiteFooter />
      </main>
    );
  }

  const bgImg =
    pack.image ||
    (pack.popular
      ? "/src/assets/images/chest_treasure_gold_1792579173076.jpg"
      : "/src/assets/images/chest_magic_crystal_1792579173404.jpg");

  const message = topUpMessage(pack);

  const handleOrderDiscord = () => {
    navigator.clipboard?.writeText(message).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyOnly = () => {
    navigator.clipboard?.writeText(message).catch(() => {});
    setCopiedTextOnly(true);
    setTimeout(() => setCopiedTextOnly(false), 2500);
  };

  const relatedPacks = allPacks.filter((p) => p.code !== pack.code).slice(0, 4);

  return (
    <main className="bm min-h-screen">
      <SiteHeader />

      {/* Top Breadcrumb Navigation */}
      <section className="border-b border-red-950/80 bg-[#0c0407]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-mono text-slate-400 flex-wrap"
          >
            <Link to="/" className="hover:text-white transition-colors">
              Index
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <Link to="/services" className="hover:text-white transition-colors">
              Services
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <Link
              to="/services/$service/$game"
              params={{ service: "top-up", game: game.slug }}
              className="hover:text-red-400 text-slate-300 font-semibold transition-colors"
            >
              {game.name} Top Up
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-red-400 font-bold truncate max-w-[200px] sm:max-w-none">
              {pack.name}
            </span>
          </nav>
        </div>
      </section>

      {/* Product Detail Main Hero Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Visual Artwork & Trust Badges */}
          <div className="lg:col-span-5 space-y-5">
            <div className="relative rounded-2xl bg-gradient-to-b from-[#18050b] to-[#0c0407] border border-red-500/30 p-6 sm:p-8 flex flex-col items-center justify-center overflow-hidden shadow-2xl shadow-red-950/50">
              {/* Category & Best Seller Badges */}
              <div className="w-full flex items-center justify-between gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-red-950/80 text-red-300 border border-red-500/40">
                  {pack.category || "Pack ID Top Up"}
                </span>

                {pack.popular && (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 shadow">
                    Best Seller
                  </span>
                )}
              </div>

              {/* Pack Image with ambient lighting */}
              <div className="relative my-4 flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56">
                <div className="absolute inset-0 bg-red-500/15 rounded-full blur-2xl" />
                <img
                  src={bgImg}
                  alt={pack.name}
                  className="relative z-10 w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(220,38,38,0.45)]"
                />
              </div>

              {/* Sub-meta tag */}
              <div className="text-center pt-2">
                <span className="font-mono text-xs text-slate-400">
                  Package ID: <strong className="text-red-300">{pack.code}</strong>
                </span>
              </div>
            </div>

            {/* Quick Guarantees Box */}
            <div className="rounded-xl border border-red-950/80 bg-[#0c0407]/80 p-4 space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <Clock className="w-4 h-4 text-red-400 shrink-0" />
                <span>
                  Estimated Delivery:{" "}
                  <strong className="text-white">{pack.deliveryTime || "5 - 15 Minutes"}</strong>
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Verified Credentials & Anti-Ban Player ID Delivery</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Handled directly by official RedMoon team on Discord</span>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Specs, Bullet Points, and Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-bold uppercase text-red-400 tracking-wider">
                  {game.name}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-mono text-slate-400">{pack.detail}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {pack.name}
              </h1>
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/60 via-[#18050b] to-red-950/40 border border-red-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                  Official Price (USD)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
                    {formatCurrency(pack.price)}
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    Fair Price Guarantee
                  </span>
                </div>
              </div>

              {/* Order Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <a
                  href={discordLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={handleOrderDiscord}
                  className={`px-5 py-3 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
                    copied
                      ? "bg-emerald-500 text-white shadow-emerald-500/30 scale-102"
                      : "bg-red-600 text-white hover:bg-red-500 shadow-red-600/30 hover:shadow-red-500/40"
                  }`}
                >
                  {copied ? (
                    <>
                      Copied! Opening Discord <Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Order via Discord <ArrowUpRight className="w-4 h-4" />
                    </>
                  )}
                </a>

                <button
                  type="button"
                  onClick={handleCopyOnly}
                  className="px-3.5 py-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Copy ticket message"
                >
                  {copiedTextOnly ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Message
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Product Description */}
            <div className="space-y-3">
              <h2 className="text-sm font-mono font-bold text-red-400 uppercase tracking-wider">
                Product Description
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {pack.description ||
                  `Official top-up package for ${game.name}. Direct in-game delivery credited safely using your Player ID without requiring account password.`}
              </p>
            </div>

            {/* Included Items / Features Checklist */}
            {pack.features && pack.features.length > 0 && (
              <div className="space-y-3 pt-2">
                <h2 className="text-sm font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-400" /> Package Highlights & Benefits
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {pack.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0c0407] border border-red-950/90 text-xs sm:text-sm text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Instructions */}
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 space-y-2">
              <h3 className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-red-400" /> How to Order this Pack
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {pack.instructions ||
                  `Send your ${game.name} Player ID and State / Kingdom number when opening your ticket on the RedMoon Discord. Our staff will fulfill and verify your order within minutes.`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Process Section */}
      <section className="border-t border-red-950/80 bg-[#080204] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase text-red-400 tracking-wider">
              Safe & Guaranteed
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              How the Top-Up Process Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0c0407] border border-red-950/90 space-y-2">
              <span className="font-mono text-2xl font-black text-red-400/60 block">01</span>
              <h3 className="font-bold text-sm text-white">Click Order</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click the Order button above. Your ticket message is copied and Discord opens.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0407] border border-red-950/90 space-y-2">
              <span className="font-mono text-2xl font-black text-red-400/60 block">02</span>
              <h3 className="font-bold text-sm text-white">Paste in Ticket</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paste your message in the RedMoon Discord ticket with your Player ID and State.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0407] border border-red-950/90 space-y-2">
              <span className="font-mono text-2xl font-black text-red-400/60 block">03</span>
              <h3 className="font-bold text-sm text-white">Verified Payment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pay safely in USD via our verified transaction channels.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c0407] border border-red-950/90 space-y-2">
              <span className="font-mono text-2xl font-black text-red-400/60 block">04</span>
              <h3 className="font-bold text-sm text-white">Instant In-Game Delivery</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Packs and gems arrive directly in your account in 5–15 minutes with official
                receipt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Packs Section */}
      {relatedPacks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-red-950/80">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-mono uppercase text-red-400 tracking-wider">
                Explore More
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                More {game.name} Top-Up Packs
              </h2>
            </div>

            <Link
              to="/services/$service/$game"
              params={{ service: "top-up", game: game.slug }}
              className="text-xs font-bold text-red-400 hover:text-red-300 inline-flex items-center gap-1"
            >
              View All {game.name} Packs <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedPacks.map((p) => (
              <TopUpCard key={p.code} p={p} />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}
