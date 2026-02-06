import { resolveCname } from "dns/promises";

const DOMINIO_CANONICO = "imobhub.automatech.app.br";

export type DnsCheckResult = {
  ok: boolean;
  found?: string;
  expected: string;
  error?: string;
};

function isNodeDnsError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

export async function verificarCnameDominio(dominio: string): Promise<DnsCheckResult> {
  try {
    const cnames = await resolveCname(dominio);

    const encontrado = cnames.find((cname) => cname.replace(/\.$/, "") === DOMINIO_CANONICO);

    if (!encontrado) {
      return {
        ok: false,
        found: cnames.join(", "),
        expected: DOMINIO_CANONICO,
        error: "CNAME não aponta para o domínio esperado",
      };
    }

    return {
      ok: true,
      found: encontrado,
      expected: DOMINIO_CANONICO,
    };
  } catch (error: unknown) {
    if (isNodeDnsError(error)) {
      return {
        ok: false,
        expected: DOMINIO_CANONICO,
        error: error.code ?? error.message,
      };
    }

    return {
      ok: false,
      expected: DOMINIO_CANONICO,
      error: "Erro desconhecido ao verificar DNS",
    };
  }
}
