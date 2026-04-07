import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Cliente, Simulacao, Proposta, Contrato, StatusContrato, StatusProposta } from '@/types/energy';
import { gerarId } from '@/utils/energyCalculations';

interface DataContextType {
  clientes: Cliente[];
  simulacoes: Simulacao[];
  propostas: Proposta[];
  contratos: Contrato[];
  adicionarCliente: (cliente: Omit<Cliente, 'id' | 'criadoEm'>) => Cliente;
  atualizarCliente: (id: string, cliente: Partial<Cliente>) => void;
  removerCliente: (id: string) => void;
  adicionarSimulacao: (sim: Omit<Simulacao, 'id' | 'criadoEm'>) => Simulacao;
  adicionarProposta: (prop: Omit<Proposta, 'id' | 'criadoEm'>) => Proposta;
  atualizarProposta: (id: string, updates: Partial<Proposta>) => void;
  adicionarContrato: (cont: Omit<Contrato, 'id' | 'criadoEm'>) => Contrato;
  atualizarContrato: (id: string, updates: Partial<Contrato>) => void;
}

const DataContext = createContext<DataContextType | null>(null);

const mockClientes: Cliente[] = [
  {
    id: '1', nomeCompleto: 'Maria Silva Santos', telefone: '(11) 99999-1234', email: 'maria@email.com',
    cpfCnpj: '123.456.789-00', tipoCliente: 'residencial', distribuidora: 'CEMIG', cidade: 'Belo Horizonte',
    estado: 'MG', endereco: 'Rua das Flores, 123', unidadeConsumidora: 'UC-001234', consumoMedioMensal: 350,
    valorMedioConta: 420, observacoes: '', status: 'ativo', criadoEm: '2025-01-15',
  },
  {
    id: '2', nomeCompleto: 'João Pereira Ltda', telefone: '(21) 98888-5678', email: 'joao@empresa.com',
    cpfCnpj: '12.345.678/0001-90', tipoCliente: 'comercial', distribuidora: 'Enel', cidade: 'São Paulo',
    estado: 'SP', endereco: 'Av. Paulista, 456', unidadeConsumidora: 'UC-005678', consumoMedioMensal: 1200,
    valorMedioConta: 1850, observacoes: 'Cliente prioritário', status: 'ativo', criadoEm: '2025-02-10',
  },
  {
    id: '3', nomeCompleto: 'Fazenda Boa Vista', telefone: '(31) 97777-9012', email: 'fazenda@email.com',
    cpfCnpj: '98.765.432/0001-10', tipoCliente: 'rural', distribuidora: 'CPFL', cidade: 'Ribeirão Preto',
    estado: 'SP', endereco: 'Rodovia SP-330, Km 42', unidadeConsumidora: 'UC-009012', consumoMedioMensal: 2500,
    valorMedioConta: 3200, observacoes: '', status: 'prospecto', criadoEm: '2025-03-05',
  },
];

const mockSimulacoes: Simulacao[] = [
  {
    id: 's1', clienteId: '1', nomeCliente: 'Maria Silva Santos', distribuidora: 'CEMIG',
    valorFatura: 420, consumoMedio: 350, taxaDesconto: 15, taxasFixas: 50,
    baseDesconto: 370, descontoReais: 55.5, valorFinal: 364.5,
    economiaMensal: 55.5, economiaAnual: 666, percentualEconomia: 13.21, criadoEm: '2025-03-10',
  },
];

const mockPropostas: Proposta[] = [
  {
    id: 'p1', simulacaoId: 's1', clienteId: '1', nomeCliente: 'Maria Silva Santos',
    distribuidora: 'CEMIG', valorAtual: 420, descontoAplicado: 55.5, taxaDesconto: 15,
    economiaMensal: 55.5, economiaAnual: 666, valorFinal: 364.5,
    resumoComercial: 'Proposta de energia por assinatura com 15% de desconto.',
    status: 'enviada', criadoEm: '2025-03-12',
  },
];

const mockContratos: Contrato[] = [
  {
    id: 'c1', clienteId: '2', propostaId: 'p2', nomeCliente: 'João Pereira Ltda',
    distribuidora: 'Enel', dataAdesao: '2025-02-20', status: 'ativo',
    descontoContratado: 277.5, taxaDesconto: 18, valorOriginal: 1850, valorFinal: 1572.5,
    observacoes: '', historico: [{ data: '2025-02-20', descricao: 'Contrato criado' }], criadoEm: '2025-02-20',
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [simulacoes, setSimulacoes] = useState<Simulacao[]>(mockSimulacoes);
  const [propostas, setPropostas] = useState<Proposta[]>(mockPropostas);
  const [contratos, setContratos] = useState<Contrato[]>(mockContratos);

  const adicionarCliente = useCallback((data: Omit<Cliente, 'id' | 'criadoEm'>) => {
    const novo: Cliente = { ...data, id: gerarId(), criadoEm: new Date().toISOString().split('T')[0] };
    setClientes(prev => [novo, ...prev]);
    return novo;
  }, []);

  const atualizarCliente = useCallback((id: string, updates: Partial<Cliente>) => {
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const removerCliente = useCallback((id: string) => {
    setClientes(prev => prev.filter(c => c.id !== id));
  }, []);

  const adicionarSimulacao = useCallback((data: Omit<Simulacao, 'id' | 'criadoEm'>) => {
    const nova: Simulacao = { ...data, id: gerarId(), criadoEm: new Date().toISOString().split('T')[0] };
    setSimulacoes(prev => [nova, ...prev]);
    return nova;
  }, []);

  const adicionarProposta = useCallback((data: Omit<Proposta, 'id' | 'criadoEm'>) => {
    const nova: Proposta = { ...data, id: gerarId(), criadoEm: new Date().toISOString().split('T')[0] };
    setPropostas(prev => [nova, ...prev]);
    return nova;
  }, []);

  const atualizarProposta = useCallback((id: string, updates: Partial<Proposta>) => {
    setPropostas(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const adicionarContrato = useCallback((data: Omit<Contrato, 'id' | 'criadoEm'>) => {
    const novo: Contrato = { ...data, id: gerarId(), criadoEm: new Date().toISOString().split('T')[0] };
    setContratos(prev => [novo, ...prev]);
    return novo;
  }, []);

  const atualizarContrato = useCallback((id: string, updates: Partial<Contrato>) => {
    setContratos(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  return (
    <DataContext.Provider value={{
      clientes, simulacoes, propostas, contratos,
      adicionarCliente, atualizarCliente, removerCliente,
      adicionarSimulacao, adicionarProposta, atualizarProposta,
      adicionarContrato, atualizarContrato,
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
