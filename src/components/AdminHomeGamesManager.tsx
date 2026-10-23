import { useState, useRef } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  Check,
  MoveUp,
  MoveDown,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Layers,
  X,
  ExternalLink,
  Gamepad2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getHomeGamesConfig,
  saveHomeGamesConfig,
  resetHomeGamesToDefault,
  type HomeGamesSectionConfig,
  type HomeGameCard,
} from "@/lib/home-games";
import { HomeGamesShowcase } from "@/components/HomeGamesShowcase";
import { uploadImageFile } from "@/lib/db";

const COMMON_GENRES = [
  "STRATEGY · SURVIVAL",
  "STRATEGY · FANTASY",
  "STRATEGY · CIVILIZATION",
  "ACTION · RPG",
  "MMORPG · FANTASY",
  "TACTICAL · WARFARE",
];

export function AdminHomeGamesManager() {
  const [config, setConfig] = useState<HomeGamesSectionConfig>(() => getHomeGamesConfig());
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [layoutMode, setLayoutMode] = useState<"split" | "stacked">("split");

  // Notifications
  const [notice, setNotice] = useState<string | null>(null);
  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const addFileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  // Edit / Add modal state
  const [isAdding, setIsAdding] = useState(false);
  const [editingCard, setEditingCard] = useState<HomeGameCard | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [newCard, setNewCard] = useState<Partial<HomeGameCard>>({
    name: "",
    slug: "",
    genre: "STRATEGY · SURVIVAL",
    image: "",
    imageAlt: "",
    actionText: "Explore accounts",
  });

  const handleReset = () => {
    if (window.confirm("Reset 'Choose your Game' section back to default 4 games?")) {
      const def = resetHomeGamesToDefault();
      setConfig(def);
      showNotice("Reset to default 4 games.");
    }
  };

  const updateMeta = (key: "eyebrow" | "title" | "linkText" | "linkUrl", value: string) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    saveHomeGamesConfig(updated);
  };

  const moveCard = (index: number, direction: "up" | "down") => {
    const newCards = [...config.cards];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCards.length) return;

    const temp = newCards[index];
    newCards[index] = newCards[targetIndex];
    newCards[targetIndex] = temp;

    const updated = { ...config, cards: newCards };
    setConfig(updated);
    saveHomeGamesConfig(updated);
    showNotice(`Moved card ${direction === "up" ? "up" : "down"}.`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const dataUrl = await uploadImageFile(file);
      if (isEdit && editingCard) {
        setEditingCard({ ...editingCard, image: dataUrl });
      } else {
        setNewCard((prev) => ({ ...prev, image: dataUrl }));
      }
      showNotice("Game artwork uploaded successfully!");
    } catch {
      showNotice("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.name) {
      alert("Please enter a game name.");
      return;
    }

    const slug =
      newCard.slug ||
      newCard.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const created: HomeGameCard = {
      id: `home-game-${Date.now()}`,
      slug: slug || `game-${Date.now()}`,
      name: newCard.name,
      genre: newCard.genre || "STRATEGY · SURVIVAL",
      image: newCard.image || "/assets/game-whiteout.jpg",
      imageAlt: newCard.imageAlt || `Artwork for ${newCard.name}`,
      actionText: newCard.actionText || "Explore accounts",
      linkUrl: `/accounts?game=${slug}`,
    };

    const updated = { ...config, cards: [...config.cards, created] };
    setConfig(updated);
    saveHomeGamesConfig(updated);
    setIsAdding(false);
    setNewCard({
      name: "",
      slug: "",
      genre: "STRATEGY · SURVIVAL",
      image: "",
      imageAlt: "",
      actionText: "Explore accounts",
    });
    showNotice(`Added "${created.name}" to Choose your Game section!`);
  };

  const handleUpdateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    const updatedCards = config.cards.map((c) =>
      c.id === editingCard.id || c.slug === editingCard.slug ? editingCard : c,
    );

    const updated = { ...config, cards: updatedCards };
    setConfig(updated);
    saveHomeGamesConfig(updated);
    setEditingCard(null);
    showNotice(`Saved changes to "${editingCard.name}".`);
  };

  const handleDeleteCard = (id: string) => {
    const updatedCards = config.cards.filter((c) => c.id !== id && c.slug !== id);
    const updated = { ...config, cards: updatedCards };
    setConfig(updated);
    saveHomeGamesConfig(updated);
    setConfirmDeleteId(null);
    showNotice("Card deleted.");
  };

  return (
    <div className="space-y-8">
      {/* Toast Notice */}
      {notice && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white font-medium text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/60 p-6 rounded-2xl border border-border/60 backdrop-blur-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/40 text-red-300 text-xs font-semibold mb-2">
            <Gamepad2 className="w-3.5 h-3.5 text-red-400" />
            HOME PAGE COMPONENT CRUD & LIVE PREVIEW
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            Choose your Game Component
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage the "Choose your Game" section displayed on the public Home page with real-time
            live preview.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={() => setLayoutMode(layoutMode === "split" ? "stacked" : "split")}
            variant="outline"
            size="sm"
            className="text-xs hidden lg:inline-flex"
          >
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            {layoutMode === "split" ? "Stacked Layout" : "Side-by-Side"}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border-rose-900/50"
            title="Reset back to default 4 games"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Defaults
          </Button>
          <Button onClick={() => setIsAdding(true)} className="bm-btn bm-btn-primary text-xs">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Game Card
          </Button>
        </div>
      </div>

      {/* Main Container: Split or Stacked */}
      <div
        className={`grid gap-8 ${
          layoutMode === "split" ? "grid-cols-1 xl:grid-cols-12" : "grid-cols-1"
        }`}
      >
        {/* Left Column: Editor & Card Management */}
        <div className={layoutMode === "split" ? "xl:col-span-5 space-y-6" : "space-y-6"}>
          {/* Section Headings Form */}
          <div className="bg-card/70 border border-border/70 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center justify-between">
              <span>Section Heading & Header Link</span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                Live Synced
              </span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Eyebrow Label
                </label>
                <input
                  type="text"
                  value={config.eyebrow}
                  onChange={(e) => updateMeta("eyebrow", e.target.value)}
                  placeholder="e.g. Games"
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs text-foreground font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Section Title (Heading)
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => updateMeta("title", e.target.value)}
                  placeholder="e.g. Choose your Game"
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs text-foreground font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Link Text
                  </label>
                  <input
                    type="text"
                    value={config.linkText}
                    onChange={(e) => updateMeta("linkText", e.target.value)}
                    placeholder="e.g. All games"
                    className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Link Target URL
                  </label>
                  <input
                    type="text"
                    value={config.linkUrl}
                    onChange={(e) => updateMeta("linkUrl", e.target.value)}
                    placeholder="/games"
                    className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cards List (CRUD Read & Actions) */}
          <div className="bg-card/70 border border-border/70 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Game Cards ({config.cards.length})
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Cards displayed under "Choose your Game" on the Home page.
                </p>
              </div>
              <Button
                onClick={() => setIsAdding(true)}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Card
              </Button>
            </div>

            <div className="space-y-3">
              {config.cards.map((card, idx) => (
                <div
                  key={card.slug || card.id}
                  className="flex items-center gap-3.5 p-3.5 bg-secondary/30 border border-border/60 rounded-xl hover:border-red-500/40 transition-colors"
                >
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveCard(idx, "up")}
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-opacity"
                      title="Move card up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === config.cards.length - 1}
                      onClick={() => moveCard(idx, "down")}
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-opacity"
                      title="Move card down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-border/70 shrink-0 bg-background">
                    <img
                      src={card.image}
                      alt={card.imageAlt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/game-whiteout.jpg";
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground truncate">{card.name}</h4>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase bg-secondary/60 px-1.5 py-0.5 rounded">
                        {card.genre}
                      </span>
                    </div>
                    <p
                      className="text-[11px] text-muted-foreground truncate mt-0.5"
                      title={card.imageAlt}
                    >
                      {card.imageAlt}
                    </p>
                    <span className="text-[10px] text-red-400 font-semibold inline-block mt-1">
                      {card.actionText || "Explore accounts"} →
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingCard(card)}
                      className="p-2 text-muted-foreground hover:text-sky-400 hover:bg-sky-950/30 rounded-lg transition-colors"
                      title="Edit card"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(card.id || card.slug)}
                      className="p-2 text-muted-foreground hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                      title="Delete card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pixel-Perfect Live Preview */}
        <div className={layoutMode === "split" ? "xl:col-span-7 space-y-4" : "space-y-4"}>
          <div className="bg-card/70 border border-border/70 rounded-2xl overflow-hidden shadow-xl sticky top-6">
            {/* Live Preview Control Bar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 bg-secondary/20">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-background/60 border border-border/50 rounded-md text-[11px] text-muted-foreground font-mono">
                  <span>reedmoon.shop</span>
                  <span className="text-muted-foreground/50">/</span>
                  <span className="text-foreground">#games</span>
                </div>
              </div>

              {/* Viewport switcher */}
              <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border border-border/50">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 rounded transition-colors ${
                    previewDevice === "desktop"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Desktop 4-column view"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("tablet")}
                  className={`p-1.5 rounded transition-colors ${
                    previewDevice === "tablet"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Tablet 2-column view"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1.5 rounded transition-colors ${
                    previewDevice === "mobile"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Mobile 1-column view"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Live Preview Container (wraps in bm classes for exact stylesheet parity) */}
            <div className="p-4 bg-[#0a0204] overflow-x-auto min-h-[500px]">
              <div
                className={`mx-auto transition-all duration-300 ${
                  previewDevice === "desktop"
                    ? "w-full max-w-full"
                    : previewDevice === "tablet"
                      ? "max-w-[768px] border-x border-border/40 shadow-2xl"
                      : "max-w-[420px] border-x border-border/40 shadow-2xl"
                }`}
              >
                {/* Renders identical public Home page section */}
                <div className="bm rounded-xl overflow-hidden border border-red-950/60 bg-[#120407] p-6">
                  <HomeGamesShowcase config={config} previewMode={true} />
                </div>
              </div>
            </div>

            {/* Live preview footer bar */}
            <div className="px-5 py-3 border-t border-border/50 bg-secondary/15 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Exact 1:1 public Home page component rendering
              </span>
              <a
                href="/#games"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300"
              >
                View on Home Page <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD GAME CARD */}
      {/* ======================================================== */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-border/60">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Add Game Card (Home Showcase)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Create a new game card for the "Choose your Game" section.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                  Game Name
                </label>
                <input
                  type="text"
                  required
                  value={newCard.name || ""}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, "");
                    setNewCard({ ...newCard, name, slug });
                  }}
                  placeholder="e.g. Whiteout Survival"
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                  Genre / Category
                </label>
                <input
                  type="text"
                  required
                  value={newCard.genre || ""}
                  onChange={(e) => setNewCard({ ...newCard, genre: e.target.value })}
                  placeholder="e.g. STRATEGY · SURVIVAL"
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs font-mono"
                />
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {COMMON_GENRES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setNewCard({ ...newCard, genre: g })}
                      className="text-[10px] px-2 py-0.5 rounded bg-secondary/50 hover:bg-secondary text-muted-foreground border border-border/50"
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                  Image Alt / Visual Prompt
                </label>
                <input
                  type="text"
                  required
                  value={newCard.imageAlt || ""}
                  onChange={(e) => setNewCard({ ...newCard, imageAlt: e.target.value })}
                  placeholder="e.g. A survivor facing a fortress in a snowy valley"
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                  Action Link Text
                </label>
                <input
                  type="text"
                  value={newCard.actionText || ""}
                  onChange={(e) => setNewCard({ ...newCard, actionText: e.target.value })}
                  placeholder="Explore accounts"
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs font-semibold"
                />
              </div>

              {/* Cover Image Upload / URL */}
              <div className="p-4 rounded-xl border border-border/60 bg-secondary/15 space-y-3">
                <label className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-sky-400" /> Game Artwork / Image
                </label>

                <div className="flex items-center gap-4">
                  {newCard.image ? (
                    <img
                      src={newCard.image}
                      alt="Preview"
                      className="w-20 h-16 object-cover rounded-lg border border-border/80"
                    />
                  ) : (
                    <div className="w-20 h-16 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground bg-secondary/20">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}

                  <div className="space-y-2 flex-1">
                    <input
                      type="text"
                      value={newCard.image || ""}
                      onChange={(e) => setNewCard({ ...newCard, image: e.target.value })}
                      placeholder="Paste image URL or upload from device"
                      className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-1.5 text-xs font-mono"
                    />

                    <input
                      type="file"
                      ref={addFileInputRef}
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, false)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => addFileInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      disabled={isUploading}
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      {isUploading ? "Uploading..." : "Upload from Device"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bm-btn bm-btn-primary">
                  <Check className="w-4 h-4 mr-1.5" /> Add Game Card
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT GAME CARD */}
      {/* ======================================================== */}
      {editingCard && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-border/60">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Edit Game Card: {editingCard.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Changes will update in real-time in the public Home section.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCard(null)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateCard} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                  Game Name
                </label>
                <input
                  type="text"
                  required
                  value={editingCard.name}
                  onChange={(e) => setEditingCard({ ...editingCard, name: e.target.value })}
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                  Genre / Category
                </label>
                <input
                  type="text"
                  required
                  value={editingCard.genre}
                  onChange={(e) => setEditingCard({ ...editingCard, genre: e.target.value })}
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs font-mono"
                />
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {COMMON_GENRES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setEditingCard({ ...editingCard, genre: g })}
                      className="text-[10px] px-2 py-0.5 rounded bg-secondary/50 hover:bg-secondary text-muted-foreground border border-border/50"
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                  Image Alt / Visual Prompt
                </label>
                <input
                  type="text"
                  required
                  value={editingCard.imageAlt}
                  onChange={(e) => setEditingCard({ ...editingCard, imageAlt: e.target.value })}
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                  Action Link Text
                </label>
                <input
                  type="text"
                  value={editingCard.actionText || ""}
                  onChange={(e) => setEditingCard({ ...editingCard, actionText: e.target.value })}
                  placeholder="Explore accounts"
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs font-semibold"
                />
              </div>

              {/* Cover Image Upload / URL */}
              <div className="p-4 rounded-xl border border-border/60 bg-secondary/15 space-y-3">
                <label className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-sky-400" /> Game Artwork / Image
                </label>

                <div className="flex items-center gap-4">
                  {editingCard.image ? (
                    <img
                      src={editingCard.image}
                      alt="Preview"
                      className="w-20 h-16 object-cover rounded-lg border border-border/80"
                    />
                  ) : (
                    <div className="w-20 h-16 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground bg-secondary/20">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}

                  <div className="space-y-2 flex-1">
                    <input
                      type="text"
                      value={editingCard.image}
                      onChange={(e) => setEditingCard({ ...editingCard, image: e.target.value })}
                      placeholder="Paste image URL or upload from device"
                      className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-1.5 text-xs font-mono"
                    />

                    <input
                      type="file"
                      ref={editFileInputRef}
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, true)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      disabled={isUploading}
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      {isUploading ? "Uploading..." : "Upload from Device"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingCard(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bm-btn bm-btn-primary">
                  <Check className="w-4 h-4 mr-1.5" /> Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ======================================================== */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-800/40 text-rose-500 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Delete Game Card?</h3>
              <p className="text-xs text-muted-foreground mt-1">
                This game card will be removed from the "Choose your Game" section on the Home page.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-rose-600 hover:bg-rose-500 text-white"
                onClick={() => handleDeleteCard(confirmDeleteId)}
              >
                Delete Card
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
