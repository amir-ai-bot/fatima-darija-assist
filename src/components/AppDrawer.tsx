import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Menu, User, History, Settings, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage, translations } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface AppDrawerProps {
  onNavigate: (screen: string) => void;
}

const AppDrawer = ({ onNavigate }: AppDrawerProps) => {
  const { user, isAdmin } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: translations.signOutSuccess[language],
        description: translations.signOutSuccessDesc[language],
      });
    } catch (error) {
      toast({
        title: translations.error[language],
        description: translations.signOutError[language],
        variant: "destructive",
      });
    }
  };

  const handleNavigate = (screen: string) => {
    onNavigate(screen);
    setIsOpen(false);
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
          <Menu className="w-5 h-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[80vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={profile?.avatar_url || "placeholder.svg"} />
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{profile?.display_name || "User"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="flex-1 px-4 space-y-2">
          <Button
            variant="ghost"
            onClick={() => handleNavigate("profile")}
            className="w-full justify-start"
          >
            <User className="w-4 h-4 mr-3" />
            {translations.editProfile[language]}
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => handleNavigate("history")}
            className="w-full justify-start"
          >
            <History className="w-4 h-4 mr-3" />
            {translations.chatHistory[language]}
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => handleNavigate("settings")}
            className="w-full justify-start"
          >
            <Settings className="w-4 h-4 mr-3" />
            {translations.settings[language]}
          </Button>
          
          {isAdmin && (
            <Button
              variant="ghost"
              onClick={() => handleNavigate("admin")}
              className="w-full justify-start"
            >
              <Shield className="w-4 h-4 mr-3" />
              {translations.adminPanel[language]}
            </Button>
          )}
          
          <Separator className="my-4" />
          
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start text-destructive"
          >
            <LogOut className="w-4 h-4 mr-3" />
            {translations.signOut[language]}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default AppDrawer;