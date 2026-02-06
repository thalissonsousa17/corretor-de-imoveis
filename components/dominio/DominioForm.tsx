import { useState } from "react";

interface Props {
  dominioAtual: string | null;
  loading: boolean;
  onSalvar: (dominio: string) => void;
  onVerificar: () => void;
}

export default function DominioForm({ dominioAtual, loading, onSalvar, onVerificar }: Props) {
  const [dominio, setDominio] = useState("");

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
          disabled={loading}
          onClick={() => onSalvar(dominio)}
          className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50 cursor-pointer"
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
