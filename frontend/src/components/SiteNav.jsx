import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Star, X } from "lucide-react";
import { useAppState } from "../context/AppState";
import { ToyButton } from "./ToyButton";

const LINKS = [
  { to: "/", label: "Home", id: "home" },
  { to: "/#worlds", label: "Our Learning Worlds", id: "worlds" },
  { to: "/typing", label: "Typing", id: "typing" },
  { to: "/progress", label: "My Progress", id: "progress" },
  { to: "/about", label: "About Us", id: "about" },
  { to: "/parents", label: "Parents", id: "parents" },
];

export const Logo = ({ className = "h-12 sm:h-14" }) => (
  <Link to="/" className="toy-focus shrink-0 rounded-xl" data-testid="nav-logo" aria-label="HappyKids home">
    <img src="/hk/logo.png" alt="HappyKids" className={`w-auto ${className}`} draggable="false" />
  </Link>
);

export const SiteNav = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pdata } = useAppState();
  const go = (to) => { setOpen(false); navigate(to); if (to === "/#worlds") setTimeout(() => document.getElementById("worlds")?.scrollIntoView({ behavior: "smooth" }), 350); };
  return (
    <nav className="relative z-30 px-4 pt-3 sm:px-8" data-testid="site-nav">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-[1.75rem] border-[3px] border-hc-navy bg-white/90 px-3 py-2 backdrop-blur-md sm:px-5" style={{ boxShadow: "0 5px 0 #1F2547" }}>
        <Logo />
        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.id}>
              <NavLink to={l.to} end data-testid={`nav-${l.id}`} onClick={() => { if (l.id === "worlds") document.getElementById("worlds")?.scrollIntoView({ behavior: "smooth" }); }} className="toy-focus rounded-full px-3 py-2 font-fredoka text-base font-semibold transition-colors hover:bg-hc-sunlight">
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <span className="hidden h-12 items-center gap-1.5 rounded-2xl border-[3px] border-hc-navy bg-hc-sunlight px-3 font-fredoka text-lg font-bold sm:flex" data-testid="nav-stars" aria-label={`${pdata.totalStars} stars`}>
            <Star className="h-5 w-5 fill-hc-sun" strokeWidth={2.5} /> {pdata.totalStars}
          </span>
          <ToyButton color="sun" className="hidden text-base sm:inline-flex" onClick={() => go("/learn")} data-testid="nav-start-learning">START LEARNING</ToyButton>
          <ToyButton color="white" className="px-3 lg:hidden" onClick={() => setOpen(!open)} aria-label="Open menu" aria-expanded={open} data-testid="nav-menu-button">
            {open ? <X className="h-6 w-6" strokeWidth={3} /> : <Menu className="h-6 w-6" strokeWidth={3} />}
          </ToyButton>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="toy-card absolute left-4 right-4 top-full mt-3 flex flex-col gap-2 p-4 lg:hidden" data-testid="mobile-menu">
            {LINKS.map((l) => (
              <button key={l.id} type="button" onClick={() => go(l.to)} data-testid={`mobile-nav-${l.id}`} className="toy-btn w-full bg-hc-cream text-xl">{l.label}</button>
            ))}
            <button type="button" onClick={() => go("/learn")} className="toy-btn w-full bg-hc-sun text-xl" data-testid="mobile-start-learning">START LEARNING</button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export const SiteFooter = () => (
  <footer className="mt-20 border-t-[3px] border-hc-navy bg-white px-4 py-10 sm:px-8" data-testid="site-footer">
    <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.2fr_2fr]">
      <div>
        <Logo className="h-14" />
        <p className="mt-3 font-fredoka text-lg font-semibold">Little minds. Big possibilities.</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm font-bold opacity-80"><Heart className="h-4 w-4 fill-hc-coral text-hc-coral" /> Inspired by a father's love. Growing from Kindergarten to Grade 8.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-base font-bold sm:grid-cols-3">
        <Link to="/about" className="hover:underline" data-testid="footer-about">About</Link>
        <Link to="/#worlds" className="hover:underline" data-testid="footer-worlds">Learning Worlds</Link>
        <Link to="/parents" className="hover:underline" data-testid="footer-parents">Parent Information</Link>
        <Link to="/about#contact" className="hover:underline" data-testid="footer-contact">Contact</Link>
        <Link to="/privacy" className="hover:underline" data-testid="footer-privacy">Privacy Policy</Link>
        <Link to="/terms" className="hover:underline" data-testid="footer-terms">Terms of Use</Link>
      </div>
    </div>
    <p className="mx-auto mt-8 max-w-6xl text-sm font-bold opacity-70">© {new Date().getFullYear()} HappyKids. All rights reserved. No ads, no chat, no public profiles.</p>
  </footer>
);

export const PageShell = ({ children, testId, bare, overlayNav }) => (
  <div className="hc-bg relative min-h-screen" data-testid={testId}>
    {overlayNav ? <div className="absolute inset-x-0 top-0 z-30"><SiteNav /></div> : <SiteNav />}
    <main className={`px-4 sm:px-8 ${overlayNav ? "" : "pt-8"}`}>{children}</main>
    {!bare && <SiteFooter />}
  </div>
);
