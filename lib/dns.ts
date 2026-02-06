import { resolveCname, resolve4 } from "dns/promises";

const DOMINIO_CANONICO = "imobhub.automatech.app.br";
const VERCEL_IP = "76.76.21.21";

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
    try {
      const ips = await resolve4(dominio);
      if (ips.includes(VERCEL_IP)) {
        return {
          ok: true,
          found: VERCEL_IP,
          expected: VERCEL_IP,
        };
      }
    } catch (e) {}

    const cnames = await resolveCname(dominio);
    const encontrado = cnames.find((cname) => cname.replace(/\.$/, "") === DOMINIO_CANONICO);

    if (!encontrado) {
      return {
        ok: false,
        found: cnames.join(", "),
        expected: DOMINIO_CANONICO,
        error: "O domínio não aponta para o IP ou CNAME esperado",
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
        expected: `${VERCEL_IP} ou ${DOMINIO_CANONICO}`,
        error: error.code === "ENODATA" ? "Nenhum registro DNS encontrado" : error.code,
      };
    }

    return {
      ok: false,
      expected: DOMINIO_CANONICO,
      error: "Erro desconhecido ao verificar DNS",
    };
  }
}
