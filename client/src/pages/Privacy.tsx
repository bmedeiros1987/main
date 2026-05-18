import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Privacy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-4xl font-bold text-[#1B2A4A] mb-2">
            Política de Privacidade
          </h1>
          <p className="text-muted-foreground">
            Conformidade com a Lei Geral de Proteção de Dados (LGPD) - Lei nº 13.709/2018
          </p>
          <p className="text-muted-foreground text-sm">
            Última atualização: 14 de maio de 2026
          </p>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card className="p-6 border-l-4 border-l-green-500">
            <p className="text-sm text-muted-foreground leading-relaxed">
              O CrewCheck respeita sua privacidade e está comprometido em proteger seus dados pessoais de acordo 
              com a Lei Geral de Proteção de Dados (LGPD). Esta política descreve como coletamos, usamos, armazenamos 
              e protegemos suas informações.
            </p>
          </Card>

          {/* 1. Controlador de Dados */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              1. Controlador de Dados
            </h2>
            <div className="bg-slate-100 rounded-lg p-4 text-sm space-y-1">
              <p><strong>Organização:</strong> CrewCheck Brasil</p>
              <p><strong>Email:</strong> privacy@crewcheck.com.br</p>
              <p><strong>Endereço:</strong> São Paulo, SP, Brasil</p>
              <p><strong>Responsável de Dados:</strong> Disponível mediante contato</p>
            </div>
          </section>

          {/* 2. Dados Coletados */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              2. Dados Coletados
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-[#1B2A4A] mb-2">2.1 Dados de Documentos Enviados</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Quando você faz upload de um CrewRosterReport (PDF), coletamos:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Nome completo da tripulante</li>
                  <li>• ID/Matrícula da tripulante</li>
                  <li>• Função (Pilot, CCM, Flight Attendant)</li>
                  <li>• Base aérea</li>
                  <li>• Datas de voo e horários</li>
                  <li>• Informações de jornada e descanso</li>
                  <li>• Dados de localização (aeroportos, cidades)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-[#1B2A4A] mb-2">2.2 Dados de Uso da Plataforma</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Coletamos automaticamente:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Endereço IP</li>
                  <li>• Tipo de navegador e dispositivo</li>
                  <li>• Páginas visitadas e tempo de permanência</li>
                  <li>• Ações realizadas na plataforma</li>
                  <li>• Data e hora de acesso</li>
                  <li>• Cookies e identificadores similares</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-[#1B2A4A] mb-2">2.3 Dados de Consentimento</h3>
                <p className="text-sm text-muted-foreground">
                  Registramos suas decisões de consentimento para compartilhamento de dados anônimos, 
                  incluindo data e hora da decisão.
                </p>
              </div>
            </div>
          </section>

          {/* 3. Fundamento Legal */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              3. Fundamento Legal para Processamento (LGPD Art. 7º)
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Processamos seus dados com base nos seguintes fundamentos legais:
            </p>
            
            <div className="space-y-3">
              <div className="border-l-4 border-l-blue-500 pl-4">
                <h4 className="font-semibold text-sm text-[#1B2A4A]">Consentimento (Art. 7º, I)</h4>
                <p className="text-sm text-muted-foreground">
                  Você fornece consentimento explícito ao fazer upload de documentos e ao aceitar esta política.
                </p>
              </div>

              <div className="border-l-4 border-l-blue-500 pl-4">
                <h4 className="font-semibold text-sm text-[#1B2A4A]">Execução de Contrato (Art. 7º, V)</h4>
                <p className="text-sm text-muted-foreground">
                  Processamos dados necessários para fornecer o serviço de análise de conformidade.
                </p>
              </div>

              <div className="border-l-4 border-l-blue-500 pl-4">
                <h4 className="font-semibold text-sm text-[#1B2A4A]">Obrigação Legal (Art. 7º, II)</h4>
                <p className="text-sm text-muted-foreground">
                  Processamos dados conforme exigido por lei, regulamentações aeronáuticas ou ordem judicial.
                </p>
              </div>

              <div className="border-l-4 border-l-blue-500 pl-4">
                <h4 className="font-semibold text-sm text-[#1B2A4A]">Interesse Legítimo (Art. 7º, IX)</h4>
                <p className="text-sm text-muted-foreground">
                  Usamos dados para melhorar a segurança, funcionalidade e experiência da plataforma.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Finalidades do Processamento */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              4. Finalidades do Processamento
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Seus dados são processados para:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 ml-4">
              <li>• Fornecer análises de conformidade de escalas de tripulantes</li>
              <li>• Gerar relatórios e recomendações personalizadas</li>
              <li>• Manter histórico de análises anteriores</li>
              <li>• Melhorar algoritmos e precisão da plataforma</li>
              <li>• Cumprir obrigações legais e regulatórias</li>
              <li>• Prevenir fraude e abuso da plataforma</li>
              <li>• Comunicar atualizações e mudanças importantes</li>
              <li>• Gerar estatísticas anônimas para benchmarks da indústria</li>
            </ul>
          </section>

          {/* 5. Compartilhamento de Dados */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              5. Compartilhamento de Dados
            </h2>
            
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm text-[#1B2A4A] mb-2">5.1 Dados Pessoais Identificáveis</h3>
                <p className="text-sm text-muted-foreground">
                  Seus dados pessoais identificáveis (nome, ID, etc.) <strong>nunca são compartilhados</strong> com 
                  terceiros, exceto quando exigido por lei ou ordem judicial. Mantemos esses dados sob sigilo rigoroso.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-[#1B2A4A] mb-2">5.2 Dados Anônimos</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Com seu consentimento, compartilhamos <strong>dados anônimos agregados</strong> para:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Criar benchmarks da indústria por função e base aérea</li>
                  <li>• Pesquisa e desenvolvimento de melhores práticas</li>
                  <li>• Relatórios públicos sobre tendências de conformidade</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  Esses dados são agregados e não permitem identificação de indivíduos.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-[#1B2A4A] mb-2">5.3 Prestadores de Serviço</h3>
                <p className="text-sm text-muted-foreground">
                  Compartilhamos dados com prestadores de serviço (hospedagem, análise, segurança) que estão 
                  vinculados por acordos de confidencialidade e processam dados apenas conforme nossas instruções.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Retenção de Dados */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              6. Retenção de Dados
            </h2>
            <div className="bg-slate-100 rounded-lg p-4 space-y-2 text-sm">
              <p><strong>Dados de Documentos:</strong> Retidos por 24 meses após upload, então excluídos automaticamente</p>
              <p><strong>Histórico de Análises:</strong> Retido enquanto a conta estiver ativa; excluído 30 dias após desativação</p>
              <p><strong>Dados de Uso:</strong> Retidos por 90 dias para análise de segurança</p>
              <p><strong>Dados Anônimos:</strong> Retidos indefinidamente para benchmarks históricos</p>
              <p><strong>Registros de Consentimento:</strong> Retidos por 3 anos conforme LGPD</p>
            </div>
          </section>

          {/* 7. Segurança de Dados */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              7. Segurança de Dados
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Implementamos medidas técnicas e organizacionais para proteger seus dados:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 ml-4">
              <li>• Criptografia em trânsito (HTTPS/TLS)</li>
              <li>• Criptografia em repouso para dados sensíveis</li>
              <li>• Autenticação de múltiplos fatores</li>
              <li>• Controle de acesso baseado em função</li>
              <li>• Monitoramento de segurança 24/7</li>
              <li>• Auditorias de segurança regulares</li>
              <li>• Plano de resposta a incidentes</li>
            </ul>
          </section>

          {/* 8. Direitos do Titular (LGPD Art. 18) */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              8. Seus Direitos (LGPD Art. 18)
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Você tem os seguintes direitos em relação aos seus dados pessoais:
            </p>
            
            <div className="space-y-3">
              <div className="border-l-4 border-l-purple-500 pl-4">
                <h4 className="font-semibold text-sm text-[#1B2A4A]">Direito de Acesso</h4>
                <p className="text-sm text-muted-foreground">
                  Solicitar cópia de todos os dados pessoais que mantemos sobre você.
                </p>
              </div>

              <div className="border-l-4 border-l-purple-500 pl-4">
                <h4 className="font-semibold text-sm text-[#1B2A4A]">Direito de Retificação</h4>
                <p className="text-sm text-muted-foreground">
                  Corrigir dados pessoais inexatos ou incompletos.
                </p>
              </div>

              <div className="border-l-4 border-l-purple-500 pl-4">
                <h4 className="font-semibold text-sm text-[#1B2A4A]">Direito de Exclusão ("Direito ao Esquecimento")</h4>
                <p className="text-sm text-muted-foreground">
                  Solicitar exclusão de seus dados pessoais, sujeito a exceções legais.
                </p>
              </div>

              <div className="border-l-4 border-l-purple-500 pl-4">
                <h4 className="font-semibold text-sm text-[#1B2A4A]">Direito de Portabilidade</h4>
                <p className="text-sm text-muted-foreground">
                  Receber seus dados em formato estruturado e portável.
                </p>
              </div>

              <div className="border-l-4 border-l-purple-500 pl-4">
                <h4 className="font-semibold text-sm text-[#1B2A4A]">Direito de Oposição</h4>
                <p className="text-sm text-muted-foreground">
                  Opor-se ao processamento de seus dados para fins específicos.
                </p>
              </div>

              <div className="border-l-4 border-l-purple-500 pl-4">
                <h4 className="font-semibold text-sm text-[#1B2A4A]">Direito de Revogação de Consentimento</h4>
                <p className="text-sm text-muted-foreground">
                  Revogar consentimento para processamento de dados a qualquer momento.
                </p>
              </div>

              <div className="border-l-4 border-l-purple-500 pl-4">
                <h4 className="font-semibold text-sm text-[#1B2A4A]">Direito de Informação</h4>
                <p className="text-sm text-muted-foreground">
                  Receber informações claras sobre como seus dados são processados.
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Para exercer qualquer desses direitos, entre em contato através de privacy@crewcheck.com.br. 
              Responderemos em até 15 dias úteis.
            </p>
          </section>

          {/* 9. Cookies e Rastreamento */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              9. Cookies e Rastreamento
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              O CrewCheck utiliza cookies e tecnologias similares para:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 ml-4">
              <li>• Manter sua sessão de login</li>
              <li>• Lembrar suas preferências</li>
              <li>• Analisar uso da plataforma</li>
              <li>• Melhorar experiência do usuário</li>
              <li>• Prevenir fraude</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-3">
              Você pode controlar cookies através das configurações do seu navegador. Desabilitar cookies pode 
              afetar a funcionalidade da plataforma.
            </p>
          </section>

          {/* 10. Transferência Internacional */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              10. Transferência Internacional de Dados
            </h2>
            <p className="text-sm text-muted-foreground">
              Seus dados são armazenados e processados primariamente no Brasil. Transferências internacionais, 
              quando necessárias, ocorrem apenas para jurisdições com proteção adequada de dados ou com base em 
              cláusulas contratuais padrão aprovadas pela ANPD.
            </p>
          </section>

          {/* 11. Contato e Reclamações */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              11. Contato e Reclamações
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Para questões sobre privacidade ou para exercer seus direitos:
            </p>
            <div className="bg-slate-100 rounded-lg p-4 text-sm space-y-2">
              <p><strong>Email:</strong> privacy@crewcheck.com.br</p>
              <p><strong>Responsável de Dados:</strong> Disponível mediante contato</p>
              <p><strong>Autoridade Competente:</strong> ANPD (Autoridade Nacional de Proteção de Dados)</p>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Você também pode apresentar reclamação à ANPD caso considere que seus direitos foram violados.
            </p>
          </section>

          {/* 12. Atualizações da Política */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              12. Atualizações desta Política
            </h2>
            <p className="text-sm text-muted-foreground">
              Podemos atualizar esta política periodicamente. Notificaremos você sobre mudanças significativas 
              via email ou através de aviso na plataforma. Seu uso contínuo da plataforma após atualizações 
              constitui aceitação dos novos termos.
            </p>
          </section>

          {/* Footer */}
          <Card className="p-4 bg-slate-100 border-0">
            <p className="text-xs text-muted-foreground">
              Esta Política de Privacidade está em conformidade com a Lei Geral de Proteção de Dados (LGPD) 
              - Lei nº 13.709/2018 e suas regulamentações. Última atualização: 14 de maio de 2026.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
