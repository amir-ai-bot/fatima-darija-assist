import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Zap, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage, translations } from "@/hooks/useLanguage";

interface SubscriptionScreenProps {
  onBack: () => void;
}

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

const SubscriptionScreen = ({ onBack }: SubscriptionScreenProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData>({ subscribed: false });
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
    if (!user) return;

    try {
      setCheckingStatus(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Error",
        description: "Could not check subscription status.",
        variant: "destructive",
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSubscribe = async (plan: 'premium' | 'pro') => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan }
      });
      
      if (error) throw error;
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Could not create checkout session.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Could not open subscription management.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: 'premium',
      name: language === 'french' ? 'Premium' : 'بريميوم',
      price: '$9.99',
      icon: Star,
      features: [
        language === 'french' ? 'Messages illimités' : 'رسائل غير محدودة',
        language === 'french' ? 'Personnalité avancée' : 'شخصية متقدمة',
        language === 'french' ? 'Support prioritaire' : 'دعم أولوي',
      ],
    },
    {
      id: 'pro',
      name: language === 'french' ? 'Pro' : 'محترف',
      price: '$19.99',
      icon: Crown,
      features: [
        language === 'french' ? 'Tout Premium inclus' : 'جميع ميزات البريميوم',
        language === 'french' ? 'Analyse avancée' : 'تحليل متقدم',
        language === 'french' ? 'Intégrations API' : 'تكاملات API',
        language === 'french' ? 'Support 24/7' : 'دعم 24/7',
      ],
    },
  ];

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="sm" onClick={onBack}>
            {translations.back[language]}
          </Button>
          <h2 className="font-semibold font-inter">
            {language === 'french' ? 'Abonnement' : 'الاشتراك'}
          </h2>
          <div className="w-16"></div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

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
            {language === 'french' ? 'Abonnement' : 'الاشتراك'}
          </h2>
        </div>
        <div className="w-16"></div>
      </div>

      <div className="p-4 space-y-6">
        {subscription.subscribed && subscription.subscription_tier && (
          <Card className="border-primary bg-gradient-accent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold font-inter">
                      {language === 'french' ? 'Abonnement actif' : 'اشتراك نشط'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {subscription.subscription_tier} • {
                        subscription.subscription_end 
                          ? new Date(subscription.subscription_end).toLocaleDateString()
                          : ''
                      }
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleManageSubscription} disabled={loading}>
                  <Zap className="w-4 h-4 mr-2" />
                  {language === 'french' ? 'Gérer' : 'إدارة'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = subscription.subscribed && 
              subscription.subscription_tier?.toLowerCase() === plan.id;

            return (
              <Card key={plan.id} className={`relative ${isCurrentPlan ? 'border-primary' : ''}`}>
                {isCurrentPlan && (
                  <Badge className="absolute -top-2 left-4 bg-primary">
                    {language === 'french' ? 'Actuel' : 'الحالي'}
                  </Badge>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-8 h-8 text-primary" />
                      <div>
                        <CardTitle className="font-inter">{plan.name}</CardTitle>
                        <p className="text-2xl font-bold text-primary">
                          {plan.price}
                          <span className="text-sm text-muted-foreground font-normal">
                            /{language === 'french' ? 'mois' : 'شهر'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {!isCurrentPlan && (
                    <Button 
                      className="w-full" 
                      onClick={() => handleSubscribe(plan.id as 'premium' | 'pro')}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      {language === 'french' ? 'S\'abonner' : 'اشترك'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button variant="ghost" onClick={checkSubscriptionStatus} disabled={checkingStatus}>
            {checkingStatus ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {language === 'french' ? 'Actualiser le statut' : 'تحديث الحالة'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionScreen;