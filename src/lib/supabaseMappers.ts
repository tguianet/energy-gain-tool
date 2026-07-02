import type {
  Cliente, Simulacao, Proposta, Contrato, HistoricoContrato, Lead,
  TipoCliente, StatusCliente, StatusProposta, StatusContrato,
} from '@/types/energy';
import type { Tables } from '@/integrations/supabase/types';

export type LeadRow = Tables<'leads_simulacao'>;
export type ClienteRow = Tables<'clientes'>;
export type SimulacaoRow = Tables<'simulacoes'>;
export type PropostaRow = Tables<'propostas'>;
export type ContratoRow = Tables<'contratos'>;
export type ConfigRow = Tables<'configuracoes'>;
export type ConfigPublicaRow = Tables<'configuracoes_publicas'>;

export function mapCliente(row: ClienteRow): Cliente {
  return {
    id: row.id,
    nomeCompleto: row.nome_completo,
    telefone: row.telefone,
    email: row.email ?? '',
    cpfCnpj: row.cpf_cnpj,
    tipoCliente: row.tipo_cliente as TipoCliente,
    distribuidora: row.distribuidora ?? '',
    cidade: row.cidade ?? '',
    estado: row.estado ?? '',
    endereco: row.endereco ?? '',
    unidadeConsumidora: row.unidade_consumidora ?? '',
    consumoMedioMensal: Number(row.consumo_medio_mensal),
    valorMedioConta: Number(row.valor_medio_conta),
    observacoes: row.observacoes ?? '',
    status: row.status as StatusCliente,
    criadoEm: row.created_at.split('T')[0],
    leadId: row.lead_id ?? undefined,
  };
}

export function mapSimulacao(row: SimulacaoRow): Simulacao {
  return {
    id: row.id,
    clienteId: row.cliente_id ?? '',
    nomeCliente: row.nome_cliente,
    distribuidora: row.distribuidora ?? '',
    valorFatura: Number(row.valor_fatura),
    consumoMedio: Number(row.consumo_medio),
    taxaDesconto: Number(row.taxa_desconto),
    taxasFixas: Number(row.taxas_fixas),
    baseDesconto: Number(row.base_desconto),
    descontoReais: Number(row.desconto_reais),
    valorFinal: Number(row.valor_final),
    economiaMensal: Number(row.economia_mensal),
    economiaAnual: Number(row.economia_anual),
    percentualEconomia: Number(row.percentual_economia),
    criadoEm: row.created_at.split('T')[0],
  };
}

export function mapProposta(row: PropostaRow): Proposta {
  return {
    id: row.id,
    simulacaoId: row.simulacao_id ?? '',
    clienteId: row.cliente_id ?? '',
    nomeCliente: row.nome_cliente,
    distribuidora: row.distribuidora ?? '',
    valorAtual: Number(row.valor_atual),
    descontoAplicado: Number(row.desconto_aplicado),
    taxaDesconto: Number(row.taxa_desconto),
    economiaMensal: Number(row.economia_mensal),
    economiaAnual: Number(row.economia_anual),
    valorFinal: Number(row.valor_final),
    resumoComercial: row.resumo_comercial ?? '',
    status: row.status as StatusProposta,
    criadoEm: row.created_at.split('T')[0],
  };
}

export function mapContrato(row: ContratoRow): Contrato {
  const historico = (row.historico as HistoricoContrato[] | null) ?? [];
  return {
    id: row.id,
    clienteId: row.cliente_id ?? '',
    propostaId: row.proposta_id ?? '',
    nomeCliente: row.nome_cliente,
    distribuidora: row.distribuidora ?? '',
    dataAdesao: row.data_adesao,
    status: row.status as StatusContrato,
    descontoContratado: Number(row.desconto_contratado),
    taxaDesconto: Number(row.taxa_desconto),
    valorOriginal: Number(row.valor_original),
    valorFinal: Number(row.valor_final),
    observacoes: row.observacoes ?? '',
    historico,
    criadoEm: row.created_at.split('T')[0],
  };
}

export function mapLead(row: LeadRow): Lead {
  return {
    id: row.id,
    nome: row.nome,
    telefone: row.telefone,
    email: row.email,
    cpf_cnpj: row.cpf_cnpj,
    tipo_cliente: row.tipo_cliente,
    distribuidora: row.distribuidora,
    cidade: row.cidade,
    estado: row.estado,
    valor_fatura: Number(row.valor_fatura),
    consumo_medio: row.consumo_medio ? Number(row.consumo_medio) : null,
    economia_mensal: Number(row.economia_mensal),
    economia_anual: Number(row.economia_anual),
    valor_final: Number(row.valor_final),
    desconto_percentual: Number(row.desconto_percentual),
    status: row.status,
    created_at: row.created_at,
  };
}

export interface AppConfig {
  nomeEmpresa: string;
  taxaDescontoPadrao: number;
  taxasFixasPadrao: number;
  taxaComissao: number;
}

export function mapConfig(row: ConfigRow): AppConfig {
  return {
    nomeEmpresa: row.nome_empresa,
    taxaDescontoPadrao: Number(row.taxa_desconto_padrao),
    taxasFixasPadrao: Number(row.taxas_fixas_padrao),
    taxaComissao: Number(row.taxa_comissao),
  };
}

export function mapConfigPublica(row: ConfigPublicaRow): Pick<AppConfig, 'taxaDescontoPadrao' | 'taxasFixasPadrao'> {
  return {
    taxaDescontoPadrao: Number(row.taxa_desconto_padrao),
    taxasFixasPadrao: Number(row.taxas_fixas_padrao),
  };
}
