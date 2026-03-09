-- Add metadata column to gyms table for storing location and other settings
ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add index for faster metadata queries
CREATE INDEX IF NOT EXISTS idx_gyms_metadata ON public.gyms USING gin(metadata);

-- Add comment
COMMENT ON COLUMN public.gyms.metadata IS 'Stores gym settings like location coordinates, radius, and other configuration';
