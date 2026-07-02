import { describe, it, expect } from 'vitest';
import {
  calcularSimulacao,
  calcularComissao,
  calcularDescontoEnergia,
  agruparPorMes,
  contarPorMes,
} from '@/utils/energyCalculations';

describe('calcularSimulacao', () => {
  it('calcula desconto sobre base (fatura - taxas fixas)', () => {
    const r = calcularSimulacao(420, 50, 15);
    expect(r.baseDesconto).toBe(370);
    expect(r.descontoReais).toBeCloseTo(55.5);
    expect(r.valorFinal).toBeCloseTo(364.5);
    expect(r.economiaMensal).toBeCloseTo(55.5);
    expect(r.economiaAnual).toBeCloseTo(666);
    expect(r.percentualEconomia).toBeCloseTo(13.21, 1);
  });

  it('não permite base de desconto negativa', () => {
    const r = calcularSimulacao(30, 50, 15);
    expect(r.baseDesconto).toBe(0);
    expect(r.descontoReais).toBe(0);
  });

  it('retorna zero quando fatura é zero', () => {
    const r = calcularSimulacao(0, 50, 15);
    expect(r.percentualEconomia).toBe(0);
  });
});

describe('calcularComissao', () => {
  it('calcula 3% sobre o desconto', () => {
    expect(calcularComissao(100, 3)).toBe(3);
  });
});

describe('calcularDescontoEnergia', () => {
  it('usa base não negativa', () => {
    expect(calcularDescontoEnergia(30, 50, 15)).toBe(0);
  });
});

describe('agruparPorMes', () => {
  it('agrupa valores por mês de criação', () => {
    const data = agruparPorMes(
      [{ criadoEm: '2025-01-15' }],
      () => 100
    );
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].valor).toBe(100);
  });
});

describe('contarPorMes', () => {
  it('conta itens por mês', () => {
    const data = contarPorMes([{ criadoEm: '2025-03-10' }, { criadoEm: '2025-03-12' }]);
    expect(data.some(d => d.propostas === 2)).toBe(true);
  });
});
