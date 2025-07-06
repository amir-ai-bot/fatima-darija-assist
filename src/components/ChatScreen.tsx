import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, Mic, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";

import { useLanguage, translations } from "@/hooks/useLanguage";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  language: 'darija' | 'french';
  timestamp: Date;
}

interface ChatScreenProps {
  onBack: () => void;
  initialSessionId?: string;
}

const ChatScreen = ({ onBack, initialSessionId }: ChatScreenProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!sessionId) return;

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching chat history:', error);
        toast({
          title: "Error",
          description: "Could not load previous messages.",
          variant: "destructive",
        });
      } else if (data) {
        const loadedMessages = data.map((msg: any) => ({
          id: msg.id,
          text: msg.content,
          isUser: msg.is_user_message,
          language: msg.language,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(loadedMessages);
      }
    };

    fetchHistory();
  }, [sessionId, toast]);

  const handleSendMessage = async () => {
    const messageText = inputText.trim();
    if (!messageText || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      language: 'french', // Or detect language
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-fatima', {
        body: {
          message: messageText,
          language: 'french', // Pass selected language
          sessionId: sessionId
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        language: data.language,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

    } catch (err: any) {
      setError('Failed to get response from Fatima. Please try again.');
      toast({
        title: "Error",
        description: err.message || 'An unexpected error occurred.',
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const { isListening, startListening, stopListening } = useVoiceRecognition({
    onResult: (result) => {
      setInputText(result);
    },
    onError: (error) => {
      toast({
        title: "Voice Error",
        description: `Speech recognition error: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleVoiceButtonClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening('fr-FR'); // Or 'ar-TN' for Darija
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
          {translations.back[language]}
        </Button>
        <div className="text-center">
          <h2 className="font-semibold font-inter">{translations.chatTitle[language]}</h2>
          <p className="text-xs text-muted-foreground">{translations.online[language]}</p>
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
            <p className="text-sm text-muted-foreground font-inter">{translations.voiceListening[language]}</p>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t bg-card/50 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <Button
            variant="voice"
            size="voice"
            onClick={handleVoiceButtonClick}
            className={isListening ? 'voice-wave' : ''}
          >
            <Mic className="w-6 h-6" />
          </Button>
          
          <div className="flex-1 flex items-center bg-input rounded-2xl px-4 py-2 border">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={translations.chatPlaceholder[language]}
              className="flex-1 bg-transparent border-none outline-none font-inter"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading || !user}
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading || !user}
              className="w-8 h-8 rounded-full"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;