import CorretorLayout from "@/components/CorretorLayout";
import axios from "axios";
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
  }, []);

  const abrirPortal = async () => {
    if (!perfil?.stripeCustomerId) {
      setShowModal(true);
      return;
    }

    try {
      const r = await axios.post("/api/stripe/portal");
      window.location.href = r.data.url;
    } catch (err) {
      console.error("Erro ao abrir portal:", err);
      setShowModal(true);
    }
  };

  const traduzPlano = (p: string) => {
    switch (p) {
      case "START":
        return "Plano Mensal";
      case "PRO":
        return "Plano Semestral";
      case "EXPERT":
        return "Plano Anual";
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
    return diff;
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
  } // Modal

  const ModalPlanoGratuito = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md animation-fadeIn">
           
      <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-8 max-w-md w-full relative animate-scaleIn">
                {/* Ícone circular */}       
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1A2A4F] flex items-center justify-center shadow-md">
                   
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
                       
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h1m0 8h-1m9-8a9 9 0 11-18 0 9 9 0 0118 0z"
            />
                     
          </svg>
                 
        </div>
               
        <h2 className="text-2xl font-bold text-[#1A2A4F] text-center mb-4">Plano Gratuito</h2>     
         
        <p className="text-gray-700 text-center leading-relaxed mb-6">
                    Você está utilizando o <b>plano gratuito</b> e ainda não possui assinaturas ou
          cobranças           ativas no Stripe.           <br />
                    <br />          Não é necessário renovar. Caso deseje contratar um plano, acesse
          a página de assinatura da           plataforma.        
        </p>
               
        <button
          onClick={() => setShowModal(false)}
          className="cursor-pointer w-full py-3 bg-[#1A2A4F] text-white font-medium rounded-xl hover:bg-[#15203E] transition-shadow shadow-md hover:shadow-lg"
        >
                    Entendi        
        </button>
             
      </div>
         
    </div>
  );

  return (
    <CorretorLayout>
           
      <div className="max-w-3xl mx-auto p-8 space-y-8">
                {/* Título */}       
        <h1 className="text-3xl font-bold text-[#1A2A4F]">Gerenciar Assinatura</h1>       
        {/* ALERTAS */}        {alertaVencimento()}        {/* CARD DE BOAS-VINDAS */}       
        {perfil.planoStatus === "ATIVO" && (
          <div className="p-4 bg-blue-100 border border-blue-300 text-blue-700 rounded-lg">
                        🎉 Sua assinatura está ativa! Aproveite todos os recursos da plataforma.    
                 
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
                       
            {/* <p>
                            <b>Próxima renovação:</b> {formatarData(perfil.stripeCurrentPeriodEnd)} 
                       
            </p> */}
                       
            {perfil.ultimos4 && (
              <p>
                                <b>Cartão cadastrado:</b> •••• {perfil.ultimos4}             
              </p>
            )}
                     
          </div>
                 
        </div>
                {/* TIMELINE */}       
        {/* <div className="p-6 border border-gray-200 rounded-xl bg-gray-50 shadow-sm">
                   
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Linha do tempo da assinatura</h3>
                   
          <div className="space-y-2 text-gray-700">
                       
            <p>
                            <b>Assinatura iniciada:</b> {formatarData(perfil.assinaturaCriadaEm)}   
                     
            </p>
                       
            <p>
                            <b>Último pagamento:</b> {formatarData(perfil.ultimoPagamentoEm)}       
                 
            </p>
                       
            <p>
                            <b>Próxima cobrança:</b> {formatarData(perfil.stripeCurrentPeriodEnd)} 
                       
            </p>
                   
          </div>
                 
        </div> */}
                {/* BENEFICIOS DO PLANO */}       
        <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm">
                   
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Benefícios do seu plano</h3>     
             
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Página profissional personalizada com seu nome e slug</li>           
            <li>Hospedagem inclusa</li>            <li>Cadastro ilimitado de imóveis</li>           
            <li>Suporte via WhatsApp</li>            <li>Dashboard do corretor completo</li>       
             
          </ul>
                 
        </div>
                {/* COMPARATIVO */}       
        <div className="p-6 border border-gray-200 rounded-xl bg-gray-50 shadow-sm">
                   
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Outros planos disponíveis</h3>   
               
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
                       
            <li>
                            <b>Plano Mensal:</b> Flexibilidade mensal            
            </li>
                       
            <li>
                            <b>Plano Semestral:</b> Economia de 15%            
            </li>
                       
            <li>
                            <b>Plano Anual:</b> Economia de até 30%            
            </li>
                     
          </ul>
                   
          <p className="mt-3 text-sm text-gray-500">
                        Para mudar de plano, acesse o portal de cobrança.          
          </p>
                 
        </div>
                {/* PORTAL DE COBRANÇA */}       
        <button
          onClick={abrirPortal}
          className="px-6 py-3 bg-[#1A2A4F] text-white rounded-lg hover:bg-[#15203E] transition w-full cursor-pointer"
        >
                    Abrir Portal de Cobrança      
        </button>
                {/* Próximos passos */}     
        <div className="p-4 bg-green-100 text-green-700 rounded-lg text-sm">
                    👉 Dica: personalize sua página pública para aumentar conversões!        
        </div>
                {showModal && <ModalPlanoGratuito />}     
      </div>
         
    </CorretorLayout>
  );
}
