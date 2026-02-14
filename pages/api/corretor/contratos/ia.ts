import type { NextApiResponse } from "next";
import { authorize, AuthApiRequest } from "@/lib/authMiddleware";
import axios from "axios";

// Aumenta o limite do body parser para suportar o HTML completo do contrato
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
};

// ─── Utilitários ──────────────────────────────────────────────────────────────

/** Extrai todos os marcadores únicos [CAMPO] do HTML do contrato */
function extrairCampos(html: string): string[] {
  const matches = html.match(/\[[^\][\n]{1,80}\]/g) ?? [];
  return [...new Set(matches)];
}

/** Escapa caracteres especiais de regex */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Aplica o mapeamento {[CAMPO]: valor} ao HTML do contrato */
function preencherHtml(html: string, campos: Record<string, string>): string {
  let resultado = html;
  for (const [campo, valor] of Object.entries(campos)) {
    if (valor && valor.trim()) {
      resultado = resultado.replace(new RegExp(escapeRegex(campo), "g"), valor);
    }
  }
  return resultado;
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export default authorize(async function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (!req.user?.id) return res.status(401).json({ error: "Não autenticado" });

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { mensagem, contratoHtml } = req.body as {
    mensagem: string;
    contratoHtml?: string;
  };

  if (!mensagem?.trim()) {
    return res.status(400).json({ error: "Mensagem é obrigatória" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("[IA] OPENAI_API_KEY não definida. Reinicie o servidor após alterar o .env.local");
    return res.status(500).json({ error: "Chave da API OpenAI não está configurada. Reinicie o servidor de desenvolvimento." });
  }

  // Detecta se há campos a preencher no contrato atual
  const camposDisponiveis = contratoHtml ? extrairCampos(contratoHtml) : [];

  const systemPrompt = `Você é um especialista em contratos imobiliários brasileiros (Lei 8.245/91, Código Civil, COFECI/CRECI).

Suas funções:
- Responder dúvidas sobre contratos imobiliários
- Sugerir e revisar cláusulas
- PREENCHER CAMPOS do contrato com os dados fornecidos pelo usuário

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODO DE PREENCHIMENTO DE CAMPOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Quando o usuário fornecer dados para preencher o contrato, faça o seguinte:

1. Mapeie cada dado fornecido ao campo correspondente da lista abaixo.
2. Retorne um bloco JSON entre as marcações exatas <CAMPOS> e </CAMPOS>:

<CAMPOS>{"[NOME DO CAMPO]": "valor preenchido", "[OUTRO CAMPO]": "outro valor"}</CAMPOS>

3. Após as marcações, escreva uma mensagem curta informando:
   - Quais campos foram preenchidos
   - Quais campos da lista ficaram sem dado (se houver)

REGRAS:
- Inclua no JSON APENAS campos que você conseguiu preencher com os dados fornecidos
- NÃO invente dados que não foram fornecidos
- Use o nome EXATO do campo como chave (incluindo os colchetes [ ])
- Responda sempre em português brasileiro

IMPORTANTE: Suas sugestões são orientações gerais e não substituem consultoria jurídica especializada.`;

  // Monta a mensagem com os campos disponíveis (muito mais eficiente que enviar o HTML completo)
  let userMessage = mensagem;
  if (camposDisponiveis.length > 0) {
    userMessage += `\n\n---\nCampos disponíveis neste contrato para preenchimento:\n${camposDisponiveis.join("\n")}`;
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 1500,
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const raw: string =
      response.data.choices?.[0]?.message?.content ?? "Não foi possível obter resposta.";

    // Tenta extrair o bloco JSON de preenchimento <CAMPOS>...</CAMPOS>
    const match = raw.match(/<CAMPOS>([\s\S]*?)<\/CAMPOS>/);
    let contratoPreenchido: string | undefined;
    let resposta = raw;

    if (match && contratoHtml) {
      try {
        const camposJson = JSON.parse(match[1].trim()) as Record<string, string>;
        contratoPreenchido = preencherHtml(contratoHtml, camposJson);
        // Remove o bloco JSON da mensagem exibida no chat
        resposta = raw
          .replace(/<CAMPOS>[\s\S]*?<\/CAMPOS>/g, "")
          .trim();
      } catch (parseErr) {
        console.error("[IA] Erro ao parsear JSON de campos:", parseErr);
        // Continua sem preenchimento
      }
    }

    return res.status(200).json({ resposta, contratoPreenchido });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const openaiMsg = (error.response?.data as { error?: { message?: string } })?.error?.message;

      console.error(`[IA] Erro OpenAI status=${status}:`, openaiMsg ?? error.message);

      if (status === 401) return res.status(500).json({ error: "Chave da API OpenAI inválida ou expirada." });
      if (status === 429) return res.status(429).json({ error: "Limite de requisições da OpenAI atingido. Aguarde alguns segundos." });
      if (status === 400) return res.status(500).json({ error: `Requisição inválida para a IA: ${openaiMsg ?? "verifique o conteúdo enviado."}` });
      if (status === 503 || status === 502) return res.status(503).json({ error: "Serviço da OpenAI temporariamente indisponível. Tente novamente." });
      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT")
        return res.status(504).json({ error: "Tempo limite excedido. Tente novamente." });

      return res.status(500).json({ error: openaiMsg ?? "Erro ao consultar a IA. Tente novamente." });
    }

    console.error("[IA] Erro desconhecido:", error);
    return res.status(500).json({ error: "Erro inesperado ao consultar a IA. Tente novamente." });
  }
});
