import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices, Service } from '@/hooks/useServices';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from '@/hooks/use-toast';
import { geolocationService } from '@/services/geolocationService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { useSearchParams } from 'react-router-dom';

interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unread: number;
}

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { services, loading, error, refreshServices } = useServices();
  const { profile } = useProfile();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [date, setDate] = useState<DateRange | undefined>({
    from: searchParams.get("from") ? new Date(searchParams.get("from") as string) : undefined,
    to: searchParams.get("to") ? new Date(searchParams.get("to") as string) : undefined
  })
  const [priceRange, setPriceRange] = useState<number[]>([0, 100]);

  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    price: '',
    price_type: 'fixed',
    location: '',
    latitude: 0,
    longitude: 0,
  });

  const filteredServices = services.filter(service => {
    const searchRegex = new RegExp(searchTerm, 'i');
    const matchesSearch = searchRegex.test(service.title) || searchRegex.test(service.description || '');

    const matchesCategory = categoryFilter === 'all' ? true : service.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleChatClick = async (serviceId: string) => {
    const serviceData = services.find(s => s.id === serviceId);
    if (!serviceData) {
      console.error('Service not found for chat');
      return;
    }

    // Set up the selected chat properly with proper null checking
    const profiles = serviceData.profiles;
    const profileData = profiles && 
      profiles !== null && 
      typeof profiles === 'object' && 
      'name' in profiles 
      ? profiles as { name: string; avatar_url?: string }
      : null;

    setSelectedChat({
      id: serviceData.user_id,
      name: profileData?.name || 'Unknown User',
      avatar: profileData?.avatar_url || undefined,
      lastMessage: '',
      time: '',
      unread: 0
    });
    setIsChatOpen(true);
  };

  const handleCreateService = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a service.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await (window as any).supabase
        .from('services')
        .insert([
          {
            ...newService,
            user_id: user.id,
            tags: newService.tags.split(',').map(tag => tag.trim()),
            latitude: currentLocation?.latitude || null,
            longitude: currentLocation?.longitude || null,
            location: newService.location || null,
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: "Service created successfully.",
      });

      setIsCreateServiceOpen(false);
      refreshServices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLocationToggle = () => {
    setLocationEnabled(!locationEnabled);

    if (!locationEnabled) {
      geolocationService.getCurrentLocation()
        .then(location => {
          setCurrentLocation(location);
          setNewService(prev => ({
            ...prev,
            latitude: location.latitude,
            longitude: location.longitude,
          }));
          toast({
            title: "Location Enabled",
            description: "Your location has been enabled.",
          });
        })
        .catch(error => {
          console.error("Error getting location:", error);
          toast({
            title: "Error",
            description: "Failed to get your location. Please try again.",
            variant: "destructive",
          });
          setLocationEnabled(false);
        });
    } else {
      setCurrentLocation(null);
      setNewService(prev => ({
        ...prev,
        latitude: 0,
        longitude: 0,
      }));
      toast({
        title: "Location Disabled",
        description: "Your location has been disabled.",
      });
    }
  };

  const categories = [...new Set(services.map(service => service.category))];

  useEffect(() => {
    if (date?.from) {
      searchParams.set("from", date.from.toISOString());
    } else {
      searchParams.delete("from");
    }
    if (date?.to) {
      searchParams.set("to", date.to.toISOString());
    } else {
      searchParams.delete("to");
    }
    setSearchParams(searchParams)
  }, [date, setSearchParams, searchParams])

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center space-x-4">
        <Input
          type="text"
          placeholder="Search for services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-8 flex items-center space-x-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !date?.from || !date.to ? "text-muted-foreground" : undefined
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from && date?.to ? (
                format(date.from, "PPP") + " - " + format(date.to, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center" side="bottom">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              pagedNavigation
            />
          </PopoverContent>
        </Popover>
        <div>
          <Label htmlFor="location-enabled" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
            Enable Location
          </Label>
          <Switch id="location-enabled" checked={locationEnabled} onCheckedChange={handleLocationToggle} />
        </div>
      </div>

      <div className="mb-8">
        <Label>Price Range</Label>
        <div className="flex items-center space-x-2">
          <span>$0</span>
          <Slider
            defaultValue={priceRange}
            max={200}
            step={10}
            onValueChange={(value) => setPriceRange(value)}
          />
          <span>$200</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle><Skeleton className="h-5 w-4/5" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-3/5" /></CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
                <div className="mt-4">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3 mt-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <Card key={service.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{service.description}</p>
                <div className="mt-4">
                  <Badge className="mr-2">{service.price}  {service.price_type}</Badge>
                  {service.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="mr-1">{tag}</Badge>
                  ))}
                </div>
                <div className="flex items-center mt-4">
                  {service.profiles?.avatar_url ? (
                    <Avatar className="mr-2 h-8 w-8">
                      <AvatarImage src={service.profiles.avatar_url} alt={service.profiles.name} />
                      <AvatarFallback>{service.profiles.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="mr-2 h-8 w-8">
                      <AvatarFallback>{service.profiles?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <span className="text-sm text-gray-500">Offered by {service.profiles?.name || 'Unknown User'}</span>
                </div>
                <Button className="w-full mt-4 bg-gradient-neighborlly hover:opacity-90 rounded-xl" onClick={() => handleChatClick(service.id)}>
                  Contact
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-gray-500">No services found.</div>
      )}

      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Contact</DialogTitle>
            <DialogDescription>
              {selectedChat ? `You are about to contact ${selectedChat.name}.` : 'No contact selected.'}
            </DialogDescription>
          </DialogHeader>
          {selectedChat && (
            <div className="flex items-center space-x-4">
              {selectedChat.avatar ? (
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedChat.avatar} alt={selectedChat.name} />
                  <AvatarFallback>{selectedChat.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{selectedChat.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div>
                <p className="text-sm font-medium">{selectedChat.name}</p>
                <p className="text-xs text-gray-500">Last message: {selectedChat.lastMessage}</p>
              </div>
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={selectedChat?.name} className="col-span-3" disabled />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" value={selectedChat?.id} className="col-span-3" disabled />
            </div>
          </div>
          <Button className="w-full bg-gradient-neighborlly hover:opacity-90 rounded-xl" onClick={() => {
            setIsChatOpen(false);
            navigate('/messages');
          }}>
            Go to Messages
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateServiceOpen} onOpenChange={setIsCreateServiceOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a Service</DialogTitle>
            <DialogDescription>
              Create a new service to offer your skills to the community.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                type="text"
                id="title"
                value={newService.title}
                onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Input
                type="text"
                id="category"
                value={newService.category}
                onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right">
                Tags (comma separated)
              </Label>
              <Input
                type="text"
                id="tags"
                value={newService.tags}
                onChange={(e) => setNewService({ ...newService, tags: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                type="text"
                id="price"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                className="col-span-1"
              />
              <Select value={newService.price_type} onValueChange={(value) => setNewService({ ...newService, price_type: value })}>
                <SelectTrigger className="col-span-2">
                  <SelectValue placeholder="Select a price type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="negotiable">Negotiable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                type="text"
                id="location"
                value={newService.location}
                onChange={(e) => setNewService({ ...newService, location: e.target.value })}
                className="col-span-3"
                disabled={locationEnabled}
              />
            </div>
          </div>
          <Button className="w-full bg-gradient-neighborlly hover:opacity-90 rounded-xl" onClick={handleCreateService}>
            Create Service
          </Button>
        </DialogContent>
      </Dialog>

      <Button variant="outline" onClick={() => setIsCreateServiceOpen(true)}>Create Service</Button>
    </div>
  );
};

export default Index;
