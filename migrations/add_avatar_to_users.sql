-- Add avatar column to users table
-- This will allow users to store their profile picture/avatar

-- Add avatar column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'avatar'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN avatar TEXT;
    END IF;
END $$;

-- Show the table structure after adding the column
SELECT 
    'Avatar column added successfully. Current users table structure:' as message;

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
