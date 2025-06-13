
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useChats, Chat } from '@/hooks/useChats';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Badge } from 'lucide-react';

const Index = () => {
  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showChatList, setShowChatList] = useState(true);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  
  const { chats, loading, refreshChats, deleteChat } = useChats();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Calculate total unread messages
  useEffect(() => {
    const totalUnread = chats.reduce((sum, chat) => sum + (chat.unread_count || 0), 0);
    setTotalUnreadCount(totalUnread);
  }, [chats]);

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    setShowChatList(false);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
    setShowChatList(true);
    refreshChats(); // Refresh to update unread counts
  };

  const handleDeleteChat = async (chatId: string) => {
    await deleteChat(chatId);
    if (selectedChat?.id === chatId) {
      handleBackToList();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neighborlly-purple/20 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-neighborlly-purple">
              Welcome to Neighborlly
            </CardTitle>
            <p className="text-gray-600">Please sign in to start chatting with your neighbors</p>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => window.location.href = '/auth'}
              className="bg-gradient-neighborlly hover:opacity-90"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedChat && !showChatList) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neighborlly-purple/20 to-white p-4">
        <ChatWindow
          chatId={selectedChat.id}
          recipientId={selectedChat.other_user?.id || ''}
          recipientName={selectedChat.other_user?.name || 'Unknown User'}
          recipientAvatar={selectedChat.other_user?.avatar_url}
          onBack={handleBackToList}
          onDeleteChat={handleDeleteChat}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neighborlly-purple/20 to-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <MessageCircle className="w-8 h-8 text-neighborlly-purple" />
            <h1 className="text-3xl font-bold text-neighborlly-purple">Neighborlly Chat</h1>
            {totalUnreadCount > 0 && (
              <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </div>
            )}
          </div>
          <p className="text-gray-600">Connect with your neighbors and local service providers</p>
        </div>

        <ChatList
          chats={chats}
          loading={loading}
          onChatSelect={handleChatSelect}
          onDeleteChat={handleDeleteChat}
        />
      </div>
    </div>
  );
};

export default Index;
