import { createContext, useContext, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Cliente, Simulacao, Proposta, Contrato, Lead } from '@/types/energy';
import type { AppConfig } from '@/lib/supabaseMappers';
import * as api from '@/services/energyService';
import { toast } from 'sonner';

export const queryKeys = {
  clientes: ['clientes'] as const,
  simulacoes: ['simulacoes'] as const,
  propostas: ['propostas'] as const,
  contratos: ['contratos'] as const,
  leads: ['leads'] as const,
  config: ['config'] as const,
  configPublica: ['configPublica'] as const,
};

interface DataContextType {
  clientes: Cliente[];
  simulacoes: Simulacao[];
  propostas: Proposta[];
  contratos: Contrato[];
  config: AppConfig;
  loading: boolean;
  adicionarCliente: (cliente: Omit<Cliente, 'id' | 'criadoEm'>) => Promise<Cliente>;
  atualizarCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>;
  removerCliente: (id: string) => Promise<void>;
  adicionarSimulacao: (sim: Omit<Simulacao, 'id' | 'criadoEm'>) => Promise<Simulacao>;
  adicionarProposta: (prop: Omit<Proposta, 'id' | 'criadoEm'>) => Promise<Proposta>;
  atualizarProposta: (id: string, updates: Partial<Proposta>) => Promise<void>;
  adicionarContrato: (cont: Omit<Contrato, 'id' | 'criadoEm'>) => Promise<Contrato>;
  atualizarContrato: (id: string, updates: Partial<Contrato>) => Promise<void>;
  salvarConfig: (config: AppConfig) => Promise<void>;
  refetchAll: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();

  const clientesQuery = useQuery({ queryKey: queryKeys.clientes, queryFn: api.fetchClientes });
  const simulacoesQuery = useQuery({ queryKey: queryKeys.simulacoes, queryFn: api.fetchSimulacoes });
  const propostasQuery = useQuery({ queryKey: queryKeys.propostas, queryFn: api.fetchPropostas });
  const contratosQuery = useQuery({ queryKey: queryKeys.contratos, queryFn: api.fetchContratos });
  const configQuery = useQuery({ queryKey: queryKeys.config, queryFn: api.fetchConfig });

  const invalidate = (...keys: (readonly string[])[]) => {
    keys.forEach(k => qc.invalidateQueries({ queryKey: k }));
  };

  const adicionarClienteMut = useMutation({
    mutationFn: api.createCliente,
    onSuccess: () => { invalidate(queryKeys.clientes); toast.success('Cliente cadastrado!'); },
    onError: () => toast.error('Erro ao cadastrar cliente'),
  });

