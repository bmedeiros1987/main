# CrewCheck - Análise de Conformidade de Escala de Tripulantes ✈️

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-brightgreen.svg)]()
[![LGPD Compliant](https://img.shields.io/badge/LGPD-compliant-green.svg)]()

CrewCheck é uma ferramenta de análise de conformidade para tripulantes de aviação comercial. Analisa escalas de voo contra a legislação brasileira (RBAC 117, Lei 13.475/2017) e fornece recomendações personalizadas.

## 🎯 Características Principais

### Análise de Conformidade
- **Análise de Escalas**: Processa PDFs do CrewRosterReport
- **Conformidade RBAC 117**: Verifica limites de horas de voo, descanso mínimo, duty periods
- **Alertas Personalizados**: Identifica violações e avisos de conformidade
- **Recomendações**: Sugestões de academias e treinamentos baseadas no perfil

### Histórico e Estatísticas
- **Histórico Local**: Armazena até 12 meses de análises (localStorage)
- **Estatísticas por Companhia**: Agregação anônima de dados por companhia aérea
- **Tendências**: Gráficos de evolução mensal de conformidade
- **Compartilhamento**: Botões para WhatsApp/Telegram

### Privacidade e Conformidade
- **LGPD Compliant**: Política de Privacidade, Termos de Serviço, Disclaimer
- **Dados Anônimos**: Coleta opcional de estatísticas sem identificação pessoal
- **Consentimento Explícito**: Dialog de opt-in para cada análise
- **Sem Rastreamento**: Nenhum dado pessoal é armazenado no servidor

### App Mobile
- **Offline First**: Funciona 100% offline no Android
- **SQLite Local**: Banco de dados persistente no dispositivo
- **Google Calendar**: Exporta escalas para o Google Calendar (formato iCal)
- **PIX Donations**: Sistema de doações voluntárias

## 🚀 Quick Start

### Versão Web

```bash
# Clone o repositório
git clone https://github.com/bmedeiros1987/crewcheck2.git
cd crewcheck2

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev

# Acesse em http://localhost:5173
```

### Versão Mobile (APK)

Baixe o APK diretamente do site: https://crewcheck.com.br/download

Ou compile localmente:

```bash
cd crewcheck-mobile
npm install --legacy-peer-deps
npm start
```

Escaneie o QR code com Expo Go para testar.

## 📋 Requisitos

### Web
- Node.js 18+
- npm ou pnpm
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Mobile
- Android 8.0+
- 45 MB de espaço livre
- Permissão para acessar arquivos e calendário

### Backend (Opcional)
- MySQL 8.0+ ou TiDB
- Node.js 18+

## 🏗️ Arquitetura

```
crewcheck2/
├── client/                 # Frontend React 19 + Tailwind 4
│   ├── src/
│   │   ├── pages/         # Páginas (Home, Results, Statistics, Download, etc)
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Utilitários (PDF parser, sharing, etc)
│   │   ├── hooks/         # Custom hooks (localStorage, etc)
│   │   └── App.tsx        # Roteamento
│   └── public/            # Assets estáticos
├── server/                 # Backend Express + tRPC
│   ├── routers.ts         # Procedimentos tRPC
│   ├── db.ts              # Query helpers
│   └── _core/             # Middleware, autenticação, etc
├── drizzle/               # Schema do banco de dados
│   └── schema.ts          # Tabelas (users, anonymous_statistics, etc)
└── crewcheck-mobile/      # App React Native/Expo
    ├── src/
    │   ├── screens/       # Telas (Home, History, Settings)
    │   ├── lib/           # Utilitários (PDF parser, calendar export, etc)
    │   └── db/            # SQLite database
    └── BUILD_APK.md       # Instruções de build
```

## 🔧 Desenvolvimento

### Adicionar Novas Funcionalidades

1. **Atualizar Schema** (se necessário):
```bash
# Edite drizzle/schema.ts
pnpm db:push
```

2. **Criar Procedimento tRPC**:
```typescript
// server/routers.ts
export const appRouter = router({
  myFeature: publicProcedure
    .input(z.object({ /* ... */ }))
    .query(async ({ input }) => {
      // Implementação
    }),
});
```

3. **Consumir no Frontend**:
```typescript
// client/src/pages/MyPage.tsx
const { data } = trpc.myFeature.useQuery({ /* ... */ });
```

4. **Escrever Testes**:
```typescript
// server/routers.test.ts ou client/src/lib/myLib.test.ts
describe('myFeature', () => {
  it('should work', () => {
    // Teste
  });
});
```

5. **Executar Testes**:
```bash
pnpm test
```

### Variáveis de Ambiente

```env
# .env.local (não commitar)
DATABASE_URL=mysql://user:password@localhost:3306/crewcheck
JWT_SECRET=seu-secret-aqui
VITE_APP_ID=seu-app-id
```

## 📱 Funcionalidades Detalhadas

### Análise de Conformidade
- Verifica horas de voo acumuladas
- Valida períodos de descanso mínimo
- Identifica duty periods excessivos
- Alerta sobre violações de regras

### Histórico Local
- Armazena análises em localStorage
- Agrupa por mês
- Permite comparação entre períodos
- Exporta dados em JSON

### Estatísticas Globais
- Agregação anônima por companhia
- Cálculo de médias, medianas, percentis
- Filtro por função (Piloto, Comissário, etc)
- Atualização em tempo real

### Compartilhamento
- WhatsApp: Resumo da análise
- Telegram: Link com detalhes
- Clipboard: Copiar dados

### Doações PIX
- Chave PIX: 61996071663
- Voluntário e discreto
- Sem rastreamento de doadores
- Suporta desenvolvimento

## 🔒 Segurança e Privacidade

### Conformidade LGPD
- Política de Privacidade detalhada
- Termos de Serviço claros
- Disclaimer com limitações
- Consentimento explícito para dados

### Proteção de Dados
- Nenhum dado pessoal no servidor
- Estatísticas totalmente anônimas
- Criptografia em trânsito (HTTPS)
- Sem cookies de rastreamento

### Direitos do Titular
- Acesso aos dados
- Retificação
- Exclusão
- Portabilidade

## 📊 Estatísticas e Métricas

### Dados Coletados (Anônimos)
- Função (Piloto, Comissário, etc)
- Companhia aérea
- Horas de voo
- Compliance score
- Base operacional

### Métricas Disponíveis
- Média de horas de voo por função
- Percentil 95 de duty periods
- Taxa de conformidade por companhia
- Tendências mensais

## 🐛 Troubleshooting

### "Cannot find module expo-sqlite"
```bash
npm install --legacy-peer-deps
```

### "Build failed"
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### "Database connection error"
- Verifique DATABASE_URL
- Certifique-se que o MySQL está rodando
- Execute `pnpm db:push`

## 📚 Documentação

- [LGPD Compliance](./client/src/pages/Privacy.tsx)
- [Terms of Service](./client/src/pages/Terms.tsx)
- [Legal Disclaimer](./client/src/pages/Disclaimer.tsx)
- [Build APK](./crewcheck-mobile/BUILD_APK.md)

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👤 Autor

**CrewCheck**
- Website: https://crewcheck.com.br
- GitHub: [@bmedeiros1987](https://github.com/bmedeiros1987)
- Email: support@crewcheck.com.br

## 🙏 Agradecimentos

- RBAC 117 - Regulamentação de Tripulações
- Lei 13.475/2017 - Legislação Aeronáutica Brasileira
- LGPD - Lei Geral de Proteção de Dados
- Comunidade de Aviação Comercial

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato:
- Email: support@crewcheck.com.br
- WhatsApp: [Link PIX]
- Website: https://crewcheck.com.br

## 🗺️ Roadmap

- [ ] Integração com sistemas de RH
- [ ] Alertas automáticos via email
- [ ] Dashboard de analytics para companhias
- [ ] API pública para integrações
- [ ] Suporte para legislação de outros países
- [ ] Versão iOS do app mobile

---

**Desenvolvido com ❤️ para a aviação comercial brasileira**

**Versão**: 1.0.0  
**Última atualização**: 15 de maio de 2026  
**Status**: ✅ Produção
