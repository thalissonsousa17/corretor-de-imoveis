import CorretorLayout from "@/components/CorretorLayout";
import { ModalUpgradePlano } from "@/components/ModalUpgradePlano";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface PerfilData {
  plano: "GRATUITO" | "START" | "PRO" | "EXPERT";
  planoStatus: "ATIVO" | "INATIVO" | "CANCELADO" | "EXPIRADO";
  stripeCurrentPeriodEnd?: string | null;
  stripeCustomerId?: string | null;
  ultimos4?: string | null;
  assinaturaCriadaEm?: string | null;
  ultimoPagamentoEm?: string | null;
}

export default function Assinaturas() {
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const carregar = async () => {
      try {
        const r = await axios.get("/api/corretor/perfil");
        setPerfil(r.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [router.query.success]);

  const atualizarPerfil = async () => {
    try {
      const r = await axios.get("/api/corretor/perfil");
      setPerfil(r.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (router.query.success) {
      router.replace("/dashboard/assinaturas", undefined, { shallow: true });
    }
  }, [router.query.success]);

  const abrirPortal = async () => {
    if (!perfil?.stripeCustomerId) {
      setShowModal(true);
      return;
    }

    try {
      const r = await axios.post("/api/stripe/portal");

      // ABRE EM NOVA ABA — forma correta (Stripe NÃO permite iFrame)
      window.open(r.data.url, "_blank");
    } catch (err) {
      console.error("Erro ao abrir portal:", err);
      setShowModal(true);
    }
  };

  // Helpers
  const traduzPlano = (p: string) => {
    switch (p) {
      case "START":
        return "Plano Start";
      case "PRO":
        return "Plano Pro";
      case "EXPERT":
        return "Plano Expert";
      default:
        return "Plano Gratuito";
    }
  };

  const traduzStatus = (s: string) => {
    switch (s) {
      case "ATIVO":
        return "Ativo";
      case "CANCELADO":
        return "Cancelado";
      case "EXPIRADO":
        return "Expirado";
      default:
        return "Inativo";
    }
  };

  const badgeStatus = (status: string) => {
    switch (status) {
      case "ATIVO":
        return "bg-green-100 text-green-700";
      case "CANCELADO":
        return "bg-red-100 text-red-700";
      case "EXPIRADO":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const limitePlano = (p: string) => {
    switch (p) {
      case "START":
        return "Até 100 imóveis";
      case "PRO":
        return "Até 50 imóveis";
      case "EXPERT":
        return "Imóveis ilimitados";
      default:
        return "Até 5 imóveis";
    }
  };

  const suportePlano = (p: string) => {
    switch (p) {
      case "START":
        return "Suporte prioritário";
      case "PRO":
        return "Suporte padrão";
      case "EXPERT":
        return "Suporte premium";
      default:
        return "Suporte básico";
    }
  };

  const formatarData = (data?: string | null) => {
    if (!data) return "–";
    const d = new Date(data);
    if (isNaN(d.getTime())) return "–";
    return d.toLocaleDateString("pt-BR");
  };

  const diasRestantes = () => {
    if (!perfil?.stripeCurrentPeriodEnd) return null;
    const hoje = new Date();
    const final = new Date(perfil.stripeCurrentPeriodEnd);
    const diff = Math.ceil((final.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 0);
  };

  const alertaVencimento = () => {
    if (perfil?.planoStatus !== "ATIVO") return null;
    const dias = diasRestantes();
    if (dias === null) return null;

    if (dias <= 7)
      return (
        <div className="p-3 bg-yellow-100 text-yellow-700 rounded-lg text-sm">
          ⚠️ Sua assinatura vence em {dias} dias.
        </div>
      );

    return null;
  };

  if (loading) {
    return (
      <CorretorLayout>
        <div className="p-8 text-lg">Carregando informações...</div>
      </CorretorLayout>
    );
  }

  if (!perfil) {
    return (
      <CorretorLayout>
        <div className="p-8 text-lg text-red-600">Não foi possível carregar seus dados.</div>
      </CorretorLayout>
    );
  }

  return (
    <CorretorLayout>
      <div className="max-w-3xl mx-auto p-8 space-y-8">
        <h1 className="text-3xl font-bold text-[#1A2A4F]">Gerenciar Assinatura</h1>

        {alertaVencimento()}

        {perfil.planoStatus === "ATIVO" && (
          <div className="p-4 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg">
            🎉 Sua assinatura está ativa!
          </div>
        )}

        {/* PLANO ATUAL */}
        <div className="p-6 border border-[#1A2A4F] rounded-xl bg-white shadow">
          <h2 className="text-xl font-semibold text-[#1A2A4F] mb-4">Plano Atual</h2>

          <div className="space-y-3 text-lg text-[#1A2A4F]">
            <p>
              <b>Plano:</b> {traduzPlano(perfil.plano)}
            </p>

            <p>
              <b>Status:</b>
              <span className={`px-3 py-1 text-sm rounded-full ${badgeStatus(perfil.planoStatus)}`}>
                {traduzStatus(perfil.planoStatus)}
              </span>
            </p>

            {perfil.planoStatus === "ATIVO" && perfil.stripeCurrentPeriodEnd && (
              <p>
                <b>Validade:</b> {formatarData(perfil.stripeCurrentPeriodEnd)}{" "}
                <span className="text-sm text-gray-500">({diasRestantes()} dias restantes)</span>
              </p>
            )}

            {perfil.ultimos4 && (
              <p>
                <b>Cartão cadastrado:</b> •••• {perfil.ultimos4}
              </p>
            )}
          </div>
        </div>

        {/* BENEFÍCIOS */}
        <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Benefícios do seu plano</h3>

          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Página profissional personalizada</li>
            <li>Hospedagem inclusa</li>
            <li>{limitePlano(perfil.plano)}</li>
            <li>{suportePlano(perfil.plano)}</li>
            <li>Dashboard completo</li>
          </ul>
        </div>

        {/* PORTAL DE COBRANÇA */}
        <div className="space-y-3">
          {perfil.plano !== "GRATUITO" && (
            <button
              onClick={abrirPortal}
              className="px-6 py-3 bg-[#1A2A4F] text-white rounded-lg hover:bg-[#15203E] transition w-full"
            >
              Gerenciar assinatura
            </button>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 border border-[#1A2A4F] text-[#1A2A4F] rounded-lg hover:bg-[#1A2A4F] hover:text-white transition w-full"
          >
            {perfil.plano === "GRATUITO"
              ? "Ver planos"
              : perfil.planoStatus === "EXPIRADO"
                ? "Reativar plano"
                : "Trocar de plano"}
          </button>
        </div>

        {showModal && (
          <ModalUpgradePlano
            open={showModal}
            onClose={() => {
              setShowModal(false);
              atualizarPerfil();
            }}
          />
        )}

        <div className="p-4 bg-green-100 text-green-700 rounded-lg text-sm">
          👉 Dica: personalize sua página pública para melhorar suas conversões!
        </div>
      </div>
    </CorretorLayout>
  );
}
