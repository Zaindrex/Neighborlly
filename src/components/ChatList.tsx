
import { MessageCircle, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Chat } from '@/hooks/useChats';

interface ChatListProps {
  chats: Chat[];
  loading: boolean;
  onChatSelect: (chat: Chat) => void;
  onDeleteChat: (chatId: string) => void;
}

const ChatList = ({ chats, loading, onChatSelect, onDeleteChat }: ChatListProps) => {
  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neighborlly-purple mx-auto mb-4"></div>
            <p className="text-gray-500">Loading conversations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-2 text-neighborlly-purple" />
          Recent Conversations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {chats.length === 0 ? (
          <div className="text-center py-12 px-6">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No conversations yet</p>
            <p className="text-gray-400 text-sm">Start chatting with service providers to see your conversations here.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                onClick={() => onChatSelect(chat)}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarImage src={chat.other_user?.avatar_url} />
                    <AvatarFallback>
                      {chat.other_user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {chat.other_user?.name || 'Unknown User'}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {new Date(chat.last_message_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {chat.last_message || 'No messages yet'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                  {chat.unread_count && chat.unread_count > 0 && (
                    <Badge variant="destructive" className="min-w-[20px] h-5 text-xs">
                      {chat.unread_count}
                    </Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="p-2 h-8 w-8">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                        }} 
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatList;
