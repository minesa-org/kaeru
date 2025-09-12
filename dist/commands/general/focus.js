import { ApplicationIntegrationType, AutoModerationActionType, AutoModerationRuleEventType, AutoModerationRuleTriggerType, InteractionContextType, MessageFlags, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits, } from "discord.js";
import { containerTemplate, getEmoji, sendAlertMessage } from "../../utils/export.js";
export const RULE_NAME = "Focused People";
const focusMode = {
    data: new SlashCommandBuilder()
        .setContexts(InteractionContextType.Guild)
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
        .setName("focus")
        .setNameLocalizations({
        tr: "odak",
        "zh-CN": "专注",
        it: "concentra",
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
            return sendAlertMessage({
                interaction,
                content: "I don't have permission to create automod rule to put you in focus mode. I am sorry.",
                type: "info",
                tag: "Missing Permission",
            });
        }
        if (!guild || !member) {
            // This command can be used in guild only but yeah
            return sendAlertMessage({
                interaction,
                content: "> Be in guild. Alright got it.",
                type: "info",
                tag: "Missing Permission",
            });
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
                    return sendAlertMessage({
                        interaction,
                        content: `You are already in __focus__ mode\n> ${getEmoji("reactions.user.haha")} Ohhh, okay. My bad lol`,
                        type: "info",
                        tag: "What?",
                        alertReaction: "reactions.kaeru.question",
                    });
                }
                if (!enable && !alreadySet) {
                    return sendAlertMessage({
                        interaction,
                        content: `You are not in __focus__ mode though\n> ${getEmoji("reactions.user.haha")} Ohhh, okay. My bad haha`,
                        type: "info",
                        tag: "What?",
                        alertReaction: "reactions.kaeru.question",
                    });
                }
                const updatedKeywords = enable
                    ? [...keywords, mention]
                    : keywords.filter(k => k !== mention);
                await rule.edit({
                    triggerMetadata: { keywordFilter: updatedKeywords },
                });
                return await interaction.reply({
                    components: [
                        containerTemplate({
                            tag: "Focus System",
                            title: getEmoji("reactions.kaeru.emphasize"),
                            description: enable ? "Focus mode __activated__." : "Focus mode __disabled__.",
                        }),
                    ],
                    flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
                });
            case "list":
                if (keywords.length === 0) {
                    return sendAlertMessage({
                        interaction,
                        content: `Seems like everyone is fine to get disturbed now.\n> ${getEmoji("reactions.user.thumbsup")} Ah, so no one is focused. Got it.`,
                        type: "info",
                        tag: "Focus Chaos Begins",
                    });
                }
                const usersList = keywords.map((m, i) => `${i + 1}. ${m}`).join("\n");
                const clearButton = new ActionRowBuilder().addComponents(new ButtonBuilder()
                    .setCustomId("focus-list-clear")
                    .setLabel("Clear list")
                    .setStyle(ButtonStyle.Danger));
                return await interaction.reply({
                    components: [
                        containerTemplate({
                            tag: "Focus System",
                            title: "Focused Users",
                            description: usersList,
                            thumbnail: "https://media.discordapp.net/attachments/736571695170584576/1408569663046029414/DND.png?ex=68aa3839&is=68a8e6b9&hm=8c6c123d4d1fa7e158c6cada574a70751992b6b456bec971267d33f1f0033272&=&format=webp&quality=lossless&width=706&height=706",
                        }),
                        clearButton,
                    ],
                    flags: MessageFlags.IsComponentsV2,
                    allowedMentions: {
                        parse: [],
                    },
                });
        }
    },
};
export default focusMode;
