import { ApplicationIntegrationType, InteractionContextType, MessageFlags, SlashCommandBuilder, } from "discord.js";
import { containerTemplate, getEmoji, sendAlertMessage } from "../../utils/export.js";
const sendMeme = {
    data: new SlashCommandBuilder()
        .setIntegrationTypes([
        ApplicationIntegrationType.UserInstall,
        ApplicationIntegrationType.GuildInstall,
    ])
        .setContexts([
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel,
        InteractionContextType.Guild,
    ])
        .setName("send-meme")
        .setNameLocalizations({
        it: "meme",
        tr: "mim",
        ro: "meme",
        el: "μεμέ",
        "pt-BR": "meme",
        "zh-CN": "梗图",
    })
        .setDescription("Memes from my pocket")
        .setDescriptionLocalizations({
        it: "Memes dalla mia tasca",
        tr: "Cebimden memeler",
        ro: "Memes din buzunarul meu",
        el: "Μιμίδια από την τσέπη μου",
        "pt-BR": "Memes do meu bolso",
        "zh-CN": "来自我的梗图",
    }),
    execute: async (interaction) => {
        const memeDataRaw = await fetch("https://apis.duncte123.me/meme");
        const memeData = await memeDataRaw.json();
        const title = memeData.data?.title ?? memeData.title ?? "Meme";
        const image = memeData.data?.image ?? memeData.image ?? null;
        if (!image) {
            return sendAlertMessage({
                interaction,
                content: `No mamez`,
                type: "info",
                tag: "No meme?",
            });
        }
        await interaction.deferReply();
        return interaction.editReply({
            components: [
                containerTemplate({
                    tag: "Memes",
                    description: `# ${getEmoji("brain")} ${title}`,
                    images: [image],
                }),
            ],
            allowedMentions: { parse: [] },
            flags: MessageFlags.IsComponentsV2,
        });
    },
};
export default sendMeme;
