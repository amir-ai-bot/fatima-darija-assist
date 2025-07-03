import { Button } from "@/components/ui/button";
import fatimaAvatar from "@/assets/fatima-avatar.png";
import jasmineFlower from "@/assets/jasmine-flower.png";

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 jasmine-pattern">
      {/* Decorative jasmine flowers */}
      <div className="absolute top-8 left-8 w-12 h-12 opacity-20">
        <img src={jasmineFlower} alt="" className="w-full h-full" />
      </div>
      <div className="absolute top-16 right-12 w-8 h-8 opacity-15">
        <img src={jasmineFlower} alt="" className="w-full h-full" />
      </div>
      <div className="absolute bottom-20 left-16 w-10 h-10 opacity-10">
        <img src={jasmineFlower} alt="" className="w-full h-full" />
      </div>

      {/* Main content */}
      <div className="text-center space-y-8 max-w-sm mx-auto">
        {/* Avatar */}
        <div className="relative mx-auto w-32 h-32 mb-8">
          <div className="absolute inset-0 bg-gradient-primary rounded-full opacity-20 animate-pulse"></div>
          <img 
            src={fatimaAvatar} 
            alt="Fatima AI Avatar" 
            className="w-full h-full rounded-full shadow-strong"
          />
        </div>

        {/* Welcome text */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground font-cairo">
            مرحبا، أنا فاطمة
          </h1>
          <h2 className="text-2xl font-semibold text-primary font-inter">
            Bonjour, je suis Fatima
          </h2>
          <p className="text-lg text-muted-foreground font-inter leading-relaxed">
            Ton assistante personnelle qui parle Darija et Français !
          </p>
        </div>

        {/* Features preview */}
        <div className="flex justify-center space-x-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            🎤 Voice
          </span>
          <span className="flex items-center gap-1">
            💬 Chat
          </span>
          <span className="flex items-center gap-1">
            🔄 Translate
          </span>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={onStart}
          size="xl"
          className="w-full font-inter font-semibold"
        >
          Commencer
        </Button>

        {/* Language note */}
        <p className="text-xs text-muted-foreground font-inter">
          تونس 🇹🇳 | Tunisia | Tunisie
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;