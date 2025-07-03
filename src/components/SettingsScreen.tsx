import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Languages, User, Info, Heart } from "lucide-react";
import fatimaAvatar from "@/assets/fatima-avatar.png";

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<'darija' | 'french'>('french');

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'french' ? 'darija' : 'french');
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
              <Button variant="outline" onClick={toggleLanguage}>
                {language === 'french' ? 'عربي' : 'FR'}
              </Button>
            </div>
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