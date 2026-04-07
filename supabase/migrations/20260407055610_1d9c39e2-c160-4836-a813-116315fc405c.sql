
CREATE TABLE public.leads_simulacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  cpf_cnpj TEXT NOT NULL,
  tipo_cliente TEXT NOT NULL DEFAULT 'residencial',
  distribuidora TEXT NOT NULL,
  cidade TEXT,
  estado TEXT,
  valor_fatura NUMERIC NOT NULL,
  consumo_medio NUMERIC,
  desconto_percentual NUMERIC NOT NULL,
  economia_mensal NUMERIC NOT NULL,
  economia_anual NUMERIC NOT NULL,
  valor_final NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'novo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leads_simulacao ENABLE ROW LEVEL SECURITY;

-- Permitir inserção pública (sem autenticação - vem do link público)
CREATE POLICY "Qualquer pessoa pode criar lead" ON public.leads_simulacao
  FOR INSERT WITH CHECK (true);

-- Apenas usuários autenticados (admin) podem visualizar
CREATE POLICY "Autenticados podem ver leads" ON public.leads_simulacao
  FOR SELECT TO authenticated USING (true);

-- Apenas autenticados podem atualizar status
CREATE POLICY "Autenticados podem atualizar leads" ON public.leads_simulacao
  FOR UPDATE TO authenticated USING (true);
