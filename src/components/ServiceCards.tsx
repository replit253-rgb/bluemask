import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ShieldCheck, ShoppingBag, Zap, type LucideIcon } from "lucide-react";
import { games, gamesForService, services, type Service } from "@/lib/catalog";
import { getServicesFromDB } from "@/lib/db";

const icons: Record<string, LucideIcon> = {
  middleman: ShieldCheck,
  "buy-sell-accounts": ShoppingBag,
  "jual-beli-akun": ShoppingBag,
  "top-up": Zap,
};

export function ServiceCards() {
  const [serviceList, setServiceList] = useState<Service[]>(services);

  useEffect(() => {
    let isMounted = true;
    void getServicesFromDB().then(
      (storedServices) => {
        if (!isMounted) return;
        setServiceList(
          storedServices.map((service) => {
            const catalogService = services.find((item) => item.slug === service.slug);
            return {
              ...catalogService,
              ...service,
              gameSlugs: service.gameSlugs ?? catalogService?.gameSlugs,
            };
          }),
        );
      },
      (error: unknown) => console.error("Failed to load services from PostgreSQL:", error),
    );

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bm-services">
      {serviceList.map((s) => {
        const Icon = icons[s.slug] || ShieldCheck;
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
            {(s.slug === "buy-sell-accounts" ||
              s.slug === "jual-beli-akun" ||
              s.slug === "top-up") && (
              <>
                <div className="bm-service-artwork" aria-hidden="true">
                  {games.map((game) => (
                    <img key={game.slug} src={game.image} alt="" loading="lazy" />
                  ))}
                </div>
                {s.slug === "top-up" && (
                  <p className="bm-service-artwork-note">
                    Top-up availability is shown in the game links below.
                  </p>
                )}
              </>
            )}
            <div className="bm-service-games">
              {gamesForService(s).map((g) => (
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
