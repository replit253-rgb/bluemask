import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check } from "lucide-react";
import { discordLink, findGame } from "@/lib/catalog";
import { formatRupiah, orderMessage, type Product } from "@/lib/products";

export function ProductCard({ p }: { p: Product }) {
  const game = findGame(p.game);
  if (!game) return null;
  const sold = p.status === "terjual";
  return (
    <Link to="/akun/$code" params={{ code: p.code }} className={`bm-card${sold ? " bm-card--sold" : ""}`}>
      <div className="bm-card-img">
        <img src={game.image} alt={game.imageAlt} width={1024} height={768} loading="lazy" />
        <span className="bm-card-badge bm-mono">{p.badge}</span>
        {sold && <span className="bm-card-sold bm-mono">Sold</span>}
      </div>
      <div className="bm-card-body">
        <span className="bm-mono bm-card-meta">{game.name} · {p.code}</span>
        <h3>{p.title}</h3>
        <div className="bm-card-foot">
          <strong>{formatRupiah(p.price)}</strong>
          <ArrowUpRight aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}

export function ProductGrid({ items }: { items: Product[] }) {
  if (items.length === 0) return <p className="bm-lead">No accounts for this game yet. Ask about new stock on Discord.</p>;
  return (
    <div className="bm-cards">
      {items.map((p) => <ProductCard key={p.code} p={p} />)}
    </div>
  );
}

/** Copy the order message, then open Discord. */
export function OrderButton({ p }: { p: Product }) {
  const [copied, setCopied] = useState(false);
  if (p.status === "terjual") {
    return <a className="bm-pill bm-pill--ghost" href={discordLink} target="_blank" rel="noreferrer">Ask about similar accounts <ArrowUpRight aria-hidden="true" /></a>;
  }
  return (
    <a
      className="bm-pill"
      href={discordLink}
      target="_blank"
      rel="noreferrer"
      onClick={() => {
        navigator.clipboard?.writeText(orderMessage(p)).then(() => setCopied(true)).catch(() => {});
      }}
    >
      {copied ? <>Order copied — paste it on Discord <Check aria-hidden="true" /></> : <>Order via Discord <ArrowUpRight aria-hidden="true" /></>}
    </a>
  );
}
