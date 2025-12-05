-- Add public_private column to labs table
-- This column stores 'public' or 'private' to control lab visibility

ALTER TABLE labs 
ADD COLUMN IF NOT EXISTS public_private TEXT DEFAULT 'public';

-- Add a comment to document the column
COMMENT ON COLUMN labs.public_private IS 'Lab visibility: public (visible to everyone) or private (admins/founders only). Defaults to public.';

-- Create an index for faster filtering
CREATE INDEX IF NOT EXISTS idx_labs_public_private ON labs(public_private);

