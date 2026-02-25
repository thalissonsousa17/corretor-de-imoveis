"use client";

import React, { useMemo } from "react";
import { FiSearch, FiMapPin, FiChevronRight } from "react-icons/fi";
import { motion } from "framer-motion";
import ImovelCard, { ImovelCardData } from "./ImovelCard";

interface HeroSliderProps {
  imoveis: ImovelCardData[];
  slogan?: string | null;
  corretorName: string;
  accentColor?: string | null;
  slug: string;
  onSearch: (query: string) => void;
  busca: string;
  setBusca: (val: string) => void;
}

export default function HeroSlider({ 
  imoveis, 
  slogan, 
  corretorName,
  accentColor,
  slug,
  onSearch,
  busca,
  setBusca
}: HeroSliderProps) {
  
  // Pegamos os 3 primeiros imóveis disponíveis para o destaque assimétrico
  const destaques = useMemo(() => {
    return imoveis.slice(0, 3);
  }, [imoveis]);

  const bgBase = accentColor || "#1A2A4F";

  return (
    <section className="relative w-full min-h-[850px] lg:h-[900px] overflow-hidden flex items-center justify-center py-20 px-4 transition-colors duration-500 bg-slate-50 dark:bg-slate-950">
      {/* Background with Accent Color Gradient */}
      <div 
        className="absolute inset-0 z-0 opacity-0 dark:opacity-100 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 transition-opacity duration-500"
        style={{ backgroundColor: bgBase }}
      >
        <div 
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{ 
            backgroundImage: `radial-gradient(circle at 20% 30%, ${bgBase}, transparent 70%), radial-gradient(circle at 80% 70%, ${bgBase}, transparent 70%)` 
          }}
        />
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      {/* Light Mode Specific Background */}
      <div className="absolute inset-0 z-0 dark:hidden bg-gradient-to-br from-white via-slate-50 to-white">
        <div 
          className="absolute inset-0 opacity-5"
          style={{ 
            backgroundImage: `radial-gradient(circle at 30% 20%, ${bgBase}, transparent 60%)` 
          }}
        />
      </div>

      <div className="container max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LADO ESQUERDO: TEXTO E BUSCA */}
          <div className="lg:col-span-5 text-left space-y-8 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span 
                className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border"
                style={{ backgroundColor: `${bgBase}20`, borderColor: `${bgBase}40`, color: "var(--accent-color)" }}
              >
                {corretorName} — Portfólio de Luxo
              </span>
              <h1 className="text-slate-950 dark:text-white text-4xl sm:text-6xl font-black tracking-tighter leading-[1.1] mb-6 drop-shadow-sm dark:drop-shadow-2xl">
                Encontre o seu <br />
                <span className="text-slate-400 dark:text-slate-500">Novo Legado.</span>
              </h1>
              {slogan && (
                <p className="text-slate-500 dark:text-white/60 text-lg font-medium max-w-md leading-relaxed">
                  {slogan}
                </p>
              )}
            </motion.div>

            {/* Barra de Busca Glassmorphism */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row items-center gap-2 max-w-xl"
            >
               <div className="flex-1 w-full flex items-center px-4 gap-3">
                 <FiSearch className="text-slate-400 dark:text-white/40" size={20} />
                 <input 
                   type="text" 
                   value={busca}
                   onChange={(e) => setBusca(e.target.value)}
                   placeholder="Localização, tipo ou condomínio..."
                   className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 py-4 focus:outline-none text-sm font-medium"
                   onKeyDown={(e) => e.key === 'Enter' && onSearch(busca)}
                 />
               </div>
               <button 
                 onClick={() => onSearch(busca)}
                 className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[var(--accent-color)] hover:text-white transition-all duration-300 active:scale-95 shadow-xl"
               >
                 Explorar
               </button>
            </motion.div>
          </div>

          {/* LADO DIREITO: ASYMMETRICAL CARDS DISPLAY */}
          <div className="lg:col-span-7 relative h-[600px] sm:h-[700px] flex items-center justify-center order-1 lg:order-2">
            {destaques.length > 0 ? (
              <div className="relative w-full h-full">
                
                {/* CARD 1: TOP LEFT */}
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="absolute top-0 left-0 w-[240px] sm:w-[300px] z-10"
                >
                   <div className="animate-float shadow-2xl">
                      <ImovelCard imovel={destaques[0]} slug={slug} />
                   </div>
                </motion.div>

                {/* CARD 2: CENTER MIDDLE */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] sm:w-[320px] z-30"
                >
                   <div className="animate-float-delayed shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                      <ImovelCard imovel={destaques[1] || destaques[0]} slug={slug} />
                   </div>
                </motion.div>

                {/* CARD 3: BOTTOM RIGHT */}
                <motion.div
                  initial={{ opacity: 0, y: -50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="absolute bottom-0 right-0 w-[240px] sm:w-[300px] z-20"
                >
                   <div className="animate-float-more shadow-2xl">
                      <ImovelCard imovel={destaques[2] || destaques[0]} slug={slug} />
                   </div>
                </motion.div>

              </div>
            ) : (
              /* Fallback se não houver imóveis */
              <div className="w-64 h-96 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-slate-300 dark:text-white/20">
                <FiMapPin size={48} />
                <p className="mt-4 font-black text-xs uppercase tracking-widest text-center px-8">Nenhum imóvel disponível para destaque</p>
              </div>
            )}
          </div>

        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float-delayed {
          0% { transform: translateY(0px); }
          50% { transform: translateY(15px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float-more {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-float-more {
          animation: float-more 7s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
