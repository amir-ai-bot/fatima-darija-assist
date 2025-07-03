import { useState, useEffect } from 'react';

export type Language = 'darija' | 'french';

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'french';
  });

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setLanguage(event.detail);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  return { language };
};

export const translations = {
  welcome: {
    french: "Bonjour, je suis Fatima, ton assistante personnelle !",
    darija: "أهلا وسهلا، أنا فاطمة، مساعدتك الشخصية!"
  },
  start: {
    french: "Commencer",
    darija: "ابدأ"
  },
  dashboard: {
    french: "Bienvenue sur FatimaAI",
    darija: "مرحبا بك في فاطمة الذكية"
  },
  subtitle: {
    french: "Votre assistante personnelle tunisienne",
    darija: "مساعدتك الشخصية التونسية"
  },
  quickActions: {
    french: "Actions rapides",
    darija: "إجراءات سريعة"
  },
  translate: {
    french: "Traduire",
    darija: "ترجم"
  },
  askQuestion: {
    french: "Poser une question",
    darija: "اسأل سؤال"
  },
  findPlace: {
    french: "Trouver un lieu",
    darija: "البحث عن مكان"
  },
  voiceAssistant: {
    french: "Assistant vocal",
    darija: "مساعد صوتي"
  },
  back: {
    french: "← Retour",
    darija: "← رجوع"
  }
};