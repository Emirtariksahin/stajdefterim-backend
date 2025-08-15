-- Fix foreign key relationships for reminders table

-- Add foreign key constraint for user_id if not exists
DO $$ 
BEGIN
    -- Check if foreign key constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'reminders_user_id_fkey' 
        AND table_name = 'reminders'
    ) THEN
        -- Add foreign key constraint
        ALTER TABLE public.reminders 
        ADD CONSTRAINT reminders_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint: reminders_user_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists: reminders_user_id_fkey';
    END IF;
END $$;

-- Add foreign key constraint for internship_id if not exists
DO $$ 
BEGIN
    -- Check if foreign key constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'reminders_internship_id_fkey' 
        AND table_name = 'reminders'
    ) THEN
        -- Add foreign key constraint
        ALTER TABLE public.reminders 
        ADD CONSTRAINT reminders_internship_id_fkey 
        FOREIGN KEY (internship_id) REFERENCES public.internships(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint: reminders_internship_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists: reminders_internship_id_fkey';
    END IF;
END $$;
