-- Add email_sent columns to reminders table for scheduled email tracking
ALTER TABLE public.reminders 
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE;

-- Add comment to explain the columns
COMMENT ON COLUMN public.reminders.email_sent IS 'Whether the scheduled email has been sent for this reminder';
COMMENT ON COLUMN public.reminders.email_sent_at IS 'Timestamp when the scheduled email was sent';

-- Create index for better performance on scheduled email queries
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_email 
ON public.reminders (reminder_date, is_active, is_completed, email_sent) 
WHERE is_active = true AND is_completed = false AND email_sent = false;
