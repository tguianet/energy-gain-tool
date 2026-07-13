
ALTER TABLE public.simulacoes
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'rascunho',
  ADD COLUMN IF NOT EXISTS codigo_solicitacao text,
  ADD COLUMN IF NOT EXISTS conta_energia_url text;

CREATE SEQUENCE IF NOT EXISTS public.simulacao_codigo_seq START 1000;

CREATE OR REPLACE FUNCTION public.gerar_codigo_solicitacao()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.codigo_solicitacao IS NULL THEN
    NEW.codigo_solicitacao := 'SIM-' || to_char(now(),'YYYYMM') || '-' || lpad(nextval('public.simulacao_codigo_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_gerar_codigo_solicitacao ON public.simulacoes;
CREATE TRIGGER trg_gerar_codigo_solicitacao
  BEFORE INSERT ON public.simulacoes
  FOR EACH ROW EXECUTE FUNCTION public.gerar_codigo_solicitacao();
