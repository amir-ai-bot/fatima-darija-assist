import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsItem {
  title: string;
  url: string;
  timestamp?: string;
  category?: string;
}

const extractNewsFromMosaique = async (): Promise<NewsItem[]> => {
  try {
    const response = await fetch('https://www.mosaiquefm.net/ar/actualites/تونس-وطنية/1');
    const html = await response.text();
    
    // Extract news items using regex patterns
    const newsPattern = /<h3><a href="([^"]+)"[^>]*>([^<]+)<\/a><\/h3>/g;
    const timestampPattern = /(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2})/g;
    
    const newsItems: NewsItem[] = [];
    let match;
    
    while ((match = newsPattern.exec(html)) !== null) {
      const url = match[1];
      const title = match[2].trim();
      
      if (url && title && !url.includes('undefined')) {
        newsItems.push({
          title: title,
          url: url.startsWith('http') ? url : `https://www.mosaiquefm.net${url}`,
          category: 'وطنية'
        });
      }
    }
    
    return newsItems.slice(0, 10); // Return latest 10 news
  } catch (error) {
    console.error('Error fetching Mosaique FM news:', error);
    return [];
  }
};

const extractNewsFromIFM = async (): Promise<NewsItem[]> => {
  try {
    const response = await fetch('https://www.ifm.tn/ar/articles/الأخبار-الوطنية/9');
    const html = await response.text();
    
    // Extract news items from IFM
    const newsPattern = /<h3[^>]*><a href="([^"]+)"[^>]*>([^<]+)<\/a><\/h3>/g;
    const newsItems: NewsItem[] = [];
    let match;
    
    while ((match = newsPattern.exec(html)) !== null) {
      const url = match[1];
      const title = match[2].trim();
      
      if (url && title) {
        newsItems.push({
          title: title,
          url: url.startsWith('http') ? url : `https://www.ifm.tn${url}`,
          category: 'وطنية'
        });
      }
    }
    
    return newsItems.slice(0, 5); // Return latest 5 news
  } catch (error) {
    console.error('Error fetching IFM news:', error);
    return [];
  }
};

const getFallbackNews = (): NewsItem[] => {
  return [
    {
      title: "أحوال الطقس في تونس اليوم",
      url: "https://www.mosaiquefm.net/ar/meteo",
      category: "طقس"
    },
    {
      title: "آخر الأخبار الاقتصادية",
      url: "https://www.mosaiquefm.net/ar/actualites/أخبار-مال-أعمال-اقتصاد-تونس/5",
      category: "اقتصاد"
    },
    {
      title: "أخبار الرياضة التونسية",
      url: "https://www.mosaiquefm.net/ar/sport",
      category: "رياضة"
    }
  ];
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching Tunisian news...');
    
    // Fetch news from multiple sources in parallel
    const [mosaiqueNews, ifmNews] = await Promise.all([
      extractNewsFromMosaique(),
      extractNewsFromIFM()
    ]);
    
    // Combine and deduplicate news
    const allNews = [...mosaiqueNews, ...ifmNews];
    const uniqueNews = allNews.filter((item, index, self) => 
      index === self.findIndex(t => t.title === item.title)
    );
    
    // If no news found, return fallback
    const finalNews = uniqueNews.length > 0 ? uniqueNews.slice(0, 15) : getFallbackNews();
    
    console.log(`Fetched ${finalNews.length} news items`);
    
    return new Response(
      JSON.stringify({ 
        news: finalNews,
        lastUpdated: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-tunisian-news function:', error);
    
    return new Response(
      JSON.stringify({ 
        news: getFallbackNews(),
        lastUpdated: new Date().toISOString(),
        error: 'Using fallback news'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});