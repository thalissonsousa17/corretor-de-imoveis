import { AuthApiRequest, authorize } from "../../../lib/authMiddleware";
import { NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: true,
  },
};

const handleGetMe = async (req: AuthApiRequest, res: NextApiResponse) => {
  return res.status(200).json({
    user: req.user,
    message: "Sessão ativa.",
  });
};

export default async function handleMe(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return authorize(handleGetMe)(req, res);
  }
  return res.status(405).json({ message: "Método não permitido." });
}
