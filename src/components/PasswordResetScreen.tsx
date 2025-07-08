import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage, translations } from "@/hooks/useLanguage";
import { Loader2 } from "lucide-react";

const PasswordResetScreen = () => {
  const [step, setStep] = useState('request'); // 'request', 'verify', 'success'
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  const handleRequestCode = async () => {
    setLoading(true);
    const { error } = await supabase.functions.invoke('request-password-reset', {
      body: { email },
    });
    setLoading(false);

    if (error) {
      toast({
        title: translations.error[language],
        description: error.message,
        variant: "destructive",
      });
    } else {
      setStep('verify');
      toast({
        title: translations.success[language],
        description: "A verification code has been sent to your email.",
      });
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    const { error } = await supabase.functions.invoke('verify-password-reset', {
        body: { email, token, password },
    });
    setLoading(false);

    if (error) {
        toast({
            title: translations.error[language],
            description: error.message,
            variant: "destructive",
        });
    } else {
        setStep('success');
        toast({
            title: translations.success[language],
            description: "Your password has been reset successfully.",
        });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{translations.resetPassword[language]}</CardTitle>
          <CardDescription>
            {step === 'request' && translations.passwordResetDescription[language]}
            {step === 'verify' && "Enter the verification code sent to your email."}
            {step === 'success' && "Your password has been reset."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'request' && (
            <div className="space-y-4">
              <Input
                type="email"
                placeholder={translations.email[language]}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button onClick={handleRequestCode} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {translations.sendResetLink[language]}
              </Button>
            </div>
          )}
          {step === 'verify' && (
            <div className="space-y-4">
              <Input
                placeholder="Verification Code"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <Input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button onClick={handleVerifyCode} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
            </div>
          )}
          {step === 'success' && (
            <div className="text-center">
              <p>Your password has been reset successfully.</p>
              <Button onClick={() => window.location.href = '/'} className="mt-4">
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordResetScreen;