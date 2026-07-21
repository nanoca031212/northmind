"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  User,
  Search,
  Menu,
  X,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { SearchPopup } from "./SearchPopup";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";

const mobileNavLinks = [
  { label: "World Cup", href: "/collections/world-cup" },
  { label: "Outerwear", href: "/collections/outerwear" },
  { label: "Silent Warmth", href: "/collections/silent-warmth" },
  { label: "Eyewear", href: "/collections/eyewear" },
  { label: "Fragrances", href: "/collections/fragrances" },
  { label: "Prada", href: "/collections/prada" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Shipping", href: "/shipping" },
];

interface HeaderProps {
  // Set only on pages where the header sits transparently over a dark
  // hero image/video (e.g. the homepage) — keeps icons/text white even
  // in light mode while unscrolled, since it overlays photography, not
  // page chrome. Everywhere else the header sits on the plain page
  // background, so it must always follow the theme.
  overHero?: boolean;
}

export function Header({ overHero = false }: HeaderProps) {
  const { totalItems, setIsDrawerOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Theme-aware colors kick in once scrolled (solid background either way),
  // or always when the header isn't overlaying a hero image.
  const themeAware = isScrolled || !overHero;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add("drawer-open");
    } else {
      document.body.classList.remove("drawer-open");
    }
    return () => document.body.classList.remove("drawer-open");
  }, [isMobileMenuOpen]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const isAdmin = (session?.user as any)?.type === "ADMIN";
  const accountHref =
    status === "authenticated" ? (isAdmin ? "/admin" : "/user") : "/login";

  const icons = [
    {
      id: "search",
      icon: Search,
      label: "Search",
      action: () => setIsSearchOpen(true),
    },
    {
      id: "theme",
      icon: theme === "dark" ? Moon : Sun,
      label: theme === "dark" ? "Modo Noturno" : "Modo Claro",
      action: toggleTheme,
    },
    {
      id: "auth",
      icon: User,
      label:
        status === "authenticated"
          ? isAdmin
            ? "Admin"
            : session?.user?.name?.split(" ")[0] || "Account"
          : "Login",
      action: () => router.push(accountHref),
      desktopOnly: true,
    },
    {
      id: "cart",
      icon: ShoppingBag,
      label: "Basket",
      action: () => setIsDrawerOpen(true),
      badge: totalItems,
    },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-black/90 backdrop-blur-md border-b border-white/5 h-16 md:h-20 light:bg-white/90 light:border-black/5"
            : "bg-transparent border-b border-white/0 h-16 md:h-24"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 h-full flex items-center justify-between">
          {/* Mobile Menu Button - 44px minimum touch target */}
          <button
            className={`md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] hover:text-accent active:text-accent/70 transition-colors ${
              themeAware ? "text-white/90 light:text-black/70" : "text-white/90"
            }`}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-12">
            <Link
              href="/collections/outerwear"
              className={`text-[10px] uppercase font-bold tracking-luxury hover:text-accent hover:underline transition-all duration-300 ${themeAware ? "text-white/80 light:text-black/70" : "text-white/80"}`}
            >
              Outerwear
            </Link>
            <Link
              href="/collections/silent-warmth"
              className={`text-[10px] uppercase font-bold tracking-luxury hover:text-accent hover:underline transition-all duration-300 ${themeAware ? "text-white/80 light:text-black/70" : "text-white/80"}`}
            >
              Silent Warmth
            </Link>
          </nav>

          {/* Logo */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 transition-transform duration-500 hover:scale-105"
          >
            <Image
              src="/assets/logo.svg"
              alt="NORTH MIND"
              width={160}
              height={50}
              priority
              className={`h-8 md:h-12 w-auto invert brightness-0 ${themeAware ? "light:invert-0" : ""}`}
            />
          </Link>

          {/* Icon Buttons - 44px minimum touch targets */}
          <div className="flex items-center gap-1 md:gap-4">
            {icons.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  onMouseEnter={() => setHoveredIcon(item.id)}
                  onMouseLeave={() => setHoveredIcon(null)}
                  onClick={item.action}
                  aria-label={item.label}
                  className={`flex items-center gap-2 min-h-[44px] min-w-[36px] md:min-w-[44px] justify-center rounded-full px-0.5 md:px-4 transition-all duration-300 ${
                    item.desktopOnly ? "hidden md:flex" : "flex"
                  } ${
                    hoveredIcon === item.id
                      ? themeAware
                        ? "bg-white/5 text-white light:bg-black/5 light:text-black"
                        : "bg-white/5 text-white"
                      : themeAware
                        ? "text-white/80 light:text-black/70"
                        : "text-white/80"
                  }`}
                >
                  <div className="relative">
                    <Icon size={20} strokeWidth={1.5} />
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-black text-[8px] font-black rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <AnimatePresence>
                    {hoveredIcon === item.id && (
                      <motion.span
                        initial={{ width: 0, opacity: 0, x: -5 }}
                        animate={{ width: "auto", opacity: 1, x: 0 }}
                        exit={{ width: 0, opacity: 0, x: -5 }}
                        transition={{ duration: 0.3, ease: "circOut" }}
                        className="overflow-hidden whitespace-nowrap text-[10px] font-black uppercase tracking-widest hidden md:inline"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm md:hidden"
              onClick={closeMobileMenu}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-[70] w-[85vw] max-w-[360px] bg-[#0a0a09] border-r border-white/5 flex flex-col md:hidden light:bg-white light:border-black/5"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5 light:border-black/5">
                <Image
                  src="/assets/logo.svg"
                  alt="NORTH MIND"
                  width={120}
                  height={40}
                  className="h-6 w-auto invert brightness-0 light:invert-0"
                />
                <button
                  onClick={closeMobileMenu}
                  aria-label="Close navigation menu"
                  className="flex items-center justify-center min-h-[44px] min-w-[44px] text-white/60 hover:text-white transition-colors light:text-black/50 light:hover:text-black"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-grow overflow-y-auto py-4">
                {mobileNavLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between px-6 py-4 text-sm font-bold uppercase tracking-widest text-white/80 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all min-h-[52px] light:text-black/70 light:hover:text-black light:hover:bg-black/5 light:active:bg-black/10"
                    >
                      <span>{link.label}</span>
                      <ChevronRight
                        size={16}
                        className="text-white/20 light:text-black/20"
                      />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Drawer Footer - Theme toggle + Login/Profile */}
              <div
                className="p-6 border-t border-white/5 light:border-black/5 space-y-3"
                style={{
                  paddingBottom: "max(24px, env(safe-area-inset-bottom))",
                }}
              >
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-between w-full gap-4 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 transition-all min-h-[52px] light:bg-black/5 light:hover:bg-black/10 light:active:bg-black/15"
                  aria-label="Alternar modo claro e escuro"
                >
                  <span className="flex items-center gap-4">
                    {theme === "dark" ? (
                      <Moon size={20} className="text-accent" />
                    ) : (
                      <Sun size={20} className="text-accent" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-widest text-white light:text-black">
                      {theme === "dark" ? "Modo Noturno" : "Modo Claro"}
                    </span>
                  </span>
                  <span
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                      theme === "dark" ? "bg-white/15" : "bg-accent"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        theme === "dark" ? "translate-x-1" : "translate-x-6"
                      }`}
                    />
                  </span>
                </button>

                <Link
                  href={accountHref}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 transition-all min-h-[52px] light:bg-black/5 light:hover:bg-black/10 light:active:bg-black/15"
                >
                  <User size={20} className="text-accent" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white light:text-black">
                    {status === "authenticated"
                      ? isAdmin
                        ? "Admin"
                        : session?.user?.name?.split(" ")[0] || "Profile"
                      : "Sign In"}
                  </span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchPopup
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
