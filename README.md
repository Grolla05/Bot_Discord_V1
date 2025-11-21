# Bot_Discord_V1

Bot de Discord focado em suporte ao estudo para vestibulares: gera mensagens motivacionais e macetes (dicas estratégicas) usando IA (Gemini) via comandos de barra (/). Documentação completa abaixo.

## ✨ Principais Funcionalidades

- Mensagens motivacionais curtas e personalizadas via IA com botão para gerar nova.
- Comandos de macetes com IA, incluindo autocomplete de matéria.
- Envio por DM com fallback para resposta no canal quando DMs estão bloqueadas.
- Registro automático de comandos slash ao iniciar.
- Presença dinâmica indicando quantidade de servidores.
- Tratamento robusto de erros e respostas efêmeras para feedback limpo.

## 🗂 Arquitetura de Pastas

```text
bot.js                  # Entry point / inicialização do cliente e roteamento de interações
src/
	config.js             # Carrega variáveis de ambiente (.env)
	Styles/
		slash-deploy.js     # Registro dos comandos slash
	events/
		motivation_Handler.js  # Lógica de geração e envio de mensagens motivacionais
		Macete_Handler.js      # Lógica de geração de macetes e autocomplete
```

## 🧪 Fluxo Geral de Inicialização

1. `config.js` carrega variáveis do `.env`.
2. `bot.js` valida `DISCORD_TOKEN`.
3. Cria `Client` com intents necessárias.
4. Ao evento `ready` registra slash commands (guild) e ajusta presença.
5. Interações são roteadas por tipo: ChatInput, Button, Autocomplete.

## 🔐 Variáveis de Ambiente (.env)

Exemplo mínimo:

```env
DISCORD_TOKEN=token_do_discord_aqui
BOT_ID=bot_id_aqui
SERVER_ID=server_id_aqui
MOTIVATION_CHANNEL_ID=id_do_canal_de_motivação_aqui
MACETE_CHANNEL_ID=id_do_canal_de_macete_aqui
API_GEMINI_KEY=chave_api_gemini
PREFIX=!                                                (prefixo para chamada do bot através do chat do servidor no qual o bot está)
```

Notas:

- `SERVER_ID` controla onde os comandos são registrados (guild). Para múltiplos servidores, migrar para global.
- Chave Gemini deve ter permissão para modelo `gemini-2.0-flash`.

## 💬 Comandos Slash Registrados

Motivação: `motivar`, `motivacao`, `motivate`, `motivation`

Macetes: `macete`, `tip`, `dica`

### Estrutura dos Comandos de Macete

Opções:

- `materia` (string, obrigatório, autocomplete)
- `conteudo_especifico` (string, opcional)

## 🤖 Handlers

### `motivation_Handler.js`

1. Verifica canal permitido (`MOTIVATION_CHANNEL_ID`).
2. Defer reply e gera texto via Gemini.
3. Tenta enviar DM ao usuário com embed + botão `Nova Mensagem`.
4. Fallback: envia no canal se DM falhar.
5. Resposta original é editada para confirmação e agendada para deletar após 2 min.
6. Botão `new_motivation` gera nova DM usando mesma função helper.

### `Macete_Handler.js`

1. Verifica canal correto (`MACETE_CHANNEL_ID`).
2. `deferReply({ ephemeral: true })` para resposta visível só ao autor.
3. Monta prompt especializado com objetivos e formatação.
4. Gera macete via Gemini e constrói embed temático (cor, emoji por matéria).
5. Tenta DM; fallback: edita resposta ephemeral com embed se DM bloqueada.
6. Autocomplete retorna lista filtrada de matérias (máx 25).

## 🧠 Integração com Gemini

Biblioteca: `@google/generative-ai`.
Modelo: `gemini-2.0-flash`.
Uso: `model.generateContent(prompt)` retornando `response.text()`.
Boas práticas implementadas:

- Prompts claros e delimitados.
- Conteúdo curto e objetivo.
- Mensagens motivacionais limitadas a 3 frases (pelo prompt).

## 🛡 Intents e Permissões

Intents habilitadas: Guilds, GuildMessages, GuildMembers, GuildMessageReactions, MessageContent.
Necessário: habilitar Message Content na página de configuração do bot (Developer Portal) para leitura de conteúdo futuro.

## 🚀 Como Executar

Pré-requisitos: Node.js >= 18, chave do Discord, chave Gemini.

Passos:

1. Instalar dependências:

```powershell
npm install --legacy-peer-deps
```

1. Criar `.env` conforme exemplo.

1. Rodar:

```powershell
node bot.js
```

1. Verificar no console: mensagem de comandos registrados.

## 🧪 Testes Manuais Rápidos

1. Slash `/motivar` no canal correto → recebe confirmação + DM.
1. Botão `Nova Mensagem` na DM → nova mensagem chega.
1. Slash `/macete materia: Matemática conteudo_especifico: Bhaskara` → DM ou fallback ephemeral.
1. Autocomplete: digitar `/macete` e começar a escrever "Ma" → sugestão "Matemática".

## 🔄 Atualização de Comandos

Altere `slash-deploy.js` e reinicie o bot. Como está usando `applicationGuildCommands`, propagação é imediata (~segundos). Global exigiria `Routes.applicationCommands(botID)` (propagação até 1h).

## ⚠️ Tratamento de Erros

- Try/catch em cada interação com mensagem efêmera genérica.
- Handlers de processo: `unhandledRejection`, `uncaughtException`.
- Logs claros com prefixo `[Slash]`, `[Login]`, etc.

## 🧩 Possíveis Melhorias Futuras

- Registro global opcional dos comandos.
- Cache / comparação de hash antes de registrar para evitar PUT redundante.
- Timeout interno para geração de IA (> 8s) com fallback.
- Sistema de cooldown por usuário para evitar spam de IA.
- Testes automatizados usando mocks do Discord e da API Gemini.
- Internacionalização (i18n) para PT/EN.

## 🛠 Troubleshooting

| Sintoma | Causa Provável | Ação |
|--------|----------------|------|
| Comandos não aparecem | `SERVER_ID` errado | Conferir ID real da guild |
| Falha ao registrar | `BOT_ID` ou permissões | Verificar app ID / scopes (bot + applications.commands) |
| DM não enviada | DMs desativadas | Fallback aparece no canal (ephemeral) |
| IA retorna erro 403/429 | Chave inválida ou rate limit | Regenerar chave / implementar retry |
| Autocomplete vazio | `API_GEMINI_KEY` ausente? (não afeta aqui) | Ver apenas lógica de filtro |

---
Documentação gerada automaticamente. Ajuste conforme evolução do projeto.
