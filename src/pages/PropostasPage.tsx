import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, FileCheck, Send, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useData } from '@/contexts/DataContext';
import { formatarMoeda, formatarPercentual } from '@/utils/energyCalculations';
import { linkWhatsApp } from '@/utils/phone';
import PageHeader from '@/components/PageHeader';
import type { Proposta } from '@/types/energy';
import { toast } from 'sonner';

export default function PropostasPage() {
  const { propostas, clientes, atualizarProposta, adicionarContrato } = useData();
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [viewProposta, setViewProposta] = useState<Proposta | null>(null);

  const getTelefoneCliente = (clienteId: string) =>
    clientes.find(c => c.id === clienteId)?.telefone ?? '';

  const filtered = propostas.filter(p => {
    const matchBusca = !busca || p.nomeCliente.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || p.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const statusColors: Record<string, string> = {
    gerada: 'bg-secondary text-secondary-foreground',
    enviada: 'bg-accent/30 text-accent-foreground',
    aceita: 'bg-primary/10 text-primary',
    recusada: 'bg-destructive/10 text-destructive',
  };

  const handleEnviarWhatsApp = async (p: Proposta) => {
    const telefone = getTelefoneCliente(p.clienteId);
    const msg =
      `Olá ${p.nomeCliente}! Segue sua proposta de energia por assinatura:\n\n` +
      `💡 Valor atual: ${formatarMoeda(p.valorAtual)}\n` +
      `📉 Desconto: ${formatarPercentual(p.taxaDesconto)} (${formatarMoeda(p.descontoAplicado)})\n` +
      `✅ Valor final: ${formatarMoeda(p.valorFinal)}\n` +
      `💰 Economia mensal: ${formatarMoeda(p.economiaMensal)}\n` +
      `📊 Economia anual: ${formatarMoeda(p.economiaAnual)}\n\n` +
      `Entre em contato para aderir!`;

    window.open(linkWhatsApp(telefone, msg), '_blank');
    try {
      await atualizarProposta(p.id, { status: 'enviada' });
      toast.success('Proposta enviada via WhatsApp!');
    } catch {
      toast.error('Erro ao atualizar status da proposta');
    }
  };

  const handleGerarContrato = async (p: Proposta) => {
    try {
      await adicionarContrato({
        clienteId: p.clienteId, propostaId: p.id, nomeCliente: p.nomeCliente,
        distribuidora: p.distribuidora, dataAdesao: new Date().toISOString().split('T')[0],
        status: 'pendente', descontoContratado: p.descontoAplicado, taxaDesconto: p.taxaDesconto,
        valorOriginal: p.valorAtual, valorFinal: p.valorFinal,
        observacoes: '', historico: [{ data: new Date().toISOString().split('T')[0], descricao: 'Contrato gerado a partir da proposta' }],
      });
      await atualizarProposta(p.id, { status: 'aceita' });
      toast.success('Contrato gerado com sucesso!');
      navigate('/contratos');
    } catch {
      toast.error('Erro ao gerar contrato');
    }
  };

  const handleImprimir = () => window.print();

  return (
    <div className="space-y-6">
      <PageHeader title="Propostas" description="Gerencie suas propostas comerciais" />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar proposta..." className="pl-10" value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="gerada">Gerada</SelectItem>
            <SelectItem value="enviada">Enviada</SelectItem>
            <SelectItem value="aceita">Aceita</SelectItem>
            <SelectItem value="recusada">Recusada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Cliente</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Valor Atual</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Desconto</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Economia Mensal</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium">{p.nomeCliente}</p>
                  <p className="text-xs text-muted-foreground">{p.distribuidora}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">{formatarMoeda(p.valorAtual)}</td>
                <td className="px-4 py-3 hidden md:table-cell text-primary font-medium">{formatarPercentual(p.taxaDesconto)}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-primary font-medium">{formatarMoeda(p.economiaMensal)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[p.status]}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewProposta(p)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEnviarWhatsApp(p)}>
                      <Send className="h-4 w-4" />
                    </Button>
                    {(p.status === 'gerada' || p.status === 'enviada') && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleGerarContrato(p)}>
                        <FileCheck className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Nenhuma proposta encontrada</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!viewProposta} onOpenChange={() => setViewProposta(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Proposta Comercial</DialogTitle></DialogHeader>
          {viewProposta && (
            <div className="space-y-4">
              <div className="rounded-lg gradient-energy p-4 text-primary-foreground text-center">
                <p className="text-sm opacity-90">Economia Mensal</p>
                <p className="text-3xl font-bold">{formatarMoeda(viewProposta.economiaMensal)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Cliente', value: viewProposta.nomeCliente },
                  { label: 'Distribuidora', value: viewProposta.distribuidora },
                  { label: 'Valor Atual', value: formatarMoeda(viewProposta.valorAtual) },
                  { label: 'Desconto', value: `${formatarPercentual(viewProposta.taxaDesconto)} (${formatarMoeda(viewProposta.descontoAplicado)})` },
                  { label: 'Valor Final', value: formatarMoeda(viewProposta.valorFinal) },
                  { label: 'Economia Anual', value: formatarMoeda(viewProposta.economiaAnual) },
                ].map(item => (
                  <div key={item.label} className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-semibold text-sm mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground mb-1">Resumo Comercial</p>
                <p className="text-sm">{viewProposta.resumoComercial}</p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleImprimir}><Printer className="h-4 w-4 mr-2" />Imprimir</Button>
            {viewProposta && (
              <Button onClick={() => handleEnviarWhatsApp(viewProposta)} className="gradient-energy border-0 text-primary-foreground">
                <Send className="h-4 w-4 mr-2" />WhatsApp
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
