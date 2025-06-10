
-- Create the services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  price TEXT NOT NULL,
  price_type TEXT NOT NULL DEFAULT 'hourly',
  latitude DECIMAL,
  longitude DECIMAL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policies for services
CREATE POLICY "Users can view all services" 
  ON public.services 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own services" 
  ON public.services 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services" 
  ON public.services 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own services" 
  ON public.services 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
