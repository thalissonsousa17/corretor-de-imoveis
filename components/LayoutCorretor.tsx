import Head from "next/head";
import { ReactNode, useEffect, useState } from "react";
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
  accentColor?: string | null;
}

interface LayoutCorretorProps {
  corretor?: CorretorProps | null;
  children: ReactNode;
}

export default function LayoutCorretor({ corretor, children }: LayoutCorretorProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
      const isDark = savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setTheme(isDark ? "dark" : "light");
    } catch (e) {
      console.error("Error initializing theme:", e);
    }
  }, []);

  useEffect(() => {
    const isDark = theme === "dark";
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
    localStorage.setItem("theme", theme);
    console.log("Theme synced to DOM:", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  const safeCorretor = corretor ?? {
    name: "Corretor",
    slug: "",
    creci: "",
    instagram: "",
    facebook: "",
    linkedin: "",
    whatsapp: "",
    logoUrl: "",
    accentColor: "#1A2A4F",
  };

  const accentColor = safeCorretor.accentColor || "#1A2A4F";

  // Converter HEX para RGB para uso em RGBA/Sombras
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };

  const accentRgb = hexToRgb(accentColor.startsWith('#') ? accentColor : "#1A2A4F");

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors duration-500">
      <Head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              const savedTheme = localStorage.getItem('theme');
              const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
              if (isDark) {
                document.documentElement.classList.add('dark');
                document.documentElement.style.colorScheme = 'dark';
              } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.style.colorScheme = 'light';
              }
            } catch (e) {}
          })()
        ` }} />
      </Head>
      <style jsx global>{`
        :root {
          --accent-color: ${accentColor};
          --accent-color-rgb: ${accentRgb};
        }
      `}</style>
      
      {corretor && (
        <HeaderCorretor 
          corretor={corretor} 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />
      )}
      <main className="flex-1 pt-20">{children}</main>
      <Footer
        nome={safeCorretor.name}
        creci={safeCorretor.creci}
        whatsapp={safeCorretor.whatsapp}
        instagram={safeCorretor.instagram}
        facebook={safeCorretor.facebook}
        logoUrl={safeCorretor.logoUrl}
        email={safeCorretor.email}
      />
    </div>
  );
}
