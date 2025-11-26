import { ReactNode } from "react";
import HeaderCorretor from "./Header";
import Footer from "./Footer";

export interface CorretorProps {
  name: string;
  creci?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  biografia?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  whatsapp?: string | null;
  slug: string;
}

interface LayoutCorretorProps {
  corretor?: CorretorProps | null;
  children: ReactNode;
}

export default function LayoutCorretor({ corretor, children }: LayoutCorretorProps) {
  const safeCorretor = corretor ?? {
    name: "Corretor",
    slug: "",
    creci: "",
    instagram: "",
    facebook: "",
    linkedin: "",
    whatsapp: "",
    logoUrl: "",
  };
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {corretor && <HeaderCorretor corretor={corretor} />}
      <main className="flex-1 pt-20">{children}</main>
      <Footer
        nome={safeCorretor.name}
        creci={safeCorretor.creci}
        whatsapp={safeCorretor.whatsapp}
        instagram={safeCorretor.instagram}
        facebook={safeCorretor.facebook}
        logoUrl={safeCorretor.logoUrl}
      />
    </div>
  );
}
