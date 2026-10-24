import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Shield,
  Upload,
  Eye,
  Save,
  Monitor,
  Tablet,
  Smartphone,
  ArrowLeft,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Layers,
  FileText,
  HelpCircle,
  Globe,
  Sparkles,
  Gamepad2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { AdminGameWorldsManager } from "@/components/AdminGameWorldsManager";
import { AdminHomeGamesManager } from "@/components/AdminHomeGamesManager";
import { AdminFeaturedAccountsManager } from "@/components/AdminFeaturedAccountsManager";
import {
  getPageFromDB,
  savePageToDB,
  uploadImageFile,
  getFaqsFromDB,
  saveFaqToDB,
  deleteFaqFromDB,
  type PageContent,
  type FAQ,
} from "@/lib/db";

export const Route = createFileRoute("/admin/cms")({
  head: () => ({
    meta: [
      { title: "CMS & Component Manager — RedMoon" },
      { name: "description", content: "Granular per-component CMS and real-time live preview." },
    ],
  }),
  component: AdminCMSPage,
});

function AdminCMSPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeSlug, setActiveSlug] = useState<string>("home");
  const [pageData, setPageData] = useState<PageContent | null>(null);
  const [pageLoadError, setPageLoadError] = useState<string | null>(null);

  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isUploading, setIsUploading] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  const loadFaqs = () =>
    getFaqsFromDB().then(setFaqs, (error: unknown) => {
      console.error("Failed to load FAQs from PostgreSQL:", error);
    });

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("bm_is_admin") !== "true") {
      navigate({ to: "/admin/login" });
      return;
    }

    setPageLoadError(null);
    void getPageFromDB(activeSlug).then(
      (data) => setPageData(data),
      (error: unknown) => {
        console.error("Failed to load CMS page from PostgreSQL:", error);
        setPageLoadError("Unable to load page content from PostgreSQL.");
      },
    );
    void loadFaqs();
  }, [activeSlug, navigate]);

  const handleDeviceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const dataUrl = await uploadImageFile(file);
      if (pageData) {
        setPageData((prev) => (prev ? { ...prev, heroImage: dataUrl } : null));
      }
    } catch (err) {
      console.warn("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageData) return;
    const updated = { ...pageData, updatedAt: new Date().toISOString() };
    try {
      await savePageToDB(updated);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
      setPageLoadError(null);
    } catch (error) {
      console.error("Failed to save CMS page to PostgreSQL:", error);
      setPageLoadError("Unable to save page content to PostgreSQL.");
    }
  };

  const previewWidth =
    previewDevice === "desktop" ? "100%" : previewDevice === "tablet" ? "768px" : "375px";

  const getPageUrl = () => {
    if (activeSlug === "home") return "/";
    if (activeSlug === "global_chrome") return "/";
    return `/${activeSlug}`;
  };

  return (
    <main className="bm min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />

      {/* Top Header */}
      <section className="border-b border-border/40 bg-card/50 py-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                to="/admin"
                className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1.5 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Admin Panel
              </Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              CMS Component & Page Manager
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Edit every component, headline, image, and text block per page with instant live
              preview.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {savedNotice && (
              <span className="text-xs font-semibold text-emerald-400 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/30">
                <Check className="w-3.5 h-3.5" /> Published Successfully!
              </span>
            )}
            <Button
              onClick={handleSavePage}
              className="bg-sky-500 hover:bg-sky-600 text-sky-950 font-bold px-5 shadow-md"
            >
              <Save className="w-4 h-4 mr-2" /> Publish All Changes
            </Button>
          </div>
        </div>
      </section>

      {/* Page & Component Selector Tabs */}
      <section className="max-w-7xl w-full mx-auto px-4 md:px-8 py-6 flex-1">
        <div className="flex items-center gap-2 p-1.5 bg-secondary/40 rounded-xl border border-border/60 mb-6 overflow-x-auto shadow-sm">
          {[
            {
              id: "featured_account_cards",
              label: "Account for Sale Cards (Home)",
              icon: Sparkles,
            },
            {
              id: "accounts_for_sale_worlds",
              label: "Four Worlds Showcase",
              icon: Sparkles,
            },
            {
              id: "choose_your_game",
              label: "Choose your Game (Home)",
              icon: Gamepad2,
            },
            { id: "home", label: "Home Page (/)Components", icon: Layers },
            { id: "accounts", label: "Accounts Catalog", icon: FileText },
            { id: "games", label: "Top Up & Games", icon: Layers },
            { id: "services", label: "Services & Escrow", icon: Layers },
            { id: "contact", label: "Support & Contact", icon: FileText },
            { id: "global_chrome", label: "Global Header & Footer", icon: Globe },
            { id: "faq", label: "FAQ Management", icon: HelpCircle },
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSlug(tab.id)}
                className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap inline-flex items-center gap-2 ${
                  activeSlug === tab.id
                    ? "bg-sky-600 text-white shadow"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <IconComponent className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Component / Page Views */}
        {activeSlug === "featured_account_cards" ? (
          <AdminFeaturedAccountsManager />
        ) : activeSlug === "accounts_for_sale_worlds" ? (
          <AdminGameWorldsManager />
        ) : activeSlug === "choose_your_game" ? (
          <AdminHomeGamesManager />
        ) : activeSlug !== "faq" && !pageData ? (
          <div className="rounded-xl border border-border/60 bg-card/60 p-6">
            {pageLoadError ? (
              <p role="alert" className="text-sm text-red-300">
                {pageLoadError}
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  No page content exists in PostgreSQL for “{activeSlug}”.
                </p>
                <Button
                  onClick={() =>
                    setPageData({
                      slug: activeSlug,
                      title: "",
                      heroTitle: "",
                      heroSubtitle: "",
                      heroImage: "",
                      updatedAt: new Date().toISOString(),
                    })
                  }
                >
                  Create empty page
                </Button>
              </>
            )}
          </div>
        ) : activeSlug !== "faq" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Editor Panel (5 cols) */}
            <div className="lg:col-span-6 bg-card border border-border/80 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
                <div>
                  <h2 className="text-lg font-bold capitalize">
                    {activeSlug.replace("_", " ")} Page Components
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Modify component contents below. Changes appear instantly in preview.
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-sky-950/60 text-sky-400 font-mono border border-sky-500/30">
                  slug: {activeSlug}
                </span>
              </div>

              <form onSubmit={handleSavePage} className="space-y-5">
                {/* Meta Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Browser Page Title
                  </label>
                  <input
                    type="text"
                    value={pageData.title || ""}
                    onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
                    className="w-full bg-background border border-input rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>

                {/* Hero Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Hero Headline Title Component
                  </label>
                  <input
                    type="text"
                    value={pageData.heroTitle || ""}
                    onChange={(e) => setPageData({ ...pageData, heroTitle: e.target.value })}
                    className="w-full bg-background border border-input rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-sky-500 outline-none font-semibold"
                  />
                </div>

                {/* Hero Subtitle */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Hero Subtitle / Description
                  </label>
                  <textarea
                    rows={3}
                    value={pageData.heroSubtitle || ""}
                    onChange={(e) => setPageData({ ...pageData, heroSubtitle: e.target.value })}
                    className="w-full bg-background border border-input rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-sky-500 outline-none resize-vertical"
                  />
                </div>

                {/* Lead Text */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Lead Paragraph / Notice Component
                  </label>
                  <textarea
                    rows={2}
                    value={pageData.leadText || ""}
                    onChange={(e) => setPageData({ ...pageData, leadText: e.target.value })}
                    className="w-full bg-background border border-input rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-sky-500 outline-none resize-vertical"
                  />
                </div>

                {/* Announcement Banner Text */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Announcement Banner Text (Global or Page)
                  </label>
                  <input
                    type="text"
                    value={pageData.announcement || ""}
                    onChange={(e) => setPageData({ ...pageData, announcement: e.target.value })}
                    placeholder="e.g. Flash Sale: 20% discount on all accounts!"
                    className="w-full bg-background border border-input rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>

                {/* Section Headings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Section Heading
                    </label>
                    <input
                      type="text"
                      value={pageData.sectionTitle || ""}
                      onChange={(e) => setPageData({ ...pageData, sectionTitle: e.target.value })}
                      className="w-full bg-background border border-input rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Section Subtitle
                    </label>
                    <input
                      type="text"
                      value={pageData.sectionSubtitle || ""}
                      onChange={(e) =>
                        setPageData({ ...pageData, sectionSubtitle: e.target.value })
                      }
                      className="w-full bg-background border border-input rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                </div>

                {/* Hero Image Upload */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Hero / Banner Image
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={pageData.heroImage || ""}
                      onChange={(e) => setPageData({ ...pageData, heroImage: e.target.value })}
                      className="flex-1 bg-background border border-input rounded-lg px-3.5 py-2 text-xs text-foreground font-mono"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleDeviceImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      disabled={isUploading}
                      className="shrink-0"
                    >
                      <Upload className="w-4 h-4 mr-1.5" />
                      {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                  {pageData.heroImage && (
                    <div className="mt-3 h-28 rounded-lg overflow-hidden border border-border/50 relative">
                      <img
                        src={pageData.heroImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Hero Image Mobile */}
                {activeSlug === "home" && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Hero Image (Mobile Screens &lt;= 768px)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={pageData.heroImageMobile || ""}
                        onChange={(e) =>
                          setPageData({ ...pageData, heroImageMobile: e.target.value })
                        }
                        placeholder="/bg-hero-mobile.png"
                        className="flex-1 bg-background border border-input rounded-lg px-3.5 py-2 text-xs text-foreground font-mono"
                      />
                    </div>
                    {pageData.heroImageMobile && (
                      <div className="mt-3 h-28 rounded-lg overflow-hidden border border-border/50 relative">
                        <img
                          src={pageData.heroImageMobile}
                          alt="Mobile Hero Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Primary Button Text
                    </label>
                    <input
                      type="text"
                      value={pageData.buttonText || ""}
                      onChange={(e) => setPageData({ ...pageData, buttonText: e.target.value })}
                      className="w-full bg-background border border-input rounded-lg px-3.5 py-2 text-sm text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Secondary Button Text
                    </label>
                    <input
                      type="text"
                      value={pageData.secondaryButtonText || ""}
                      onChange={(e) =>
                        setPageData({ ...pageData, secondaryButtonText: e.target.value })
                      }
                      className="w-full bg-background border border-input rounded-lg px-3.5 py-2 text-sm text-foreground"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border/40">
                  <Button
                    type="submit"
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 shadow-lg"
                  >
                    <Save className="w-4 h-4 mr-2" /> Save & Publish Component Updates
                  </Button>
                </div>
              </form>
            </div>

            {/* Live Preview Panel (6 cols) */}
            <div className="lg:col-span-6 sticky top-24 bg-card border border-border/80 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/45">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-sky-400" />
                  <h3 className="font-bold text-base">Real-Time Live Preview</h3>
                </div>

                <div className="flex items-center gap-2 bg-background p-1 rounded-lg border border-border/60">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded ${previewDevice === "desktop" ? "bg-sky-600 text-white" : "text-muted-foreground hover:text-foreground"}`}
                    title="Desktop view"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice("tablet")}
                    className={`p-1.5 rounded ${previewDevice === "tablet" ? "bg-sky-600 text-white" : "text-muted-foreground hover:text-foreground"}`}
                    title="Tablet view"
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded ${previewDevice === "mobile" ? "bg-sky-600 text-white" : "text-muted-foreground hover:text-foreground"}`}
                    title="Mobile view"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 px-1">
                <span>
                  Target Route: <strong className="text-foreground">{getPageUrl()}</strong>
                </span>
                <a
                  href={getPageUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 hover:underline inline-flex items-center gap-1"
                >
                  Open in New Tab <ArrowLeft className="w-3 h-3 rotate-180" />
                </a>
              </div>

              {/* Preview Frame Container */}
              <div className="flex justify-center bg-background/85 rounded-xl border border-border/60 p-4 overflow-hidden shadow-inner">
                <div
                  style={{ width: previewWidth, transition: "width 0.3s ease" }}
                  className="bg-card rounded-lg border border-border/80 shadow-2xl overflow-hidden flex flex-col h-[620px]"
                >
                  <div className="bg-secondary/85 px-4 py-2 border-b border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                    </div>
                    <span className="font-mono text-[11px]">{getPageUrl()}</span>
                    <span className="text-[10px] text-sky-400 font-medium">LIVE PREVIEW</span>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-background p-6 space-y-6">
                    {pageData.announcement && (
                      <div className="bg-sky-950/80 border border-sky-400/40 text-sky-200 text-xs py-2 px-3 rounded-lg text-center font-medium">
                        {pageData.announcement}
                      </div>
                    )}

                    {/* Simulated Hero Section */}
                    <div className="relative rounded-xl overflow-hidden border border-border/60 p-8 text-center min-h-[240px] flex flex-col items-center justify-center">
                      <div className="absolute inset-0 z-0">
                        <img
                          src={pageData.heroImage}
                          alt="Hero"
                          className="w-full h-full object-cover opacity-40"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
                      </div>

                      <div className="relative z-10 max-w-lg space-y-3">
                        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                          {pageData.heroTitle}
                        </h1>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {pageData.heroSubtitle}
                        </p>
                        {pageData.leadText && (
                          <p className="text-[11px] text-sky-300 font-medium">
                            {pageData.leadText}
                          </p>
                        )}
                        <div className="flex items-center justify-center gap-3 pt-2">
                          {pageData.buttonText && (
                            <span className="px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-bold shadow">
                              {pageData.buttonText}
                            </span>
                          )}
                          {pageData.secondaryButtonText && (
                            <span className="px-4 py-2 rounded-lg bg-secondary text-foreground text-xs font-semibold border border-border">
                              {pageData.secondaryButtonText}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Section preview */}
                    {pageData.sectionTitle && (
                      <div className="space-y-2 pt-2">
                        <h3 className="font-bold text-sm">{pageData.sectionTitle}</h3>
                        <p className="text-xs text-muted-foreground">{pageData.sectionSubtitle}</p>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="p-3 bg-secondary/40 rounded-lg border border-border/50">
                            <div className="h-2 w-16 bg-primary/40 rounded mb-2"></div>
                            <div className="h-1.5 w-full bg-muted rounded"></div>
                          </div>
                          <div className="p-3 bg-secondary/40 rounded-lg border border-border/50">
                            <div className="h-2 w-16 bg-primary/40 rounded mb-2"></div>
                            <div className="h-1.5 w-full bg-muted rounded"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* FAQ Management Tab */
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xl max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
              <div>
                <h2 className="text-xl font-bold">FAQ Component Management</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add, edit, or remove frequently asked questions displayed across public pages.
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {faqs.map((f) => (
                <div
                  key={f.id}
                  className="flex items-start justify-between gap-4 p-4 bg-secondary/30 rounded-xl border border-border/60"
                >
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-foreground">{f.question}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.answer}</p>
                  </div>
                  <Button
                    onClick={() => {
                      void deleteFaqFromDB(f.id).then(loadFaqs, (error: unknown) => {
                        console.error("Failed to delete FAQ from PostgreSQL:", error);
                      });
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>

            <div className="bg-secondary/20 border border-border/80 rounded-xl p-6">
              <h3 className="font-bold text-sm mb-4">Add New FAQ Question</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  try {
                    await saveFaqToDB({
                      id: Date.now().toString(),
                      question: String(formData.get("q") || ""),
                      answer: String(formData.get("a") || ""),
                    });
                    e.currentTarget.reset();
                    await loadFaqs();
                  } catch (error) {
                    console.error("Failed to save FAQ to PostgreSQL:", error);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Question
                  </label>
                  <input
                    name="q"
                    placeholder="e.g. How fast is top-up delivery?"
                    required
                    className="w-full bg-background border border-input rounded-lg px-3.5 py-2.5 text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Answer
                  </label>
                  <textarea
                    name="a"
                    rows={3}
                    placeholder="e.g. Top-ups are processed within minutes..."
                    required
                    className="w-full bg-background border border-input rounded-lg px-3.5 py-2.5 text-sm text-foreground resize-vertical"
                  />
                </div>
                <Button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-bold">
                  Add FAQ Item
                </Button>
              </form>
            </div>
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
