'use client';

import { useState, useEffect } from 'react';
import { Download as DownloadIcon, Smartphone, QrCode, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Download() {
  const [downloadCount, setDownloadCount] = useState(0);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    // Load download count from localStorage
    const count = localStorage.getItem('crewcheck_download_count');
    if (count) {
      setDownloadCount(parseInt(count));
    }
  }, []);

  const handleDownload = () => {
    // Increment download count
    const newCount = downloadCount + 1;
    setDownloadCount(newCount);
    localStorage.setItem('crewcheck_download_count', newCount.toString());

    // Trigger download
    const link = document.createElement('a');
    link.href = '/manus-storage/crewcheck-1.0.0_8be6b300.apk';
    link.download = 'CrewCheck.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Download iniciado!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1B2A4A' }}>
            Baixe o CrewCheck
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Acesse a análise de escala offline em seu dispositivo Android. Sem necessidade de conexão com a internet.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Download Section */}
          <div>
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-[#1B2A4A]/10">
              <div className="flex items-center justify-center w-12 h-12 rounded mb-6" style={{ backgroundColor: '#C41E3A' }}>
                <DownloadIcon className="w-6 h-6 text-white" />
              </div>

              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1B2A4A', fontFamily: "'Libre Baskerville', serif" }}>
                Download Direto
              </h2>

              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Baixe o APK diretamente no seu dispositivo Android. A instalação é rápida e segura.
              </p>

              <Button
                onClick={handleDownload}
                className="w-full mb-4 text-white"
                style={{ backgroundColor: '#C41E3A' }}
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Baixar APK (45 MB)
              </Button>

              <div className="text-xs text-muted-foreground text-center">
                {downloadCount > 0 && (
                  <p className="mb-2">
                    <CheckCircle className="w-4 h-4 inline mr-1 text-[#2E7D32]" />
                    {downloadCount.toLocaleString('pt-BR')} downloads
                  </p>
                )}
                <p>Atualizado em: 15/05/2026</p>
              </div>
            </Card>
          </div>

          {/* QR Code Section */}
          <div>
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-[#1B2A4A]/10">
              <div className="flex items-center justify-center w-12 h-12 rounded mb-6" style={{ backgroundColor: '#2E7D32' }}>
                <QrCode className="w-6 h-6 text-white" />
              </div>

              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1B2A4A', fontFamily: "'Libre Baskerville', serif" }}>
                QR Code
              </h2>

              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Escaneie o código QR com seu dispositivo para acessar o download direto.
              </p>

              <Button
                onClick={() => setShowQRCode(!showQRCode)}
                className="w-full mb-4"
                variant="outline"
              >
                <QrCode className="w-4 h-4 mr-2" />
                {showQRCode ? 'Ocultar' : 'Mostrar'} QR Code
              </Button>

              {showQRCode && (
                <div className="bg-gray-100 p-4 rounded flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-2">QR Code (Placeholder)</p>
                    <div className="w-32 h-32 bg-gray-300 rounded flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-[#1B2A4A]/10">
            <div className="flex items-center justify-center w-10 h-10 rounded mb-4" style={{ backgroundColor: '#1B2A4A' }}>
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold mb-2" style={{ color: '#1B2A4A' }}>
              100% Offline
            </h3>
            <p className="text-sm text-muted-foreground">
              Funciona completamente offline após o download. Seus dados permanecem no seu dispositivo.
            </p>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-[#1B2A4A]/10">
            <div className="flex items-center justify-center w-10 h-10 rounded mb-4" style={{ backgroundColor: '#C41E3A' }}>
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold mb-2" style={{ color: '#1B2A4A' }}>
              Análise Rápida
            </h3>
            <p className="text-sm text-muted-foreground">
              Receba análise de conformidade em segundos. Sem envio de dados para a nuvem.
            </p>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-[#1B2A4A]/10">
            <div className="flex items-center justify-center w-10 h-10 rounded mb-4" style={{ backgroundColor: '#2E7D32' }}>
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold mb-2" style={{ color: '#1B2A4A' }}>
              Seguro
            </h3>
            <p className="text-sm text-muted-foreground">
              Seus dados de escala nunca deixam seu dispositivo. Privacidade garantida.
            </p>
          </Card>
        </div>

        {/* Instructions Section */}
        <Card className="p-8 bg-white/80 backdrop-blur-sm border-[#1B2A4A]/10 mb-12">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#1B2A4A', fontFamily: "'Libre Baskerville', serif" }}>
            Como Instalar
          </h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: '#C41E3A' }}>
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Baixe o APK</h3>
                <p className="text-sm text-muted-foreground">
                  Clique no botão de download acima para baixar o arquivo CrewCheck.apk
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: '#C41E3A' }}>
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Ative Instalação de Fontes Desconhecidas</h3>
                <p className="text-sm text-muted-foreground">
                  Vá para Configurações &gt; Segurança &gt; Fontes Desconhecidas e ative a opção
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: '#C41E3A' }}>
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Instale o Aplicativo</h3>
                <p className="text-sm text-muted-foreground">
                  Abra o arquivo APK baixado e siga as instruções de instalação
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: '#C41E3A' }}>
                <span className="text-white text-sm font-bold">4</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Comece a Usar</h3>
                <p className="text-sm text-muted-foreground">
                  Abra o CrewCheck e faça upload de sua escala para análise instantânea
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Requirements Section */}
        <Card className="p-8 bg-white/80 backdrop-blur-sm border-[#1B2A4A]/10">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#1B2A4A', fontFamily: "'Libre Baskerville', serif" }}>
            Requisitos do Sistema
          </h2>

          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 mt-0.5 text-[#2E7D32]" />
              <span>Android 8.0 ou superior</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 mt-0.5 text-[#2E7D32]" />
              <span>Pelo menos 50 MB de espaço livre</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 mt-0.5 text-[#2E7D32]" />
              <span>Permissão para acessar arquivos (para upload de PDF)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 mt-0.5 text-[#2E7D32]" />
              <span>Conexão com a internet (apenas para primeira instalação)</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
