import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Shield,
  Plus,
  Trash2,
  Edit3,
  LogOut,
  Package,
  CreditCard,
  Settings,
  Check,
  ArrowUpRight,
  TrendingUp,
  X,
  Upload,
  Layout,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import {
  getProductsFromDB,
  saveProductToDB,
  deleteProductFromDB,
  getTopUpsFromDB,
  saveTopUpToDB,
  deleteTopUpFromDB,
  uploadImageFile,
  initDatabase,
} from "@/lib/db";
import { getStoreSettings, saveStoreSettings } from "@/lib/admin-store";
import { formatRupiah, type Product } from "@/lib/products";
import { findGame, type GameSlug } from "@/lib/catalog";
import { type TopUpPackage } from "@/lib/topup";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Store Management Panel — BlueMask" },
      { name: "description", content: "Store management portal for BlueMask." },
    ],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const navigate = useNavigate();
  const fileInputAddRef = useRef<HTMLInputElement | null>(null);
  const fileInputEditRef = useRef<HTMLInputElement | null>(null);

  const [tab, setTab] = useState<"overview" | "accounts" | "topups" | "settings">("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [topups, setTopups] = useState<TopUpPackage[]>([]);
  const [settings, setSettings] = useState({ discordLink: "", whatsapp: "" });
  const [notice, setNotice] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Modals
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    code: "",
    game: "whiteout-survival",
    title: "",
    badge: "",
    price: 1_500_000,
    status: "tersedia",
    image: "",
  });

  const [editingTopUp, setEditingTopUp] = useState<TopUpPackage | null>(null);
  const [isAddingTopUp, setIsAddingTopUp] = useState(false);
  const [newTopUp, setNewTopUp] = useState<Partial<TopUpPackage>>({
    code: "",
    game: "whiteout-survival",
    name: "",
    detail: "",
    price: 50_000,
    popular: false,
  });

  const [confirmDeleteCode, setConfirmDeleteCode] = useState<string | null>(null);
  const [confirmDeleteTopUp, setConfirmDeleteTopUp] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("bm_is_admin") !== "true") {
      navigate({ to: "/admin/login" });
      return;
    }

    initDatabase().then(() => {
      getProductsFromDB().then((p) => setProducts(p));
      getTopUpsFromDB().then((t) => setTopups(t));
    });
    setSettings(getStoreSettings());
  }, [navigate]);

  const showNotification = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("bm_is_admin");
    }
    navigate({ to: "/admin/login" });
  };

  // Image Upload handler for accounts
  const handleUploadNewProductImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingImage(true);
      const url = await uploadImageFile(file);
      setNewProduct((prev) => ({ ...prev, image: url }));
      showNotification("Image uploaded from device successfully.");
    } catch {
      showNotification("Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUploadEditProductImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    try {
      setIsUploadingImage(true);
      const url = await uploadImageFile(file);
      setEditingProduct((prev) => (prev ? { ...prev, image: url } : null));
      showNotification("Image updated from device successfully.");
    } catch {
      showNotification("Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // --- Accounts operations ---
  const handleSaveNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.code || !newProduct.title) return;
    const item: Product = {
      code: newProduct.code.trim().toUpperCase(),
      game: (newProduct.game as GameSlug) || "whiteout-survival",
      title: newProduct.title.trim(),
      badge: newProduct.badge?.trim() || "Ready",
      price: Number(newProduct.price) || 500_000,
      status: (newProduct.status as Product["status"]) || "tersedia",
      image: newProduct.image || undefined,
      stats: [
        { label: "Level", value: newProduct.badge || "Max" },
        { label: "Status", value: "Verified" },
      ],
      highlights: ["Clean account credentials", "Safe middleman transaction"],
    };
    await saveProductToDB(item);
    setProducts([item, ...products.filter((p) => p.code !== item.code)]);
    setIsAddingProduct(false);
    setNewProduct({
      code: "",
      game: "whiteout-survival",
      title: "",
      badge: "",
      price: 1_500_000,
      status: "tersedia",
      image: "",
    });
    showNotification(`Account ${item.code} created and saved to database.`);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    await saveProductToDB(editingProduct);
    setProducts(products.map((p) => (p.code === editingProduct.code ? editingProduct : p)));
    setEditingProduct(null);
    showNotification(`Account ${editingProduct.code} updated in database.`);
  };

  const handleToggleStatus = async (code: string) => {
    const target = products.find((p) => p.code === code);
    if (!target) return;
    const updated: Product = {
      ...target,
      status: target.status === "tersedia" ? "terjual" : "tersedia",
    };
    await saveProductToDB(updated);
    setProducts(products.map((p) => (p.code === code ? updated : p)));
    showNotification(`Status for ${code} set to ${updated.status}.`);
  };

  const executeDeleteProduct = async (code: string) => {
    await deleteProductFromDB(code);
    setProducts(products.filter((p) => p.code !== code));
    setConfirmDeleteCode(null);
    showNotification(`Account ${code} removed from database.`);
  };

  // --- Top-Up operations ---
  const handleSaveNewTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopUp.code || !newTopUp.name) return;
    const item: TopUpPackage = {
      code: newTopUp.code.trim().toUpperCase(),
      game: (newTopUp.game as GameSlug) || "whiteout-survival",
      name: newTopUp.name.trim(),
      detail: newTopUp.detail?.trim() || "Packs & Gems",
      price: Number(newTopUp.price) || 50_000,
      popular: Boolean(newTopUp.popular),
    };
    await saveTopUpToDB(item);
    setTopups([item, ...topups.filter((t) => t.code !== item.code)]);
    setIsAddingTopUp(false);
    setNewTopUp({
      code: "",
      game: "whiteout-survival",
      name: "",
      detail: "",
      price: 50_000,
      popular: false,
    });
    showNotification(`Top-up pack ${item.code} saved to database.`);
  };

  const handleUpdateTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopUp) return;
    await saveTopUpToDB(editingTopUp);
    setTopups(topups.map((t) => (t.code === editingTopUp.code ? editingTopUp : t)));
    setEditingTopUp(null);
    showNotification(`Top-up pack ${editingTopUp.code} updated in database.`);
  };

  const executeDeleteTopUp = async (code: string) => {
    await deleteTopUpFromDB(code);
    setTopups(topups.filter((t) => t.code !== code));
    setConfirmDeleteTopUp(null);
    showNotification(`Top-up pack ${code} removed from database.`);
  };

  // --- Settings operations ---
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoreSettings(settings);
    showNotification("Contact channels updated successfully.");
  };

  const availableCount = products.filter((p) => p.status === "tersedia").length;
  const soldCount = products.filter((p) => p.status === "terjual").length;

  return (
    <main className="bm">
      <SiteHeader />

      {/* Floating Notification */}
      {notice && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "var(--bm-surface)",
            border: "1px solid var(--bm-glow)",
            color: "var(--bm-text)",
            padding: "14px 20px",
            borderRadius: "8px",
            boxShadow: "var(--bm-shadow)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
          }}
        >
          <Check style={{ color: "var(--bm-glow)", width: "18px", height: "18px" }} />
          <span>{notice}</span>
        </div>
      )}

      <section className="bm-detail-hero" style={{ paddingBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <span className="text-xs font-semibold tracking-wider text-sky-400 uppercase">
              Management
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-1">
              Store Management Panel
            </h1>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button asChild className="bm-btn bm-btn-primary">
              <Link to="/admin/cms">
                <Layout className="w-4 h-4 mr-1.5" /> CMS & Live Preview
              </Link>
            </Button>
            <Button asChild variant="outline" className="bm-btn bm-btn-outline">
              <Link to="/">
                Storefront <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bm-btn text-rose-400 border-rose-900/40 hover:bg-rose-950/30"
            >
              Logout <LogOut className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </section>

      <section className="bm-section pt-0">
        {/* Admin Layout with Sidebar */}
        <div className="flex gap-6">
          <aside className="w-64 hidden md:block">
            <nav className="flex flex-col gap-1">
              <button
                onClick={() => setTab("overview")}
                className={`w-full px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-3 transition-colors ${
                  tab === "overview"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TrendingUp className="w-4 h-4" /> Overview
              </button>
              <button
                onClick={() => setTab("accounts")}
                className={`w-full px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-3 transition-colors ${
                  tab === "accounts"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Package className="w-4 h-4" /> Accounts
              </button>
              <button
                onClick={() => setTab("topups")}
                className={`w-full px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-3 transition-colors ${
                  tab === "topups"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CreditCard className="w-4 h-4" /> Top-Up Packs
              </button>
              <button
                onClick={() => setTab("settings")}
                className={`w-full px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-3 transition-colors ${
                  tab === "settings"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Settings className="w-4 h-4" /> Contact Links
              </button>
            </nav>
          </aside>

          <div className="flex-1">
            {/* Tab Content */}
            {/* Tab 0: Overview */}
            {tab === "overview" && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-card border border-border/60 rounded-xl p-5">
                    <span className="text-xs font-medium text-muted-foreground">
                      Total Accounts
                    </span>
                    <strong className="block text-2xl font-bold text-foreground mt-2 tabular-nums">
                      {products.length}
                    </strong>
                  </div>
                  <div className="bg-card border border-border/60 rounded-xl p-5">
                    <span className="text-xs font-medium text-muted-foreground">
                      Available Stock
                    </span>
                    <strong className="block text-2xl font-bold text-emerald-400 mt-2 tabular-nums">
                      {availableCount}
                    </strong>
                  </div>
                  <div className="bg-card border border-border/60 rounded-xl p-5">
                    <span className="text-xs font-medium text-muted-foreground">Sold Accounts</span>
                    <strong className="block text-2xl font-bold text-rose-400 mt-2 tabular-nums">
                      {soldCount}
                    </strong>
                  </div>
                  <div className="bg-card border border-border/60 rounded-xl p-5">
                    <span className="text-xs font-medium text-muted-foreground">
                      Top-Up Packages
                    </span>
                    <strong className="block text-2xl font-bold text-sky-400 mt-2 tabular-nums">
                      {topups.length}
                    </strong>
                  </div>
                </div>

                <div className="bg-card/70 border border-border/60 rounded-xl p-6 md:p-8">
                  <h2 className="text-lg font-bold text-foreground mb-2">
                    Store Operations & Content System
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-6">
                    Manage all accounts with image uploads, real-time discount calculations, top-up
                    package catalogs, and page content with live preview.
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Button onClick={() => setTab("accounts")} className="bm-btn bm-btn-primary">
                      Manage Accounts <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                    <Button asChild variant="outline" className="bm-btn bm-btn-outline">
                      <Link to="/admin/cms">
                        Launch CMS with Live Preview <ArrowUpRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                    <Button
                      onClick={() => setTab("topups")}
                      variant="outline"
                      className="bm-btn bm-btn-outline"
                    >
                      Manage Top-Up <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 1: Accounts */}
            {tab === "accounts" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <div>
                    <h2>Manage Accounts</h2>
                    <p style={{ color: "var(--bm-ink-soft)", fontSize: "13px" }}>
                      Product listings with device image upload support and automatic 20% discount.
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsAddingProduct(true)}
                    className="bm-pill"
                    style={{ margin: 0 }}
                  >
                    <Plus style={{ width: "16px", height: "16px" }} /> Add New Account
                  </Button>
                </div>

                {/* Add Product Modal/Form with Device Image Upload */}
                {isAddingProduct && (
                  <div
                    style={{
                      background: "var(--bm-surface)",
                      border: "1px solid var(--bm-glow)",
                      borderRadius: "12px",
                      padding: "24px",
                      marginBottom: "32px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <h3 style={{ fontSize: "18px" }}>Create New Listing</h3>
                      <button
                        onClick={() => setIsAddingProduct(false)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--bm-ink-soft)",
                          cursor: "pointer",
                        }}
                      >
                        <X style={{ width: "20px", height: "20px" }} />
                      </button>
                    </div>
                    <form
                      onSubmit={handleSaveNewProduct}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "16px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            marginBottom: "6px",
                          }}
                        >
                          CODE (e.g. BM-WOS-03)
                        </label>
                        <input
                          type="text"
                          value={newProduct.code}
                          onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                          placeholder="BM-WOS-03"
                          required
                          style={{
                            width: "100%",
                            background: "var(--bm-paper)",
                            border: "1px solid var(--bm-rule)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "var(--bm-text)",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            marginBottom: "6px",
                          }}
                        >
                          GAME
                        </label>
                        <select
                          value={newProduct.game}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, game: e.target.value as GameSlug })
                          }
                          style={{
                            width: "100%",
                            background: "var(--bm-paper)",
                            border: "1px solid var(--bm-rule)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "var(--bm-text)",
                          }}
                        >
                          <option value="whiteout-survival">Whiteout Survival</option>
                          <option value="kingshot">Kingshot</option>
                          <option value="rise-of-kingdoms">Rise of Kingdoms</option>
                          <option value="call-of-dragons">Call of Dragons</option>
                        </select>
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            marginBottom: "6px",
                          }}
                        >
                          BADGE / LEVEL (e.g. FC 4, TC 28)
                        </label>
                        <input
                          type="text"
                          value={newProduct.badge}
                          onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                          placeholder="FC 4"
                          required
                          style={{
                            width: "100%",
                            background: "var(--bm-paper)",
                            border: "1px solid var(--bm-rule)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "var(--bm-text)",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            marginBottom: "6px",
                          }}
                        >
                          ORIGINAL PRICE (IDR)
                        </label>
                        <input
                          type="number"
                          value={newProduct.price}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, price: Number(e.target.value) })
                          }
                          required
                          style={{
                            width: "100%",
                            background: "var(--bm-paper)",
                            border: "1px solid var(--bm-rule)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "var(--bm-text)",
                          }}
                        />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            marginBottom: "6px",
                          }}
                        >
                          LISTING TITLE & SPECS
                        </label>
                        <input
                          type="text"
                          value={newProduct.title}
                          onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                          placeholder="FC 4 · 72M Power · 5 Mythic Heroes"
                          required
                          style={{
                            width: "100%",
                            background: "var(--bm-paper)",
                            border: "1px solid var(--bm-rule)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "var(--bm-text)",
                          }}
                        />
                      </div>

                      {/* Device Image Upload input */}
                      <div
                        style={{
                          gridColumn: "1 / -1",
                          borderTop: "1px dashed var(--bm-rule)",
                          paddingTop: "14px",
                        }}
                      >
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            marginBottom: "8px",
                          }}
                        >
                          UPLOAD ACCOUNT IMAGE / SCREENSHOT FROM DEVICE
                        </label>
                        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                          {newProduct.image ? (
                            <img
                              src={newProduct.image}
                              alt="Preview"
                              style={{
                                width: "70px",
                                height: "50px",
                                objectFit: "cover",
                                borderRadius: "6px",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "70px",
                                height: "50px",
                                borderRadius: "6px",
                                background: "var(--bm-paper)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--bm-ink-soft)",
                              }}
                            >
                              <ImageIcon style={{ width: "20px", height: "20px" }} />
                            </div>
                          )}
                          <div>
                            <input
                              type="file"
                              ref={fileInputAddRef}
                              accept="image/*"
                              onChange={handleUploadNewProductImage}
                              style={{ display: "none" }}
                            />
                            <Button
                              type="button"
                              onClick={() => fileInputAddRef.current?.click()}
                              variant="outline"
                              size="sm"
                              style={{ height: "36px" }}
                            >
                              <Upload style={{ width: "14px", height: "14px" }} />{" "}
                              {isUploadingImage ? "Uploading..." : "Choose Image from Device"}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          gridColumn: "1 / -1",
                          display: "flex",
                          gap: "12px",
                          marginTop: "6px",
                        }}
                      >
                        <Button type="submit" className="bm-pill" style={{ margin: 0 }}>
                          Create Account
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setIsAddingProduct(false)}
                          variant="outline"
                          className="bm-pill bm-pill--hero"
                          style={{ margin: 0 }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Edit Product Modal with Device Image Upload */}
                {editingProduct && (
                  <div
                    style={{
                      background: "var(--bm-surface)",
                      border: "1px solid var(--bm-glow)",
                      borderRadius: "12px",
                      padding: "24px",
                      marginBottom: "32px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <h3 style={{ fontSize: "18px" }}>Edit Account: {editingProduct.code}</h3>
                      <button
                        onClick={() => setEditingProduct(null)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--bm-ink-soft)",
                          cursor: "pointer",
                        }}
                      >
                        <X style={{ width: "20px", height: "20px" }} />
                      </button>
                    </div>
                    <form
                      onSubmit={handleUpdateProduct}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "16px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            marginBottom: "6px",
                          }}
                        >
                          GAME
                        </label>
                        <select
                          value={editingProduct.game}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              game: e.target.value as GameSlug,
                            })
                          }
                          style={{
                            width: "100%",
                            background: "var(--bm-paper)",
                            border: "1px solid var(--bm-rule)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "var(--bm-text)",
                          }}
                        >
                          <option value="whiteout-survival">Whiteout Survival</option>
                          <option value="kingshot">Kingshot</option>
                          <option value="rise-of-kingdoms">Rise of Kingdoms</option>
                          <option value="call-of-dragons">Call of Dragons</option>
                        </select>
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            marginBottom: "6px",
                          }}
                        >
                          BADGE
                        </label>
                        <input
                          type="text"
                          value={editingProduct.badge}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, badge: e.target.value })
                          }
                          required
                          style={{
                            width: "100%",
                            background: "var(--bm-paper)",
                            border: "1px solid var(--bm-rule)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "var(--bm-text)",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            marginBottom: "6px",
                          }}
                        >
                          ORIGINAL PRICE (IDR)
                        </label>
                        <input
                          type="number"
                          value={editingProduct.price}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                          }
                          required
                          style={{
                            width: "100%",
                            background: "var(--bm-paper)",
                            border: "1px solid var(--bm-rule)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "var(--bm-text)",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            marginBottom: "6px",
                          }}
                        >
                          STATUS
                        </label>
                        <select
                          value={editingProduct.status}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              status: e.target.value as Product["status"],
                            })
                          }
                          style={{
                            width: "100%",
                            background: "var(--bm-paper)",
                            border: "1px solid var(--bm-rule)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "var(--bm-text)",
                          }}
                        >
                          <option value="tersedia">Tersedia (Available)</option>
                          <option value="terjual">Terjual (Sold)</option>
                        </select>
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            marginBottom: "6px",
                          }}
                        >
                          TITLE & DESCRIPTION
                        </label>
                        <input
                          type="text"
                          value={editingProduct.title}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, title: e.target.value })
                          }
                          required
                          style={{
                            width: "100%",
                            background: "var(--bm-paper)",
                            border: "1px solid var(--bm-rule)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "var(--bm-text)",
                          }}
                        />
                      </div>

                      {/* Device Image Upload input for edit */}
                      <div
                        style={{
                          gridColumn: "1 / -1",
                          borderTop: "1px dashed var(--bm-rule)",
                          paddingTop: "14px",
                        }}
                      >
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            marginBottom: "8px",
                          }}
                        >
                          UPDATE ACCOUNT IMAGE FROM DEVICE
                        </label>
                        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                          {editingProduct.image ? (
                            <img
                              src={editingProduct.image}
                              alt="Preview"
                              style={{
                                width: "70px",
                                height: "50px",
                                objectFit: "cover",
                                borderRadius: "6px",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "70px",
                                height: "50px",
                                borderRadius: "6px",
                                background: "var(--bm-paper)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--bm-ink-soft)",
                              }}
                            >
                              <ImageIcon style={{ width: "20px", height: "20px" }} />
                            </div>
                          )}
                          <div>
                            <input
                              type="file"
                              ref={fileInputEditRef}
                              accept="image/*"
                              onChange={handleUploadEditProductImage}
                              style={{ display: "none" }}
                            />
                            <Button
                              type="button"
                              onClick={() => fileInputEditRef.current?.click()}
                              variant="outline"
                              size="sm"
                              style={{ height: "36px" }}
                            >
                              <Upload style={{ width: "14px", height: "14px" }} />{" "}
                              {isUploadingImage ? "Uploading..." : "Replace Image from Device"}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          gridColumn: "1 / -1",
                          display: "flex",
                          gap: "12px",
                          marginTop: "6px",
                        }}
                      >
                        <Button type="submit" className="bm-pill" style={{ margin: 0 }}>
                          Save Changes
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          variant="outline"
                          className="bm-pill bm-pill--hero"
                          style={{ margin: 0 }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Product List with Image Previews */}
                <div style={{ display: "grid", gap: "12px" }}>
                  {products.map((p) => {
                    const gameInfo = findGame(p.game);
                    const imgSrc = p.image || gameInfo?.image;
                    return (
                      <div
                        key={p.code}
                        style={{
                          background: "var(--bm-surface)",
                          border: "1px solid var(--bm-rule)",
                          borderRadius: "8px",
                          padding: "16px 20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "16px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            flex: "1 1 320px",
                          }}
                        >
                          {imgSrc && (
                            <img
                              src={imgSrc}
                              alt={p.title}
                              style={{
                                width: "68px",
                                height: "52px",
                                objectFit: "cover",
                                borderRadius: "6px",
                                border: "1px solid var(--bm-rule)",
                              }}
                            />
                          )}
                          <div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "4px",
                              }}
                            >
                              <span
                                className="bm-mono"
                                style={{ color: "var(--bm-glow)", fontWeight: 700 }}
                              >
                                {p.code}
                              </span>
                              <span className="bm-mono" style={{ color: "var(--bm-ink-soft)" }}>
                                · {p.game} · {p.badge}
                              </span>
                            </div>
                            <h3 style={{ fontSize: "16px", margin: "4px 0" }}>{p.title}</h3>
                            <div
                              style={{
                                display: "flex",
                                gap: "14px",
                                fontSize: "13px",
                                color: "var(--bm-ink-soft)",
                                flexWrap: "wrap",
                              }}
                            >
                              <span>
                                Price:{" "}
                                <span style={{ textDecoration: "line-through" }}>
                                  {formatRupiah(p.price)}
                                </span>
                              </span>
                              <span>
                                20% Off:{" "}
                                <strong style={{ color: "var(--bm-text)" }}>
                                  {formatRupiah(Math.round(p.price * 0.8))}
                                </strong>
                              </span>
                              <span>
                                Status:{" "}
                                <strong
                                  style={{
                                    color:
                                      p.status === "tersedia"
                                        ? "oklch(0.7 0.18 140)"
                                        : "oklch(0.7 0.2 25)",
                                  }}
                                >
                                  {p.status}
                                </strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <Button
                            onClick={() => handleToggleStatus(p.code)}
                            variant="outline"
                            size="sm"
                            style={{ fontSize: "12px", height: "36px" }}
                          >
                            Set {p.status === "tersedia" ? "Sold" : "Available"}
                          </Button>
                          <Button
                            onClick={() => setEditingProduct(p)}
                            variant="outline"
                            size="sm"
                            style={{ fontSize: "12px", height: "36px" }}
                          >
                            <Edit3 style={{ width: "14px", height: "14px" }} /> Edit
                          </Button>

                          {confirmDeleteCode === p.code ? (
                            <div style={{ display: "flex", gap: "4px" }}>
                              <Button
                                onClick={() => executeDeleteProduct(p.code)}
                                variant="destructive"
                                size="sm"
                                style={{ height: "36px", fontSize: "12px" }}
                              >
                                Confirm
                              </Button>
                              <Button
                                onClick={() => setConfirmDeleteCode(null)}
                                variant="ghost"
                                size="sm"
                                style={{ height: "36px", fontSize: "12px" }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => setConfirmDeleteCode(p.code)}
                              variant="ghost"
                              size="sm"
                              style={{ height: "36px", color: "oklch(0.7 0.2 25)" }}
                              aria-label={`Delete ${p.code}`}
                            >
                              <Trash2 style={{ width: "14px", height: "14px" }} />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Top-Ups */}
            {tab === "topups" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <div>
                    <h2>Top-Up Packages</h2>
                    <p style={{ color: "var(--bm-ink-soft)", fontSize: "13px" }}>
                      Manage package tiers and prices with game artwork thumbnails.
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsAddingTopUp(true)}
                    className="bm-pill"
                    style={{ margin: 0 }}
                  >
                    <Plus style={{ width: "16px", height: "16px" }} /> Add Package
                  </Button>
                </div>

                {/* Add Top-Up Form */}
                {isAddingTopUp && (
                  <div
                    style={{
                      background: "var(--bm-surface)",
                      border: "1px solid var(--bm-glow)",
                      borderRadius: "12px",
                      padding: "24px",
                      marginBottom: "32px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <h3 style={{ fontSize: "18px" }}>Create Top-Up Pack</h3>
                      <button
                        onClick={() => setIsAddingTopUp(false)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--bm-ink-soft)",
                          cursor: "pointer",
                        }}
                      >
                        <X style={{ width: "20px", height: "20px" }} />
                      </button>
                    </div>
                    <form
                      onSubmit={handleSaveNewTopUp}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "16px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            marginBottom: "6px",
                          }}
                        >
                          CODE (e.g. WOS-TU-NEW)
                        </label>
                        <input
                          type="text"
                          value={newTopUp.code}
                          onChange={(e) => setNewTopUp({ ...newTopUp, code: e.target.value })}
                          placeholder="WOS-TU-NEW"
                          required
                          style={{
                            width: "100%",
                            background: "var(--bm-paper)",
                            border: "1px solid var(--bm-rule)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "var(--bm-text)",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            marginBottom: "6px",
                          }}
                        >
                          GAME
                        </label>
                        <select
                          value={newTopUp.game}
                          onChange={(e) =>
                            setNewTopUp({ ...newTopUp, game: e.target.value as GameSlug })
                          }
                          style={{
                            width: "100%",
                            background: "var(--bm-paper)",
                            border: "1px solid var(--bm-rule)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "var(--bm-text)",
                          }}
                        >
                          <option value="whiteout-survival">Whiteout Survival</option>
                          <option value="kingshot">Kingshot</option>
                          <option value="rise-of-kingdoms">Rise of Kingdoms</option>
                          <option value="call-of-dragons">Call of Dragons</option>
                        </select>
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            marginBottom: "6px",
                          }}
                        >
                          NAME (e.g. Pack $2.99)
                        </label>
                        <input
                          type="text"
                          value={newTopUp.name}
                          onChange={(e) => setNewTopUp({ ...newTopUp, name: e.target.value })}
                          required
                          style={{
                            width: "100%",
                            background: "var(--bm-paper)",
                            border: "1px solid var(--bm-rule)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "var(--bm-text)",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            marginBottom: "6px",
                          }}
                        >
                          PRICE (IDR)
                        </label>
                        <input
                          type="number"
                          value={newTopUp.price}
                          onChange={(e) =>
                            setNewTopUp({ ...newTopUp, price: Number(e.target.value) })
                          }
                          required
                          style={{
                            width: "100%",
                            background: "var(--bm-paper)",
                            border: "1px solid var(--bm-rule)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "var(--bm-text)",
                          }}
                        />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            marginBottom: "6px",
                          }}
                        >
                          DETAIL
                        </label>
                        <input
                          type="text"
                          value={newTopUp.detail}
                          onChange={(e) => setNewTopUp({ ...newTopUp, detail: e.target.value })}
                          placeholder="Event pack & gems"
                          style={{
                            width: "100%",
                            background: "var(--bm-paper)",
                            border: "1px solid var(--bm-rule)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "var(--bm-text)",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          gridColumn: "1 / -1",
                          display: "flex",
                          gap: "12px",
                          marginTop: "6px",
                        }}
                      >
                        <Button type="submit" className="bm-pill" style={{ margin: 0 }}>
                          Add Package
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setIsAddingTopUp(false)}
                          variant="outline"
                          className="bm-pill bm-pill--hero"
                          style={{ margin: 0 }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Edit Top-Up Form */}
                {editingTopUp && (
                  <div
                    style={{
                      background: "var(--bm-surface)",
                      border: "1px solid var(--bm-glow)",
                      borderRadius: "12px",
                      padding: "24px",
                      marginBottom: "32px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <h3 style={{ fontSize: "18px" }}>Edit Top-Up Pack: {editingTopUp.code}</h3>
                      <button
                        onClick={() => setEditingTopUp(null)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--bm-ink-soft)",
                          cursor: "pointer",
                        }}
                      >
                        <X style={{ width: "20px", height: "20px" }} />
                      </button>
                    </div>
                    <form
                      onSubmit={handleUpdateTopUp}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "16px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            marginBottom: "6px",
                          }}
                        >
                          NAME
                        </label>
                        <input
                          type="text"
                          value={editingTopUp.name}
                          onChange={(e) =>
                            setEditingTopUp({ ...editingTopUp, name: e.target.value })
                          }
                          required
                          style={{
                            width: "100%",
                            background: "var(--bm-paper)",
                            border: "1px solid var(--bm-rule)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "var(--bm-text)",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            marginBottom: "6px",
                          }}
                        >
                          PRICE (IDR)
                        </label>
                        <input
                          type="number"
                          value={editingTopUp.price}
                          onChange={(e) =>
                            setEditingTopUp({ ...editingTopUp, price: Number(e.target.value) })
                          }
                          required
                          style={{
                            width: "100%",
                            background: "var(--bm-paper)",
                            border: "1px solid var(--bm-rule)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "var(--bm-text)",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: 600,
                            marginBottom: "6px",
                          }}
                        >
                          DETAIL
                        </label>
                        <input
                          type="text"
                          value={editingTopUp.detail}
                          onChange={(e) =>
                            setEditingTopUp({ ...editingTopUp, detail: e.target.value })
                          }
                          required
                          style={{
                            width: "100%",
                            background: "var(--bm-paper)",
                            border: "1px solid var(--bm-rule)",
                            borderRadius: "6px",
                            padding: "10px",
                            color: "var(--bm-text)",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          gridColumn: "1 / -1",
                          display: "flex",
                          gap: "12px",
                          marginTop: "6px",
                        }}
                      >
                        <Button type="submit" className="bm-pill" style={{ margin: 0 }}>
                          Save Pack
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setEditingTopUp(null)}
                          variant="outline"
                          className="bm-pill bm-pill--hero"
                          style={{ margin: 0 }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Top-Up List */}
                <div style={{ display: "grid", gap: "12px" }}>
                  {topups.map((t) => {
                    const gameInfo = findGame(t.game);
                    return (
                      <div
                        key={t.code}
                        style={{
                          background: "var(--bm-surface)",
                          border: "1px solid var(--bm-rule)",
                          borderRadius: "8px",
                          padding: "16px 20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "16px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            flex: "1 1 260px",
                          }}
                        >
                          {gameInfo?.image && (
                            <img
                              src={gameInfo.image}
                              alt={t.name}
                              style={{
                                width: "54px",
                                height: "42px",
                                objectFit: "cover",
                                borderRadius: "6px",
                                border: "1px solid var(--bm-rule)",
                              }}
                            />
                          )}
                          <div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "4px",
                              }}
                            >
                              <span
                                className="bm-mono"
                                style={{ color: "var(--bm-glow)", fontWeight: 700 }}
                              >
                                {t.code}
                              </span>
                              <span className="bm-mono" style={{ color: "var(--bm-ink-soft)" }}>
                                · {t.game}
                              </span>
                            </div>
                            <h3 style={{ fontSize: "16px", margin: "4px 0" }}>{t.name}</h3>
                            <p style={{ fontSize: "13px", color: "var(--bm-ink-soft)", margin: 0 }}>
                              {t.detail} —{" "}
                              <strong style={{ color: "var(--bm-text)" }}>
                                {formatRupiah(t.price)}
                              </strong>
                            </p>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <Button
                            onClick={() => setEditingTopUp(t)}
                            variant="outline"
                            size="sm"
                            style={{ fontSize: "12px", height: "36px" }}
                          >
                            <Edit3 style={{ width: "14px", height: "14px" }} /> Edit
                          </Button>

                          {confirmDeleteTopUp === t.code ? (
                            <div style={{ display: "flex", gap: "4px" }}>
                              <Button
                                onClick={() => executeDeleteTopUp(t.code)}
                                variant="destructive"
                                size="sm"
                                style={{ height: "36px", fontSize: "12px" }}
                              >
                                Confirm
                              </Button>
                              <Button
                                onClick={() => setConfirmDeleteTopUp(null)}
                                variant="ghost"
                                size="sm"
                                style={{ height: "36px", fontSize: "12px" }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => setConfirmDeleteTopUp(t.code)}
                              variant="ghost"
                              size="sm"
                              style={{ height: "36px", color: "oklch(0.7 0.2 25)" }}
                              aria-label={`Delete ${t.code}`}
                            >
                              <Trash2 style={{ width: "14px", height: "14px" }} />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Settings */}
            {tab === "settings" && (
              <div style={{ maxWidth: "640px" }}>
                <h2 style={{ marginBottom: "8px" }}>Store Contact Configuration</h2>
                <p style={{ color: "var(--bm-ink-soft)", fontSize: "14px", marginBottom: "24px" }}>
                  Update the direct customer communication channels for order processing and
                  middleman support.
                </p>
                <form onSubmit={handleSaveSettings} style={{ display: "grid", gap: "20px" }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 600,
                        marginBottom: "8px",
                        color: "var(--bm-ink-soft)",
                      }}
                    >
                      DISCORD SERVER URL
                    </label>
                    <input
                      type="text"
                      value={settings.discordLink}
                      onChange={(e) => setSettings({ ...settings, discordLink: e.target.value })}
                      style={{
                        width: "100%",
                        background: "var(--bm-surface)",
                        border: "1px solid var(--bm-rule)",
                        borderRadius: "6px",
                        padding: "12px",
                        color: "var(--bm-text)",
                        fontSize: "14px",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 600,
                        marginBottom: "8px",
                        color: "var(--bm-ink-soft)",
                      }}
                    >
                      WHATSAPP NUMBER
                    </label>
                    <input
                      type="text"
                      value={settings.whatsapp}
                      onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                      style={{
                        width: "100%",
                        background: "var(--bm-surface)",
                        border: "1px solid var(--bm-rule)",
                        borderRadius: "6px",
                        padding: "12px",
                        color: "var(--bm-text)",
                        fontSize: "14px",
                      }}
                    />
                  </div>
                  <Button type="submit" className="bm-pill" style={{ width: "fit-content" }}>
                    Save Contact Links
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
