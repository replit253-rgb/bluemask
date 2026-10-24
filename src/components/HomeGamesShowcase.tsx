import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { defaultGameArtwork } from "@/lib/catalog";
import {
  getHomeGamesConfig,
  DEFAULT_HOME_GAMES_CONFIG,
  type HomeGamesSectionConfig,
  type HomeGameCard,
} from "@/lib/home-games";

interface HomeGamesShowcaseProps {
  /** Optional custom config for live preview in admin */
  config?: HomeGamesSectionConfig;
  /** In preview mode, clicks don't navigate */
  previewMode?: boolean;
}

export function HomeGamesShowcase({
  config: propConfig,
  previewMode = false,
}: HomeGamesShowcaseProps) {
  const [config, setConfig] = useState<HomeGamesSectionConfig>(
    () => propConfig || DEFAULT_HOME_GAMES_CONFIG,
  );

  useEffect(() => {
    if (propConfig) {
      setConfig(propConfig);
      return;
    }

    let isMounted = true;
    const handleUpdate = () => {
      void getHomeGamesConfig().then(
        (data) => {
          if (isMounted) setConfig(data);
        },
        (error: unknown) => {
          console.error("Failed to load home games from PostgreSQL:", error);
        },
      );
    };

    handleUpdate();
    window.addEventListener("home-games-changed", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("home-games-changed", handleUpdate);
    };
  }, [propConfig]);

  return (
    <section id="games" className="bm-section--full">
      <div className="bm-section-head">
        <div>
          <span className="text-xs font-semibold tracking-wider text-red-500 uppercase">
            {config.eyebrow}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-1">{config.title}</h2>
        </div>
        {previewMode ? (
          <span className="bm-text-link text-xs cursor-pointer">
            {config.linkText} <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        ) : (
          <Link to="/games" className="bm-text-link">
            {config.linkText} <ArrowUpRight />
          </Link>
        )}
      </div>

      <div className="bm-cards bm-cards--4">
        {config.cards.map((g: HomeGameCard) => {
          const cardContent = (
            <>
              <div className="bm-card-img">
                <img
                  src={g.image}
                  alt={g.imageAlt}
                  width={928}
                  height={720}
                  loading="lazy"
                  className="transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = defaultGameArtwork;
                  }}
                />
              </div>
              <div className="bm-card-body">
                <span className="text-xs text-muted-foreground">{g.genre}</span>
                <h3 className="font-semibold text-base text-foreground mt-1">{g.name}</h3>
                <span className="bm-text-link mt-auto pt-3 text-red-500">
                  {g.actionText || "Explore accounts"} <ArrowUpRight />
                </span>
              </div>
            </>
          );

          if (previewMode) {
            return (
              <div
                key={g.slug || g.id}
                className="bm-card group cursor-pointer transition-transform hover:-translate-y-1"
                title={`Preview link: /accounts?game=${g.slug}`}
              >
                {cardContent}
              </div>
            );
          }

          return (
            <Link
              key={g.slug || g.id}
              to="/accounts"
              search={{ game: g.slug }}
              className="bm-card group"
            >
              {cardContent}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
