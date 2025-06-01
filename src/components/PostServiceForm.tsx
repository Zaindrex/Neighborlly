
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, MapPin, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServiceData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: string;
  priceType: 'hourly' | 'fixed';
  location: string;
}

const PostServiceForm = () => {
  const { toast } = useToast();
  const [serviceData, setServiceData] = useState<ServiceData>({
    title: '',
    description: '',
    category: 'Technology',
    tags: [],
    price: '',
    priceType: 'hourly',
    location: ''
  });
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Technology',
    'Creative',
    'Home Services',
    'Business',
    'Health & Wellness',
    'Education',
    'Other'
  ];

  const handleAddTag = () => {
    if (newTag.trim() && !serviceData.tags.includes(newTag.trim())) {
      setServiceData({
        ...serviceData,
        tags: [...serviceData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setServiceData({
      ...serviceData,
      tags: serviceData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Posting service:', serviceData);
      // TODO: Implement actual service posting
      
      toast({
        title: "Service Posted!",
        description: "Your service has been posted successfully and is now visible to nearby users.",
      });

      // Reset form
      setServiceData({
        title: '',
        description: '',
        category: 'Technology',
        tags: [],
        price: '',
        priceType: 'hourly',
        location: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // TODO: Convert coordinates to address
          setServiceData({
            ...serviceData,
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          });
          toast({
            title: "Location Updated",
            description: "Your current location has been set.",
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Could not get your location. Please enter it manually.",
            variant: "destructive",
          });
        }
      );
    }
  };

  return (
    <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="w-5 h-5 mr-2 text-neighborlly-purple" />
          Post Your Service
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Service Title *</label>
            <Input
              value={serviceData.title}
              onChange={(e) => setServiceData({ ...serviceData, title: e.target.value })}
              placeholder="e.g., Professional Web Development Services"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              className="w-full p-3 border rounded-xl resize-none h-32 focus:ring-2 focus:ring-neighborlly-purple focus:border-transparent"
              value={serviceData.description}
              onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
              placeholder="Describe your service, experience, and what makes you unique..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-neighborlly-purple focus:border-transparent"
                value={serviceData.category}
                onChange={(e) => setServiceData({ ...serviceData, category: e.target.value })}
                required
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location *</label>
              <div className="flex space-x-2">
                <Input
                  value={serviceData.location}
                  onChange={(e) => setServiceData({ ...serviceData, location: e.target.value })}
                  placeholder="Your service location"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  className="px-3"
                >
                  <MapPin className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a skill tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {serviceData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Pricing *</label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type="number"
                  value={serviceData.price}
                  onChange={(e) => setServiceData({ ...serviceData, price: e.target.value })}
                  placeholder="50"
                  required
                />
              </div>
              <select
                className="p-3 border rounded-xl focus:ring-2 focus:ring-neighborlly-purple focus:border-transparent"
                value={serviceData.priceType}
                onChange={(e) => setServiceData({ ...serviceData, priceType: e.target.value as 'hourly' | 'fixed' })}
              >
                <option value="hourly">per hour</option>
                <option value="fixed">fixed price</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-neighborlly hover:opacity-90 py-3 rounded-xl text-lg"
          >
            {isSubmitting ? 'Posting...' : 'Post Service'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PostServiceForm;
