import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calculator, Zap, TrendingDown, TrendingUp, DollarSign, Percent, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';
import { calcularSimulacao, calcularComissao, formatarMoeda, formatarPercentual } from '@/utils/energyCalculations';
import PageHeader from '@/components/PageHeader';
import { toast } from 'sonner';

export default function SimuladorPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clientes, config, adicionarSimulacao, adicionarProposta } = useData();

  const clienteIdParam = searchParams.get('clienteId');
  const clienteInicial = clientes.find(c => c.id === clienteIdParam);

  const [clienteId, setClienteId] = useState(clienteIdParam || '');
  const [nomeCliente, setNomeCliente] = useState(clienteInicial?.nomeCompleto || '');
  const [telefone, setTelefone] = useState(clienteInicial?.telefone || '');
  const [distribuidora, setDistribuidora] = useState(clienteInicial?.distribuidora || '');
  const [valorFatura, setValorFatura] = useState(clienteInicial?.valorMedioConta || 0);
  const [consumoMedio, setConsumoMedio] = useState(clienteInicial?.consumoMedioMensal || 0);
  const [taxaDesconto, setTaxaDesconto] = useState(config.taxaDescontoPadrao);
  const [taxasFixas, setTaxasFixas] = useState(config.taxasFixasPadrao);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setTaxaDesconto(config.taxaDescontoPadrao);
    setTaxasFixas(config.taxasFixasPadrao);
  }, [config.taxaDescontoPadrao, config.taxasFixasPadrao]);

  const resultado = useMemo(() => {
    const sim = calcularSimulacao(valorFatura, taxasFixas, taxaDesconto);
    return { ...sim, comissao: calcularComissao(sim.descontoReais, config.taxaComissao) };
  }, [valorFatura, taxasFixas, taxaDesconto, config.taxaComissao]);

  const handleClienteSelect = (id: string) => {
    const c = clientes.find(cl => cl.id === id);
    if (c) {
      setClienteId(c.id);
      setNomeCliente(c.nomeCompleto);
      setTelefone(c.telefone);
      setDistribuidora(c.distribuidora);
      setValorFatura(c.valorMedioConta);
      setConsumoMedio(c.consumoMedioMensal);
    }
  };

  const handleSalvarSimulacao = async () => {
    if (!nomeCliente || valorFatura <= 0) {
      toast.error('Preencha os campos obrigatórios');
      return null;
    }
    setSalvando(true);
    try {
      const sim = await adicionarSimulacao({
        clienteId, nomeCliente, distribuidora, valorFatura, consumoMedio,
        taxaDesconto, taxasFixas,
        baseDesconto: resultado.baseDesconto,
        descontoReais: resultado.descontoReais,
        valorFinal: resultado.valorFinal,
        economiaMensal: resultado.economiaMensal,
        economiaAnual: resultado.economiaAnual,
        percentualEconomia: resultado.percentualEconomia,
      });
      toast.success('Simulação salva com sucesso!');
      return sim;
    } finally {
      setSalvando(false);
    }
  };

  const handleGerarProposta = async () => {
    const sim = await handleSalvarSimulacao();
    if (!sim) return;
    setSalvando(true);
    try {
      await adicionarProposta({
        simulacaoId: sim.id, clienteId, nomeCliente, distribuidora,
        valorAtual: valorFatura, descontoAplicado: resultado.descontoReais,
        taxaDesconto, economiaMensal: resultado.economiaMensal,
        economiaAnual: resultado.economiaAnual, valorFinal: resultado.valorFinal,
        resumoComercial: `Proposta de energia por assinatura com ${taxaDesconto}% de desconto para ${nomeCliente}. Economia mensal de ${formatarMoeda(resultado.economiaMensal)}.`,
        status: 'gerada',
      });
      toast.success('Proposta gerada com sucesso!');
      navigate('/propostas');
    } finally {
      setSalvando(false);
    }
  };

  const cards = [
    { label: 'Valor Original', value: formatarMoeda(valorFatura), icon: <DollarSign className="h-5 w-5" />, color: 'text-foreground' },
    { label: 'Base de Desconto', value: formatarMoeda(resultado.baseDesconto), icon: <TrendingDown className="h-5 w-5" />, color: 'text-muted-foreground' },
    { label: 'Taxa de Desconto', value: formatarPercentual(taxaDesconto), icon: <Percent className="h-5 w-5" />, color: 'text-primary' },
    { label: 'Desconto em R$', value: formatarMoeda(resultado.descontoReais), icon: <TrendingDown className="h-5 w-5" />, color: 'text-primary' },
    { label: 'Valor Final', value: formatarMoeda(resultado.valorFinal), icon: <Zap className="h-5 w-5" />, color: 'text-foreground' },
    { label: 'Economia Mensal', value: formatarMoeda(resultado.economiaMensal), icon: <TrendingUp className="h-5 w-5" />, color: 'text-primary' },
    { label: 'Economia Anual', value: formatarMoeda(resultado.economiaAnual), icon: <TrendingUp className="h-5 w-5" />, color: 'text-primary' },
    { label: `Comissão (${config.taxaComissao}%)`, value: formatarMoeda(resultado.comissao), icon: <DollarSign className="h-5 w-5" />, color: 'text-primary' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Simulador de Energia" description="Calcule a economia com energia por assinatura" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
          <h3 className="font-semibold flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" /> Dados da Simulação
          </h3>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Cliente Cadastrado</label>
              <Select value={clienteId} onValueChange={handleClienteSelect}>
                <SelectTrigger><SelectValue placeholder="Selecione um cliente (opcional)" /></SelectTrigger>
                <SelectContent>
                  {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nomeCompleto}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Nome do Cliente *</label>
              <Input value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Telefone</label>
              <Input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Distribuidora</label>
              <Input value={distribuidora} onChange={e => setDistribuidora(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Valor da Fatura (R$) *</label>
                <Input type="number" value={valorFatura || ''} onChange={e => setValorFatura(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Consumo Médio (kWh)</label>
                <Input type="number" value={consumoMedio || ''} onChange={e => setConsumoMedio(Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Taxa de Desconto (%)</label>
                <Input type="number" value={taxaDesconto || ''} onChange={e => setTaxaDesconto(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Taxas Fixas (R$)</label>
                <Input type="number" value={taxasFixas || ''} onChange={e => setTaxasFixas(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSalvarSimulacao} variant="outline" className="flex-1" disabled={salvando}>
              Salvar Simulação
            </Button>
            <Button onClick={handleGerarProposta} className="flex-1 gradient-energy border-0 text-primary-foreground" disabled={salvando}>
              <FileText className="h-4 w-4 mr-2" /> Gerar Proposta
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl gradient-energy p-6 text-primary-foreground shadow-glow">
            <p className="text-sm opacity-90">Economia Real</p>
            <p className="text-4xl font-bold mt-1">{formatarPercentual(resultado.percentualEconomia)}</p>
            <p className="text-sm opacity-80 mt-1">de economia na conta de energia</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cards.map((card) => (
              <div key={card.label} className="rounded-xl border bg-card p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className={`text-lg font-bold mt-0.5 ${card.color}`}>{card.value}</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">{card.icon}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
