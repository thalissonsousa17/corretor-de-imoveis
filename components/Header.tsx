import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Phone, Menu, X } from "lucide-react";
import Image from "next/image";

interface Corretor {
  name?: string;
  whatsapp?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  slug?: string | null;
}

interface HeaderCorretorProps {
  corretor: Corretor;
}

export default function HeaderCorretor({ corretor }: HeaderCorretorProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const slug = corretor?.slug;

  const logoSrc =
    corretor.logoUrl && corretor.logoUrl.trim() !== ""
      ? corretor.logoUrl.startsWith("http")
        ? corretor.logoUrl.replace("http://207.180.235.23", "https://seuimovel.automatech.app.br")
        : `${process.env.NEXT_PUBLIC_BASE_URL}${corretor.logoUrl}`
      : null;

  return (
    <>
      {/* HEADER */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isScrolled ? "shadow-md bg-white/95 backdrop-blur-sm" : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          {/* LOGO */}
          <div className="flex items-center gap-3">
            {logoSrc ? (
              <div className="relative h-10 sm:h-10 w-auto aspect-auto">
                <img
                  src={logoSrc}
                  alt={corretor.name || "Logo"}
                  className="object-contain h-full w-auto"
                />
              </div>
            ) : (
              <h1 className="text-lg sm:text-xl font-semibold text-[#1A2A4F]">{corretor.name}</h1>
            )}
          </div>

          {/* WHATSAPP (mobile escondido) */}
          <div className="hidden sm:flex items-center text-[#1A2A4F] font-bold">
            {corretor.whatsapp && (
              <a
                href={`https://wa.me/${corretor.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                className="flex items-center gap-2 hover:text-[#D4AC3A]"
              >
                <Phone size={18} /> {corretor.whatsapp}
              </a>
            )}
          </div>

          {/* BOTÃO HAMBÚRGUER */}
          <button className="sm:hidden text-[#1A2A4F]" onClick={() => setMenuOpen(true)}>
            <Menu size={30} />
          </button>
        </div>

        {/* MENU DESKTOP */}
        {slug && (
          <div className="bg-[#1A2A4F] hidden sm:flex justify-center py-3">
            <nav className="flex gap-8 text-base font-medium">
              <MenuLink href={`/${slug}`} label="Início" active={router.asPath === `/${slug}`} />
              <MenuLink
                href={`/${slug}/vendas`}
                label="Comprar"
                active={router.asPath.includes("/vendas")}
              />
              <MenuLink
                href={`/${slug}/aluguel`}
                label="Alugar"
                active={router.asPath.includes("/aluguel")}
              />
              <MenuLink
                href={`/${slug}/vendidos`}
                label="Vendidos"
                active={router.asPath.includes("/vendidos")}
              />
              <MenuLink
                href={`/${slug}/perfil`}
                label="Perfil"
                active={router.asPath.includes("/perfil")}
              />
              <MenuLink
                href={`/${slug}/noticias`}
                label="Notícias"
                active={router.asPath.includes("/noticias")}
              />
            </nav>
          </div>
        )}
      </header>

      {/* MENU MOBILE (DRAWER) */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm sm:hidden">
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl p-6 flex flex-col gap-4 animate-slideIn">
            {/* FECHAR */}
            <button className="self-end mb-4 text-gray-700" onClick={() => setMenuOpen(false)}>
              <X size={28} />
            </button>

            {/* LINKS */}
            {slug && (
              <>
                <MobileLink href={`/${slug}`} label="Início" onClick={() => setMenuOpen(false)} />
                <MobileLink
                  href={`/${slug}/vendas`}
                  label="Comprar"
                  onClick={() => setMenuOpen(false)}
                />
                <MobileLink
                  href={`/${slug}/aluguel`}
                  label="Alugar"
                  onClick={() => setMenuOpen(false)}
                />
                <MobileLink
                  href={`/${slug}/vendidos`}
                  label="Vendidos"
                  onClick={() => setMenuOpen(false)}
                />
                <MobileLink
                  href={`/${slug}/perfil`}
                  label="Perfil"
                  onClick={() => setMenuOpen(false)}
                />
                <MobileLink
                  href={`/${slug}/noticias`}
                  label="Notícias"
                  onClick={() => setMenuOpen(false)}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* ANIMAÇÃO */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn .3s ease forwards;
        }
      `}</style>
    </>
  );
}

/* COMPONENTES DE LINK */

function MenuLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`transition ${
        active ? "text-[#D4AC3A] font-semibold" : "text-white hover:text-[#D4AC3A]"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-lg font-medium text-[#1A2A4F] py-2 hover:text-[#D4AC3A] transition"
    >
      {label}
    </Link>
  );
}
