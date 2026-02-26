import Link from "next/link";
import { FiMapPin, FiHome, FiMaximize2, FiHeart } from "react-icons/fi";
import { FaBed, FaBath, FaCar } from "react-icons/fa";
import { resolveFotoUrl } from "@/lib/imageUtils";

type Foto = { id: string; url: string };

export type ImovelCardData = {
  id: string;
  titulo: string;
  preco: number;
  cidade: string;
  estado: string;
  tipo: string;
  finalidade: "VENDA" | "ALUGUEL" | string;
  status: "DISPONIVEL" | "VENDIDO" | "ALUGADO" | "INATIVO" | string;
  fotos: Foto[];
  quartos?: number | null;
  banheiros?: number | null;
  vagas?: number | null;
  areaTotal?: number | null;
};

interface ImovelCardProps {
  imovel: ImovelCardData;
  slug: string;
}

const tipoLabel: Record<string, string> = {
  APARTAMENTO: "Apartamento",
  CASA: "Casa",
  TERRENO: "Terreno",
  COMERCIAL: "Comercial",
};

export default function ImovelCard({ imovel, slug }: ImovelCardProps) {
  const capa = resolveFotoUrl(imovel.fotos?.[0]?.url);
  const vendido = imovel.status === "VENDIDO";
  const alugado = imovel.status === "ALUGADO";

  const badgeText = vendido
    ? "Vendido"
    : alugado
      ? "Alugado"
      : imovel.finalidade === "VENDA"
        ? "Venda"
        : "Aluguel";

  const badgeColor = vendido
    ? "bg-rose-500"
    : alugado
      ? "bg-amber-500"
      : imovel.finalidade === "VENDA"
        ? "bg-accent"
        : "bg-indigo-600";

  return (
    <Link href={`/${slug}/imovel/${imovel.id}`} className="group block perspective-1000">
      <article className="relative bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] border border-white dark:border-white/5 hover:border-accent/30 dark:hover:border-accent/40 transition-all duration-700 h-full flex flex-col group-hover:-translate-y-8 group-hover:shadow-[0_80px_150px_-20px_rgba(0,0,0,0.2)] dark:group-hover:shadow-[0_0_50px_rgba(var(--accent-color-rgb),0.15)]">
        {/* Shine effect overlay for dark mode */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* FOTO CONTAINER */}
        <div className="relative h-72 overflow-hidden bg-slate-950 flex items-center justify-center">
          <img
            src={capa}
            alt={imovel.titulo}
            className="max-w-full max-h-full object-contain transition-transform duration-1000 group-hover:scale-110"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
            }}
          />

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700" />

          {/* Top Actions */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
            <span
              className={`${badgeColor} text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full backdrop-blur-md shadow-lg`}
            >
              {badgeText}
            </span>
            <button className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all active:scale-95">
              <FiHeart size={18} />
            </button>
          </div>

          {/* Quick Reveal Info (Visual on Hover) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
            <div className="px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest pointer-events-none">
              Ver Detalhes Exclusivos
            </div>
          </div>

          {/* Price Tag */}
          <div className="absolute bottom-6 left-6 z-10 transition-transform duration-500 group-hover:-translate-y-1">
            <p className="text-white font-black text-2xl tracking-tighter drop-shadow-2xl">
              {vendido
                ? "Esgotado"
                : Number(imovel.preco).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-8 flex-1 flex flex-col gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-accent font-black text-[10px] uppercase tracking-widest">
              <FiHome size={12} />
              {tipoLabel[imovel.tipo] || imovel.tipo}
            </div>
            <h3 className="font-black text-slate-950 dark:text-white text-xl leading-tight tracking-tight line-clamp-2 group-hover:text-accent transition-colors duration-300">
              {imovel.titulo}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <FiMapPin size={14} className="text-slate-300 dark:text-slate-600" />
            <span className="line-clamp-1">
              {imovel.cidade}, {imovel.estado}
            </span>
          </div>

          {/* Premium Specs Grid */}
          {(imovel.quartos || imovel.banheiros || imovel.vagas || imovel.areaTotal) && (
            <div className="grid grid-cols-3 gap-2 mt-auto pt-6 border-t border-slate-50 dark:border-white/5">
              {imovel.quartos != null && imovel.quartos > 0 && (
                <div className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-slate-50/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors border border-transparent dark:border-white/5">
                  <span className="text-slate-950 dark:text-white font-black text-sm">
                    {imovel.quartos}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-widest">
                    Quartos
                  </span>
                </div>
              )}
              {imovel.banheiros != null && imovel.banheiros > 0 && (
                <div className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-slate-50/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors border border-transparent dark:border-white/5">
                  <span className="text-slate-950 dark:text-white font-black text-sm">
                    {imovel.banheiros}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-widest">
                    Banhs
                  </span>
                </div>
              )}
              {imovel.areaTotal != null && imovel.areaTotal > 0 && (
                <div className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-slate-50/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors border border-transparent dark:border-white/5">
                  <span className="text-slate-950 dark:text-white font-black text-sm">
                    {imovel.areaTotal}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-widest">
                    m² Úteis
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </article>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </Link>
  );
}
