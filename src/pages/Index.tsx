import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Loader2 } from "lucide-react";
import WelcomeScreen from "@/components/WelcomeScreen";
import DashboardScreen from "@/components/DashboardScreen";
import ChatScreen from "@/components/ChatScreen";
import VoiceScreen from "@/components/VoiceScreen";
import SettingsScreen from "@/components/SettingsScreen";
import AuthScreen from "@/components/AuthScreen";
import TranslateScreen from "@/components/TranslateScreen";
import PlacesScreen from "@/components/PlacesScreen";
import NewsScreen from "@/components/NewsScreen";
import ChatHistoryScreen from "@/components/ChatHistoryScreen";
import ProfileEditScreen from "@/components/ProfileEditScreen";
import SubscriptionScreen from "@/components/SubscriptionScreen";
import { useAuth } from "@/hooks/useAuth";

type Screen = 'welcome' | 'dashboard' | 'chat' | 'voice' | 'translate' | 'places' | 'settings' | 'news' | 'history' | 'profile' | 'subscription';

const Index = () => {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>();

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
        return <ChatScreen onBack={handleBack} initialSessionId={selectedSessionId} />;
      case 'voice':
        return <VoiceScreen onBack={handleBack} />;
      case 'settings':
        return <SettingsScreen onBack={handleBack} />;
      case 'translate':
        return <TranslateScreen onBack={handleBack} />;
      case 'places':
        return <PlacesScreen onBack={handleBack} />;
      case 'news':
        return <NewsScreen onBack={handleBack} />;
      case 'history':
        return <ChatHistoryScreen onBack={handleBack} onSelectSession={(sessionId) => {
          setSelectedSessionId(sessionId);
          setCurrentScreen('chat');
        }} />;
      case 'profile':
        return <ProfileEditScreen onBack={handleBack} />;
      case 'subscription':
        return <SubscriptionScreen onBack={handleBack} />;
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
