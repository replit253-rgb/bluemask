import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ShieldCheck, ShoppingBag, Zap } from "lucide-react";
import { gamesForService, services } from "@/lib/catalog";

const icons = { middleman: ShieldCheck, "jual-beli-akun": ShoppingBag, "top-up": Zap };
export function ServiceCards() {
  return <div className="bm-services">{services.map((s, i) => {
    const Icon = icons[s.slug];
    return <article key={s.slug} className="bm-service"><div className="bm-service-top"><Icon /><span className="bm-mono">0{i + 1}</span></div><h3>{s.name}</h3><p>{s.intro}</p><div className="bm-service-games">{gamesForService(s).map(g => <Link key={g.slug} to="/layanan/$service/$game" params={{ service: s.slug, game: g.slug }}>{g.name}<ArrowUpRight /></Link>)}</div></article>;
  })}</div>;
}