import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Phone } from "lucide-react";

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
        ? corretor.logoUrl
        : `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}${
            corretor.logoUrl.startsWith("/") ? "" : "/"
          }${corretor.logoUrl}`
      : null;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? "shadow-md bg-white/95 backdrop-blur-sm" : "bg-white"
      }`}
    >
      <div className="w-full">
        {/* TOPO */}
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-2 text-[#D4AC3A]">
          <div className="flex items-center gap-3">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={corretor.name || "Logo"}
                className="h-14 w-auto object-contain"
              />
            ) : (
              <h1 className="text-xl font-semibold tracking-wide text-[#1A2A4F]">
                {corretor.name}
              </h1>
            )}
          </div>

          {/* WHATS */}
          <div className="flex items-center gap-6 text-[#1A2A4F] font-bold">
            {corretor.whatsapp && (
              <a
                href={`https://wa.me/${corretor.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#D4AC3A] transition"
              >
                <Phone size={18} /> {corretor.whatsapp}
              </a>
            )}
          </div>
        </div>

        {/* MENU */}
        <div className="bg-[#1A2A4F] w-full mt-1">
          <div
            className="max-w-7xl mx-auto flex justify-center py-3 rounded-t-[1rem]"
            style={{
              borderTopLeftRadius: "1.5rem",
              borderTopRightRadius: "1.5rem",
            }}
          >
            {/* ❗ NÃO RENDERIZAR MENU ATÉ O SLUG EXISTIR */}
            {!slug ? null : (
              <nav className="flex gap-8 text-base font-medium">
                <Link
                  href={`/${slug}`}
                  className={`relative transition ${
                    router.asPath === `/${slug}`
                      ? "text-[#D4AC3A] font-semibold"
                      : "text-white hover:text-[#D4AC3A]"
                  }`}
                >
                  Início
                </Link>

                <Link
                  href={`/${slug}/vendas`}
                  className={`relative transition ${
                    router.asPath.includes("/vendas")
                      ? "text-[#D4AC3A] font-semibold"
                      : "text-white hover:text-[#D4AC3A]"
                  }`}
                >
                  Comprar
                </Link>

                <Link
                  href={`/${slug}/aluguel`}
                  className={`relative transition ${
                    router.asPath.includes("/aluguel")
                      ? "text-[#D4AC3A] font-semibold"
                      : "text-white hover:text-[#D4AC3A]"
                  }`}
                >
                  Alugar
                </Link>

                <Link
                  href={`/${slug}/vendidos`}
                  className={`relative transition ${
                    router.asPath.includes("/vendidos")
                      ? "text-[#D4AC3A] font-semibold"
                      : "text-white hover:text-[#D4AC3A]"
                  }`}
                >
                  Vendidos
                </Link>

                <Link
                  href={`/${slug}/perfil`}
                  className={`relative transition ${
                    router.asPath.includes("/perfil")
                      ? "text-[#D4AC3A] font-semibold"
                      : "text-white hover:text-[#D4AC3A]"
                  }`}
                >
                  Perfil
                </Link>

                <Link
                  href={`/${slug}/noticias`}
                  className={`relative transition ${
                    router.asPath.includes("/noticias")
                      ? "text-[#D4AC3A] font-semibold"
                      : "text-white hover:text-[#D4AC3A]"
                  }`}
                >
                  Notícias
                </Link>
              </nav>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
