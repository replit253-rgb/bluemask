import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ShieldCheck, ShoppingBag, Zap, type LucideIcon } from "lucide-react";
import { findGame, type Service } from "@/lib/catalog";
import { getServicesFromDB } from "@/lib/db";
import { getHomeGamesConfig, type HomeGameCard } from "@/lib/home-games";

const icons: Record<string, LucideIcon> = {
  middleman: ShieldCheck,
  "buy-sell-accounts": ShoppingBag,
  "jual-beli-akun": ShoppingBag,
  "top-up": Zap,
};

export function ServiceCards() {
  const [serviceList, setServiceList] = useState<Service[]>([]);
  const [gameList, setGameList] = useState<HomeGameCard[]>([]);

  useEffect(() => {
    let isMounted = true;
    void Promise.all([getServicesFromDB(), getHomeGamesConfig()]).then(
      ([storedServices, homeGames]) => {
        if (!isMounted) return;
        setServiceList(storedServices);
        setGameList(homeGames.cards);
      },
      (error: unknown) => console.error("Failed to load service cards from PostgreSQL:", error),
    );

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bm-services">
      {serviceList.map((s) => {
        const Icon = icons[s.slug] || ShieldCheck;
        const serviceGames = s.gameSlugs
          ? gameList.filter((game) => s.gameSlugs?.some((slug) => slug === game.slug))
          : gameList;
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
              {serviceGames.map((g) => (
                <Link
                  key={g.slug}
                  to="/services/$service/$game"
                  params={{ service: s.slug, game: g.slug }}
                >
                  <span className="bm-service-game-label">
                    {findGame(g.slug) && (
                      <img
                        src={findGame(g.slug)?.image}
                        alt=""
                        aria-hidden="true"
                        className="bm-service-game-image"
                      />
                    )}
                    {g.name}
                  </span>
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
