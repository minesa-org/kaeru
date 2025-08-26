import { ActionRowBuilder, ApplicationIntegrationType, InteractionContextType, MessageFlags, SlashCommandBuilder, UserSelectMenuBuilder, } from "discord.js";
import { containerTemplate, sendAlertMessage } from "../../utils/error&containerMessage.js";
import { getEmoji } from "../../utils/emojis.js";
const SUPPORTED_EXTENSIONS = [
    ".txt",
    ".js",
    ".ts",
    ".py",
    ".json",
    ".css",
    ".html",
    ".md",
    ".cpp",
    ".rs",
];
const collabTogether = {
    data: new SlashCommandBuilder()
        .setContexts([InteractionContextType.Guild, InteractionContextType.PrivateChannel])
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
        .setName("collab")
        .setNameLocalizations({
        tr: "işbirliği",
        "zh-CN": "协作",
        it: "collabora",
        "pt-BR": "colaborar",
    })
        .setDescription("Share your file to collab with specific people")
        .setDescriptionLocalizations({
        tr: "Belirli kişilerle işbirliği yapmak için dosyanı paylaş",
        "zh-CN": "与特定人员协作共享你的文件",
        it: "Condividi il tuo file per collaborare con persone specifiche",
        "pt-BR": "Compartilhe seu arquivo para colaborar com pessoas específicas",
    })
        .addAttachmentOption(option => option
        .setName("file")
        .setNameLocalizations({
        tr: "dosya",
        "zh-CN": "文件",
        it: "file",
        "pt-BR": "arquivo",
    })
        .setDescription("Text based files are supported (BETA)")
        .setDescriptionLocalizations({
        tr: "Metin tabanlı dosyalar desteklenir (BETA)",
        "zh-CN": "支持基于文本的文件（测试版）",
        it: "Sono supportati i file di testo (BETA)",
        "pt-BR": "Arquivos de texto são suportados (BETA)",
    })
        .setRequired(true))
        .addBooleanOption(option => option
        .setName("view")
        .setNameLocalizations({
        tr: "görünür",
        "zh-CN": "可见",
        it: "visibile",
        "pt-BR": "visível",
    })
        .setDescription("Is it viewable by non-collaborators?")
        .setDescriptionLocalizations({
        tr: "İşbirliği yapmayanlar tarafından görülebilir mi?",
        "zh-CN": "非协作者可以查看吗？",
        it: "È visibile ai non collaboratori?",
        "pt-BR": "É visível para não colaboradores?",
    })
        .setRequired(false)),
    execute: async (interaction) => {
        const { options } = interaction;
        const file = options.getAttachment("file");
        const ext = SUPPORTED_EXTENSIONS.find(e => file?.name.endsWith(e));
        const isViewable = options.getBoolean("view") ?? false;
        if (!ext) {
            return sendAlertMessage({
                interaction,
                content: `Unsupported file type. Supported: ${SUPPORTED_EXTENSIONS.join(", ")}`,
                type: "error",
                tag: "Non-Supported File",
            });
        }
        const response = await fetch(file.url);
        const text = await response.text();
        if (text.length > 4000) {
            return sendAlertMessage({
                interaction,
                content: `File is too large to send to Discord. Max **4,000** characters for now.`,
                type: "error",
                tag: "Character Limit",
            });
        }
        interaction.client.fileCache.set(interaction.user.id, {
            text,
            ext,
            name: file.name,
            isViewable,
            collaborators: [],
            owner: interaction.user.id,
        });
        const userMenu = new ActionRowBuilder().addComponents(new UserSelectMenuBuilder()
            .setCustomId("collab_menu")
            .setPlaceholder("Select members to collaborate with...")
            .setMaxValues(10)
            .setMinValues(1));
        return interaction.reply({
            components: [
                containerTemplate({
                    tag: `${getEmoji("people")} Collaborating with People`,
                    title: "Welcome to collab onboarding!",
                    description: [
                        `Here you can select members to collab with your file. Other's will not able to edit or view file.`,
                    ],
                    thumbnail: "https://media.discordapp.net/attachments/736571695170584576/1407664558323007518/Frame_15.png?ex=68a6ed47&is=68a59bc7&hm=40e37f945a9bbbb7d65870c2010648548b25bd552ea182b8065162386945e8b6&=&format=webp&quality=lossless&width=614&height=610",
                }),
                userMenu,
            ],
            flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
        });
    },
};
export default collabTogether;
