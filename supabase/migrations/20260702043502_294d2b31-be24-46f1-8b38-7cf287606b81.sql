-- Restrict has_role execution (fix security warning)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Enum for cliente types & statuses
CREATE TYPE public.tipo_cliente AS ENUM ('residencial', 'comercial', 'rural');
CREATE TYPE public.status_cliente AS ENUM ('ativo', 'inativo', 'prospecto');
CREATE TYPE public.status_proposta AS ENUM ('gerada', 'enviada', 'aceita', 'recusada');
CREATE TYPE public.status_contrato AS ENUM ('ativo', 'pendente', 'cancelado');

-- CLIENTES
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  cpf_cnpj TEXT NOT NULL,
  tipo_cliente TEXT NOT NULL DEFAULT 'residencial',
  distribuidora TEXT,
  cidade TEXT,
  estado TEXT,
  endereco TEXT,
  unidade_consumidora TEXT,
  consumo_medio_mensal NUMERIC NOT NULL DEFAULT 0,
  valor_medio_conta NUMERIC NOT NULL DEFAULT 0,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'prospecto',
  lead_id UUID REFERENCES public.leads_simulacao(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientes TO authenticated;
GRANT ALL ON public.clientes TO service_role;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins gerenciam clientes" ON public.clientes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- SIMULAÇÕES
CREATE TABLE public.simulacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  nome_cliente TEXT NOT NULL,
  distribuidora TEXT,
  valor_fatura NUMERIC NOT NULL,
  consumo_medio NUMERIC NOT NULL DEFAULT 0,
  taxa_desconto NUMERIC NOT NULL,
  taxas_fixas NUMERIC NOT NULL DEFAULT 0,
  base_desconto NUMERIC NOT NULL,
  desconto_reais NUMERIC NOT NULL,
  valor_final NUMERIC NOT NULL,
  economia_mensal NUMERIC NOT NULL,
  economia_anual NUMERIC NOT NULL,
  percentual_economia NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.simulacoes TO authenticated;
GRANT ALL ON public.simulacoes TO service_role;
ALTER TABLE public.simulacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins gerenciam simulacoes" ON public.simulacoes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PROPOSTAS
CREATE TABLE public.propostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulacao_id UUID REFERENCES public.simulacoes(id) ON DELETE SET NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  nome_cliente TEXT NOT NULL,
  distribuidora TEXT,
  valor_atual NUMERIC NOT NULL,
  desconto_aplicado NUMERIC NOT NULL,
  taxa_desconto NUMERIC NOT NULL,
  economia_mensal NUMERIC NOT NULL,
  economia_anual NUMERIC NOT NULL,
  valor_final NUMERIC NOT NULL,
  resumo_comercial TEXT,
  status TEXT NOT NULL DEFAULT 'gerada',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.propostas TO authenticated;
GRANT ALL ON public.propostas TO service_role;
ALTER TABLE public.propostas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins gerenciam propostas" ON public.propostas FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CONTRATOS
CREATE TABLE public.contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  proposta_id UUID REFERENCES public.propostas(id) ON DELETE SET NULL,
  nome_cliente TEXT NOT NULL,
  distribuidora TEXT,
  data_adesao DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pendente',
  desconto_contratado NUMERIC NOT NULL,
  taxa_desconto NUMERIC NOT NULL,
  valor_original NUMERIC NOT NULL,
  valor_final NUMERIC NOT NULL,
  observacoes TEXT,
  historico JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contratos TO authenticated;
GRANT ALL ON public.contratos TO service_role;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins gerenciam contratos" ON public.contratos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CONFIGURACOES (internal admin)
CREATE TABLE public.configuracoes (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  nome_empresa TEXT NOT NULL DEFAULT 'EnergiaSub',
  taxa_desconto_padrao NUMERIC NOT NULL DEFAULT 18,
  taxas_fixas_padrao NUMERIC NOT NULL DEFAULT 50,
  taxa_comissao NUMERIC NOT NULL DEFAULT 3,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.configuracoes (id) VALUES (1);
GRANT SELECT, INSERT, UPDATE ON public.configuracoes TO authenticated;
GRANT ALL ON public.configuracoes TO service_role;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins veem configuracoes" ON public.configuracoes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins atualizam configuracoes" ON public.configuracoes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CONFIGURAÇÕES PÚBLICAS (visible on /simular without login)
CREATE TABLE public.configuracoes_publicas (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  taxa_desconto_padrao NUMERIC NOT NULL DEFAULT 18,
  taxas_fixas_padrao NUMERIC NOT NULL DEFAULT 50,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.configuracoes_publicas (id) VALUES (1);
GRANT SELECT ON public.configuracoes_publicas TO anon, authenticated;
GRANT ALL ON public.configuracoes_publicas TO service_role;
ALTER TABLE public.configuracoes_publicas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos podem ver config publica" ON public.configuracoes_publicas FOR SELECT
  USING (true);
CREATE POLICY "Admins atualizam config publica" ON public.configuracoes_publicas FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- Create admin user tiagotguianet@gmail.com
-- =========================================
DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tiagotguianet@gmail.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      'tiagotguianet@gmail.com',
      crypt('yasmin', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      false,
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', 'tiagotguianet@gmail.com', 'email_verified', true),
      'email',
      new_user_id::text,
      now(),
      now(),
      now()
    );

    INSERT INTO public.user_roles (user_id, role) VALUES (new_user_id, 'admin');
  ELSE
    -- Ensure existing user has admin role
    INSERT INTO public.user_roles (user_id, role)
    SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = 'tiagotguianet@gmail.com'
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;