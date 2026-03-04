export function GetBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Vercel injeta automaticamente VERCEL_URL (sem https://)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}