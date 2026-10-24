import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { defaultGameArtwork } from "@/lib/catalog";
import {
  getGameWorldsConfig,
  DEFAULT_GAME_WORLDS_CONFIG,
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
    () => propConfig || DEFAULT_GAME_WORLDS_CONFIG,
  );

  useEffect(() => {
    if (propConfig) {
      setConfig(propConfig);
      return;
    }

    let isMounted = true;
    const handleUpdate = () => {
      void getGameWorldsConfig().then(
        (data) => {
          if (isMounted) setConfig(data);
        },
        (error: unknown) => {
          console.error("Failed to load game worlds from PostgreSQL:", error);
        },
      );
    };

    handleUpdate();
    window.addEventListener("game-worlds-changed", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("game-worlds-changed", handleUpdate);
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
                  e.currentTarget.src = defaultGameArtwork;
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
