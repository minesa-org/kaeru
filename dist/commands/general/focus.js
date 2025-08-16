import { ApplicationIntegrationType, AutoModerationActionType, AutoModerationRuleEventType, AutoModerationRuleTriggerType, ContainerBuilder, InteractionContextType, MessageFlags, SlashCommandBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits, } from "discord.js";
import { getEmoji, getEmojiURL, sendErrorMessage } from "../../utils/export.js";
export const RULE_NAME = "Focused People";
const focusMode = {
    data: new SlashCommandBuilder()
        .setContexts(InteractionContextType.Guild)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
        .setName("focus")
        .setNameLocalizations({
        tr: "odak",
        "zh-CN": "专注",
        it: "concentrazione",
        "pt-BR": "foco",
    })
        .setDescription("Manage your focus mode")
        .setDescriptionLocalizations({
        tr: "Rahatsız edilmemek için odak modunu ayarla",
        "zh-CN": "设置免打扰模式",
        it: "Imposta la modalità di concentrazione",
        "pt-BR": "Ative o modo de foco para não ser mencionado",
    })
        .addSubcommand(sub => sub
        .setName("set")
        .setNameLocalizations({
        tr: "ayarla",
        "zh-CN": "设置",
        it: "imposta",
        "pt-BR": "configurar",
    })
        .setDescription("Set focus mode on or off")
        .setDescriptionLocalizations({
        tr: "Odak modunu aç veya kapat",
        "zh-CN": "启用或禁用专注模式",
        it: "Attiva o disattiva la modalità concentrazione",
        "pt-BR": "Ativar ou desativar o modo foco",
    })
        .addBooleanOption(option => option
        .setName("value")
        .setNameLocalizations({
        tr: "değer",
        "zh-CN": "值",
        it: "valore",
        "pt-BR": "valor",
    })
        .setDescription("Enable or disable")
        .setDescriptionLocalizations({
        tr: "Etkinleştir veya devre dışı bırak",
        "zh-CN": "启用或禁用",
        it: "Abilita o disabilita",
        "pt-BR": "Ativar ou desativar",
    })
        .setRequired(true)))
        .addSubcommand(sub => sub
        .setName("list")
        .setNameLocalizations({
        tr: "liste",
        "zh-CN": "列表",
        it: "lista",
        "pt-BR": "listar",
    })
        .setDescription("Show users in focus mode")
        .setDescriptionLocalizations({
        tr: "Odak modundaki kullanıcıları göster",
        "zh-CN": "显示正在专注模式的用户",
        it: "Mostra gli utenti in modalità concentrazione",
        "pt-BR": "Mostrar usuários no modo foco",
    })),
    execute: async (interaction) => {
        const { guild, member, options, user } = interaction;
        const subcommand = options.getSubcommand();
        const mention = `<@${user.id}>`;
        if (!guild?.members.me?.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return await sendErrorMessage(interaction, "I don't have permission to create automod rule to put you in focus mode. I am sorry.", "reactions.kaeru.thumbsdown");
        }
        if (!guild || !member) {
            // This command can be used in guild only but yeah
            return await sendErrorMessage(interaction, "> Be in guild. Alright got it.", "reactions.user.thumbsup");
        }
        let rules = await guild.autoModerationRules.fetch();
        let rule = rules.find(r => r.name === RULE_NAME);
        if (!rule) {
            rule = await guild.autoModerationRules.create({
                name: RULE_NAME,
                eventType: AutoModerationRuleEventType.MessageSend,
                triggerType: AutoModerationRuleTriggerType.Keyword,
                triggerMetadata: { keywordFilter: [] },
                actions: [
                    {
                        type: AutoModerationActionType.BlockMessage,
                        metadata: {
                            customMessage: "⏾⋆.˚ This user is currently focusing. Please do not disturb.",
                        },
                    },
                ],
                enabled: true,
                reason: "Initialized by focus system",
            });
        }
        const keywords = rule.triggerMetadata.keywordFilter || [];
        switch (subcommand) {
            case "set":
                const enable = options.getBoolean("value", true);
                const alreadySet = keywords.includes(mention);
                if (enable && alreadySet) {
                    return await sendErrorMessage(interaction, `You are already in __focus__ mode\n> ${getEmoji("reactions.user.haha")} Ohhh, okay. My bad lol`, "reactions.kaeru.question");
                }
                if (!enable && !alreadySet) {
                    return await sendErrorMessage(interaction, `You are not in __focus__ mode though...\n> ${getEmoji("reactions.user.haha")} Ohhh, okay. My bad haha`, "reactions.kaeru.question");
                }
                const updatedKeywords = enable
                    ? [...keywords, mention]
                    : keywords.filter(k => k !== mention);
                await rule.edit({
                    triggerMetadata: { keywordFilter: updatedKeywords },
                });
                return await interaction.reply({
                    content: enable
                        ? `# ${getEmoji("reactions.kaeru.emphasize")}\n-# Focus mode __activated__.`
                        : `# ${getEmoji("reactions.kaeru.emphasize")}\n-# Focus mode __disabled__.`,
                    flags: MessageFlags.Ephemeral,
                });
            case "list":
                if (keywords.length === 0) {
                    return await sendErrorMessage(interaction, `Everyone is fine to get disturbed.\n> ${getEmoji("reactions.user.thumbsup")} Ah, so no one is focused.`, "reactions.kaeru.thumbsup");
                }
                const usersList = keywords.map((m, i) => `${i + 1}. ${m}`).join("\n");
                const container = new ContainerBuilder()
                    .addSectionComponents(new SectionBuilder()
                    .setThumbnailAccessory(new ThumbnailBuilder().setURL(getEmojiURL(getEmoji("dnd"))))
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## Focused Users`), new TextDisplayBuilder().setContent(usersList)))
                    .addActionRowComponents(new ActionRowBuilder().addComponents(new ButtonBuilder()
                    .setCustomId("focus-list-clear")
                    .setLabel("Clear list")
                    .setStyle(ButtonStyle.Danger)))
                    .setAccentColor(0x5e5cde);
                return await interaction.reply({
                    components: [container],
                    flags: MessageFlags.IsComponentsV2,
                    allowedMentions: {
                        parse: [],
                    },
                });
        }
    },
};
export default focusMode;
