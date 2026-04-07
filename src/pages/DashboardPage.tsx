import { Users, FileText, FileCheck, TrendingUp, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useData } from '@/contexts/DataContext';
import { formatarMoeda } from '@/utils/energyCalculations';
import StatCard from '@/components/StatCard';
import PageHeader from '@/components/PageHeader';

const COLORS = ['hsl(158, 64%, 40%)', 'hsl(45, 93%, 55%)', 'hsl(210, 25%, 70%)'];

export default function DashboardPage() {
  const { clientes, propostas, contratos } = useData();

  const totalClientes = clientes.length;
  const totalPropostas = propostas.length;
  const contratosAtivos = contratos.filter(c => c.status === 'ativo').length;
  const economiaTotal = contratos
    .filter(c => c.status === 'ativo')
    .reduce((sum, c) => sum + (c.valorOriginal - c.valorFinal) * 12, 0);
  const descontoMedio = contratos.length > 0
    ? contratos.reduce((sum, c) => sum + c.taxaDesconto, 0) / contratos.length
    : 0;

  const clientesPorStatus = [
    { name: 'Ativos', value: clientes.filter(c => c.status === 'ativo').length },
    { name: 'Prospectos', value: clientes.filter(c => c.status === 'prospecto').length },
    { name: 'Inativos', value: clientes.filter(c => c.status === 'inativo').length },
  ].filter(s => s.value > 0);

  const economiaMensal = [
    { mes: 'Jan', valor: 1200 }, { mes: 'Fev', valor: 1800 },
    { mes: 'Mar', valor: 2400 }, { mes: 'Abr', valor: 3100 },
    { mes: 'Mai', valor: 3600 }, { mes: 'Jun', valor: 4200 },
  ];

  const propostasPorMes = [
    { mes: 'Jan', propostas: 3 }, { mes: 'Fev', propostas: 5 },
    { mes: 'Mar', propostas: 4 }, { mes: 'Abr', propostas: 7 },
    { mes: 'Mai', propostas: 6 }, { mes: 'Jun', propostas: 8 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Visão geral do sistema de energia por assinatura" />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Clientes" value={String(totalClientes)} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Propostas" value={String(totalPropostas)} icon={<FileText className="h-5 w-5" />} />
        <StatCard title="Contratos Ativos" value={String(contratosAtivos)} icon={<FileCheck className="h-5 w-5" />} variant="energy" />
        <StatCard title="Economia Total" value={formatarMoeda(economiaTotal)} subtitle="anual estimada" icon={<TrendingUp className="h-5 w-5" />} variant="gold" />
        <StatCard title="Desconto Médio" value={`${descontoMedio.toFixed(1)}%`} icon={<Percent className="h-5 w-5" />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clientes por status */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold mb-4">Clientes por Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={clientesPorStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={4}>
                {clientesPorStatus.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [v, 'Clientes']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {clientesPorStatus.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-muted-foreground">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Economia mensal */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold mb-4">Economia Mensal Gerada</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={economiaMensal}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 15%, 89%)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${v}`} />
              <Tooltip formatter={(v: number) => [formatarMoeda(v), 'Economia']} />
              <Line type="monotone" dataKey="valor" stroke="hsl(158, 64%, 40%)" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Propostas por mês */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold mb-4">Propostas por Mês</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={propostasPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 15%, 89%)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="propostas" fill="hsl(158, 64%, 40%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
