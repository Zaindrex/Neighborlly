
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useActiveUsers = () => {
  const [registeredUsersCount, setRegisteredUsersCount] = useState(0);

  useEffect(() => {
    const fetchRegisteredUsers = async () => {
      try {
        // Get total count of registered users from profiles table
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.error('Error fetching registered users:', error);
          return;
        }

        setRegisteredUsersCount(count || 0);
      } catch (error) {
        console.error('Error in fetchRegisteredUsers:', error);
      }
    };

    fetchRegisteredUsers();

    // Update every 5 minutes
    const interval = setInterval(fetchRegisteredUsers, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return registeredUsersCount;
};
