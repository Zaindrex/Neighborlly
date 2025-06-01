import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  MessageCircle, 
  Users, 
  Star, 
  Search, 
  Plus,
  Briefcase,
  Camera,
  Code,
  Palette,
  Wrench,
  Clock,
  DollarSign,
  Filter,
  User
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import UserProfile from '@/components/UserProfile';
import ChatWindow from '@/components/ChatWindow';
import PostServiceForm from '@/components/PostServiceForm';
import ServiceFilters from '@/components/ServiceFilters';
import ContactsList from '@/components/ContactsList';

const Index = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [showContactsList, setShowContactsList] = useState(false);

  const nearbyServices = [
    {
      id: 1,
      title: "Web Development & Design",
      provider: "Sarah Chen",
      avatar: "/api/placeholder/40/40",
      rating: 4.9,
      reviews: 23,
      price: "$50/hour",
      distance: "0.8km away",
      tags: ["React", "UI/UX", "Node.js"],
      description: "Full-stack developer with 5+ years experience. Specializing in modern web applications.",
      icon: Code,
      color: "bg-blue-500",
      category: "technology"
    },
    {
      id: 2,
      title: "Photography Services",
      provider: "Mike Johnson",
      avatar: "/api/placeholder/40/40",
      rating: 4.8,
      reviews: 31,
      price: "$80/session",
      distance: "1.2km away",
      tags: ["Portrait", "Event", "Product"],
      description: "Professional photographer for all occasions. High-quality results guaranteed.",
      icon: Camera,
      color: "bg-purple-500",
      category: "creative"
    },
    {
      id: 3,
      title: "Home Repairs & Maintenance",
      provider: "Alex Rodriguez",
      avatar: "/api/placeholder/40/40",
      rating: 5.0,
      reviews: 18,
      price: "$35/hour",
      distance: "2.1km away",
      tags: ["Plumbing", "Electrical", "Handyman"],
      description: "Licensed contractor with 10+ years experience in home repairs and maintenance.",
      icon: Wrench,
      color: "bg-green-500",
      category: "home-services"
    },
    {
      id: 4,
      title: "Graphic Design & Branding",
      provider: "Emma Wilson",
      avatar: "/api/placeholder/40/40",
      rating: 4.7,
      reviews: 28,
      price: "$45/hour",
      distance: "3.4km away",
      tags: ["Logo Design", "Branding", "Print"],
      description: "Creative designer helping businesses build their visual identity.",
      icon: Palette,
      color: "bg-orange-500",
      category: "creative"
    }
  ];

  const recentChats = [
    {
      id: 1,
      name: "Sarah Chen",
      lastMessage: "Perfect! When can we start the project?",
      time: "2m ago",
      unread: 2,
      avatar: "/api/placeholder/32/32",
      online: true
    },
    {
      id: 2,
      name: "Mike Johnson",
      lastMessage: "I've uploaded the edited photos to...",
      time: "1h ago",
      unread: 0,
      avatar: "/api/placeholder/32/32",
      online: false
    },
    {
      id: 3,
      name: "Alex Rodriguez",
      lastMessage: "The repair work is completed!",
      time: "3h ago",
      unread: 1,
      avatar: "/api/placeholder/32/32",
      online: true
    }
  ];

  // Search and filter logic
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterServices(query, {});
  };

  const handleFiltersChange = (filters: any) => {
    filterServices(searchQuery, filters);
  };

  const filterServices = (query: string, filters: any) => {
    let filtered = nearbyServices;

    // Search by title, provider, description, or tags
    if (query.trim()) {
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(query.toLowerCase()) ||
        service.provider.toLowerCase().includes(query.toLowerCase()) ||
        service.description.toLowerCase().includes(query.toLowerCase()) ||
        service.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(service => service.category === filters.category);
    }

    // Apply rating filter
    if (filters.rating && filters.rating > 0) {
      filtered = filtered.filter(service => service.rating >= filters.rating);
    }

    // Apply tag filters
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(service =>
        filters.tags.some((tag: string) =>
          service.tags.some(serviceTag => 
            serviceTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    setFilteredServices(filtered);
    console.log('Filtered services:', filtered);
  };

  const handleChatClick = (service: any) => {
    console.log('Starting chat with:', service.provider);
    setSelectedChat(service.provider);
    setActiveTab('chats');
  };

  const handleHeaderChatClick = () => {
    console.log('Header chat button clicked');
    setShowContactsList(true);
    setActiveTab('chats');
  };

  const handleContactSelect = (contact: any) => {
    console.log('Selected contact:', contact.name);
    setSelectedChat(contact.name);
    setShowContactsList(false);
  };

  const servicesToShow = searchQuery || showFilters ? filteredServices : nearbyServices;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-neighborlly rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-neighborlly bg-clip-text text-transparent">
                Neighborlly
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleHeaderChatClick}
                className="relative p-2"
              >
                <MessageCircle className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab('profile')}
                className="p-2"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/api/placeholder/32/32" />
                  <AvatarFallback>YO</AvatarFallback>
                </Avatar>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Find Local Talent{" "}
              <span className="bg-gradient-neighborlly bg-clip-text text-transparent">
                Nearby
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect with skilled freelancers and services within 5km of your location. 
              Chat instantly, hire locally, and build your community.
            </p>
          </div>

          {/* Search Bar */}
          <div className="animate-slide-up max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                placeholder="Search for services near you..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-neighborlly-purple transition-colors"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-2">
                <ServiceFilters
                  onFiltersChange={handleFiltersChange}
                  isVisible={showFilters}
                  onToggle={() => setShowFilters(!showFilters)}
                />
                <Button className="bg-gradient-neighborlly hover:opacity-90 rounded-xl">
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-neighborlly-blue" />
              </div>
              <h3 className="text-2xl font-bold mb-2">500+</h3>
              <p className="text-gray-600">Active freelancers</p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-neighborlly-purple" />
              </div>
              <h3 className="text-2xl font-bold mb-2">1,200+</h3>
              <p className="text-gray-600">Jobs completed</p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-neighborlly-green" />
              </div>
              <h3 className="text-2xl font-bold mb-2">5km</h3>
              <p className="text-gray-600">Radius coverage</p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl p-2 shadow-lg border">
            <div className="flex space-x-2">
              <Button
                variant={activeTab === 'discover' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('discover')}
                className={`rounded-xl px-6 py-2 ${
                  activeTab === 'discover' 
                    ? 'bg-gradient-neighborlly text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Search className="w-4 h-4 mr-2" />
                Discover
              </Button>
              <Button
                variant={activeTab === 'chats' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('chats')}
                className={`rounded-xl px-6 py-2 ${
                  activeTab === 'chats' 
                    ? 'bg-gradient-neighborlly text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chats
              </Button>
              <Button
                variant={activeTab === 'post' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('post')}
                className={`rounded-xl px-6 py-2 ${
                  activeTab === 'post' 
                    ? 'bg-gradient-neighborlly text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Post Service
              </Button>
              <Button
                variant={activeTab === 'profile' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('profile')}
                className={`rounded-xl px-6 py-2 ${
                  activeTab === 'profile' 
                    ? 'bg-gradient-neighborlly text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 pb-16">
        {activeTab === 'discover' && (
          <div className="space-y-6">
            {showFilters && (
              <div className="mb-6">
                <ServiceFilters
                  onFiltersChange={handleFiltersChange}
                  isVisible={showFilters}
                  onToggle={() => setShowFilters(!showFilters)}
                />
              </div>
            )}
            
            {searchQuery && (
              <div className="mb-4">
                <p className="text-gray-600">
                  {servicesToShow.length} results for "{searchQuery}"
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesToShow.map((service) => {
                const IconComponent = service.icon;
                return (
                  <Card key={service.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg group-hover:text-neighborlly-purple transition-colors">
                              {service.title}
                            </CardTitle>
                            <p className="text-sm text-gray-600">{service.provider}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{service.rating}</span>
                          <span className="text-xs text-gray-500">({service.reviews})</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4 text-gray-600">
                        {service.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {service.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {service.distance}
                          </div>
                          <div className="flex items-center text-lg font-bold text-neighborlly-purple">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {service.price.replace('$', '')}
                          </div>
                        </div>
                        <Button 
                          className="bg-gradient-neighborlly hover:opacity-90 rounded-xl"
                          onClick={() => handleChatClick(service)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {servicesToShow.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No services found matching your search.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilteredServices([]);
                  }}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chats' && (
          <div className="max-w-4xl mx-auto">
            {selectedChat ? (
              <ChatWindow
                chatId={selectedChat}
                recipientName={selectedChat}
                recipientAvatar="/api/placeholder/40/40"
                onBack={() => setSelectedChat(null)}
              />
            ) : showContactsList ? (
              <ContactsList
                onContactSelect={handleContactSelect}
                onBack={() => setShowContactsList(false)}
              />
            ) : (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2 text-neighborlly-purple" />
                      Recent Conversations
                    </CardTitle>
                    <Button
                      variant="outline"
                      onClick={() => setShowContactsList(true)}
                      className="rounded-xl"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Contacts
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {recentChats.map((chat) => (
                    <div 
                      key={chat.id} 
                      className="flex items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b last:border-b-0"
                      onClick={() => setSelectedChat(chat.name)}
                    >
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={chat.avatar} />
                          <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {chat.online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{chat.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{chat.time}</span>
                            {chat.unread > 0 && (
                              <Badge className="bg-neighborlly-purple text-white px-2 py-1 text-xs">
                                {chat.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'post' && <PostServiceForm />}

        {activeTab === 'profile' && <UserProfile />}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button 
          className="w-14 h-14 rounded-full bg-gradient-neighborlly hover:opacity-90 shadow-lg"
          onClick={() => setActiveTab('post')}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
