
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Available Services</h1>

      {loading && <p>Loading services...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services?.map((service) => (
          <Card key={service.id} className="bg-white shadow-md rounded-lg overflow-hidden">
            <CardHeader>
              <CardTitle>{service.title}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Category: {service.category}</p>
              <p>Price: {service.price} / {service.price_type}</p>
              {service.tags && service.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {service.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              )}
              {service.profiles && (
                <div className="flex items-center mt-2">
                  <Avatar className="mr-2">
                    <AvatarImage src={service.profiles.avatar_url || "https://avatars.dicebear.com/api/open-peeps/example.svg"} alt={service.profiles.name} />
                    <AvatarFallback>{service.profiles.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm">Offered by: {service.profiles.name}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={() => handleChatClick(service)}>Contact</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Button onClick={handleCreateService} className="mt-4">Create New Service</Button>

      {selectedChat && (
        <Dialog open={!!selectedChat} onOpenChange={() => setSelectedChat(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Chat with {selectedChat.recipientName}</DialogTitle>
              <DialogDescription>
                Start your conversation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" value={selectedChat.recipientName} className="col-span-3" />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Index;
