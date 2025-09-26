import { GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel, PermissionFlagsBits, SlashCommandBuilder, MessageFlags, userMention, ApplicationIntegrationType, InteractionContextType, underline, } from "discord.js";
import moment from "moment-timezone";
import { getEmoji, timezoneChecking, timeChecking, sendAlertMessage, containerTemplate, } from "../../utils/export.js";
const createGiveaway = {
    data: new SlashCommandBuilder()
        .setName("create-giveaway")
        .setDescription("Create a giveaway (THIS IS STILL ON BETA)")
        .setNameLocalizations({
        tr: "çekiliş-oluştur",
        it: "crea-concorso",
        "zh-CN": "创建抽奖",
        el: "δημιουργία-διαγωνισμού",
        "pt-BR": "criar-sorteio",
        ro: "creează-tombolă",
    })
        .setDescriptionLocalizations({
        tr: "Bir çekiliş oluşturun",
        it: "Crea un concorso",
        "zh-CN": "创建抽奖活动",
        el: "Δημιουργήστε έναν διαγωνισμό",
        "pt-BR": "Crie um sorteio",
        ro: "Creează o tombolă",
    })
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .addStringOption(option => option
        .setName("prize")
        .setNameLocalizations({
        tr: "ödül",
        it: "premio",
        "zh-CN": "奖品",
        el: "έπαθλο",
        "pt-BR": "prêmio",
        ro: "premiu",
    })
        .setDescription("What will be the prize?")
        .setDescriptionLocalizations({
        tr: "Ödül nedir?",
        it: "Qual è il premio?",
        "zh-CN": "奖品是什么？",
        el: "Ποιο θα είναι το έπαθλο;",
        "pt-BR": "Qual será o prêmio?",
        ro: "Care va fi premiul?",
    })
        .setRequired(true))
        .addStringOption(option => option
        .setName("duration")
        .setNameLocalizations({
        tr: "süre",
        it: "durata",
        "zh-CN": "持续时间",
        el: "διάρκεια",
        "pt-BR": "duração",
        ro: "durată",
    })
        .setDescription("The duration of event")
        .setDescriptionLocalizations({
        tr: "Etkinliğin süresi",
        it: "La durata dell'evento",
        "zh-CN": "活动持续时间",
        el: "Η διάρκεια του γεγονότος",
        "pt-BR": "A duração do evento",
        ro: "Durata evenimentului",
    })
        .setRequired(true)
        .addChoices({
        name: "1 minute",
        value: "1m",
        name_localizations: {
            tr: "1 dakika",
            it: "1 minuto",
            "zh-CN": "1分钟",
            el: "1 λεπτό",
            "pt-BR": "1 minuto",
            ro: "1 minut",
        },
    }, {
        name: "10 minutes",
        value: "10m",
        name_localizations: {
            tr: "10 dakika",
            it: "10 minuti",
            "zh-CN": "10分钟",
            el: "10 λεπτά",
            "pt-BR": "10 minutos",
            ro: "10 minute",
        },
    }, {
        name: "30 minutes",
        value: "30m",
        name_localizations: {
            tr: "30 dakika",
            it: "30 minuti",
            "zh-CN": "30分钟",
            el: "30 λεπτά",
            "pt-BR": "30 minutos",
            ro: "30 de minute",
        },
    }, {
        name: "1 hour",
        value: "1h",
        name_localizations: {
            tr: "1 saat",
            it: "1 ora",
            "zh-CN": "1小时",
            el: "1 ώρα",
            "pt-BR": "1 hora",
            ro: "1 oră",
        },
    }, {
        name: "2 hours",
        value: "2h",
        name_localizations: {
            tr: "2 saat",
            it: "2 ore",
            "zh-CN": "2小时",
            el: "2 ώρες",
            "pt-BR": "2 horas",
            ro: "2 ore",
        },
    }, {
        name: "3 hours",
        value: "3h",
        name_localizations: {
            tr: "3 saat",
            it: "3 ore",
            "zh-CN": "3小时",
            el: "3 ώρες",
            "pt-BR": "3 horas",
            ro: "3 ore",
        },
    }, {
        name: "4 hours",
        value: "4h",
        name_localizations: {
            tr: "4 saat",
            it: "4 ore",
            "zh-CN": "4小时",
            el: "4 ώρες",
            "pt-BR": "4 horas",
            ro: "4 ore",
        },
    }, {
        name: "5 hours",
        value: "5h",
        name_localizations: {
            tr: "5 saat",
            it: "5 ore",
            "zh-CN": "5小时",
            el: "5 ώρες",
            "pt-BR": "5 horas",
            ro: "5 ore",
        },
    }, {
        name: "6 hours",
        value: "6h",
        name_localizations: {
            tr: "6 saat",
            it: "6 ore",
            "zh-CN": "6小时",
            el: "6 ώρες",
            "pt-BR": "6 horas",
            ro: "6 ore",
        },
    }, {
        name: "1 day",
        value: "1d",
        name_localizations: {
            tr: "1 gün",
            it: "1 giorno",
            "zh-CN": "1天",
            el: "1 ημέρα",
            "pt-BR": "1 dia",
            ro: "1 zi",
        },
    }, {
        name: "2 days",
        value: "2d",
        name_localizations: {
            tr: "2 gün",
            it: "2 giorni",
            "zh-CN": "2天",
            el: "2 ημέρες",
            "pt-BR": "2 dias",
            ro: "2 zile",
        },
    }, {
        name: "3 days",
        value: "3d",
        name_localizations: {
            tr: "3 gün",
            it: "3 giorni",
            "zh-CN": "3天",
            el: "3 ημέρες",
            "pt-BR": "3 dias",
            ro: "3 zile",
        },
    }))
        .addStringOption(option => option
        .setName("description")
        .setNameLocalizations({
        tr: "açıklama",
        it: "descrizione",
        "zh-CN": "描述",
        el: "περιγραφή",
        "pt-BR": "descrição",
        ro: "descriere",
    })
        .setDescription("Giveaway description.")
        .setDescriptionLocalizations({
        tr: "Çekiliş açıklaması.",
        it: "Descrizione del concorso.",
        "zh-CN": "抽奖描述。",
        el: "Περιγραφή διαγωνισμού.",
        "pt-BR": "Descrição do sorteio.",
        ro: "Descrierea concursului.",
    })
        .setRequired(false))
        .addAttachmentOption(option => option
        .setName("image")
        .setNameLocalizations({
        tr: "resim",
        it: "immagine",
        "zh-CN": "图片",
        el: "εικόνα",
        "pt-BR": "imagem",
        ro: "imagine",
    })
        .setDescription("Giveaway image.")
        .setDescriptionLocalizations({
        tr: "Çekiliş resmi.",
        it: "Immagine del concorso.",
        "zh-CN": "抽奖图片。",
        el: "Εικόνα διαγωνισμού.",
        "pt-BR": "Imagem do sorteio.",
        ro: "Imaginea concursului.",
    })
        .setRequired(false)),
    execute: async (interaction) => {
        if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageEvents)) {
            return sendAlertMessage({
                interaction,
                content: `It seems like I can't create events.\n> ${getEmoji("reactions.user.thumbsup")} Got it! I will give you the permission to create, soon.`,
                type: "error",
                tag: "Missing Permissions",
                alertReaction: "reactions.kaeru.emphasize",
            });
        }
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const giveawayName = interaction.options.getString("prize", true);
        const giveawayDescription = interaction.options.getString("description") ||
            "Feel free to join <:ita_happy:1170847735008739408>";
        const giveawayImage = interaction.options.getAttachment("image");
        const duration = interaction.options.getString("duration", true);
        const seconds = timeChecking(duration);
        const discordLocale = interaction.guild?.preferredLocale;
        const timezone = timezoneChecking(discordLocale);
        const scheduledStartTime = moment().tz(timezone).add(seconds, "seconds");
        const scheduledEndTime = moment(scheduledStartTime).add(1, "hours");
        const giveaway = await interaction.guild.scheduledEvents.create({
            name: giveawayName,
            description: giveawayDescription,
            image: giveawayImage?.url ??
                "https://cdn.discordapp.com/attachments/736571695170584576/1406025781263728812/Giveaway_Default.png?ex=68a0f70c&is=689fa58c&hm=396d00bc314e94d2b533bcd0651e5dae246f5598c95015ce38e0b473f6464799",
            scheduledStartTime: scheduledStartTime.toDate(),
            scheduledEndTime: scheduledEndTime.toDate(),
            privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
            entityType: GuildScheduledEventEntityType.External,
            entityMetadata: {
                location: `By ${userMention(interaction.user.id)}`,
            },
            reason: `Giveaway created by ${interaction.user.tag} for ${giveawayName}.`,
        });
        let inviteLink;
        try {
            inviteLink = await giveaway.createInviteURL({ channel: interaction.channelId });
        }
        catch (err) {
            console.error("Error creating invite link:", err);
            return sendAlertMessage({
                interaction,
                content: `${getEmoji("danger")} Failed to create invite URL.`,
                type: "error",
            });
        }
        await interaction.editReply({
            components: [
                containerTemplate({
                    tag: "Giveaway System",
                    description: `${getEmoji("giftCard")} Creating the giveaway...`,
                }),
            ],
            flags: [MessageFlags.IsComponentsV2],
        });
        await interaction.editReply({
            components: [
                containerTemplate({
                    tag: "Giveaway System",
                    description: [
                        `Giveaway will be triggered when the time arrives. Winner will be revealed automatically.`,
                        `> Invite Link: ${inviteLink}`,
                    ],
                    title: `${getEmoji("giftCard")} Giveaway Created: ${underline(giveawayName)}`,
                }),
            ],
            flags: [MessageFlags.IsComponentsV2],
        });
        setTimeout(async () => {
            try {
                const fetchedGiveaway = await interaction.guild?.scheduledEvents.cache
                    .get(giveaway.id)
                    ?.fetch(true);
                if (!fetchedGiveaway)
                    return;
                const subscribers = await fetchedGiveaway.fetchSubscribers();
                let resultMessage;
                if (subscribers.size > 0) {
                    const shuffled = shuffleSubscribers([...subscribers.values()].map(sub => sub.user));
                    const winner = shuffled[0];
                    resultMessage = `**${giveawayName}** giveaway has a winner! ${getEmoji("giftCard")}
${userMention(winner.id)} please create a ticket to contact with us! <:ita_happy:1170847735008739408>`;
                }
                else {
                    resultMessage = `**${giveawayName}** giveaway ended, but no one joined. <:ita_happy:1170847735008739408>`;
                }
                await fetchedGiveaway.edit({
                    name: `Giveaway Ended! — ${giveawayName}`,
                    description: resultMessage,
                });
            }
            catch (err) {
                console.error("Error resolving giveaway:", err);
            }
        }, scheduledStartTime.diff(moment(), "milliseconds"));
    },
};
export default createGiveaway;
/**
 * Shuffles the subscribers array to randomly select a winner.
 * @param array Array of users to shuffle
 * @returns Shuffled array of users
 */
function shuffleSubscribers(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
