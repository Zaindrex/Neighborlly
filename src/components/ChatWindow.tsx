
import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface ChatWindowProps {
  chatId?: string;
  recipientName: string;
  recipientAvatar: string;
  onBack: () => void;
}

const ChatWindow = ({ chatId, recipientName, recipientAvatar, onBack }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'other',
      content: 'Hi! I saw your web development service. Can we discuss the project?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isRead: true
    },
    {
      id: '2',
      senderId: 'me',
      content: 'Of course! I\'d be happy to help. What kind of project are you working on?',
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      isRead: true
    },
    {
      id: '3',
      senderId: 'other',
      content: 'I need a responsive e-commerce website. How much would that cost?',
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
      isRead: true
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: 'me',
        content: newMessage,
        timestamp: new Date(),
        isRead: false
      };
      setMessages([...messages, message]);
      setNewMessage('');
      console.log('Sending message:', message);
      // TODO: Implement actual message sending
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg h-[600px] flex flex-col">
      <CardHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="lg:hidden">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarImage src={recipientAvatar} />
              <AvatarFallback>{recipientName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{recipientName}</CardTitle>
              <p className="text-sm text-green-500">Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="rounded-xl">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-xl">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-xl">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.senderId === 'me'
                  ? 'bg-gradient-neighborlly text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.senderId === 'me' ? 'text-white/70' : 'text-gray-500'
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 rounded-2xl"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-gradient-neighborlly hover:opacity-90 rounded-2xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatWindow;
