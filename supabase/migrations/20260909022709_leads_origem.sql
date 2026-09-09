
-- Rastreia a origem do lead (ex.: shopee, site, indicacao) para medir canais de aquisicao
ALTER TABLE public.leads_simulacao
  ADD COLUMN origem TEXT NOT NULL DEFAULT 'site';
