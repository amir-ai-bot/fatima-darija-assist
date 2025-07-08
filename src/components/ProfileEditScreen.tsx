import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload, Loader2, Palette, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage, translations, Language } from "@/hooks/useLanguage";

interface ProfileEditScreenProps {
  onBack: () => void;
}

const ProfileEditScreen = ({ onBack }: ProfileEditScreenProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    display_name: '',
    description: '',
    avatar_url: '',
    personality: 'friendly_warm',
    fatima_style: {
      hair_color: '#2D1810',
      hair_style: 'long',
      makeup_style: 'natural',
      outfit_color: '#8B4513'
    }
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        const defaultFatimaStyle = {
          hair_color: '#2D1810',
          hair_style: 'long',
          makeup_style: 'natural',
          outfit_color: '#8B4513'
        };

        let fatimaStyle = defaultFatimaStyle;
        if (data.fatima_style && typeof data.fatima_style === 'object' && !Array.isArray(data.fatima_style)) {
          const style = data.fatima_style as Record<string, any>;
          if (style.hair_color && style.hair_style && style.makeup_style && style.outfit_color) {
            fatimaStyle = style as typeof defaultFatimaStyle;
          }
        }

        setProfile({
          display_name: data.display_name || '',
          description: data.description || '',
          avatar_url: data.avatar_url || '',
          personality: data.personality || 'friendly_warm',
          fatima_style: fatimaStyle
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Could not load profile data.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !user) return;

      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);

      setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }));

      toast({
        title: "Success",
        description: "Profile photo uploaded successfully!",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Could not upload profile photo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getErrorMessage = (error: any, language: Language) => {
    if (error?.code === '23505') {
      return {
        title: language === 'french' ? 'Profil déjà existant' : 'الملف الشخصي موجود بالفعل',
        description: language === 'french' 
          ? 'Votre profil existe déjà. Les modifications ont été appliquées.'
          : 'ملفك الشخصي موجود بالفعل. تم تطبيق التغييرات.'
      };
    }
    
    if (error?.code === '42501') {
      return {
        title: language === 'french' ? 'Autorisation refusée' : 'تم رفض الإذن',
        description: language === 'french' 
          ? 'Vous n\'êtes pas autorisé à effectuer cette action.'
          : 'ليس لديك إذن لتنفيذ هذا الإجراء.'
      };
    }

    return {
      title: language === 'french' ? 'Erreur' : 'خطأ',
      description: language === 'french' 
        ? 'Une erreur inattendue s\'est produite. Veuillez réessayer.'
        : 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
    };
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: profile.display_name,
          description: profile.description,
          avatar_url: profile.avatar_url,
          personality: profile.personality,
          fatima_style: profile.fatima_style,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: language === 'french' ? 'Succès' : 'نجح',
        description: language === 'french' ? 'Profil mis à jour avec succès!' : 'تم تحديث الملف الشخصي بنجاح!',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMsg = getErrorMessage(error, language);
      toast({
        title: errorMsg.title,
        description: errorMsg.description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
            {language === 'french' ? 'Personnaliser Fatima' : 'تخصيص فاطمة'}
          </h2>
        </div>
        <div className="w-16"></div>
      </div>

      <div className="p-4 space-y-6">
        {/* Fatima Avatar Styles */}
        <Card>
          <CardHeader>
            <CardTitle className="font-inter flex items-center gap-2">
              <User className="w-5 h-5" />
              {language === 'french' ? 'Apparence de Fatima' : 'مظهر فاطمة'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Preview */}
            <div className="flex justify-center">
              <Avatar className="w-24 h-24">
                <AvatarImage src="/src/assets/fatima-avatar.png" alt="Fatima" />
                <AvatarFallback className="text-2xl">ف</AvatarFallback>
              </Avatar>
            </div>

            {/* Hair Style */}
            <div>
              <Label className="font-inter">
                {language === 'french' ? 'Style de cheveux' : 'نمط الشعر'}
              </Label>
              <RadioGroup 
                value={profile.fatima_style.hair_style} 
                onValueChange={(value) => setProfile(prev => ({ 
                  ...prev, 
                  fatima_style: { ...prev.fatima_style, hair_style: value }
                }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="long" id="long" />
                  <Label htmlFor="long">{language === 'french' ? 'Long' : 'طويل'}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">{language === 'french' ? 'Moyen' : 'متوسط'}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="short" id="short" />
                  <Label htmlFor="short">{language === 'french' ? 'Court' : 'قصير'}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hijab" id="hijab" />
                  <Label htmlFor="hijab">{language === 'french' ? 'Hijab' : 'حجاب'}</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Hair Color */}
            <div>
              <Label className="font-inter">
                {language === 'french' ? 'Couleur des cheveux' : 'لون الشعر'}
              </Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[
                  { color: '#2D1810', name: language === 'french' ? 'Brun foncé' : 'بني غامق' },
                  { color: '#8B4513', name: language === 'french' ? 'Châtain' : 'بني فاتح' },
                  { color: '#1C1C1C', name: language === 'french' ? 'Noir' : 'أسود' },
                  { color: '#DAA520', name: language === 'french' ? 'Blond' : 'أشقر' }
                ].map((hairColor) => (
                  <button
                    key={hairColor.color}
                    type="button"
                    className={`w-12 h-12 rounded-full border-2 ${
                      profile.fatima_style.hair_color === hairColor.color ? 'border-primary' : 'border-muted'
                    }`}
                    style={{ backgroundColor: hairColor.color }}
                    onClick={() => setProfile(prev => ({ 
                      ...prev, 
                      fatima_style: { ...prev.fatima_style, hair_color: hairColor.color }
                    }))}
                    title={hairColor.name}
                  />
                ))}
              </div>
            </div>

            {/* Makeup Style */}
            <div>
              <Label className="font-inter">
                {language === 'french' ? 'Style de maquillage' : 'نمط المكياج'}
              </Label>
              <Select 
                value={profile.fatima_style.makeup_style} 
                onValueChange={(value) => setProfile(prev => ({ 
                  ...prev, 
                  fatima_style: { ...prev.fatima_style, makeup_style: value }
                }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">{language === 'french' ? 'Naturel' : 'طبيعي'}</SelectItem>
                  <SelectItem value="elegant">{language === 'french' ? 'Élégant' : 'أنيق'}</SelectItem>
                  <SelectItem value="glamorous">{language === 'french' ? 'Glamour' : 'ساحر'}</SelectItem>
                  <SelectItem value="minimal">{language === 'french' ? 'Minimal' : 'بسيط'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Outfit Color */}
            <div>
              <Label className="font-inter">
                {language === 'french' ? 'Couleur de tenue' : 'لون الملابس'}
              </Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[
                  { color: '#8B4513', name: language === 'french' ? 'Marron' : 'بني' },
                  { color: '#FF69B4', name: language === 'french' ? 'Rose' : 'وردي' },
                  { color: '#4169E1', name: language === 'french' ? 'Bleu' : 'أزرق' },
                  { color: '#32CD32', name: language === 'french' ? 'Vert' : 'أخضر' },
                  { color: '#FF4500', name: language === 'french' ? 'Orange' : 'برتقالي' },
                  { color: '#9932CC', name: language === 'french' ? 'Violet' : 'بنفسجي' },
                  { color: '#DC143C', name: language === 'french' ? 'Rouge' : 'أحمر' },
                  { color: '#FFD700', name: language === 'french' ? 'Doré' : 'ذهبي' }
                ].map((outfitColor) => (
                  <button
                    key={outfitColor.color}
                    type="button"
                    className={`w-12 h-12 rounded-full border-2 ${
                      profile.fatima_style.outfit_color === outfitColor.color ? 'border-primary' : 'border-muted'
                    }`}
                    style={{ backgroundColor: outfitColor.color }}
                    onClick={() => setProfile(prev => ({ 
                      ...prev, 
                      fatima_style: { ...prev.fatima_style, outfit_color: outfitColor.color }
                    }))}
                    title={outfitColor.name}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personality */}
        <Card>
          <CardHeader>
            <CardTitle className="font-inter flex items-center gap-2">
              <Palette className="w-5 h-5" />
              {language === 'french' ? 'Personnalité de Fatima' : 'شخصية فاطمة'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="font-inter">
              {language === 'french' ? 'Comment voulez-vous que Fatima se comporte ?' : 'كيف تريد أن تتصرف فاطمة؟'}
            </Label>
            <RadioGroup 
              value={profile.personality} 
              onValueChange={(value) => setProfile(prev => ({ ...prev, personality: value }))}
              className="mt-2 space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="friendly_warm" id="friendly" />
                <Label htmlFor="friendly" className="flex-1">
                  <div className="font-medium">
                    {language === 'french' ? 'Amicale et chaleureuse' : 'ودودة ودافئة'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'french' ? 'Comme une amie proche qui vous comprend' : 'مثل صديقة مقربة تفهمك'}
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="professional" id="professional" />
                <Label htmlFor="professional" className="flex-1">
                  <div className="font-medium">
                    {language === 'french' ? 'Professionnelle' : 'مهنية'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'french' ? 'Formelle et efficace dans ses réponses' : 'رسمية وفعالة في إجاباتها'}
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="playful" id="playful" />
                <Label htmlFor="playful" className="flex-1">
                  <div className="font-medium">
                    {language === 'french' ? 'Joueuse et dynamique' : 'مرحة ونشيطة'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'french' ? 'Pleine d\'énergie et d\'humour' : 'مليئة بالطاقة والمرح'}
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wise_mentor" id="wise" />
                <Label htmlFor="wise" className="flex-1">
                  <div className="font-medium">
                    {language === 'french' ? 'Sage et bienveillante' : 'حكيمة ومتفهمة'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'french' ? 'Comme une grande sœur qui donne de bons conseils' : 'مثل أخت كبيرة تقدم نصائح جيدة'}
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="font-inter">
              {language === 'french' ? 'Vos informations' : 'معلوماتك'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="display_name" className="font-inter">
                {language === 'french' ? 'Votre nom' : 'اسمك'}
              </Label>
              <Input
                id="display_name"
                value={profile.display_name}
                onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder={language === 'french' ? 'Comment Fatima doit-elle vous appeler ?' : 'كيف يجب أن تناديك فاطمة؟'}
                className="font-inter"
              />
            </div>

            <div>
              <Label htmlFor="description" className="font-inter">
                {language === 'french' ? 'Parlez-vous à Fatima' : 'حدث فاطمة عن نفسك'}
              </Label>
              <Textarea
                id="description"
                value={profile.description}
                onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                placeholder={language === 'french' 
                  ? 'Vos hobbies, votre travail, ce que vous aimez... Plus Fatima vous connaît, mieux elle peut vous aider !' 
                  : 'هواياتك، عملك، ما تحبه... كلما عرفت فاطمة عنك أكثر، كلما استطاعت مساعدتك بشكل أفضل!'
                }
                rows={4}
                className={language === 'darija' ? 'font-cairo text-right' : 'font-inter'}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'french' 
                  ? 'Cette information aide Fatima à personnaliser ses réponses et à mieux vous comprendre.'
                  : 'هذه المعلومات تساعد فاطمة على تخصيص ردودها وفهمك بشكل أفضل.'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-4">
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {language === 'french' ? 'Enregistrer' : 'حفظ'}
          </Button>
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex-1"
          >
            {language === 'french' ? 'Annuler' : 'إلغاء'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditScreen;