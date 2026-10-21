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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getPageFromDB, savePageToDB, uploadImageFile, type PageContent } from "@/lib/db";

export const Route = createFileRoute("/admin/cms")({
  head: () => ({
    meta: [
      { title: "Live Preview CMS — BlueMask" },
      { name: "description", content: "Content management system with real-time live preview." },
    ],
  }),
  component: AdminCMSPage,
});

function AdminCMSPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeSlug, setActiveSlug] = useState<string>("home");
  const [pageData, setPageData] = useState<PageContent>({
    slug: "home",
    title: "BlueMask Gaming Store",
    heroTitle: "BlueMask Gaming Store",
    heroSubtitle: "Great accounts. Safer trades. More possibilities in every game.",
    heroImage: "/assets/aistudio/bg_fe70fe49.jpg",
    leadText: "Your trusted destination for game accounts and top-ups.",
    announcement: "Flash Sale: All game accounts feature an automatic 20% discount!",
    updatedAt: new Date().toISOString(),
  });

  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isUploading, setIsUploading] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("bm_is_admin") !== "true") {
      navigate({ to: "/admin/login" });
      return;
    }

    getPageFromDB(activeSlug).then((data) => {
      setPageData(data);
    });
  }, [activeSlug, navigate]);

  const handleDeviceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const dataUrl = await uploadImageFile(file);
      setPageData((prev) => ({ ...prev, heroImage: dataUrl }));
    } catch (err) {
      console.warn("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...pageData, updatedAt: new Date().toISOString() };
    await savePageToDB(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const previewWidth =
    previewDevice === "desktop" ? "100%" : previewDevice === "tablet" ? "768px" : "375px";

  return (
    <main className="bm">
      <SiteHeader />

      {/* Top Header */}
      <section className="bm-detail-hero" style={{ paddingBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}
            >
              <Link
                to="/admin"
                style={{
                  color: "var(--bm-glow)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                }}
              >
                <ArrowLeft style={{ width: "16px", height: "16px" }} /> Back to Management Panel
              </Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-1">
              Content Management & Live Preview
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {savedNotice && (
              <span className="text-sm font-semibold text-emerald-400 inline-flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Saved to Database!
              </span>
            )}
            <Button onClick={handleSavePage} className="bm-btn bm-btn-primary">
              <Save className="w-4 h-4 mr-1.5" /> Publish Changes
            </Button>
          </div>
        </div>
      </section>

      {/* Page Selector Tabs */}
      <section className="bm-section pt-0">
        <div className="flex items-center gap-1.5 p-1.5 bg-secondary/30 rounded-lg border border-border/50 mb-6 overflow-x-auto">
          {[
            { id: "home", label: "Home Page (/)" },
            { id: "accounts", label: "Accounts Catalog (/akun)" },
            { id: "contact", label: "Support & Contact (/contact)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSlug(tab.id)}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                activeSlug === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Split Grid: Editor (Left) & Live Preview (Right) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
            gap: "32px",
            alignItems: "start",
          }}
        >
          {/* Left: Content Editor */}
          <div
            style={{
              background: "var(--bm-surface)",
              border: "1px solid var(--bm-rule)",
              borderRadius: "12px",
              padding: "28px",
            }}
          >
            <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>Page Configuration</h2>

            <form onSubmit={handleSavePage} style={{ display: "grid", gap: "20px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--bm-ink-soft)",
                    marginBottom: "6px",
                  }}
                >
                  HERO HEADLINE TITLE
                </label>
                <input
                  type="text"
                  value={pageData.heroTitle}
                  onChange={(e) => setPageData({ ...pageData, heroTitle: e.target.value })}
                  style={{
                    width: "100%",
                    background: "var(--bm-paper)",
                    border: "1px solid var(--bm-rule)",
                    borderRadius: "6px",
                    padding: "12px",
                    color: "var(--bm-text)",
                    fontSize: "15px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--bm-ink-soft)",
                    marginBottom: "6px",
                  }}
                >
                  HERO SUBTITLE / LEAD TEXT
                </label>
                <textarea
                  rows={3}
                  value={pageData.heroSubtitle}
                  onChange={(e) => setPageData({ ...pageData, heroSubtitle: e.target.value })}
                  style={{
                    width: "100%",
                    background: "var(--bm-paper)",
                    border: "1px solid var(--bm-rule)",
                    borderRadius: "6px",
                    padding: "12px",
                    color: "var(--bm-text)",
                    fontSize: "14px",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Upload image from device */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--bm-ink-soft)",
                    marginBottom: "8px",
                  }}
                >
                  HERO BACKGROUND IMAGE (FROM DEVICE)
                </label>

                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <img
                    src={pageData.heroImage}
                    alt="Hero Preview"
                    style={{
                      width: "90px",
                      height: "65px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: "1px solid var(--bm-rule)",
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleDeviceImageUpload}
                      style={{ display: "none" }}
                    />
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      variant="outline"
                      className="bm-btn bm-btn-outline w-full justify-center"
                    >
                      <Upload className="w-4 h-4 mr-1.5" />
                      {isUploading ? "Uploading..." : "Upload Image from Device"}
                    </Button>
                    <span
                      style={{
                        display: "block",
                        fontSize: "11px",
                        color: "var(--bm-ink-soft)",
                        marginTop: "6px",
                      }}
                    >
                      Upload PNG, JPG, or WebP. Saved to relational store.
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--bm-ink-soft)",
                    marginBottom: "6px",
                  }}
                >
                  ANNOUNCEMENT BANNER
                </label>
                <input
                  type="text"
                  value={pageData.announcement || ""}
                  onChange={(e) => setPageData({ ...pageData, announcement: e.target.value })}
                  placeholder="e.g. 20% Discount active across all accounts!"
                  style={{
                    width: "100%",
                    background: "var(--bm-paper)",
                    border: "1px solid var(--bm-rule)",
                    borderRadius: "6px",
                    padding: "12px",
                    color: "var(--bm-text)",
                    fontSize: "14px",
                  }}
                />
              </div>

              <Button type="submit" className="bm-btn bm-btn-primary mt-2">
                <Save className="w-4 h-4 mr-1.5" /> Save to Database
              </Button>
            </form>
          </div>

          {/* Right: Live Preview Panel */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye style={{ width: "18px", height: "18px", color: "var(--bm-glow)" }} />
                <span style={{ fontWeight: 700, fontSize: "15px" }}>Interactive Live Preview</span>
              </div>

              {/* Device Viewport Selector */}
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  background: "var(--bm-surface)",
                  padding: "4px",
                  borderRadius: "6px",
                  border: "1px solid var(--bm-rule)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  style={{
                    background: previewDevice === "desktop" ? "var(--bm-blue)" : "transparent",
                    color: "var(--bm-text)",
                    border: "none",
                    borderRadius: "4px",
                    padding: "6px 10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                  }}
                >
                  <Monitor style={{ width: "14px", height: "14px" }} /> Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("tablet")}
                  style={{
                    background: previewDevice === "tablet" ? "var(--bm-blue)" : "transparent",
                    color: "var(--bm-text)",
                    border: "none",
                    borderRadius: "4px",
                    padding: "6px 10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                  }}
                >
                  <Tablet style={{ width: "14px", height: "14px" }} /> Tablet
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  style={{
                    background: previewDevice === "mobile" ? "var(--bm-blue)" : "transparent",
                    color: "var(--bm-text)",
                    border: "none",
                    borderRadius: "4px",
                    padding: "6px 10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                  }}
                >
                  <Smartphone style={{ width: "14px", height: "14px" }} /> Mobile
                </button>
              </div>
            </div>

            {/* Container representing device viewport */}
            <div
              style={{
                width: previewWidth,
                maxWidth: "100%",
                margin: "0 auto",
                border: "2px solid var(--bm-glow)",
                borderRadius: "12px",
                overflow: "hidden",
                background: "var(--bm-paper)",
                boxShadow: "var(--bm-shadow)",
                transition: "width 0.3s ease",
              }}
            >
              {/* Simulated Browser Bar */}
              <div
                style={{
                  background: "var(--bm-surface)",
                  borderBottom: "1px solid var(--bm-rule)",
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12px",
                  color: "var(--bm-ink-soft)",
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#ef4444",
                    display: "inline-block",
                  }}
                ></span>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#f59e0b",
                    display: "inline-block",
                  }}
                ></span>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#10b981",
                    display: "inline-block",
                  }}
                ></span>
                <span style={{ marginLeft: "12px", opacity: 0.8 }}>
                  https://bluemask.store/{activeSlug === "home" ? "" : activeSlug}
                </span>
              </div>

              {/* Live Preview Render */}
              <div
                style={{
                  minHeight: "480px",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "48px 32px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={pageData.heroImage}
                  alt="Live Hero Preview"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    zIndex: 0,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(90deg, oklch(0.134 0.041 253 / 94%) 0%, oklch(0.134 0.041 253 / 70%) 60%, oklch(0.134 0.041 253 / 30%) 100%)",
                    zIndex: 1,
                  }}
                />

                <div style={{ position: "relative", zIndex: 2, maxWidth: "540px" }}>
                  {pageData.announcement && (
                    <span
                      style={{
                        display: "inline-block",
                        background: "var(--bm-blue)",
                        color: "var(--bm-on-accent)",
                        padding: "4px 10px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 700,
                        marginBottom: "16px",
                        textTransform: "uppercase",
                      }}
                    >
                      {pageData.announcement}
                    </span>
                  )}
                  <h2
                    style={{
                      fontSize: previewDevice === "mobile" ? "28px" : "42px",
                      fontWeight: 800,
                      lineHeight: 1.15,
                      marginBottom: "16px",
                      color: "var(--bm-text)",
                    }}
                  >
                    {pageData.heroTitle}
                  </h2>
                  <p
                    style={{
                      fontSize: previewDevice === "mobile" ? "14px" : "16px",
                      color: "var(--bm-paper-soft)",
                      lineHeight: 1.6,
                      marginBottom: "24px",
                    }}
                  >
                    {pageData.heroSubtitle}
                  </p>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <div
                      className="bm-pill"
                      style={{
                        pointerEvents: "none",
                        margin: 0,
                        padding: "10px 18px",
                        fontSize: "12px",
                      }}
                    >
                      Explore accounts →
                    </div>
                    <div
                      className="bm-pill bm-pill--hero"
                      style={{
                        pointerEvents: "none",
                        margin: 0,
                        padding: "10px 18px",
                        fontSize: "12px",
                      }}
                    >
                      Our services →
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Preview note */}
              <div
                style={{
                  padding: "12px 16px",
                  background: "var(--bm-surface)",
                  borderTop: "1px solid var(--bm-rule)",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  color: "var(--bm-ink-soft)",
                }}
              >
                <span>Real-time preview rendered dynamically from database.</span>
                <span>Viewport: {previewDevice.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
