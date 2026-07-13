import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calculator, CheckCircle2, DollarSign, FileUp, Loader2, MessageCircle,
  Sparkles, TrendingUp, Zap, Building2, Home, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { calcularSimulacao, formatarMoeda, formatarPercentual } from '@/utils/energyCalculations';
import { DISTRIBUIDORAS, DEFAULT_TAXA_DESCONTO, DEFAULT_TAXAS_FIXAS } from '@/constants/energy';
import { linkWhatsApp } from '@/utils/phone';

interface MinhaSim {
  id: string;
  valor_fatura: number;
  valor_final: number;
  economia_mensal: number;
  economia_anual: number;
  taxa_desconto: number;
  created_at: string;
  distribuidora: string | null;
  status: string | null;
  codigo_solicitacao: string | null;
}

interface PerfilCliente {
  nome_completo: string | null;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  aguardando_analise: 'Aguardando análise',
  rascunho: 'Rascunho',
  aprovada: 'Aprovada',
  recusada: 'Recusada',
};

export default function MinhaSimulacaoPage() {
  const { user } = useAuth();
  const [taxaDesconto, setTaxaDesconto] = useState(DEFAULT_TAXA_DESCONTO);
  const [taxasFixas, setTaxasFixas] = useState(DEFAULT_TAXAS_FIXAS);
  const [valorFatura, setValorFatura] = useState(0);
  const [consumoMedio, setConsumoMedio] = useState(0);
  const [distribuidora, setDistribuidora] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [minhasSims, setMinhasSims] = useState<MinhaSim[]>([]);
  const [perfil, setPerfil] = useState<PerfilCliente | null>(null);
  const [empresaWhats, setEmpresaWhats] = useState<string>('');
  const [confirmacao, setConfirmacao] = useState<{ codigo: string; economiaMensal: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resultado = useMemo(
    () => calcularSimulacao(valorFatura, taxasFixas, taxaDesconto),
    [valorFatura, taxasFixas, taxaDesconto]
  );
  const economia5Anos = resultado.economiaAnual * 5;

  const carregar = async () => {
    if (!user) return;
    const { data: sims } = await supabase
      .from('simulacoes')
      .select('id,valor_fatura,valor_final,economia_mensal,economia_anual,taxa_desconto,created_at,distribuidora,status,codigo_solicitacao')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setMinhasSims((sims ?? []) as MinhaSim[]);
  };

  useEffect(() => {
    void (async () => {
      const { data: cfg } = await supabase
        .from('configuracoes_publicas').select('taxa_desconto_padrao,taxas_fixas_padrao').maybeSingle();
      if (cfg) {
        setTaxaDesconto(Number(cfg.taxa_desconto_padrao));
        setTaxasFixas(Number(cfg.taxas_fixas_padrao));
      }
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nome_completo,telefone,whatsapp,email')
          .eq('id', user.id)
          .maybeSingle();
        setPerfil(profile as PerfilCliente | null);
      }
      await carregar();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande (máx. 10MB)');
      return;
    }
    setArquivo(f);
  };

  const uploadConta = async (): Promise<string | null> => {
    if (!arquivo || !user) return null;
    const ext = arquivo.name.split('.').pop() ?? 'bin';
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('contas-energia').upload(path, arquivo, {
      contentType: arquivo.type || undefined,
    });
    if (error) throw error;
    return path;
  };

  const handleEnviar = async () => {
    if (!user) return;
    if (valorFatura <= 0) {
      toast.error('Informe o valor médio da fatura');
      return;
    }
    setEnviando(true);
    try {
      let contaPath: string | null = null;
      try { contaPath = await uploadConta(); } catch (err) {
        toast.error('Falha ao enviar o arquivo da conta. Tentando salvar mesmo assim.');
        console.error(err);
      }

      const { data, error } = await supabase.from('simulacoes').insert({
        user_id: user.id,
        nome_cliente: perfil?.nome_completo || user.email || 'Cliente',
        distribuidora: distribuidora || null,
        valor_fatura: valorFatura,
        consumo_medio: consumoMedio || 0,
        taxa_desconto: taxaDesconto,
        taxas_fixas: taxasFixas,
        base_desconto: resultado.baseDesconto,
        desconto_reais: resultado.descontoReais,
        valor_final: resultado.valorFinal,
        economia_mensal: resultado.economiaMensal,
        economia_anual: resultado.economiaAnual,
        percentual_economia: resultado.percentualEconomia,
        status: 'aguardando_analise',
        conta_energia_url: contaPath,
      }).select('codigo_solicitacao,economia_mensal').single();
      if (error) throw error;

      // Try to fetch company whatsapp for the confirmation CTA
      const { data: cfg } = await supabase
        .from('configuracoes').select('nome_empresa').maybeSingle();
      // best-effort: use admin phone if available via profiles of admin role — skip; use static empty
      setEmpresaWhats('');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _ = cfg;

      setConfirmacao({
        codigo: data?.codigo_solicitacao ?? '—',
        economiaMensal: Number(data?.economia_mensal ?? resultado.economiaMensal),
      });
      setValorFatura(0);
      setConsumoMedio(0);
      setDistribuidora('');
      setArquivo(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await carregar();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar');
    } finally {
      setEnviando(false);
    }
  };

  if (confirmacao) {
    const mensagem = `Olá! Acabei de enviar minha simulação (código ${confirmacao.codigo}) e gostaria de receber minha proposta.`;
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="rounded-xl border bg-card p-8 shadow-card text-center space-y-5">
          <div className="mx-auto h-16 w-16 rounded-full gradient-energy flex items-center justify-center shadow-glow">
            <CheckCircle2 className="h-9 w-9 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Solicitação recebida!</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sua simulação foi enviada e está <strong>aguardando análise</strong> da nossa equipe.
            </p>
          </div>
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Código da solicitação</p>
            <p className="text-2xl font-bold text-primary mt-1">{confirmacao.codigo}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Economia mensal estimada</p>
            <p className="text-xl font-bold text-primary">{formatarMoeda(confirmacao.economiaMensal)}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              asChild
              className="flex-1 gradient-energy border-0 text-primary-foreground h-11"
            >
              <a href={linkWhatsApp(empresaWhats, mensagem)} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4 mr-2" /> Falar pelo WhatsApp
              </a>
            </Button>
            <Button variant="outline" className="flex-1 h-11" onClick={() => setConfirmacao(null)}>
              Nova simulação
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" /> Minha simulação
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Calcule sua economia e receba uma proposta personalizada
        </p>
      </div>

      {/* Dados do cliente autenticado */}
      <div className="rounded-xl border bg-muted/30 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Seus dados</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <p><span className="text-muted-foreground">Nome:</span> <strong>{perfil?.nome_completo ?? '—'}</strong></p>
          <p><span className="text-muted-foreground">E-mail:</span> <strong>{perfil?.email ?? user?.email ?? '—'}</strong></p>
          <p><span className="text-muted-foreground">Telefone:</span> <strong>{perfil?.telefone || '—'}</strong></p>
          <p><span className="text-muted-foreground">WhatsApp:</span> <strong>{perfil?.whatsapp || '—'}</strong></p>
        </div>
      </div>

      {/* Formulário */}
      <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Distribuidora</label>
            <Select value={distribuidora} onValueChange={setDistribuidora}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {DISTRIBUIDORAS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Valor médio da conta (R$) *</label>
            <Input type="number" inputMode="decimal" value={valorFatura || ''}
              onChange={e => setValorFatura(Number(e.target.value))} placeholder="Ex: 350" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Consumo médio (kWh)</label>
            <Input type="number" inputMode="numeric" value={consumoMedio || ''}
              onChange={e => setConsumoMedio(Number(e.target.value))} placeholder="Ex: 400 (opcional)" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Taxa de desconto</label>
            <div className="flex h-10 items-center rounded-md border bg-muted/40 px-3 text-sm font-medium">
              {formatarPercentual(taxaDesconto)}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Conta de energia (imagem ou PDF) — opcional</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleArquivo}
              className="hidden"
              id="conta-upload"
            />
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <FileUp className="h-4 w-4 mr-2" /> Selecionar arquivo
            </Button>
            {arquivo && (
              <span className="text-sm text-muted-foreground truncate">
                {arquivo.name} ({(arquivo.size / 1024).toFixed(0)} KB)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Resultado */}
      {valorFatura > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Resultado estimado
            </h3>
            <div className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
              {formatarPercentual(taxaDesconto)} de desconto
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: <DollarSign className="h-4 w-4" />, label: 'Valor atual da conta', value: formatarMoeda(valorFatura) },
              { icon: <Zap className="h-4 w-4" />, label: 'Novo valor estimado', value: formatarMoeda(resultado.valorFinal), highlight: true },
              { icon: <TrendingUp className="h-4 w-4" />, label: 'Economia mensal', value: formatarMoeda(resultado.economiaMensal), highlight: true },
              { icon: <TrendingUp className="h-4 w-4" />, label: 'Economia anual', value: formatarMoeda(resultado.economiaAnual) },
              { icon: <TrendingUp className="h-4 w-4" />, label: 'Economia em 5 anos', value: formatarMoeda(economia5Anos) },
              { icon: <Sparkles className="h-4 w-4" />, label: 'Percentual de desconto', value: formatarPercentual(taxaDesconto) },
            ].map(c => (
              <div key={c.label}
                className={`rounded-lg border p-3 ${c.highlight ? 'bg-primary/5 border-primary/30' : ''}`}>
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  {c.icon}<span className="text-xs">{c.label}</span>
                </div>
                <p className={`font-bold text-sm ${c.highlight ? 'text-primary' : ''}`}>{c.value}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground italic border-l-2 border-primary/50 pl-3">
            Esta simulação é uma estimativa. O valor definitivo será calculado após a análise da sua conta de energia.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {[
              { icon: <Home className="h-4 w-4" />, text: 'Sem instalação de placas' },
              { icon: <Building2 className="h-4 w-4" />, text: 'Sem obras no imóvel' },
              { icon: <Zap className="h-4 w-4" />, text: 'Energia entregue pela mesma distribuidora' },
              { icon: <TrendingUp className="h-4 w-4" />, text: 'Economia mensal na sua conta' },
            ].map(b => (
              <div key={b.text} className="flex items-center gap-2 text-sm rounded-md bg-muted/40 px-3 py-2">
                <span className="text-primary">{b.icon}</span>{b.text}
              </div>
            ))}
          </div>

          <Button onClick={handleEnviar} disabled={enviando}
            className="w-full gradient-energy border-0 text-primary-foreground h-12 text-base font-semibold">
            {enviando
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando solicitação...</>
              : <><Shield className="h-4 w-4 mr-2" />Quero receber minha proposta</>}
          </Button>
        </div>
      )}

      {/* Histórico */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h3 className="font-semibold mb-4">Minhas simulações</h3>
        {minhasSims.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma simulação enviada ainda.</p>
        ) : (
          <div className="space-y-2">
            {minhasSims.map(s => (
              <div key={s.id} className="rounded-lg border p-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {s.codigo_solicitacao ?? '—'} — {new Date(s.created_at).toLocaleDateString('pt-BR')} — {s.distribuidora ?? 'sem distribuidora'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Fatura: {formatarMoeda(Number(s.valor_fatura))} • Final: {formatarMoeda(Number(s.valor_final))}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                    {STATUS_LABELS[s.status ?? ''] ?? s.status ?? '—'}
                  </span>
                  <p className="font-bold text-primary text-sm">{formatarMoeda(Number(s.economia_mensal))}/mês</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}