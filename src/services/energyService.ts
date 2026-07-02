import { supabase } from '@/integrations/supabase/client';
import type { Cliente, Simulacao, Proposta, Contrato, ResultadoSimulacao } from '@/types/energy';
import {
  mapCliente, mapSimulacao, mapProposta, mapContrato, mapLead, mapConfig, mapConfigPublica,
  type AppConfig,
} from '@/lib/supabaseMappers';
import {
  DEFAULT_NOME_EMPRESA, DEFAULT_TAXA_DESCONTO, DEFAULT_TAXAS_FIXAS, DEFAULT_TAXA_COMISSAO,
} from '@/constants/energy';

// --- Clientes ---

export async function fetchClientes(): Promise<Cliente[]> {
  const { data, error } = await supabase.from('clientes').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapCliente);
}

export async function createCliente(input: Omit<Cliente, 'id' | 'criadoEm'>): Promise<Cliente> {
  const { data, error } = await supabase.from('clientes').insert({
    nome_completo: input.nomeCompleto,
    telefone: input.telefone,
    whatsapp: input.whatsapp ?? '',
    email: input.email,
    foto_conta_energia_url: input.fotoContaEnergiaUrl || null,
    foto_cnh_url: input.fotoCnhUrl || null,
    cpf_cnpj: input.cpfCnpj || '',
    tipo_cliente: input.tipoCliente,
    distribuidora: input.distribuidora,
    cidade: input.cidade,
    estado: input.estado,
    endereco: input.endereco,
    unidade_consumidora: input.unidadeConsumidora,
    consumo_medio_mensal: input.consumoMedioMensal,
    valor_medio_conta: input.valorMedioConta,
    observacoes: input.observacoes,
    status: input.status,
    lead_id: input.leadId ?? null,
  }).select().single();
  if (error) throw error;
  return mapCliente(data);
}

export async function updateCliente(id: string, updates: Partial<Cliente>): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (updates.nomeCompleto !== undefined) payload.nome_completo = updates.nomeCompleto;
  if (updates.telefone !== undefined) payload.telefone = updates.telefone;
  if (updates.whatsapp !== undefined) payload.whatsapp = updates.whatsapp;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.fotoContaEnergiaUrl !== undefined) payload.foto_conta_energia_url = updates.fotoContaEnergiaUrl || null;
  if (updates.fotoCnhUrl !== undefined) payload.foto_cnh_url = updates.fotoCnhUrl || null;
  if (updates.cpfCnpj !== undefined) payload.cpf_cnpj = updates.cpfCnpj;
  if (updates.tipoCliente !== undefined) payload.tipo_cliente = updates.tipoCliente;
  if (updates.distribuidora !== undefined) payload.distribuidora = updates.distribuidora;
  if (updates.cidade !== undefined) payload.cidade = updates.cidade;
  if (updates.estado !== undefined) payload.estado = updates.estado;
  if (updates.endereco !== undefined) payload.endereco = updates.endereco;
  if (updates.unidadeConsumidora !== undefined) payload.unidade_consumidora = updates.unidadeConsumidora;
  if (updates.consumoMedioMensal !== undefined) payload.consumo_medio_mensal = updates.consumoMedioMensal;
  if (updates.valorMedioConta !== undefined) payload.valor_medio_conta = updates.valorMedioConta;
  if (updates.observacoes !== undefined) payload.observacoes = updates.observacoes;
  if (updates.status !== undefined) payload.status = updates.status;

  const { error } = await supabase.from('clientes').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteCliente(id: string): Promise<void> {
  const { error } = await supabase.from('clientes').delete().eq('id', id);
  if (error) throw error;
}

// --- Simulações ---

export async function fetchSimulacoes(): Promise<Simulacao[]> {
  const { data, error } = await supabase.from('simulacoes').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapSimulacao);
}

export async function createSimulacao(
  input: Omit<Simulacao, 'id' | 'criadoEm'>
): Promise<Simulacao> {
  const { data, error } = await supabase.from('simulacoes').insert({
    cliente_id: input.clienteId || null,
    nome_cliente: input.nomeCliente,
    distribuidora: input.distribuidora,
    valor_fatura: input.valorFatura,
    consumo_medio: input.consumoMedio,
    taxa_desconto: input.taxaDesconto,
    taxas_fixas: input.taxasFixas,
    base_desconto: input.baseDesconto,
    desconto_reais: input.descontoReais,
    valor_final: input.valorFinal,
    economia_mensal: input.economiaMensal,
    economia_anual: input.economiaAnual,
    percentual_economia: input.percentualEconomia,
  }).select().single();
  if (error) throw error;
  return mapSimulacao(data);
}

// --- Propostas ---

export async function fetchPropostas(): Promise<Proposta[]> {
  const { data, error } = await supabase.from('propostas').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapProposta);
}

