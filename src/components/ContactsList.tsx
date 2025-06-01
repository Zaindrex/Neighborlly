
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, MessageCircle, Users } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
  skills: string[];
  isRegistered: boolean;
  mutualConnections?: number;
}

interface ContactsListProps {
  onContactSelect: (contact: Contact) => void;
  onBack: () => void;
}

const ContactsList = ({ onContactSelect, onBack }: ContactsListProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock contacts data - in real app this would come from phone contacts + Neighborlly API
  const contacts: Contact[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: '/api/placeholder/40/40',
      isOnline: true,
      skills: ['Web Development', 'UI/UX'],
      isRegistered: true,
      mutualConnections: 3
    },
    {
      id: '2',
      name: 'Mike Johnson',
      avatar: '/api/placeholder/40/40',
      isOnline: false,
      lastSeen: '2 hours ago',
      skills: ['Photography', 'Video Editing'],
      isRegistered: true,
      mutualConnections: 1
    },
    {
      id: '3',
      name: 'Alex Rodriguez',
      avatar: '/api/placeholder/40/40',
      isOnline: true,
      skills: ['Home Repairs', 'Plumbing'],
      isRegistered: true,
      mutualConnections: 5
    },
    {
      id: '4',
      name: 'Emma Wilson',
      avatar: '/api/placeholder/40/40',
      isOnline: false,
      lastSeen: '1 day ago',
      skills: ['Graphic Design', 'Branding'],
      isRegistered: true,
      mutualConnections: 2
    },
    {
      id: '5',
      name: 'John Smith',
      avatar: '/api/placeholder/40/40',
      isOnline: false,
      skills: [],
      isRegistered: false
    },
    {
      id: '6',
      name: 'Lisa Brown',
      avatar: '/api/placeholder/40/40',
      isOnline: true,
      skills: ['Marketing', 'Content Writing'],
      isRegistered: true,
      mutualConnections: 4
    }
  ];

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const registeredContacts = filteredContacts.filter(contact => contact.isRegistered);
  const unregisteredContacts = filteredContacts.filter(contact => !contact.isRegistered);

  const handleContactClick = (contact: Contact) => {
    if (contact.isRegistered) {
      console.log('Starting chat with registered contact:', contact.name);
      onContactSelect(contact);
    } else {
      console.log('Contact not registered on Neighborlly:', contact.name);
      // TODO: Show invite modal or send SMS invitation
    }
  };

  return (
    <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-neighborlly-purple" />
              Your Contacts
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{registeredContacts.length} on Neighborlly</span>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0 max-h-96 overflow-y-auto">
        {/* Registered Contacts */}
        {registeredContacts.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-gray-50 border-b">
              <h3 className="text-sm font-medium text-gray-700">
                On Neighborlly ({registeredContacts.length})
              </h3>
            </div>
            {registeredContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b last:border-b-0"
                onClick={() => handleContactClick(contact)}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {contact.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{contact.name}</h4>
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    {contact.isOnline ? (
                      <span className="text-green-500">Online</span>
                    ) : (
                      <span>Last seen {contact.lastSeen}</span>
                    )}
                    {contact.mutualConnections && (
                      <span className="ml-2">• {contact.mutualConnections} mutual</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {contact.skills.slice(0, 2).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {contact.skills.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{contact.skills.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Unregistered Contacts */}
        {unregisteredContacts.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-gray-50 border-b">
              <h3 className="text-sm font-medium text-gray-700">
                Invite to Neighborlly ({unregisteredContacts.length})
              </h3>
            </div>
            {unregisteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b last:border-b-0 opacity-60"
                onClick={() => handleContactClick(contact)}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{contact.name}</h4>
                    <Button variant="outline" size="sm" className="text-xs">
                      Invite
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Not on Neighborlly</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No contacts found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactsList;
