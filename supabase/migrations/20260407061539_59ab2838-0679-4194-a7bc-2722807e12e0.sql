
DROP POLICY "Autenticados podem ver leads" ON public.leads_simulacao;

CREATE POLICY "Todos podem ver leads" ON public.leads_simulacao
  FOR SELECT USING (true);

DROP POLICY "Autenticados podem atualizar leads" ON public.leads_simulacao;

CREATE POLICY "Todos podem atualizar leads" ON public.leads_simulacao
  FOR UPDATE USING (true);
