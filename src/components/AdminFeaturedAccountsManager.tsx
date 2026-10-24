import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  RotateCcw,
  Check,
  MoveUp,
  MoveDown,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  Sparkles,
  Search,
  Pin,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Product } from "@/lib/products";
import { getProductsFromDB } from "@/lib/db";
import {
  DEFAULT_FEATURED_ACCOUNTS_CONFIG,
  getFeaturedAccountsConfig,
  saveFeaturedAccountsConfig,
  resetFeaturedAccountsToDefault,
  type FeaturedAccountsConfig,
} from "@/lib/featured-accounts";
import { FeaturedAccountsShowcase } from "@/components/FeaturedAccountsShowcase";

export function AdminFeaturedAccountsManager() {
  const [config, setConfig] = useState<FeaturedAccountsConfig>(DEFAULT_FEATURED_ACCOUNTS_CONFIG);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGameFilter, setSelectedGameFilter] = useState("all");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [layoutMode, setLayoutMode] = useState<"split" | "stacked">("split");

  // Notifications
  const [notice, setNotice] = useState<string | null>(null);
  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  useEffect(() => {
    let isMounted = true;
    void Promise.all([getProductsFromDB(), getFeaturedAccountsConfig()]).then(
      ([items, storedConfig]) => {
        if (!isMounted) return;
        setAllProducts(items);
        setConfig(storedConfig);
      },
      (error: unknown) => {
        console.error("Failed to load featured accounts from PostgreSQL:", error);
        showNotice("Failed to load featured accounts from PostgreSQL.");
      },
    );
    return () => {
      isMounted = false;
    };
  }, []);

  const persistConfig = async (updated: FeaturedAccountsConfig, message?: string) => {
    const previous = config;
    setConfig(updated);
    try {
      await saveFeaturedAccountsConfig(updated);
      if (message) showNotice(message);
    } catch (error) {
      console.error("Failed to save featured accounts to PostgreSQL:", error);
      setConfig(previous);
      showNotice("Failed to save featured accounts. Please try again.");
    }
  };

  const updateMeta = (key: keyof FeaturedAccountsConfig, value: unknown) => {
    const updated = { ...config, [key]: value };
    void persistConfig(updated);
  };

  const handleReset = async () => {
    if (window.confirm("Reset 'Account for Sale' section settings to default?")) {
      try {
        const def = await resetFeaturedAccountsToDefault();
        setConfig(def);
        showNotice("Featured account settings reset.");
      } catch (error) {
        console.error("Failed to reset featured accounts in PostgreSQL:", error);
        showNotice("Failed to reset featured accounts. Please try again.");
      }
    }
  };

  const addCardToFeatured = (code: string) => {
    if (config.selectedCodes.includes(code)) return;
    const updatedCodes = [...config.selectedCodes, code];
    const updated = { ...config, selectedCodes: updatedCodes, selectionMode: "manual" as const };
    void persistConfig(updated, `Added card ${code} to homepage component.`);
  };

  const removeCardFromFeatured = (code: string) => {
    const updatedCodes = config.selectedCodes.filter((c) => c !== code);
    const updated = { ...config, selectedCodes: updatedCodes };
    void persistConfig(updated, `Removed card ${code} from homepage component.`);
  };

  const moveCard = (index: number, direction: "up" | "down") => {
    const newCodes = [...config.selectedCodes];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCodes.length) return;

    const temp = newCodes[index];
    const target = newCodes[targetIndex];
    if (temp !== undefined && target !== undefined) {
      newCodes[index] = target;
      newCodes[targetIndex] = temp;
    }

    const updated = { ...config, selectedCodes: newCodes };
    void persistConfig(updated, "Featured accounts reordered.");
  };

  const gamesList = Array.from(new Set(allProducts.map((p) => p.game)));

  const filteredInventory = allProducts.filter((p) => {
    const matchesSearch =
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.game.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame = selectedGameFilter === "all" || p.game === selectedGameFilter;
    return matchesSearch && matchesGame;
  });

  const selectedProducts = config.selectedCodes
    .map((code) => allProducts.find((p) => p.code === code))
    .filter((p): p is Product => p !== undefined);

  const previewWidth =
    previewDevice === "desktop" ? "100%" : previewDevice === "tablet" ? "768px" : "375px";

  return (
    <div className="space-y-8">
      {/* Top Banner Notice */}
      {notice && (
        <div className="p-3.5 px-5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-lg animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Control Toolbar */}
      <div className="p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-950/80 text-red-400 border border-red-800/60">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              Featured Accounts Component Manager
            </h2>
            <p className="text-xs text-muted-foreground">
              Select, pin, and order exact account cards to display on the homepage component.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-background rounded-lg border border-border p-1">
            <button
              onClick={() => setPreviewDevice("desktop")}
              className={`p-1.5 rounded-md transition-colors ${
                previewDevice === "desktop"
                  ? "bg-red-950 text-red-400 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewDevice("tablet")}
              className={`p-1.5 rounded-md transition-colors ${
                previewDevice === "tablet"
                  ? "bg-red-950 text-red-400 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewDevice("mobile")}
              className={`p-1.5 rounded-md transition-colors ${
                previewDevice === "mobile"
                  ? "bg-red-950 text-red-400 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setLayoutMode(layoutMode === "split" ? "stacked" : "split")}
            className="text-xs border-border"
          >
            {layoutMode === "split" ? "Stacked Layout" : "Split View"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Defaults
          </Button>
        </div>
      </div>

      <div
        className={`grid gap-8 ${
          layoutMode === "split" ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"
        }`}
      >
        {/* Left Column: Editor & Card Picker */}
        <div className={`space-y-6 ${layoutMode === "split" ? "lg:col-span-6" : ""}`}>
          {/* Section Headings & Mode Settings */}
          <div className="p-5 rounded-2xl border border-border bg-card/80 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-500" /> Component Headings & Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Category Eyebrow Text
                </label>
                <input
                  type="text"
                  value={config.eyebrow}
                  onChange={(e) => updateMeta("eyebrow", e.target.value)}
                  placeholder="e.g. Catalog"
                  className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Section Title
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => updateMeta("title", e.target.value)}
                  placeholder="e.g. Account for Sale"
                  className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Link Text
                </label>
                <input
                  type="text"
                  value={config.linkText}
                  onChange={(e) => updateMeta("linkText", e.target.value)}
                  placeholder="e.g. View all accounts"
                  className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Max Cards Display Limit
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={config.maxDisplayCount}
                  onChange={(e) => updateMeta("maxDisplayCount", Number(e.target.value) || 6)}
                  className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Selection Mode Toggle */}
            <div className="pt-3 border-t border-border/60">
              <label className="text-xs font-semibold text-foreground mb-2 block">
                Card Selection Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateMeta("selectionMode", "auto")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    config.selectionMode === "auto"
                      ? "border-red-500 bg-red-950/40 text-foreground font-semibold"
                      : "border-border/60 bg-background/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="text-xs font-bold mb-0.5">Auto Mode (Latest Accounts)</div>
                  <div className="text-[11px] opacity-80">
                    Automatically displays the latest available listed accounts.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => updateMeta("selectionMode", "manual")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    config.selectionMode === "manual"
                      ? "border-red-500 bg-red-950/40 text-foreground font-semibold"
                      : "border-border/60 bg-background/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="text-xs font-bold mb-0.5">Manual Pinning (Custom Pick)</div>
                  <div className="text-[11px] opacity-80">
                    Explicitly select & order which cards appear on homepage.
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Selected Cards Manager (When Manual or Active) */}
          <div className="p-5 rounded-2xl border border-border bg-card/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Pin className="w-4 h-4 text-red-500" /> Currently Selected Homepage Cards (
                  {selectedProducts.length})
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reorder or remove pinned cards for the homepage.
                </p>
              </div>
            </div>

            {selectedProducts.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-border rounded-xl text-muted-foreground text-xs">
                No cards manually pinned yet. Pick cards from inventory below or use Auto mode.
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedProducts.map((p, idx) => (
                  <div
                    key={p.code}
                    className="p-3 rounded-xl border border-border/80 bg-background flex items-center justify-between gap-3 shadow-sm hover:border-red-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-red-950 text-red-400 border border-red-800 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground truncate">{p.title}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                          <span className="font-mono text-red-400">{p.code}</span>
                          <span>·</span>
                          <span>{p.game}</span>
                          <span>·</span>
                          <span className="text-emerald-400 font-semibold">${p.price}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={idx === 0}
                        onClick={() => moveCard(idx, "up")}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={idx === selectedProducts.length - 1}
                        onClick={() => moveCard(idx, "down")}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCardFromFeatured(p.code)}
                        className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-950/50"
                        title="Unpin Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account Inventory Picker */}
          <div className="p-5 rounded-2xl border border-border bg-card/80 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-400" /> Account Inventory Picker
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click "+ Pin Card" to add an account to the homepage component.
                </p>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-auto flex-1">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search title, code, game..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <select
                value={selectedGameFilter}
                onChange={(e) => setSelectedGameFilter(e.target.value)}
                className="w-full sm:w-auto bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="all">All Games ({allProducts.length})</option>
                {gamesList.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
              {filteredInventory.map((p) => {
                const isPinned = config.selectedCodes.includes(p.code);
                return (
                  <div
                    key={p.code}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                      isPinned
                        ? "border-red-500/40 bg-red-950/20"
                        : "border-border/60 bg-background/60 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground truncate flex items-center gap-2">
                          <span>{p.title}</span>
                          {p.badge && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-800">
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-red-400">{p.code}</span>
                          <span>·</span>
                          <span>{p.game}</span>
                          <span>·</span>
                          <span className="text-emerald-400 font-semibold">${p.price}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant={isPinned ? "outline" : "default"}
                      size="sm"
                      onClick={() =>
                        isPinned ? removeCardFromFeatured(p.code) : addCardToFeatured(p.code)
                      }
                      className={`text-xs h-8 ${
                        isPinned
                          ? "border-red-800 text-red-400 bg-red-950/40 hover:bg-red-900/40"
                          : "bg-red-600 hover:bg-red-700 text-white"
                      }`}
                    >
                      {isPinned ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Pinned
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 mr-1" /> Pin Card
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Exact Live Preview Component */}
        <div className={`space-y-4 ${layoutMode === "split" ? "lg:col-span-6" : ""}`}>
          <div className="p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Homepage Live Preview ({previewDevice.toUpperCase()})
              </span>
            </div>
            <a
              href="/#accounts"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-red-400 hover:text-red-300 inline-flex items-center gap-1 font-semibold"
            >
              View Public Section <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="border border-border rounded-2xl bg-black/90 p-2 md:p-4 overflow-hidden flex justify-center shadow-2xl">
            <div
              style={{ width: previewWidth, maxWidth: "100%" }}
              className="transition-all duration-300 bg-background rounded-xl overflow-hidden border border-border/60 shadow-inner"
            >
              <FeaturedAccountsShowcase />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
