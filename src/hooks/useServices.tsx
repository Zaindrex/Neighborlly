
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

      console.log('Fetching services...');

      // Check current user
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id);

      // Get services data
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Services query result:', { data: servicesData, error: servicesError });

      if (servicesError) {
        console.error('Services error:', servicesError);
        throw servicesError;
      }

      if (!servicesData || servicesData.length === 0) {
        console.log('No services found in database');
        setServices([]);
        return;
      }

      console.log('Found services:', servicesData.length);

      // Fetch profiles for each service separately
      const servicesWithProfiles = await Promise.all(
        servicesData.map(async (service) => {
          console.log('Fetching profile for user_id:', service.user_id);
          
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name, rating, avatar_url')
            .eq('user_id', service.user_id)
            .maybeSingle();

          if (profileError) {
            console.error('Profile error for user', service.user_id, ':', profileError);
          }

          console.log('Profile data for user', service.user_id, ':', profileData);

          return {
            ...service,
            profiles: profileData ? {
              name: profileData.name || 'Unknown User',
              rating: profileData.rating || 0,
              avatar_url: profileData.avatar_url
            } : {
              name: 'Unknown User',
              rating: 0,
              avatar_url: undefined
            }
          };
        })
      );

      console.log('Final services with profiles:', servicesWithProfiles);
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
