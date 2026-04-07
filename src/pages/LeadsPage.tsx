import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Phone, Mail, RefreshCw, Clock, CheckCircle2, XCircle, UserPlus, PhoneOff, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';
import PageHeader from '@/components/PageHeader';
import { formatarMoeda } from '@/utils/energyCalculations';
import type { TipoCliente } from '@/types/energy';

interface Lead {
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
  economia_mensal: number;
  economia_anual: number;
  valor_final: number;
  desconto_percentual: number;
  status: string;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: 'novo', label: 'Novo', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  { value: 'contatado', label: 'Contatado', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
  { value: 'convertido', label: 'Convertido', color: 'bg-green-500/10 text-green-600 border-green-200' },
  { value: 'perdido', label: 'Perdido', color: 'bg-red-500/10 text-red-600 border-red-200' },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const { adicionarCliente } = useData();
  const navigate = useNavigate();

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads_simulacao')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Erro ao carregar leads');
    } else {
      setLeads(data as Lead[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const atualizarStatus = async (id: string, novoStatus: string) => {
    const { error } = await supabase
      .from('leads_simulacao')
      .update({ status: novoStatus })
      .eq('id', id);
    if (error) {
      toast.error('Erro ao atualizar status');
    } else {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: novoStatus } : l));
      toast.success('Status atualizado');
    }
  };

  const leadsFiltrados = leads.filter(l => {
    const matchBusca = l.nome.toLowerCase().includes(busca.toLowerCase()) ||
      l.telefone.includes(busca) ||
      l.cpf_cnpj.includes(busca);
    const matchStatus = filtroStatus === 'todos' || l.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    const opt = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    return <Badge variant="outline" className={opt.color}>{opt.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads de Simulação"
        description="Clientes que aceitaram a proposta pelo link público"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone ou CPF/CNPJ..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {STATUS_OPTIONS.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={fetchLeads}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: leads.length, icon: <Clock className="h-4 w-4" /> },
          { label: 'Novos', value: leads.filter(l => l.status === 'novo').length, icon: <Clock className="h-4 w-4 text-blue-500" /> },
          { label: 'Convertidos', value: leads.filter(l => l.status === 'convertido').length, icon: <CheckCircle2 className="h-4 w-4 text-green-500" /> },
          { label: 'Perdidos', value: leads.filter(l => l.status === 'perdido').length, icon: <XCircle className="h-4 w-4 text-red-500" /> },
        ].map(s => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">{s.icon}{s.label}</div>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground">Cliente</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Contato</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Distribuidora</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Fatura</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Economia/mês</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Carregando...</td></tr>
            ) : leadsFiltrados.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Nenhum lead encontrado</td></tr>
            ) : (
              leadsFiltrados.map(lead => (
                <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <p className="font-medium text-foreground">{lead.nome}</p>
                    <p className="text-xs text-muted-foreground">{lead.cpf_cnpj} • {lead.tipo_cliente}</p>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 text-foreground">
                      <Phone className="h-3 w-3" />{lead.telefone}
                    </div>
                    {lead.email && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Mail className="h-3 w-3" />{lead.email}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-foreground">
                    {lead.distribuidora}
                    {(lead.cidade || lead.estado) && (
                      <p className="text-xs text-muted-foreground">{lead.cidade}{lead.cidade && lead.estado ? '/' : ''}{lead.estado}</p>
                    )}
                  </td>
                  <td className="p-3 text-right font-medium text-foreground">{formatarMoeda(lead.valor_fatura)}</td>
                  <td className="p-3 text-right font-medium text-primary">{formatarMoeda(lead.economia_mensal)}</td>
                  <td className="p-3">
                    <Select value={lead.status} onValueChange={(v) => atualizarStatus(lead.id, v)}>
                      <SelectTrigger className="h-8 w-32 border-0 bg-transparent p-0">
                        {getStatusBadge(lead.status)}
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">
                    {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
