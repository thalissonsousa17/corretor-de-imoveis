import { useEffect } from "react";
import { useRouter } from "next/router";

export default function PosCheckout() {
  const router = useRouter();

  useEffect(() => {
    let tentativas = 0;

    const verificarPlano = async () => {
      try {
        const res = await fetch("/api/assinaturas/status");

        if (!res.ok) throw new Error("Erro ao consultar status");

        const data = await res.json();

        if (data.planoStatus === "ATIVO") {
          router.replace("/corretor/dashboard");
          return;
        }

        tentativas++;

        if (tentativas < 5) {
          setTimeout(verificarPlano, 1500);
        } else {
          router.replace("/dashboard/gerenciar-planos");
        }
      } catch (err) {
        console.error("Erro ao verificar plano:", err);
        router.replace("/dashboard/gerenciar-planos");
      }
    };

    verificarPlano();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
      <div className="animate-spin h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent" />

      <p className="text-lg font-medium text-gray-700">Finalizando seu pagamento...</p>

      <p className="text-sm text-gray-500">Isso pode levar alguns segundos.</p>
    </div>
  );
}
