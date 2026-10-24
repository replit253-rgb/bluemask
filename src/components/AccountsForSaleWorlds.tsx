import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { defaultGameArtwork } from "@/lib/catalog";
import { getGameWorldsFn } from "@/lib/pg-server-fn";
import {
  DEFAULT_GAME_WORLDS_CONFIG,
  type GameWorldSectionConfig,
  type GameWorldCard,
} from "@/lib/game-worlds";
import { getHomeGamesConfig } from "@/lib/home-games";

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

function homeGamesAsWorlds(homeGames: Awaited<ReturnType<typeof getHomeGamesConfig>>) {
  return homeGames.cards.map((game, index) => {
    const defaultWorld = DEFAULT_GAME_WORLDS_CONFIG.cards.find((world) => world.slug === game.slug);

    return {
      id: game.id,
      slug: game.slug,
      name: game.name,
      genre: game.genre,
      image: game.image,
      imageAlt: game.imageAlt,
      number: String(index + 1).padStart(2, "0"),
      services: defaultWorld?.services ?? [],
      accountPoints: defaultWorld?.accountPoints,
    };
  });
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
  const [config, setConfig] = useState<GameWorldSectionConfig | null>(() => propConfig ?? null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (propConfig) {
      setConfig(propConfig);
      return;
    }

    let isMounted = true;
    const handleUpdate = async () => {
      setLoadError(false);
      try {
        const [worlds, homeGames] = await Promise.all([getGameWorldsFn(), getHomeGamesConfig()]);
        if (!isMounted) return;

        const cards =
          worlds.cards.length > 0
            ? worlds.cards
            : homeGames.cards.length > 0
              ? homeGamesAsWorlds(homeGames)
              : worlds.configured
                ? []
                : DEFAULT_GAME_WORLDS_CONFIG.cards;

        setConfig({
          ...DEFAULT_GAME_WORLDS_CONFIG,
          eyebrow: worlds.eyebrow || DEFAULT_GAME_WORLDS_CONFIG.eyebrow,
          title: worlds.title || DEFAULT_GAME_WORLDS_CONFIG.title,
          subtitle: worlds.subtitle || DEFAULT_GAME_WORLDS_CONFIG.subtitle,
          cards,
        });
      } catch (error) {
        console.error("Failed to load game worlds from PostgreSQL:", error);
        if (isMounted) setLoadError(true);
      }
    };

    void handleUpdate();
    window.addEventListener("game-worlds-changed", handleUpdate);
    window.addEventListener("home-games-changed", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("game-worlds-changed", handleUpdate);
      window.removeEventListener("home-games-changed", handleUpdate);
    };
  }, [propConfig]);

  if (loadError) {
    return (
      <section className="bm-section" role="alert">
        <p className="bm-lead">Unable to load games. Please refresh and try again.</p>
      </section>
    );
  }

  if (!config) {
    return (
      <section className="bm-section" aria-busy="true">
        <p className="bm-lead">Loading games...</p>
      </section>
    );
  }

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
