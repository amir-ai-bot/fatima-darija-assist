import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';

const styles = [
  { name: 'Default', colors: { primary: '#8B5CF6', secondary: '#F3E8FF' } },
  { name: 'Ocean', colors: { primary: '#3B82F6', secondary: '#DBEAFE' } },
  { name: 'Sunset', colors: { primary: '#F59E0B', secondary: '#FEF3C7' } },
  { name: 'Forest', colors: { primary: '#10B981', secondary: '#D1FAE5' } },
];

const FatimaCustomizer = () => {
  const [selectedStyle, setSelectedStyle] = useState(styles[0]);
  const { language } = useLanguage();

  const applyStyle = (style) => {
    setSelectedStyle(style);
    // Here you would typically update the app's theme
    // For now, we'll just log it to the console
    console.log('Applied style:', style);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {language === 'french' ? 'Personnaliser Fatima' : 'تخصيص فاطمة'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {styles.map((style) => (
            <div
              key={style.name}
              className={`p-4 rounded-lg cursor-pointer border-2 ${
                selectedStyle.name === style.name ? 'border-primary' : 'border-transparent'
              }`}
              onClick={() => applyStyle(style)}
            >
              <div
                className="w-full h-16 rounded-md mb-2"
                style={{
                  background: `linear-gradient(45deg, ${style.colors.primary}, ${style.colors.secondary})`,
                }}
              />
              <p className="text-center font-medium">{style.name}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FatimaCustomizer;