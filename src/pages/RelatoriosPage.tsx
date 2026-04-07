import { Users, FileText, FileCheck, TrendingUp, Percent, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '@/contexts/DataContext';
import { formatarMoeda } from '@/utils/energyCalculations';
import StatCard from '@/components/StatCard';
import PageHeader from '@/components/PageHeader';

export default function RelatoriosPage() {
  const { clientes, propostas, contratos } = useData();

  const contratosAtivos = contratos.filter(c => c.status === 'ativo');
  const economiaTotal = contratosAtivos.reduce((sum, c) => sum + (c.valorOriginal - c.valorFinal), 0);
  const economiaAnual = economiaTotal * 12;
  const descontoMedio = contratos.length > 0
    ? contratos.reduce((sum, c) => sum + c.taxaDesconto, 0) / contratos.length
    : 0;

  const economiaPorDistribuidora = contratosAtivos.reduce((acc, c) => {
    const key = c.distribuidora || 'Outros';
    acc[key] = (acc[key] || 0) + (c.valorOriginal - c.valorFinal);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(economiaPorDistribuidora).map(([name, valor]) => ({ name, valor }));

  return (
    <div className="space-y-6">
      <PageHeader title="Relatórios" description="Indicadores e métricas do sistema" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Clientes Cadastrados" value={String(clientes.length)} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Propostas Geradas" value={String(propostas.length)} icon={<FileText className="h-5 w-5" />} />
        <StatCard title="Contratos Ativos" value={String(contratosAtivos.length)} icon={<FileCheck className="h-5 w-5" />} variant="energy" />
        <StatCard title="Economia Mensal Total" value={formatarMoeda(economiaTotal)} icon={<TrendingUp className="h-5 w-5" />} variant="gold" />
        <StatCard title="Economia Anual Prevista" value={formatarMoeda(economiaAnual)} icon={<BarChart3 className="h-5 w-5" />} />
        <StatCard title="Desconto Médio" value={`${descontoMedio.toFixed(1)}%`} icon={<Percent className="h-5 w-5" />} />
      </div>

      {chartData.length > 0 && (
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold mb-4">Economia por Distribuidora (mensal)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 15%, 89%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `R$${v}`} />
              <Tooltip formatter={(v: number) => [formatarMoeda(v), 'Economia']} />
              <Bar dataKey="valor" fill="hsl(158, 64%, 40%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold mb-3">Últimos Clientes</h3>
          <div className="space-y-2">
            {clientes.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{c.nomeCompleto}</p>
                  <p className="text-xs text-muted-foreground">{c.cidade}/{c.estado}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  c.status === 'ativo' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold mb-3">Últimas Propostas</h3>
          <div className="space-y-2">
            {propostas.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{p.nomeCliente}</p>
                  <p className="text-xs text-muted-foreground">Economia: {formatarMoeda(p.economiaMensal)}/mês</p>
                </div>
                <span className="text-xs text-primary font-medium">{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
