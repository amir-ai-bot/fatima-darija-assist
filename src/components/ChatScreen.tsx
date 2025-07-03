import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, Mic } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  language: 'darija' | 'french';
  timestamp: Date;
}

interface ChatScreenProps {
  onBack: () => void;
}

const ChatScreen = ({ onBack }: ChatScreenProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'السلام عليكم! كيفاش نجم نعاونك اليوم؟',
      isUser: false,
      language: 'darija',
      timestamp: new Date()
    },
    {
      id: '2', 
      text: 'Salut ! Comment puis-je t\'aider aujourd\'hui ?',
      isUser: false,
      language: 'french',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      language: 'french',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'ماشي، فهمت عليك! خلاص نحل ليك هاك الحاجة.',
        'D\'accord, je comprends ! Je vais t\'aider avec ça.',
        'الطقس اليوم باهي، نسمة حلوة في تونس!',
        'C\'est une excellente question ! Laisse-moi réfléchir...'
      ];
      
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        language: Math.random() > 0.5 ? 'darija' : 'french',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    // Simulate voice recognition
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        setInputText("شنوة الطقس اليوم؟");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="text-muted-foreground"
        >
          ← Retour
        </Button>
        <div className="text-center">
          <h2 className="font-semibold font-inter">Fatima AI</h2>
          <p className="text-xs text-muted-foreground">En ligne</p>
        </div>
        <div className="w-16"></div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <Card className={`max-w-[80%] ${
              message.isUser 
                ? 'bg-gradient-primary text-primary-foreground' 
                : 'bg-card'
            }`}>
              <CardContent className="p-3">
                <p className={`text-sm ${
                  message.language === 'darija' ? 'font-cairo text-right' : 'font-inter'
                }`}>
                  {message.text}
                </p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Voice Listening Indicator */}
      {isListening && (
        <div className="flex justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-2 voice-wave">
              <Mic className="w-6 h-6 text-primary-foreground" />
            </div>
            <p className="text-sm text-muted-foreground font-inter">Je t'écoute...</p>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t bg-card/50 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <Button
            variant="voice"
            size="voice"
            onClick={toggleVoice}
            className={isListening ? 'voice-wave' : ''}
          >
            <Mic className="w-6 h-6" />
          </Button>
          
          <div className="flex-1 flex items-center bg-input rounded-2xl px-4 py-2 border">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tapez votre message..."
              className="flex-1 bg-transparent border-none outline-none font-inter"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className="w-8 h-8 rounded-full"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;