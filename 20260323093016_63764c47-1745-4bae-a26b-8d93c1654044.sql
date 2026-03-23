-- Drop existing storage policies and recreate with proper user-based access
DROP POLICY IF EXISTS "Anyone can upload prescriptions" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read prescriptions" ON storage.objects;

CREATE POLICY "Authenticated users can upload prescriptions"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'prescriptions' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can read own prescriptions"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'prescriptions' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow service role to read all (for edge function)
CREATE POLICY "Service role reads all prescriptions"
ON storage.objects FOR SELECT
USING (bucket_id = 'prescriptions');