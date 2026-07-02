-- Corrigir RLS de leads (reverter policies abertas)
DROP POLICY IF EXISTS "Todos podem ver leads" ON public.leads_simulacao;
DROP POLICY IF EXISTS "Todos podem atualizar leads" ON public.leads_simulacao;

CREATE POLICY "Autenticados podem ver leads" ON public.leads_simulacao
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Autenticados podem atualizar leads" ON public.leads_simulacao
  FOR UPDATE TO authenticated USING (true);

-- Clientes
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT DEFAULT '',
  cpf_cnpj TEXT NOT NULL,
  tipo_cliente TEXT NOT NULL DEFAULT 'residencial',
  distribuidora TEXT DEFAULT '',
  cidade TEXT DEFAULT '',
  estado TEXT DEFAULT '',
  endereco TEXT DEFAULT '',
  unidade_consumidora TEXT DEFAULT '',
  consumo_medio_mensal NUMERIC DEFAULT 0,
  valor_medio_conta NUMERIC DEFAULT 0,
  observacoes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'prospecto',
  lead_id UUID REFERENCES public.leads_simulacao(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios gerenciam seus clientes" ON public.clientes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Simulações
CREATE TABLE IF NOT EXISTS public.simulacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  nome_cliente TEXT NOT NULL,
  distribuidora TEXT DEFAULT '',
  valor_fatura NUMERIC NOT NULL,
  consumo_medio NUMERIC DEFAULT 0,
  taxa_desconto NUMERIC NOT NULL,
  taxas_fixas NUMERIC NOT NULL DEFAULT 50,
  base_desconto NUMERIC NOT NULL,
  desconto_reais NUMERIC NOT NULL,
  valor_final NUMERIC NOT NULL,
  economia_mensal NUMERIC NOT NULL,
  economia_anual NUMERIC NOT NULL,
  percentual_economia NUMERIC NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.simulacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios gerenciam suas simulacoes" ON public.simulacoes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Propostas
CREATE TABLE IF NOT EXISTS public.propostas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  simulacao_id UUID REFERENCES public.simulacoes(id) ON DELETE SET NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  nome_cliente TEXT NOT NULL,
  distribuidora TEXT DEFAULT '',
  valor_atual NUMERIC NOT NULL,
  desconto_aplicado NUMERIC NOT NULL,
  taxa_desconto NUMERIC NOT NULL,
  economia_mensal NUMERIC NOT NULL,
  economia_anual NUMERIC NOT NULL,
  valor_final NUMERIC NOT NULL,
  resumo_comercial TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'gerada',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.propostas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios gerenciam suas propostas" ON public.propostas
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Contratos
CREATE TABLE IF NOT EXISTS public.contratos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  proposta_id UUID REFERENCES public.propostas(id) ON DELETE SET NULL,
  nome_cliente TEXT NOT NULL,
  distribuidora TEXT DEFAULT '',
  data_adesao DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pendente',
  desconto_contratado NUMERIC NOT NULL,
  taxa_desconto NUMERIC NOT NULL,
  valor_original NUMERIC NOT NULL,
  valor_final NUMERIC NOT NULL,
  observacoes TEXT DEFAULT '',
  historico JSONB NOT NULL DEFAULT '[]'::jsonb,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios gerenciam seus contratos" ON public.contratos
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Configurações por usuário
CREATE TABLE IF NOT EXISTS public.configuracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nome_empresa TEXT NOT NULL DEFAULT 'EnergiaSub',
  taxa_desconto_padrao NUMERIC NOT NULL DEFAULT 15,
  taxas_fixas_padrao NUMERIC NOT NULL DEFAULT 50,
  taxa_comissao NUMERIC NOT NULL DEFAULT 3,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios gerenciam suas configuracoes" ON public.configuracoes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Config pública (taxas para simulação pública — leitura anônima)
CREATE TABLE IF NOT EXISTS public.configuracoes_publicas (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  taxa_desconto_padrao NUMERIC NOT NULL DEFAULT 15,
  taxas_fixas_padrao NUMERIC NOT NULL DEFAULT 50,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.configuracoes_publicas (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.configuracoes_publicas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode ler config publica" ON public.configuracoes_publicas
  FOR SELECT USING (true);

CREATE POLICY "Autenticados atualizam config publica" ON public.configuracoes_publicas
  FOR UPDATE TO authenticated USING (true);
