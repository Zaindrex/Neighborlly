
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
  DollarSign
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const Index = () => {
  const [activeTab, setActiveTab] = useState('discover');

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
      color: "bg-blue-500"
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
      color: "bg-purple-500"
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
      color: "bg-green-500"
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
      color: "bg-orange-500"
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
              <div className="relative">
                <MessageCircle className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </div>
              <Avatar className="w-8 h-8">
                <AvatarImage src="/api/placeholder/32/32" />
                <AvatarFallback>YO</AvatarFallback>
              </Avatar>
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
                className="pl-12 pr-4 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-neighborlly-purple transition-colors"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-neighborlly hover:opacity-90 rounded-xl">
                Search
              </Button>
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
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 pb-16">
        {activeTab === 'discover' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyServices.map((service) => {
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
                      <Button className="bg-gradient-neighborlly hover:opacity-90 rounded-xl">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === 'chats' && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-neighborlly-purple" />
                  Recent Conversations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {recentChats.map((chat) => (
                  <div key={chat.id} className="flex items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b last:border-b-0">
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
          </div>
        )}

        {activeTab === 'post' && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-neighborlly-purple" />
                  Post Your Service
                </CardTitle>
                <CardDescription>
                  Share your skills with neighbors nearby and start earning today!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Service Title</label>
                  <Input placeholder="e.g., Web Development, Photography, Home Repairs" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea 
                    className="w-full p-3 border rounded-xl resize-none h-24 focus:ring-2 focus:ring-neighborlly-purple focus:border-transparent"
                    placeholder="Describe your service and what makes you unique..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price</label>
                    <Input placeholder="$50/hour" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-neighborlly-purple focus:border-transparent">
                      <option>Technology</option>
                      <option>Creative</option>
                      <option>Home Services</option>
                      <option>Business</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <Button className="w-full bg-gradient-neighborlly hover:opacity-90 py-3 rounded-xl text-lg">
                  Post Service
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button className="w-14 h-14 rounded-full bg-gradient-neighborlly hover:opacity-90 shadow-lg">
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
