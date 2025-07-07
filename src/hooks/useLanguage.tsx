import { useState, useEffect } from 'react';

export type Language = 'darija' | 'french';

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'french';
  });

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('app-language', newLanguage);
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: newLanguage }));
  };

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setLanguage(event.detail);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  return { language, setLanguage: changeLanguage };
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
  },
  dailyTip: {
    french: "Astuce du jour",
    darija: "نصيحة اليوم"
  },
  sunny: {
    french: "Ensoleillé",
    darija: "مشمس"
  },
  cloudy: {
    french: "Nuageux",
    darija: "غايم"
  },
  rainy: {
    french: "Pluvieux", 
    darija: "شتوي"
  },
  hot: {
    french: "Chaud",
    darija: "سخون"
  },
  cold: {
    french: "Froid",
    darija: "بارد"
  },
  weather: {
    french: "Météo",
    darija: "الطقس"
  },
  todayWeather: {
    french: "Aujourd'hui à",
    darija: "اليوم في"
  },
  min: {
    french: "Min",
    darija: "أدنى"
  },
  max: {
    french: "Max", 
    darija: "أعلى"
  },
  loading: {
    french: "Chargement...",
    darija: "جاري التحميل..."
  },
  enableLocation: {
    french: "Activer la localisation",
    darija: "تفعيل الموقع"
  },
  madeWithLove: {
    french: "Fait avec Yassin_Dev pour la Tunisie",
    darija: "صنع Yassin_Dev للبلاد التونسية 🇹🇳"
  },
  translateDesc: {
    french: "Darija ↔ Français",
    darija: "الدارجة ↔ الفرنسية"
  },
  chatDesc: {
    french: "Chat avec Fatima",
    darija: "تكلم مع فاطمة"
  },
  placesDesc: {
    french: "ATB, Poste, Hôpital...",
    darija: "النقل، البريد، السبيطار..."
  },
  voiceDesc: {
    french: "Parlez avec Fatima",
    darija: "تكلم مع فاطمة"
  },
  news: {
    french: "Actualités",
    darija: "الأخبار"
  },
  newsDesc: {
    french: "Dernières infos tunisiennes",
    darija: "آخر أخبار تونس"
  },
  readMore: {
    french: "Lire plus",
    darija: "اقرأ المزيد"
  },
  newsTitle: {
    french: "Actualités Tunisiennes",
    darija: "الأخبار التونسية"
  },
  refreshNews: {
    french: "Actualiser",
    darija: "تحديث"
  },
  noNews: {
    french: "Aucune actualité disponible",
    darija: "لا توجد أخبار متاحة"
  },
  close: {
    french: "Fermer",
    darija: "إغلاق"
  },
  placesTitle: {
    french: "Lieux à proximité",
    darija: "أماكن قريبة"
  },
  searchPlaceholder: {
    french: "Rechercher un lieu...",
    darija: "ابحث عن مكان..."
  },
  frequentSearches: {
    french: "Recherches fréquentes",
    darija: "عمليات البحث المتكررة"
  },
  results: {
    french: "Résultats",
    darija: "النتائج"
  },
  noResults: {
    french: "Aucun résultat",
    darija: "لا توجد نتائج"
  },
  noResultsDesc: {
    french: "Aucun lieu trouvé pour cette recherche",
    darija: "لم يتم العثور على مكان لهذا البحث"
  },
  tryAnotherSearch: {
    french: "Essayez une autre recherche",
    darija: "جرب بحثًا آخر"
  },
  locationError: {
    french: "Erreur de localisation",
    darija: "خطأ في تحديد الموقع"
  },
  locationErrorDesc: {
    french: "Impossible d'obtenir votre position",
    darija: "تعذر الحصول على موقعك"
  },
  locationSuccess: {
    french: "Position obtenue",
    darija: "تم الحصول على الموقع"
  },
  locationSuccessDesc: {
    french: "Recherche des lieux à proximité...",
    darija: "جاري البحث عن الأماكن القريبة..."
  },
  settings: {
    french: "Paramètres",
    darija: "إعدادات"
  },
  user: {
    french: "Utilisateur",
    darija: "المستخدم"
  },
  editProfile: {
    french: "Modifier le profil",
    darija: "تعديل الملف الشخصي"
  },
  appearance: {
    french: "Apparence",
    darija: "المظهر"
  },
  darkMode: {
    french: "Mode sombre",
    darija: "الوضع الليلي"
  },
  language: {
    french: "Langue",
    darija: "اللغة"
  },
  languageName: {
    french: "Français",
    darija: "الدارجة التونسية"
  },
  languageDesc: {
    french: "French / Français",
    darija: "Tunisian Darija"
  },
  personality: {
    french: "Personnalité de Fatima",
    darija: "شخصية فاطمة"
  },
  personalityPlaceholder: {
    french: "Choisissez une personnalité",
    darija: "اختر شخصية"
  },
  friendly: {
    french: "Amicale et chaleureuse",
    darija: "ودودة ودافئة"
  },
  funny: {
    french: "Drôle et taquine",
    darija: "مضحكة ومرحة"
  },
  wise: {
    french: "Sage et calme",
    darija: "حكيمة وهادئة"
  },
  about: {
    french: "À propos",
    darija: "حول التطبيق"
  },
  aboutDesc: {
    french: "Assistant personnel tunisien",
    darija: "مساعد شخصي تونسي"
  },
  features: {
    french: "🎤 Reconnaissance vocale en darija et français\n💬 Chat intelligent bilingue\n🔄 Traduction darija ↔ français\n📍 Informations locales tunisiennes",
    darija: "🎤 التعرف على الصوت بالدارجة والفرنسية\n💬 محادثة ذكية ثنائية اللغة\n🔄 ترجمة من الدارجة إلى الفرنسية والعكس\n📍 معلومات محلية تونسية"
  },
  madeWithLoveFooter: {
    french: "Fait avec Yassin_Dev pour la Tunisie",
    darija: "صنع Yassin_Dev للبلاد التونسية 🇹🇳"
  },
  authTitle: {
    french: "Bienvenue à FatimaAI",
    darija: "مرحباً بك في فاطمة"
  },
  authSubtitle: {
    french: "Votre assistante personnelle tunisienne",
    darija: "مساعدتك الشخصية التونسية"
  },
  emailLabel: {
    french: "Adresse e-mail",
    darija: "البريد الإلكتروني"
  },
  passwordLabel: {
    french: "Mot de passe",
    darija: "كلمة المرور"
  },
  loginButton: {
    french: "Se connecter",
    darija: "تسجيل الدخول"
  },
  signupButton: {
    french: "S'inscrire",
    darija: "تسجيل"
  },
  or: {
    french: "OU",
    darija: "أو"
  },
  googleButton: {
    french: "Continuer avec Google",
    darija: "المتابعة باستخدام جوجل"
  },
  chatTitle: {
    french: "Chat avec Fatima",
    darija: "تكلم مع فاطمة"
  },
  chatPlaceholder: {
    french: "Posez votre question...",
    darija: "اسأل سؤالك..."
  },
  voiceTitle: {
    french: "Assistant Vocal",
    darija: "المساعد الصوتي"
  },
  voiceStatus: {
    french: "Appuyez et parlez",
    darija: "اضغط وتحدث"
  },
  voiceListening: {
    french: "Je vous écoute...",
    darija: "أنا أستمع..."
  },
  voiceThinking: {
    french: "Je réfléchis...",
    darija: "أفكر..."
  },
  translateTitle: {
    french: "Traduction",
    darija: "الترجمة"
  },
  translateFrom: {
    french: "Traduire de",
    darija: "ترجمة من"
  },
  translateTo: {
    french: "Traduire vers",
    darija: "ترجمة إلى"
  },
  translatePlaceholder: {
    french: "Entrez votre texte...",
    darija: "أدخل النص الخاص بك..."
  },
  translateButton: {
    french: "Traduire",
    darija: "ترجم"
  },
  youSaid: {
    french: "Vous avez dit :",
    darija: "قلت:"
  },
  fatimaResponds: {
    french: "Fatima répond :",
    darija: "فاطمة تجيب:"
  },
  sampleQuestions: {
    french: "Exemples de questions :",
    darija: "أمثلة على الأسئلة:"
  },
  online: {
    french: "En ligne",
    darija: "متصل"
  },
  verifyEmail: {
    french: "Vérifiez votre email",
    darija: "تحقق من بريدك الإلكتروني"
  },
  welcomeBack: {
    french: "Bon retour !",
    darija: "أهلا وسهلا بعودتك"
  },
  verifyEmailDesc: {
    french: "Nous avons envoyé un lien de vérification à votre email.",
    darija: "أرسلنا رابط التحقق إلى بريدك الإلكتروني."
  },
  createAccount: {
    french: "Créer un compte",
    darija: "إنشاء حساب"
  },
  loginToAccount: {
    french: "Se connecter",
    darija: "تسجيل الدخول"
  },
  clickLink: {
    french: "Cliquez sur le lien pour vérifier votre compte.",
    darija: "اضغط على الرابط للتحقق من حسابك."
  },
  verified: {
    french: "Vérifié !",
    darija: "تم التحقق!"
  },
  fullName: {
    french: "Nom complet",
    darija: "الاسم الكامل"
  },
  yourName: {
    french: "Votre nom",
    darija: "اسمك"
  },
  emailPlaceholder: {
    french: "votre@email.com",
    darija: "بريدك@الإلكتروني.com"
  },
  facebookButton: {
    french: "Continuer avec Facebook",
    darija: "المتابعة باستخدام فيسبوك"
  },
  alreadyHaveAccount: {
    french: "Vous avez déjà un compte ?",
    darija: "هل لديك حساب؟"
  },
  noAccount: {
    french: "Pas de compte ?",
    darija: "ليس لديك حساب؟"
  },
  examples: {
    french: "Exemples",
    darija: "أمثلة"
  },
  history: {
    french: "Historique",
    darija: "التاريخ"
  },
  profileEdit: {
    french: "Modifier le profil",
    darija: "تعديل الملف الشخصي"
  },
  subscription: {
    french: "Abonnement",
    darija: "الاشتراك"
  },
  signOut: {
    french: "Se déconnecter",
    darija: "تسجيل الخروج"
  },
  chatHistory: {
    french: "Historique des chats",
    darija: "تاريخ المحادثات"
  },
  error: {
    french: "Erreur",
    darija: "خطأ"
  },
  signOutSuccess: {
    french: "Déconnexion réussie",
    darija: "تم تسجيل الخروج بنجاح"
  },
  signOutSuccessDesc: {
    french: "Vous avez été déconnecté avec succès",
    darija: "تم تسجيل خروجك بنجاح"
  },
  signOutError: {
    french: "Erreur lors de la déconnexion",
    darija: "خطأ في تسجيل الخروج"
  },
  adminPanel: {
    french: "Administration",
    darija: "الإدارة"
  }
};