export async function createProposta(input: Omit<Proposta, 'id' | 'criadoEm'>): Promise<Proposta> {
  const { data, error } = await supabase.from('propostas').insert({
    simulacao_id: input.simulacaoId || null,
    cliente_id: input.clienteId || null,
    nome_cliente: input.nomeCliente,
    distribuidora: input.distribuidora,
    valor_atual: input.valorAtual,
    desconto_aplicado: input.descontoAplicado,
    taxa_desconto: input.taxaDesconto,
    economia_mensal: input.economiaMensal,
    economia_anual: input.economiaAnual,
    valor_final: input.valorFinal,
    resumo_comercial: input.resumoComercial,
    status: input.status,
  }).select().single();
  if (error) throw error;
  return mapProposta(data);
}

export async function updateProposta(id: string, updates: Partial<Proposta>): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.resumoComercial !== undefined) payload.resumo_comercial = updates.resumoComercial;

  const { error } = await supabase.from('propostas').update(payload).eq('id', id);
  if (error) throw error;
}

// --- Contratos ---

export async function fetchContratos(): Promise<Contrato[]> {
  const { data, error } = await supabase.from('contratos').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapContrato);
}

export async function createContrato(input: Omit<Contrato, 'id' | 'criadoEm'>): Promise<Contrato> {
  const { data, error } = await supabase.from('contratos').insert({
    cliente_id: input.clienteId || null,
    proposta_id: input.propostaId || null,
    nome_cliente: input.nomeCliente,
    distribuidora: input.distribuidora,
    data_adesao: input.dataAdesao,
    status: input.status,
    desconto_contratado: input.descontoContratado,
    taxa_desconto: input.taxaDesconto,
    valor_original: input.valorOriginal,
    valor_final: input.valorFinal,
    observacoes: input.observacoes,
    historico: input.historico as unknown as import('@/integrations/supabase/types').Json,
  }).select().single();
  if (error) throw error;
  return mapContrato(data);
}

export async function updateContrato(id: string, updates: Partial<Contrato>): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.observacoes !== undefined) payload.observacoes = updates.observacoes;
  if (updates.historico !== undefined) payload.historico = updates.historico;

  const { error } = await supabase.from('contratos').update(payload).eq('id', id);
  if (error) throw error;
}

// --- Leads ---

export async function fetchLeads() {
  const { data, error } = await supabase.from('leads_simulacao').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapLead);
}

export async function updateLeadStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from('leads_simulacao').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function createLeadPublic(input: {
  nome: string;
  telefone: string;
  email?: string;
  cpfCnpj: string;
  tipoCliente: string;
  distribuidora: string;
  cidade?: string;
  estado?: string;
  valorFatura: number;
  consumoMedio?: number;
  descontoPercentual: number;
  economiaMensal: number;
  economiaAnual: number;
  valorFinal: number;
}): Promise<void> {
  const { error } = await supabase.from('leads_simulacao').insert({
    nome: input.nome,
    telefone: input.telefone,
    email: input.email || null,
    cpf_cnpj: input.cpfCnpj,
    tipo_cliente: input.tipoCliente,
    distribuidora: input.distribuidora,
    cidade: input.cidade || null,
    estado: input.estado || null,
    valor_fatura: input.valorFatura,
    consumo_medio: input.consumoMedio ?? null,
    desconto_percentual: input.descontoPercentual,
    economia_mensal: input.economiaMensal,
    economia_anual: input.economiaAnual,
    valor_final: input.valorFinal,
  });
  if (error) throw error;
}

// --- Configurações ---

const defaultConfig: AppConfig = {
  nomeEmpresa: DEFAULT_NOME_EMPRESA,
  taxaDescontoPadrao: DEFAULT_TAXA_DESCONTO,
  taxasFixasPadrao: DEFAULT_TAXAS_FIXAS,
  taxaComissao: DEFAULT_TAXA_COMISSAO,
};

export async function fetchConfig(): Promise<AppConfig> {
  const { data, error } = await supabase.from('configuracoes').select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  if (!data) return defaultConfig;
  return mapConfig(data);
}

export async function saveConfig(config: AppConfig): Promise<AppConfig> {
  const { data, error } = await supabase.from('configuracoes').upsert({
    id: 1,
    nome_empresa: config.nomeEmpresa,
    taxa_desconto_padrao: config.taxaDescontoPadrao,
    taxas_fixas_padrao: config.taxasFixasPadrao,
    taxa_comissao: config.taxaComissao,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' }).select().single();
  if (error) throw error;

  await supabase.from('configuracoes_publicas').update({
    taxa_desconto_padrao: config.taxaDescontoPadrao,
    taxas_fixas_padrao: config.taxasFixasPadrao,
    updated_at: new Date().toISOString(),
  }).eq('id', 1);

  return mapConfig(data);
}

export async function fetchConfigPublica(): Promise<Pick<AppConfig, 'taxaDescontoPadrao' | 'taxasFixasPadrao'>> {
  const { data, error } = await supabase.from('configuracoes_publicas').select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  if (!data) {
    return { taxaDescontoPadrao: DEFAULT_TAXA_DESCONTO, taxasFixasPadrao: DEFAULT_TAXAS_FIXAS };
  }
  return mapConfigPublica(data);
}

export type { AppConfig, ResultadoSimulacao };
