import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ArtistProfile } from '../../types/artist';
import { toast } from 'react-toastify';
import ArtistPortfolio from './ArtistPortfolio';
import ArtistBookings from './ArtistBookings';
import ArtistProfileComponent from './ArtistProfile';
import ArtistAvailability from './ArtistAvailability';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card } from '../ui/card';
import { Loader2 } from 'lucide-react';

const ArtistDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchArtistProfile = async () => {
      if (!currentUser) return;

      try {
        const artistDoc = await getDoc(doc(db, 'artists', currentUser.uid));
        if (artistDoc.exists()) {
          setArtistProfile({ id: artistDoc.id, ...artistDoc.data() } as ArtistProfile);
        } else {
          toast.error('Artist profile not found');
        }
      } catch (error) {
        console.error('Error fetching artist profile:', error);
        toast.error('Failed to load artist profile');
      } finally {
        setLoading(false);
      }
    };

    fetchArtistProfile();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!artistProfile) {
    return (
      <div className="p-4">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Welcome to Artist Dashboard</h2>
          <p className="text-gray-600">
            Please complete your artist profile to get started.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Artist Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 gap-4 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ArtistProfileComponent profile={artistProfile} onUpdate={setArtistProfile} />
        </TabsContent>

        <TabsContent value="portfolio">
          <ArtistPortfolio 
            portfolio={artistProfile.portfolio} 
            artistId={artistProfile.id} 
            onUpdate={(portfolio) => 
              setArtistProfile(prev => prev ? { ...prev, portfolio } : null)
            } 
          />
        </TabsContent>

        <TabsContent value="bookings">
          <ArtistBookings artistId={artistProfile.id} />
        </TabsContent>

        <TabsContent value="availability">
          <ArtistAvailability 
            availability={artistProfile.availability}
            artistId={artistProfile.id}
            onUpdate={(availability) => 
              setArtistProfile(prev => prev ? { ...prev, availability } : null)
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArtistDashboard;