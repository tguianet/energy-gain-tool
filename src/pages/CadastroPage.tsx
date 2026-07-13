import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { clienteSignupSchema } from '@/utils/validators';
import { ESTADOS_BR } from '@/constants/energy';

export default function CadastroPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nomeCompleto: '',
    telefone: '',
    whatsapp: '',
    email: '',
    password: '',
    cidade: '',
    estado: '',
    cpfCnpj: '',
    tipoCliente: 'residencial' as 'residencial' | 'empresarial',
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = clienteSignupSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? 'Verifique os campos');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/app/inicio`,
          data: {
            nome_completo: parsed.data.nomeCompleto,
            telefone: parsed.data.telefone,
            whatsapp: parsed.data.whatsapp,
            cpf_cnpj: parsed.data.cpfCnpj,
            cidade: parsed.data.cidade,
            estado: parsed.data.estado,
            tipo_cliente: parsed.data.tipoCliente,
            public_signup: true,
          },
        },
      });
      if (error) throw error;
      if (data.session) {
        toast.success('Cadastro realizado! Bem-vindo.');
        navigate('/app/inicio');
      } else {
        toast.success('Cadastro criado! Verifique seu e-mail para confirmar.');
        navigate('/login');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao cadastrar';
      toast.error(msg.includes('registered') ? 'E-mail já cadastrado' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="rounded-xl bg-primary p-2">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">EnergiaSub</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-2xl gradient-energy p-6 text-primary-foreground text-center mb-6">
          <h1 className="text-2xl font-bold">Crie sua conta</h1>
          <p className="text-sm opacity-90 mt-2">Comece a economizar na sua conta de luz</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 shadow-card space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-sm font-medium">Nome completo *</label>
              <Input value={form.nomeCompleto} onChange={e => set('nomeCompleto', e.target.value)} placeholder="Seu nome" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Telefone *</label>
              <Input value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">WhatsApp *</label>
              <Input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">E-mail *</label>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="seu@email.com" autoComplete="email" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Senha *</label>
              <Input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Cidade *</label>
              <Input value={form.cidade} onChange={e => set('cidade', e.target.value)} placeholder="Sua cidade" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Estado *</label>
              <Select value={form.estado} onValueChange={v => set('estado', v)}>
                <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                <SelectContent>
                  {ESTADOS_BR.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">CPF ou CNPJ *</label>
              <Input value={form.cpfCnpj} onChange={e => set('cpfCnpj', e.target.value)} placeholder="000.000.000-00" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Tipo *</label>
              <Select value={form.tipoCliente} onValueChange={v => set('tipoCliente', v as 'residencial' | 'empresarial')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="residencial">Residencial</SelectItem>
                  <SelectItem value="empresarial">Empresarial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full gradient-energy border-0 text-primary-foreground h-11">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Criando conta...</> : 'Criar conta'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta? <Link to="/login" className="text-primary font-medium hover:underline">Entrar</Link>
          </p>
        </form>
      </main>
    </div>
  );
}