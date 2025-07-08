import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  UserPlus, Users, Shield, Trash2, MessageSquare, Database, 
  Settings, BarChart3, Activity, Mail, CreditCard, Server,
  FileText, Globe, Palette, Bell
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";

interface User {
  id: string;
  email: string;
  created_at: string;
  role?: string;
}

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel = ({ onBack }: AdminPanelProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    chatSessions: 0,
    messages: 0,
    subscribers: 0
  });
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch all stats in parallel
      const [
        { count: usersCount },
        { count: sessionsCount },
        { count: messagesCount },
        { count: subscribersCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('chat_sessions').select('*', { count: 'exact', head: true }),
        supabase.from('chat_messages').select('*', { count: 'exact', head: true }),
        supabase.from('subscribers').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        totalUsers: usersCount || 0,
        admins: users.filter(u => u.role === 'admin').length,
        chatSessions: sessionsCount || 0,
        messages: messagesCount || 0,
        subscribers: subscribersCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch users from profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, created_at');

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles = profiles?.map(profile => ({
        id: profile.user_id,
        email: profile.display_name || 'Unknown',
        created_at: profile.created_at,
        role: roles?.find(r => r.user_id === profile.user_id)?.role || 'user'
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: language === 'french' ? 'Erreur' : 'خطأ',
        description: language === 'french'
          ? 'Impossible de charger les utilisateurs'
          : 'لا يمكن تحميل المستخدمين',
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      if (newRole === 'admin') {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .upsert({
            user_id: userId,
            role: 'admin'
          }, {
            onConflict: 'user_id,role'
          });
        
        if (error) throw error;
      } else {
        // Remove admin role (keep user role)
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
        
        if (error) throw error;
      }

      await fetchUsers();
      toast({
        title: language === 'french' ? 'Succès' : 'نجح',
        description: language === 'french'
          ? 'Rôle mis à jour avec succès'
          : 'تم تحديث الدور بنجاح',
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: language === 'french' ? 'Erreur' : 'خطأ',
        description: language === 'french'
          ? 'Impossible de mettre à jour le rôle'
          : 'لا يمكن تحديث الدور',
        variant: "destructive",
      });
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
          {language === 'french' ? 'Retour' : 'رجوع'}
        </Button>
        <div className="text-center">
          <h2 className="font-semibold font-inter">
            {language === 'french' ? 'Panel Administrateur' : 'لوحة الإدارة'}
          </h2>
        </div>
        <div className="w-16"></div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            {language === 'french' ? 'Chargement...' : 'جارٍ التحميل...'}
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {language === 'french' ? 'Vue d\'ensemble' : 'نظرة عامة'}
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {language === 'french' ? 'Utilisateurs' : 'المستخدمون'}
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {language === 'french' ? 'Contenu' : 'المحتوى'}
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                {language === 'french' ? 'Système' : 'النظام'}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {language === 'french' ? 'Utilisateurs' : 'المستخدمون'}
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {language === 'french' ? 'Admins' : 'المدراء'}
                    </CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.admins}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {language === 'french' ? 'Sessions Chat' : 'جلسات الدردشة'}
                    </CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.chatSessions}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {language === 'french' ? 'Messages' : 'الرسائل'}
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.messages}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {language === 'french' ? 'Abonnés' : 'المشتركون'}
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.subscribers}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    {language === 'french' ? 'Activité Récente' : 'النشاط الأخير'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground">
                    {language === 'french' ? 'Aucune activité récente à afficher' : 'لا يوجد نشاط حديث للعرض'}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {language === 'french' ? 'Gestion des Utilisateurs' : 'إدارة المستخدمين'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'french' ? 'Utilisateur' : 'المستخدم'}</TableHead>
                        <TableHead>{language === 'french' ? 'Rôle' : 'الدور'}</TableHead>
                        <TableHead>{language === 'french' ? 'Créé le' : 'تاريخ الإنشاء'}</TableHead>
                        <TableHead>{language === 'french' ? 'Actions' : 'الإجراءات'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="font-medium">{user.email}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role === 'admin' 
                                ? (language === 'french' ? 'Admin' : 'مدير')
                                : (language === 'french' ? 'Utilisateur' : 'مستخدم')
                              }
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={user.role}
                              onValueChange={(value) => updateUserRole(user.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">
                                  {language === 'french' ? 'Utilisateur' : 'مستخدم'}
                                </SelectItem>
                                <SelectItem value="admin">
                                  {language === 'french' ? 'Admin' : 'مدير'}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      {language === 'french' ? 'Gestion des Chats' : 'إدارة المحادثات'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>{language === 'french' ? 'Sessions actives' : 'الجلسات النشطة'}</span>
                      <Badge>{stats.chatSessions}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{language === 'french' ? 'Messages totaux' : 'إجمالي الرسائل'}</span>
                      <Badge>{stats.messages}</Badge>
                    </div>
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      {language === 'french' ? 'Voir les logs' : 'عرض السجلات'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      {language === 'french' ? 'Personnalisation Fatima' : 'تخصيص فاطمة'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {language === 'french' 
                        ? 'Gérer les styles et personnalités de Fatima'
                        : 'إدارة أنماط وشخصيات فاطمة'
                      }
                    </div>
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      {language === 'french' ? 'Configurer' : 'تكوين'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      {language === 'french' ? 'Actualités & Météo' : 'الأخبار والطقس'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {language === 'french' 
                        ? 'Gestion des sources d\'actualités tunisiennes'
                        : 'إدارة مصادر الأخبار التونسية'
                      }
                    </div>
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      {language === 'french' ? 'Paramètres API' : 'إعدادات API'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      {language === 'french' ? 'Abonnements' : 'الاشتراكات'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>{language === 'french' ? 'Abonnés actifs' : 'المشتركون النشطون'}</span>
                      <Badge>{stats.subscribers}</Badge>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      {language === 'french' ? 'Gérer Stripe' : 'إدارة Stripe'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      {language === 'french' ? 'Base de Données' : 'قاعدة البيانات'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">{language === 'french' ? 'Tables' : 'الجداول'}</span>
                        <span className="text-sm font-mono">5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">{language === 'french' ? 'Fonctions' : 'الوظائف'}</span>
                        <span className="text-sm font-mono">4</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Database className="h-4 w-4 mr-2" />
                      {language === 'french' ? 'Ouvrir Supabase' : 'فتح Supabase'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      {language === 'french' ? 'Edge Functions' : 'وظائف الحافة'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div>✅ chat-with-fatima</div>
                      <div>✅ fetch-tunisian-news</div>
                      <div>✅ get-weather</div>
                      <div>✅ translate-text</div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Activity className="h-4 w-4 mr-2" />
                      {language === 'french' ? 'Voir les logs' : 'عرض السجلات'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      {language === 'french' ? 'Configuration' : 'التكوين'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>API Keys</span>
                        <Badge variant="secondary">7</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Storage Buckets</span>
                        <Badge variant="secondary">1</Badge>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      {language === 'french' ? 'Configurer' : 'تكوين'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      {language === 'french' ? 'Monitoring' : 'المراقبة'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {language === 'french' 
                        ? 'Surveillance système en temps réel'
                        : 'مراقبة النظام في الوقت الفعلي'
                      }
                    </div>
                    <Button variant="outline" className="w-full">
                      <Activity className="h-4 w-4 mr-2" />
                      {language === 'french' ? 'Tableau de bord' : 'لوحة المعلومات'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
