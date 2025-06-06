
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Edit, Star, Briefcase, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    location: '',
    skills: ['']
  });

  // Update local state when profile loads
  useState(() => {
    if (profile) {
      setProfileData({
        name: profile.name,
        bio: profile.bio,
        location: profile.location,
        skills: profile.skills.length > 0 ? profile.skills : ['Add your skills']
      });
    }
  });

  const handleSave = async () => {
    if (!profile) return;

    await updateProfile({
      name: profileData.name,
      bio: profileData.bio,
      location: profileData.location,
      skills: profileData.skills.filter(skill => skill.trim() !== '')
    });
    
    setIsEditing(false);
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...profileData.skills];
    newSkills[index] = value;
    setProfileData({ ...profileData, skills: newSkills });
  };

  const addSkill = () => {
    setProfileData({ 
      ...profileData, 
      skills: [...profileData.skills, ''] 
    });
  };

  const removeSkill = (index: number) => {
    const newSkills = profileData.skills.filter((_, i) => i !== index);
    setProfileData({ ...profileData, skills: newSkills });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">Loading profile...</div>
        </CardContent>
      </Card>
    );
  }

  if (!user || !profile) {
    return (
      <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600 mb-4">Please sign in to view your profile.</p>
          <Button onClick={() => window.location.href = '/auth'} className="bg-gradient-neighborlly rounded-xl">
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile.avatar_url || "/api/placeholder/100/100"} />
            <AvatarFallback>{profile.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">{profile.name}</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-xl"
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            {profile.rating}/5
          </div>
          <div className="flex items-center">
            <Briefcase className="w-4 h-4 mr-1" />
            {profile.completed_jobs} jobs completed
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
            <div>
              <label className="block text-sm font-medium mb-2">Skills</label>
              <div className="space-y-2">
                {profileData.skills.map((skill, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={skill}
                      onChange={(e) => handleSkillChange(index, e.target.value)}
                      placeholder="Enter a skill"
                    />
                    {profileData.skills.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSkill(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSkill}
                  className="w-full"
                >
                  Add Skill
                </Button>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full bg-gradient-neighborlly rounded-xl">
              Save Changes
            </Button>
          </>
        ) : (
          <>
            <div>
              <h3 className="font-medium mb-2">About</h3>
              <p className="text-gray-600">{profile.bio}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Location</h3>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {profile.location}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
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
