import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ShieldCheck, ShoppingBag, Zap, type LucideIcon } from "lucide-react";
import type { Service } from "@/lib/catalog";
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
        const showsGameGallery =
          s.slug === "buy-sell-accounts" || s.slug === "jual-beli-akun" || s.slug === "top-up";
        return (
          <article key={s.slug} className="bm-service">
            <div className="bm-service-top">
              <div className="bm-service-icon-box overflow-hidden">
                {s.image ? (
                  <img
                    src={s.image}
                    alt={s.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
            </div>
            <h3 className="font-semibold text-lg text-foreground mt-4 mb-2">{s.name}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">{s.intro}</p>
            {showsGameGallery && (
              <div className="bm-service-artwork" aria-hidden="true">
                {gameList.map((game) => (
                  <img key={game.slug} src={game.image} alt="" loading="lazy" />
                ))}
              </div>
            )}
            <div className="bm-service-games">
              {serviceGames.map((g) => (
                <Link
                  key={g.slug}
                  to="/services/$service/$game"
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
