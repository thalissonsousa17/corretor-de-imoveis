import { useEffect, useState } from "react";

interface Props {
  dominioAtual: string | null;
  loading: boolean;
  onSalvar: (dominio: string) => void;
  onVerificar: () => void;
}

export default function DominioForm({ dominioAtual, loading, onSalvar, onVerificar }: Props) {
  const [dominio, setDominio] = useState("");

  // 🔹 sincroniza input com backend
  useEffect(() => {
    if (dominioAtual) {
      setDominio(dominioAtual);
    }
  }, [dominioAtual]);

  const dominioLimpo = dominio.trim();

  const podeSalvar = dominioLimpo.length > 0 && dominioLimpo !== dominioAtual;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="ex: meusite.com.br"
          value={dominio}
          onChange={(e) => setDominio(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2"
        />

        <button
          disabled={loading || !podeSalvar}
          onClick={() => onSalvar(dominioLimpo)}
          className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
        >
          Salvar
        </button>
      </div>

      {dominioAtual && (
        <button disabled={loading} onClick={onVerificar} className="px-4 py-2 rounded-lg border">
          Verificar DNS
        </button>
      )}
    </div>
  );
}
