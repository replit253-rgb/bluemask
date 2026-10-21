import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown, Menu, ShoppingCart, X } from "lucide-react";
import { discordLink, games, gamesForService, services } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import emblemAsset from "@/assets/bluemask-logo.png";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  return (
    <header className="bm-header" onKeyDown={(e) => { if (e.key === "Escape") { setOpen(false); setActive(null); } }}>
      <Link to="/" className="bm-logo" aria-label="BlueMask, home"><img src={emblemAsset} width={40} height={40} alt="BlueMask logo" /><span>BlueMask<span className="bm-logo-sub">GAMING STORE</span></span></Link>
      <nav className={`bm-nav${open ? " bm-nav--open" : ""}`} aria-label="Main navigation">
        <Link to="/" onClick={() => setOpen(false)}>Home</Link>
        <div className={`bm-nav-group${active === "games" ? " is-open" : ""}`}>
          <Button variant="ghost" className="bm-nav-trigger" aria-expanded={active === "games"} onClick={() => setActive(active === "games" ? null : "games")}>Games <ChevronDown /></Button>
          <div className="bm-dropdown"><Link to="/games" onClick={() => setOpen(false)}>All games <ArrowUpRight /></Link>{games.map(g => <Link key={g.slug} to="/akun" search={{ game: g.slug }} onClick={() => setOpen(false)}><img src={g.image} alt="" />{g.name}</Link>)}</div>
        </div>
        <Link to="/akun" search={{}} onClick={() => setOpen(false)}>Accounts</Link>
        <div className={`bm-nav-group${active === "services" ? " is-open" : ""}`}>
          <Button variant="ghost" className="bm-nav-trigger" aria-expanded={active === "services"} onClick={() => setActive(active === "services" ? null : "services")}>Services <ChevronDown /></Button>
          <div className="bm-dropdown bm-dropdown--services"><Link to="/layanan" onClick={() => setOpen(false)}>All services <ArrowUpRight /></Link>{services.map(s => <div key={s.slug} className="bm-dropdown-section"><strong>{s.name}</strong>{gamesForService(s).map(g => <Link key={g.slug} to="/layanan/$service/$game" params={{ service: s.slug, game: g.slug }} onClick={() => setOpen(false)}>{g.name}<ArrowUpRight /></Link>)}</div>)}</div>
        </div>
        <Button asChild className="bm-nav-cta"><a href={discordLink} target="_blank" rel="noreferrer">Discord <ArrowUpRight /></a></Button>
      </nav>
      <Button asChild variant="ghost" size="icon" className="bm-cart" aria-label="Keranjang"><Link to="/akun" search={{}}><ShoppingCart /></Link></Button>
      <Button variant="ghost" size="icon" className="bm-mobile-toggle" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
    </header>
  );
}
export function SiteFooter() {
  return <footer className="bm-footer"><div className="bm-footer-top"><Link to="/" className="bm-logo"><img src={emblemAsset} width={40} height={40} alt="BlueMask logo" /><span>BlueMask</span></Link><a href={discordLink} target="_blank" rel="noreferrer" className="bm-footer-big">Let's talk on Discord <ArrowUpRight /></a></div><div className="bm-footer-row"><span>© BlueMask Gaming Store</span><div className="bm-footer-links"><Link to="/games">Games</Link><Link to="/akun" search={{}}>Accounts</Link><Link to="/layanan">Services</Link></div><span>Accounts · Middleman · Top Up</span></div></footer>;
}
export function Marquee({ items }: { items: string[] }) {
  return <div className="bm-marquee" aria-hidden="true"><div className="bm-marquee-track">{[...items, ...items].map((t, i) => <span key={i}>{t}<i>✦</i></span>)}</div></div>;
}
