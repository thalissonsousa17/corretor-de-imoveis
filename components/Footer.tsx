type FooterProps = {
  nome: string;
  creci?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  logoUrl?: string | null;
};

export default function Footer({
  nome,
  creci,
  whatsapp,
  instagram,
  linkedin,
  facebook,
  logoUrl,
}: FooterProps) {
  const ano = new Date().getFullYear();

  return (
    <footer className="bg-[#0D1B3A] text-white mt-20">
      {/* Linha dourada premium */}
      <div className="border-t-4 border-[#D4AC3A]"></div>

      <div className="max-w-7xl mx-auto px-8 py-10 text-center">
        {/* Logo se existir */}
        {logoUrl && <img src={logoUrl} alt={nome} className="mx-auto h-14 mb-3 object-contain" />}

        <p className="text-sm text-gray-300">
          © {ano} <span className="font-semibold text-[#D4AC3A]">{nome}</span>
        </p>

        {creci && <p className="text-xs text-gray-400 mt-1">CRECI {creci}</p>}

        {whatsapp && (
          <p className="text-xs text-gray-400 mt-1">
            WhatsApp:{" "}
            <a
              href={`https://wa.me/55${whatsapp.replace(/\D/g, "")}`}
              className="underline hover:text-[#D4AC3A]"
              target="_blank"
            >
              {whatsapp}
            </a>
          </p>
        )}

        {/* Redes sociais */}
        <div className="flex justify-center gap-6 mt-4 text-sm">
          {instagram && (
            <a href={instagram} target="_blank" className="hover:text-[#D4AC3A]">
              Instagram
            </a>
          )}
          {linkedin && (
            <a href={linkedin} target="_blank" className="hover:text-[#D4AC3A]">
              LinkedIn
            </a>
          )}
          {facebook && (
            <a href={facebook} target="_blank" className="hover:text-[#D4AC3A]">
              Facebook
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
