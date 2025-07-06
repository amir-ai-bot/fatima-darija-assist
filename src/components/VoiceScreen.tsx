import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff } from "lucide-react";

import { useLanguage, translations } from "@/hooks/useLanguage";

interface VoiceScreenProps {
  onBack: () => void;
}

const VoiceScreen = ({ onBack }: VoiceScreenProps) => {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [waveAnimation, setWaveAnimation] = useState(false);

  const responses = [
    'ماشي، فهمت عليك! شنوة تحب نعمل؟',
    'الطقس اليوم باهي، نسمة حلوة في تونس!',
    'نجم نساعدك في أي حاجة تحب!',
    'D\'accord, je comprends ! Que veux-tu que je fasse ?',
    'C\'est une excellente question !',
    'Je suis là pour t\'aider avec tout ce que tu veux !'
  ];

  const sampleQuestions = [
    'شنوة الطقس اليوم؟',
    'Quel temps fait-il ?',
    'وين نلقى ATB قريب؟',
    'Comment dire "bonjour" en darija ?',
    'قداش الساعة؟',
    'Raconte-moi une blague'
  ];

  const toggleListening = () => {
    if (isListening) {
      // Stop listening
      setIsListening(false);
      setWaveAnimation(false);
      
      // Simulate processing and response
      setTimeout(() => {
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setResponse(randomResponse);
      }, 500);
    } else {
      // Start listening
      setIsListening(true);
      setWaveAnimation(true);
      setTranscript('');
      setResponse('');
      
      // Simulate voice recognition
      setTimeout(() => {
        const randomQuestion = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
        setTranscript(randomQuestion);
      }, 2000);
      
      // Auto stop after 4 seconds
      setTimeout(() => {
        if (isListening) {
          setIsListening(false);
          setWaveAnimation(false);
          
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          setResponse(randomResponse);
        }
      }, 4000);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (waveAnimation) {
      interval = setInterval(() => {
        setWaveAnimation(prev => !prev);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [waveAnimation]);

  const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="text-muted-foreground"
        >
          {translations.back[language]}
        </Button>
        <div className="text-center">
          <h2 className="font-semibold font-inter">{translations.voiceTitle[language]}</h2>
          <p className="text-xs text-muted-foreground font-cairo">{translations.voiceTitle[language === 'french' ? 'darija' : 'french']}</p>
        </div>
        <div className="w-16"></div>
      </div>

      {/* Main Voice Interface */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
        
        {/* Voice Button */}
        <div className="relative">
          {/* Animated rings for listening state */}
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping"></div>
              <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-pulse scale-125"></div>
            </>
          )}
          
          <Button
            variant="voice"
            size="voice"
            onClick={toggleListening}
            className={`w-32 h-32 shadow-strong transition-all duration-300 ${
              isListening ? 'scale-110 voice-wave' : 'hover:scale-105'
            }`}
          >
            {isListening ? (
              <MicOff className="w-12 h-12" />
            ) : (
              <Mic className="w-12 h-12" />
            )}
          </Button>
        </div>

        {/* Status */}
        <div className="text-center space-y-2">
          {isListening ? (
            <>
              <h3 className="text-xl font-semibold text-primary font-inter">
                {translations.voiceListening[language]}
              </h3>
              <p className="text-sm text-muted-foreground font-cairo">
                {translations.voiceListening[language === 'french' ? 'darija' : 'french']}
              </p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-foreground font-inter">
                {translations.voiceStatus[language]}
              </h3>
              <p className="text-sm text-muted-foreground font-cairo">
                {translations.voiceStatus[language === 'french' ? 'darija' : 'french']}
              </p>
            </>
          )}
        </div>

        {/* Transcript */}
        {transcript && (
          <Card className="w-full max-w-md">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2 font-inter">
                {translations.youSaid[language]}
              </p>
              <p className={`text-lg font-semibold ${
                isArabic(transcript) ? 'font-cairo text-right' : 'font-inter'
              }`}>
                "{transcript}"
              </p>
            </CardContent>
          </Card>
        )}

        {/* Response */}
        {response && (
          <Card className="w-full max-w-md bg-gradient-primary text-primary-foreground">
            <CardContent className="p-4 text-center">
              <p className="text-sm opacity-90 mb-2 font-inter">
                {translations.fatimaResponds[language]}
              </p>
              <p className={`text-lg font-semibold ${
                isArabic(response) ? 'font-cairo text-right' : 'font-inter'
              }`}>
                "{response}"
              </p>
            </CardContent>
          </Card>
        )}

        {/* Sample questions */}
        {!isListening && !transcript && (
          <div className="w-full max-w-md space-y-3">
            <h4 className="text-sm font-semibold text-center text-muted-foreground font-inter">
              {translations.sampleQuestions[language]}
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {sampleQuestions.slice(0, 3).map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className={`justify-start ${
                    isArabic(question) ? 'font-cairo text-right' : 'font-inter text-left'
                  }`}
                  onClick={() => {
                    setTranscript(question);
                    setTimeout(() => {
                      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                      setResponse(randomResponse);
                    }, 1000);
                  }}
                >
                  "{question}"
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceScreen;