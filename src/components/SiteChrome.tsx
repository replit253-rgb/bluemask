import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown, Menu, ShoppingCart, X } from "lucide-react";
import { discordLink, games, gamesForService, services } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import logoAsset from "@/assets/logo.png";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="bm-header relative">
      <Link to="/" className="bm-logo" aria-label="reedmoon, home">
        <img
          src={logoAsset}
          width={42}
          height={42}
          alt="reedmoon logo"
          className="rounded-lg object-contain h-10 w-10"
        />
        <span className="text-white text-xl md:text-2xl font-bold tracking-tight">
          reed<span className="text-red-500">moon</span>
        </span>
      </Link>
      <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-slate-300">
        <Link to="/" className="hover:text-white transition-colors py-2">
          Home
        </Link>
        <Link to="/games" className="hover:text-white transition-colors py-2">
          Games
        </Link>
        <Link to="/accounts" className="hover:text-white transition-colors py-2">
          Accounts
        </Link>
        <Link to="/services" className="hover:text-white transition-colors py-2">
          Services
        </Link>
        <Link to="/contact" className="hover:text-white transition-colors py-2">
          Contact
        </Link>
      </nav>
      <div className="flex items-center gap-5">
        <a
          href={discordLink}
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-400 bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 rounded-lg transition-colors"
        >
          <span>Discord</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
        <Link
          to="/accounts"
          search={{}}
          className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Cart"
        >
          <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white h-10 w-10 hover:bg-white/10"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="absolute top-full left-0 right-0 bg-[#0c0407]/98 backdrop-blur-2xl border-b border-border/80 px-6 py-5 flex flex-col gap-3 md:hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="text-base font-medium text-slate-200 hover:text-white py-2 border-b border-white/5"
          >
            Home
          </Link>
          <Link
            to="/games"
            onClick={() => setOpen(false)}
            className="text-base font-medium text-slate-200 hover:text-white py-2 border-b border-white/5"
          >
            Games
          </Link>
          <Link
            to="/accounts"
            onClick={() => setOpen(false)}
            className="text-base font-medium text-slate-200 hover:text-white py-2 border-b border-white/5"
          >
            Accounts
          </Link>
          <Link
            to="/services"
            onClick={() => setOpen(false)}
            className="text-base font-medium text-slate-200 hover:text-white py-2 border-b border-white/5"
          >
            Services
          </Link>
          <Link
            to="/contact"
            onClick={() => setOpen(false)}
            className="text-base font-medium text-slate-200 hover:text-white py-2"
          >
            Contact
          </Link>
          <a
            href={discordLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 mt-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors shadow-lg shadow-red-950/40"
          >
            Join Discord Community <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </header>
  );
}
export function SiteFooter() {
  return (
    <footer className="bm-footer">
      <div className="bm-footer-top">
        <Link to="/" className="bm-logo">
          <img
            src={logoAsset}
            width={40}
            height={40}
            alt="reedmoon logo"
            className="rounded-lg object-contain h-10 w-10"
          />
          <span>
            reed<span className="text-red-500">moon</span>
          </span>
        </Link>
        <a
          href={discordLink}
          target="_blank"
          rel="noreferrer"
          className="bm-footer-big"
          style={{ display: "flex", alignItems: "center", gap: "14px" }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            style={{ color: "var(--bm-glow)" }}
          >
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          <span>Join Discord Server</span>
          <ArrowUpRight />
        </a>
      </div>
      <div className="bm-footer-row">
        <span>© reedmoon Gaming Store</span>
        <div className="bm-footer-links">
          <Link to="/games">Games</Link>
          <Link to="/accounts" search={{}}>
            Accounts
          </Link>
          <Link to="/services">Services</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/admin" style={{ opacity: 0.6 }}>
            Admin
          </Link>
        </div>
        <span>Accounts · Middleman · Top Up</span>
      </div>
    </footer>
  );
}
export function Marquee({ items }: { items: string[] }) {
  return (
    <div className="bm-marquee" aria-hidden="true">
      <div className="bm-marquee-track">
        {[...items, ...items].map((t, i) => (
          <span key={i}>
            {t}
            <i>✦</i>
          </span>
        ))}
      </div>
    </div>
  );
}
