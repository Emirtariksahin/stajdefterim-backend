-- Populate public.users table from auth.users
-- This will sync user data from Supabase Auth to our public users table

INSERT INTO public.users (id, email, name, created_at, updated_at)
SELECT 
  auth.uid as id,
  auth.email,
  COALESCE(
    auth.raw_user_meta_data->>'name',
    auth.raw_user_meta_data->>'full_name', 
    SPLIT_PART(auth.email, '@', 1)
  ) as name,
  auth.created_at,
  NOW() as updated_at
FROM auth.users auth
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pub WHERE pub.id = auth.uid
);

-- Show the results
SELECT 'Users synced successfully. Total users:' as message, COUNT(*) as count 
FROM public.users;
