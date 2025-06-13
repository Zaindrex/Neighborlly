
import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MoreVertical, ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMessages } from '@/hooks/useMessages';
import { supabase } from '@/integrations/supabase/client';

interface ChatWindowProps {
  chatId: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  onBack: () => void;
  onDeleteChat?: (chatId: string) => void;
}

const ChatWindow = ({ 
  chatId, 
  recipientId, 
  recipientName, 
  recipientAvatar, 
  onBack, 
  onDeleteChat 
}: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { messages, loading, sending, sendMessage, markAsRead } = useMessages(chatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll when new messages arrive
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages]);

  useEffect(() => {
    // Get current user ID
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    // Validate recipient before sending
    if (!recipientId) {
      console.error('No recipient ID provided');
      return;
    }

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX
    
    const success = await sendMessage(messageContent, recipientId);
    
    // If message failed to send, restore the message content
    if (!success) {
      setNewMessage(messageContent);
    }
    
    // Focus back on input
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteChat = () => {
    if (onDeleteChat) {
      onDeleteChat(chatId);
      onBack();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Mock online status - would come from real-time presence in production
  const isOnline = Math.random() > 0.5;

  if (loading && messages.length === 0) {
    return (
      <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg h-[600px] flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-lg">Loading messages...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg h-[600px] flex flex-col">
      <CardHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4" />
              <span className="ml-1 hidden sm:inline">Back to chats</span>
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarImage src={recipientAvatar} />
              <AvatarFallback>{recipientName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{recipientName}</CardTitle>
              <p className={`text-sm ${isOnline ? 'text-green-500' : 'text-gray-500'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-xl">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleDeleteChat} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex flex-col max-w-xs lg:max-w-md">
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-gradient-neighborlly text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                  </div>
                  <div className={`flex items-center mt-1 space-x-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <p className="text-xs text-gray-500">
                      {formatTime(message.created_at)}
                    </p>
                    {isOwn && (
                      <span className="text-xs text-gray-500" title={message.is_read ? 'Read' : 'Delivered'}>
                        {message.is_read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 rounded-2xl"
            disabled={sending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-gradient-neighborlly hover:opacity-90 rounded-2xl min-w-[44px]"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        {sending && (
          <p className="text-xs text-gray-500 mt-1 text-center">Sending message...</p>
        )}
      </div>
    </Card>
  );
};

export default ChatWindow;
