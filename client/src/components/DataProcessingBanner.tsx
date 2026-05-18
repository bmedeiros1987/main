import { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DataProcessingBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const BANNER_KEY = 'crewcheck_processing_banner_dismissed';

  useEffect(() => {
    // Check if user has already dismissed this banner
    const isDismissed = localStorage.getItem(BANNER_KEY);
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(BANNER_KEY, 'true');
    setIsVisible(false);
  };

  const handleLearnMore = () => {
    window.location.href = '/privacy';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Processamento de Dados Pessoais</p>
              <p className="text-blue-800">
                O CrewCheck processa dados pessoais de tripulantes para análise de conformidade. 
                Seus dados são protegidos conforme a LGPD. 
                <button 
                  onClick={handleLearnMore}
                  className="ml-1 text-blue-600 hover:text-blue-700 underline font-semibold"
                >
                  Saiba mais
                </button>
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
