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
import { getPageFromDB, savePageToDB, uploadImageFile, getFaqsFromDB, saveFaqToDB, deleteFaqFromDB, type PageContent, type FAQ } from "@/lib/db";

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
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  const loadFaqs = () => getFaqsFromDB().then(setFaqs);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("bm_is_admin") !== "true") {
      navigate({ to: "/admin/login" });
      return;
    }

    getPageFromDB(activeSlug).then((data) => {
      setPageData(data);
    });
    loadFaqs();
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
            { id: "accounts", label: "Accounts Catalog (/accounts)" },
            { id: "contact", label: "Support & Contact (/contact)" },
            { id: "faq", label: "FAQ Management" },
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
          {activeSlug !== "faq" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
                gap: "32px",
                alignItems: "start",
              }}
            >
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
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--bm-ink-soft)", marginBottom: "6px" }}>HERO HEADLINE TITLE</label>
                    <input type="text" value={pageData.heroTitle} onChange={(e) => setPageData({ ...pageData, heroTitle: e.target.value })} style={{ width: "100%", background: "var(--bm-paper)", border: "1px solid var(--bm-rule)", borderRadius: "6px", padding: "12px", color: "var(--bm-text)", fontSize: "15px" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--bm-ink-soft)", marginBottom: "6px" }}>HERO SUBTITLE / LEAD TEXT</label>
                    <textarea rows={3} value={pageData.heroSubtitle} onChange={(e) => setPageData({ ...pageData, heroSubtitle: e.target.value })} style={{ width: "100%", background: "var(--bm-paper)", border: "1px solid var(--bm-rule)", borderRadius: "6px", padding: "12px", color: "var(--bm-text)", fontSize: "14px", resize: "vertical" }} />
                  </div>
                  <Button type="submit" className="bm-btn bm-btn-primary mt-2">
                    <Save className="w-4 h-4 mr-1.5" /> Save to Database
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div style={{ background: "var(--bm-surface)", border: "1px solid var(--bm-rule)", borderRadius: "12px", padding: "28px" }}>
              <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>FAQ Management</h2>
              <div style={{ display: "grid", gap: "10px" }}>
                {faqs.map((f) => (
                  <div key={f.id} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "10px", background: "var(--bm-paper)", borderRadius: "6px" }}>
                    <div style={{ flex: 1 }}>
                      <strong>{f.question}</strong>
                      <p style={{ fontSize: "12px" }}>{f.answer}</p>
                    </div>
                    <Button onClick={() => deleteFaqFromDB(f.id).then(loadFaqs)} variant="ghost" size="sm" className="text-rose-400">Delete</Button>
                  </div>
                ))}
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  await saveFaqToDB({
                    id: Date.now().toString(),
                    question: formData.get("q") as string,
                    answer: formData.get("a") as string,
                  });
                  e.currentTarget.reset();
                  loadFaqs();
                }} style={{ display: "grid", gap: "10px", marginTop: "10px" }}>
                  <input name="q" placeholder="Question" required style={{ padding: "8px", borderRadius: "4px" }} />
                  <textarea name="a" placeholder="Answer" required style={{ padding: "8px", borderRadius: "4px" }} />
                  <Button type="submit">Add FAQ</Button>
                </form>
              </div>
            </div>
          )}
      </section>

      <SiteFooter />
    </main>
  );
}
