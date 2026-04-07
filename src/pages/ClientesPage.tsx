import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/PageHeader';
import type { Cliente, TipoCliente, StatusCliente } from '@/types/energy';
import { toast } from 'sonner';

const estadosBR = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

const emptyCliente = {
  nomeCompleto: '', telefone: '', email: '', cpfCnpj: '',
  tipoCliente: 'residencial' as TipoCliente, distribuidora: '', cidade: '', estado: '',
  endereco: '', unidadeConsumidora: '', consumoMedioMensal: 0, valorMedioConta: 0,
  observacoes: '', status: 'prospecto' as StatusCliente,
};

export default function ClientesPage() {
  const { clientes, adicionarCliente, atualizarCliente, removerCliente } = useData();
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroCidade, setFiltroCidade] = useState<string>('todas');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCliente);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const cidades = [...new Set(clientes.map(c => c.cidade))];

  const filtered = clientes.filter(c => {
    const matchBusca = !busca || c.nomeCompleto.toLowerCase().includes(busca.toLowerCase())
      || c.telefone.includes(busca) || c.cpfCnpj.includes(busca);
    const matchStatus = filtroStatus === 'todos' || c.status === filtroStatus;
    const matchCidade = filtroCidade === 'todas' || c.cidade === filtroCidade;
    return matchBusca && matchStatus && matchCidade;
  });

  const openNew = () => { setForm(emptyCliente); setEditingId(null); setModalOpen(true); };
  const openEdit = (c: Cliente) => {
    setForm({
      nomeCompleto: c.nomeCompleto, telefone: c.telefone, email: c.email, cpfCnpj: c.cpfCnpj,
      tipoCliente: c.tipoCliente, distribuidora: c.distribuidora, cidade: c.cidade, estado: c.estado,
      endereco: c.endereco, unidadeConsumidora: c.unidadeConsumidora,
      consumoMedioMensal: c.consumoMedioMensal, valorMedioConta: c.valorMedioConta,
      observacoes: c.observacoes, status: c.status,
    });
    setEditingId(c.id);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.nomeCompleto || !form.telefone || !form.cpfCnpj) {
      toast.error('Preencha os campos obrigatórios'); return;
    }
    if (editingId) {
      atualizarCliente(editingId, form);
      toast.success('Cliente atualizado!');
    } else {
      adicionarCliente(form);
      toast.success('Cliente cadastrado!');
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    removerCliente(id);
    setDeleteConfirm(null);
    toast.success('Cliente removido!');
  };

  const updateField = (field: string, value: string | number) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <PageHeader title="Clientes" description="Gerencie seus clientes de energia por assinatura">
        <Button onClick={openNew} className="gradient-energy border-0 text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> Novo Cliente
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, telefone ou CPF/CNPJ..." className="pl-10" value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="prospecto">Prospecto</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroCidade} onValueChange={setFiltroCidade}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as cidades</SelectItem>
            {cidades.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Nome</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Telefone</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Cidade</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Tipo</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{c.nomeCompleto}</p>
                    <p className="text-xs text-muted-foreground">{c.cpfCnpj}</p>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{c.telefone}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{c.cidade}/{c.estado}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground capitalize">
                    {c.tipoCliente}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    c.status === 'ativo' ? 'bg-primary/10 text-primary' :
                    c.status === 'prospecto' ? 'bg-accent/30 text-accent-foreground' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/simulador?clienteId=${c.id}`)}>
                      <Calculator className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteConfirm(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Nenhum cliente encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-sm font-medium">Nome Completo *</label>
              <Input value={form.nomeCompleto} onChange={e => updateField('nomeCompleto', e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Telefone *</label>
              <Input value={form.telefone} onChange={e => updateField('telefone', e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">E-mail</label>
              <Input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">CPF/CNPJ *</label>
              <Input value={form.cpfCnpj} onChange={e => updateField('cpfCnpj', e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Tipo de Cliente</label>
              <Select value={form.tipoCliente} onValueChange={v => updateField('tipoCliente', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="residencial">Residencial</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="rural">Rural</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Distribuidora</label>
              <Input value={form.distribuidora} onChange={e => updateField('distribuidora', e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Cidade</label>
              <Input value={form.cidade} onChange={e => updateField('cidade', e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Estado</label>
              <Select value={form.estado} onValueChange={v => updateField('estado', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{estadosBR.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-sm font-medium">Endereço</label>
              <Input value={form.endereco} onChange={e => updateField('endereco', e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Unidade Consumidora</label>
              <Input value={form.unidadeConsumidora} onChange={e => updateField('unidadeConsumidora', e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Consumo Médio (kWh)</label>
              <Input type="number" value={form.consumoMedioMensal || ''} onChange={e => updateField('consumoMedioMensal', Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Valor Médio da Conta (R$)</label>
              <Input type="number" value={form.valorMedioConta || ''} onChange={e => updateField('valorMedioConta', Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Status</label>
              <Select value={form.status} onValueChange={v => updateField('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospecto">Prospecto</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-sm font-medium">Observações</label>
              <Input value={form.observacoes} onChange={e => updateField('observacoes', e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="gradient-energy border-0 text-primary-foreground">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Confirmar exclusão</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
