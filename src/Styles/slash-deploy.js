const { REST, Routes, SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const config = require('../config.js');
const botID = config.BOT_ID;
const serverID = config.SERVER_ID;
const botToken = config.token;

const rest = new REST({ version: '10' }).setToken(botToken);

const slashRegister = async () => {
    try {
        console.log(`Iniciando o registro de comandos de barra (/)...`);
        const commands = [
            new SlashCommandBuilder()
                .setName('motivar')
                .setDescription('Não desista do seu objetivo, inspire-se!'),

            new SlashCommandBuilder()
                .setName('motivacao')
                .setDescription('Não desista do seu objetivo, inspire-se!'),

            new SlashCommandBuilder()
                .setName('motivate')
                .setDescription('Não desista do seu objetivo, inspire-se!'),

            new SlashCommandBuilder()
                .setName('motivation')
                .setDescription('Não desista do seu objetivo, inspire-se!'),

            new SlashCommandBuilder()
                .setName('macete')
                .setDescription('Envia um macete de estudo (geral ou específico).')
                // Matéria (Obrigatória)
                .addStringOption(option =>
                    option.setName('materia')
                        .setDescription('A matéria principal (ex: Matemática, Física)')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                // Conteúdo (Opcional)
                .addStringOption(option =>
                    option.setName('conteudo_especifico')
                        .setDescription('O tópico específico que você quer (ex: Bhaskara, MRUV)')
                        .setRequired(false)
                ),

            new SlashCommandBuilder()
                .setName('tip')
                .setDescription('Envia um macete de estudo (geral ou específico).')
                // Matéria (Obrigatória)
                .addStringOption(option =>
                    option.setName('materia')
                        .setDescription('A matéria principal (ex: Matemática, Física)')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                // Conteúdo (Opcional)
                .addStringOption(option =>
                    option.setName('conteudo_especifico')
                        .setDescription('O tópico específico que você quer (ex: Bhaskara, MRUV)')
                        .setRequired(false)
                ),

            new SlashCommandBuilder()
                .setName('dica')
                .setDescription('Envia um macete de estudo (geral ou específico).')
                // Matéria (Obrigatória)
                .addStringOption(option =>
                    option.setName('materia')
                        .setDescription('A matéria principal (ex: Matemática, Física)')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                // Conteúdo (Opcional)
                .addStringOption(option =>
                    option.setName('conteudo_especifico')
                        .setDescription('O tópico específico que você quer (ex: Bhaskara, MRUV)')
                        .setRequired(false)
                ),
            ];

        // Registra os comandos
        await rest.put(
            Routes.applicationGuildCommands(botID, serverID), {
                body: commands
            },
        );
        console.log(`Registro de comandos de barra concluído com sucesso!`);
    }
    catch (error) {
        console.error(`Erro ao registrar comandos de barra: ${error}`);
    }
};

module.exports = { slashRegister };