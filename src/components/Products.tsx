import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check } from "lucide-react";
import { findGame } from "@/lib/catalog";
import { formatCurrency, getEffectivePrice, orderMessage, type Product } from "@/lib/products";
import { Pagination } from "./Pagination";
import { useStoreSettings } from "@/hooks/use-store-settings";

export function ProductCard({ p }: { p: Product }) {
  const game = findGame(p.game);
  if (!game) return null;
  const sold = p.status === "terjual";
  const hasDiscount = p.hasDiscount && p.discountPercent && p.discountPercent > 0;
  const effectivePrice = getEffectivePrice(p);

  return (
    <Link
      to="/accounts/$code"
      params={{ code: p.code }}
      className={`group block overflow-hidden ${sold ? "opacity-70" : ""}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-secondary">
        <img
          src={p.image || game.image}
          alt={game.imageAlt}
          width={800}
          height={600}
          loading="lazy"
          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
        />
        {hasDiscount && !sold && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-rose-600 text-white font-black text-xs uppercase tracking-wider shadow">
            -{p.discountPercent}% OFF
          </div>
        )}
        {sold && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center font-bold text-foreground uppercase tracking-wider text-xs">
            Sold Out
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
          <span>{game.name}</span>
          <span aria-hidden="true">/</span>
          <span>{p.badge}</span>
        </div>
        <h3 className="font-bold text-xs sm:text-sm text-foreground mt-1 leading-tight group-hover:text-primary transition-colors line-clamp-1">
          {p.title}
        </h3>
        <div className="flex items-baseline gap-2 mt-2">
          <strong className="text-sm sm:text-base font-bold tabular-nums text-foreground">
            {formatCurrency(effectivePrice)}
          </strong>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through tabular-nums">
              {formatCurrency(p.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductGrid({ items }: { items: Product[] }) {
  const [page, setPage] = useState(1);
  const perPage = 8;
  const total = items.length;
  const paginatedItems = items.slice((page - 1) * perPage, page * perPage);

  if (items.length === 0)
    return (
      <p className="bm-lead">No accounts for this game yet. Ask about new stock on Discord.</p>
    );

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {paginatedItems.map((p) => (
          <ProductCard key={p.code} p={p} />
        ))}
      </div>
      <Pagination total={total} perPage={perPage} page={page} onChange={setPage} />
    </>
  );
}

/** Copy the order message, then open Discord. */
export function OrderButton({ p }: { p: Product }) {
  const [copied, setCopied] = useState(false);
  const { discordLink } = useStoreSettings();
  if (p.status === "terjual") {
    return (
      <a className="bm-pill bm-pill--ghost" href={discordLink} target="_blank" rel="noreferrer">
        Ask about similar accounts <ArrowUpRight aria-hidden="true" />
      </a>
    );
  }
  return (
    <a
      className="bm-pill"
      href={discordLink}
      target="_blank"
      rel="noreferrer"
      onClick={() => {
        navigator.clipboard
          ?.writeText(orderMessage(p))
          .then(() => setCopied(true))
          .catch(() => {});
      }}
    >
      {copied ? (
        <>
          Order copied — paste it on Discord <Check aria-hidden="true" />
        </>
      ) : (
        <>
          Order via Discord <ArrowUpRight aria-hidden="true" />
        </>
      )}
    </a>
  );
}
