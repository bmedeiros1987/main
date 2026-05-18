import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ConsentDialogProps {
  onConsent: (consent: boolean) => void;
  isOpen: boolean;
}

export function ConsentDialog({ onConsent, isOpen }: ConsentDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConsent = async (consent: boolean) => {
    setLoading(true);
    try {
      // Store consent decision in localStorage
      const consentHistory = JSON.parse(localStorage.getItem('crewcheck_consent_history') || '[]');
      consentHistory.push({
        timestamp: Date.now(),
        consent,
      });
      localStorage.setItem('crewcheck_consent_history', JSON.stringify(consentHistory));
      
      onConsent(consent);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6 bg-white shadow-lg">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-[#1B2A4A]">
              Contribuir com Dados Anônimos?
            </h3>
            <p className="text-sm text-muted-foreground">
              Você gostaria de contribuir com dados anônimos para melhorar as estatísticas da indústria? 
              Seus dados pessoais nunca serão compartilhados.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-blue-900">Dados coletados (sem informações pessoais):</p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Função (Pilot, CCM, FA)</li>
              <li>• Base aérea</li>
              <li>• Companhia aérea</li>
              <li>• Horas de voo e jornada</li>
              <li>• Status de conformidade</li>
              <li>• Mês de referência</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleConsent(false)}
              disabled={loading}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Não, obrigado
            </Button>
            <Button
              className="flex-1 bg-[#1B2A4A] hover:bg-[#1B2A4A]/90"
              onClick={() => handleConsent(true)}
              disabled={loading}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Sim, contribuir
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Você pode mudar sua preferência a qualquer momento nas configurações.
          </p>
        </div>
      </Card>
    </div>
  );
}
