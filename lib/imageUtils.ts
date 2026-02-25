/**
 * Utilitário robusto para resolver URLs de imagens salvos no banco de dados.
 * Lida com caminhos absolutos, caminhos do Windows (\), caminhos do Linux (/),
 * URLs do Next.js API e URLs externas (http).
 */
export function resolveFotoUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.png";
  if (url.startsWith("blob:")) return url;
  if (url.startsWith("http") || url.startsWith("https")) return url;
  
  // Se for uma URL que já aponta para a nossa API de uploads, retorna ela mesma
  if (url.startsWith("/api/uploads/")) return url;

  // Extrai apenas o nome do arquivo, lidando com ambos separadores de pastas: / e \
  // Isso resolve problemas de compatibilidade entre Windows (local) e Linux (VPS)
  const fileName = url.split(/[\\/]/).pop();

  if (!fileName) return "/placeholder.png";

  // Retorna a rota da API filtrada que serve os arquivos da pasta UPLOAD_DIR
  return `/api/uploads/${fileName}`;
}
