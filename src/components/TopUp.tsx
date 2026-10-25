import { useEffect, useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Check,
  Package,
  Sparkles,
  Crown,
  X,
  Clock,
  ShieldCheck,
  Info,
  Copy,
} from "lucide-react";
import { findGame } from "@/lib/catalog";
import { formatCurrency } from "@/lib/products";
import { useStoreSettings } from "@/hooks/use-store-settings";
import {
  topUpMessage,
  type TopUpPackage,
  GAME_TOPUP_CATEGORIES,
  enrichTopUpDetails,
  getTopUpEffectivePrice,
} from "@/lib/topup";
import { getTopUpsFromDB } from "@/lib/db";
import { Pagination } from "./Pagination";

export function TopUpCard({
  p,
  onOpenDetail,
}: {
  p: TopUpPackage;
  onOpenDetail?: (pack: TopUpPackage) => void;
}) {
  const [copied, setCopied] = useState(false);
  const { discordLink } = useStoreSettings();
  const diamondImage =
    p.game === "kingshot"
      ? "/diamond-2.png"
      : p.game === "whiteout-survival"
        ? "/diamond-1.png"
        : undefined;

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-xl p-3 sm:p-4 transition-all duration-300 border text-foreground ${
        p.popular
          ? "bg-[#18050b] border-red-500/50 shadow-lg shadow-red-950/40 hover:border-red-400 hover:shadow-red-500/20"
          : "bg-[#0c0407] border-red-950/60 hover:border-red-500/40 hover:bg-[#14060a]"
      }`}
    >
      {/* Popular Badge */}
      {p.popular && (
        <div className="absolute top-2 right-2.5 z-10 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 text-[9px] font-extrabold uppercase tracking-wider shadow">
          Best Seller
        </div>
      )}

      {/* Package image */}
      <Link
        to="/services/$service/$game/$code"
        params={{ service: "top-up", game: p.game, code: p.code }}
        onClick={(e) => {
          if (onOpenDetail) {
            e.preventDefault();
            onOpenDetail(p);
          }
        }}
        className="-mx-3 -mt-3 mb-3 block cursor-pointer sm:-mx-4 sm:-mt-4 group/img"
        title={`View ${p.name} details`}
      >
        <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-[#18050b]">
          {p.image ? (
            <img
              src={p.image}
              alt={p.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover/img:scale-105"
            />
          ) : (
            <Package className="w-10 h-10 text-red-400/70" aria-label="No package image" />
          )}
        </div>
      </Link>

      {/* Pack Info */}
      <div className="text-center space-y-1 mb-2">
        <Link
          to="/services/$service/$game/$code"
          params={{ service: "top-up", game: p.game, code: p.code }}
          onClick={(e) => {
            if (onOpenDetail) {
              e.preventDefault();
              onOpenDetail(p);
            }
          }}
          className="font-bold text-xs sm:text-sm text-white tracking-tight line-clamp-1 hover:text-red-400 transition-colors block w-full text-center cursor-pointer"
        >
          {p.name}
        </Link>
        <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-2 min-h-[26px] leading-relaxed">
          {p.detail}
        </p>
        {typeof p.diamonds === "number" && p.diamonds > 0 && diamondImage && (
          <div className="inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-cyan-100">
            <img src={diamondImage} alt="" className="h-6 w-6 object-contain" />
            <span>{p.diamonds.toLocaleString("en-US")} Diamonds</span>
          </div>
        )}
      </div>

      {/* Quick Action row: View Detail link */}
      <div className="text-center pb-2">
        <Link
          to="/services/$service/$game/$code"
          params={{ service: "top-up", game: p.game, code: p.code }}
          onClick={(e) => {
            if (onOpenDetail) {
              e.preventDefault();
              onOpenDetail(p);
            }
          }}
          className="text-[10px] sm:text-[11px] font-semibold text-red-400 hover:text-red-300 hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <Info className="w-3 h-3" /> View Detail
        </Link>
      </div>

      {/* Footer / Price & Order Button */}
      <div className="pt-2 border-t border-red-950/60 flex items-center justify-between gap-2">
        <div>
          <span className="text-[9px] uppercase font-mono text-slate-400 block -mb-0.5">Price</span>
          {p.hasDiscount && p.discountPercent ? (
            <div className="flex flex-col">
              <strong className="text-sm sm:text-base font-black text-white tabular-nums tracking-tight">
                {formatCurrency(getTopUpEffectivePrice(p))}
              </strong>
              <span className="text-[10px] text-slate-400 line-through tabular-nums">
                {formatCurrency(p.price)}
              </span>
            </div>
          ) : (
            <strong className="text-sm sm:text-base font-black text-white tabular-nums tracking-tight">
              {formatCurrency(p.price)}
            </strong>
          )}
        </div>
        {p.hasDiscount && p.discountPercent && (
          <span className="absolute top-2 left-2 z-10 rounded-full bg-rose-600 px-2 py-1 text-[10px] font-black text-white">
            {p.discountPercent}% OFF
          </span>
        )}

        <a
          href={discordLink}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            navigator.clipboard
              ?.writeText(topUpMessage(p))
              .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              })
              .catch(() => {});
          }}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-all ${
            copied
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
              : "bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-600/30 group-hover:translate-x-0.5"
          }`}
        >
          {copied ? (
            <>
              Copied <Check className="w-3 h-3" />
            </>
          ) : (
            <>
              Order <ArrowUpRight className="w-3 h-3" />
            </>
          )}
        </a>
      </div>
    </div>
  );
}

