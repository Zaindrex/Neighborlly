
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Chat {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  created_at: string;
  other_user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  unread_count?: number;
  last_message?: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchChats = useCallback(async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        setLoading(false);
        return;
      }

      const { data: chatsData, error } = await supabase
        .from('chats')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching chats:', error);
        setLoading(false);
        return;
      }

      // Get user profiles for each chat
      const chatsWithProfiles = await Promise.all(
        (chatsData || []).map(async (chat) => {
          const otherUserId = chat.participant_1 === user.id ? chat.participant_2 : chat.participant_1;
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .eq('user_id', otherUserId)
            .single();

          // Get latest message
          const { data: latestMessage } = await supabase
            .from('messages')
            .select('content, created_at, is_read, sender_id')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Count unread messages
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chat.id)
            .eq('recipient_id', user.id)
            .eq('is_read', false);

          return {
            ...chat,
            other_user: profile ? {
              id: otherUserId,
              name: profile.name || 'Unknown User',
              avatar_url: profile.avatar_url
            } : { id: otherUserId, name: 'Unknown User' },
            unread_count: unreadCount || 0,
            last_message: latestMessage?.content || ''
          };
        })
      );

      setChats(chatsWithProfiles);
    } catch (error) {
      console.error('Error in fetchChats:', error);
      toast({
        title: "Error",
        description: "Failed to load chats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const startChat = async (recipientId: string) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Verify recipient exists
      const { data: recipientProfile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, name')
        .eq('user_id', recipientId)
        .single();

      if (profileError || !recipientProfile) {
        console.error('Recipient profile not found:', profileError);
        throw new Error('Recipient not found');
      }

      // Check if chat already exists
      const { data: existingChat } = await supabase
        .from('chats')
        .select('*')
        .or(
          `and(participant_1.eq.${user.id},participant_2.eq.${recipientId}),and(participant_1.eq.${recipientId},participant_2.eq.${user.id})`
        )
        .maybeSingle();

      if (existingChat) {
        return existingChat.id;
      }

      // Create new chat
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert([
          {
            participant_1: user.id,
            participant_2: recipientId
          }
        ])
        .select()
        .single();

      if (error) throw error;

      await fetchChats(); // Refresh chats list
      return newChat.id;
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start chat",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (error) throw error;

      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      toast({
        title: "Success",
        description: "Chat deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Set up real-time subscription for chat updates
  useEffect(() => {
    const { data: { user } } = supabase.auth.getUser();
    
    const channel = supabase
      .channel('chats-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats'
        },
        () => {
          fetchChats(); // Refresh when chats change
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchChats(); // Refresh when messages change to update last message
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchChats]);

  return {
    chats,
    loading,
    refreshChats: fetchChats,
    startChat,
    deleteChat
  };
};
