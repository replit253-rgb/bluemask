import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, SlidersHorizontal, ArrowUpDown, ArrowUpRight } from "lucide-react";
import { games } from "@/lib/catalog";
import { getEffectivePrice, type Product } from "@/lib/products";
import { getProductsFromDB } from "@/lib/db";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { ProductGrid } from "@/components/Products";

type SearchParams = {
  game?: string | undefined;
  sort?: string | undefined;
  status?: string | undefined;
  q?: string | undefined;
};

export const Route = createFileRoute("/accounts/")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    game: typeof s["game"] === "string" ? s["game"] : undefined,
    sort: typeof s["sort"] === "string" ? s["sort"] : undefined,
    status: typeof s["status"] === "string" ? s["status"] : undefined,
    q: typeof s["q"] === "string" ? s["q"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Accounts for Sale — RedMoon Gaming Store" },
      {
        name: "description",
        content:
          "Ready-to-play Whiteout Survival, Kingshot, Rise of Kingdoms, and Call of Dragons accounts. Pick one and order on Discord.",
      },
      { property: "og:title", content: "Accounts for Sale — RedMoon" },
      {
        property: "og:description",
        content: "Pick the strategy game account you want and order on Discord.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountsPage,
});

function AccountsPage() {
  const { game, sort = "default", status = "all", q = "" } = Route.useSearch();
  const [productList, setProductList] = useState<Product[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [searchTerm, setSearchTerm] = useState(q);

  useEffect(() => {
    const loadProducts = () => {
      setHasLoaded(false);
      setLoadError(false);
      void getProductsFromDB().then(
        (items) => {
          setProductList(items);
          setHasLoaded(true);
        },
        (error: unknown) => {
          console.error("Failed to load accounts from PostgreSQL:", error);
          setProductList([]);
          setHasLoaded(true);
          setLoadError(true);
        },
      );
    };
    loadProducts();

    const handleProductsChange = () => {
      loadProducts();
    };
    window.addEventListener("products-changed", handleProductsChange);
    return () => window.removeEventListener("products-changed", handleProductsChange);
  }, []);

  // Filter by game, status, search query
  let items = productList.filter((p) => {
    if (game && p.game !== game) return false;
    if (status && status !== "all" && p.status !== status) return false;
    if (q && q.trim().length > 0) {
      const query = q.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(query);
      const matchCode = p.code.toLowerCase().includes(query);
      const matchBadge = p.badge.toLowerCase().includes(query);
      const matchServer = p.server?.toLowerCase().includes(query) || false;
      if (!matchTitle && !matchCode && !matchBadge && !matchServer) return false;
    }
    return true;
  });

  // Sort by price or default
  items = [...items].sort((a, b) => {
    const priceA = getEffectivePrice(a);
    const priceB = getEffectivePrice(b);
    if (sort === "price-asc") return priceA - priceB;
    if (sort === "price-desc") return priceB - priceA;
    return 0;
  });

  return (
    <main className="bm">
      <SiteHeader />
      <section className="bm-detail-hero">
        <div className="bm-hero-meta bm-mono">
          <Link to="/">← Index</Link>
          <span>Accounts for Sale</span>
          <span>{items.length} listings</span>
        </div>
        <h1 className="bm-detail-title">
          Accounts<span>Ready to Play</span>
        </h1>
      </section>

      {/* Choose Your Battlefield Section matching user screenshot */}
      {!game && (
        <section className="bm-section">
          <div className="bm-section-head mb-8">
            <span className="bm-mono text-red-500">CHOOSE YOUR BATTLEFIELD</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Explore Battlefields & Games
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((g) => {
              const isSelected = game === g.slug;
              return (
                <a
                  key={g.slug}
                  href={`/accounts?game=${g.slug}#inventory`}
                  className={`group relative flex flex-col justify-between rounded-2xl overflow-hidden border transition-all duration-300 ${
                    isSelected
                      ? "bg-[#220a11] border-red-500 shadow-xl shadow-red-950/60 ring-2 ring-red-500"
                      : "bg-[#14060a] border-red-950/80 hover:border-red-500/50 hover:bg-[#1d0910]"
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                    <img
                      src={g.image}
                      alt={g.imageAlt}
                      width={800}
                      height={600}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14060a] via-transparent to-transparent opacity-80" />
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-mono font-bold text-red-300 border border-red-900/60">
                      {g.number}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
                    <div>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">
                        {g.genre}
                      </span>
                      <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                        {g.name}
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-red-950/80 flex items-center justify-between text-xs font-bold text-red-400 group-hover:text-red-300">
                      <span>Explore accounts</span>
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Filters & Inventory Section */}
      <section id="inventory" className="bm-section border-t border-red-950/80 pt-12">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-white">
              {game
                ? `${games.find((g) => g.slug === game)?.name || game} Accounts`
                : "All Account Listings"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {hasLoaded
                ? `Showing ${items.length} account listings.`
                : "Loading account listings from PostgreSQL..."}
            </p>
          </div>

          {game && (
            <Link
              to="/accounts"
              search={{ game: undefined, sort, status, q }}
              className="text-xs font-semibold text-red-400 hover:text-red-300 underline underline-offset-4 self-start md:self-auto"
            >
              ← Clear game filter (Show all)
            </Link>
          )}
        </div>

        {/* Search & Sorting Toolbar */}
        <div className="mb-8 p-4 rounded-xl bg-[#14060a] border border-red-950/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  window.location.href = `/accounts?${new URLSearchParams({
                    ...(game ? { game } : {}),
                    ...(sort ? { sort } : {}),
                    ...(status ? { status } : {}),
                    ...(searchTerm ? { q: searchTerm } : {}),
                  }).toString()}`;
                }
              }}
              placeholder="Search by code, server, or keyword..."
              className="w-full bg-[#0b0305] border border-red-950/80 rounded-lg pl-9 pr-24 py-2 text-xs text-white placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={() => {
                window.location.href = `/accounts?${new URLSearchParams({
                  ...(game ? { game } : {}),
                  ...(sort ? { sort } : {}),
                  ...(status ? { status } : {}),
                  ...(searchTerm ? { q: searchTerm } : {}),
                }).toString()}`;
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 bg-red-600 text-white text-[11px] font-semibold rounded-md hover:bg-red-500 shadow-md shadow-red-950/50"
            >
              Search
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort by:
              </span>
              <select
                value={sort}
                onChange={(e) => {
                  const newSort = e.target.value;
                  window.location.href = `/accounts?${new URLSearchParams({
                    ...(game ? { game } : {}),
                    sort: newSort,
                    ...(status ? { status } : {}),
                    ...(q ? { q } : {}),
                  }).toString()}`;
                }}
                className="bg-[#0b0305] border border-red-950/80 rounded-lg px-3 py-1.5 text-xs text-white font-semibold"
              >
                <option value="default">Default Order</option>
                <option value="price-asc">Lowest Price (Ascending)</option>
                <option value="price-desc">Highest Price (Descending)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Status:
              </span>
              <select
                value={status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  window.location.href = `/accounts?${new URLSearchParams({
                    ...(game ? { game } : {}),
                    ...(sort ? { sort } : {}),
                    status: newStatus,
                    ...(q ? { q } : {}),
                  }).toString()}`;
                }}
                className="bg-[#0b0305] border border-red-950/80 rounded-lg px-3 py-1.5 text-xs text-white font-semibold"
              >
                <option value="all">All Status</option>
                <option value="tersedia">Available</option>
                <option value="terjual">Sold Out</option>
              </select>
            </div>
          </div>
        </div>

        {!hasLoaded ? (
          <p className="bm-lead">Loading account listings...</p>
        ) : loadError ? (
          <p className="bm-lead text-red-400" role="alert">
            Unable to load account listings from PostgreSQL. Please refresh and try again.
          </p>
        ) : (
          <ProductGrid items={items} />
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
