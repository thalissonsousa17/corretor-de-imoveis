// Enums e tipos locais — substituem os imports de @prisma/client

export type PlanoTipo    = "GRATUITO" | "PRO" | "START" | "EXPERT";
export type PlanoStatus  = "ATIVO" | "CANCELADO" | "EXPIRADO" | "INATIVO";
export type ImovelStatus = "DISPONIVEL" | "VENDIDO" | "ALUGADO" | "INATIVO";
export type Finalidade   = "VENDA" | "ALUGUEL";
export type DominioStatus = "PENDENTE" | "ATIVO" | "ERRO" | "BLOQUEADO";

export type TipoComissao   = "VENDA" | "ALUGUEL" | "INTERMEDIACAO";
export type StatusComissao = "PENDENTE" | "RECEBIDA" | "CANCELADA";

export type LeadStatus = "NOVO" | "EM_ATENDIMENTO" | "CONVERTIDO" | "PERDIDO";
export type LeadOrigem = "SITE" | "MANUAL" | "INDICACAO" | "WHATSAPP" | "PORTAL";

export type VisitaStatus = "AGENDADA" | "CONFIRMADA" | "REALIZADA" | "CANCELADA" | "NAO_COMPARECEU";

export type TicketStatus     = "ABERTO" | "EM_ANDAMENTO" | "RESOLVIDO" | "FECHADO";
export type TicketPrioridade = "BAIXA" | "MEDIA" | "ALTA" | "URGENTE";

export type TipoContrato =
  | "ALUGUEL_RESIDENCIAL"
  | "ALUGUEL_COMERCIAL"
  | "COMPRA_VENDA"
  | "INTERMEDIACAO"
  | "LOCACAO_TEMPORADA"
  | "PERSONALIZADO";

// Interfaces das tabelas (substituem os tipos gerados pelo Prisma)
export interface Imovel {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
  tipo: string;
  localizacao: string;
  corretorId: string;
  createdAt: string;
  updatedAt: string;
  cidade: string;
  estado: string;
  bairro?: string | null;
  cep?: string | null;
  numero?: string | null;
  rua?: string | null;
  finalidade: Finalidade;
  status: ImovelStatus;
  quartos?: number | null;
  banheiros?: number | null;
  suites?: number | null;
  vagas?: number | null;
  areaTotal?: number | null;
  areaUtil?: number | null;
  condominio?: number | null;
  iptu?: number | null;
  anoConstrucao?: number | null;
  fotos?: Foto[];
}

export interface Foto {
  id: string;
  url: string;
  ordem: number;
  imovelId: string;
  createdAt: string;
  principal: boolean;
}
