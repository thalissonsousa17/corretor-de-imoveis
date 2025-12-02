import Parser from "rss-parser";
import type { NextApiRequest, NextApiResponse } from "next";

type FeedItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
};

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const parser = new Parser<FeedItem>();

    const feed = await parser.parseURL(
      "https://news.google.com/rss/search?q=financiamento+imobiliário&hl=pt-BR&gl=BR&ceid=BR:pt-419"
    );

    const noticias = (feed.items || []).slice(0, 10).map((item) => {
      const titulo = item.title || "Sem título";
      const link = item.link || "#";
      const data = item.pubDate || "";

      // Extrair thumbnail do HTML do conteúdo
      const html = item.content || "";
      const imageMatch = html.match(/<img[^>]+src="([^">]+)"/);
      const thumbnail = imageMatch ? imageMatch[1] : null;

      // Resumo curto (120 caracteres)
      const resumo =
        item.contentSnippet?.substring(0, 120).trim() + "..." || "Clique para ler mais.";

      return {
        titulo,
        link,
        data,
        resumo,
        thumbnail: thumbnail || "https://via.placeholder.com/600x400?text=Notícia+Imobiliária",
      };
    });

    res.status(200).json(noticias);
  } catch (error) {
    console.error("Erro RSS:", error);
    res.status(500).json({ error: "Erro ao buscar notícias" });
  }
}
