import Parser from "rss-parser";
import type { NextApiRequest, NextApiResponse } from "next";

type FeedItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  contentSnippet?: string;
};

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const parser = new Parser<FeedItem>();

    const feed = await parser.parseURL(
      "https://news.google.com/rss/search?q=financiamento+imobiliário&hl=pt-BR&gl=BR&ceid=BR:pt-419"
    );

    const items = feed.items ?? [];

    const noticias = items.slice(0, 15).map((item) => ({
      titulo: item.title || "Sem título",
      link: item.link || "",
      data: item.pubDate || "",
      resumo: (item.contentSnippet || "").substring(0, 120).trim() + "...",
    }));

    res.status(200).json(noticias);
  } catch (error) {
    console.error("API Notícias erro:", error);
    res.status(200).json({ noticias: [] });
  }
}
