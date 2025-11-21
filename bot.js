const discord = require('discord.js');
const { Client, GatewayIntentBits, Events, ActivityType } = discord;
const config = require('./src/config.js');
const { slashRegister } = require('./src/Styles/slash-deploy.js');
const { handleMotivationCommand, handleMotivationButton } = require('./src/events/motivation_Handler.js');
const { handleMaceteCommand, handleMaceteAutocomplete } = require('./src/events/Macete_Handler.js');

// Listas de nomes de comandos para fácil manutenção
const MOTIVATION_COMMANDS = ['motivar', 'motivacao', 'motivate', 'motivation'];
const MACETE_COMMANDS = ['macete', 'tip', 'dica'];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
});

// Valida variáveis fundamentais antes de iniciar o login
if (!config.token || typeof config.token !== 'string' || config.token.trim() === '') {
  console.error('[Config] DISCORD_TOKEN ausente ou vazio. Confira o arquivo .env na raiz do projeto.');
  console.error('[Dica] Garanta que o .env está na raiz e que src/config.js o carrega via path ../.env.');
  process.exit(1);
}

// Console logs dos status do bot + registro dos comandos
client.once(Events.ClientReady, async (c) => {
  console.log(`Bot is online as ${c.user.tag}, serving ${client.guilds.cache.size} servers.`);
  updatePresence();
  try {
    await slashRegister();
    console.log('[Slash] Comandos registrados.');
  } catch (err) {
    console.error('[Slash] Falha ao registrar comandos:', err);
  }
});

// Quando entra em um servidor novo
client.on(Events.GuildCreate, (guild) => {
  console.log(`Joined a new guild: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  updatePresence();
});

// Quando é removido de um servidor
client.on(Events.GuildDelete, (guild) => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  updatePresence();
});
    
// Listener para TODAS as Interações (Comandos, Botões, etc.)
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const { commandName } = interaction;
      if (MOTIVATION_COMMANDS.includes(commandName)) {
        await handleMotivationCommand(interaction);
      } else if (MACETE_COMMANDS.includes(commandName)) {
        await handleMaceteCommand(interaction);
      }
    } else if (interaction.isButton()) {
      if (interaction.customId === 'new_motivation') {
        await handleMotivationButton(interaction);
      }
    } else if (interaction.isAutocomplete()) {
      const { commandName } = interaction;
      if (MACETE_COMMANDS.includes(commandName)) {
        await handleMaceteAutocomplete(interaction);
      }
    }
  } catch (error) {
    console.error('Erro ao processar interação:', error);
    const replyPayload = { content: 'Ocorreu um erro ao executar esta ação!', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      try { await interaction.followUp(replyPayload); } catch {}
    } else {
      try { await interaction.reply(replyPayload); } catch {}
    }
  }
});

// Helper para presença
function updatePresence() {
  if (!client.user) return;
  client.user.setPresence({
    activities: [{ name: `Serving ${client.guilds.cache.size} servers`, type: ActivityType.Watching }],
    status: 'online'
  });
}

// Tratamento global de erros (opcional)
process.on('unhandledRejection', (reason) => {
  console.error('[Global] UnhandledRejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[Global] UncaughtException:', err);
});

// Login do bot
client.login(config.token).catch(err => {
  console.error('[Login] Falha ao autenticar. Verifique o token.', err);
  process.exit(1);
});
