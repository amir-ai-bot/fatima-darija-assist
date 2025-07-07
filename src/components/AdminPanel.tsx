import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Users, Shield, Trash2 } from "lucide-react";
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
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    fetchUsers();
  }, []);

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
    } finally {
      setLoading(false);
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

      <div className="p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'french' ? 'Total Utilisateurs' : 'إجمالي المستخدمين'}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'french' ? 'Administrateurs' : 'المدراء'}
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'admin').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'french' ? 'Gestion des Utilisateurs' : 'إدارة المستخدمين'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                {language === 'french' ? 'Chargement...' : 'جارٍ التحميل...'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {language === 'french' ? 'Utilisateur' : 'المستخدم'}
                    </TableHead>
                    <TableHead>
                      {language === 'french' ? 'Rôle' : 'الدور'}
                    </TableHead>
                    <TableHead>
                      {language === 'french' ? 'Actions' : 'الإجراءات'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </div>
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
