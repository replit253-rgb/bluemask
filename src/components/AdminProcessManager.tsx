import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_BUY_SELL_PROCESS_CONFIG,
  getProcessConfig,
  saveProcessConfig,
  type ProcessConfig,
} from "@/lib/process";

export function AdminProcessManager() {
  const [config, setConfig] = useState<ProcessConfig>(DEFAULT_BUY_SELL_PROCESS_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    void getProcessConfig().then(
      (stored) => {
        if (!isMounted) return;
        setConfig(stored);
        setIsLoading(false);
      },
      (error: unknown) => {
        console.error("Failed to load Buy & Sell process configuration:", error);
        if (!isMounted) return;
        setNotice("Unable to load Process settings. Check the database connection.");
        setIsLoading(false);
      },
    );
    return () => {
      isMounted = false;
    };
  }, []);

  const updateStep = (id: string, field: "title" | "text", value: string) => {
    setConfig((current) => ({
      ...current,
      steps: current.steps.map((step) => (step.id === id ? { ...step, [field]: value } : step)),
    }));
  };

  const addStep = () => {
    if (config.steps.length >= 12) {
      setNotice("A maximum of 12 process steps is supported.");
      return;
    }
    setConfig((current) => ({
      ...current,
      steps: [
        ...current.steps,
        { id: `process-step-${crypto.randomUUID()}`, title: "", text: "" },
      ],
    }));
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setNotice(null);
    try {
      await saveProcessConfig(config);
      setNotice("Process component saved.");
    } catch (error) {
      console.error("Failed to save Buy & Sell process configuration:", error);
      setNotice("Unable to save Process changes. Check the database connection.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Buy &amp; Sell Process</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Manage the process section on Buy &amp; Sell Accounts pages. Preview updates as you edit;
          save to publish.
        </p>
      </div>

      {notice && (
        <p role="status" className="rounded-lg border border-border/60 bg-card/60 px-4 py-3 text-sm">
          {notice}
        </p>
      )}

      {isLoading ? (
        <p role="status" className="text-sm text-muted-foreground">
          Loading Process settings…
        </p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-border/70 bg-card/50 p-5">
            <div className="grid gap-4">
              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  Section label
                </span>
                <input
                  required
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
                  required
                  value={config.title}
                  onChange={(event) =>
                    setConfig((current) => ({ ...current, title: event.target.value }))
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                />
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-border/50 pt-4">
              <h3 className="font-semibold">Steps ({config.steps.length})</h3>
              <Button type="button" variant="outline" size="sm" onClick={addStep}>
                <Plus className="w-4 h-4 mr-1" /> Add step
              </Button>
            </div>

            <div className="space-y-4">
              {config.steps.map((step, index) => (
                <fieldset
                  key={step.id}
                  aria-label={`Step ${index + 1}`}
                  className="space-y-3 rounded-xl border border-border/60 bg-background/60 p-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Step {index + 1}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Delete step ${index + 1}`}
                      onClick={() =>
                        setConfig((current) => ({
                          ...current,
                          steps: current.steps.filter((item) => item.id !== step.id),
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
                      required
                      value={step.title}
                      onChange={(event) => updateStep(step.id, "title", event.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs text-muted-foreground">Description</span>
                    <textarea
                      required
                      rows={3}
                      value={step.text}
                      onChange={(event) => updateStep(step.id, "text", event.target.value)}
                      className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                  </label>
                </fieldset>
              ))}
            </div>

            <Button
              type="submit"
              disabled={isSaving}
              className="bm-btn bm-btn-primary"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {isSaving ? "Saving…" : "Save Component"}
            </Button>
          </form>

          <section aria-label="Live preview" className="rounded-2xl border border-border/70 bg-card/50 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Live Preview
            </p>
            <div className="bm-section rounded-xl border border-border/50 bg-background">
              <div className="bm-section-head">
                <span className="bm-mono">{config.eyebrow}</span>
                <h2>{config.title}</h2>
              </div>
              <ol className="bm-steps">
                {config.steps.map((step, index) => (
                  <li key={step.id}>
                    <span className="bm-step-no">{index + 1}</span>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
