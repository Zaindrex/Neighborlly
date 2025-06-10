
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: string;
  price_type: string;
  user_id: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  created_at: string;
  profiles?: {
    name: string;
    rating: number;
    avatar_url?: string;
  };
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      // First fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (servicesError) {
        throw servicesError;
      }

      // Then fetch profiles for each service
      const servicesWithProfiles = await Promise.all(
        (servicesData || []).map(async (service) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, rating, avatar_url')
            .eq('user_id', service.user_id)
            .single();

          return {
            ...service,
            profiles: profileData ? {
              name: profileData.name,
              rating: profileData.rating || 0,
              avatar_url: profileData.avatar_url
            } : undefined
          };
        })
      );

      setServices(servicesWithProfiles);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
      toast({
        title: "Error",
        description: "Failed to load services. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const refreshServices = () => {
    fetchServices();
  };

  return {
    services,
    loading,
    error,
    refreshServices,
  };
};
