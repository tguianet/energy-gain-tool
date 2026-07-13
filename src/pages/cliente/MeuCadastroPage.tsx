import { useEffect, useState } from 'react';
import { Loader2, Save, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ESTADOS_BR } from '@/constants/energy';

export default function MeuCadastroPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome_completo: '', telefone: '', whatsapp: '', email: '',
    cpf_cnpj: '', cidade: '', estado: '', tipo_cliente: 'residencial' as 'residencial' | 'empresarial',
  });

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data } = await supabase
        .from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (data) {
        setForm({
          nome_completo: data.nome_completo ?? '',
          telefone: data.telefone ?? '',
          whatsapp: data.whatsapp ?? '',
          email: data.email ?? user.email ?? '',
          cpf_cnpj: data.cpf_cnpj ?? '',
          cidade: data.cidade ?? '',
          estado: data.estado ?? '',
          tipo_cliente: (data.tipo_cliente as 'residencial' | 'empresarial') ?? 'residencial',
        });
        setClienteId(data.cliente_id);
      }
      setLoading(false);
    })();
  }, [user]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({
        nome_completo: form.nome_completo,
        telefone: form.telefone,
        whatsapp: form.whatsapp,
        cpf_cnpj: form.cpf_cnpj,
        cidade: form.cidade,
        estado: form.estado,
        tipo_cliente: form.tipo_cliente,
      }).eq('id', user.id);
      if (error) throw error;

      if (clienteId) {
        await supabase.from('clientes').update({
          nome_completo: form.nome_completo,
          telefone: form.telefone,
          email: form.email,
          cpf_cnpj: form.cpf_cnpj,
          cidade: form.cidade,
          estado: form.estado,
          tipo_cliente: form.tipo_cliente,
        }).eq('id', clienteId);
      }
      toast.success('Cadastro atualizado!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><User className="h-6 w-6 text-primary" /> Meu cadastro</h1>
        <p className="text-muted-foreground text-sm mt-1">Atualize seus dados pessoais</p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-sm font-medium">Nome completo</label>
            <Input value={form.nome_completo} onChange={e => set('nome_completo', e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Telefone</label>
            <Input value={form.telefone} onChange={e => set('telefone', e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">WhatsApp</label>
            <Input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">E-mail</label>
            <Input type="email" value={form.email} disabled className="bg-muted/40" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">CPF/CNPJ</label>
            <Input value={form.cpf_cnpj} onChange={e => set('cpf_cnpj', e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Cidade</label>
            <Input value={form.cidade} onChange={e => set('cidade', e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Estado</label>
            <Select value={form.estado} onValueChange={v => set('estado', v)}>
              <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
              <SelectContent>
                {ESTADOS_BR.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Tipo</label>
            <Select value={form.tipo_cliente} onValueChange={v => set('tipo_cliente', v as 'residencial' | 'empresarial')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="residencial">Residencial</SelectItem>
                <SelectItem value="empresarial">Empresarial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gradient-energy border-0 text-primary-foreground">
          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : <><Save className="h-4 w-4 mr-2" />Salvar</>}
        </Button>
      </div>
    </div>
  );
}