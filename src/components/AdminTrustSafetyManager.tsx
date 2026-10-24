import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrustSafetySection } from "@/components/TrustSafetySection";
import {
  DEFAULT_TRUST_SAFETY_CONFIG,
  getTrustSafetyConfig,
  saveTrustSafetyConfig,
  type TrustSafetyConfig,
  type TrustSafetyIcon,
} from "@/lib/trust-safety";

const iconOptions: { value: TrustSafetyIcon; label: string }[] = [
  { value: "shield", label: "Shield" },
  { value: "lock", label: "Lock" },
  { value: "zap", label: "Zap" },
];

export function AdminTrustSafetyManager() {
  const [config, setConfig] = useState<TrustSafetyConfig>(DEFAULT_TRUST_SAFETY_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    void getTrustSafetyConfig().then(
      (data) => {
        if (!isMounted) return;
        setConfig(data);
        setIsLoading(false);
      },
      (error: unknown) => {
        console.error("Failed to load Trust & Safety configuration:", error);
        if (!isMounted) return;
        setNotice("Unable to load component settings. Check the database connection.");
        setIsLoading(false);
      },
    );
    return () => {
      isMounted = false;
    };
  }, []);

  const updateCardText = (id: string, field: "title" | "description", value: string) => {
    setConfig((current) => ({
      ...current,
      cards: current.cards.map((card) => (card.id === id ? { ...card, [field]: value } : card)),
    }));
  };

  const updateCardIcon = (id: string, icon: TrustSafetyIcon) => {
    setConfig((current) => ({
      ...current,
      cards: current.cards.map((card) => (card.id === id ? { ...card, icon } : card)),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setNotice(null);
    try {
      await saveTrustSafetyConfig(config);
      setNotice("Trust & Safety component saved.");
    } catch (error) {
      console.error("Failed to save Trust & Safety configuration:", error);
      setNotice("Unable to save changes. Check the database connection.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Trust &amp; Safety</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Edit the homepage section, manage its cards, and preview changes before saving.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isLoading || isSaving}
          className="bm-btn bm-btn-primary"
        >
          <Save className="w-4 h-4 mr-1.5" />
          {isSaving ? "Saving…" : "Save Component"}
        </Button>
      </div>

      {notice && (
        <p
          role="status"
          className="rounded-lg border border-border/60 bg-card/60 px-4 py-3 text-sm"
        >
          {notice}
        </p>
      )}

      {isLoading ? (
        <p role="status" className="text-sm text-muted-foreground">
          Loading Trust &amp; Safety settings…
        </p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          <div className="space-y-5 rounded-2xl border border-border/70 bg-card/50 p-5">
            <div className="grid grid-cols-1 gap-4">
              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  Section label
                </span>
                <input
                  value={config.eyebrow}
                  onChange={(event) =>
                    setConfig((current) => ({ ...current, eyebrow: event.target.value }))
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  Section title
                </span>
                <input
                  value={config.title}
                  onChange={(event) =>
                    setConfig((current) => ({ ...current, title: event.target.value }))
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                />
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-border/50 pt-4">
              <h3 className="font-semibold">Content cards ({config.cards.length})</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setConfig((current) => ({
                    ...current,
                    cards: [
                      ...current.cards,
                      {
                        id: crypto.randomUUID(),
                        title: "",
                        description: "",
                        icon: "shield",
                      },
                    ],
                  }))
                }
              >
                <Plus className="w-4 h-4 mr-1" /> Add card
              </Button>
            </div>

            {config.cards.map((card, index) => (
              <fieldset
                key={card.id}
                aria-label={`Card ${index + 1}`}
                className="space-y-3 rounded-xl border border-border/60 bg-background/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Card {index + 1}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete card ${index + 1}`}
                    onClick={() =>
                      setConfig((current) => ({
                        ...current,
                        cards: current.cards.filter((item) => item.id !== card.id),
                      }))
                    }
                    className="text-rose-400 hover:text-rose-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <label className="block space-y-1.5">
                  <span className="text-xs text-muted-foreground">Title</span>
                  <input
                    value={card.title}
                    onChange={(event) => updateCardText(card.id, "title", event.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs text-muted-foreground">Description</span>
                  <textarea
                    rows={3}
                    value={card.description}
                    onChange={(event) => updateCardText(card.id, "description", event.target.value)}
                    className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs text-muted-foreground">Icon</span>
                  <select
                    value={card.icon}
                    onChange={(event) =>
                      updateCardIcon(card.id, event.target.value as TrustSafetyIcon)
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon.value} value={icon.value}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                </label>
              </fieldset>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/70 bg-background">
            <div className="border-b border-border/60 px-4 py-3">
              <h3 className="text-sm font-semibold">Live Preview</h3>
              <p className="text-xs text-muted-foreground">
                Preview updates as you edit. Save Component to publish it.
              </p>
            </div>
            <div className="pointer-events-none">
              <TrustSafetySection config={config} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
