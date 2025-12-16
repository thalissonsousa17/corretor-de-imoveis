import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function NotFoundPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isDashboard, setIsDashboard] = useState(false);
  const [publicSlug, setPublicSlug] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    const path = router.asPath || "";

    const dashboard = path.startsWith("/corretor") || path.startsWith("/dashboard");

    setIsDashboard(dashboard);

    if (!dashboard) {
      const slug = path.split("/").filter(Boolean)[0];
      setPublicSlug(slug || null);
    }
  }, [router.asPath]);

  if (!mounted) return null;

  const redirectHref = isDashboard ? "/login" : publicSlug ? `/${publicSlug}` : "/";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>

        <h2 className="mt-4 text-xl font-semibold text-gray-700">Página não encontrada</h2>

        <p className="mt-2 text-gray-500">
          {isDashboard
            ? "Não foi possível encontrar essa página dentro do ImobHub."
            : "Não encontramos essa página, mas você pode voltar ao perfil público."}
        </p>

        <Link
          href={redirectHref}
          className="inline-block mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition"
        >
          {isDashboard
            ? "Ir para o login"
            : publicSlug
              ? "Voltar para o perfil"
              : "Voltar para a página inicial"}
        </Link>
      </div>
    </main>
  );
}
