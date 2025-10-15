// types/Imovel.ts

// Enum ou Union Type para os tipos de imóvel
export type TipoImovel = "APARTAMENTO" | "CASA" | "TERRENO" | "COMERCIAL";

// Tipo para as fotos, conforme o schema do Prisma (Foto)
export interface Foto {
  id: string;
  url: string; // Ex: /uploads/nome_do_arquivo.jpg
  principal: boolean;
  ordem: number;
  imovelId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipo para os dados básicos do Corretor (usado em includes)
export interface CorretorInfo {
  name: string;
  email: string;
}

// O tipo principal do Imóvel, espelhando a estrutura do Prisma
export interface Imovel {
  id: string;
  titulo: string;
  descricao: string;
  preco: number; // Stored as Decimal in DB, number in TS
  tipo: string;
  localizacao: string; // Campo obrigatório que causou erro no backend
  cidade: string;
  estado: string;
  bairro?: string;
  rua?: string;
  numero?: string;
  cep?: string;
  disponivel: boolean; // Usado para status (Disponível/Vendido)
  corretorId: string;
  createdAt: string;
  updatedAt: string;
  fotos: Foto[];
  corretor?: CorretorInfo;
}