// Product Detail Modal Component
export function TopUpProductDetailModal({
  pack,
  onClose,
}: {
  pack: TopUpPackage;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const { discordLink } = useStoreSettings();
  const game = findGame(pack.game);
  const diamondImage =
    pack.game === "kingshot"
      ? "/diamond-2.png"
      : pack.game === "whiteout-survival"
        ? "/diamond-1.png"
        : undefined;

  const handleOrder = () => {
    navigator.clipboard
      ?.writeText(topUpMessage(pack))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(() => {});
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0c0407] border border-red-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-red-950/80 bg-[#14060a]">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md bg-red-950/70 text-red-400 font-mono text-xs font-bold border border-red-500/30">
              {pack.code}
            </span>
            <span className="text-xs font-semibold text-slate-300">
              {game?.name || pack.game} · {pack.category || "Top-Up"}
            </span>
            {pack.popular && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-amber-950 text-[10px] font-black uppercase tracking-wider">
                Best Seller
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Image & Quick Specs */}
            <div className="md:col-span-5 flex flex-col items-center space-y-4">
              <div className="w-full aspect-square max-w-[220px] rounded-xl bg-[#18050b] border border-red-950/60 p-4 flex items-center justify-center shadow-inner">
                {pack.image ? (
                  <img
                    src={pack.image}
                    alt={pack.name}
                    className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(220,38,38,0.35)]"
                  />
                ) : (
                  <Package className="w-16 h-16 text-red-400/70" aria-label="No package image" />
                )}
              </div>

              {/* Quick Spec Tags */}
              <div className="w-full space-y-2">
                {typeof pack.diamonds === "number" && pack.diamonds > 0 && diamondImage && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#14060a] border border-red-950/80 text-xs text-slate-300">
                    <img src={diamondImage} alt="" className="w-6 h-6 object-contain" />
                    <span>Diamonds received</span>
                    <strong className="text-white ml-auto">
                      {" "}
                      {pack.diamonds.toLocaleString("en-US")}
                    </strong>
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#14060a] border border-red-950/80 text-xs text-slate-300">
                  <Clock className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Delivery: </span>
                  <strong className="text-white ml-auto">
                    {pack.deliveryTime || "5 - 15 Minutes"}
                  </strong>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#14060a] border border-red-950/80 text-xs text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Security: </span>
                  <strong className="text-emerald-300 ml-auto">Player ID Only</strong>
                </div>
              </div>
            </div>

            {/* Right Column: Title, Price, Description, Features, Instructions */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {pack.name}
                </h2>
                <p className="text-xs text-slate-400 mt-1">{pack.detail}</p>
              </div>

              {/* Price Banner */}
              <div className="p-3.5 rounded-xl bg-[#1a080d] border border-red-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">
                    {pack.hasDiscount ? "Discounted Price (USD)" : "Fixed Price (USD)"}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white tabular-nums">
                      {formatCurrency(getTopUpEffectivePrice(pack))}
                    </span>
                    {pack.hasDiscount && pack.discountPercent && (
                      <>
                        <span className="text-xs font-bold text-rose-400">
                          {pack.discountPercent}% OFF
                        </span>
                        <span className="text-sm text-slate-400 line-through tabular-nums">
                          {formatCurrency(pack.price)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  Verified In Stock
                </span>
              </div>

              {/* Detailed Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Product Description
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#14060a] p-3 rounded-lg border border-red-950/60">
                  {pack.description ||
                    `Official top up for ${game?.name || pack.game}. Fast transfer to your in-game player ID with 100% receipt assurance and zero risk to your account.`}
                </p>
              </div>

              {/* Included Items / Features */}
              {pack.features && pack.features.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Package Benefits & Included Items
                  </h4>
                  <ul className="space-y-1.5">
                    {pack.features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed"
                      >
                        <Check className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Instructions */}
              {pack.instructions && (
                <div className="p-3 rounded-lg bg-secondary/20 border border-red-950/60 text-xs text-slate-300 space-y-1">
                  <strong className="text-red-300 block font-semibold">How to Order:</strong>
                  <p className="text-slate-400 leading-relaxed">{pack.instructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-5 border-t border-red-950/80 bg-[#14060a] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Clicking Order copies your player ticket message to clipboard.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOrder}
              className="px-3 py-2 rounded-lg bg-secondary text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Order Info
                </>
              )}
            </button>

            <a
              href={discordLink}
              target="_blank"
              rel="noreferrer"
              onClick={handleOrder}
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              Order on Discord <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TopUpGrid({ gameSlug }: { gameSlug: string }) {
  const [activeItems, setActiveItems] = useState<TopUpPackage[]>([]);
  const [selectedPack, setSelectedPack] = useState<TopUpPackage | null>(null);

  const detectedGame = gameSlug;

  // Pre-configured menus for the game
  const defaultCategories = useMemo(
    () =>
      GAME_TOPUP_CATEGORIES[detectedGame] || [
        "Pack ID Top Up",
        detectedGame === "whiteout-survival" ? "Frost Star Pack" : "Kingdom Star Pack",
      ],
    [detectedGame],
  );

  const [activeCategory, setActiveCategory] = useState<string>(() => defaultCategories[0] || "all");
  const [page, setPage] = useState(1);
  const perPage = 12;

  useEffect(() => {
    let isMounted = true;
    const loadTopUps = () => {
      void getTopUpsFromDB().then(
        (dbItems) => {
          if (!isMounted) return;
          const storedItems = dbItems.map(enrichTopUpDetails);
          setActiveItems(
            detectedGame ? storedItems.filter((item) => item.game === detectedGame) : storedItems,
          );
        },
        (error: unknown) => {
          console.error("Failed to load top-up packages from PostgreSQL:", error);
        },
      );
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "bm_topups_updated") loadTopUps();
    };
    const refreshTimer = window.setInterval(loadTopUps, 15_000);

    loadTopUps();
    window.addEventListener("topups-changed", loadTopUps);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", loadTopUps);
    window.addEventListener("pageshow", loadTopUps);
    return () => {
      isMounted = false;
      window.clearInterval(refreshTimer);
      window.removeEventListener("topups-changed", loadTopUps);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", loadTopUps);
      window.removeEventListener("pageshow", loadTopUps);
    };
  }, [detectedGame]);

  // Ensure current category is valid
  useEffect(() => {
    if (
      defaultCategories.length > 0 &&
      !defaultCategories.includes(activeCategory) &&
      activeCategory !== "all"
    ) {
      setActiveCategory(defaultCategories[0] || "all");
    }
  }, [detectedGame, defaultCategories, activeCategory]);

  const filteredByCategory =
    activeCategory === "all"
      ? activeItems
      : activeItems.filter((i) => (i.category || defaultCategories[0]) === activeCategory);

  const total = filteredByCategory.length;
  const paginatedItems = filteredByCategory.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6">
      {/* 2 Top Up Menu Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
          {defaultCategories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setPage(1);
                }}
                className={`py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                  isActive
                    ? "bg-red-600 text-white shadow-red-600/30 ring-2 ring-red-400"
                    : "bg-[#14060a] text-slate-300 hover:bg-[#1f090f] hover:text-white border border-red-950/60"
                }`}
              >
                {cat === "Pack ID Top Up" && <Package className="w-4 h-4 text-red-300" />}
                {cat === "Frost Star Pack" && <Sparkles className="w-4 h-4 text-cyan-300" />}
                {cat === "Kingdom Star Pack" && <Crown className="w-4 h-4 text-amber-300" />}
                <span className="truncate">{cat}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            const next = activeCategory === "all" ? defaultCategories[0] || "all" : "all";
            setActiveCategory(next);
            setPage(1);
          }}
          className="text-xs text-slate-400 hover:text-white underline underline-offset-4 self-center sm:self-auto cursor-pointer"
        >
          {activeCategory === "all" ? "Show 2 Main Menus" : "View All Packages"}
        </button>
      </div>

      {/* Category Section Header Banner */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#14060a] rounded-xl border border-red-950/80 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center shrink-0">
          {activeCategory === "Frost Star Pack" ? (
            <Sparkles className="w-4 h-4 text-cyan-400" />
          ) : activeCategory === "Kingdom Star Pack" ? (
            <Crown className="w-4 h-4 text-amber-400" />
          ) : (
            <Package className="w-4 h-4 text-red-400" />
          )}
        </div>
        <div>
          <h3 className="font-bold text-sm sm:text-base text-white">
            {activeCategory === "all" ? "All Top-Up Packs" : activeCategory}
          </h3>
          <p className="text-[11px] text-slate-400">
            {activeCategory === "Frost Star Pack"
              ? "Account for Sale"
              : activeCategory === "Kingdom Star Pack"
                ? "Account for Sale"
                : "Account for Sale"}
          </p>
        </div>
        <span className="ml-auto text-xs font-mono text-slate-400 tabular-nums">
          {filteredByCategory.length} packs
        </span>
      </div>

      {/* Grid of Cards */}
      {paginatedItems.length === 0 ? (
        <div className="text-center py-12 bg-[#0c0407] rounded-2xl border border-red-950">
          <p className="text-slate-400 text-sm">
            No top-up packs found for {activeCategory}. You can add them in the admin panel or
            contact us on Discord.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {paginatedItems.map((p) => (
            <TopUpCard key={p.code} p={p} onOpenDetail={setSelectedPack} />
          ))}
        </div>
      )}

      {total > perPage && (
        <Pagination total={total} perPage={perPage} page={page} onChange={setPage} />
      )}

      <p className="text-xs text-slate-400 font-mono text-center pt-2">
        Click on any card to view full product details, specs, and requirements. Order via Discord
        ticket with verified middleman transfer.
      </p>
      {selectedPack && (
        <TopUpProductDetailModal pack={selectedPack} onClose={() => setSelectedPack(null)} />
      )}
    </div>
  );
}
