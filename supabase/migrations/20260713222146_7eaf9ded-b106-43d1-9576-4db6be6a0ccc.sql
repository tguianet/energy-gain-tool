
CREATE POLICY "Users upload own contas"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'contas-energia' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users read own contas"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'contas-energia' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin')));

CREATE POLICY "Users delete own contas"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'contas-energia' AND (storage.foldername(name))[1] = auth.uid()::text);
