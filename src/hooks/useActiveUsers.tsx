
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useActiveUsers = () => {
  const [activeUsersCount, setActiveUsersCount] = useState(0);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        // Get users who have been active in the last 24 hours
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const { data: activeProfiles, error } = await supabase
          .from('profiles')
          .select('id')
          .gte('updated_at', twentyFourHoursAgo.toISOString());

        if (error) {
          console.error('Error fetching active users:', error);
          return;
        }

        setActiveUsersCount(activeProfiles?.length || 0);
      } catch (error) {
        console.error('Error in fetchActiveUsers:', error);
      }
    };

    fetchActiveUsers();

    // Update every 5 minutes
    const interval = setInterval(fetchActiveUsers, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return activeUsersCount;
};
