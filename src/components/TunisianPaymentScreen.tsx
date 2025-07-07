import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CreditCard, Smartphone, Banknote } from "lucide-react";
import { useLanguage, translations } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";

interface TunisianPaymentScreenProps {
  onBack: () => void;
  selectedPlan: string;
  planPrice: number;
}

const TunisianPaymentScreen = ({ onBack, selectedPlan, planPrice }: TunisianPaymentScreenProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState("flouci");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    {
      id: "flouci",
      name: language === 'darija' ? "فلوسي" : "Flouci",
      description: language === 'darija' ? "الدفع عبر فلوسي" : "Paiement via Flouci",
      icon: Smartphone
    },
    {
      id: "d17",
      name: "D17",
      description: language === 'darija' ? "الدفع عبر D17" : "Paiement via D17",
      icon: CreditCard
    },
    {
      id: "postpaid",
      name: language === 'darija' ? "فاتورة الهاتف" : "Facture mobile",
      description: language === 'darija' ? "إضافة إلى فاتورة الهاتف" : "Ajout à la facture mobile",
      icon: Smartphone
    },
    {
      id: "cash",
      name: language === 'darija' ? "نقدي" : "Espèces",
      description: language === 'darija' ? "الدفع نقدي في نقاط البيع" : "Paiement cash aux points de vente",
      icon: Banknote
    }
  ];

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: language === 'darija' ? "تم الدفع بنجاح!" : "Paiement réussi!",
        description: language === 'darija' ? 
          "تم تفعيل اشتراكك بنجاح" : 
          "Votre abonnement a été activé avec succès",
      });
      
      onBack();
    } catch (error) {
      toast({
        title: language === 'darija' ? "خطأ في الدفع" : "Erreur de paiement",
        description: language === 'darija' ? 
          "حدث خطأ أثناء معالجة الدفع" : 
          "Une erreur s'est produite lors du traitement du paiement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {translations.back[language]}
        </Button>
        <h1 className="text-lg font-semibold">
          {language === 'darija' ? 'طرق الدفع' : 'Méthodes de paiement'}
        </h1>
        <div className="w-16" />
      </div>

      {/* Plan Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center">
            {selectedPlan} - {planPrice} {language === 'darija' ? 'دينار' : 'TND'}
          </CardTitle>
          <CardDescription className="text-center">
            {language === 'darija' ? 'شهريا' : 'par mois'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Payment Methods */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {language === 'darija' ? 'اختر طريقة الدفع' : 'Choisissez votre méthode de paiement'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <method.icon className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <Label htmlFor={method.id} className="font-medium cursor-pointer">
                      {method.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Phone Number Input */}
      {(paymentMethod === "flouci" || paymentMethod === "d17" || paymentMethod === "postpaid") && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {language === 'darija' ? 'رقم الهاتف' : 'Numéro de téléphone'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="phone">
                {language === 'darija' ? 'أدخل رقم هاتفك' : 'Entrez votre numéro de téléphone'}
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+216 XX XXX XXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={language === 'darija' ? 'text-right' : 'text-left'}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cash Payment Info */}
      {paymentMethod === "cash" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {language === 'darija' ? 'الدفع النقدي' : 'Paiement en espèces'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {language === 'darija' ? 
                'يمكنك الدفع نقدا في أقرب نقطة بيع معتمدة. ستحصل على رمز تفعيل بعد الدفع.' :
                'Vous pouvez payer en espèces au point de vente agréé le plus proche. Vous recevrez un code d\'activation après le paiement.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Payment Button */}
      <Button 
        onClick={handlePayment}
        disabled={loading || (paymentMethod !== "cash" && !phoneNumber)}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {language === 'darija' ? 'جاري المعالجة...' : 'Traitement...'}
          </div>
        ) : (
          <>
            {language === 'darija' ? 'تأكيد الدفع' : 'Confirmer le paiement'}
            <CreditCard className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
};

export default TunisianPaymentScreen;