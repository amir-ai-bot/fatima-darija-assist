import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun, Languages, User, Info, Heart, Smile } from "lucide-react";
import fatimaAvatar from "@/assets/fatima-avatar.png";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<'darija' | 'french'>('french');
  const [personality, setPersonality] = useState('friendly_warm');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (error) {
      console.error('Error fetching profile:', error);
    } else if (data) {
      setProfile(data);
      setLanguage(data.preferred_language as 'darija' | 'french' || 'french');
      setPersonality(data.personality || 'friendly_warm');
    }
  };

  const updateProfile = async (updates: any) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);
    if (error) {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le profil.", variant: "destructive" });
    } else {
      toast({ title: "Profil mis à jour!", description: "Vos préférences ont été enregistrées." });
      fetchProfile(); // Refresh profile data
    }
  };

  const updateLanguage = (newLanguage: 'darija' | 'french') => {
    setLanguage(newLanguage);
    localStorage.setItem('app-language', newLanguage);
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: newLanguage }));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLanguageChange = (newLanguage: 'darija' | 'french') => {
    setLanguage(newLanguage);
    updateProfile({ preferred_language: newLanguage });
  };

  const handlePersonalityChange = (newPersonality: string) => {
    setPersonality(newPersonality);
    updateProfile({ personality: newPersonality });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="text-muted-foreground"
        >
          ← Retour
        </Button>
        <div className="text-center">
          <h2 className="font-semibold font-inter">Paramètres</h2>
          <p className="text-xs text-muted-foreground font-cairo">إعدادات</p>
        </div>
        <div className="w-16"></div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={fatimaAvatar} alt="Profile" />
                <AvatarFallback>FA</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="font-inter">Utilisateur</CardTitle>
                <CardDescription className="font-cairo text-right">
                  المستخدم
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <User className="w-4 h-4 mr-2" />
              Modifier le profil
            </Button>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sun className="w-5 h-5" />
              <span className="font-inter">Apparence</span>
            </CardTitle>
            <CardDescription className="font-cairo text-right">
              المظهر
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold font-inter">Mode sombre</p>
                <p className="text-sm text-muted-foreground font-cairo text-right">
                  الوضع الليلي
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Sun className="w-4 h-4" />
                <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
                <Moon className="w-4 h-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Languages className="w-5 h-5" />
              <span className="font-inter">Langue</span>
            </CardTitle>
            <CardDescription className="font-cairo text-right">
              اللغة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold font-inter">
                  {language === 'french' ? 'Français' : 'الدارجة التونسية'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'french' ? 'French / Français' : 'Tunisian Darija'}
                </p>
              </div>
              <Button variant="outline" onClick={() => handleLanguageChange(language === 'french' ? 'darija' : 'french')}>
                {language === 'french' ? 'عربي' : 'FR'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Personality Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smile className="w-5 h-5" />
              <span className="font-inter">Personnalité de Fatima</span>
            </CardTitle>
            <CardDescription className="font-cairo text-right">
              شخصية فاطمة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={personality} onValueChange={handlePersonalityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choisissez une personnalité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly_warm">Amicale et chaleureuse</SelectItem>
                <SelectItem value="funny_sassy">Drôle et taquine</SelectItem>
                <SelectItem value="wise_calm">Sage et calme</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="w-5 h-5" />
              <span className="font-inter">À propos</span>
            </CardTitle>
            <CardDescription className="font-cairo text-right">
              حول التطبيق
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold font-inter">FatimaAI v1.0</p>
              <p className="text-sm text-muted-foreground font-inter">
                Assistant personnel tunisien
              </p>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-inter">🎤 Reconnaissance vocale en darija et français</p>
              <p className="font-inter">💬 Chat intelligent bilingue</p>
              <p className="font-inter">🔄 Traduction darija ↔ français</p>
              <p className="font-inter">📍 Informations locales tunisiennes</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className="bg-gradient-accent">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="font-inter text-sm">Fait avec amour pour la Tunisie</span>
            </div>
            <p className="text-xs font-cairo">
              صنع بحب للبلاد التونسية 🇹🇳
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsScreen;