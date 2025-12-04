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
  cidade?: string | null;
};

export default function Footer({
  nome,
  creci,
  whatsapp,
  instagram,
  facebook,
  logoUrl,
  // cidade = "Campina Grande - PB",
}: FooterProps) {
  const ano = new Date().getFullYear();
  const wa = whatsapp ? toWaLink(whatsapp) : "";

  return (
    <footer className="bg-[#0D1B3A] text-white pt-16 mt-20 relative">
      <div className="border-t-4 border-[#D4AC3A]"></div>
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* 2 — QR Code */}
        <div className="text-center">
          <h3 className="text-base font-semibold mb-3">WhatsApp direto</h3>

          <div className="bg-white p-2 rounded-xl w-fit mx-auto shadow">
            <QRCode value={wa || ""} size={70} />
          </div>

          <p className="mt-2 text-sm text-gray-300">Aponte a câmera</p>
        </div>

        {/* 1 — Logo + Info */}
        <div className="grid grid-cols-1 place-items-center ">
          {logoUrl && <img src={logoUrl} alt={nome} className="h-14 w-auto object-contain" />}

          <p className="text-lg font-semibold text-[#D4AC3A]">{nome}</p>
          {creci && <p className="text-sm text-gray-300">CRECI {creci}</p>}

          <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
            Atendimento profissional e transparente. Encontre seu imóvel com segurança e agilidade.
          </p>

          <div className="flex gap-4 pt-2 text-xl">
            {instagram && (
              <a
                href={`https://instagram.com/${instagram}`}
                target="_blank"
                className="hover:text-[#D4AC3A]"
              >
                <FaInstagram />
              </a>
            )}
            {facebook && (
              <a
                href={`https://facebook.com/${facebook}`}
                target="_blank"
                className="hover:text-[#D4AC3A]"
              >
                <FaFacebook />
              </a>
            )}
            {whatsapp && (
              <a href={wa || ""} target="_blank" className="hover:text-[#D4AC3A]">
                <FaWhatsapp />
              </a>
            )}
          </div>
        </div>

        {/* 3 — Mapa Mini */}
        {/* <div>
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
            <FaMapMarkerAlt /> Atuação
          </h3>

          <p className="text-sm text-gray-300 mb-2">{cidade}</p>

          <img
            src={`https://maps.googleapis.com/maps/api/staticmap?center=Campina+Grande,PB&zoom=13&size=250x150&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&markers=color:red|Campina+Grande,PB`}
            alt="Mapa"
            className="rounded-lg shadow-md border border-white/10"
          />
        </div> */}

        {/* 4 — Selo */}
        <div>
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
            <FaShieldAlt /> Garantia & Confiança
          </h3>

          <ul className="space-y-1 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-[#D4AC3A]" /> Corretor credenciado
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-[#D4AC3A]" /> Atendimento personalizado
            </li>
            <li className="flex items-center gap-2">
              <FaCheckCircle className="text-[#D4AC3A]" /> Transparência e segurança
            </li>
          </ul>
        </div>
      </div>

      {/* BOTÃO VOLTAR AO TOPO */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 bg-[#D4AC3A] text-[#0D1B3A] p-3 rounded-full shadow-lg hover:bg-white transition text-xl"
        aria-label="Voltar ao topo"
      >
        ↑
      </button>

      {/* COPYRIGHT */}
      <div className="text-center text-gray-400 text-sm py-6 border-t border-white/10 mt-6">
        © {ano} {nome}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
