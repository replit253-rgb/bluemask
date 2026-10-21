import { useEffect, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { discordLink } from "@/lib/catalog";
import { formatRupiah } from "@/lib/products";
import { topUpMessage, type TopUpPackage } from "@/lib/topup";
import { getTopUpsFromDB } from "@/lib/db";
import { Pagination } from "./Pagination";

function TopUpCard({ p }: { p: TopUpPackage }) {
  const [copied, setCopied] = useState(false);
  const bgImg =
    p.image ||
    (p.popular
      ? "/src/assets/images/chest_treasure_gold_1792579173076.jpg"
      : "/src/assets/images/chest_wooden_loot_1792579173425.jpg");
  return (
    <a
      className={`bm-topup ${p.popular ? " bm-topup--pop" : ""}`}
      href={discordLink}
      target="_blank"
      rel="noreferrer"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${bgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={() => {
        navigator.clipboard
          ?.writeText(topUpMessage(p))
          .then(() => setCopied(true))
          .catch(() => {});
      }}
    >
      <span className="bm-mono bm-topup-meta">
        {p.code} {p.category ? `· ${p.category}` : ""}
        {p.popular && <em>Best seller</em>}
      </span>
      <h3>{p.name}</h3>
      <p>{p.detail}</p>
      <div className="bm-topup-foot">
        <strong>{formatRupiah(p.price)}</strong>
        <span className="bm-mono">
          {copied ? (
            <>
              Copied <Check aria-hidden="true" />
            </>
          ) : (
            <>
              Order <ArrowUpRight aria-hidden="true" />
            </>
          )}
        </span>
      </div>
    </a>
  );
}

export function TopUpGrid({ items }: { items: TopUpPackage[] }) {
  const [activeItems, setActiveItems] = useState<TopUpPackage[]>(items);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    getTopUpsFromDB().then((dbItems) => {
      if (items.length > 0 && items[0]?.game) {
        const game = items[0].game;
        const filtered = dbItems.filter((t) => t.game === game);
        if (filtered.length > 0) setActiveItems(filtered);
      } else if (dbItems.length > 0) {
        setActiveItems(dbItems);
      } else {
        setActiveItems(items);
      }
    });
  }, [items]);

  // Extract unique categories for this game
  const categories = Array.from(new Set(activeItems.map((i) => i.category || "General")));

  const filteredByCategory =
    activeCategory === "all"
      ? activeItems
      : activeItems.filter((i) => (i.category || "General") === activeCategory);

  const total = filteredByCategory.length;
  const paginatedItems = filteredByCategory.slice((page - 1) * perPage, page * perPage);

  if (activeItems.length === 0)
    return <p className="bm-lead">No packs for this game yet. Ask us on Discord.</p>;

  return (
    <div>
      {/* Category Tabs if multiple categories exist */}
      {categories.length > 1 && (
        <div className="flex items-center gap-2 mb-8 p-1.5 bg-secondary/30 rounded-xl border border-border/50 overflow-x-auto">
          <button
            onClick={() => {
              setActiveCategory("all");
              setPage(1);
            }}
            className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Packages ({activeItems.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setPage(1);
              }}
              className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat} ({activeItems.filter((i) => (i.category || "General") === cat).length})
            </button>
          ))}
        </div>
      )}

      <div className="bm-topups">
        {paginatedItems.map((p) => (
          <TopUpCard key={p.code} p={p} />
        ))}
      </div>

      <Pagination total={total} perPage={perPage} page={page} onChange={setPage} />

      <p className="bm-mono bm-topup-note mt-6">
        Sample prices only. Confirm the current price on Discord before ordering.
      </p>
    </div>
  );
}
