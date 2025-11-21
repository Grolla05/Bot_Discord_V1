const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.API_GEMINI_KEY);

/**
 * FUNÇÃO HELPER: Gera o conteúdo da mensagem (IA, Embed, Botão, Arquivo)
 * @param {import('discord.js').User} user - O usuário que vai receber a DM
 */
async function generateMotivationalMessage(user) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
    Você é um conselheiro de estudos.
    Sua missão é criar uma mensagem de motivação curta (máximo 3 frases), impactante e genuína para um estudante de vestibular.
    A mensagem deve ser em português do Brasil.
    Evite clichês óbvios. Foque em temas como a validade do esforço, a importância do descanso para o aprendizado e a autocompaixão durante a jornada.
    Termine com uma frase curta e poderosa.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const motivationalText = response.text();
    // --- FIM DA LÓGICA DA IA ---

    const motivationEmbed = new EmbedBuilder()
        .setColor('#6366f1')
        .setAuthor({ name: 'Mensagem Motivacional 💕' })
        .setTitle('💫 Uma Mensagem Especial Para Você')
        .setDescription(`${motivationalText}`)
        .addFields({
            name: '📚 Lembre-se',
            value: '> Cada dia de estudo é um passo mais próximo do seu objetivo.',
            inline: false
        })
        .setFooter({
            text: `Solicitado por ${user.username}`,
            iconURL: user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();
    
    // Definição e criação dos botões
    const buttonRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('Nova Mensagem')
                .setEmoji('🔄')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('new_motivation'),
        );

    // Retorna tudo que a mensagem precisa
    return {
        embeds: [motivationEmbed],
        components: [buttonRow],
        files: [mascotAttachment]
    };
}

/**
 * Lida com o comando de barra /motivate
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function handleMotivationCommand(interaction) {
    if (interaction.channel.id !== config.motivationChannelId) {
        await interaction.reply({
            content: `Olá! Este comando só pode ser usado no canal <#${config.motivationChannelId}>.`,
            ephemeral: true
        });
        return;
    }

    await interaction.deferReply();

    try {
        // Gera a mensagem usando a nova função helper
        const messagePayload = await generateMotivationalMessage(interaction.user);

        // Tenta enviar a DM
        try {
            await interaction.user.send(messagePayload); // messagePayload já contém 'embeds', 'components', e 'files'
            await interaction.editReply(`✅ Mensagem enviada no seu privado, ${interaction.user.toString()}! 🚀`);

        } catch (dmError) {
            console.warn(`Não foi possível enviar DM para ${interaction.user.tag}. Enviando no canal.`);
            // Envia no canal (Plano B)
            await interaction.editReply({
                content: `Não consegui te enviar uma DM, ${interaction.user.toString()}, então aqui está sua inspiração:`,
                ...messagePayload // Envia o payload completo (com thumbnail)
            });
        }

    } catch (error) {
        console.error('Erro ao gerar a mensagem motivacional com o Gemini:', error);
        await interaction.editReply('❌ Ocorreu um erro cósmico ao buscar inspiração. Tente novamente mais tarde.');
    
    } finally {
        setTimeout(() => {
            interaction.deleteReply().catch(console.error);
        }, 120000); // 2 minutos
    }
}

/**
 * NOVO: Lida com o clique do botão 'new_motivation'
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleMotivationButton(interaction) {
    try {
        // 1. Avisa ao Discord que estamos trabalhando (mostra "pensando" no botão)
        await interaction.deferUpdate();

        // 2. Gera uma nova mensagem usando a função helper
        const messagePayload = await generateMotivationalMessage(interaction.user);
        
        // 3. Envia a nova mensagem na DM
        await interaction.user.send(messagePayload);

    } catch (error) {
        console.error('Erro ao processar botão de motivação:', error);
        // Tenta enviar uma mensagem de erro na DM se falhar
        try {
            await interaction.user.send('❌ Ocorreu um erro ao gerar uma nova mensagem. Tente usar o comando `/motivate` no servidor.');
        } catch (dmError) {} // Ignora erros aqui
    }
}

// NOVO: Exportar a nova função
module.exports = {
    handleMotivationCommand,
    handleMotivationButton
};