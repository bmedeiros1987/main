/**
 * Global Statistics Page - CrewCheck
 * Shows anonymous industry statistics by crew function
 * - Pilots, CCMs, Flight Attendants
 * - Aggregated metrics from opt-in users
 * - Trends and comparisons
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, TrendingUp, Users, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FUNCTIONS = [
  { id: 'pilot', label: 'Pilotos', icon: '✈️' },
  { id: 'ccm', label: 'CCM (Chefe de Cabine)', icon: '👨‍✈️' },
  { id: 'fa', label: 'Comissários', icon: '👩‍✈️' },
];

interface StatisticData {
  function: string;
  base: string;
  totalFlightHours: number;
  flightLegsCount: number;
  avgFlightDuration: number;
  avgDailyDutyTime: number;
  avgNightFlights: number;
  avgRestDays: number;
  complianceScore: number;
  hasViolations: boolean;
  hasWarnings: boolean;
  avgGymDaysPerMonth: number;
  sampleCount: number;
}

const AIRLINES = [
  { id: 'all', label: 'Todas as Companhias' },
  { id: 'LATAM', label: 'LATAM' },
  { id: 'Azul', label: 'Azul' },
  { id: 'Gol', label: 'Gol' },
  { id: 'Avianca', label: 'Avianca' },
  { id: 'Passaredo', label: 'Passaredo' },
  { id: 'Trip', label: 'Trip' },
  { id: 'Total', label: 'Total' },
];

export default function Statistics() {
  const [, setLocation] = useLocation();
  const [selectedFunction, setSelectedFunction] = useState('pilot');
  const [selectedAirline, setSelectedAirline] = useState('all');
  const [statistics, setStatistics] = useState<StatisticData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch statistics from backend
    // For now, show placeholder
    setIsLoading(false);
  }, [selectedFunction, selectedAirline]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const selectedFunctionLabel = FUNCTIONS.find(f => f.id === selectedFunction)?.label || 'Pilotos';

  // Mock data for demonstration
  const mockData = [
    {
      base: 'GIG',
      avgFlightHours: 85,
      avgDutyTime: 420,
      complianceScore: 92,
      sampleSize: 42,
    },
    {
      base: 'CGH',
      avgFlightHours: 78,
      avgDutyTime: 410,
      complianceScore: 88,
      sampleSize: 38,
    },
    {
      base: 'MAO',
      avgFlightHours: 92,
      avgDutyTime: 450,
      complianceScore: 85,
      sampleSize: 25,
    },
    {
      base: 'SSA',
      avgFlightHours: 75,
      avgDutyTime: 400,
      complianceScore: 90,
      sampleSize: 18,
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFAF3' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#1B2A4A]/10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation('/')}
              className="text-[#1B2A4A] hover:bg-[#1B2A4A]/5"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar
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
          <Badge variant="outline" className="font-mono text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            Estatísticas Anônimas
          </Badge>
        </div>
      </header>

      <main className="container py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B2A4A', fontFamily: "'Libre Baskerville', serif" }}>
            Estatísticas da Indústria
          </h1>
          <p className="text-muted-foreground">
            Métricas anônimas agregadas de tripulantes que optaram por compartilhar dados
          </p>
        </div>

        {/* Airline Selector */}
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="text-sm font-semibold text-[#1B2A4A] self-center mr-2">Companhia Aérea:</span>
          {AIRLINES.map((airline) => (
            <Button
              key={airline.id}
              variant={selectedAirline === airline.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedAirline(airline.id)}
              className={selectedAirline === airline.id ? 'bg-[#1B2A4A] text-white' : 'border-[#1B2A4A]/20 text-[#1B2A4A] hover:bg-[#1B2A4A]/5'}
            >
              {airline.label}
            </Button>
          ))}
        </div>

        {/* Function Selector */}
        <div className="mb-8">
          <Tabs value={selectedFunction} onValueChange={setSelectedFunction}>
            <TabsList className="bg-white border border-[#1B2A4A]/10">
              {FUNCTIONS.map((func) => (
                <TabsTrigger key={func.id} value={func.id} className="data-[state=active]:bg-[#1B2A4A]/5">
                  <span className="mr-2">{func.icon}</span>
                  {func.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {FUNCTIONS.map((func) => (
              <TabsContent key={func.id} value={func.id} className="mt-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card className="p-4 bg-white border-[#1B2A4A]/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-mono">Horas Médias</p>
                        <p className="text-2xl font-bold mt-1" style={{ color: '#1B2A4A' }}>
                          {mockData.reduce((acc, d) => acc + d.avgFlightHours, 0) / mockData.length | 0}h
                        </p>
                      </div>
                      <Clock className="w-5 h-5" style={{ color: '#1B2A4A' }} />
                    </div>
                  </Card>

                  <Card className="p-4 bg-white border-[#1B2A4A]/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-mono">Conformidade</p>
                        <p className="text-2xl font-bold mt-1" style={{ color: '#2E7D32' }}>
                          {(mockData.reduce((acc, d) => acc + d.complianceScore, 0) / mockData.length).toFixed(0)}%
                        </p>
                      </div>
                      <TrendingUp className="w-5 h-5" style={{ color: '#2E7D32' }} />
                    </div>
                  </Card>

                  <Card className="p-4 bg-white border-[#1B2A4A]/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-mono">Participantes</p>
                        <p className="text-2xl font-bold mt-1" style={{ color: '#1B2A4A' }}>
                          {mockData.reduce((acc, d) => acc + d.sampleSize, 0)}
                        </p>
                      </div>
                      <Users className="w-5 h-5" style={{ color: '#1B2A4A' }} />
                    </div>
                  </Card>

                  <Card className="p-4 bg-white border-[#1B2A4A]/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-mono">Período</p>
                        <p className="text-sm font-bold mt-1" style={{ color: '#1B2A4A' }}>
                          {currentMonth}
                        </p>
                      </div>
                      <AlertTriangle className="w-5 h-5" style={{ color: '#F57C00' }} />
                    </div>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Flight Hours by Base */}
                  <Card className="p-6 bg-white border-[#1B2A4A]/10">
                    <h3 className="font-bold mb-4" style={{ color: '#1B2A4A' }}>
                      Horas de Voo por Base
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={mockData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1B2A4A/10" />
                        <XAxis dataKey="base" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="avgFlightHours" fill="#1B2A4A" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* Compliance Score by Base */}
                  <Card className="p-6 bg-white border-[#1B2A4A]/10">
                    <h3 className="font-bold mb-4" style={{ color: '#1B2A4A' }}>
                      Conformidade por Base
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={mockData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1B2A4A/10" />
                        <XAxis dataKey="base" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="complianceScore" stroke="#2E7D32" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </div>

                {/* Detailed Table */}
                <Card className="mt-6 p-6 bg-white border-[#1B2A4A]/10">
                  <h3 className="font-bold mb-4" style={{ color: '#1B2A4A' }}>
                    Detalhes por Base
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#1B2A4A]/10">
                          <th className="text-left py-2 px-2 font-mono text-xs text-muted-foreground">Base</th>
                          <th className="text-right py-2 px-2 font-mono text-xs text-muted-foreground">Horas</th>
                          <th className="text-right py-2 px-2 font-mono text-xs text-muted-foreground">Jornada</th>
                          <th className="text-right py-2 px-2 font-mono text-xs text-muted-foreground">Conformidade</th>
                          <th className="text-right py-2 px-2 font-mono text-xs text-muted-foreground">Amostra</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockData.map((row) => (
                          <tr key={row.base} className="border-b border-[#1B2A4A]/5 hover:bg-[#1B2A4A]/2">
                            <td className="py-3 px-2 font-mono font-bold" style={{ color: '#1B2A4A' }}>
                              {row.base}
                            </td>
                            <td className="text-right py-3 px-2">{row.avgFlightHours}h</td>
                            <td className="text-right py-3 px-2">{row.avgDutyTime}min</td>
                            <td className="text-right py-3 px-2">
                              <Badge 
                                variant="outline"
                                style={{
                                  borderColor: row.complianceScore >= 90 ? '#2E7D32' : '#F57C00',
                                  color: row.complianceScore >= 90 ? '#2E7D32' : '#F57C00',
                                }}
                              >
                                {row.complianceScore}%
                              </Badge>
                            </td>
                            <td className="text-right py-3 px-2 text-muted-foreground">{row.sampleSize}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Info Box */}
                <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>ℹ️ Dados Anônimos:</strong> Todas as estatísticas são agregadas e anônimas. Nenhum dado pessoal é compartilhado. 
                    Você pode optar por contribuir com seus dados ao analisar uma escala.
                  </p>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
