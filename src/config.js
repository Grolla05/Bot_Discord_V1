const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

function getEnv(name, fallback = undefined) {
  const v = process.env[name];
  return v !== undefined && v !== '' ? v : fallback;
}

function getEnvArray(name, fallback = []) {
  const v = process.env[name];
  return v !== undefined && v !== '' ? v.replace(/\s/g, '').split(',') : fallback;
}

module.exports = {
    // Discord Bot
    prefix: getEnv('PREFIX', '!'),
    token: getEnv('DISCORD_TOKEN'),
    BOT_ID: getEnv('BOT_ID'),
    SERVER_ID: getEnv('SERVER_ID'),

    // Canais
    motivationChannelId: getEnv('MOTIVATION_CHANNEL_ID'),
    maceteChannelId: getEnv('MACETE_CHANNEL_ID'),
};