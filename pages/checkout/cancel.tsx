import Head from "next/head";
import { useRouter } from "next/router";
import { XCircle } from "lucide-react";

export default function CheckoutCancel() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Pagamento cancelado • ImobHub</title>
      </Head>

      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl p-6 text-center">
          <XCircle className="mx-auto text-gray-400" size={56} />

          <h1 className="text-2xl font-bold text-[#1A2A4F] mt-4">Pagamento cancelado</h1>

          <p className="text-gray-600 mt-4">Nenhuma cobrança foi realizada.</p>

          <p className="text-gray-600 mt-2">
            Você pode escolher um plano novamente ou continuar navegando pela plataforma.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => router.push("/#planos")}
              className="w-full bg-[#1A2A4F] text-white py-3 rounded-lg font-semibold hover:opacity-90"
            >
              Voltar aos planos
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full border border-[#1A2A4F] text-[#1A2A4F] py-3 rounded-lg font-semibold hover:bg-[#1A2A4F] hover:text-white transition"
            >
              Continuar navegando
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
