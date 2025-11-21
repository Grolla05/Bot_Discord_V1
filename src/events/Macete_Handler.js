const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');
const config = require('../config.js');

// -----------------------------------------------------------------
// Setup do Cliente da IA (Gemini)
// -----------------------------------------------------------------
if (!process.env.API_GEMINI_KEY || process.env.API_GEMINI_KEY.trim() === '') {
    console.error("[Erro] API_GEMINI_KEY não encontrada nas variáveis de ambiente. O comando /macete não funcionará.");
}
const genAI = new GoogleGenerativeAI(process.env.API_GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Paleta de cores premium por matéria
const MATERIA_COLORS = {
    'matemática': 0x3498DB,      // Azul
    'física': 0x9B59B6,          // Roxo
    'química': 0xE67E22,         // Laranja
    'biologia': 0x2ECC71,        // Verde
    'português': 0xE74C3C,       // Vermelho
    'literatura': 0xF39C12,      // Amarelo-dourado
    'história': 0x8B4513,        // Marrom
    'geografia': 0x16A085,       // Verde-água
    'filosofia': 0x34495E,       // Cinza-escuro
    'sociologia': 0xC0392B,      // Vermelho-escuro
    'redação': 0x1ABC9C,         // Turquesa
    'default': 0x5865F2          // Discord Blurple
};

// Emojis temáticos por matéria
const MATERIA_EMOJIS = {
    'matemática': '🔢',
    'física': '⚛️',
    'química': '🧪',
    'biologia': '🧬',
    'português': '📚',
    'literatura': '📖',
    'história': '🏛️',
    'geografia': '🌍',
    'filosofia': '🤔',
    'sociologia': '👥',
    'redação': '✍️',
    'default': '💡'
};

// Função principal que será chamada pelo bot.js
async function handleMaceteCommand(interaction) {
    try {
        // Verifica se o comando foi usado no canal correto
        const allowedChannelId = config.maceteChannelId;
        if (interaction.channelId !== allowedChannelId) {
            const embedError = new EmbedBuilder()
                .setTitle('Comando no Canal Errado')
                .setDescription(`Ops! O comando \`/macete\` só pode ser usado no canal <#${allowedChannelId}>.`)
                .setColor(0xFF0000);

            await interaction.reply({
                embeds: [embedError],
                ephemeral: true
            });
            return;
        }

        // Pega os parâmetros do comando
        const materia = interaction.options.getString('materia');
        const conteudo = interaction.options.getString('conteudo_especifico');

        // --- Defer Reply (Adiar Resposta) como efêmero ---
        // A mensagem "Pensando..." só aparecerá para o usuário que solicitou.
        await interaction.deferReply({ ephemeral: true });

        // Monta o prompt para a IA
        const basePrompt = `
        Atue como um **professor especialista em vestibulares**, com ampla experiência em aprovar alunos em universidades de todo o Brasil.
        Seu papel é **guiar o vestibulando** com **macetes, truques e dicas práticas** das diversas matérias cobradas em provas.
        Cada resposta deve:

        * Ser **curta, objetiva e estratégica**, como um “segredo de professor experiente”.
        * Explicar **por que o macete funciona** e **em quais tipos de questão** ele costuma aparecer.
        * Sempre manter um **tom motivador e encorajador**.
        * Quando útil, incluir **resumos mentais, frases de memorização ou analogias**.
        * Ao final, dê uma **dica extra de estudo ou organização**.

        Regras:
        1. Seja direto e focado no estudante.
        2. O macete deve ser curto e útil.
        3. **Use a formatação Markdown do Discord (como **negrito** e *itálico*) para organizar a resposta de forma clara e legível.**`;

        const topicoAlvo = conteudo
            ? `da matéria de ${materia}, focado especificamente no tópico de: "${conteudo}"`
            : `um macete generalizado para a matéria de: "${materia}"`;

        const promptFinal = `${basePrompt}\n\nGere um macete para ${topicoAlvo}`;

        // Chama a API da IA
        const result = await model.generateContent(promptFinal);
        const response = await result.response;
        const maceteGerado = response.text();

        // Monta o Embed com o resultado
        const embed = new EmbedBuilder();
        const materiaFormatada = materia.charAt(0).toUpperCase() + materia.slice(1);
        const materiaLower = materia.toLowerCase();

        const materiaEmoji = MATERIA_EMOJIS[materiaLower] || MATERIA_EMOJIS.default;
        const materiaColor = MATERIA_COLORS[materiaLower] || MATERIA_COLORS.default;

        let embedTitle;
        if (conteudo) {
            const conteudoFormatado = conteudo.charAt(0).toUpperCase() + conteudo.slice(1);
            embedTitle = `${materiaEmoji} Macete Estratégico: ${conteudoFormatado}`;
        } else {
            embedTitle = `${materiaEmoji} Macete Estratégico de ${materiaFormatada}`;
        }
        
        // Lógica para anexar thumbnail local
        const THUMB_SUBFOLDERS = {
            'matemática': 'Matematica', 'física': 'Física', 'química': 'Química',
            'biologia': 'Biologia', 'português': 'Português', 'literatura': 'Literatura',
            'história': 'História', 'geografia': 'Geografia', 'filosofia': 'Filosofia',
            'sociologia': 'Sociologia'
        };

        let files = [];
        const subfolder = THUMB_SUBFOLDERS[materiaLower];
        if (subfolder) {
            const absPath = path.resolve(__dirname, '../../public/Mascote/Materias', subfolder, 'Camaleão_1_sem_fundo.png');
            if (fs.existsSync(absPath)) {
                const safeName = `thumb_${subfolder.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.png`;
                const attachment = new AttachmentBuilder(absPath, { name: safeName });
                files.push(attachment);
                embed.setThumbnail(`attachment://${safeName}`);
            }
        }

        embed
            .setColor(materiaColor)
            .setTitle(embedTitle)
            .setDescription(maceteGerado)
            .addFields(
                { name: '📚 Matéria', value: `\`${materiaFormatada}\``, inline: true },
                { name: '🎓 Nível', value: '`Vestibular`', inline: true },
                { name: '⭐ Tipo', value: conteudo ? '`Específico`' : '`Geral`', inline: true }
            )
            .setFooter({ text: '✨ SimulaVest IA | Seu mentor para aprovação' })
            .setTimestamp();

        // --- Lógica de Envio por DM com Fallback ---
        try {
            // Tenta enviar o embed e os arquivos diretamente para o usuário
            await interaction.user.send({ embeds: [embed], files });

            // Se o envio por DM for bem-sucedido, edita a resposta original no canal
            await interaction.editReply({
                content: '✨ **Macete enviado!** Verifique suas mensagens diretas (DMs).',
                embeds: [], // Limpa embeds da resposta no canal
                files: []   // Limpa arquivos da resposta no canal
            });

        } catch (dmError) {
            // Se falhar (ex: DMs bloqueadas), envia o macete no canal de forma efêmera
            console.warn(`Falha ao enviar DM para ${interaction.user.tag}. Enviando como resposta ephemeral.`);
            await interaction.editReply({
                content: '⚠️ **Não consegui enviar seu macete por DM!** (Suas mensagens diretas podem estar desabilitadas para este servidor).\n\nAqui está o seu macete:',
                embeds: [embed],
                files
            });
        }

    } catch (error) {
        console.error("Erro no handleMacedeCommand (IA):", error);

        const errorEmbed = new EmbedBuilder()
            .setTitle('Ocorreu um Erro')
            .setDescription('Desculpe, não consegui gerar um macete com a IA neste momento. Tente novamente mais tarde.')
            .setColor(0xFF0000);

        try {
            // Como o deferReply foi ephemeral, este editReply também será.
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], content: '' });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        } catch (replyErr) {
            console.error('Erro crítico ao tentar enviar a mensagem de erro:', replyErr);
        }
    }
}

// Função de Autocomplete (sem alterações)
async function handleMaceteAutocomplete(interaction) {
    try {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const materiasDisponiveis = [
            'Matemática', 'Física', 'Química', 'Biologia', 'Português',
            'Literatura', 'História', 'Geografia', 'Filosofia', 'Sociologia', 'Redação'
        ];

        const filtered = materiasDisponiveis.filter(choice =>
            choice.toLowerCase().startsWith(focusedValue)
        );

        const options = filtered.slice(0, 25).map(choice => ({
            name: choice,
            value: choice
        }));

        await interaction.respond(options);
    } catch (error) {
        console.error("Erro no handleMacedeAutocomplete:", error);
    }
}

module.exports = {
    handleMaceteCommand,
    handleMaceteAutocomplete
};