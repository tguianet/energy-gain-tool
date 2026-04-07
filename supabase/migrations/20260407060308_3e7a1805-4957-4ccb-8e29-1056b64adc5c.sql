
DROP POLICY "Qualquer pessoa pode criar lead" ON public.leads_simulacao;

CREATE POLICY "Qualquer pessoa pode criar lead" ON public.leads_simulacao
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
