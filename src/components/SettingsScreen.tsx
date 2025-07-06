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

import { useLanguage, translations } from "@/hooks/useLanguage";

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const { language: currentLanguage, setLanguage } = useLanguage();
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
    updateProfile({ preferred_language: newLanguage });
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: newLanguage }));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLanguageChange = (newLanguage: 'darija' | 'french') => {
    updateLanguage(newLanguage);
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
          {translations.back[currentLanguage]}
        </Button>
        <div className="text-center">
          <h2 className="font-semibold font-inter">{translations.settings[currentLanguage]}</h2>
          <p className="text-xs text-muted-foreground font-cairo">{translations.settings[currentLanguage === 'french' ? 'darija' : 'french']}</p>
        </div>
        <div className="w-16"></div>
      </div>

      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={fatimaAvatar} alt="Profile" />
                <AvatarFallback>FA</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="font-inter">{translations.user[currentLanguage]}</CardTitle>
                <CardDescription className="font-cairo text-right">
                  {translations.user[currentLanguage === 'french' ? 'darija' : 'french']}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <User className="w-4 h-4 mr-2" />
              {translations.editProfile[currentLanguage]}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sun className="w-5 h-5" />
              <span className="font-inter">{translations.appearance[currentLanguage]}</span>
            </CardTitle>
            <CardDescription className="font-cairo text-right">
              {translations.appearance[currentLanguage === 'french' ? 'darija' : 'french']}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold font-inter">{translations.darkMode[currentLanguage]}</p>
                <p className="text-sm text-muted-foreground font-cairo text-right">
                  {translations.darkMode[currentLanguage === 'french' ? 'darija' : 'french']}
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Languages className="w-5 h-5" />
              <span className="font-inter">{translations.language[currentLanguage]}</span>
            </CardTitle>
            <CardDescription className="font-cairo text-right">
              {translations.language[currentLanguage === 'french' ? 'darija' : 'french']}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold font-inter">
                  {translations.languageName[currentLanguage]}
                </p>
                <p className="text-sm text-muted-foreground">
                  {translations.languageDesc[currentLanguage]}
                </p>
              </div>
              <Button variant="outline" onClick={() => handleLanguageChange(currentLanguage === 'french' ? 'darija' : 'french')}>
                {currentLanguage === 'french' ? 'عربي' : 'FR'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smile className="w-5 h-5" />
              <span className="font-inter">{translations.personality[currentLanguage]}</span>
            </CardTitle>
            <CardDescription className="font-cairo text-right">
              {translations.personality[currentLanguage === 'french' ? 'darija' : 'french']}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={personality} onValueChange={handlePersonalityChange}>
              <SelectTrigger>
                <SelectValue placeholder={translations.personalityPlaceholder[currentLanguage]} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly_warm">{translations.friendly[currentLanguage]}</SelectItem>
                <SelectItem value="funny_sassy">{translations.funny[currentLanguage]}</SelectItem>
                <SelectItem value="wise_calm">{translations.wise[currentLanguage]}</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="w-5 h-5" />
              <span className="font-inter">{translations.about[currentLanguage]}</span>
            </CardTitle>
            <CardDescription className="font-cairo text-right">
              {translations.about[currentLanguage === 'french' ? 'darija' : 'french']}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold font-inter">FatimaAI v1.0</p>
              <p className="text-sm text-muted-foreground font-inter">
                {translations.aboutDesc[currentLanguage]}
              </p>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1 whitespace-pre-line">
              {translations.features[currentLanguage]}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-accent">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="font-inter text-sm">{translations.madeWithLoveFooter[currentLanguage]}</span>
            </div>
            <p className="text-xs font-cairo">
              {translations.madeWithLoveFooter[currentLanguage === 'french' ? 'darija' : 'french']}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsScreen;