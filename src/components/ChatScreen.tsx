import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, Mic, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";

import { useLanguage, translations } from "@/hooks/useLanguage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useRef } from "react";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  language: 'darija' | 'french';
  timestamp: Date;
  reaction?: string; // Add reaction field
  image?: string; // Add image field for base64 data
}

interface ChatScreenProps {
  onBack: () => void;
  initialSessionId?: string;
}

const personalityOptions = [
  { value: "friendly_warm", label: "ودودة ودافئة" },
  { value: "funny_sassy", label: "مضحكة ومرحة" },
  { value: "wise_calm", label: "حكيمة وهادئة" },
];

const reactions = [
  { emoji: '👍', label: 'Like' },
  { emoji: '😂', label: 'Haha' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '👎', label: 'Dislike' },
];

function ReactionBar({ selected, onSelect }: { selected?: string, onSelect: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={`text-xl transition-transform ${selected ? 'scale-125' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label={selected ? `Reacted: ${selected}` : 'React'}
      >
        {selected || '👍'}
      </button>
      {open && (
        <div className="absolute left-8 bottom-0 flex bg-white rounded-full shadow-lg px-2 py-1 z-10 transition-all duration-200">
          {reactions.map((r) => (
            <button
              key={r.emoji}
              className={`text-xl mx-1 transition-transform hover:scale-150 ${selected === r.emoji ? 'ring-2 ring-blue-400' : ''}`}
              onClick={() => {
                onSelect(r.emoji);
                setOpen(false);
              }}
              title={r.label}
              type="button"
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingMessage({ message }: { message: string }) {
  const [dots, setDots] = useState('');
  const { language } = useLanguage();
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  const isArabic = message.includes('بتحليل') || message.includes('بفكر') || message.includes('بكتب') || message.includes('بجمع');

  return (
    <div className="flex justify-start">
      <Card className="max-w-[80%] bg-card">
        <CardContent className="p-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-white text-sm font-bold">ف</span>
            </div>
            <div className="flex-1">
              <p className={`text-sm text-muted-foreground ${isArabic ? 'font-cairo text-right' : 'font-inter'}`}>
                {message}{dots}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const ChatScreen = ({ onBack, initialSessionId }: ChatScreenProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [error, setError] = useState<string | null>(null);
  const [personality, setPersonality] = useState("friendly_warm");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        // Fix: use correct type for mapping Supabase rows to Message
        const loadedMessages = data.map((msg: { content: string; created_at: string; id: string; is_user_message: boolean; language: string; session_id: string; user_id: string; image?: string; [key: string]: any }) => {
          const base = {
            id: msg.id,
            text: msg.content,
            isUser: msg.is_user_message,
            language: msg.language,
            timestamp: new Date(msg.created_at),
            image: msg.image || undefined,
          };
          if (msg.reaction) {
            return { ...base, reaction: msg.reaction };
          }
          return base;
        }) as Message[];
        setMessages(loadedMessages);
      }
    };

    fetchHistory();
  }, [sessionId, toast]);

  useEffect(() => {
    // Fetch user profile to get personality
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('personality')
        .eq('user_id', user.id)
        .single();
      if (data && data.personality) {
        setPersonality(data.personality);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSendMessage = async () => {
    const messageText = inputText.trim();
    if (!messageText && !imageBase64) return; // Only block if both are empty
    if (!user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText || "[Image]", // Show placeholder if no text
      isUser: true,
      language: 'french', // Or detect language
      timestamp: new Date(),
      image: imageBase64 || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsLoading(true);
    setError(null);
    
    // Set appropriate loading message based on content
    if (imageBase64 && !messageText.trim()) {
      setLoadingMessage(language === 'darija' ? "بتحليل الصورة..." : "Analyzing image...");
    } else if (imageBase64 && messageText.trim()) {
      setLoadingMessage(language === 'darija' ? "بتحليل الصورة وبفكر..." : "Analyzing image and thinking...");
    } else {
      // Randomize thinking messages for variety
      const thinkingMessages = language === 'darija' 
        ? ["بفكر...", "بكتب...", "بجمع أفكاري...", "بفكر في الرد المناسب..."]
        : ["Thinking...", "Writing...", "Gathering thoughts...", "Finding the right words..."];
      setLoadingMessage(thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)]);
    }

    try {
      const body: any = {
        message: messageText,
        language: 'french', // Pass selected language
        sessionId: sessionId,
        personality,
      };
      if (imageBase64) {
        body.image = imageBase64;
        console.log('Sending image with base64 length:', imageBase64.length);
      }

      console.log('Sending request with body:', {
        message: messageText,
        hasImage: !!imageBase64,
        imageLength: imageBase64?.length || 0
      });

      const { data, error } = await supabase.functions.invoke('chat-with-fatima', {
        body: body
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

    } catch (err: unknown) {
      setError('Failed to get response from Fatima. Please try again.');
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'An unexpected error occurred.',
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
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

  // Add this function to update personality in Supabase
  const updatePersonality = async (newPersonality: string) => {
    setPersonality(newPersonality);
    if (user) {
      await supabase
        .from('profiles')
        .update({ personality: newPersonality })
        .eq('user_id', user.id);
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, reaction: emoji } : msg
      )
    );
    await supabase
      .from('chat_messages')
      .update({ reaction: emoji })
      .eq('id', messageId);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
        // Extract base64 data without the data URL prefix
        const base64Data = result.split(',')[1];
        if (base64Data) {
          setImageBase64(base64Data);
          console.log('Image loaded, base64 length:', base64Data.length);
        } else {
          console.error('Failed to extract base64 data from image');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
                {/* Display image if present */}
                {message.image && (
                  <div className="mb-2">
                    <img 
                      src={`data:image/jpeg;base64,${message.image}`} 
                      alt="Shared image" 
                      className="max-w-full h-auto rounded-lg"
                      style={{ maxHeight: '200px' }}
                    />
                  </div>
                )}
                {/* Display text if present */}
                {message.text && message.text !== "[Image]" && (
                  <p className={`text-sm ${
                    message.language === 'darija' ? 'font-cairo text-right' : 'font-inter'
                  }`}>
                    {message.text}
                  </p>
                )}
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
                {/* Facebook-style ReactionBar for AI messages */}
                {!message.isUser && (
                  <ReactionBar
                    selected={message.reaction}
                    onSelect={(emoji) => handleReact(message.id, emoji)}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        ))}
        
        {/* Loading message */}
        {isLoading && <LoadingMessage message={loadingMessage} />}
      </div>

      {/* Personality Selector - moved here above the input */}
      <div className="px-4 pt-2 pb-0">
        <Select value={personality} onValueChange={updatePersonality}>
          <SelectTrigger>
            <SelectValue placeholder="اختر شخصية فاطمة" />
          </SelectTrigger>
          <SelectContent>
            {personalityOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Image preview above chat input */}
      {imagePreview && (
        <div className="flex items-center gap-2 mb-2">
          <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded border" />
          <button onClick={handleRemoveImage} className="text-xs text-red-500">Remove</button>
        </div>
      )}
      {/* Input */}
      <div className="p-4 border-t bg-card/50 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          {/* Mic button */}
          <Button
            variant="voice"
            size="voice"
            onClick={handleVoiceButtonClick}
            className={isListening ? 'voice-wave' : ''}
          >
            <Mic className="w-6 h-6" />
          </Button>
          {/* Input + image upload + send */}
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
            {/* Image upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 ml-2 rounded bg-muted hover:bg-accent"
              title="Upload image"
              style={{ fontSize: 20 }}
            >
              📷
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
            {/* Send button */}
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={(!inputText.trim() && !imageBase64) || isLoading || !user}
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