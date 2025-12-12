export interface CardNoticiaProps {
  titulo: string;
  data: string;
  resumo?: string;
  link?: string;
}

export default function CardNoticia({ titulo, data, resumo, link = "#" }: CardNoticiaProps) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="block  bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition border border-gray-200"
    >
      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-[#1A2A4F] leading-tight mb-2">{titulo}</h3>

        <p className="text-xs text-gray-500 mb-2">{data}</p>

        {resumo && <p className="text-sm text-gray-600 line-clamp-3">{resumo}</p>}
      </div>
    </a>
  );
}
