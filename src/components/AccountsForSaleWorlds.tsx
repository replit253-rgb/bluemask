import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import {
  getGameWorldsConfig,
  type GameWorldSectionConfig,
  type GameWorldCard,
} from "@/lib/game-worlds";

function getServiceLink(serviceName: string, gameSlug: string) {
  const norm = serviceName.toLowerCase().trim();
  if (norm.includes("middleman") || norm.includes("rekber")) {
    return { to: "/services/$service/$game", params: { service: "middleman", game: gameSlug } };
  }
  if (
    norm.includes("buy") ||
    norm.includes("sell") ||
    norm.includes("jual") ||
    norm.includes("beli") ||
    norm.includes("account")
  ) {
    return {
      to: "/services/$service/$game",
      params: { service: "buy-sell-accounts", game: gameSlug },
    };
  }
  if (norm.includes("top") || norm.includes("up")) {
    return { to: "/services/$service/$game", params: { service: "top-up", game: gameSlug } };
  }
  return { to: "/accounts", search: { game: gameSlug } };
}

interface AccountsForSaleWorldsProps {
  /** Optional override config for live preview */
  config?: GameWorldSectionConfig;
  /** Whether links should be active navigation or preview-only */
  previewMode?: boolean;
}

export function AccountsForSaleWorlds({
  config: propConfig,
  previewMode = false,
}: AccountsForSaleWorldsProps) {
  const [config, setConfig] = useState<GameWorldSectionConfig>(
    () => propConfig || getGameWorldsConfig(),
  );

  useEffect(() => {
    if (propConfig) {
      setConfig(propConfig);
      return;
    }

    const handleUpdate = () => {
      setConfig(getGameWorldsConfig());
    };

    window.addEventListener("game-worlds-changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("game-worlds-changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [propConfig]);

  return (
    <section className="bm-section">
      <span className="bm-eyebrow">{config.eyebrow}</span>
      <h1 className="bm-page-title">{config.title}</h1>
      <p className="bm-lead">{config.subtitle}</p>

      <div className="bm-cards bm-cards--4">
        {config.cards.map((g: GameWorldCard) => (
          <article key={g.slug || g.id} className="bm-card">
            <div className="bm-card-img">
              <img
                src={g.image}
                alt={g.imageAlt || g.name}
                width={928}
                height={720}
                loading="lazy"
                onError={(e) => {
                  // Fallback if custom image fails to load
                  (e.target as HTMLImageElement).src = "/assets/game-whiteout.jpg";
                }}
              />
              <span className="bm-card-badge bm-mono">{g.number}</span>
            </div>
            <div className="bm-card-body">
              <span className="bm-mono bm-card-meta">{g.genre}</span>
              <h3>{g.name}</h3>
              <div className="bm-service-games">
                {g.services.map((svcName) => {
                  const linkTarget = getServiceLink(svcName, g.slug);
                  if (previewMode) {
                    return (
                      <span
                        key={svcName}
                        className="flex justify-between items-center text-xs py-2 text-muted-foreground hover:text-red-400 cursor-pointer"
                        title="Live preview service link"
                      >
                        <span>{svcName}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    );
                  }
                  if ("params" in linkTarget) {
                    return (
                      <Link
                        key={svcName}
                        to={linkTarget.to as "/services/$service/$game"}
                        params={linkTarget.params}
                      >
                        {svcName}
                        <ArrowUpRight />
                      </Link>
                    );
                  }
                  return (
                    <Link
                      key={svcName}
                      to={linkTarget.to as "/accounts"}
                      search={linkTarget.search}
                    >
                      {svcName}
                      <ArrowUpRight />
                    </Link>
                  );
                })}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
