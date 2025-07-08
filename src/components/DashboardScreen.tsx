import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MessageCircle, MapPin, Sun, Lightbulb, Loader2, MapPinIcon, Newspaper, History, User, Crown, Menu } from "lucide-react";
import { useLanguage, translations } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";

interface DashboardScreenProps {
  onNavigate: (screen: string) => void;
}

interface DailyTip {
  french: string;
  arabic: string;
  day: string;
}

interface WeatherData {
  location: {
    name: string;
    country: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    humidity: number;
    wind_kph: number;
    feelslike_c: number;
  };
  forecast: {
    forecastday: [{
      day: {
        maxtemp_c: number;
        mintemp_c: number;
      }
    }]
  };
}

const DashboardScreen = ({ onNavigate }: DashboardScreenProps) => {
  const { language } = useLanguage();
  const [dailyTip, setDailyTip] = useState<DailyTip | null>(null);
  const [loadingTip, setLoadingTip] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);
  
  const quickActions = [
    {
      icon: MessageCircle,
      title: translations.translate[language],
      description: translations.translateDesc[language],
      color: "bg-gradient-primary",
      action: () => onNavigate('translate')
    },
    {
      icon: MessageCircle,
      title: translations.askQuestion[language],
      description: translations.chatDesc[language],
      color: "bg-gradient-secondary",
      action: () => onNavigate('chat')
    },
    {
      icon: MapPin,
      title: translations.findPlace[language],
      description: translations.placesDesc[language],
      color: "bg-gradient-accent",
      action: () => onNavigate('places')
    },
    {
      icon: Mic,
      title: translations.voiceAssistant[language],
      description: translations.voiceDesc[language],
      color: "bg-gradient-primary",
      action: () => onNavigate('voice')
    },
    {
      icon: Newspaper,
      title: translations.news[language],
      description: translations.newsDesc[language],
      color: "bg-gradient-secondary",
      action: () => onNavigate('news')
    }
  ];

  const extraFeatures = [
    {
      icon: Crown,
      title: translations.subscription[language],
      description: language === 'french' ? 'Plans premium' : 'الخطط المميزة',
      color: "bg-gradient-secondary",
      action: () => onNavigate('subscription')
    }
  ];

  const translateWeatherCondition = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
      return translations.sunny[language];
    } else if (conditionLower.includes('cloud')) {
      return translations.cloudy[language];
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return translations.rainy[language];
    }
    return condition;
  };

  const getLocationAndWeather = async () => {
    if (!navigator.geolocation) {
      setLoadingWeather(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocationEnabled(true);
        try {
          const { data, error } = await supabase.functions.invoke('get-weather', {
            body: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          });
          
          if (error) throw error;
          setWeather(data);
        } catch (error) {
          console.error('Error fetching weather:', error);
          // Fallback weather for Tunis
          setWeather({
            location: { name: "Tunis", country: "TN" },
            current: {
              temp_c: 24,
              condition: { text: "Ensoleillé", icon: "☀️" },
              humidity: 65,
              wind_kph: 12,
              feelslike_c: 26
            },
            forecast: {
              forecastday: [{
                day: { maxtemp_c: 28, mintemp_c: 18 }
              }]
            }
          });
        } finally {
          setLoadingWeather(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Show fallback weather on location error
        setWeather({
          location: { name: "Tunis", country: "TN" },
          current: {
            temp_c: 24,
            condition: { text: "Ensoleillé", icon: "☀️" },
            humidity: 65,
            wind_kph: 12,
            feelslike_c: 26
          },
          forecast: {
            forecastday: [{
              day: { maxtemp_c: 28, mintemp_c: 18 }
            }]
          }
        });
        setLoadingWeather(false);
      },
      options
    );
  };

  useEffect(() => {
    const fetchDailyTip = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('daily-tip', {
          body: { language }
        });
        if (error) throw error;
        setDailyTip(data.tip);
      } catch (error) {
        console.error('Error fetching daily tip:', error);
        // Fallback tip
        setDailyTip({
          french: "Pour dire 'Comment ça va ?' en darija tunisien :",
          arabic: "كيفاش الصحة؟",
          day: new Date().toLocaleDateString(language === 'french' ? 'fr-FR' : 'ar-TN', { weekday: 'long' })
        });
      } finally {
        setLoadingTip(false);
      }
    };

    fetchDailyTip();
    getLocationAndWeather();
  }, [language]);

  return (
    <div className="min-h-screen p-4 space-y-6 tile-pattern">
      {/* Header */}
      <div className="text-center pt-4 space-y-2">
        <h1 className="text-2xl font-bold font-cairo text-primary">
          {language === 'darija' ? 'أهلا وسهلا' : 'Bienvenue'}
        </h1>
        <h2 className="text-xl font-semibold font-inter text-foreground">
          {translations.dashboard[language]}
        </h2>
        <p className="text-sm text-muted-foreground font-inter">
          {translations.subtitle[language]}
        </p>
      </div>

      {/* Weather Card */}
      <Card className="bg-gradient-secondary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-inter">
                {loadingWeather ? translations.loading[language] : (
                  language === 'darija' 
                    ? `${translations.todayWeather[language]} ${weather?.location.name || 'تونس'}`
                    : `${weather?.location.name || 'Tunis'}`
                )}
              </CardTitle>
              {!loadingWeather && weather && (
                <CardDescription className="font-cairo">
                  {language === 'darija' ? weather.location.name : ''}
                </CardDescription>
              )}
            </div>
            {!locationEnabled ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={getLocationAndWeather}
                className="flex items-center gap-2"
              >
                <MapPinIcon className="w-4 h-4" />
                {translations.enableLocation[language]}
              </Button>
            ) : (
              <Sun className="w-8 h-8 text-primary" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadingWeather ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : weather ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{weather.current.temp_c}°C</p>
                <p className="text-sm text-muted-foreground">
                  {translateWeatherCondition(weather.current.condition.text)}
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{translations.min[language]}: {weather.forecast.forecastday[0].day.mintemp_c}°C</p>
                <p>{translations.max[language]}: {weather.forecast.forecastday[0].day.maxtemp_c}°C</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              {translations.enableLocation[language]}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Daily Tip */}
      <Card className="bg-gradient-accent">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <Lightbulb className="w-5 h-5 text-accent-foreground" />
            <CardTitle className="text-base font-inter">
              {translations.dailyTip[language]} {dailyTip?.day && `- ${dailyTip.day}`}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loadingTip ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : dailyTip ? (
            language === 'darija' ? (
              <p className="font-cairo text-right text-lg font-semibold">
                "{dailyTip.arabic}"
              </p>
            ) : (
              <p className="text-sm font-inter">
                {dailyTip.french}
              </p>
            )
          ) : (
            <p className="text-sm text-center text-muted-foreground">
              {language === 'darija' 
                ? "تعذر تحميل النصيحة اليومية"
                : "Impossible de charger l'astuce du jour"
              }
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold font-inter text-foreground">
          {translations.quickActions[language]}
        </h3>
        <div className="grid grid-cols-2 gap-3">
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
                  <p className="text-xs text-muted-foreground mt-1 font-inter">
                    {action.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Extra Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold font-inter text-foreground">
          {language === 'french' ? 'Plus de fonctionnalités' : 'المزيد من الميزات'}
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {extraFeatures.map((feature, index) => (
            <Card 
              key={index}
              className="cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              onClick={feature.action}
            >
              <CardContent className="p-4 flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center shadow-medium`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm font-inter">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 font-inter">
                    {feature.description}
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
          {translations.madeWithLove[language]}
        </p>
      </div>
    </div>
  );
};

export default DashboardScreen;