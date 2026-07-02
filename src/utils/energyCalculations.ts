import type { ResultadoSimulacao } from '@/types/energy';
import { DEFAULT_TAXA_COMISSAO } from '@/constants/energy';

export function calcularDescontoEnergia(
  valorFatura: number,
  taxasFixas: number,
  taxaDesconto: number
): number {
  const baseDesconto = Math.max(0, valorFatura - taxasFixas);
  return baseDesconto * (taxaDesconto / 100);
}

export function calcularSimulacao(
  valorFatura: number,
  taxasFixas: number,
  taxaDesconto: number
): ResultadoSimulacao {
  const baseDesconto = Math.max(0, valorFatura - taxasFixas);
  const descontoReais = calcularDescontoEnergia(valorFatura, taxasFixas, taxaDesconto);
  const valorFinal = valorFatura - descontoReais;
  const economiaMensal = descontoReais;
  const economiaAnual = economiaMensal * 12;
  const percentualEconomia = valorFatura > 0 ? (descontoReais / valorFatura) * 100 : 0;

  return {
    baseDesconto,
    descontoReais,
    valorFinal,
    economiaMensal,
    economiaAnual,
    percentualEconomia,
  };
}

export function calcularComissao(descontoReais: number, taxaComissao = DEFAULT_TAXA_COMISSAO): number {
  return descontoReais * (taxaComissao / 100);
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarPercentual(valor: number): string {
  return `${valor.toFixed(1)}%`;
}

export function gerarId(): string {
  return crypto.randomUUID();
}

export function agruparPorMes<T extends { criadoEm: string }>(
  items: T[],
  getValor: (item: T) => number
): { mes: string; valor: number }[] {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const porMes = new Map<string, number>();

  items.forEach(item => {
    const date = new Date(item.criadoEm);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    porMes.set(key, (porMes.get(key) ?? 0) + getValor(item));
  });

  const sorted = [...porMes.entries()].sort(([a], [b]) => a.localeCompare(b));
  return sorted.slice(-6).map(([key, valor]) => {
    const month = Number(key.split('-')[1]);
    return { mes: meses[month], valor };
  });
}

export function contarPorMes(items: { criadoEm: string }[]): { mes: string; propostas: number }[] {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const porMes = new Map<string, number>();

  items.forEach(item => {
    const date = new Date(item.criadoEm);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    porMes.set(key, (porMes.get(key) ?? 0) + 1);
  });

  const sorted = [...porMes.entries()].sort(([a], [b]) => a.localeCompare(b));
  return sorted.slice(-6).map(([key, count]) => {
    const month = Number(key.split('-')[1]);
    return { mes: meses[month], propostas: count };
  });
}
