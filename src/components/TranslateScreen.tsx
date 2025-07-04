import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface TranslateScreenProps {
  onBack: () => void;
}

const TranslateScreen = ({ onBack }: TranslateScreenProps) => {
  const { toast } = useToast();
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState<'darija-french' | 'french-darija'>('darija-french');

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: {
          text: inputText,
          direction: direction
        }
      });

      if (error) throw error;
      setTranslatedText(data.translation);
    } catch (err: any) {
      toast({
        title: "Erreur de traduction",
        description: err.message || 'Une erreur est survenue',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchDirection = () => {
    setDirection(direction === 'darija-french' ? 'french-darija' : 'darija-french');
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="text-muted-foreground"
        >
          ← Retour
        </Button>
        <h1 className="text-xl font-semibold font-inter">Traducteur</h1>
        <div className="w-16"></div>
      </div>

      {/* Language Direction */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="font-semibold text-sm">
                {direction === 'darija-french' ? 'Darija' : 'Français'}
              </p>
              <p className="text-xs text-muted-foreground font-cairo">
                {direction === 'darija-french' ? 'تونسي' : 'Français'}
              </p>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={switchDirection}
              className="rounded-full"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </Button>
            
            <div className="text-center">
              <p className="font-semibold text-sm">
                {direction === 'darija-french' ? 'Français' : 'Darija'}
              </p>
              <p className="text-xs text-muted-foreground font-cairo">
                {direction === 'darija-french' ? 'Français' : 'تونسي'}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Input */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm">
            {direction === 'darija-french' ? 'Écrivez en Darija' : 'Écrivez en Français'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={direction === 'darija-french' ? 'كيف الصحة؟' : 'Comment ça va ?'}
            className={`min-h-[120px] ${direction === 'darija-french' ? 'font-cairo text-right' : 'font-inter'}`}
            dir={direction === 'darija-french' ? 'rtl' : 'ltr'}
          />
          <Button 
            onClick={handleTranslate}
            disabled={!inputText.trim() || isLoading}
            className="w-full mt-3"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Traduire'}
          </Button>
        </CardContent>
      </Card>

      {/* Output */}
      {translatedText && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {direction === 'darija-french' ? 'Traduction en Français' : 'Traduction en Darija'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-4 bg-muted rounded-lg ${direction === 'darija-french' ? 'font-inter' : 'font-cairo text-right'}`}
                 dir={direction === 'darija-french' ? 'ltr' : 'rtl'}>
              {translatedText}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Examples */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Exemples courants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-cairo">كيف الصحة؟</span>
            <span className="font-inter text-muted-foreground">Comment ça va ?</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-cairo">بخير الحمد لله</span>
            <span className="font-inter text-muted-foreground">Ça va bien, merci</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-cairo">وين راك؟</span>
            <span className="font-inter text-muted-foreground">Où es-tu ?</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranslateScreen;