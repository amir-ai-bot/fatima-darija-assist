import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, MessageCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage, translations } from "@/hooks/useLanguage";

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface ChatHistoryScreenProps {
  onBack: () => void;
  onSelectSession: (sessionId: string) => void;
}

const ChatHistoryScreen = ({ onBack, onSelectSession }: ChatHistoryScreenProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchChatSessions();
    }
  }, [user]);

  const fetchChatSessions = async () => {
    if (!user) return;

    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Get message count for each session
      if (sessionsData) {
        const sessionsWithCount = await Promise.all(
          sessionsData.map(async (session) => {
            const { count } = await supabase
              .from('chat_messages')
              .select('*', { count: 'exact', head: true })
              .eq('session_id', session.id);
            
            return {
              ...session,
              message_count: count || 0
            };
          })
        );
        setSessions(sessionsWithCount);
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      toast({
        title: "Error",
        description: "Could not load chat history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(sessions.filter(s => s.id !== sessionId));
      toast({
        title: "Success",
        description: "Chat session deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Could not delete chat session.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
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
          {translations.back[language]}
        </Button>
        <div className="text-center">
          <h2 className="font-semibold font-inter">
            {language === 'french' ? 'Historique des conversations' : 'تاريخ المحادثات'}
          </h2>
        </div>
        <div className="w-16"></div>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : sessions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">
                {language === 'french' ? 'Aucune conversation' : 'لا توجد محادثات'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'french' 
                  ? 'Commencez une nouvelle conversation avec Fatima' 
                  : 'ابدأ محادثة جديدة مع فاطمة'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-inter line-clamp-2">
                      {session.title || (language === 'french' ? 'Conversation' : 'محادثة')}
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(session.updated_at)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSession(session.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {session.message_count} {language === 'french' ? 'messages' : 'رسائل'}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onSelectSession(session.id)}
                  >
                    {language === 'french' ? 'Continuer' : 'متابعة'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatHistoryScreen;