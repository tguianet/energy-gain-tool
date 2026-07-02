import { useState, useEffect } from 'react';
import { Save, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/PageHeader';
import { useData } from '@/contexts/DataContext';

export default function ConfiguracoesPage() {
  const { config, salvarConfig } = useData();
  const [nomeEmpresa, setNomeEmpresa] = useState(config.nomeEmpresa);
  const [taxaPadrao, setTaxaPadrao] = useState(String(config.taxaDescontoPadrao));
  const [taxasFixasPadrao, setTaxasFixasPadrao] = useState(String(config.taxasFixasPadrao));
  const [taxaComissao, setTaxaComissao] = useState(String(config.taxaComissao));
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setNomeEmpresa(config.nomeEmpresa);
    setTaxaPadrao(String(config.taxaDescontoPadrao));
    setTaxasFixasPadrao(String(config.taxasFixasPadrao));
    setTaxaComissao(String(config.taxaComissao));
  }, [config]);

  const handleSave = async () => {
    setSalvando(true);
    try {
      await salvarConfig({
        nomeEmpresa,
        taxaDescontoPadrao: Number(taxaPadrao) || 15,
        taxasFixasPadrao: Number(taxasFixasPadrao) || 50,
        taxaComissao: Number(taxaComissao) || 3,
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Personalize o sistema e defina taxas padrão para simulador e link público" />

      <div className="max-w-xl space-y-6">
        <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
          <h3 className="font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" /> Configurações Gerais
          </h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nome da Empresa</label>
              <Input value={nomeEmpresa} onChange={e => setNomeEmpresa(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Taxa de Desconto Padrão (%)</label>
              <Input type="number" value={taxaPadrao} onChange={e => setTaxaPadrao(e.target.value)} />
              <p className="text-xs text-muted-foreground">Usada no simulador interno e no link público /simular</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Taxas Fixas Padrão (R$)</label>
              <Input type="number" value={taxasFixasPadrao} onChange={e => setTaxasFixasPadrao(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Taxa de Comissão (%)</label>
              <Input type="number" value={taxaComissao} onChange={e => setTaxaComissao(e.target.value)} />
              <p className="text-xs text-muted-foreground">Exibida apenas no painel interno</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={salvando} className="gradient-energy border-0 text-primary-foreground">
            <Save className="h-4 w-4 mr-2" /> Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
}
