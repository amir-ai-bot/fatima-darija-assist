import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Navigation, Phone, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Place {
  id: string;
  name: string;
  type: string;
  address: string;
  phone?: string;
  hours?: string;
  distance?: string;
}

interface PlacesScreenProps {
  onBack: () => void;
}

const PlacesScreen = ({ onBack }: PlacesScreenProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Predefined common places in Tunisia
  const commonPlaces = [
    { icon: "🏦", name: "ATB", type: "Banque", query: "ATB banque" },
    { icon: "📮", name: "Poste", type: "Services", query: "bureau de poste" },
    { icon: "🏥", name: "Hôpital", type: "Santé", query: "hôpital" },
    { icon: "⛽", name: "Station", type: "Carburant", query: "station essence" },
    { icon: "🍞", name: "Boulangerie", type: "Commerce", query: "boulangerie" },
    { icon: "🛒", name: "Supermarché", type: "Commerce", query: "supermarché" },
    { icon: "💊", name: "Pharmacie", type: "Santé", query: "pharmacie" },
    { icon: "🚕", name: "Taxi", type: "Transport", query: "station taxi" }
  ];

  const mockPlaces: Place[] = [
    {
      id: '1',
      name: 'ATB Menzah',
      type: 'Banque',
      address: 'Avenue Habib Bourguiba, Menzah 1',
      phone: '+216 71 123 456',
      hours: '08:00 - 16:00',
      distance: '0.5 km'
    },
    {
      id: '2', 
      name: 'Poste Centrale',
      type: 'Services',
      address: 'Rue Charles de Gaulle, Centre Ville',
      phone: '+216 71 654 321',
      hours: '08:00 - 17:00',
      distance: '1.2 km'
    },
    {
      id: '3',
      name: 'Hôpital La Rabta',
      type: 'Santé',
      address: 'Boulevard 9 Avril, Bab Saadoun',
      phone: '+216 71 663 000',
      hours: '24h/24',
      distance: '2.1 km'
    }
  ];

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const filtered = mockPlaces.filter(place => 
        place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setPlaces(filtered);
      
      if (filtered.length === 0) {
        toast({
          title: "Aucun résultat",
          description: "Aucun lieu trouvé pour cette recherche",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de rechercher les lieux",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast({
            title: "Position obtenue",
            description: "Recherche des lieux à proximité...",
          });
          handleSearch("pharmacie"); // Demo search
        },
        (error) => {
          toast({
            title: "Erreur de localisation",
            description: "Impossible d'obtenir votre position",
            variant: "destructive",
          });
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="text-muted-foreground"
        >
          ← Retour
        </Button>
        <h1 className="text-xl font-semibold font-inter">Lieux à proximité</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={requestLocation}
        >
          <Navigation className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un lieu..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={() => handleSearch()} disabled={isLoading}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Recherches fréquentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {commonPlaces.map((place, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto flex-col p-3 space-y-1"
                onClick={() => handleSearch(place.query)}
              >
                <span className="text-lg">{place.icon}</span>
                <span className="text-xs font-inter">{place.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {places.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold font-inter">Résultats</h2>
          {places.map((place) => (
            <Card key={place.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold font-inter">{place.name}</h3>
                    <p className="text-sm text-muted-foreground">{place.type}</p>
                  </div>
                  {place.distance && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {place.distance}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span>{place.address}</span>
                  </div>
                  
                  {place.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      <span>{place.phone}</span>
                    </div>
                  )}
                  
                  {place.hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{place.hours}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {places.length === 0 && searchQuery && !isLoading && (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucun lieu trouvé</p>
          <p className="text-sm text-muted-foreground">Essayez une autre recherche</p>
        </div>
      )}
    </div>
  );
};

export default PlacesScreen;