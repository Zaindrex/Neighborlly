import { useState, useEffect } from 'react';
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
  Code,
  User,
  Navigation,
  AlertCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import UserProfile from '@/components/UserProfile';
import ChatWindow from '@/components/ChatWindow';
import PostServiceForm from '@/components/PostServiceForm';
import LocationPermission from '@/components/LocationPermission';
import GeofenceMap from '@/components/GeofenceMap';
import ServicesDebug from '@/components/ServicesDebug';
import { geolocationService, Location, Job } from '@/services/geolocationService';
import { useServices } from '@/hooks/useServices';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import { useChats } from '@/hooks/useChats';
import { supabase } from '@/integrations/supabase/client';

interface SelectedChat {
  chatId: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedChat, setSelectedChat] = useState<SelectedChat | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Geolocation states
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  // Jobs states
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [outOfRangeJobs, setOutOfRangeJobs] = useState<Job[]>([]);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<number>(0);

  const { toast } = useToast();
  const { services, loading: servicesLoading, refreshServices } = useServices();
  const activeUsersCount = useActiveUsers();
  const { chats, refreshChats, startChat } = useChats();

  // Empty chats array - real data would come from database/API
  const [userChats, setUserChats] = useState<any[]>([]);

  // Calculate unread message count from real chats
  const unreadCount = userChats.reduce((total, chat) => total + chat.unread, 0);

  // Get current user ID on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Convert services to jobs format
  useEffect(() => {
    console.log('Converting services to jobs:', services);
    const convertedJobs: Job[] = services.map(service => ({
      id: service.id,
      title: service.title,
      provider: service.profiles?.name || 'Unknown Provider',
      description: service.description || '',
      price: `₹${service.price}`,
      rating: service.profiles?.rating?.toString() || '4.5',
      reviews: Math.floor(Math.random() * 100) + 1,
      latitude: service.latitude || 0,
      longitude: service.longitude || 0,
      category: service.category,
      tags: service.tags || [],
      icon: 'Code',
      color: 'bg-blue-500'
    }));

    console.log('Converted jobs:', convertedJobs);
    setAllJobs(convertedJobs);
  }, [services]);

  // Initialize geolocation on component mount
  useEffect(() => {
    // Check if we already have location permission
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          handleLocationGranted();
        }
      });
    }

    // Set up geolocation service callbacks
    geolocationService.onLocationUpdate((location) => {
      console.log('Location updated:', location);
      setUserLocation(location);
      setLastLocationUpdate(Date.now());
      filterJobsByLocation();
      toast({
        title: "Location Updated",
        description: "Job listings refreshed based on your new location",
      });
    });

    geolocationService.onLocationError((error) => {
      console.error('Location error:', error);
      setLocationError(error.message);
    });

    // Auto-refresh every 60 seconds
    const refreshInterval = setInterval(() => {
      if (locationPermissionGranted && userLocation) {
        refreshLocation();
        refreshServices(); // Also refresh services data
      }
    }, 60000);

    return () => {
      clearInterval(refreshInterval);
      geolocationService.stopWatchingLocation();
    };
  }, []);

  // Filter jobs when location or jobs change
  useEffect(() => {
    if (userLocation && allJobs.length > 0) {
      filterJobsByLocation();
    }
  }, [userLocation, allJobs]);

  const handleLocationGranted = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await geolocationService.getCurrentLocation();
      setUserLocation(location);
      setLocationPermissionGranted(true);
      setLocationError(null);
      
      // Start watching location for updates
      geolocationService.startWatchingLocation();
      
      toast({
        title: "Location Access Granted",
        description: "Now showing jobs within 5km of your location",
      });
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError(error instanceof Error ? error.message : 'Failed to get location');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleLocationDenied = (error: string) => {
    setLocationError(error);
    setLocationPermissionGranted(false);
    toast({
      title: "Location Access Denied",
      description: "You can manually search for jobs in your area",
      variant: "destructive"
    });
  };

  const refreshLocation = async () => {
    if (!locationPermissionGranted) return;
    
    setIsLoadingLocation(true);
    try {
      const location = await geolocationService.getCurrentLocation();
      setUserLocation(location);
      setLastLocationUpdate(Date.now());
      filterJobsByLocation();
    } catch (error) {
      console.error('Error refreshing location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const filterJobsByLocation = () => {
    if (!userLocation || allJobs.length === 0) return;

    const { withinRange, outOfRange } = geolocationService.filterJobsByGeofence(allJobs);
    setFilteredJobs(withinRange);
    setOutOfRangeJobs(outOfRange);
    
    console.log(`Filtered ${withinRange.length} jobs within 5km range`);
  };

  // Search logic
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applySearch(query);
  };

  const applySearch = (query: string) => {
    let jobsToFilter = locationPermissionGranted ? filteredJobs : allJobs;

    // Search by title, provider, description, or tags
    if (query.trim()) {
      jobsToFilter = jobsToFilter.filter(job =>
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.provider.toLowerCase().includes(query.toLowerCase()) ||
        job.description?.toLowerCase().includes(query.toLowerCase()) ||
        job.tags?.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    if (searchQuery) {
      setFilteredJobs(jobsToFilter);
    }
  };

  const handleChatClick = async (service: any) => {
    console.log('Starting chat with service provider:', service);
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to start a chat",
          variant: "destructive"
        });
        return;
      }

      // Get the service provider's user_id directly from the service
      const serviceUserId = service.user_id;
      if (!serviceUserId) {
        console.error('No user_id found in service:', service);
        toast({
          title: "Error",
          description: "Could not find service provider information",
          variant: "destructive"
        });
        return;
      }

      // Get profile information separately
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('user_id', serviceUserId)
        .single();

      if (profileError) {
        console.warn('Could not fetch profile data:', profileError);
        // Continue without profile data
      }

      // Start or get existing chat
      const chatId = await startChat(serviceUserId);
      if (!chatId) {
        toast({
          title: "Error",
          description: "Failed to start chat",
          variant: "destructive"
        });
        return;
      }

      // Set up the selected chat
      setSelectedChat({
        chatId: chatId,
        recipientId: serviceUserId,
        recipientName: profileData?.name || service.provider || 'Service Provider',
        recipientAvatar: profileData?.avatar_url
      });
      setActiveTab('chats');
    } catch (error) {
      console.error('Error in handleChatClick:', error);
      toast({
        title: "Error",
        description: "Failed to start chat",
        variant: "destructive"
      });
    }
  };

  const handleDeletePost = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)
        .eq('user_id', currentUserId); // Ensure only the owner can delete

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post deleted successfully",
      });

      // Refresh services to update the UI
      refreshServices();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const handleDeleteChat = (chatId: string) => {
    console.log('Deleting chat:', chatId);
    setUserChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
  };

  // Determine which jobs to show
  const getJobsToDisplay = () => {
    if (searchQuery) {
      return filteredJobs; // Searched results
    }
    return locationPermissionGranted ? filteredJobs : allJobs;
  };

  const jobsToShow = getJobsToDisplay();

  // Show location permission screen if not granted
  if (!locationPermissionGranted && !locationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <LocationPermission
          onLocationGranted={handleLocationGranted}
          onLocationDenied={handleLocationDenied}
        />
      </div>
    );
  }

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
              {locationPermissionGranted && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    onClick={refreshLocation}
                    disabled={isLoadingLocation}
                    className="p-2"
                    title="Refresh location"
                  >
                    {isLoadingLocation ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-gray-600" />
                    ) : (
                      <Navigation className="w-4 h-4 text-gray-600" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowMap(!showMap)}
                    className="p-2"
                    title="Toggle map view"
                  >
                    <MapPin className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>
              )}
              <Button
                variant="ghost"
                onClick={() => setActiveTab('chats')}
                className="relative p-2"
              >
                <MessageCircle className="w-6 h-6 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
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

      {/* Location Status Banner */}
      {locationPermissionGranted && userLocation && (
        <div className="bg-green-50 border-b border-green-200 py-2">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-green-700">
                <MapPin className="w-4 h-4" />
                <span>
                  Showing {filteredJobs.length} jobs within 5km • 
                  {outOfRangeJobs.length} jobs out of range
                </span>
              </div>
              <div className="text-green-600 text-xs">
                Last updated: {new Date(lastLocationUpdate).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {locationError && (
        <div className="bg-yellow-50 border-b border-yellow-200 py-2">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-2 text-yellow-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{locationError}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLocationGranted}
                className="ml-auto text-yellow-700 hover:text-yellow-800"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

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
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Button className="bg-gradient-neighborlly hover:opacity-90 rounded-xl">
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-neighborlly-blue" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{activeUsersCount}+</h3>
              <p className="text-gray-600">Active freelancers</p>
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
            {/* Map Component */}
            {showMap && locationPermissionGranted && userLocation && (
              <GeofenceMap
                userLocation={userLocation}
                jobs={allJobs}
                filteredJobs={filteredJobs}
                className="mb-6"
              />
            )}

            {searchQuery && (
              <div className="mb-4">
                <p className="text-gray-600">
                  {jobsToShow.length} results for "{searchQuery}"
                  {locationPermissionGranted && (
                    <span className="text-sm text-gray-500 ml-2">
                      (within 5km radius)
                    </span>
                  )}
                </p>
              </div>
            )}

            {servicesLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neighborlly-purple mx-auto mb-4"></div>
                <p className="text-gray-500">Loading services...</p>
              </div>
            )}

            {!servicesLoading && jobsToShow.length === 0 && !searchQuery && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">
                  {locationPermissionGranted 
                    ? "No services available within 5km of your location."
                    : "No services available yet."
                  }
                </p>
                <p className="text-gray-400">Be the first to post a service in your area!</p>
                <Button
                  onClick={() => setActiveTab('post')}
                  className="mt-4 bg-gradient-neighborlly hover:opacity-90 rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post Service
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobsToShow.map((job) => {
                // Find the original service to get user_id
                const originalService = services.find(s => s.id === job.id);
                const isOwner = currentUserId && originalService?.user_id === currentUserId;

                return (
                  <Card key={job.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 ${job.color} rounded-xl flex items-center justify-center`}>
                            <Code className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg group-hover:text-neighborlly-purple transition-colors">
                              {job.title}
                            </CardTitle>
                            <p className="text-sm text-gray-600">{job.provider}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{job.rating}</span>
                          <span className="text-xs text-gray-500">({job.reviews})</span>
                        </div>
                      </div>
                      {isOwner && (
                        <div className="flex justify-end">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete Post
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Post</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this post? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeletePost(job.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4 text-gray-600">
                        {job.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.tags?.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {job.distance || 'Distance unknown'}
                          </div>
                          <div className="flex items-center text-lg font-bold text-neighborlly-purple">
                            {job.price}/hour
                          </div>
                        </div>
                        {!isOwner && (
                          <Button 
                            className="bg-gradient-neighborlly hover:opacity-90 rounded-xl"
                            onClick={() => handleChatClick({ ...job, user_id: originalService?.user_id })}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Chat
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {!servicesLoading && jobsToShow.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No services found matching your search.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilteredJobs(locationPermissionGranted ? filteredJobs : allJobs);
                  }}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              </div>
            )}

            {/* Out of Range Jobs */}
            {locationPermissionGranted && outOfRangeJobs.length > 0 && !searchQuery && (
              <div className="mt-12">
                <div className="border-t pt-8">
                  <h3 className="text-xl font-semibold text-gray-600 mb-4">
                    Jobs Outside Your Area ({outOfRangeJobs.length})
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">
                    These jobs are more than 5km away from your current location
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {outOfRangeJobs.slice(0, 6).map((job) => (
                      <Card key={job.id} className="opacity-60 bg-gray-50 border border-gray-200">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-400 rounded-xl flex items-center justify-center">
                                <Code className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <CardTitle className="text-lg text-gray-600">
                                  {job.title}
                                </CardTitle>
                                <p className="text-sm text-gray-500">{job.provider}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-red-100 text-red-700">
                              Out of range
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="mb-4 text-gray-500">
                            {job.description}
                          </CardDescription>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center text-sm text-gray-400 mb-1">
                                <MapPin className="w-3 h-3 mr-1" />
                                Too far away
                              </div>
                              <div className="flex items-center text-lg font-bold text-gray-500">
                                {job.price}/hour
                              </div>
                            </div>
                            <Button disabled className="bg-gray-300 text-gray-500 rounded-xl">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Out of Range
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chats' && (
          <div className="max-w-4xl mx-auto">
            {selectedChat ? (
              <ChatWindow
                chatId={selectedChat.chatId}
                recipientId={selectedChat.recipientId}
                recipientName={selectedChat.recipientName}
                recipientAvatar={selectedChat.recipientAvatar}
                onBack={() => setSelectedChat(null)}
                onDeleteChat={handleDeleteChat}
              />
            ) : (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2 text-neighborlly-purple" />
                    Recent Conversations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {chats.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-2">No conversations yet</p>
                      <p className="text-gray-400 text-sm">Start chatting with service providers to see your conversations here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chats.map((chat) => (
                        <div
                          key={chat.id}
                          className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedChat({
                            chatId: chat.id,
                            recipientId: chat.other_user?.id || '',
                            recipientName: chat.other_user?.name || 'Unknown User',
                            recipientAvatar: chat.other_user?.avatar_url
                          })}
                        >
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={chat.other_user?.avatar_url} />
                            <AvatarFallback>
                              {chat.other_user?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{chat.other_user?.name || 'Unknown User'}</h3>
                              <span className="text-xs text-gray-500">
                                {new Date(chat.last_message_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {chat.last_message || 'No messages yet'}
                            </p>
                          </div>
                          {chat.unread_count && chat.unread_count > 0 && (
                            <Badge variant="destructive" className="min-w-[20px] h-5 text-xs">
                              {chat.unread_count}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'post' && <PostServiceForm onServicePosted={refreshServices} />}

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
