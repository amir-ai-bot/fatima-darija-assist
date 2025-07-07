import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Upload, Loader2 } from "lucide-react";
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
    avatar_url: ''
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
        setProfile({
          display_name: data.display_name || '',
          description: data.description || '',
          avatar_url: data.avatar_url || ''
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
            {language === 'french' ? 'Modifier le profil' : 'تعديل الملف الشخصي'}
          </h2>
        </div>
        <div className="w-16"></div>
      </div>

      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-inter">
              {language === 'french' ? 'Photo de profil' : 'صورة الملف الشخصي'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.avatar_url} alt="Profile" />
                <AvatarFallback className="text-lg">
                  {profile.display_name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" disabled={uploading} asChild>
                    <span>
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Camera className="w-4 h-4 mr-2" />
                      )}
                      {language === 'french' ? 'Changer la photo' : 'تغيير الصورة'}
                    </span>
                  </Button>
                </Label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-inter">
              {language === 'french' ? 'Informations personnelles' : 'المعلومات الشخصية'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="display_name" className="font-inter">
                {language === 'french' ? 'Nom d\'affichage' : 'اسم العرض'}
              </Label>
              <Input
                id="display_name"
                value={profile.display_name}
                onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder={language === 'french' ? 'Votre nom' : 'اسمك'}
                className="font-inter"
              />
            </div>

            <div>
              <Label htmlFor="description" className="font-inter">
                {language === 'french' ? 'Description' : 'الوصف'}
              </Label>
              <Textarea
                id="description"
                value={profile.description}
                onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                placeholder={language === 'french' 
                  ? 'Parlez-nous de vous pour que Fatima vous connaisse mieux...' 
                  : 'أخبرنا عن نفسك حتى تتعرف عليك فاطمة بشكل أفضل...'
                }
                rows={4}
                className={language === 'darija' ? 'font-cairo text-right' : 'font-inter'}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'french' 
                  ? 'Cette information aide Fatima à personnaliser ses réponses selon votre profil.'
                  : 'هذه المعلومات تساعد فاطمة على تخصيص ردودها حسب ملفك الشخصي.'
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