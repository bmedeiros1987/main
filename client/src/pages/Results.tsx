/**
 * Results Page - CrewCheck
 * Design: Sky Atlas / Cartographic Modernism
 * - Asymmetric layout with main content (70%) and legend panel (30%)
 * - Timeline as flight route with waypoints
 * - Aeronautical chart styling
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { 
  ArrowLeft, Shield, AlertTriangle, CheckCircle2, Clock, 
  Plane, Calendar, Dumbbell, FileText, Info, XCircle, Download,
  MessageCircle, Send, Copy, Check, ChevronDown
} from 'lucide-react';
import { exportReport } from '@/lib/pdfExport';
import { shareToWhatsApp, shareToTelegram, copyToClipboard } from '@/lib/sharing';
import { generateICalendar, downloadCalendarFile } from '@/lib/calendarExport';
import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';
import { useAnonymousStatistics } from '@/hooks/useAnonymousStatistics';
import { ConsentDialog } from '@/components/ConsentDialog';
import { RosterTimeline } from '@/components/RosterTimeline';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import type { CrewRoster } from '@/lib/pdfParser';
import type { ComplianceResult, GymRecommendation } from '@/lib/complianceEngine';

export default function Results() {
  const [, setLocation] = useLocation();
  const [roster, setRoster] = useState<CrewRoster | null>(null);
  const [compliance, setCompliance] = useState<ComplianceResult | null>(null);
  const [gym, setGym] = useState<GymRecommendation[] | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const { saveAnalysis } = useAnalysisHistory();
  const { submitStatisticsIfConsented } = useAnonymousStatistics();

  useEffect(() => {
    const rosterData = sessionStorage.getItem('crewcheck_roster');
    const complianceData = sessionStorage.getItem('crewcheck_compliance');
    const gymData = sessionStorage.getItem('crewcheck_gym');

    if (!rosterData || !complianceData) {
      setLocation('/');
      return;
    }

    const parsedRoster = JSON.parse(rosterData);
    const parsedCompliance = JSON.parse(complianceData);
    const parsedGym = gymData ? JSON.parse(gymData) : [];

    setRoster(parsedRoster);
    setCompliance(parsedCompliance);
    setGym(parsedGym);

    // Save to local history (only once per analysis)
    try {
      // Check if we already saved this analysis by looking at the most recent entry
      // This prevents duplicate saves when the component re-renders
      const historyKey = `crewcheck_last_saved_${parsedRoster.month}_${parsedRoster.year}`;
      const lastSaved = sessionStorage.getItem(historyKey);
      
      if (!lastSaved) {
        saveAnalysis(parsedRoster, parsedCompliance, parsedGym);
        sessionStorage.setItem(historyKey, 'true');
        
        // Show consent dialog if user hasn't made a decision yet
        const consentHistory = localStorage.getItem('crewcheck_consent_history');
        if (!consentHistory) {
          setShowConsentDialog(true);
        }
      }
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  }, [setLocation, saveAnalysis]);

  const handleConsentDecision = async (consent: boolean) => {
    setShowConsentDialog(false);
    if (consent) {
      // Submit anonymous statistics
      if (roster && compliance) {
        const submitted = await submitStatisticsIfConsented(roster, compliance);
        if (submitted) {
          toast.success('Obrigado por contribuir com dados anônimos!');
        } else {
          toast.error('Erro ao enviar dados anônimos.');
        }
      }
    } else {
      toast.info('Você pode mudar sua preferência a qualquer momento.');
    }
  };

  if (!roster || !compliance) return null;

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const statusColor = compliance.overallStatus === 'violation' ? '#D32F2F' : compliance.overallStatus === 'warning' ? '#F57C00' : '#2E7D32';
  const statusIcon = compliance.overallStatus === 'violation' ? XCircle : compliance.overallStatus === 'warning' ? AlertTriangle : CheckCircle2;
  const StatusIcon = statusIcon;

  const errors = compliance.alerts.filter(a => a.severity === 'error');
  const warnings = compliance.alerts.filter(a => a.severity === 'warning');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFAF3' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#1B2A4A]/10">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation('/')}
                className="text-[#1B2A4A] hover:bg-[#1B2A4A]/5"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Nova análise
              </Button>
              <div className="hidden sm:block h-6 w-px bg-[#1B2A4A]/10" />
              <div className="hidden sm:flex items-center gap-2">
                <img 
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030988903/FCKt3on9S7RzRMVQawyzKi/logo-icon-hoXbTnYfda3BQ5w2oaNnr6.webp" 
                  alt="CrewCheck" 
                  className="w-6 h-6"
                />
                <span className="font-bold text-sm" style={{ color: '#1B2A4A' }}>CrewCheck</span>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className="font-mono text-xs"
              style={{ borderColor: statusColor, color: statusColor }}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {compliance.overallStatus === 'violation' ? 'IRREGULARIDADES' : compliance.overallStatus === 'warning' ? 'ATENÇÃO' : 'CONFORME'}
            </Badge>
          </div>

          {/* Action Buttons - Improved Layout */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            {/* Share Menu */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="text-[#1B2A4A] border-[#1B2A4A]/20 hover:bg-[#1B2A4A]/5 whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Compartilhar
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
              {showShareMenu && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#1B2A4A]/10 z-50">
                  <button
                    onClick={() => {
                      shareToWhatsApp(roster, compliance);
                      setShowShareMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-[#1B2A4A]/5 flex items-center gap-2 text-sm"
                  >
                    <Send className="w-4 h-4" style={{ color: '#25D366' }} />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => {
                      shareToTelegram(roster, compliance);
                      setShowShareMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-[#1B2A4A]/5 flex items-center gap-2 text-sm border-t border-[#1B2A4A]/10"
                  >
                    <Send className="w-4 h-4" style={{ color: '#0088cc' }} />
                    Telegram
                  </button>
                  <button
                    onClick={async () => {
                      const success = await copyToClipboard(roster, compliance);
                      if (success) {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                        toast.success('Copiado para a área de transferência');
                      } else {
                        toast.error('Erro ao copiar');
                      }
                      setShowShareMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-[#1B2A4A]/5 flex items-center gap-2 text-sm border-t border-[#1B2A4A]/10"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" style={{ color: '#2E7D32' }} />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    Copiar
                  </button>
                </div>
              )}
            </div>

            {/* Export Menu */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="text-[#1B2A4A] border-[#1B2A4A]/20 hover:bg-[#1B2A4A]/5 whitespace-nowrap"
              >
                <Download className="w-4 h-4 mr-1" />
                Exportar
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
              {showExportMenu && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#1B2A4A]/10 z-50">
                  <button
                    onClick={() => {
                      exportReport(roster, compliance, gym || []);
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-[#1B2A4A]/5 flex items-center gap-2 text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    Exportar PDF
                  </button>
                  <button
                    onClick={() => {
                      const ical = generateICalendar(roster, gym || undefined);
                      downloadCalendarFile(ical, `crewcheck-${roster.month}-${roster.year}.ics`);
                      toast.success('Calendário exportado com sucesso!');
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-[#1B2A4A]/5 flex items-center gap-2 text-sm border-t border-[#1B2A4A]/10"
                  >
                    <Calendar className="w-4 h-4" />
                    Exportar Calendário
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Summary Card */}
        <div className="mb-8">
          <Card className="p-6 md:p-8 bg-white border-[#1B2A4A]/10" style={{ borderLeft: `4px solid ${statusColor}` }}>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: `${statusColor}15` }}>
                  <StatusIcon className="w-7 h-7" style={{ color: statusColor }} />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1B2A4A', fontFamily: "'Libre Baskerville', serif" }}>
                    {monthNames[roster.month - 1]} {roster.year}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {roster.crewName} · {roster.rank} · Base {roster.base}
                  </p>
                </div>
              </div>
              <div className="md:ml-auto grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold font-mono" style={{ color: statusColor }}>{compliance.score}</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold font-mono text-red-600">{errors.length}</p>
                  <p className="text-xs text-muted-foreground">Irregularidades</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold font-mono text-amber-600">{warnings.length}</p>
                  <p className="text-xs text-muted-foreground">Alertas</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{compliance.summary}</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="compliance" className="space-y-6">
          <TabsList className="bg-white border border-[#1B2A4A]/10 w-full justify-start">
            <TabsTrigger value="compliance" className="data-[state=active]:bg-[#1B2A4A] data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Conformidade</span>
              <span className="sm:hidden">Conformidade</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-[#1B2A4A] data-[state=active]:text-white">
              <Clock className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Métricas</span>
              <span className="sm:hidden">Métricas</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-[#1B2A4A] data-[state=active]:text-white">
              <Plane className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Timeline</span>
              <span className="sm:hidden">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="gym" className="data-[state=active]:bg-[#1B2A4A] data-[state=active]:text-white">
              <Dumbbell className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Academia</span>
              <span className="sm:hidden">Academia</span>
            </TabsTrigger>
          </TabsList>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4">
            {compliance.alerts.length === 0 ? (
              <Card className="p-8 bg-white border-green-200 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2" style={{ color: '#1B2A4A', fontFamily: "'Libre Baskerville', serif" }}>
                  Escala em conformidade
                </h3>
                <p className="text-muted-foreground">
                  Nenhuma irregularidade encontrada. Sua escala respeita todos os limites da RBAC 117 e da Lei do Aeronauta.
                </p>
              </Card>
            ) : (
              <>
                {errors.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-red-700 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Irregularidades ({errors.length})
                    </h3>
                    {errors.map(alert => (
                      <AlertCard key={alert.id} alert={alert} />
                    ))}
                  </div>
                )}
                {warnings.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Pontos de Atenção ({warnings.length})
                    </h3>
                    {warnings.map(alert => (
                      <AlertCard key={alert.id} alert={alert} />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics">
            <div className="grid md:grid-cols-2 gap-4">
              <MetricCard 
                title="Horas de Voo" 
                value={compliance.metrics.totalFlightHours}
                max={compliance.metrics.maxFlightHoursMonth}
                unit="h"
                icon={Plane}
                reference="Art. 33, I - Lei 13.475"
              />
              <MetricCard 
                title="Horas de Trabalho" 
                value={compliance.metrics.totalDutyHours}
                max={compliance.metrics.maxDutyHoursMonth}
                unit="h"
                icon={Clock}
                reference="Art. 41 - Lei 13.475"
              />
              <MetricCard 
                title="Folgas no Mês" 
                value={compliance.metrics.totalDaysOff}
                max={compliance.metrics.minDaysOffRequired}
                unit=" dias"
                icon={Calendar}
                reference="Art. 51 - Lei 13.475"
                inverted
              />
              <MetricCard 
                title="Sobreavisos" 
                value={compliance.metrics.totalStandby}
                max={compliance.metrics.maxStandbyMonth}
                unit=""
                icon={FileText}
                reference="Art. 43, §7º - Lei 13.475"
              />
              <MetricCard 
                title="Operações na Madrugada" 
                value={compliance.metrics.nightOperations}
                max={compliance.metrics.maxNightOps168h}
                unit=" total (limite: 4 por 168h)"
                icon={Clock}
                reference="Art. 42 - Lei 13.475"
                hideMaxLabel
              />
              <MetricCard 
                title="Folgas em Fim de Semana" 
                value={compliance.metrics.weekendPairs}
                max={compliance.metrics.minWeekendPairs}
                unit=" dia(s)"
                icon={Calendar}
                reference="Art. 51 - Lei 13.475"
                inverted
              />
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card className="p-6 bg-white border-[#1B2A4A]/10">
              <h3 className="text-lg font-bold mb-6" style={{ color: '#1B2A4A', fontFamily: "'Libre Baskerville', serif" }}>
                Rota do Mês — {monthNames[roster.month - 1]} {roster.year}
              </h3>
              <div className="space-y-1 overflow-x-auto">
                {roster.days.map((day, idx) => (
                  <TimelineDay key={idx} day={day} />
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Gym Tab */}
          <TabsContent value="gym">
            <Card className="p-6 bg-white border-[#1B2A4A]/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#2E7D32' }}>
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: '#1B2A4A', fontFamily: "'Libre Baskerville', serif" }}>
                    Planejamento de Academia
                  </h3>
                  <p className="text-sm text-muted-foreground">Melhores dias e horários para treinar</p>
                </div>
              </div>
              
              {gym && gym.length > 0 ? (
                <div className="space-y-2">
                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mb-4 text-xs">
                    <span className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      Ideal para treino
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      Possível com cuidado
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      Evitar (priorize descanso)
                    </span>
                  </div>
                  
                  <div className="grid gap-2">
                    {gym.map((rec, idx) => (
                      <GymCard key={idx} recommendation={rec} />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma recomendação disponível. Verifique se o PDF foi processado corretamente.
                </p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <ConsentDialog 
        isOpen={showConsentDialog} 
        onConsent={handleConsentDecision}
      />
    </div>
  );
}

// Component imports - these should be in separate files
function AlertCard({ alert }: any) {
  return (
    <Card className="p-4 bg-white border-l-4" style={{ borderLeftColor: alert.severity === 'error' ? '#D32F2F' : '#F57C00' }}>
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {alert.severity === 'error' ? (
            <XCircle className="w-5 h-5 text-red-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm" style={{ color: '#1B2A4A' }}>{alert.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
          {alert.reference && (
            <p className="text-xs text-muted-foreground mt-2 font-mono">{alert.reference}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

function MetricCard({ title, value, max, unit, icon: Icon, reference, inverted, hideMaxLabel }: any) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const isExceeded = !inverted && percentage > 100;
  const isInsufficient = inverted && percentage < 100;
  const isWarning = isExceeded || isInsufficient;
  
  return (
    <Card className="p-4 bg-white border-[#1B2A4A]/10">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: isWarning ? '#FFF3E0' : '#E8F5E9' }}>
            <Icon className="w-4 h-4" style={{ color: isWarning ? '#F57C00' : '#2E7D32' }} />
          </div>
          <div>
            <h4 className="font-semibold text-sm" style={{ color: '#1B2A4A' }}>{title}</h4>
            <p className="text-xs text-muted-foreground">{reference}</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono" style={{ color: isWarning ? '#F57C00' : '#2E7D32' }}>
            {value.toFixed(1)}{unit}
          </span>
          {!hideMaxLabel && (
            <span className="text-xs text-muted-foreground">
              {inverted ? 'Mín' : 'Máx'}: {max.toFixed(1)}{unit}
            </span>
          )}
        </div>
        <Progress value={Math.min(percentage, 100)} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {percentage.toFixed(0)}% {inverted ? 'atingido' : 'utilizado'}
        </p>
      </div>
    </Card>
  );
}

function TimelineDay({ day }: any) {
  return (
    <div className="flex gap-3 py-2 px-3 rounded-lg hover:bg-[#1B2A4A]/5 transition-colors">
      <div className="flex-shrink-0 w-20 font-mono text-sm font-semibold" style={{ color: '#1B2A4A' }}>
        {day.date}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: '#1B2A4A15', color: '#1B2A4A' }}>
            {day.type}
          </span>
          {day.legs && day.legs.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {day.legs.map((leg: any) => `${leg.flightNumber} ${leg.origin}-${leg.destination}`).join(' • ')}
            </span>
          )}
          {day.dutyHours && (
            <span className="text-xs text-muted-foreground ml-auto">
              {day.dutyHours.toFixed(1)}h
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function GymCard({ recommendation }: any) {
  const getColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#2E7D32';
      case 'medium': return '#F57C00';
      case 'low': return '#D32F2F';
      default: return '#1B2A4A';
    }
  };

  const getLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Ideal';
      case 'medium': return 'Possível';
      case 'low': return 'Evitar';
      default: return 'Neutro';
    }
  };

  return (
    <Card className="p-3 bg-white border-l-4" style={{ borderLeftColor: getColor(recommendation.priority) }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>{recommendation.date}</p>
          <p className="text-xs text-muted-foreground">{recommendation.reason}</p>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: `${getColor(recommendation.priority)}20`, color: getColor(recommendation.priority) }}>
          {getLabel(recommendation.priority)}
        </span>
      </div>
    </Card>
  );
}
