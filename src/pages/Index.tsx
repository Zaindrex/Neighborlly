
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGeolocated } from 'react-geolocated';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useServices, Service } from '@/hooks/useServices';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Socket, io } from 'socket.io-client';

interface Chat {
  chatId: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
}

const Index = () => {
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const navigate = useNavigate();
  const { services, loading, error, refreshServices } = useServices();
  const { profile } = useProfile();
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    coords,
    isGeolocationAvailable,
    isGeolocationEnabled,
    getPosition,
  } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false,
    },
    watchPosition: true,
  });

  useEffect(() => {
    if (coords) {
      console.log("Latitude is:", coords.latitude);
      console.log("Longitude is:", coords.longitude);
      setLocationEnabled(true);
    }
  }, [coords]);

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:3001', {
        query: { userId: user.id },
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

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

  const handleCreateService = () => {
    navigate('/create-service');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Available Services</h1>
          <p className="text-lg text-gray-600">Discover and connect with local service providers</p>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-gray-600">Loading services...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}

        {/* Services Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {services?.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow duration-300 bg-white border border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-900">{service.title}</CardTitle>
                  <CardDescription className="text-gray-600 line-clamp-2">{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Category:</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">{service.category}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Price:</span>
                    <span className="text-lg font-semibold text-green-600">${service.price} / {service.price_type}</span>
                  </div>
                  {service.tags && service.tags.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-500">Tags:</span>
                      <div className="flex flex-wrap gap-1">
                        {service.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {service.profiles && (
                    <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={service.profiles.avatar_url || undefined} 
                          alt={service.profiles.name || 'User'} 
                        />
                        <AvatarFallback className="bg-gray-100 text-gray-600">
                          {service.profiles.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{service.profiles.name || 'Unknown User'}</p>
                        <p className="text-xs text-gray-500">Service Provider</p>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleChatClick(service)} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Contact Provider
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && (!services || services.length === 0) && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services available</h3>
            <p className="text-gray-600 mb-6">Be the first to create a service in your area!</p>
          </div>
        )}

        {/* Create Service Button */}
        <div className="text-center">
          <Button 
            onClick={handleCreateService} 
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
          >
            Create New Service
          </Button>
        </div>

        {/* Chat Dialog */}
        {selectedChat && (
          <Dialog open={!!selectedChat} onOpenChange={() => setSelectedChat(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedChat.recipientAvatar} alt={selectedChat.recipientName} />
                    <AvatarFallback>{selectedChat.recipientName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>Chat with {selectedChat.recipientName}</span>
                </DialogTitle>
                <DialogDescription>
                  Start your conversation about the service.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-gray-600 mb-4">
                  This will open a chat window where you can discuss the service details with {selectedChat.recipientName}.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Contact: {selectedChat.recipientName}</p>
                  <p className="text-xs text-gray-500 mt-1">Chat ID: {selectedChat.chatId}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Index;
