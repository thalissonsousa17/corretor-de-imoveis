import Link from "next/link";
import { FiMapPin, FiArrowRight } from "react-icons/fi";
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

  const priceFormatted = vendido
    ? "Esgotado"
    : Number(imovel.preco).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });

  const specs = [
    imovel.quartos && imovel.quartos > 0 ? `${imovel.quartos} qts` : null,
    imovel.banheiros && imovel.banheiros > 0 ? `${imovel.banheiros} banh` : null,
    imovel.areaTotal && imovel.areaTotal > 0 ? `${imovel.areaTotal} m²` : null,
  ].filter(Boolean) as string[];

  return (
    <Link href={`/${slug}/imovel/${imovel.id}`} className="group block">
      <article className="relative bg-white dark:bg-[#231f18] border border-[#e8e4dc] dark:border-white/5 overflow-hidden transition-all duration-500 hover:border-[#b8912a]/40 dark:hover:border-[#b8912a]/25 hover:shadow-[0_24px_64px_rgba(184,145,42,0.09)] flex flex-col h-full">

        {/* FOTO */}
        <div className="relative h-64 overflow-hidden bg-[#1a1814]">
          <img
            src={capa}
            alt={imovel.titulo}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
            }}
          />

          {/* Gradient bottom overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1814]/55 via-transparent to-transparent" />

          {/* Badge — top left */}
          <div className="absolute top-0 left-0 z-10">
            <span
              className={`block text-[9px] font-black uppercase tracking-[0.28em] px-4 py-2 ${
                vendido
                  ? "bg-rose-600 text-white"
                  : alugado
                  ? "bg-amber-600 text-white"
                  : imovel.finalidade === "VENDA"
                  ? "bg-[#b8912a] text-white"
                  : "bg-[#1a1814] text-[#b8912a]"
              }`}
            >
              {badgeText}
            </span>
          </div>

          {/* Tipo — bottom left */}
          <div className="absolute bottom-4 left-5 z-10">
            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/65">
              {tipoLabel[imovel.tipo] || imovel.tipo}
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 flex-1 flex flex-col gap-3">

          {/* Preço — tipografia serif grande */}
          <div>
            <p
              className="leading-none tracking-tight text-[#1a1814] dark:text-white"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(26px, 3.5vw, 32px)",
                fontWeight: 400,
              }}
            >
              {priceFormatted}
            </p>
            {!vendido && (
              <p className="text-[9px] text-[#b8912a] font-bold uppercase tracking-[0.22em] mt-1.5">
                {imovel.finalidade === "ALUGUEL" ? "por mês" : "valor de venda"}
              </p>
            )}
          </div>

          {/* Título */}
          <h3 className="text-[#1a1814] dark:text-white/90 text-[13px] font-semibold leading-snug line-clamp-2 group-hover:text-[#b8912a] transition-colors duration-300">
            {imovel.titulo}
          </h3>

          {/* Localização */}
          <div className="flex items-center gap-1.5 text-[#9c9890] text-[11px] font-medium">
            <FiMapPin size={11} />
            <span className="line-clamp-1">
              {imovel.cidade}, {imovel.estado}
            </span>
          </div>

          {/* Specs — linha horizontal com separadores */}
          {specs.length > 0 && (
            <div className="flex items-center pt-3 mt-auto border-t border-[#e8e4dc] dark:border-white/5">
              {specs.map((spec, i) => (
                <div key={i} className="flex items-center">
                  {i > 0 && (
                    <span className="inline-block w-px h-3 bg-[#e8e4dc] dark:bg-white/10 mx-3" />
                  )}
                  <span className="text-[10px] text-[#9c9890] dark:text-white/40 font-bold uppercase tracking-wider">
                    {spec}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-[#e8e4dc] dark:border-white/5">
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#b8912a] group-hover:tracking-[0.3em] transition-all duration-300">
              Ver Imóvel
            </span>
            <FiArrowRight
              size={13}
              className="text-[#b8912a] group-hover:translate-x-1 transition-transform duration-300"
            />
          </div>
        </div>
      </article>
    </Link>
  );
}
