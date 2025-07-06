import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, RefreshCw, Newspaper } from "lucide-react";
import { useLanguage, translations } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

interface NewsScreenProps {
  onBack: () => void;
}

interface NewsItem {
  title: string;
  url: string;
  timestamp?: string;
  category?: string;
  content?: string;
  image?: string;
}

interface NewsResponse {
  news: NewsItem[];
  lastUpdated: string;
  error?: string;
}

const NewsScreen = ({ onBack }: NewsScreenProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  const fetchNews = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { data, error } = await supabase.functions.invoke('fetch-tunisian-news');
      
      if (error) throw error;
      
      const newsData = data as NewsResponse;
      setNews(newsData.news || []);
      setLastUpdated(newsData.lastUpdated);
      
      if (isRefresh) {
        toast({
          title: language === 'darija' ? "تم التحديث" : "Actualisé",
          description: language === 'darija' ? "تم تحديث الأخبار بنجاح" : "Les actualités ont été mises à jour",
        });
      }
      
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: language === 'darija' ? "خطأ" : "Erreur",
        description: language === 'darija' ? "تعذر تحميل الأخبار" : "Impossible de charger les actualités",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleNewsClick = (article: NewsItem) => {
    setSelectedArticle(article);
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString(language === 'darija' ? 'ar-TN' : 'fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <>
      <div className="min-h-screen p-4 space-y-6 tile-pattern">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {translations.back[language]}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNews(true)}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {translations.refreshNews[language]}
          </Button>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Newspaper className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold font-cairo text-primary">
              {translations.newsTitle[language]}
            </h1>
          </div>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              {language === 'darija' ? 'آخر تحديث:' : 'Dernière mise à jour:'} {formatTime(lastUpdated)}
            </p>
          )}
        </div>

        {/* News Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {news.length > 0 ? (
              news.map((item, index) => (
                <Card
                  key={index}
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg overflow-hidden"
                  onClick={() => handleNewsClick(item)}
                >
                  <div className="grid grid-cols-3">
                    <div className="col-span-2 p-4">
                      <CardTitle className={`text-base leading-relaxed ${language === 'darija' ? 'font-cairo text-right' : 'font-inter text-left'}`}>
                        {item.title}
                      </CardTitle>
                      {item.category && (
                        <CardDescription className={`mt-2 text-xs ${language === 'darija' ? 'text-right' : 'text-left'}`}>
                          {item.category}
                        </CardDescription>
                      )}
                    </div>
                    <div className="col-span-1">
                      <img src={item.image || 'public/placeholder.svg'} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {translations.noNews[language]}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <Dialog open={!!selectedArticle} onOpenChange={(isOpen) => !isOpen && setSelectedArticle(null)}>
        <DialogContent className="max-w-md w-full mx-auto p-0">
          {selectedArticle && (
            <>
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className={language === 'darija' ? 'text-right' : 'text-left'}>
                  {selectedArticle.title}
                </DialogTitle>
              </DialogHeader>
              <div className="max-h-[70vh] overflow-y-auto p-6">
                {selectedArticle.image && (
                  <img src={selectedArticle.image} alt={selectedArticle.title} className="rounded-lg mb-4 w-full object-cover" />
                )}
                <p className={`whitespace-pre-wrap ${language === 'darija' ? 'text-right' : 'text-left'}`}>
                  {selectedArticle.content}
                </p>
              </div>
              <DialogFooter className="p-6 pt-0">
                <DialogClose asChild>
                  <Button variant="outline">{translations.close[language]}</Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewsScreen;