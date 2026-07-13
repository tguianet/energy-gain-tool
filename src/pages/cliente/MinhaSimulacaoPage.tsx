import { useEffect, useMemo, useState } from 'react';
import { Calculator, DollarSign, Loader2, Send, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { calcularSimulacao, formatarMoeda, formatarPercentual } from '@/utils/energyCalculations';
import { DISTRIBUIDORAS, DEFAULT_TAXA_DESCONTO, DEFAULT_TAXAS_FIXAS } from '@/constants/energy';

interface MinhaSim {
  id: string;
  valor_fatura: number;
  valor_final: number;
  economia_mensal: number;
  economia_anual: number;
  taxa_desconto: number;
  created_at: string;
  distribuidora: string | null;
}

export default function MinhaSimulacaoPage() {
  const { user } = useAuth();
  const [taxaDesconto, setTaxaDesconto] = useState(DEFAULT_TAXA_DESCONTO);
  const [taxasFixas, setTaxasFixas] = useState(DEFAULT_TAXAS_FIXAS);
  const [valorFatura, setValorFatura] = useState(0);
  const [consumoMedio, setConsumoMedio] = useState(0);
  const [distribuidora, setDistribuidora] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [minhasSims, setMinhasSims] = useState<MinhaSim[]>([]);
  const [nomeCliente, setNomeCliente] = useState('');

  const resultado = useMemo(
    () => calcularSimulacao(valorFatura, taxasFixas, taxaDesconto),
    [valorFatura, taxasFixas, taxaDesconto]
  );

  const carregar = async () => {
    if (!user) return;
    const { data: sims } = await supabase
      .from('simulacoes')
      .select('id,valor_fatura,valor_final,economia_mensal,economia_anual,taxa_desconto,created_at,distribuidora')
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
          .from('profiles').select('nome_completo').eq('id', user.id).maybeSingle();
        setNomeCliente(profile?.nome_completo ?? '');
      }
      await carregar();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleEnviar = async () => {
    if (!user) return;
    if (valorFatura <= 0) {
      toast.error('Informe o valor da fatura');
      return;
    }
    setEnviando(true);
    try {
      const { error } = await supabase.from('simulacoes').insert({
        user_id: user.id,
        nome_cliente: nomeCliente || (user.email ?? 'Cliente'),
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
      });
      if (error) throw error;
      toast.success('Simulação enviada para análise!');
      setValorFatura(0);
      setConsumoMedio(0);
      await carregar();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Calculator className="h-6 w-6 text-primary" /> Minha simulação</h1>
        <p className="text-muted-foreground text-sm mt-1">Calcule sua economia e envie para análise</p>
      </div>

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
            <Input type="number" value={valorFatura || ''} onChange={e => setValorFatura(Number(e.target.value))} placeholder="Ex: 350" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Consumo médio (kWh)</label>
            <Input type="number" value={consumoMedio || ''} onChange={e => setConsumoMedio(Number(e.target.value))} placeholder="Ex: 400" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Taxa de desconto</label>
            <div className="flex h-10 items-center rounded-md border bg-muted/40 px-3 text-sm font-medium">
              {formatarPercentual(taxaDesconto)}
            </div>
          </div>
        </div>
      </div>

      {valorFatura > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
          <h3 className="font-semibold">Resultado</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: <DollarSign className="h-4 w-4" />, label: 'Valor original', value: formatarMoeda(valorFatura) },
              { icon: <TrendingDown className="h-4 w-4" />, label: 'Desconto estimado', value: formatarMoeda(resultado.descontoReais) },
              { icon: <Zap className="h-4 w-4" />, label: 'Valor final', value: formatarMoeda(resultado.valorFinal) },
              { icon: <TrendingUp className="h-4 w-4" />, label: 'Economia mensal', value: formatarMoeda(resultado.economiaMensal) },
              { icon: <TrendingUp className="h-4 w-4" />, label: 'Economia anual', value: formatarMoeda(resultado.economiaAnual) },
            ].map(c => (
              <div key={c.label} className="rounded-lg border p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">{c.icon}<span className="text-xs">{c.label}</span></div>
                <p className="font-bold text-sm">{c.value}</p>
              </div>
            ))}
          </div>
          <Button onClick={handleEnviar} disabled={enviando} className="w-full gradient-energy border-0 text-primary-foreground h-11">
            {enviando ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando...</> : <><Send className="h-4 w-4 mr-2" />Enviar para análise</>}
          </Button>
        </div>
      )}

      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h3 className="font-semibold mb-4">Minhas simulações</h3>
        {minhasSims.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma simulação enviada ainda.</p>
        ) : (
          <div className="space-y-2">
            {minhasSims.map(s => (
              <div key={s.id} className="rounded-lg border p-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{new Date(s.created_at).toLocaleDateString('pt-BR')} — {s.distribuidora ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">Fatura: {formatarMoeda(Number(s.valor_fatura))} • Final: {formatarMoeda(Number(s.valor_final))}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Economia mensal</p>
                  <p className="font-bold text-primary">{formatarMoeda(Number(s.economia_mensal))}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}