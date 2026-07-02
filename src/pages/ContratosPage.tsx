import { useState } from 'react';
import { Search, Eye, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useData } from '@/contexts/DataContext';
import { formatarMoeda, formatarPercentual } from '@/utils/energyCalculations';
import PageHeader from '@/components/PageHeader';
import type { Contrato, StatusContrato } from '@/types/energy';
import { toast } from 'sonner';

export default function ContratosPage() {
  const { contratos, atualizarContrato } = useData();
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [viewContrato, setViewContrato] = useState<Contrato | null>(null);
  const [editContrato, setEditContrato] = useState<Contrato | null>(null);
  const [editStatus, setEditStatus] = useState<StatusContrato>('ativo');
  const [editObs, setEditObs] = useState('');

  const filtered = contratos.filter(c => {
    const matchBusca = !busca || c.nomeCliente.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || c.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const statusColors: Record<string, string> = {
    ativo: 'bg-primary/10 text-primary',
    pendente: 'bg-accent/30 text-accent-foreground',
    cancelado: 'bg-destructive/10 text-destructive',
  };

  const openEdit = (c: Contrato) => {
    setEditContrato(c);
    setEditStatus(c.status);
    setEditObs(c.observacoes);
  };

  const handleSaveEdit = async () => {
    if (!editContrato) return;
    const newHistorico = [...editContrato.historico];
    if (editStatus !== editContrato.status) {
      newHistorico.push({ data: new Date().toISOString().split('T')[0], descricao: `Status alterado para ${editStatus}` });
    }
    try {
      await atualizarContrato(editContrato.id, { status: editStatus, observacoes: editObs, historico: newHistorico });
      setEditContrato(null);
    } catch {
      toast.error('Erro ao atualizar contrato');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Contratos" description="Gerencie os contratos de energia por assinatura" />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar contrato..." className="pl-10" value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Cliente</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Distribuidora</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Desconto</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Adesão</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium">{c.nomeCliente}</p>
                  <p className="text-xs text-muted-foreground">{formatarMoeda(c.valorOriginal)} → {formatarMoeda(c.valorFinal)}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{c.distribuidora}</td>
                <td className="px-4 py-3 hidden md:table-cell text-primary font-medium">{formatarPercentual(c.taxaDesconto)}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{c.dataAdesao}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[c.status]}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewContrato(c)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Nenhum contrato encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View */}
      <Dialog open={!!viewContrato} onOpenChange={() => setViewContrato(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Detalhes do Contrato</DialogTitle></DialogHeader>
          {viewContrato && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Cliente', value: viewContrato.nomeCliente },
                  { label: 'Distribuidora', value: viewContrato.distribuidora },
                  { label: 'Valor Original', value: formatarMoeda(viewContrato.valorOriginal) },
                  { label: 'Valor Final', value: formatarMoeda(viewContrato.valorFinal) },
                  { label: 'Desconto', value: `${formatarPercentual(viewContrato.taxaDesconto)} (${formatarMoeda(viewContrato.descontoContratado)})` },
                  { label: 'Data Adesão', value: viewContrato.dataAdesao },
                ].map(item => (
                  <div key={item.label} className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-semibold text-sm mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
              {viewContrato.historico.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Histórico</p>
                  <div className="space-y-2">
                    {viewContrato.historico.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{h.data}</span>
                        <span>{h.descricao}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!editContrato} onOpenChange={() => setEditContrato(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Editar Contrato</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Status</label>
              <Select value={editStatus} onValueChange={v => setEditStatus(v as StatusContrato)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Observações</label>
              <Input value={editObs} onChange={e => setEditObs(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditContrato(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} className="gradient-energy border-0 text-primary-foreground">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
