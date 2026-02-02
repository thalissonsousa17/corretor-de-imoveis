import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

export default function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const titulo = searchParams.get("titulo") || "Imóvel";
  const preco = searchParams.get("preco") || "";
  const cidade = searchParams.get("cidade") || "";
  const imagem = searchParams.get("imagem");

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          backgroundColor: "#0F172A",
          color: "white",
          fontSize: 42,
        }}
      >
        {/* IMAGEM */}
        {imagem && (
          <img src={imagem} style={{ width: "50%", height: "100%", objectFit: "cover" }} />
        )}

        {/* TEXTO */}
        <div
          style={{
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "50%",
          }}
        >
          <strong>{titulo}</strong>
          <span style={{ marginTop: 20 }}>{preco}</span>
          <span style={{ marginTop: 10, fontSize: 32 }}>{cidade}</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
