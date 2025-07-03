import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MessageCircle, MapPin, Sun, Lightbulb } from "lucide-react";

interface DashboardScreenProps {
  onNavigate: (screen: string) => void;
}

const DashboardScreen = ({ onNavigate }: DashboardScreenProps) => {
  const quickActions = [
    {
      icon: MessageCircle,
      title: "Traduire",
      titleArabic: "ترجم",
      description: "Darija ↔ Français",
      color: "bg-gradient-primary",
      action: () => onNavigate('translate')
    },
    {
      icon: MessageCircle,
      title: "Poser une question",
      titleArabic: "اسأل سؤال",
      description: "Chat avec Fatima",
      color: "bg-gradient-secondary",
      action: () => onNavigate('chat')
    },
    {
      icon: MapPin,
      title: "Trouver un lieu",
      titleArabic: "البحث عن مكان",
      description: "ATB, Poste, Hôpital...",
      color: "bg-gradient-accent",
      action: () => onNavigate('places')
    },
    {
      icon: Mic,
      title: "Assistant vocal",
      titleArabic: "مساعد صوتي",
      description: "Parlez avec Fatima",
      color: "bg-gradient-primary",
      action: () => onNavigate('voice')
    }
  ];

  return (
    <div className="min-h-screen p-4 space-y-6 tile-pattern">
      {/* Header */}
      <div className="text-center pt-4 space-y-2">
        <h1 className="text-2xl font-bold font-cairo text-primary">
          أهلا وسهلا
        </h1>
        <h2 className="text-xl font-semibold font-inter text-foreground">
          Bienvenue sur FatimaAI
        </h2>
        <p className="text-sm text-muted-foreground font-inter">
          Votre assistante personnelle tunisienne
        </p>
      </div>

      {/* Weather Card */}
      <Card className="bg-gradient-secondary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-inter">Tunis</CardTitle>
              <CardDescription className="font-cairo">تونس العاصمة</CardDescription>
            </div>
            <Sun className="w-8 h-8 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">24°C</p>
              <p className="text-sm text-muted-foreground">Ensoleillé</p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>Min: 18°C</p>
              <p>Max: 28°C</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Tip */}
      <Card className="bg-gradient-accent">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <Lightbulb className="w-5 h-5 text-accent-foreground" />
            <CardTitle className="text-base font-inter">Astuce du jour</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-inter mb-2">
            Pour dire "Comment ça va ?" en darija tunisien :
          </p>
          <p className="font-cairo text-right text-lg font-semibold">
            "كيفاش الصحة؟" أو "كي راك؟"
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold font-inter text-foreground">
          Actions rapides
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <Card 
              key={index}
              className="cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
              onClick={action.action}
            >
              <CardContent className="p-4 text-center space-y-3">
                <div className={`w-12 h-12 rounded-2xl ${action.color} flex items-center justify-center mx-auto shadow-medium`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm font-inter">{action.title}</h4>
                  <p className="text-xs font-cairo text-right">{action.titleArabic}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-inter">
                    {action.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-8 pb-4">
        <p className="text-xs text-muted-foreground font-inter">
          Fait avec ❤️ pour la Tunisie 🇹🇳
        </p>
      </div>
    </div>
  );
};

export default DashboardScreen;