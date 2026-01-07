import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccess() {
  const router = useRouter();
  const { src } = router.query;

  const [seconds, setSeconds] = useState(60);

  const isLanding = src === "landing";
  const redirectPath = isLanding ? "/login" : "/corretor/dashboard";

  useEffect(() => {
    if (seconds <= 0) {
      router.replace(redirectPath);
      return;
    }

    const timer = setTimeout(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds, router, redirectPath]);

  function handleGoNow() {
    router.replace(redirectPath);
  }

  return (
    <>
      <Head>
        <title>Pagamento confirmado • ImobHub</title>
      </Head>

      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl p-6 text-center">
          <CheckCircle className="mx-auto text-green-600" size={56} />

          <h1 className="text-2xl font-bold text-[#1A2A4F] mt-4">Pagamento confirmado</h1>

          {isLanding ? (
            <>
              <p className="text-gray-600 mt-4">Seu pagamento foi aprovado com sucesso.</p>

              <p className="text-gray-600 mt-2">
                Criamos sua conta automaticamente e enviamos sua senha por e-mail.
              </p>

              <p className="text-gray-600 mt-2">
                Recomendamos que você altere sua senha no primeiro acesso.
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-600 mt-4">Seu plano foi atualizado com sucesso.</p>

              <p className="text-gray-600 mt-2">
                Você já pode aproveitar todos os recursos do novo plano no painel.
              </p>
            </>
          )}

          <p className="text-sm text-gray-500 mt-6">
            Você será direcionado automaticamente em <br />
            <span className="font-semibold">{seconds}s</span>
          </p>

          <button
            onClick={handleGoNow}
            className="mt-6 w-full bg-[#1A2A4F] text-white py-3 rounded-lg font-semibold hover:opacity-90"
          >
            OK, ir agora
          </button>

          {isLanding && (
            <p className="text-xs text-gray-400 mt-4">
              Não encontrou o e-mail? Verifique a caixa de spam ou lixo eletrônico.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
