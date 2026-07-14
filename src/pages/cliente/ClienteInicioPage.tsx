import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, MessageCircle, TrendingUp, User, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { linkWhatsApp } from '@/utils/phone';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatarMoeda } from '@/utils/energyCalculations';

export default function ClienteInicioPage() {
  const { user } = useAuth();
  const [nome, setNome] = useState('');
  const [ultimaEconomia, setUltimaEconomia] = useState<number | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data: profile } = await supabase
        .from('profiles').select('nome_completo').eq('id', user.id).maybeSingle();
      if (profile?.nome_completo) setNome(profile.nome_completo);

      const { data: sims } = await supabase
        .from('simulacoes')
        .select('economia_mensal')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (sims && sims.length > 0) {
        setUltimaEconomia(Number(sims[0].economia_mensal));
        setTotal(sims.length);
      }
    })();
  }, [user]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="rounded-2xl gradient-energy p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold">Olá, {nome || 'bem-vindo'}!</h1>
        <p className="opacity-90 mt-1">Que bom ter você na EnergiaSub. Simule quanto você pode economizar.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Última economia mensal estimada</span>
          </div>
          <p className="text-2xl font-bold text-primary">
            {ultimaEconomia !== null ? formatarMoeda(ultimaEconomia) : '—'}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Zap className="h-4 w-4" />
            <span className="text-sm">Simulações realizadas</span>
          </div>
          <p className="text-2xl font-bold">{total}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/app/minha-simulacao">
          <Button className="w-full h-auto py-4 gradient-energy border-0 text-primary-foreground flex items-center justify-start gap-3">
            <Calculator className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Nova simulação</div>
              <div className="text-xs opacity-90">Calcule sua economia</div>
            </div>
          </Button>
        </Link>
        <Link to="/app/meu-cadastro">
          <Button variant="outline" className="w-full h-auto py-4 flex items-center justify-start gap-3">
            <User className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Meu cadastro</div>
              <div className="text-xs text-muted-foreground">Atualizar meus dados</div>
            </div>
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-card flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold">Dúvidas? Fale com nosso representante</p>
          <p className="text-sm text-muted-foreground">Tiago Gonçalves · (17) 99143-1999</p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <a href={linkWhatsApp('17991431999', 'Olá, Tiago! Gostaria de tirar uma dúvida sobre a EnergiaSub.')} target="_blank" rel="noreferrer">
            <MessageCircle className="h-4 w-4 mr-2 text-green-600" /> WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}