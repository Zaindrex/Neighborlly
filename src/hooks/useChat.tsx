
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Service } from '@/hooks/useServices';

interface Chat {
  chatId: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
}

export const useChat = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const { user } = useAuth();

  const handleChatClick = async (service: Service) => {
    if (!user) return;
    
    try {
      // First get the service details
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', service.id)
        .single();

      if (serviceError) {
        console.error('Error fetching service:', serviceError);
        return;
      }

      // Then get the profile for the service owner
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('user_id', serviceData.user_id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      // Create or get existing chat
      let chatId: string;
      
      // Check if chat already exists between these users
      const { data: existingChat, error: chatError } = await supabase
        .from('chats')
        .select('id')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${serviceData.user_id}),and(participant_1.eq.${serviceData.user_id},participant_2.eq.${user.id})`)
        .maybeSingle();

      if (chatError) {
        console.error('Error checking for existing chat:', chatError);
        return;
      }

      if (existingChat) {
        chatId = existingChat.id;
      } else {
        // Create new chat
        const { data: newChat, error: createChatError } = await supabase
          .from('chats')
          .insert({
            participant_1: user.id,
            participant_2: serviceData.user_id,
          })
          .select('id')
          .single();

        if (createChatError) {
          console.error('Error creating chat:', createChatError);
          return;
        }

        chatId = newChat.id;
      }

      // Set the selected chat with proper profile data
      setSelectedChat({
        chatId,
        recipientId: serviceData.user_id,
        recipientName: profileData?.name || 'Unknown User',
        recipientAvatar: profileData?.avatar_url || undefined,
      });
    } catch (error) {
      console.error('Error in handleChatClick:', error);
    }
  };

  const closeChat = () => {
    setSelectedChat(null);
  };

  return {
    selectedChat,
    handleChatClick,
    closeChat,
  };
};
