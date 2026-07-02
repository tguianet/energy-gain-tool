export type TipoCliente = 'residencial' | 'comercial' | 'rural';
export type StatusCliente = 'ativo' | 'inativo' | 'prospecto';
export type StatusContrato = 'ativo' | 'pendente' | 'cancelado';
export type StatusProposta = 'gerada' | 'enviada' | 'aceita' | 'recusada';

export interface Cliente {
  id: string;
  nomeCompleto: string;
  telefone: string;
  whatsapp: string;
  email: string;
  fotoContaEnergiaUrl: string;
  fotoCnhUrl: string;
  cpfCnpj: string;
  tipoCliente: TipoCliente;
  distribuidora: string;
  cidade: string;
  estado: string;
  endereco: string;
  unidadeConsumidora: string;
  consumoMedioMensal: number;
  valorMedioConta: number;
  observacoes: string;
  status: StatusCliente;
  criadoEm: string;
  leadId?: string;
}

export interface Simulacao {
  id: string;
  clienteId: string;
  nomeCliente: string;
  distribuidora: string;
  valorFatura: number;
  consumoMedio: number;
  taxaDesconto: number;
  taxasFixas: number;
  baseDesconto: number;
  descontoReais: number;
  valorFinal: number;
  economiaMensal: number;
  economiaAnual: number;
  percentualEconomia: number;
  criadoEm: string;
}

export interface Proposta {
  id: string;
  simulacaoId: string;
  clienteId: string;
  nomeCliente: string;
  distribuidora: string;
  valorAtual: number;
  descontoAplicado: number;
  taxaDesconto: number;
  economiaMensal: number;
  economiaAnual: number;
  valorFinal: number;
  resumoComercial: string;
  status: StatusProposta;
  criadoEm: string;
}

export interface Contrato {
  id: string;
  clienteId: string;
  propostaId: string;
  nomeCliente: string;
  distribuidora: string;
  dataAdesao: string;
  status: StatusContrato;
  descontoContratado: number;
  taxaDesconto: number;
  valorOriginal: number;
  valorFinal: number;
  observacoes: string;
  historico: HistoricoContrato[];
  criadoEm: string;
}

export interface HistoricoContrato {
  data: string;
  descricao: string;
}

export interface ResultadoSimulacao {
  baseDesconto: number;
  descontoReais: number;
  valorFinal: number;
  economiaMensal: number;
  economiaAnual: number;
  percentualEconomia: number;
}

export interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  cpf_cnpj: string;
  tipo_cliente: string;
  distribuidora: string;
  cidade: string | null;
  estado: string | null;
  valor_fatura: number;
  consumo_medio: number | null;
  economia_mensal: number;
  economia_anual: number;
  valor_final: number;
  desconto_percentual: number;
  status: string;
  created_at: string;
}
