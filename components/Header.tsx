import { useEffect, useMemo, useState } from "react";
import { resolveFotoUrl as resolveAssetUrl } from "@/lib/imageUtils";
import Link from "next/link";
import { useRouter } from "next/router";
import { Phone, Menu, X, ChevronDown, Sun, Moon } from "lucide-react";
import { FiInstagram, FiFacebook, FiYoutube } from "react-icons/fi";

interface Corretor {
  name?: string;
  whatsapp?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  slug?: string | null;
  instagram?: string | null;
  facebook?: string | null;
}

interface HeaderCorretorProps {
  corretor: Corretor;
  theme?: "light" | "dark";
  toggleTheme?: () => void;
}



export default function HeaderCorretor({ corretor, theme, toggleTheme }: HeaderCorretorProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const slug = corretor?.slug;
  const logoSrc = useMemo(() => resolveAssetUrl(corretor.logoUrl), [corretor.logoUrl]);
  const waHref = corretor.whatsapp ? `https://wa.me/${corretor.whatsapp.replace(/\D/g, "")}` : "";

  const navItems = slug
    ? [
        { href: `/${slug}`, label: "Início" },
        { href: `/${slug}/vendas`, label: "Comprar" },
        { href: `/${slug}/aluguel`, label: "Alugar" },
        { href: `/${slug}/vendidos`, label: "Vendidos" },
        { href: `/${slug}/perfil`, label: "Perfil" },
      ]
    : [];

  const isActive = (href: string) => {
    if (href === `/${slug}`) return router.asPath === href;
    return router.asPath.startsWith(href);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "py-2 bg-[#fafaf8]/90 dark:bg-[#1a1814]/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border-b border-[#e8e4dc]/60 dark:border-white/5"
            : "py-4 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex justify-between items-center bg-[#fafaf8]/60 dark:bg-[#1a1814]/60 backdrop-blur-md border border-[#e8e4dc]/60 dark:border-white/8 px-6 py-3 shadow-sm">
            {/* Logo Section */}
            <Link href={slug ? `/${slug}` : "/"} className="flex items-center gap-3 group">
              <div className="relative">
                {!logoFailed && logoSrc ? (
                  <img
                    src={logoSrc}
                    alt={corretor.name || "Logo"}
                    className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={() => setLogoFailed(true)}
                  />
                ) : (
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                      {corretor.name?.split(' ')[0]}
                      <span className="text-accent">.</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">ESTATE</span>
                  </div>
                )}
              </div>
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-5 py-2 text-[13px] font-bold uppercase tracking-wider transition-all duration-300 ${
                    isActive(item.href)
                      ? "text-accent bg-accent/10"
                      : "text-[#9c9890] dark:text-[#9c9890] hover:text-[#1a1814] dark:hover:text-white hover:bg-[#e8e4dc]/50 dark:hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
              
              <button
                onClick={() => {
                  console.log("Desktop theme toggle clicked");
                  toggleTheme?.();
                }}
                className="p-2.5 bg-[#f0ede6] dark:bg-white/5 text-[#9c9890] hover:text-accent dark:hover:text-accent transition-all duration-300"
                aria-label="Alternar Tema"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </nav>

            {/* Contact & CTA */}
            <div className="flex items-center gap-4">
              {corretor.whatsapp && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex items-center gap-2.5 px-5 py-2.5 bg-[#1a1814] text-white text-xs font-bold hover:bg-accent transition-all duration-300 shadow-lg shadow-black/10 hover:shadow-accent/20 active:scale-95"
                >
                  <Phone size={14} className="animate-pulse" />
                  AGENDAR VISITA
                </a>
              )}

              {/* Mobile Toggle */}
              <button 
                className="lg:hidden p-2.5 bg-[#e8e4dc] dark:bg-white/5 text-[#1a1814] dark:text-white hover:bg-[#ddd9d0] dark:hover:bg-white/10 transition-colors"
                onClick={() => setMenuOpen(true)}
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Mobile Premium */}
      <div 
        className={`fixed inset-0 z-[100] transition-opacity duration-500 lg:hidden ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div 
          className="absolute inset-0 bg-[#1a1814]/50 backdrop-blur-md" 
          onClick={() => setMenuOpen(false)} 
        />
        
        <div 
          className={`absolute right-0 top-0 bottom-0 w-80 bg-[#fafaf8] dark:bg-[#1a1814] shadow-2xl transition-transform duration-500 ease-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-12">
               <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter italic">
                {corretor.name?.split(' ')[0]}<span className="text-accent">.</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    console.log("Mobile theme toggle clicked");
                    toggleTheme?.();
                  }}
                  className="p-2 bg-[#e8e4dc] dark:bg-white/5 text-[#9c9890] hover:text-accent transition-colors"
                >
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                  className="p-2 bg-[#e8e4dc] dark:bg-white/5 text-[#9c9890] hover:text-[#1a1814] dark:hover:text-white transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              {navItems.map((item, idx) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all ${
                    isActive(item.href)
                      ? "bg-accent text-white shadow-xl shadow-accent/20"
                      : "text-[#9c9890] hover:bg-[#e8e4dc] dark:hover:bg-white/5 hover:text-[#1a1814] dark:hover:text-white"
                  }`}
                  style={{ transitionDelay: `${idx * 50}ms` }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto space-y-8">
              {/* Redes Sociais */}
              <div className="flex items-center gap-4 px-2">
                {corretor.instagram && (
                  <a href={`https://instagram.com/${corretor.instagram}`} target="_blank" className="p-3 bg-[#e8e4dc] dark:bg-white/5 text-[#9c9890] hover:text-accent hover:bg-accent/10 transition-all">
                    <FiInstagram size={20} />
                  </a>
                )}
                {corretor.facebook && (
                  <a href={`https://facebook.com/${corretor.facebook}`} target="_blank" className="p-3 bg-[#e8e4dc] dark:bg-white/5 text-[#9c9890] hover:text-white hover:bg-[#1a1814] transition-all">
                    <FiFacebook size={20} />
                  </a>
                )}
              </div>

              {corretor.whatsapp && (
                <a
                  href={waHref}
                  target="_blank"
                  className="flex items-center justify-center gap-3 w-full py-4 bg-[#1a1814] text-white font-bold shadow-xl hover:bg-[#b8912a] active:scale-95 transition-all"
                >
                  <Phone size={18} />
                  FALE COMIGO
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
