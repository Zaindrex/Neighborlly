
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useServices } from '@/hooks/useServices';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useSocket } from '@/hooks/useSocket';
import { useChat } from '@/hooks/useChat';
import { ServiceCard } from '@/components/ServiceCard';
import { ChatDialog } from '@/components/ChatDialog';

const Index = () => {
  const navigate = useNavigate();
  const { services, loading, error } = useServices();
  const { locationEnabled } = useGeolocation();
  const socket = useSocket();
  const { selectedChat, handleChatClick, closeChat } = useChat();

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
          <ServiceCard 
            key={service.id} 
            service={service} 
            onContactClick={handleChatClick}
          />
        ))}
      </div>

      <Button onClick={handleCreateService} className="mt-4">
        Create New Service
      </Button>

      <ChatDialog selectedChat={selectedChat} onClose={closeChat} />
    </div>
  );
};

export default Index;
