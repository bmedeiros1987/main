/**
 * Home Page - CrewCheck
 * Design: Sky Atlas / Cartographic Modernism
 * - Warm parchment tones, navy blue text, magenta accents
 * - Aeronautical chart inspired layout with compass elements
 * - Libre Baskerville headings, Source Sans 3 body, Fira Code data
 */

import { useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Upload, FileText, Shield, Clock, Dumbbell, AlertTriangle, TrendingUp, Download as DownloadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { parsePDF } from '@/lib/pdfParser';
import { analyzeCompliance, getGymRecommendations } from '@/lib/complianceEngine';
import type { CrewRoster } from '@/lib/pdfParser';
import type { ComplianceResult, GymRecommendation } from '@/lib/complianceEngine';

export default function Home() {
  const [, setLocation] = useLocation();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Por favor, envie um arquivo PDF.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const roster = await parsePDF(file);
      const compliance = analyzeCompliance(roster);
      const gym = getGymRecommendations(roster);
      
      // Store results in sessionStorage for the results page
      sessionStorage.setItem('crewcheck_roster', JSON.stringify(roster));
      sessionStorage.setItem('crewcheck_compliance', JSON.stringify(compliance));
      sessionStorage.setItem('crewcheck_gym', JSON.stringify(gym));
      
      setLocation('/results');
    } catch (err) {
      console.error('Error parsing PDF:', err);
      setError('Erro ao processar o PDF. Verifique se é um CrewRosterReport válido.');
    } finally {
      setIsProcessing(false);
    }
  }, [setLocation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with aeronautical chart texture */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310419663030988903/FCKt3on9S7RzRMVQawyzKi/hero-bg-VUfW93DyCrxy7CGoJbnsmr.webp)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(27,42,74,1) 1px, transparent 1px), linear-gradient(90deg, rgba(27,42,74,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="relative z-10">
        {/* Header */}
        <header className="container py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030988903/FCKt3on9S7RzRMVQawyzKi/logo-icon-hoXbTnYfda3BQ5w2oaNnr6.webp" 
              alt="CrewCheck" 
              className="w-10 h-10"
            />
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: '#1B2A4A' }}>CrewCheck</h1>
              <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">Análise de Escala</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <Shield className="w-3.5 h-3.5" />
            RBAC 117 · Lei 13.475/2017
          </div>
        </header>

        {/* Hero Section */}
        <main className="container py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            {/* Title */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: '#1B2A4A', fontFamily: "'Libre Baskerville', serif" }}>
                Sua escala está regular?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Faça upload do seu <span className="font-semibold" style={{ color: '#C2185B' }}>CrewRosterReport</span> e descubra em segundos se há irregularidades conforme a legislação aeronáutica brasileira.
              </p>
            </div>

            {/* Upload Area */}
            <div className="max-w-2xl mx-auto mb-16">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
                  ${isDragging 
                    ? 'border-[#C2185B] bg-[#C2185B]/5 scale-[1.02]' 
                    : 'border-[#1B2A4A]/30 hover:border-[#C2185B]/60 hover:bg-[#C2185B]/[0.02]'
                  }
                  ${isProcessing ? 'opacity-60 pointer-events-none' : ''}
                `}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-3 border-[#C2185B] border-t-transparent rounded-full animate-spin" />
                    <p className="text-lg font-medium" style={{ color: '#1B2A4A' }}>Analisando sua escala...</p>
                    <p className="text-sm text-muted-foreground">Verificando conformidade com RBAC 117 e Lei do Aeronauta</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1B2A4A' }}>
                        <Upload className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold mb-1" style={{ color: '#1B2A4A' }}>
                          Arraste seu PDF aqui
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          ou clique para selecionar o arquivo
                        </p>
                      </div>
                      <label>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileInput}
                          className="hidden"
                        />
                        <Button 
                          asChild
                          size="lg"
                          className="text-white font-semibold px-8"
                          style={{ backgroundColor: '#C2185B' }}
                        >
                          <span>Selecionar CrewRosterReport</span>
                        </Button>
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-6 font-mono">
                      Aceita: CrewRosterReport (PDF) · Processamento 100% local · Seus dados não saem do navegador
                    </p>
                  </>
                )}
              </div>
              
              {error && (
                <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-[#1B2A4A]/10 hover:shadow-lg transition-shadow duration-200">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#1B2A4A' }}>
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: '#1B2A4A', fontFamily: "'Libre Baskerville', serif" }}>
                  Conformidade Legal
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Verifica jornadas, repousos, folgas, madrugadas e sobreavisos contra a RBAC 117 e Lei 13.475/2017.
                </p>
              </Card>

              <Card className="p-6 bg-white/80 backdrop-blur-sm border-[#1B2A4A]/10 hover:shadow-lg transition-shadow duration-200">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#C2185B' }}>
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: '#1B2A4A', fontFamily: "'Libre Baskerville', serif" }}>
                  Visão da Escala
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Timeline visual da sua escala como rota aérea, com métricas de horas de voo, jornada e descanso.
                </p>
              </Card>

              <Card className="p-6 bg-white/80 backdrop-blur-sm border-[#1B2A4A]/10 hover:shadow-lg transition-shadow duration-200">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#2E7D32' }}>
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: '#1B2A4A', fontFamily: "'Libre Baskerville', serif" }}>
                  Planejamento Pessoal
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Sugestão de melhores dias e horários para academia, baseado na sua carga de trabalho e descanso.
                </p>
              </Card>
            </div>

            {/* Statistics and Download Links */}
            <div className="mt-12 text-center flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setLocation('/statistics')}
                variant="outline"
                className="text-[#1B2A4A] border-[#1B2A4A]/20 hover:bg-[#1B2A4A]/5"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Ver Estatísticas
              </Button>
              <Button
                onClick={() => setLocation('/download')}
                variant="outline"
                className="text-[#2E7D32] border-[#2E7D32]/20 hover:bg-[#2E7D32]/5"
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Baixar App Mobile
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 text-center">
              <div className="inline-flex items-center gap-6 text-xs text-muted-foreground font-mono">
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Processamento local
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Sem envio de dados
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Gratuito
                </span>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="container py-8 border-t border-[#1B2A4A]/10">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
              <p>CrewCheck — Ferramenta de análise de conformidade para tripulantes</p>
              <div className="flex items-center gap-4">
                <p className="font-mono">RBAC 117 · Lei 13.475/2017 · CLT</p>
                <span className="text-[#1B2A4A]/30">|</span>
                <button
                  onClick={() => setLocation('/statistics')}
                  className="hover:text-[#1B2A4A] transition-colors"
                >
                  Estatísticas
                </button>
                <span className="text-[#1B2A4A]/30">|</span>
                <button
                  onClick={() => setLocation('/download')}
                  className="hover:text-[#1B2A4A] transition-colors"
                >
                  App Mobile
                </button>
                <span className="text-[#1B2A4A]/30">|</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('61996071663');
                    alert('Chave PIX copiada: 61996071663');
                  }}
                  className="hover:text-[#1B2A4A] transition-colors"
                  title="Apoiar o desenvolvimento"
                >
                  💝 Apoiar
                </button>
              </div>
            </div>
            
            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground border-t border-[#1B2A4A]/5 pt-4">
              <button
                onClick={() => setLocation('/disclaimer')}
                className="hover:text-[#1B2A4A] transition-colors"
              >
                Aviso Legal
              </button>
              <span className="text-[#1B2A4A]/30">·</span>
              <button
                onClick={() => setLocation('/privacy')}
                className="hover:text-[#1B2A4A] transition-colors"
              >
                Política de Privacidade
              </button>
              <span className="text-[#1B2A4A]/30">·</span>
              <button
                onClick={() => setLocation('/terms')}
                className="hover:text-[#1B2A4A] transition-colors"
              >
                Termos de Serviço
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
