import { useEffect, useState } from "react";
import { Lock, ShieldCheck, Zap } from "lucide-react";
import {
  DEFAULT_TRUST_SAFETY_CONFIG,
  getTrustSafetyConfig,
  type TrustSafetyConfig,
  type TrustSafetyIcon,
} from "@/lib/trust-safety";

const iconStyles: Record<TrustSafetyIcon, string> = {
  shield: "bg-red-950/60 border-red-800/40 text-red-500",
  lock: "bg-emerald-950/60 border-emerald-800/40 text-emerald-400",
  zap: "bg-amber-950/60 border-amber-800/40 text-amber-400",
};

const icons = {
  shield: ShieldCheck,
  lock: Lock,
  zap: Zap,
};

interface TrustSafetySectionProps {
  config?: TrustSafetyConfig;
  previewMode?: boolean;
}

export function TrustSafetySection({ config: previewConfig }: TrustSafetySectionProps) {
  const [config, setConfig] = useState<TrustSafetyConfig>(DEFAULT_TRUST_SAFETY_CONFIG);

  useEffect(() => {
    if (previewConfig) {
      setConfig(previewConfig);
      return;
    }

    let isMounted = true;
    const loadConfig = () => {
      void getTrustSafetyConfig().then(
        (data) => {
          if (isMounted) setConfig(data);
        },
        (error: unknown) => {
          console.error("Failed to load Trust & Safety content:", error);
        },
      );
    };

    loadConfig();
    window.addEventListener("trust-safety-changed", loadConfig);
    return () => {
      isMounted = false;
      window.removeEventListener("trust-safety-changed", loadConfig);
    };
  }, [previewConfig]);

  return (
    <section className="bm-section--full bg-secondary/20">
      <div className="bm-section-head mb-8">
        <div>
          <span className="text-xs font-semibold tracking-wider text-red-500 uppercase">
            {config.eyebrow}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-1">{config.title}</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {config.cards.map((card) => {
          const Icon = icons[card.icon];
          return (
            <div
              key={card.id}
              className="p-6 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm"
            >
              <div
                className={`w-10 h-10 rounded-lg border flex items-center justify-center mb-4 ${iconStyles[card.icon]}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
