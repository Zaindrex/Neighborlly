
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Message } from './useChats';
import { notificationService } from '@/services/notificationService';

export const useMessages = (chatId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);
  const { toast } = useToast();

  // Get current user on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

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
    if (!chatId || !content.trim() || sending || !currentUserId) return false;

    setSending(true);
    try {
      console.log('Sending message:', { chatId, content, recipientId, senderId: currentUserId });

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
            sender_id: currentUserId,
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

      return true;
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Retry logic - attempt up to 2 retries
      if (retryCount < 2) {
        console.log(`Retrying message send, attempt ${retryCount + 1}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
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
    if (messageIds.length === 0 || !currentUserId) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', messageIds)
        .eq('recipient_id', currentUserId); // Only mark messages addressed to current user

      if (error) throw error;

      console.log('Marked messages as read:', messageIds);

      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          messageIds.includes(msg.id) && msg.recipient_id === currentUserId 
            ? { ...msg, is_read: true } 
            : msg
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Auto-mark messages as read when user views chat
  useEffect(() => {
    if (currentUserId && messages.length > 0 && chatId) {
      const unreadMessages = messages
        .filter(msg => 
          msg.recipient_id === currentUserId && 
          !msg.is_read && 
          msg.sender_id !== currentUserId
        )
        .map(msg => msg.id);
      
      if (unreadMessages.length > 0) {
        console.log('Auto-marking messages as read:', unreadMessages);
        markAsRead(unreadMessages);
      }
    }
  }, [messages, currentUserId, chatId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!chatId) return;

    // Clean up existing subscription
    if (subscriptionRef.current) {
      console.log('Cleaning up existing subscription');
      supabase.removeChannel(subscriptionRef.current);
    }

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
        async (payload) => {
          console.log('New message received via subscription:', payload);
          const newMessage = payload.new as Message;
          
          // Add message to state immediately
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) {
              console.log('Message already exists, skipping duplicate');
              return prev;
            }
            console.log('Adding new message to state');
            return [...prev, newMessage];
          });

          // Show notification if message is from someone else and user has permission
          if (newMessage.sender_id !== currentUserId && currentUserId) {
            // Get sender profile for notification
            try {
              const { data: senderProfile } = await supabase
                .from('profiles')
                .select('name')
                .eq('user_id', newMessage.sender_id)
                .single();

              const senderName = senderProfile?.name || 'Someone';
              
              // Show toast notification
              toast({
                title: `New message from ${senderName}`,
                description: newMessage.content.substring(0, 50) + (newMessage.content.length > 50 ? '...' : ''),
              });

              // Show browser notification and play sound
              await notificationService.requestPermission();
              notificationService.showNotification({
                title: 'New Message',
                body: `${senderName}: ${newMessage.content.substring(0, 100)}`,
                tag: `chat-${chatId}`
              });
              notificationService.playNotificationSound();
            } catch (error) {
              console.error('Error showing notification:', error);
            }
          }
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
            if (subscriptionRef.current) {
              supabase.removeChannel(subscriptionRef.current);
            }
            // The useEffect will recreate the subscription
          }, 2000);
        }
      });

    subscriptionRef.current = channel;

    return () => {
      console.log('Cleaning up real-time subscription');
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [chatId, currentUserId, toast]);

  return {
    messages,
    loading,
    sending,
    sendMessage,
    markAsRead,
    refreshMessages: fetchMessages
  };
};
