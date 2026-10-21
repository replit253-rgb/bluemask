import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { discordLink } from "@/lib/catalog";
import { formatRupiah } from "@/lib/products";
import { topUpMessage, type TopUpPackage } from "@/lib/topup";

function TopUpCard({ p }: { p: TopUpPackage }) {
  const [copied, setCopied] = useState(false);
  const bgImg = p.popular
    ? "/src/assets/images/chest_treasure_gold_1792579173076.jpg"
    : "/src/assets/images/chest_wooden_loot_1792579173425.jpg";
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
        {p.code}
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
  if (items.length === 0)
    return <p className="bm-lead">No packs for this game yet. Ask us on Discord.</p>;
  return (
    <>
      <div className="bm-topups">
        {items.map((p) => (
          <TopUpCard key={p.code} p={p} />
        ))}
      </div>
      <p className="bm-mono bm-topup-note">
        Sample prices only. Confirm the current price on Discord before ordering.
      </p>
    </>
  );
}
