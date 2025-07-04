import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Loader2 } from "lucide-react";
import WelcomeScreen from "@/components/WelcomeScreen";
import DashboardScreen from "@/components/DashboardScreen";
import ChatScreen from "@/components/ChatScreen";
import VoiceScreen from "@/components/VoiceScreen";
import SettingsScreen from "@/components/SettingsScreen";
import AuthScreen from "@/components/AuthScreen";
import { useAuth } from "@/hooks/useAuth";

type Screen = 'welcome' | 'dashboard' | 'chat' | 'voice' | 'translate' | 'places' | 'settings';

const Index = () => {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');

  const navigateToScreen = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleStart = () => {
    setCurrentScreen('dashboard');
  };

  const handleBack = () => {
    setCurrentScreen('dashboard');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      );
    }

    if (!user) {
      return <AuthScreen onSuccess={() => {}} />;
    }

    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onStart={handleStart} />;
      case 'dashboard':
        return (
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10"
              onClick={() => navigateToScreen('settings')}
            >
              <Settings className="w-5 h-5" />
            </Button>
            <DashboardScreen onNavigate={navigateToScreen} />
          </div>
        );
      case 'chat':
        return <ChatScreen onBack={handleBack} />;
      case 'voice':
        return <VoiceScreen onBack={handleBack} />;
      case 'settings':
        return <SettingsScreen onBack={handleBack} />;
      case 'translate':
        // Placeholder for translate screen
        return (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold font-inter">Traducteur</h1>
              <p className="text-muted-foreground font-cairo">مترجم</p>
              <p className="text-sm text-muted-foreground">Darija ↔ Français</p>
              <Button onClick={handleBack}>Retour</Button>
            </div>
          </div>
        );
      case 'places':
        // Placeholder for places screen
        return (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold font-inter">Lieux à proximité</h1>
              <p className="text-muted-foreground font-cairo">أماكن قريبة</p>
              <p className="text-sm text-muted-foreground">ATB, Poste, Hôpitaux...</p>
              <Button onClick={handleBack}>Retour</Button>
            </div>
          </div>
        );
      default:
        return <WelcomeScreen onStart={handleStart} />;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background relative overflow-hidden">
      {renderContent()}
    </div>
  );
};

export default Index;
