import type { APIRoute } from "astro";
import { getPublishedArticles } from "../lib/content/articles";

export const prerender = true;

export const GET: APIRoute = async () => {
  const articles = await getPublishedArticles();

  const noticias = articles.map((article) => {
    const data = article.data as unknown as Record<string, unknown>;

    const titulo = String(
      data.title ?? data.titulo ?? ""
    );

    const extracto = String(
      data.excerpt ?? data.description ?? data.extracto ?? ""
    );

    const slug = String(data.slug ?? article.id)
      .replace(/^\/+|\/+$/g, "");

    const texto = [
      titulo,
      extracto,
      article.body ?? "",
      data.category,
      data.subcategory,
      ...(Array.isArray(data.drivers) ? data.drivers : []),
      ...(Array.isArray(data.teams) ? data.teams : []),
      ...(Array.isArray(data.tags) ? data.tags : []),
    ].filter(Boolean).join(" ");

    return {
      titulo,
      extracto,
      url: `/noticias/${encodeURIComponent(slug)}/`,
      texto,
    };
  });

  return new Response(JSON.stringify(noticias), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
};
