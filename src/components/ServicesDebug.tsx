
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ServicesDebug = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const runDebug = async () => {
      try {
        // Check auth status
        const { data: { user } } = await supabase.auth.getUser();
        
        // Try direct table count
        const { count: servicesCount, error: countError } = await supabase
          .from('services')
          .select('*', { count: 'exact', head: true });

        // Try fetching services
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .limit(5);

        // Try fetching profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .limit(5);

        setDebugInfo({
          user: user ? { id: user.id, email: user.email } : null,
          servicesCount,
          countError,
          services,
          servicesError,
          profiles,
          profilesError,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        setDebugInfo({ error: error.message });
      }
    };

    runDebug();
  }, []);

  return (
    <Card className="mt-4 max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Debug Information</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
};

export default ServicesDebug;
