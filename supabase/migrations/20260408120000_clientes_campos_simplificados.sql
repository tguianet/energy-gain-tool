-- Campos simplificados para cadastro de clientes
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS whatsapp TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS foto_conta_energia_url TEXT,
  ADD COLUMN IF NOT EXISTS foto_cnh_url TEXT;

ALTER TABLE public.clientes ALTER COLUMN cpf_cnpj SET DEFAULT '';
