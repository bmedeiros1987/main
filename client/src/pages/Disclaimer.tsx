import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Disclaimer() {
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
            Aviso Legal e Disclaimer
          </h1>
          <p className="text-muted-foreground">
            Última atualização: 14 de maio de 2026
          </p>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card className="p-6 border-l-4 border-l-blue-500">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Este documento estabelece os termos e condições legais para o uso da plataforma CrewCheck. 
              Ao acessar e utilizar este serviço, você concorda com todos os termos, condições e avisos 
              descritos neste documento. Caso não concorde com qualquer parte, por favor, não utilize a plataforma.
            </p>
          </Card>

          {/* 1. Natureza do Serviço */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              1. Natureza do Serviço
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              O CrewCheck é uma ferramenta de análise de conformidade de escalas de tripulantes baseada em 
              regulamentações aeronáuticas brasileiras. A plataforma processa documentos PDF (CrewRosterReport) 
              e fornece análises sobre conformidade com a legislação brasileira de aviação civil, incluindo 
              regulamentações da ANAC (Agência Nacional de Aviação Civil) e normas operacionais de companhias aéreas.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              O serviço é fornecido "como está" (AS IS) e destina-se exclusivamente para fins informativos e 
              educacionais. Não constitui aconselhamento jurídico, médico ou profissional de qualquer natureza.
            </p>
          </section>

          {/* 2. Limitações de Responsabilidade */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              2. Limitações de Responsabilidade
            </h2>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-red-900">Isenção de Garantias</h3>
              <p className="text-sm text-red-800 leading-relaxed">
                O CrewCheck não garante que as análises fornecidas sejam precisas, completas ou livres de erros. 
                A plataforma não assume responsabilidade por:
              </p>
              <ul className="text-sm text-red-800 space-y-2 ml-4">
                <li>• Erros ou omissões nas análises geradas</li>
                <li>• Interpretações incorretas de regulamentações</li>
                <li>• Mudanças em legislação não refletidas na plataforma</li>
                <li>• Falhas técnicas, indisponibilidade ou interrupções do serviço</li>
                <li>• Perda de dados ou documentos enviados</li>
                <li>• Danos diretos ou indiretos resultantes do uso da plataforma</li>
              </ul>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              Os usuários utilizam a plataforma por sua conta e risco. Recomenda-se sempre validar as análises 
              com profissionais qualificados (especialistas em legislação aeronáutica, consultores de RH, etc.) 
              antes de tomar qualquer decisão baseada nos resultados fornecidos pelo CrewCheck.
            </p>
          </section>

          {/* 3. Conformidade Regulatória */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              3. Conformidade Regulatória
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              As análises do CrewCheck são baseadas em regulamentações vigentes no Brasil, incluindo:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 ml-4">
              <li>• Regulamento Brasileiro de Aviação Civil (RBAC)</li>
              <li>• Instruções Suplementares (IS) da ANAC</li>
              <li>• Normas Operacionais de companhias aéreas brasileiras</li>
              <li>• Legislação trabalhista aplicável (CLT, convenções coletivas)</li>
            </ul>
            <p className="text-sm leading-relaxed text-muted-foreground mt-3">
              No entanto, a plataforma não substitui a consulta direta aos documentos oficiais da ANAC ou 
              a orientação de especialistas em conformidade aeronáutica. A legislação está sujeita a mudanças, 
              e o CrewCheck pode não refletir as atualizações mais recentes.
            </p>
          </section>

          {/* 4. Uso Autorizado */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              4. Uso Autorizado
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              O CrewCheck pode ser utilizado apenas para fins legítimos e em conformidade com todas as leis 
              aplicáveis. É proibido:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 ml-4">
              <li>• Usar a plataforma para fins ilegais ou fraudulentos</li>
              <li>• Processar dados de terceiros sem consentimento apropriado</li>
              <li>• Tentar contornar mecanismos de segurança da plataforma</li>
              <li>• Fazer engenharia reversa ou copiar código-fonte</li>
              <li>• Usar a plataforma para prejudicar, ameaçar ou assediar qualquer pessoa</li>
              <li>• Violar direitos de propriedade intelectual</li>
            </ul>
          </section>

          {/* 5. Processamento de Dados */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              5. Processamento de Dados Pessoais
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Os documentos PDF enviados podem conter dados pessoais de tripulantes. O CrewCheck processa 
              esses dados exclusivamente para gerar análises de conformidade. Consulte nossa 
              <a href="/privacy" className="text-blue-600 hover:underline ml-1">Política de Privacidade</a> para 
              informações detalhadas sobre como seus dados são tratados em conformidade com a LGPD.
            </p>
          </section>

          {/* 6. Estatísticas Anônimas */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              6. Coleta de Estatísticas Anônimas
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              O CrewCheck coleta estatísticas anônimas (sem identificação pessoal) para melhorar a plataforma 
              e fornecer benchmarks da indústria. Essas estatísticas incluem métricas agregadas por função 
              (Pilot, CCM, FA) e base aérea, mas nunca incluem nomes, IDs pessoais ou dados identificáveis.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A participação é opcional e requer consentimento explícito do usuário. Você pode alterar suas 
              preferências de consentimento a qualquer momento.
            </p>
          </section>

          {/* 7. Limitação de Indenização */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              7. Limitação de Indenização
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900 leading-relaxed">
                Na máxima extensão permitida pela lei, o CrewCheck e seus desenvolvedores não serão responsáveis 
                por quaisquer danos indiretos, incidentais, especiais, consequentes ou punitivos, incluindo perda 
                de lucros, dados ou oportunidades de negócio, mesmo que tenham sido avisados da possibilidade de 
                tais danos.
              </p>
            </div>
          </section>

          {/* 8. Modificações do Serviço */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              8. Modificações do Serviço
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              O CrewCheck se reserva o direito de modificar, suspender ou descontinuar o serviço a qualquer momento, 
              com ou sem aviso prévio. Não seremos responsáveis por qualquer perda resultante de tais modificações 
              ou interrupções.
            </p>
          </section>

          {/* 9. Propriedade Intelectual */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              9. Propriedade Intelectual
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Todo conteúdo, funcionalidades e design da plataforma CrewCheck são protegidos por direitos autorais 
              e outras leis de propriedade intelectual. Você não tem direito de copiar, modificar, distribuir ou 
              explorar comercialmente qualquer parte da plataforma sem permissão expressa.
            </p>
          </section>

          {/* 10. Contato e Suporte */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              10. Contato para Questões Legais
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Para questões sobre este disclaimer ou conformidade legal, entre em contato através de:
            </p>
            <div className="bg-slate-100 rounded-lg p-4 text-sm space-y-1">
              <p><strong>Email:</strong> legal@crewcheck.com.br</p>
              <p><strong>Endereço:</strong> São Paulo, SP, Brasil</p>
            </div>
          </section>

          {/* Footer */}
          <Card className="p-4 bg-slate-100 border-0">
            <p className="text-xs text-muted-foreground">
              Este disclaimer é fornecido apenas para fins informativos e não constitui aconselhamento jurídico. 
              Para questões legais específicas, consulte um advogado qualificado. Ao usar o CrewCheck, você reconhece 
              ter lido, compreendido e concordado com todos os termos deste documento.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
