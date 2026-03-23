INSERT INTO storage.buckets (id, name, public) VALUES ('prescriptions', 'prescriptions', false);

CREATE POLICY "Anyone can upload prescriptions"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'prescriptions');

CREATE POLICY "Anyone can read prescriptions"
ON storage.objects FOR SELECT
USING (bucket_id = 'prescriptions');