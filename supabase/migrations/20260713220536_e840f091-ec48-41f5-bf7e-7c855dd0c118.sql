
-- 1. profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo text NOT NULL,
  telefone text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  cpf_cnpj text NOT NULL DEFAULT '',
  cidade text NOT NULL DEFAULT '',
  estado text NOT NULL DEFAULT '',
  tipo_cliente text NOT NULL DEFAULT 'residencial' CHECK (tipo_cliente IN ('residencial','empresarial')),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. add user_id to simulacoes
ALTER TABLE public.simulacoes ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX simulacoes_user_id_idx ON public.simulacoes(user_id);

CREATE POLICY "Users manage own simulacoes"
  ON public.simulacoes FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. handle_new_user trigger — creates profile, role and cliente row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nome text := COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email);
  v_telefone text := COALESCE(NEW.raw_user_meta_data->>'telefone', '');
  v_whatsapp text := COALESCE(NEW.raw_user_meta_data->>'whatsapp', v_telefone);
  v_cpf text := COALESCE(NEW.raw_user_meta_data->>'cpf_cnpj', '');
  v_cidade text := COALESCE(NEW.raw_user_meta_data->>'cidade', '');
  v_estado text := COALESCE(NEW.raw_user_meta_data->>'estado', '');
  v_tipo text := COALESCE(NEW.raw_user_meta_data->>'tipo_cliente', 'residencial');
  v_is_public_signup boolean := COALESCE((NEW.raw_user_meta_data->>'public_signup')::boolean, false);
  v_cliente_id uuid;
BEGIN
  -- Only auto-create cliente records for public signups (not admin-created users)
  IF v_is_public_signup THEN
    INSERT INTO public.clientes (
      nome_completo, telefone, email, cpf_cnpj, tipo_cliente,
      cidade, estado, status
    ) VALUES (
      v_nome, v_telefone, NEW.email, v_cpf, v_tipo,
      v_cidade, v_estado, 'prospecto'
    )
    RETURNING id INTO v_cliente_id;

    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;

  INSERT INTO public.profiles (
    id, nome_completo, telefone, whatsapp, email, cpf_cnpj,
    cidade, estado, tipo_cliente, cliente_id
  ) VALUES (
    NEW.id, v_nome, v_telefone, v_whatsapp, NEW.email, v_cpf,
    v_cidade, v_estado,
    CASE WHEN v_tipo IN ('residencial','empresarial') THEN v_tipo ELSE 'residencial' END,
    v_cliente_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Backfill profile for existing admin user (idempotent)
INSERT INTO public.profiles (id, nome_completo, email)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'nome_completo', u.email), u.email
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
