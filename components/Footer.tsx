import { FaShieldAlt, FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { resolveFotoUrl as resolveAssetUrl } from "@/lib/imageUtils";
import { FiMail, FiPhone, FiArrowUp } from "react-icons/fi";
import QRCode from "react-qr-code";
import { toWaLink } from "@/lib/phone";

type FooterProps = {
  nome: string;
  creci?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  logoUrl?: string | null;
  email?: string | null;
  endereco?: string | null;
};



export default function Footer({
  nome,
  creci,
  whatsapp,
  instagram,
  facebook,
  logoUrl,
  email,
  endereco,
}: FooterProps) {
  const ano = new Date().getFullYear();
  const wa = whatsapp ? toWaLink(whatsapp) : "";
  const logoResolved = resolveAssetUrl(logoUrl);

  return (
    <footer className="relative bg-[#1a1814] text-white pt-24 overflow-hidden mt-20 transition-colors duration-500">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#b8912a]/8 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-[#b8912a]/5 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-16">
          
          {/* Col 1: Brand & About */}
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              {logoResolved ? (
                <img
                  src={logoResolved}
                  alt={nome}
                  className="h-12 w-auto object-contain dark:brightness-0 dark:invert transition-opacity hover:opacity-100"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <span className="text-2xl font-black tracking-tighter italic">
                  {nome.split(' ')[0]}<span className="text-accent">.</span>
                </span>
              )}
              <div className="w-12 h-1 bg-accent rounded-full" />
            </div>
            <p className="text-slate-300 text-sm leading-relaxed font-medium">
              Especialista em negócios imobiliários de alto padrão, oferecendo uma curadoria exclusiva para quem busca excelência e transparência.
            </p>
            <div className="flex gap-3">
              {[
                { icon: <FaInstagram />, href: instagram ? `https://instagram.com/${instagram}` : null },
                { icon: <FaFacebookF />, href: facebook ? `https://facebook.com/${facebook}` : null },
                { icon: <FaWhatsapp />, href: wa || null },
              ].map((social, i) => social.href && (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-accent hover:text-white hover:border-accent transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:pl-8">
            <h4 className="text-white font-bold text-sm uppercase tracking-[0.2em] mb-8">Navegação</h4>
            <ul className="space-y-4">
              {["Início", "Comprar", "Alugar", "Vendidos", "Perfil"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-300 hover:text-accent text-sm font-medium transition-colors flex items-center gap-2 group">
                    <div className="w-1 h-1 bg-slate-700 rounded-full group-hover:bg-accent transition-colors" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div className="space-y-8">
            <h4 className="text-white font-bold text-sm uppercase tracking-[0.2em]">Contato</h4>
            <div className="space-y-5">
              {whatsapp && (
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#b8912a]/10 text-[#b8912a] border border-[#b8912a]/20 group-hover:bg-[#b8912a] group-hover:text-white transition-all">
                    <FiPhone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">WhatsApp</p>
                    <p className="text-white text-sm font-bold">{whatsapp}</p>
                  </div>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-accent/10 text-accent border border-accent/20 group-hover:bg-accent group-hover:text-white transition-all">
                    <FiMail size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">E-mail</p>
                    <p className="text-white text-sm font-bold break-all">{email}</p>
                  </div>
                </div>
              )}
               {creci && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-[#9c9890] border border-white/5">
                    <FaShieldAlt size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Credencial</p>
                    <p className="text-white text-sm font-bold">CRECI {creci}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Col 4: Trust & QR */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center space-y-6">
            <h4 className="text-white font-bold text-sm">Escaneie & Chame</h4>
            {wa ? (
              <div className="p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-100">
                <QRCode value={wa} size={100} fgColor="#0A0F1D" />
              </div>
            ) : (
              <div className="w-[132px] h-[132px] bg-white/5 rounded-2xl flex items-center justify-center text-[#9c9890] italic text-xs p-4">
                WhatsApp Indisponível
              </div>
            )}
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Atendimento ágil direto no smartphone
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 pb-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em]">
            <span>© {ano} {nome}</span>
            <div className="hidden md:block w-1.5 h-1.5 bg-white/10 rounded-full" />
            <span>Todos os direitos reservados</span>
          </div>

          {/* Scroll to Top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-3 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-black uppercase tracking-widest group-hover:tracking-[0.3em] transition-all">Voltar ao topo</span>
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-white transition-all">
              <FiArrowUp size={18} />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
}
