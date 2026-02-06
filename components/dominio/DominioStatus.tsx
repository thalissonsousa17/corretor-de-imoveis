type DominioStatusType = "PENDENTE" | "ATIVO" | "ERRO" | null;

interface Props {
  status: DominioStatusType;
}

export default function DominioStatus({ status }: Props) {
  if (!status) return null;

  const map = {
    ATIVO: "bg-green-100 text-green-700",
    PENDENTE: "bg-yellow-100 text-yellow-700",
    ERRO: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${map[status]}`}>{status}</span>
  );
}
