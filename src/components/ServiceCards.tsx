import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ShieldCheck, ShoppingBag, Zap } from "lucide-react";
import { gamesForService, services } from "@/lib/catalog";

const icons = { middleman: ShieldCheck, "jual-beli-akun": ShoppingBag, "top-up": Zap };
export function ServiceCards() {
  return (
    <div className="bm-services">
      {services.map((s) => {
        const Icon = icons[s.slug];
        return (
          <article key={s.slug} className="bm-service">
            <div className="bm-service-top">
              <div className="bm-service-icon-box">
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="font-semibold text-lg text-foreground mt-4 mb-2">{s.name}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">{s.intro}</p>
            <div className="bm-service-games">
              {gamesForService(s).map((g) => (
                <Link
                  key={g.slug}
                  to="/layanan/$service/$game"
                  params={{ service: s.slug, game: g.slug }}
                >
                  <span>{g.name}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
