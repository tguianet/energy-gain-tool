import type { ResultadoSimulacao } from '@/types/energy';

export function calcularDescontoEnergia(
  valorFatura: number,
  taxasFixas: number,
  taxaDesconto: number
): number {
  const baseDesconto = valorFatura - taxasFixas;
  return baseDesconto * (taxaDesconto / 100);
}

export function calcularEconomiaMensal(descontoReais: number): number {
  return descontoReais;
}

export function calcularEconomiaAnual(economiaMensal: number): number {
  return economiaMensal * 12;
}

export function calcularSimulacao(
  valorFatura: number,
  taxasFixas: number,
  taxaDesconto: number
): ResultadoSimulacao {
  const baseDesconto = Math.max(0, valorFatura - taxasFixas);
  const descontoReais = calcularDescontoEnergia(valorFatura, taxasFixas, taxaDesconto);
  const valorFinal = valorFatura - descontoReais;
  const economiaMensal = calcularEconomiaMensal(descontoReais);
  const economiaAnual = calcularEconomiaAnual(economiaMensal);
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

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarPercentual(valor: number): string {
  return `${valor.toFixed(1)}%`;
}

export function gerarId(): string {
  return crypto.randomUUID();
}
