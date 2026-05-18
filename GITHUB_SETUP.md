# CrewCheck - Setup para GitHub

## 📋 Pré-requisitos

- Node.js 22.x ou superior
- npm ou pnpm
- Git

## 🚀 Instalação Rápida

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/crew-roster-analyzer.git
cd crew-roster-analyzer
```

2. **Instale as dependências**
```bash
pnpm install
# ou
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas configurações:
```
DATABASE_URL=seu_banco_de_dados
JWT_SECRET=sua_chave_secreta
VITE_APP_ID=seu_app_id
# ... outras variáveis
```

4. **Execute as migrações do banco de dados**
```bash
pnpm db:push
```

5. **Inicie o servidor de desenvolvimento**
```bash
pnpm dev
```

A aplicação estará disponível em `http://localhost:3000`

## 📦 Estrutura do Projeto

```
crew-roster-analyzer/
├── client/              # Frontend React + Vite
│   ├── src/
│   │   ├── pages/      # Páginas principais
│   │   ├── components/ # Componentes reutilizáveis
│   │   ├── hooks/      # Custom hooks
│   │   └── lib/        # Utilitários
│   └── public/         # Assets estáticos
├── server/             # Backend Express + tRPC
│   ├── routers.ts      # Procedimentos tRPC
│   ├── db.ts           # Query helpers
│   └── _core/          # Framework core
├── drizzle/            # Migrations e schema
└── shared/             # Código compartilhado
```

## 🧪 Testes

```bash
# Executar todos os testes
pnpm test

# Modo watch
pnpm test:watch

# Cobertura
pnpm test:coverage
```

## 🔨 Build para Produção

```bash
pnpm build
pnpm preview
```

## 📝 Scripts Disponíveis

- `pnpm dev` - Inicia servidor de desenvolvimento
- `pnpm build` - Build para produção
- `pnpm preview` - Preview do build
- `pnpm test` - Executa testes
- `pnpm db:push` - Aplica migrações do banco
- `pnpm db:studio` - Abre Drizzle Studio

## 🎯 Funcionalidades Principais

- ✅ Upload e análise de escalas em PDF
- ✅ Verificação de conformidade com RBAC 117
- ✅ Análise de horas de voo e trabalho
- ✅ Recomendações de academia
- ✅ Exportação em PDF e iCal
- ✅ Compartilhamento via WhatsApp/Telegram
- ✅ Histórico de análises local
- ✅ Estatísticas anônimas

## 🔐 Segurança

- Processamento 100% local (sem envio de dados)
- Dados não são salvos no servidor
- Conformidade com LGPD
- Consentimento do usuário para estatísticas

## 📄 Licença

MIT

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no GitHub.
