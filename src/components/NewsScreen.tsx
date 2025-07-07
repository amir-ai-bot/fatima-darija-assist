import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, RefreshCw, Newspaper, Search, TrendingUp, Globe, Briefcase, Zap } from "lucide-react";
import { useLanguage, translations } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import AdBanner from "./AdBanner";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("featured");

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

  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categorizedNews = {
    featured: filteredNews.slice(0, 5),
    recent: filteredNews,
    trending: filteredNews.filter(item => item.category === 'وطنية'),
    business: filteredNews.filter(item => item.category === 'اقتصاد'),
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b p-4 space-y-4">
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
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={language === 'darija' ? "البحث في الأخبار..." : "Rechercher des actualités..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="featured" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                {language === 'darija' ? 'مميزة' : 'Vedette'}
              </TabsTrigger>
              <TabsTrigger value="recent" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                {language === 'darija' ? 'حديثة' : 'Récent'}
              </TabsTrigger>
              <TabsTrigger value="trending" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                {language === 'darija' ? 'وطنية' : 'National'}
              </TabsTrigger>
              <TabsTrigger value="business" className="text-xs">
                <Briefcase className="w-3 h-3 mr-1" />
                {language === 'darija' ? 'اقتصاد' : 'Business'}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Ad Banner */}
          <AdBanner size="medium" />

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Featured News - Large Cards */}
              <TabsContent value="featured" className="space-y-4">
                <div className="space-y-4">
                  {categorizedNews.featured.length > 0 ? (
                    <>
                      {/* Hero Article */}
                      {categorizedNews.featured[0] && (
                        <Card 
                          className="cursor-pointer transition-all duration-200 hover:shadow-lg overflow-hidden"
                          onClick={() => handleNewsClick(categorizedNews.featured[0])}
                        >
                          <div className="relative">
                            <img 
                              src={categorizedNews.featured[0].image || '/placeholder.svg'} 
                              alt={categorizedNews.featured[0].title}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40" />
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                              {categorizedNews.featured[0].category && (
                                <Badge variant="secondary" className="mb-2">
                                  {categorizedNews.featured[0].category}
                                </Badge>
                              )}
                              <h3 className={`text-lg font-bold leading-tight ${language === 'darija' ? 'font-cairo text-right' : 'font-inter text-left'}`}>
                                {categorizedNews.featured[0].title}
                              </h3>
                            </div>
                          </div>
                        </Card>
                      )}
                      
                      {/* Other Featured Articles */}
                      {categorizedNews.featured.slice(1).map((item, index) => (
                        <Card
                          key={index + 1}
                          className="cursor-pointer transition-all duration-200 hover:shadow-lg overflow-hidden"
                          onClick={() => handleNewsClick(item)}
                        >
                          <div className="flex">
                            <div className="flex-1 p-4">
                              <div className="flex items-start justify-between mb-2">
                                {item.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.category}
                                  </Badge>
                                )}
                              </div>
                              <h3 className={`text-sm font-semibold leading-tight ${language === 'darija' ? 'font-cairo text-right' : 'font-inter text-left'}`}>
                                {item.title}
                              </h3>
                            </div>
                            <div className="w-20 h-20 m-4">
                              <img 
                                src={item.image || '/placeholder.svg'} 
                                alt={item.title}
                                className="w-full h-full object-cover rounded"
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {translations.noNews[language]}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Other Tabs */}
              {['recent', 'trending', 'business'].map((tab) => (
                <TabsContent key={tab} value={tab} className="space-y-4">
                  {/* Small Ad */}
                  <AdBanner size="small" />
                  
                  <div className="space-y-3">
                    {categorizedNews[tab as keyof typeof categorizedNews].length > 0 ? (
                      categorizedNews[tab as keyof typeof categorizedNews].map((item, index) => (
                        <Card
                          key={index}
                          className="cursor-pointer transition-all duration-200 hover:shadow-lg overflow-hidden"
                          onClick={() => handleNewsClick(item)}
                        >
                          <div className="flex">
                            <div className="flex-1 p-3">
                              <div className="flex items-start justify-between mb-2">
                                {item.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.category}
                                  </Badge>
                                )}
                              </div>
                              <h3 className={`text-sm font-medium leading-tight ${language === 'darija' ? 'font-cairo text-right' : 'font-inter text-left'}`}>
                                {item.title}
                              </h3>
                            </div>
                            <div className="w-16 h-16 m-3">
                              <img 
                                src={item.image || '/placeholder.svg'} 
                                alt={item.title}
                                className="w-full h-full object-cover rounded"
                              />
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {translations.noNews[language]}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
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