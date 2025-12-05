import {
  FaCheckCircle,
  FaFacebook,
  FaInstagram,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaWhatsapp,
} from "react-icons/fa";
import QRCode from "react-qr-code";
import { toWaLink } from "@/lib/phone";

type FooterProps = {
  nome: string;
  creci?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  logoUrl?: string | null;
};

export default function Footer({
  nome,
  creci,
  whatsapp,
  instagram,
  facebook,
  logoUrl,
}: FooterProps) {
  const ano = new Date().getFullYear();
  const wa = whatsapp ? toWaLink(whatsapp) : "";

  return (
    <footer className="bg-[#0D1B3A] text-white pt-16 mt-20 relative">
      {/* Linha dourada */}
      <div className="border-t-4 border-[#D4AC3A]"></div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* QR CODE */}
        <div className="text-center">
          <h3 className="text-base font-semibold mb-3">WhatsApp direto</h3>

          <div className="bg-white p-3 rounded-xl w-fit mx-auto shadow">
            <QRCode value={wa || ""} size={80} />
          </div>

          <p className="mt-2 text-sm text-gray-300">Aponte a câmera</p>
        </div>

        {/* LOGO + INFO */}
        <div className="text-center flex flex-col items-center">
          {logoUrl && <img src={logoUrl} alt={nome} className="h-16 w-auto object-contain mb-2" />}

          <p className="text-xl font-semibold text-[#D4AC3A]">{nome}</p>
          {creci && <p className="text-sm text-gray-300 mb-2">CRECI {creci}</p>}

          <p className="text-sm text-gray-400 max-w-xs leading-relaxed mt-1">
            Atendimento profissional e transparente. Encontre seu imóvel com segurança e agilidade.
          </p>

          <div className="flex gap-5 pt-4 text-2xl">
            {instagram && (
              <a
                href={`https://instagram.com/${instagram}`}
                target="_blank"
                className="hover:text-[#D4AC3A] transition"
              >
                <FaInstagram />
              </a>
            )}
            {facebook && (
              <a
                href={`https://facebook.com/${facebook}`}
                target="_blank"
                className="hover:text-[#D4AC3A] transition"
              >
                <FaFacebook />
              </a>
            )}
            {whatsapp && (
              <a href={wa || ""} target="_blank" className="hover:text-[#D4AC3A] transition">
                <FaWhatsapp />
              </a>
            )}
          </div>
        </div>

        {/* GARANTIAS */}
        <div>
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
            <FaShieldAlt /> Garantia & Confiança
          </h3>

          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-[#D4AC3A]" /> Corretor credenciado
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-[#D4AC3A]" />
              Atendimento personalizado
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-[#D4AC3A]" />
              Transparência e segurança nas negociações
            </li>
          </ul>
        </div>
      </div>

      {/* BOTÃO VOLTAR AO TOPO */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 bg-[#D4AC3A] text-[#0D1B3A] p-3 rounded-full shadow-lg 
        hover:bg-[#f1d382] transition border border-white/20 text-xl"
        aria-label="Voltar ao topo"
      >
        ↑
      </button>

      {/* RODAPÉ FINAL */}
      <div className="text-center text-gray-400 text-sm py-6 border-t border-white/10">
        © {ano} {nome}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
