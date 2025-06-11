
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Service } from '@/hooks/useServices';

interface ServiceCardProps {
  service: Service;
  onContactClick: (service: Service) => void;
}

export const ServiceCard = ({ service, onContactClick }: ServiceCardProps) => {
  return (
    <Card className="bg-white shadow-md rounded-lg overflow-hidden">
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
              <AvatarImage 
                src={service.profiles.avatar_url || "https://avatars.dicebear.com/api/open-peeps/example.svg"} 
                alt={service.profiles.name} 
              />
              <AvatarFallback>{service.profiles.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="text-sm">Offered by: {service.profiles.name}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={() => onContactClick(service)}>Contact</Button>
      </CardFooter>
    </Card>
  );
};
