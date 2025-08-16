import { ApplicationIntegrationType, ContainerBuilder, InteractionContextType, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, SlashCommandBuilder, TextDisplayBuilder, } from "discord.js";
import { getEmoji, sendErrorMessage } from "../../utils/export.js";
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
            return sendErrorMessage(interaction, "No mamez...", "info");
        }
        await interaction.deferReply();
        const container = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${getEmoji("brain")} ${title}`))
            .addMediaGalleryComponents(new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(image)));
        return interaction.editReply({
            components: [container],
            allowedMentions: { parse: [] },
            flags: MessageFlags.IsComponentsV2,
        });
    },
};
export default sendMeme;
