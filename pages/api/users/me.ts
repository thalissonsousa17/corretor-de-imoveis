import { AuthApiRequest, authorize } from "../../../lib/authMiddleware";
import { NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: true,
  },
};

async function handler(req: AuthApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json({
      user: req.user,
      message: "Sessão ativa.",
    });
  }
  return res.status(405).json({ message: "Método não permitido." });
}

export default authorize(handler);
