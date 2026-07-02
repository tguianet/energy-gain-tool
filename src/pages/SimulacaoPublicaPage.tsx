import { useState, useMemo } from 'react';
import { Zap, TrendingDown, TrendingUp, DollarSign, CheckCircle, Loader2, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calcularSimulacao, formatarMoeda, formatarPercentual } from '@/utils/energyCalculations';
import { toast } from 'sonner';
import { createLeadPublic } from '@/services/energyService';
import { useConfigPublica } from '@/contexts/DataContext';
import { DISTRIBUIDORAS } from '@/constants/energy';
import { simulacaoPublicaSchema } from '@/utils/validators';

export default function SimulacaoPublicaPage() {
  const { data: configPublica } = useConfigPublica();
  const taxaDesconto = configPublica?.taxaDescontoPadrao ?? 15;
  const taxasFixas = configPublica?.taxasFixasPadrao ?? 50;

  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [distribuidora, setDistribuidora] = useState('');
  const [valorFatura, setValorFatura] = useState(0);
  const [consumoMedio, setConsumoMedio] = useState(0);

  const resultado = useMemo(
    () => calcularSimulacao(valorFatura, taxasFixas, taxaDesconto),
    [valorFatura, taxasFixas, taxaDesconto]
  );

  const handleQueroProposta = async () => {
    const parsed = simulacaoPublicaSchema.safeParse({
      nome,
      telefone,
      email: email || '',
      distribuidora,
      valorFatura,
      consumoMedio: consumoMedio || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? 'Preencha os campos obrigatórios');
      return;
    }

    setEnviando(true);
    try {
      await createLeadPublic({
        nome,
        telefone,
        email,
        distribuidora,
        valorFatura,
        consumoMedio: consumoMedio || undefined,
        descontoPercentual: taxaDesconto,
        economiaMensal: resultado.economiaMensal,
        economiaAnual: resultado.economiaAnual,
        valorFinal: resultado.valorFinal,
      });
      setEnviado(true);
      toast.success('Solicitação enviada! Entraremos em contato em breve.');
    } catch {
      toast.error('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-card/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
            <div className="rounded-xl bg-primary p-2">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Energia por Assinatura</h1>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full rounded-2xl border bg-card p-8 shadow-card text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Solicitação recebida!</h2>
            <p className="text-muted-foreground">
              Obrigado, {nome}! Nossa equipe entrará em contato pelo WhatsApp para enviar sua proposta.
            </p>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
              <p className="text-sm text-muted-foreground">Economia mensal estimada</p>
              <p className="text-3xl font-bold text-primary">{formatarMoeda(resultado.economiaMensal)}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="rounded-xl bg-primary p-2">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Energia por Assinatura</h1>
            <p className="text-xs text-muted-foreground">Simule sua economia agora</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="rounded-2xl gradient-energy p-6 text-primary-foreground text-center">
          <h2 className="text-2xl font-bold">Economize na sua conta de luz</h2>
          <p className="text-sm opacity-90 mt-2">Preencha seus dados e veja quanto você pode economizar</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
          <h3 className="font-semibold text-foreground">Seus dados</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-sm font-medium text-foreground">Nome *</label>
              <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome completo" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Telefone / WhatsApp *</label>
              <Input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">E-mail</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Distribuidora *</label>
              <Select value={distribuidora} onValueChange={setDistribuidora}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {DISTRIBUIDORAS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Valor da fatura (R$) *</label>
              <Input
                type="number"
                value={valorFatura || ''}
                onChange={e => setValorFatura(Number(e.target.value))}
                placeholder="Ex: 350"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Consumo médio (kWh)</label>
              <Input
                type="number"
                value={consumoMedio || ''}
                onChange={e => setConsumoMedio(Number(e.target.value))}
                placeholder="Ex: 400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Taxa de desconto</label>
              <div className="flex h-10 items-center rounded-md border bg-muted/40 px-3 text-sm font-medium text-foreground">
                <Percent className="h-4 w-4 mr-2 text-primary" />
                {formatarPercentual(taxaDesconto)}
              </div>
              <p className="text-xs text-muted-foreground">Definida pela operadora do serviço</p>
            </div>
          </div>
        </div>

        {valorFatura > 0 && (
          <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
            <h3 className="font-semibold text-foreground">Resultado da simulação</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: <DollarSign className="h-4 w-4" />, label: 'Valor original', value: formatarMoeda(valorFatura) },
                { icon: <TrendingDown className="h-4 w-4" />, label: 'Desconto em R$', value: formatarMoeda(resultado.descontoReais) },
                { icon: <Zap className="h-4 w-4" />, label: 'Valor final', value: formatarMoeda(resultado.valorFinal) },
                { icon: <TrendingUp className="h-4 w-4" />, label: 'Economia mensal', value: formatarMoeda(resultado.economiaMensal) },
                { icon: <TrendingUp className="h-4 w-4" />, label: 'Economia anual', value: formatarMoeda(resultado.economiaAnual) },
              ].map(card => (
                <div key={card.label} className="rounded-lg border p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    {card.icon}
                    <span className="text-xs">{card.label}</span>
                  </div>
                  <p className="font-bold text-sm text-foreground">{card.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleQueroProposta}
          disabled={enviando}
          className="w-full gradient-energy border-0 text-primary-foreground h-12 text-base"
        >
          {enviando ? (
            <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Enviando...</>
          ) : (
            <><CheckCircle className="h-5 w-5 mr-2" />Quero receber proposta</>
          )}
        </Button>
      </main>

      <footer className="border-t mt-12 py-6 text-center text-xs text-muted-foreground">
        Energia por Assinatura • Economia garantida na sua conta de luz
      </footer>
    </div>
  );
}
