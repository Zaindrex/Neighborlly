
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Filter, X, MapPin, DollarSign, Star } from 'lucide-react';

interface FilterState {
  category: string;
  priceRange: number[];
  rating: number;
  distance: number;
  tags: string[];
}

interface ServiceFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  isVisible: boolean;
  onToggle: () => void;
}

const ServiceFilters = ({ onFiltersChange, isVisible, onToggle }: ServiceFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    priceRange: [0, 200],
    rating: 0,
    distance: 5,
    tags: []
  });

  const [tempFilters, setTempFilters] = useState<FilterState>({
    category: 'all',
    priceRange: [0, 200],
    rating: 0,
    distance: 5,
    tags: []
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'technology', label: 'Technology' },
    { value: 'creative', label: 'Creative' },
    { value: 'home-services', label: 'Home Services' },
    { value: 'business', label: 'Business' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'education', label: 'Education' }
  ];

  const popularTags = [
    'React', 'Node.js', 'Photography', 'Design', 'Writing',
    'Plumbing', 'Electrical', 'Tutoring', 'Marketing', 'Accounting'
  ];

  const handleTempFilterChange = (newFilters: Partial<FilterState>) => {
    setTempFilters(prev => ({ ...prev, ...newFilters }));
  };

  const addTag = (tag: string) => {
    if (!tempFilters.tags.includes(tag)) {
      handleTempFilterChange({ tags: [...tempFilters.tags, tag] });
    }
  };

  const removeTag = (tag: string) => {
    handleTempFilterChange({ tags: tempFilters.tags.filter(t => t !== tag) });
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    onFiltersChange(tempFilters);
    console.log('Filters applied:', tempFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      category: 'all',
      priceRange: [0, 200],
      rating: 0,
      distance: 5,
      tags: []
    };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        className="rounded-xl"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filters
      </Button>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center">
            <Filter className="w-5 h-5 mr-2 text-neighborlly-purple" />
            Filters
          </h3>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Category</label>
          <select
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-neighborlly-purple focus:border-transparent"
            value={tempFilters.category}
            onChange={(e) => handleTempFilterChange({ category: e.target.value })}
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            Price Range: ${tempFilters.priceRange[0]} - ${tempFilters.priceRange[1]}/hour
          </label>
          <Slider
            value={tempFilters.priceRange}
            onValueChange={(value) => handleTempFilterChange({ priceRange: value })}
            max={200}
            min={0}
            step={5}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 flex items-center">
            <Star className="w-4 h-4 mr-1" />
            Minimum Rating
          </label>
          <div className="flex space-x-2">
            {[0, 3, 4, 4.5, 5].map((rating) => (
              <Button
                key={rating}
                variant={tempFilters.rating === rating ? "default" : "outline"}
                size="sm"
                onClick={() => handleTempFilterChange({ rating })}
                className="rounded-xl"
              >
                {rating === 0 ? 'Any' : `${rating}+`}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            Distance: {tempFilters.distance}km
          </label>
          <Slider
            value={[tempFilters.distance]}
            onValueChange={(value) => handleTempFilterChange({ distance: value[0] })}
            max={5}
            min={0.5}
            step={0.5}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Skills & Tags</label>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {tempFilters.tags.map((tag) => (
                <Badge key={tag} variant="default" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTags
                .filter(tag => !tempFilters.tags.includes(tag))
                .map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-neighborlly-purple hover:text-white"
                    onClick={() => addTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
            </div>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button 
            onClick={applyFilters}
            className="flex-1 bg-gradient-neighborlly hover:opacity-90 rounded-xl"
          >
            Apply Filters
          </Button>
          <Button 
            variant="outline"
            onClick={onToggle}
            className="rounded-xl"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceFilters;
