
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Edit, Star, Briefcase } from 'lucide-react';

interface UserProfileProps {
  user?: {
    name: string;
    email: string;
    avatar: string;
    bio: string;
    location: string;
    skills: string[];
    rating: number;
    completedJobs: number;
  };
}

const UserProfile = ({ user }: UserProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(user || {
    name: "Your Name",
    email: "your.email@example.com",
    avatar: "/api/placeholder/100/100",
    bio: "Tell us about yourself and your skills...",
    location: "Your Location",
    skills: ["Add your skills"],
    rating: 0,
    completedJobs: 0
  });

  const handleSave = () => {
    console.log('Saving profile:', profileData);
    setIsEditing(false);
    // TODO: Implement actual save functionality
  };

  return (
    <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profileData.avatar} />
            <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">{profileData.name}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-xl"
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            {profileData.rating}/5
          </div>
          <div className="flex items-center">
            <Briefcase className="w-4 h-4 mr-1" />
            {profileData.completedJobs} jobs completed
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                className="w-full p-3 border rounded-xl resize-none h-24"
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <Input
                value={profileData.location}
                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
              />
            </div>
            <Button onClick={handleSave} className="w-full bg-gradient-neighborlly rounded-xl">
              Save Changes
            </Button>
          </>
        ) : (
          <>
            <div>
              <h3 className="font-medium mb-2">About</h3>
              <p className="text-gray-600">{profileData.bio}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Location</h3>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {profileData.location}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfile;
