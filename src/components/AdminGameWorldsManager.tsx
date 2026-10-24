import { useState, useRef, useEffect } from "react";
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
  Eye,
  Sparkles,
  Layers,
  Save,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultGameArtwork } from "@/lib/catalog";
import {
  DEFAULT_GAME_WORLDS_CONFIG,
  getGameWorldsConfig,
  saveGameWorldsConfig,
  resetGameWorldsToDefault,
  type GameWorldSectionConfig,
  type GameWorldCard,
} from "@/lib/game-worlds";
import { AccountsForSaleWorlds } from "@/components/AccountsForSaleWorlds";
import { uploadImageFile } from "@/lib/db";

const COMMON_GENRES = [
  "STRATEGY · SURVIVAL",
  "STRATEGY · FANTASY",
  "STRATEGY · CIVILIZATION",
  "ACTION · RPG",
  "MMORPG · FANTASY",
  "TACTICAL · WARFARE",
];

const STANDARD_SERVICES = ["Middleman", "Buy & Sell Accounts", "Top Up"];

export function AdminGameWorldsManager() {
  const [config, setConfig] = useState<GameWorldSectionConfig>(DEFAULT_GAME_WORLDS_CONFIG);
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
  const [editingCard, setEditingCard] = useState<GameWorldCard | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Custom new service input
  const [customServiceAdd, setCustomServiceAdd] = useState("");
  const [customServiceEdit, setCustomServiceEdit] = useState("");

  useEffect(() => {
    let isMounted = true;
    void getGameWorldsConfig().then(
      (stored) => {
        if (isMounted) setConfig(stored);
      },
      (error: unknown) => {
        console.error("Failed to load game worlds from PostgreSQL:", error);
        showNotice("Failed to load game worlds from PostgreSQL.");
      },
    );
    return () => {
      isMounted = false;
    };
  }, []);

  const persistConfig = async (updated: GameWorldSectionConfig, message?: string) => {
    const previous = config;
    setConfig(updated);
    try {
      await saveGameWorldsConfig(updated);
      if (message) showNotice(message);
    } catch (error) {
      console.error("Failed to save game worlds to PostgreSQL:", error);
      setConfig(previous);
      showNotice("Failed to save game worlds. Please try again.");
    }
  };

  const [newCard, setNewCard] = useState<Partial<GameWorldCard>>({
    number: `0${config.cards.length + 1}`,
    name: "",
    slug: "",
    genre: "STRATEGY · SURVIVAL",
    image: "",
    imageAlt: "",
    services: ["Middleman", "Buy & Sell Accounts"],
  });

  // Keep saved when config changes
  const handleSaveAll = () => {
    void persistConfig(config, "All changes saved successfully! Public pages updated.");
  };

  const handleReset = async () => {
    if (window.confirm("Reset 'Accounts for Sale' component back to default 4 worlds?")) {
      try {
        const def = await resetGameWorldsToDefault();
        setConfig(def);
        showNotice("Component reset.");
      } catch (error) {
        console.error("Failed to reset game worlds in PostgreSQL:", error);
        showNotice("Failed to reset game worlds. Please try again.");
      }
    }
  };

  // Real-time title/eyebrow/subtitle updates
  const updateSectionMeta = (key: "eyebrow" | "title" | "subtitle", value: string) => {
    const updated = { ...config, [key]: value };
    void persistConfig(updated);
  };

  // Reorder cards
  const moveCard = (index: number, direction: "up" | "down") => {
    const newCards = [...config.cards];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCards.length) return;

    const temp = newCards[index];
    const target = newCards[targetIndex];
    if (temp && target) {
      newCards[index] = target;
      newCards[targetIndex] = temp;
    }

    // Optional: auto-adjust numbers like 01, 02 if desired
    const updated = { ...config, cards: newCards };
    void persistConfig(updated, `Moved card ${direction === "up" ? "up" : "down"}.`);
  };

  // Upload handlers
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
      showNotice("Artwork uploaded successfully!");
    } catch {
      showNotice("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  // Add Card
  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.name) {
      alert("Please provide a game name.");
      return;
    }

    const slug =
      newCard.slug ||
      newCard.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const created: GameWorldCard = {
      id: `world-${Date.now()}`,
      slug: slug || `world-${Date.now()}`,
      name: newCard.name,
      genre: newCard.genre || "STRATEGY · SURVIVAL",
      image: newCard.image || defaultGameArtwork,
      imageAlt: newCard.imageAlt || `Artwork for ${newCard.name}`,
      number: newCard.number || `0${config.cards.length + 1}`,
      services:
        newCard.services && newCard.services.length > 0
          ? newCard.services
          : ["Middleman", "Buy & Sell Accounts"],
    };

    const updated = { ...config, cards: [...config.cards, created] };
    void persistConfig(updated, `Added "${created.name}" card to Accounts for Sale!`);
    setIsAdding(false);
    setNewCard({
      number: `0${updated.cards.length + 1}`,
      name: "",
      slug: "",
      genre: "STRATEGY · SURVIVAL",
      image: "",
      imageAlt: "",
      services: ["Middleman", "Buy & Sell Accounts"],
    });
  };

  // Update Card
  const handleUpdateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    const updatedCards = config.cards.map((c) =>
      c.id === editingCard.id || c.slug === editingCard.slug ? editingCard : c,
    );

    const updated = { ...config, cards: updatedCards };
    void persistConfig(updated, `Saved changes to "${editingCard.name}".`);
    setEditingCard(null);
  };

  // Delete Card
  const handleDeleteCard = (id: string) => {
    const updatedCards = config.cards.filter((c) => c.id !== id && c.slug !== id);
    const updated = { ...config, cards: updatedCards };
    void persistConfig(updated, "Card deleted.");
    setConfirmDeleteId(null);
  };

  // Toggle service tag in New
  const toggleServiceInNew = (svc: string) => {
    const current = newCard.services || [];
    if (current.includes(svc)) {
      setNewCard({ ...newCard, services: current.filter((s) => s !== svc) });
    } else {
      setNewCard({ ...newCard, services: [...current, svc] });
    }
  };

  // Toggle service tag in Edit
  const toggleServiceInEdit = (svc: string) => {
    if (!editingCard) return;
    const current = editingCard.services || [];
    if (current.includes(svc)) {
      setEditingCard({ ...editingCard, services: current.filter((s) => s !== svc) });
    } else {
      setEditingCard({ ...editingCard, services: [...current, svc] });
    }
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
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            COMPONENT CRUD & REAL-TIME PREVIEW
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            Accounts for Sale Component
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage the game world showcase section ("Four worlds. Your next adventure.") and see
            live updates in real-time.
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
            title="Reset back to default 4 game worlds"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Defaults
          </Button>
          <Button onClick={() => setIsAdding(true)} className="bm-btn bm-btn-primary text-xs">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add World Card
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
              <span>Section Heading & Subtitle</span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                Live Synced
              </span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Eyebrow Badge
                </label>
                <input
                  type="text"
                  value={config.eyebrow}
                  onChange={(e) => updateSectionMeta("eyebrow", e.target.value)}
                  placeholder="e.g. THE COLLECTION"
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Section Title (Heading)
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => updateSectionMeta("title", e.target.value)}
                  placeholder="e.g. Accounts for Sale"
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs text-foreground font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Subtitle / Lead Text
                </label>
                <input
                  type="text"
                  value={config.subtitle}
                  onChange={(e) => updateSectionMeta("subtitle", e.target.value)}
                  placeholder="e.g. Four worlds. Your next adventure."
                  className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Cards List (CRUD Read & Actions) */}
          <div className="bg-card/70 border border-border/70 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Game World Cards ({config.cards.length})
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Order, customize, or delete cards displayed in the collection.
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
                        e.currentTarget.src = defaultGameArtwork;
                      }}
                    />
                    <span className="absolute top-1 left-1 bg-black/80 text-red-400 font-mono text-[9px] px-1 py-0.2 rounded font-bold">
                      {card.number}
                    </span>
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
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {card.services.map((svc) => (
                        <span
                          key={svc}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-red-950/60 border border-red-900/40 text-red-300"
                        >
                          {svc}
                        </span>
                      ))}
                    </div>
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
                  <span className="text-foreground">games#collection</span>
                </div>
              </div>

              {/* Viewport switch */}
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
                {/* Renders identical public component */}
                <div className="bm rounded-xl overflow-hidden border border-red-950/60 bg-[#120407]">
                  <AccountsForSaleWorlds config={config} previewMode={true} />
                </div>
              </div>
            </div>

            {/* Live preview footer bar */}
            <div className="px-5 py-3 border-t border-border/50 bg-secondary/15 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Exact 1:1 public component rendering
              </span>
              <a
                href="/games"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300"
              >
                Open public page <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD NEW WORLD CARD */}
      {/* ======================================================== */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-border/60">
              <div>
                <h3 className="text-base font-bold text-foreground">Add New World Card</h3>
                <p className="text-xs text-muted-foreground">
                  Create a new game world card for the "Accounts for Sale" showcase.
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
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                    Badge Number
                  </label>
                  <input
                    type="text"
                    required
                    value={newCard.number || ""}
                    onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                    placeholder="05"
                    className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                    Game / World Name
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
                    placeholder="e.g. State of Survival"
                    className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                  Genre / Category Meta
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

              {/* Cover Image Upload / URL */}
              <div className="p-4 rounded-xl border border-border/60 bg-secondary/15 space-y-3">
                <label className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-sky-400" /> Card Artwork / Image
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

              {/* Connected Services */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-muted-foreground block">
                  Connected Services (Badges)
                </label>
                <div className="flex gap-2 flex-wrap">
                  {STANDARD_SERVICES.map((svc) => {
                    const isSelected = (newCard.services || []).includes(svc);
                    return (
                      <button
                        key={svc}
                        type="button"
                        onClick={() => toggleServiceInNew(svc)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-red-950/90 border-red-500 text-red-200 font-semibold shadow-sm"
                            : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {svc}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Service Tag */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customServiceAdd}
                    onChange={(e) => setCustomServiceAdd(e.target.value)}
                    placeholder="Add custom service badge..."
                    className="flex-1 bg-secondary/30 border border-border rounded-lg px-3 py-1.5 text-xs"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (!customServiceAdd.trim()) return;
                      const tag = customServiceAdd.trim();
                      if (!(newCard.services || []).includes(tag)) {
                        setNewCard({
                          ...newCard,
                          services: [...(newCard.services || []), tag],
                        });
                      }
                      setCustomServiceAdd("");
                    }}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Add Tag
                  </Button>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bm-btn bm-btn-primary">
                  <Check className="w-4 h-4 mr-1.5" /> Add World Card
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT WORLD CARD */}
      {/* ======================================================== */}
      {editingCard && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-border/60">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Edit World Card: {editingCard.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Changes will update in real-time in the public showcase.
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
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                    Badge Number
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCard.number}
                    onChange={(e) => setEditingCard({ ...editingCard, number: e.target.value })}
                    className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                    Game / World Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCard.name}
                    onChange={(e) => setEditingCard({ ...editingCard, name: e.target.value })}
                    className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-muted-foreground block mb-1">
                  Genre / Category Meta
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

              {/* Cover Image Upload / URL */}
              <div className="p-4 rounded-xl border border-border/60 bg-secondary/15 space-y-3">
                <label className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-sky-400" /> Card Artwork / Image
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

              {/* Connected Services */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-muted-foreground block">
                  Connected Services (Badges)
                </label>
                <div className="flex gap-2 flex-wrap">
                  {STANDARD_SERVICES.map((svc) => {
                    const isSelected = editingCard.services.includes(svc);
                    return (
                      <button
                        key={svc}
                        type="button"
                        onClick={() => toggleServiceInEdit(svc)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-red-950/90 border-red-500 text-red-200 font-semibold shadow-sm"
                            : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {svc}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Service Tag */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customServiceEdit}
                    onChange={(e) => setCustomServiceEdit(e.target.value)}
                    placeholder="Add custom service badge..."
                    className="flex-1 bg-secondary/30 border border-border rounded-lg px-3 py-1.5 text-xs"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (!customServiceEdit.trim()) return;
                      const tag = customServiceEdit.trim();
                      if (!editingCard.services.includes(tag)) {
                        setEditingCard({
                          ...editingCard,
                          services: [...editingCard.services, tag],
                        });
                      }
                      setCustomServiceEdit("");
                    }}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Add Tag
                  </Button>
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
              <h3 className="text-base font-bold text-foreground">Delete World Card?</h3>
              <p className="text-xs text-muted-foreground mt-1">
                This card will be removed from the "Accounts for Sale" section. You can restore it
                anytime with "Reset Defaults".
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
