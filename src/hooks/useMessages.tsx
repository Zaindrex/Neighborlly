
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Message } from './useChats';

export const useMessages = (chatId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      console.log('Fetched messages:', data);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [chatId, toast]);

  const sendMessage = async (content: string, recipientId: string, retryCount = 0) => {
    if (!chatId || !content.trim() || sending) return false;

    setSending(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      console.log('Sending message:', { chatId, content, recipientId, senderId: user.id });

      // First verify the recipient exists in profiles table
      const { data: recipientProfile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', recipientId)
        .single();

      if (profileError || !recipientProfile) {
        console.error('Recipient profile not found:', profileError);
        throw new Error('Recipient not found');
      }

      // Insert the message
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            chat_id: chatId,
            sender_id: user.id,
            recipient_id: recipientId,
            content: content.trim()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      console.log('Message sent successfully:', data);

      // Update chat last_message_at
      const { error: chatUpdateError } = await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', chatId);

      if (chatUpdateError) {
        console.warn('Failed to update chat timestamp:', chatUpdateError);
      }

      // Add message to local state immediately for better UX
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === data.id);
        if (exists) return prev;
        return [...prev, data];
      });

      return true;
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Retry logic - attempt up to 2 retries
      if (retryCount < 2) {
        console.log(`Retrying message send, attempt ${retryCount + 1}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Progressive delay
        return sendMessage(content, recipientId, retryCount + 1);
      }
      
      toast({
        title: "Error",
        description: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageIds: string[]) => {
    if (messageIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', messageIds);

      if (error) throw error;

      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!chatId) return;

    console.log('Setting up real-time subscription for chat:', chatId);

    const channel = supabase
      .channel(`messages-${chatId}`, {
        config: {
          broadcast: { self: true }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          console.log('New message received via subscription:', payload);
          const newMessage = payload.new as Message;
          setMessages(prev => {
            // Check if message already exists to prevent duplicates
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) {
              console.log('Message already exists, skipping duplicate');
              return prev;
            }
            console.log('Adding new message to state');
            return [...prev, newMessage];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          console.log('Message updated via subscription:', payload);
          const updatedMessage = payload.new as Message;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      )
      .subscribe((status, err) => {
        console.log('Real-time subscription status:', status, err);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to messages channel');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel error:', err);
          // Try to resubscribe after a delay
          setTimeout(() => {
            console.log('Attempting to resubscribe...');
            channel.unsubscribe();
            // The useEffect will recreate the subscription
          }, 2000);
        }
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      channel.unsubscribe();
    };
  }, [chatId]);

  return {
    messages,
    loading,
    sending,
    sendMessage,
    markAsRead,
    refreshMessages: fetchMessages
  };
};
