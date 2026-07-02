import { useState, useMemo } from 'react';
import { Zap, TrendingDown, TrendingUp, DollarSign, Percent, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calcularSimulacao, formatarMoeda, formatarPercentual } from '@/utils/energyCalculations';
import { toast } from 'sonner';
import { createLeadPublic } from '@/services/energyService';
import { useConfigPublica } from '@/contexts/DataContext';
import { DISTRIBUIDORAS, ESTADOS_BR } from '@/constants/energy';
import { simulacaoPublicaSchema } from '@/utils/validators';
import type { TipoCliente } from '@/types/energy';

export default function SimulacaoPublicaPage() {
  const { data: configPublica } = useConfigPublica();
  const taxaDesconto = configPublica?.taxaDescontoPadrao ?? 15;
  const taxasFixas = configPublica?.taxasFixasPadrao ?? 50;

  const [etapa, setEtapa] = useState<'formulario' | 'resultado'>('formulario');
  const [enviando, setEnviando] = useState(false);
  const [aceito, setAceito] = useState(false);

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [tipoCliente, setTipoCliente] = useState<TipoCliente>('residencial');
  const [distribuidora, setDistribuidora] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [valorFatura, setValorFatura] = useState(0);
  const [consumoMedio, setConsumoMedio] = useState(0);

  const resultado = useMemo(
    () => calcularSimulacao(valorFatura, taxasFixas, taxaDesconto),
    [valorFatura, taxasFixas, taxaDesconto]
  );

  const handleSimular = () => {
    const parsed = simulacaoPublicaSchema.safeParse({
      nome, telefone, email: email || undefined, cpfCnpj, distribuidora, valorFatura,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? 'Preencha os campos obrigatórios');
      return;
    }
    setEtapa('resultado');
  };

  const handleAceitarProposta = async () => {
    setEnviando(true);
    try {
      await createLeadPublic({
        nome, telefone, email, cpfCnpj, tipoCliente, distribuidora,
        cidade, estado, valorFatura, consumoMedio,
        descontoPercentual: taxaDesconto,
        economiaMensal: resultado.economiaMensal,
        economiaAnual: resultado.economiaAnual,
        valorFinal: resultado.valorFinal,
      });
      setAceito(true);
      toast.success('Proposta aceita com sucesso! Entraremos em contato.');
    } catch {
      toast.error('Erro ao enviar proposta. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const handleVoltar = () => {
    setEtapa('formulario');
    setAceito(false);
  };

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

      <main className="max-w-3xl mx-auto px-4 py-8">
        {etapa === 'formulario' ? (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl gradient-energy p-6 text-primary-foreground text-center">
              <h2 className="text-2xl font-bold">Economize até {taxaDesconto}% na sua conta de luz</h2>
              <p className="text-sm opacity-90 mt-2">Preencha seus dados e descubra quanto você pode economizar</p>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
              <h3 className="font-semibold text-foreground">Seus Dados</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Nome completo *</label>
                  <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" />
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
                  <label className="text-sm font-medium text-foreground">CPF ou CNPJ *</label>
                  <Input value={cpfCnpj} onChange={e => setCpfCnpj(e.target.value)} placeholder="000.000.000-00" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Tipo de cliente</label>
                  <Select value={tipoCliente} onValueChange={(v) => setTipoCliente(v as TipoCliente)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residencial">Residencial</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                      <SelectItem value="rural">Rural</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <label className="text-sm font-medium text-foreground">Cidade</label>
                  <Input value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Sua cidade" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Estado</label>
                  <Select value={estado} onValueChange={setEstado}>
                    <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                    <SelectContent>
                      {ESTADOS_BR.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-5">
                <h3 className="font-semibold text-foreground mb-4">Dados de Consumo</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Valor da conta de luz (R$) *</label>
                    <Input type="number" value={valorFatura || ''} onChange={e => setValorFatura(Number(e.target.value))} placeholder="Ex: 350" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Consumo médio (kWh)</label>
                    <Input type="number" value={consumoMedio || ''} onChange={e => setConsumoMedio(Number(e.target.value))} placeholder="Ex: 400" />
                  </div>
                </div>
              </div>

              {valorFatura > 0 && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Economia estimada</p>
                  <p className="text-2xl font-bold text-primary mt-1">{formatarMoeda(resultado.economiaMensal)}<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
                </div>
              )}

              <Button onClick={handleSimular} className="w-full gradient-energy border-0 text-primary-foreground h-12 text-base">
                <Zap className="h-5 w-5 mr-2" />
                Ver minha economia
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {!aceito ? (
              <>
                <div className="rounded-2xl gradient-energy p-6 text-primary-foreground text-center">
                  <p className="text-sm opacity-90">Sua economia mensal</p>
                  <p className="text-4xl font-bold mt-1">{formatarMoeda(resultado.economiaMensal)}</p>
                  <p className="text-sm opacity-80 mt-2">
                    {formatarMoeda(resultado.economiaAnual)} por ano • {formatarPercentual(resultado.percentualEconomia)} de economia
                  </p>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
                  <h3 className="font-semibold text-foreground">Detalhes da sua proposta</h3>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: <DollarSign className="h-4 w-4" />, label: 'Valor atual', value: formatarMoeda(valorFatura) },
                      { icon: <Percent className="h-4 w-4" />, label: 'Desconto', value: formatarPercentual(taxaDesconto) },
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

                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">Cliente</p>
                    <p className="text-sm font-medium text-foreground">{nome}</p>
                    <p className="text-xs text-muted-foreground mt-1">{distribuidora} • {cidade && `${cidade}/`}{estado}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button onClick={handleAceitarProposta} disabled={enviando} className="w-full gradient-energy border-0 text-primary-foreground h-12 text-base">
                    {enviando ? (
                      <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Enviando...</>
                    ) : (
                      <><CheckCircle className="h-5 w-5 mr-2" />Aceitar Proposta</>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleVoltar} className="w-full">
                    Voltar e editar dados
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border bg-card p-8 shadow-card text-center space-y-4 animate-fade-in">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Proposta Aceita!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Obrigado, {nome}! Nossa equipe entrará em contato pelo WhatsApp para finalizar sua adesão.
                </p>
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 inline-block">
                  <p className="text-sm text-muted-foreground">Sua economia mensal</p>
                  <p className="text-3xl font-bold text-primary">{formatarMoeda(resultado.economiaMensal)}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t mt-12 py-6 text-center text-xs text-muted-foreground">
        Energia por Assinatura • Economia garantida na sua conta de luz
      </footer>
    </div>
  );
}
