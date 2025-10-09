import { AuthApiRequest, authorize } from "@/lib/authMiddleware";
import { NextApiResponse } from "next";

const handleGetMe = async (req: AuthApiRequest, res: NextApiResponse) => {
  if (req.user) {
    res.status(200).json({ user: req.user, message: "Sessão ativa." });
  }

  return res.status(401).json({ message: "Sessão inválida ou expirada." });
};

export default async function handleMe(
  req: AuthApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    return authorize(handleGetMe)(req, res);
  }
  return res.status(405).json({ message: "Método não permitido." });
}
