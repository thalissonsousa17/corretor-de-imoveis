import { Finalidade } from "@prisma/client";

export type TipoImovel = "APARTAMENTO" | "CASA" | "TERRENO" | "COMERCIAL";

export interface Foto {
  id: string;
  url: string;
  principal: boolean;
  ordem: number;
  imovelId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CorretorInfo {
  name: string;
  email: string;
}
export type Status = "Disponivel" | "Vendido" | "Inativo";
export interface Imovel {
  id: string;
  titulo: string;
  descricao: string;
  preco: number | string;
  tipo: string;
  localizacao: string;
  cidade: string;
  estado: string;
  bairro?: string;
  rua?: string;
  numero?: string;
  cep?: string;
  disponivel: boolean;
  corretorId: string;
  createdAt: string;
  updatedAt: string;
  fotos: Foto[];
  corretor?: CorretorInfo;
  status?: Status;
  finalidade?: Finalidade;
}
