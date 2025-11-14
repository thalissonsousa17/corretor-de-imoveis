import { ReactNode } from "react";
import HeaderCorretor from "./Header";
import Footer from "./Footer";

export interface CorretorProps {
  name?: string;
  whatsapp?: string | null;
  instagram?: string | null;
  email?: string | null;
  creci?: string | null;
  slug?: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  logoUrl?: string | null;
}
interface LayoutCorretorProps {
  corretor?: CorretorProps | null;
  children: ReactNode;
  isTransparent?: boolean;
}

export default function LayoutCorretor({
  corretor,
  children,
  isTransparent = false,
}: LayoutCorretorProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {corretor && <HeaderCorretor corretor={corretor} />}
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  );
}
