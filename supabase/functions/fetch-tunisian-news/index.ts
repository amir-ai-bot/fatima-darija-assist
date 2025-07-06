import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "std/http/server.ts";
import { DOMParser, Element } from "deno-dom";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsItem {
  title: string;
  url: string;
  timestamp?: string;
  category?: string;
  content?: string;
  image?: string;
}

const fetchAndParse = async (url: string) => {
  const response = await fetch(url);
  const html = await response.text();
  return new DOMParser().parseFromString(html, 'text/html');
};

const extractArticleDetails = async (articleUrl: string): Promise<{ content: string, image?: string }> => {
  try {
    const doc = await fetchAndParse(articleUrl);
    if (!doc) return { content: '' };

    const articleContent = doc.querySelector('.article-content')?.textContent ||
                           doc.querySelector('.post-content')?.textContent ||
                           '';
    
    const articleImage = doc.querySelector('.article-content img')?.getAttribute('src') ||
                         doc.querySelector('.post-content img')?.getAttribute('src');

    return {
      content: articleContent.trim(),
      image: articleImage ? (articleImage.startsWith('http') ? articleImage : new URL(articleImage, articleUrl).href) : undefined
    };
  } catch (error) {
    console.error(`Error extracting details from ${articleUrl}:`, error);
    return { content: '' };
  }
};


const extractNewsFromMosaique = async (): Promise<NewsItem[]> => {
  try {
    const doc = await fetchAndParse('https://www.mosaiquefm.net/ar/actualites/تونس-وطنية/1');
    if (!doc) return [];

    const newsElements = doc.querySelectorAll('.post-list .post-item');
    const newsItems: NewsItem[] = [];

    for (const element of Array.from(newsElements).slice(0, 10)) {
      const linkElement = (element as Element).querySelector('h3 a');
      const url = linkElement?.getAttribute('href');
      const title = linkElement?.textContent.trim();

      if (url && title && !url.includes('undefined')) {
        const fullUrl = url.startsWith('http') ? url : `https://www.mosaiquefm.net${url}`;
        const { content, image } = await extractArticleDetails(fullUrl);
        
        newsItems.push({
          title,
          url: fullUrl,
          category: 'وطنية',
          content,
          image
        });
      }
    }
    return newsItems;
  } catch (error) {
    console.error('Error fetching Mosaique FM news:', error);
    return [];
  }
};

const extractNewsFromIFM = async (): Promise<NewsItem[]> => {
  try {
    const doc = await fetchAndParse('https://www.ifm.tn/ar/articles/الأخبار-الوطنية/9');
    if (!doc) return [];

    const newsElements = doc.querySelectorAll('.posts-list .post-item');
    const newsItems: NewsItem[] = [];

    for (const element of Array.from(newsElements).slice(0, 5)) {
      const linkElement = (element as Element).querySelector('h3 a');
      const url = linkElement?.getAttribute('href');
      const title = linkElement?.textContent.trim();

      if (url && title) {
        const fullUrl = url.startsWith('http') ? url : `https://www.ifm.tn${url}`;
        const { content, image } = await extractArticleDetails(fullUrl);

        newsItems.push({
          title,
          url: fullUrl,
          category: 'وطنية',
          content,
          image
        });
      }
    }
    return newsItems;
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
      category: "طقس",
      content: "تفاصيل حالة الطقس ودرجات الحرارة المتوقعة في مختلف أنحاء البلاد.",
      image: "https://i.imgur.com/K7gD3P7.png"
    },
    {
      title: "آخر الأخبار الاقتصادية",
      url: "https://www.mosaiquefm.net/ar/actualites/أخبار-مال-أعمال-اقتصاد-تونس/5",
      category: "اقتصاد",
      content: "متابعة لآخر التطورات في الساحة الاقتصادية التونسية والعالمية.",
      image: "https://i.imgur.com/K7gD3P7.png"
    },
    {
      title: "أخبار الرياضة التونسية",
      url: "https://www.mosaiquefm.net/ar/sport",
      category: "رياضة",
      content: "أهم الأخبار الرياضية المحلية والعالمية، ونتائج المباريات.",
      image: "https://i.imgur.com/K7gD3P7.png"
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