  const atualizarClienteMut = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Cliente> }) => api.updateCliente(id, updates),
    onSuccess: () => { invalidate(queryKeys.clientes); toast.success('Cliente atualizado!'); },
    onError: () => toast.error('Erro ao atualizar cliente'),
  });

  const removerClienteMut = useMutation({
    mutationFn: api.deleteCliente,
    onSuccess: () => { invalidate(queryKeys.clientes); toast.success('Cliente removido!'); },
    onError: () => toast.error('Erro ao remover cliente'),
  });

  const adicionarSimulacaoMut = useMutation({
    mutationFn: api.createSimulacao,
    onSuccess: () => invalidate(queryKeys.simulacoes),
    onError: () => toast.error('Erro ao salvar simulação'),
  });

  const adicionarPropostaMut = useMutation({
    mutationFn: api.createProposta,
    onSuccess: () => invalidate(queryKeys.propostas),
    onError: () => toast.error('Erro ao gerar proposta'),
  });

  const atualizarPropostaMut = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Proposta> }) => api.updateProposta(id, updates),
    onSuccess: () => invalidate(queryKeys.propostas),
    onError: () => toast.error('Erro ao atualizar proposta'),
  });

  const adicionarContratoMut = useMutation({
    mutationFn: api.createContrato,
    onSuccess: () => invalidate(queryKeys.contratos, queryKeys.propostas),
    onError: () => toast.error('Erro ao gerar contrato'),
  });

  const atualizarContratoMut = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Contrato> }) => api.updateContrato(id, updates),
    onSuccess: () => { invalidate(queryKeys.contratos); toast.success('Contrato atualizado!'); },
    onError: () => toast.error('Erro ao atualizar contrato'),
  });

  const salvarConfigMut = useMutation({
    mutationFn: api.saveConfig,
    onSuccess: () => {
      invalidate(queryKeys.config, queryKeys.configPublica);
      toast.success('Configurações salvas!');
    },
    onError: () => toast.error('Erro ao salvar configurações'),
  });

  const loading = clientesQuery.isLoading || simulacoesQuery.isLoading ||
    propostasQuery.isLoading || contratosQuery.isLoading || configQuery.isLoading;

  const defaultConfig: AppConfig = {
    nomeEmpresa: 'EnergiaSub',
    taxaDescontoPadrao: 15,
    taxasFixasPadrao: 50,
    taxaComissao: 3,
  };

  return (
    <DataContext.Provider value={{
      clientes: clientesQuery.data ?? [],
      simulacoes: simulacoesQuery.data ?? [],
      propostas: propostasQuery.data ?? [],
      contratos: contratosQuery.data ?? [],
      config: configQuery.data ?? defaultConfig,
      loading,
      adicionarCliente: (c) => adicionarClienteMut.mutateAsync(c),
      atualizarCliente: (id, updates) => atualizarClienteMut.mutateAsync({ id, updates }),
      removerCliente: (id) => removerClienteMut.mutateAsync(id),
      adicionarSimulacao: (s) => adicionarSimulacaoMut.mutateAsync(s),
      adicionarProposta: (p) => adicionarPropostaMut.mutateAsync(p),
      atualizarProposta: (id, updates) => atualizarPropostaMut.mutateAsync({ id, updates }),
      adicionarContrato: (c) => adicionarContratoMut.mutateAsync(c),
      atualizarContrato: (id, updates) => atualizarContratoMut.mutateAsync({ id, updates }),
      salvarConfig: async (cfg) => { await salvarConfigMut.mutateAsync(cfg); },
      refetchAll: () => {
        invalidate(queryKeys.clientes, queryKeys.simulacoes, queryKeys.propostas, queryKeys.contratos, queryKeys.config);
      },
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData deve ser usado dentro de DataProvider');
  return ctx;
}

export function useLeads() {
  return useQuery({ queryKey: queryKeys.leads, queryFn: api.fetchLeads });
}

export function useConfigPublica() {
  return useQuery({ queryKey: queryKeys.configPublica, queryFn: api.fetchConfigPublica });
}

export function useLeadMutations() {
  const qc = useQueryClient();
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updateLeadStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.leads }),
  });
  const convertLead = useMutation({
    mutationFn: async ({ lead, status }: { lead: Lead; status: string }) => {
      await api.createCliente({
        nomeCompleto: lead.nome,
        telefone: lead.telefone,
        email: lead.email || '',
        cpfCnpj: lead.cpf_cnpj,
        tipoCliente: lead.tipo_cliente as Cliente['tipoCliente'],
        distribuidora: lead.distribuidora,
        cidade: lead.cidade || '',
        estado: lead.estado || '',
        endereco: '',
        unidadeConsumidora: '',
        consumoMedioMensal: lead.consumo_medio || 0,
        valorMedioConta: lead.valor_fatura,
        observacoes: `Lead convertido. Economia: R$ ${lead.economia_mensal.toFixed(2)}/mês`,
        status: 'ativo',
        leadId: lead.id,
      });
      await api.updateLeadStatus(lead.id, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.leads });
      qc.invalidateQueries({ queryKey: queryKeys.clientes });
    },
  });
  return { updateStatus, convertLead };
}
