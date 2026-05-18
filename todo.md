
- [x] Histórico local de análises (localStorage) com gráficos de tendência mês a mês
- [x] Botão de compartilhamento via WhatsApp/Telegram
- [x] Schema de banco de dados para estatísticas anônimas agregadas por função
- [x] API backend para receber e armazenar métricas anônimas (sem dados pessoais)
- [x] Página de estatísticas gerais por função (médias, medianas, percentis)
- [x] Opt-in para contribuir dados anônimos ao enviar escala

## Conformidade Legal e LGPD

- [x] Página de Disclaimer com avisos legais e limitações de responsabilidade
- [x] Política de Privacidade em conformidade com LGPD
- [x] Termos de Serviço
- [x] Banner de consentimento para processamento de dados
- [x] Links de legal pages no footer e navegação

## Estatísticas por Companhia Aérea

- [x] Adicionar campo airline ao schema anonymous_statistics
- [x] Criar procedimento admin para zerar estatísticas
- [x] Modificar fluxo de submissão para capturar companhia aérea
- [x] Atualizar página de estatísticas com filtro por companhia
- [x] Adicionar seleção de companhia no fluxo de consentimento
- [x] Executar migração do banco de dados (pnpm db:push) - Será feito automaticamente ao publicar

## Monetização - Sistema de Doações PIX

- [x] Criar componente de doação com QR code PIX (mobile app)
- [x] Adicionar botão de doação na página inicial (web)
- [x] Criar modal/página de doações (mobile app - SettingsScreen)
- [x] Remover branding "Made with Manus"
- [x] Adicionar mensagem de agradecimento após doação
- [x] Rastrear doações (localStorage)

## App Mobile (APK)

- [x] Estrutura React Native/Expo completa
- [x] Banco de dados SQLite local
- [x] Parser de PDF offline
- [x] Exportação para Google Calendar (iCal)
- [x] Sistema de doações PIX
- [x] Build e distribuição do APK (estrutura pronta, veja BUILD_APK.md)


## Download do APK

- [x] Criar página de download do APK
- [x] Gerar QR code para download mobile
- [x] Adicionar link na navegação principal
- [x] Implementar contador de downloads


## Correções Finais - Versão Web

- [x] Considerar TODOS os pernoites para recomendação de academia
- [x] Considerar dias em branco como inativo (OFF)
- [x] Exportar escala com número de voo + código IATA (ex: G3 1234 POA-FLN)
- [x] Voos de extra em cinza no Google Calendar
- [x] Exportar tempo de academia como evento separado
