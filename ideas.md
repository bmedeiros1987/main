# CrewCheck - Ideias de Design

## Contexto
Site para tripulantes de aviação fazerem upload de suas escalas (PDF) e receberem análise automática de conformidade com RBAC 117, Lei do Aeronauta e CLT. Público-alvo: pilotos e comissários brasileiros.

---

<response>
<text>
## Ideia 1: "Cockpit Instrument Panel" — Aerospace Brutalism

**Design Movement:** Aerospace Brutalism com influências de painéis de instrumentos de aeronaves e interfaces de sistemas de controle de tráfego aéreo.

**Core Principles:**
- Funcionalidade extrema: cada pixel serve um propósito informacional
- Contraste dramático: fundo escuro com dados luminosos (como instrumentos de cockpit à noite)
- Densidade informacional controlada: muita informação, mas hierarquicamente organizada
- Estética técnica: números monospace, grids rígidos, bordas afiadas

**Color Philosophy:** Fundo quase-preto (como um painel de instrumentos desligado) com dados em verde-aviação (#00FF41), alertas em âmbar (#FFB000), e erros em vermelho (#FF3333). O verde remete aos displays PFD/ND dos A320. Acentos em azul-céu (#4FC3F7) para elementos interativos.

**Layout Paradigm:** Grid rígido inspirado em painéis ECAM do A320. Informações dispostas em "instrumentos" — cards com bordas finas que lembram displays digitais. Sidebar fixa à esquerda com navegação vertical tipo checklist.

**Signature Elements:**
- Indicadores circulares tipo gauge para métricas (horas de voo, jornada)
- Linhas de scan horizontais animadas nos headers
- Tipografia monospace para dados numéricos

**Interaction Philosophy:** Feedback imediato e preciso. Hover revela dados adicionais como tooltips técnicos. Transições rápidas e mecânicas (sem bounce, sem elastic).

**Animation:** Transições de 120-180ms com ease-out linear. Dados numéricos fazem "count-up" ao aparecer. Cards entram com fade + translate-y mínimo (4px). Gauges preenchem com animação de 600ms ease-out.

**Typography System:** JetBrains Mono para dados/números, Space Grotesk para headings, Inter para corpo de texto. Hierarquia baseada em peso e cor, não em tamanho excessivo.
</text>
<probability>0.06</probability>
</response>

---

<response>
<text>
## Ideia 2: "Sky Atlas" — Cartographic Modernism

**Design Movement:** Cartographic Modernism — inspirado em cartas aeronáuticas (VFR/IFR charts), mapas de rota e documentos de navegação aérea.

**Core Principles:**
- Clareza cartográfica: informação organizada como uma carta de navegação
- Warmth profissional: tons quentes de papel/pergaminho com acentos de tinta
- Storytelling visual: a escala é contada como uma "rota" no tempo
- Credibilidade institucional: remete a documentos oficiais da aviação

**Color Philosophy:** Base em off-white quente (#FDF8F0) como papel de carta aeronáutica. Texto em azul-marinho profundo (#1B2A4A). Rotas e conexões em magenta aeronáutico (#C2185B) — cor usada em cartas IFR. Alertas em vermelho-proibido (#D32F2F). Elementos seguros em verde-autorizado (#2E7D32).

**Layout Paradigm:** Layout assimétrico com coluna principal larga (70%) e painel lateral de "legenda" (30%). A timeline da escala é apresentada como uma rota horizontal com waypoints. Seções separadas por linhas finas com rosa-dos-ventos decorativa.

**Signature Elements:**
- Timeline horizontal estilizada como rota aérea com waypoints
- Ícones de simbologia aeronáutica (triângulos para alertas, círculos para waypoints)
- Bordas com padrão de coordenadas/grid sutil no background

**Interaction Philosophy:** Exploratória como navegar um mapa. Hover em um dia revela detalhes como um "zoom" na carta. Scroll horizontal na timeline. Elementos clicáveis têm affordance clara com underline ou ícone de expansão.

**Animation:** Suave e orgânica. Elementos aparecem com fade de 200-300ms. Timeline se desenha progressivamente (stroke-dashoffset). Cards expandem com spring suave. Waypoints pulsam sutilmente quando há alerta.

**Typography System:** Libre Baskerville para headings (remete a documentos oficiais), Source Sans 3 para corpo, Fira Code para dados numéricos. Tamanhos generosos com muito espaço entre linhas.
</text>
<probability>0.04</probability>
</response>

---

<response>
<text>
## Ideia 3: "Clear Skies" — Scandinavian Aviation

**Design Movement:** Scandinavian Minimalism aplicado ao universo da aviação — clean, funcional, com toques de cor estratégicos e muito ar.

**Core Principles:**
- Respiração visual: espaço generoso entre elementos, nada apertado
- Hierarquia por contraste: poucos elementos, mas cada um com propósito claro
- Confiança silenciosa: design que transmite competência sem gritar
- Acessibilidade nativa: contraste alto, fontes legíveis, estados claros

**Color Philosophy:** Fundo branco-neve (#FAFBFC) com cards em branco puro. Texto em slate escuro (#1E293B). Cor primária: azul-céu profundo (#0369A1) — evoca céu limpo e confiança. Alertas em coral quente (#EA580C). Sucesso em teal (#0D9488). Superfícies elevadas com sombras suaves e difusas.

**Layout Paradigm:** Single-column centrada com max-width generoso (900px). Cards empilhados verticalmente com espaçamento de 24-32px. Header fixo minimalista. Sem sidebar — navegação por scroll com seções bem definidas. Upload centralizado como hero.

**Signature Elements:**
- Cards com border-radius generoso (16px) e sombras difusas multicamada
- Ícones de linha fina (Lucide) com animação de entrada
- Badges coloridos com semântica clara (verde/amarelo/vermelho)

**Interaction Philosophy:** Calma e previsível. Hover eleva cards sutilmente (translateY -2px + shadow increase). Cliques confirmados com micro-animação. Estados de loading com skeleton screens elegantes.

**Animation:** Deliberada e calma. Entrance animations de 250ms com ease-out suave. Cards entram com stagger de 50ms. Progress bars preenchem linearmente. Hover transitions de 200ms. Nada pisca, nada bounce.

**Typography System:** DM Sans para headings (geométrica, moderna), Inter para corpo (legibilidade), JetBrains Mono para dados. Headings em 600-700 weight, corpo em 400-500.
</text>
<probability>0.08</probability>
</response>

---

## Decisão: Ideia 2 — "Sky Atlas" (Cartographic Modernism)

Escolho a abordagem cartográfica por ser a mais única e memorável para o público-alvo (tripulantes). A referência a cartas aeronáuticas cria identificação imediata, e o layout assimétrico com timeline de rota torna a experiência de visualização da escala muito mais intuitiva e envolvente do que uma simples tabela.
