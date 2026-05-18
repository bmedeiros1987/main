import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Terms() {
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
            Termos de Serviço
          </h1>
          <p className="text-muted-foreground">
            Última atualização: 14 de maio de 2026
          </p>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card className="p-6 border-l-4 border-l-indigo-500">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Estes Termos de Serviço ("Termos") estabelecem um acordo vinculativo entre você ("Usuário") e 
              CrewCheck Brasil ("Empresa"). Ao acessar ou usar a plataforma CrewCheck, você concorda em estar 
              vinculado por estes Termos. Se não concordar com qualquer disposição, não use o serviço.
            </p>
          </Card>

          {/* 1. Definições */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              1. Definições
            </h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>"Plataforma"</strong> refere-se ao website, aplicativo e serviços CrewCheck.</p>
              <p><strong>"Usuário"</strong> refere-se a qualquer pessoa que acessa ou utiliza a Plataforma.</p>
              <p><strong>"Conteúdo"</strong> inclui documentos, análises, relatórios e qualquer informação fornecida pela Plataforma.</p>
              <p><strong>"Dados Pessoais"</strong> refere-se a qualquer informação que identifique ou possa identificar um indivíduo.</p>
              <p><strong>"Serviço"</strong> refere-se à análise de conformidade de escalas de tripulantes fornecida pela Plataforma.</p>
            </div>
          </section>

          {/* 2. Elegibilidade e Contas */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              2. Elegibilidade e Contas de Usuário
            </h2>
            
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm text-[#1B2A4A] mb-2">2.1 Elegibilidade</h3>
                <p className="text-sm text-muted-foreground">
                  Você deve ter pelo menos 18 anos de idade e capacidade legal para celebrar contratos. 
                  Se você é menor de idade, deve obter consentimento de um responsável legal.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-[#1B2A4A] mb-2">2.2 Criação de Conta</h3>
                <p className="text-sm text-muted-foreground">
                  Você é responsável por manter a confidencialidade de suas credenciais de login e por todas 
                  as atividades realizadas em sua conta. Você concorda em notificar imediatamente a Empresa 
                  sobre qualquer uso não autorizado.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-[#1B2A4A] mb-2">2.3 Informações Precisas</h3>
                <p className="text-sm text-muted-foreground">
                  Você concorda em fornecer informações precisas, atualizadas e completas durante o registro 
                  e manutenção de sua conta.
                </p>
              </div>
            </div>
          </section>

          {/* 3. Uso Aceitável */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              3. Política de Uso Aceitável
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Você concorda em usar a Plataforma apenas para fins legítimos e em conformidade com estes Termos 
              e todas as leis aplicáveis. Você não deve:
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
              <ul className="text-sm text-red-800 space-y-2">
                <li>• Usar a Plataforma para fins ilegais ou fraudulentos</li>
                <li>• Fazer upload de documentos contendo dados de terceiros sem consentimento apropriado</li>
                <li>• Tentar contornar mecanismos de segurança ou autenticação</li>
                <li>• Fazer engenharia reversa, descompilar ou tentar descobrir código-fonte</li>
                <li>• Usar a Plataforma para prejudicar, ameaçar, assediar ou discriminar qualquer pessoa</li>
                <li>• Transmitir malware, vírus ou código prejudicial</li>
                <li>• Realizar ataques de negação de serviço (DDoS) ou similares</li>
                <li>• Coletar ou rastrear dados pessoais de outros usuários</li>
                <li>• Violar direitos de propriedade intelectual</li>
                <li>• Usar a Plataforma para fins comerciais sem autorização</li>
              </ul>
            </div>
          </section>

          {/* 4. Propriedade Intelectual */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              4. Direitos de Propriedade Intelectual
            </h2>
            
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm text-[#1B2A4A] mb-2">4.1 Propriedade da Empresa</h3>
                <p className="text-sm text-muted-foreground">
                  A Plataforma, incluindo seu design, funcionalidades, conteúdo, algoritmos e código-fonte, 
                  é propriedade exclusiva da Empresa ou de seus licenciadores. Todos os direitos autorais, 
                  marcas registradas e outros direitos de propriedade intelectual são reservados.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-[#1B2A4A] mb-2">4.2 Licença Limitada</h3>
                <p className="text-sm text-muted-foreground">
                  Você recebe uma licença limitada, não exclusiva e revogável para usar a Plataforma 
                  pessoalmente. Você não pode copiar, modificar, distribuir ou explorar comercialmente 
                  qualquer parte da Plataforma.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-[#1B2A4A] mb-2">4.3 Seu Conteúdo</h3>
                <p className="text-sm text-muted-foreground">
                  Você retém propriedade dos documentos que faz upload. Ao fazer upload, você concede à 
                  Empresa uma licença para processar, analisar e armazenar esses documentos conforme necessário 
                  para fornecer o Serviço.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Limitação de Responsabilidade */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              5. Limitação de Responsabilidade
            </h2>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-amber-900">ISENÇÃO DE GARANTIAS</h3>
              <p className="text-sm text-amber-900 leading-relaxed">
                A PLATAFORMA É FORNECIDA "COMO ESTÁ" SEM GARANTIAS DE QUALQUER TIPO, EXPRESSAS OU IMPLÍCITAS. 
                A EMPRESA NÃO GARANTE QUE A PLATAFORMA SEJA PRECISA, CONFIÁVEL, ININTERRUPTA OU LIVRE DE ERROS.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3 mt-3">
              <h3 className="font-semibold text-red-900">LIMITAÇÃO DE INDENIZAÇÃO</h3>
              <p className="text-sm text-red-900 leading-relaxed">
                NA MÁXIMA EXTENSÃO PERMITIDA PELA LEI, A EMPRESA NÃO SERÁ RESPONSÁVEL POR QUAISQUER DANOS 
                INDIRETOS, INCIDENTAIS, ESPECIAIS, CONSEQUENTES OU PUNITIVOS, INCLUINDO PERDA DE LUCROS, DADOS 
                OU OPORTUNIDADES, MESMO QUE TENHA SIDO AVISADA DA POSSIBILIDADE DE TAIS DANOS.
              </p>
            </div>
          </section>

          {/* 6. Indenização */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              6. Indenização
            </h2>
            <p className="text-sm text-muted-foreground">
              Você concorda em indenizar, defender e manter a Empresa isenta de qualquer reclamação, dano, 
              perda ou despesa (incluindo honorários advocatícios) resultantes de: (a) sua violação destes 
              Termos; (b) seu uso da Plataforma; (c) documentos que você faz upload; ou (d) violação de 
              direitos de terceiros.
            </p>
          </section>

          {/* 7. Rescisão */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              7. Rescisão de Conta
            </h2>
            
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm text-[#1B2A4A] mb-2">7.1 Rescisão pelo Usuário</h3>
                <p className="text-sm text-muted-foreground">
                  Você pode encerrar sua conta a qualquer momento através das configurações da Plataforma.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-[#1B2A4A] mb-2">7.2 Rescisão pela Empresa</h3>
                <p className="text-sm text-muted-foreground">
                  A Empresa pode suspender ou encerrar sua conta imediatamente se você violar estes Termos, 
                  cometer fraude ou usar a Plataforma para fins ilegais.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-[#1B2A4A] mb-2">7.3 Efeitos da Rescisão</h3>
                <p className="text-sm text-muted-foreground">
                  Após rescisão, você perderá acesso à Plataforma. Seus dados serão tratados conforme a 
                  Política de Privacidade.
                </p>
              </div>
            </div>
          </section>

          {/* 8. Modificações dos Termos */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              8. Modificações dos Termos
            </h2>
            <p className="text-sm text-muted-foreground">
              A Empresa pode modificar estes Termos a qualquer momento. Notificaremos você sobre mudanças 
              significativas via email ou através de aviso na Plataforma. Seu uso contínuo da Plataforma 
              após atualizações constitui aceitação dos novos Termos.
            </p>
          </section>

          {/* 9. Modificações do Serviço */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              9. Modificações do Serviço
            </h2>
            <p className="text-sm text-muted-foreground">
              A Empresa se reserva o direito de modificar, suspender ou descontinuar a Plataforma ou qualquer 
              parte dela a qualquer momento, com ou sem aviso prévio. Não seremos responsáveis por qualquer 
              perda resultante de tais modificações.
            </p>
          </section>

          {/* 10. Conformidade Legal */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              10. Conformidade Legal
            </h2>
            <p className="text-sm text-muted-foreground">
              Você é responsável por garantir que seu uso da Plataforma esteja em conformidade com todas as 
              leis aplicáveis, incluindo regulamentações de aviação, proteção de dados e leis trabalhistas. 
              A Empresa não fornece aconselhamento jurídico e não é responsável por sua conformidade com a lei.
            </p>
          </section>

          {/* 11. Links Externos */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              11. Links Externos
            </h2>
            <p className="text-sm text-muted-foreground">
              A Plataforma pode conter links para websites de terceiros. A Empresa não é responsável pelo 
              conteúdo, precisão ou práticas de privacidade desses sites. Seu acesso a sites externos é 
              por sua conta e risco.
            </p>
          </section>

          {/* 12. Aviso Legal */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              12. Aviso Legal
            </h2>
            <p className="text-sm text-muted-foreground">
              Consulte nosso <a href="/disclaimer" className="text-blue-600 hover:underline">Aviso Legal</a> para 
              informações sobre limitações de responsabilidade, isenções de garantias e outras disposições legais importantes.
            </p>
          </section>

          {/* 13. Lei Aplicável e Jurisdição */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              13. Lei Aplicável e Jurisdição
            </h2>
            <p className="text-sm text-muted-foreground">
              Estes Termos são regidos pelas leis do Brasil. Qualquer disputa será resolvida nos tribunais 
              competentes de São Paulo, Brasil. Você concorda em submeter-se à jurisdição exclusiva desses tribunais.
            </p>
          </section>

          {/* 14. Resolução de Disputas */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              14. Resolução de Disputas
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Antes de iniciar ação legal, você concorda em tentar resolver qualquer disputa através de:
            </p>
            <ol className="text-sm text-muted-foreground space-y-2 ml-4">
              <li>1. Notificação escrita detalhando a disputa (legal@crewcheck.com.br)</li>
              <li>2. Negociação de boa fé por 30 dias</li>
              <li>3. Mediação, se a negociação não resolver</li>
            </ol>
          </section>

          {/* 15. Disposições Gerais */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              15. Disposições Gerais
            </h2>
            
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm text-[#1B2A4A] mb-2">15.1 Acordo Integral</h3>
                <p className="text-sm text-muted-foreground">
                  Estes Termos, juntamente com a Política de Privacidade e Aviso Legal, constituem o acordo 
                  integral entre você e a Empresa.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-[#1B2A4A] mb-2">15.2 Severabilidade</h3>
                <p className="text-sm text-muted-foreground">
                  Se qualquer disposição destes Termos for considerada inválida, as demais disposições 
                  permanecerão em vigor.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-[#1B2A4A] mb-2">15.3 Renúncia</h3>
                <p className="text-sm text-muted-foreground">
                  A falha da Empresa em exercer qualquer direito não constitui renúncia a esse direito.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-[#1B2A4A] mb-2">15.4 Cessão</h3>
                <p className="text-sm text-muted-foreground">
                  Você não pode ceder estes Termos sem consentimento escrito da Empresa. A Empresa pode 
                  ceder seus direitos a qualquer momento.
                </p>
              </div>
            </div>
          </section>

          {/* 16. Contato */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              16. Contato
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Para questões sobre estes Termos:
            </p>
            <div className="bg-slate-100 rounded-lg p-4 text-sm space-y-1">
              <p><strong>Email:</strong> legal@crewcheck.com.br</p>
              <p><strong>Endereço:</strong> São Paulo, SP, Brasil</p>
            </div>
          </section>

          {/* Footer */}
          <Card className="p-4 bg-slate-100 border-0">
            <p className="text-xs text-muted-foreground">
              Ao usar o CrewCheck, você reconhece ter lido, compreendido e concordado com todos os Termos de Serviço. 
              Última atualização: 14 de maio de 2026.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
