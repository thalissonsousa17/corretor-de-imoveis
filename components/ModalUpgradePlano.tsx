import { X, CheckCircle, CreditCard, RefreshCcw } from "lucide-react";
import { useRef, useState } from "react";

type BillingAction = "SUBSCRIBE" | "UPGRADE_KEEP" | "UPGRADE_CHANGE";

interface Props {
  open: boolean;
  onClose: () => void;
  hasSubscription: boolean;
}

export function ModalUpgradePlano({ open, onClose, hasSubscription }: Props) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState<string | null>(null);
  const [paymentChoice, setPaymentChoice] = useState<"KEEP" | "CHANGE">("KEEP");

  const isProcessingRef = useRef(false);

  if (!open && !showSuccess) return null;

  async function handleCheckout(priceId: string) {
    if (isProcessingRef.current) return;

    isProcessingRef.current = true;
    setLoadingPrice(priceId);

    let action: BillingAction;

    if (!hasSubscription) {
      action = "SUBSCRIBE";
    } else {
      action = paymentChoice === "KEEP" ? "UPGRADE_KEEP" : "UPGRADE_CHANGE";
    }

    try {
      const res = await fetch("/api/stripe/plan", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, action }),
      });

      const data: {
        ok: boolean;
        flow?: "CHECKOUT" | "UPGRADE_KEEP";
        url?: string;
        error?: string;
      } = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Erro ao processar pagamento");
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setShowSuccess(true);
    } catch (err) {
      console.error("CHECKOUT_FRONTEND_ERROR:", err);
      alert(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      isProcessingRef.current = false;
      setLoadingPrice(null);
    }
  }

  function handleCloseSuccess() {
    setShowSuccess(false);
    isProcessingRef.current = false;
    setLoadingPrice(null);
    onClose();
    window.location.reload();
  }

  const disabled = loadingPrice !== null;

  return (
    <>
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative bg-white w-full max-w-sm mx-4 rounded-2xl shadow-xl p-6 text-center">
            <CheckCircle className="mx-auto text-green-600" size={48} />
            <h2 className="text-xl font-bold text-[#1A2A4F] mt-4">Plano atualizado com sucesso</h2>
            <p className="text-gray-600 mt-2">Seu novo plano já está ativo.</p>

            <button
              onClick={handleCloseSuccess}
              className="cursor-pointer mt-6 w-full bg-[#1A2A4F] text-white py-2 rounded-lg font-semibold"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {open && !showSuccess && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />

          <div className="relative bg-white w-full max-w-4xl mx-4 rounded-2xl shadow-xl p-6">
            <button
              onClick={onClose}
              className="cursor-pointer absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold text-[#1A2A4F] mb-2">
              {hasSubscription ? "Upgrade de plano" : "Assinar plano"}
            </h2>

            <p className="text-gray-600 mb-4">
              {hasSubscription
                ? "Escolha como deseja realizar o pagamento."
                : "Escolha o plano ideal para você."}
            </p>

            {hasSubscription && (
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setPaymentChoice("KEEP")}
                  className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border font-semibold transition ${
                    paymentChoice === "KEEP"
                      ? "bg-[#1A2A4F] text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <CreditCard size={18} />
                  Manter cartão atual
                </button>

                <button
                  onClick={() => setPaymentChoice("CHANGE")}
                  className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border font-semibold transition ${
                    paymentChoice === "CHANGE"
                      ? "bg-[#1A2A4F] text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <RefreshCcw size={18} />
                  Usar outro cartão
                </button>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4 text-[#1A2A4F]">
              <PlanoCard
                titulo="Pro"
                preco="R$ 79,90"
                descricao="até 50 imóveis"
                loading={loadingPrice === process.env.NEXT_PUBLIC_PRICE_PRO}
                disabled={disabled}
                onClick={() => handleCheckout(process.env.NEXT_PUBLIC_PRICE_PRO!)}
              />

              <PlanoCard
                titulo="Start"
                preco="R$ 99,90"
                descricao="até 100 imóveis"
                loading={loadingPrice === process.env.NEXT_PUBLIC_PRICE_START}
                disabled={disabled}
                onClick={() => handleCheckout(process.env.NEXT_PUBLIC_PRICE_START!)}
              />

              <PlanoCard
                titulo="Expert"
                preco="R$ 149,90"
                descricao="imóveis ilimitados"
                destaque
                loading={loadingPrice === process.env.NEXT_PUBLIC_PRICE_EXPERT}
                disabled={disabled}
                onClick={() => handleCheckout(process.env.NEXT_PUBLIC_PRICE_EXPERT!)}
              />
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                className="cursor-pointer text-sm text-gray-500 hover:underline"
              >
                Talvez depois
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PlanoCard({
  titulo,
  preco,
  descricao,
  onClick,
  loading,
  disabled,
  destaque,
}: {
  titulo: string;
  preco: string;
  descricao: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  destaque?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 text-center transition ${
        destaque ? "border-2 border-[#1A2A4F]" : "border"
      }`}
    >
      {destaque && <span className="text-xs font-bold text-[#1A2A4F]">MAIS POPULAR</span>}

      <h3 className="font-bold text-lg mt-1">{titulo}</h3>
      <p className="text-2xl font-extrabold mt-2">{preco}</p>
      <p className="text-sm text-gray-500">{descricao}</p>

      <button
        onClick={onClick}
        disabled={disabled}
        className="cursor-pointer mt-4 w-full bg-[#1A2A4F] text-white py-2 rounded-lg font-semibold disabled:opacity-50"
      >
        {loading ? "Processando..." : "Assinar"}
      </button>
    </div>
  );
}
