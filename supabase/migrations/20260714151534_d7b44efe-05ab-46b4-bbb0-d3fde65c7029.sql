
-- Trigger: quando cliente envia simulação, cria proposta automaticamente
CREATE OR REPLACE FUNCTION public.criar_proposta_de_simulacao()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cliente_id uuid;
BEGIN
  IF NEW.user_id IS NOT NULL AND NEW.status = 'aguardando_analise' THEN
    SELECT cliente_id INTO v_cliente_id FROM public.profiles WHERE id = NEW.user_id;

    INSERT INTO public.propostas (
      simulacao_id, cliente_id, nome_cliente, distribuidora,
      valor_atual, desconto_aplicado, taxa_desconto,
      economia_mensal, economia_anual, valor_final,
      resumo_comercial, status
    ) VALUES (
      NEW.id, v_cliente_id, NEW.nome_cliente, NEW.distribuidora,
      NEW.valor_fatura, NEW.desconto_reais, NEW.taxa_desconto,
      NEW.economia_mensal, NEW.economia_anual, NEW.valor_final,
      'Proposta gerada a partir da simulação ' || COALESCE(NEW.codigo_solicitacao, ''),
      'gerada'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_criar_proposta_de_simulacao ON public.simulacoes;
CREATE TRIGGER trg_criar_proposta_de_simulacao
AFTER INSERT ON public.simulacoes
FOR EACH ROW EXECUTE FUNCTION public.criar_proposta_de_simulacao();

-- Recriar trigger de código (foi criado só como função)
DROP TRIGGER IF EXISTS trg_gerar_codigo_solicitacao ON public.simulacoes;
CREATE TRIGGER trg_gerar_codigo_solicitacao
BEFORE INSERT ON public.simulacoes
FOR EACH ROW EXECUTE FUNCTION public.gerar_codigo_solicitacao();

-- Criar propostas retroativas para simulações existentes de clientes que ainda não têm proposta
INSERT INTO public.propostas (
  simulacao_id, cliente_id, nome_cliente, distribuidora,
  valor_atual, desconto_aplicado, taxa_desconto,
  economia_mensal, economia_anual, valor_final,
  resumo_comercial, status
)
SELECT
  s.id, p.cliente_id, s.nome_cliente, s.distribuidora,
  s.valor_fatura, s.desconto_reais, s.taxa_desconto,
  s.economia_mensal, s.economia_anual, s.valor_final,
  'Proposta gerada a partir da simulação ' || COALESCE(s.codigo_solicitacao,''),
  'gerada'
FROM public.simulacoes s
LEFT JOIN public.profiles p ON p.id = s.user_id
LEFT JOIN public.propostas pr ON pr.simulacao_id = s.id
WHERE s.user_id IS NOT NULL
  AND s.status = 'aguardando_analise'
  AND pr.id IS NULL;
