import React, { useState } from "react";
import axios from "axios";
import { Endereco } from "../types/endereco";

const BuscaEndereco: React.FC<{ onEnderecoAchado: (endereco: Endereco, cep: string) => void }> = ({
  onEnderecoAchado,
}) => {
  const [cep, setCep] = useState("");
  const [erro, setErro] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const buscarCep = async () => {
    setErro("");
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      setErro("O CEP deve conter 8 dígitos.");
      return;
    }

    setIsLoading(true);

    try {
      const resposta = await axios.get(`/api/cep?cep=${cepLimpo}`);

      const dados = resposta.data;
      if (dados.erro) {
        setErro("CEP não encontrado.");
      } else {
        const novoEndereco: Endereco = {
          logradouro: dados.logradouro,
          bairro: dados.bairro,
          localidade: dados.localidade,
          uf: dados.uf,
        };
        onEnderecoAchado(novoEndereco, cepLimpo);
        setErro("");
      }
    } catch (error) {
      setErro("Erro ao buscar o CEP. Verifique sua conexão.");
      console.error("Erro na busca de CEP:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="md:col-span-2 w-full">
      <label htmlFor="cep" className="block text-sm font-medium text-gray-700">
        CEP *
      </label>

      <div className="flex mt-1 w-full flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
        {/* INPUT */}
        <input
          type="text"
          id="cep"
          value={cep}
          onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
          onBlur={buscarCep}
          required
          disabled={isLoading}
          className="
            block 
            w-full 
            border border-gray-700 
            rounded-md sm:rounded-l-md sm:rounded-r-none
            shadow-sm 
            p-2 
            focus:ring-blue-500 
            focus:border-blue-500 
            disabled:bg-gray-50
          "
          placeholder="Ex: 58400000"
        />

        {/* BOTÃO */}
        <button
          type="button"
          onClick={buscarCep}
          disabled={isLoading || cep.length !== 8}
          className="
            sm:ml-0
            w-full sm:w-auto
            px-4 py-2
            bg-blue-600 text-white 
            rounded-md sm:rounded-r-md sm:rounded-l-none 
            hover:bg-blue-700 
            disabled:bg-gray-400
            focus:outline-none 
            focus:ring-2 
            focus:ring-offset-2 
            focus:ring-blue-500
            flex items-center justify-center
          "
          aria-label="Buscar CEP"
        >
          {isLoading ? (
            <span className="animate-spin h-5 w-5 block border-2 border-r-transparent rounded-full"></span>
          ) : (
            "🔍"
          )}
        </button>
      </div>

      {erro && <p className="mt-1 text-sm text-red-600">{erro}</p>}
    </div>
  );
};

export default BuscaEndereco;
