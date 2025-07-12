import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
}

const NewsManager = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [newArticle, setNewArticle] = useState({ title: '', content: '', image_url: '' });
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data, error } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Error fetching articles', description: error.message, variant: 'destructive' });
    } else {
      setArticles(data);
    }
  };

  const handleAddArticle = async () => {
    const { data, error } = await supabase.from('news').insert([newArticle]).select();
    if (error) {
      toast({ title: 'Error adding article', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Article added successfully' });
      setNewArticle({ title: '', content: '', image_url: '' });
      fetchArticles();
    }
  };

  const handleDeleteArticle = async (id: number) => {
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error deleting article', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Article deleted successfully' });
      fetchArticles();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{language === 'french' ? 'Ajouter une actualité' : 'إضافة خبر'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder={language === 'french' ? 'Titre' : 'العنوان'}
            value={newArticle.title}
            onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
          />
          <Textarea
            placeholder={language === 'french' ? 'Contenu' : 'المحتوى'}
            value={newArticle.content}
            onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
          />
          <Input
            placeholder={language === 'french' ? 'URL de l\'image (optionnel)' : 'رابط الصورة (اختياري)'}
            value={newArticle.image_url}
            onChange={(e) => setNewArticle({ ...newArticle, image_url: e.target.value })}
          />
          <Button onClick={handleAddArticle}>{language === 'french' ? 'Ajouter' : 'إضافة'}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{language === 'french' ? 'Actualités existantes' : 'الأخبار الحالية'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {articles.map((article) => (
              <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{article.title}</h3>
                  <p className="text-sm text-muted-foreground">{new Date(article.created_at).toLocaleDateString()}</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteArticle(article.id)}>
                  {language === 'french' ? 'Supprimer' : 'حذف'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsManager;