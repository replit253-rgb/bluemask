import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Gamepad2, HelpCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { AdminGameWorldsManager } from "@/components/AdminGameWorldsManager";
import { AdminHomeGamesManager } from "@/components/AdminHomeGamesManager";
import { AdminFeaturedAccountsManager } from "@/components/AdminFeaturedAccountsManager";
import { AdminTrustSafetyManager } from "@/components/AdminTrustSafetyManager";
import { getFaqsFromDB, saveFaqToDB, deleteFaqFromDB, type FAQ } from "@/lib/db";

type CmsTab =
  | "featured_account_cards"
  | "accounts_for_sale_worlds"
  | "choose_your_game"
  | "trust_safety"
  | "faq";

export const Route = createFileRoute("/admin/cms")({
  head: () => ({
    meta: [
      { title: "Storefront Component Manager — RedMoon" },
      {
        name: "description",
        content: "Manage shared storefront components and FAQs.",
      },
    ],
  }),
  component: AdminCMSPage,
});

function AdminCMSPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CmsTab>("featured_account_cards");
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
    void loadFaqs();
  }, [navigate]);

  const tabs: { id: CmsTab; label: string; icon: typeof Sparkles }[] = [
    {
      id: "featured_account_cards",
      label: "Account for Sale Cards (Home)",
      icon: Sparkles,
    },
    {
      id: "accounts_for_sale_worlds",
      label: "Account List (Accounts)",
      icon: Sparkles,
    },
    {
      id: "choose_your_game",
      label: "Choose your Game",
      icon: Gamepad2,
    },
    { id: "trust_safety", label: "Trust & Safety", icon: ShieldCheck },
    { id: "faq", label: "FAQ Management", icon: HelpCircle },
  ];

  return (
    <main className="bm min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />

      <section className="border-b border-border/40 bg-card/50 py-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/admin"
              className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Admin Panel
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Storefront Component Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage shared storefront components and FAQs. Home page hero content is not managed
            here.
          </p>
        </div>
      </section>

      <section className="max-w-7xl w-full mx-auto px-4 md:px-8 py-6 flex-1">
        <div className="flex items-center gap-2 p-1.5 bg-secondary/40 rounded-xl border border-border/60 mb-6 overflow-x-auto shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap inline-flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-sky-600 text-white shadow"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "featured_account_cards" ? (
          <AdminFeaturedAccountsManager />
        ) : activeTab === "accounts_for_sale_worlds" ? (
          <AdminGameWorldsManager />
        ) : activeTab === "choose_your_game" ? (
          <AdminHomeGamesManager />
        ) : activeTab === "trust_safety" ? (
          <AdminTrustSafetyManager />
        ) : (
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xl max-w-4xl mx-auto">
            <div className="mb-6 pb-4 border-b border-border/40">
              <h2 className="text-xl font-bold">FAQ Component Management</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add, edit, or remove frequently asked questions displayed across public pages.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="flex items-start justify-between gap-4 p-4 bg-secondary/30 rounded-xl border border-border/60"
                >
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-foreground">{faq.question}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                  <Button
                    onClick={() => {
                      void deleteFaqFromDB(faq.id).then(loadFaqs, (error: unknown) => {
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
                onSubmit={async (event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const formData = new FormData(form);
                  try {
                    await saveFaqToDB({
                      id: Date.now().toString(),
                      question: String(formData.get("q") || ""),
                      answer: String(formData.get("a") || ""),
                    });
                    form.reset();
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
