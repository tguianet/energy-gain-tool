import { useState } from 'react';
import { Save, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/PageHeader';
import { toast } from 'sonner';

export default function ConfiguracoesPage() {
  const [nomeEmpresa, setNomeEmpresa] = useState('EnergiaSub');
  const [taxaPadrao, setTaxaPadrao] = useState('15');
  const [taxasFixasPadrao, setTaxasFixasPadrao] = useState('50');

  const handleSave = () => {
    toast.success('Configurações salvas com sucesso!');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Personalize o sistema" />

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
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Taxas Fixas Padrão (R$)</label>
              <Input type="number" value={taxasFixasPadrao} onChange={e => setTaxasFixasPadrao(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleSave} className="gradient-energy border-0 text-primary-foreground">
            <Save className="h-4 w-4 mr-2" /> Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
}
