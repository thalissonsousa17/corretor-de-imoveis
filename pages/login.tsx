import { useAuth } from "@/lib/AuthContext";
import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/login", { email, password });

      if (response.status === 200) {
        login(response.data.user);
        
        // Redireciona com base no role do usuário
        if (response.data.user.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/corretor/dashboard");
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || "Ocorreu um erro ao fazer no login.");
      } else {
        setError("Ocorreu um erro desconhecido. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 px-4">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-center text-gray-700">Acessar sua Conta</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* EMAIL */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              className="text-gray-500 mt-1 block w-full px-3 py-2 border border-gray-300 
                         rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* SENHA */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="text-gray-500 mt-1 block w-full px-3 py-2 border border-gray-300 
                         rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* ERRO */}
          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

          {/* BOTÃO */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 rounded shadow-sm text-sm font-medium 
                       text-white bg-blue-600 hover:bg-blue-700 
                       focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
