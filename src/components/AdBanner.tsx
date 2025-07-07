import { Card } from "@/components/ui/card";
import { useLanguage, translations } from "@/hooks/useLanguage";

interface AdBannerProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

const AdBanner = ({ size = "medium", className = "" }: AdBannerProps) => {
  const { language } = useLanguage();

  const sizeClasses = {
    small: "h-20",
    medium: "h-32",
    large: "h-40"
  };

  return (
    <Card className={`${sizeClasses[size]} ${className} bg-gradient-to-r from-primary/10 to-accent/10 border-dashed border-2 border-primary/20 flex items-center justify-center`}>
      <div className="text-center">
        <p className="text-sm text-muted-foreground font-medium">
          {language === 'darija' ? 'إعلان' : 'Publicité'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {language === 'darija' ? 'مساحة إعلانية' : 'Espace publicitaire'}
        </p>
      </div>
    </Card>
  );
};

export default AdBanner;