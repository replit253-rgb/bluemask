import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, MessageSquare, ShieldCheck } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { useStoreSettings } from "@/hooks/use-store-settings";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact RedMoon — Support & Discord" },
      {
        name: "description",
        content:
          "Get in touch with the RedMoon team for product questions, middleman support, and top up assistance via Discord and WhatsApp.",
      },
      { property: "og:title", content: "Contact RedMoon — Support & Discord" },
      {
        property: "og:description",
        content:
          "Connect with RedMoon on Discord or WhatsApp. Fast support for accounts and top ups.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
  notFoundComponent: () => null,
});

const helpTopics = [
  "Product and account questions",
  "Order and payment support",
  "Delivery assistance",
  "Warranty and after-sales support",
  "Custom account requests",
];

function ContactPage() {
  const activeSettings = useStoreSettings();
  const rawWa = activeSettings.whatsapp;
  const cleanWa = rawWa.replace(/\D/g, "");
  const rawDiscord = activeSettings.discordLink;
  const discordUser = activeSettings.discordUsers[0];
  const displayDiscord = rawDiscord.replace("https://", "");

  return (
    <main className="bm">
      <SiteHeader />

      <section className="bm-detail-hero" style={{ paddingBottom: "40px" }}>
        <nav className="bm-breadcrumb bm-mono" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">›</span>
          <span>Contact</span>
        </nav>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <span className="text-xs font-semibold tracking-wider text-sky-400 uppercase">
            Support
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            We're here to help.
          </h1>
          <p className="bm-lead" style={{ fontSize: "17px", marginBottom: "32px" }}>
            The RedMoon team can help with product questions, payment guidance, delivery support,
            transfer assistance, and transaction process questions.
          </p>
          <p className="bm-lead" style={{ fontSize: "15px", color: "var(--bm-ink-soft)" }}>
            You can contact us anytime on Discord or WhatsApp. We are mostly available during
            European and Asian hours, and we usually reply within 24 hours. If we are online, you
            may receive a response much faster.
          </p>
        </div>
      </section>

      <section className="bm-section" style={{ paddingTop: "0" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div
            style={{
              background: "var(--bm-surface)",
              border: "1px solid var(--bm-rule)",
              borderRadius: "12px",
              padding: "36px",
              marginBottom: "48px",
            }}
          >
            <h2 style={{ fontSize: "24px", marginBottom: "24px" }}>Contact Information</h2>
            <ul style={{ listStyle: "none", display: "grid", gap: "16px", fontSize: "15px" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <strong style={{ minWidth: "140px", color: "var(--bm-ink-soft)" }}>
                  Discord User:
                </strong>
                {discordUser ? (
                  <a
                    href={discordUser.link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "var(--bm-glow)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontWeight: 600,
                    }}
                  >
                    <MessageSquare style={{ width: "16px", height: "16px" }} />
                    {discordUser.name} <ArrowUpRight style={{ width: "14px", height: "14px" }} />
                  </a>
                ) : (
                  <span>Not configured</span>
                )}
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <strong style={{ minWidth: "140px", color: "var(--bm-ink-soft)" }}>
                  Discord Server:
                </strong>
                {rawDiscord ? (
                  <a
                    href={rawDiscord}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "var(--bm-glow)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontWeight: 600,
                    }}
                  >
                    <MessageSquare style={{ width: "16px", height: "16px" }} />
                    {displayDiscord} <ArrowUpRight style={{ width: "14px", height: "14px" }} />
                  </a>
                ) : (
                  <span>Not configured</span>
                )}
              </li>
              {rawWa && (
                <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <strong style={{ minWidth: "140px", color: "var(--bm-ink-soft)" }}>
                    WhatsApp:
                  </strong>
                  <a href={`https://wa.me/${cleanWa}`} target="_blank" rel="noreferrer">
                    {rawWa} <ArrowUpRight style={{ width: "14px", height: "14px" }} />
                  </a>
                </li>
              )}

              <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <strong style={{ minWidth: "140px", color: "var(--bm-ink-soft)" }}>
                  Response Time:
                </strong>
                <span>Usually within 24 hours</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <strong style={{ minWidth: "140px", color: "var(--bm-ink-soft)" }}>
                  Availability:
                </strong>
                <span>European and Asian hours (14:00 – 01:00 UTC)</span>
              </li>
            </ul>
          </div>

          <div
            style={{
              background: "var(--bm-surface)",
              border: "1px solid var(--bm-rule)",
              borderRadius: "12px",
              padding: "36px",
            }}
          >
            <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>How We Can Help</h2>
            <p style={{ color: "var(--bm-ink-soft)", marginBottom: "20px" }}>
              You can contact us for:
            </p>
            <ul style={{ listStyle: "none", display: "grid", gap: "14px" }}>
              {helpTopics.map((topic) => (
                <li
                  key={topic}
                  style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "15px" }}
                >
                  <Check
                    style={{
                      width: "18px",
                      height: "18px",
                      color: "var(--bm-glow)",
                      flexShrink: 0,
                    }}
                  />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
