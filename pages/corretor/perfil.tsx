import CorretorLayout from "@/components/CorretorLayout";
import React from "react";

const Perfil = () => {
  //   const handleSuccess = () => {
  //     console.log("Perfil atualizado com sucesso! Exibir mensagem ou redirecionar.");
  //   };

  return (
    <CorretorLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold text-gray-800">👤 Meu Perfil</h1>
        <p className="text-gray-600">
          Aqui você pode visualizar e editar as informações do seu perfil.
        </p>
      </div>
    </CorretorLayout>
  );
};

export default Perfil;
