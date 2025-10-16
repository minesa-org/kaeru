import { ApplicationIntegrationType, AutoModerationActionType, AutoModerationRuleEventType, AutoModerationRuleTriggerType, ChannelSelectMenuBuilder, ChannelType, InteractionContextType, LabelBuilder, MessageFlags, ModalBuilder, PermissionFlagsBits, RoleSelectMenuBuilder, SlashCommandBuilder, TextDisplayBuilder, TextInputBuilder, TextInputStyle, } from "discord.js";
import { getEmoji, sendAlertMessage, setHubChannel, setImageChannel, containerTemplate, } from "../../utils/export.js";
import { karu } from "../../config/karu.js";
const setup = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setNameLocalizations({
        it: "configura",
        tr: "kur",
        "zh-CN": "设置",
        "pt-BR": "configurar",
        ro: "setari",
        el: "ρυθμίσεις",
        de: "setup",
        ru: "настройка",
    })
        .setDescription("Setup things!")
        .setDescriptionLocalizations({
        it: "Configura facilmente il server!",
        tr: "Sunucunu kolayca yapılandır!",
        "zh-CN": "快速设置服务器！",
        "pt-BR": "Configure facilmente seu servidor!",
        ro: "Configurează-ți serverul rapid!",
        el: "Ρυθμίστε εύκολα τον διακομιστή σας!",
        de: "Richte deinen Server schnell ein!",
        ru: "Легко настрой свой сервер!",
    })
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        // Ticket
        .addSubcommand(subcommand => subcommand
        .setName("ticket")
        .setNameLocalizations({
        it: "ticket",
        tr: "destek-formu",
        "zh-CN": "工单",
        "pt-BR": "ticket",
        ro: "tichet",
        el: "ticket",
        de: "ticket",
        ru: "тикет",
    })
        .setDescription("Setup ticket system with threads!")
        .setDescriptionLocalizations({
        it: "Configura un sistema di ticket con i thread!",
        tr: "Thread tabanlı destek sistemi kur!",
        "zh-CN": "使用线程设置工单系统！",
        "pt-BR": "Configure um sistema de tickets com threads!",
        ro: "Configurează un sistem de tichete cu thread-uri!",
        el: "Ρυθμίστε σύστημα ticket με νήματα!",
        de: "Richte ein Ticket-System mit Threads ein!",
        ru: "Настрой систему тикетов с тредами!",
    }))
        // Image Channel
        .addSubcommand(subcommand => subcommand
        .setName("image-channel")
        .setNameLocalizations({
        it: "canale-immagini",
        tr: "görsel-kanalı",
        "zh-CN": "图片频道",
        "pt-BR": "canal-imagem",
        ro: "canal-imagini",
        el: "κανάλι-εικόνων",
        de: "bild-kanal",
        ru: "канал-изображений",
    })
        .setDescription("Set up an image channel that people can post only images and videos!")
        .setDescriptionLocalizations({
        it: "Crea un canale dove si possono inviare solo immagini e video!",
        tr: "Sadece görsel ve video paylaşımı yapılabilecek bir kanal oluştur",
        "zh-CN": "建立一个只能发图片和视频的频道！",
        "pt-BR": "Crie um canal onde só se pode postar imagens e vídeos!",
        ro: "Creează un canal unde se pot posta doar imagini și videoclipuri!",
        el: "Δημιουργήστε κανάλι μόνο για εικόνες και βίντεο!",
        de: "Erstelle einen Kanal, in dem nur Bilder und Videos erlaubt sind!",
        ru: "Создай канал, где можно публиковать только изображения и видео!",
    })
        .addChannelOption(option => option
        .setName("channel")
        .setNameLocalizations({
        it: "canale",
        tr: "kanal",
        "zh-CN": "频道",
        "pt-BR": "canal",
        ro: "canal",
        el: "κανάλι",
        de: "kanal",
        ru: "канал",
    })
        .setDescription("Which channel will it be?")
        .setDescriptionLocalizations({
        it: "Quale canale sarà?",
        tr: "Hangi kanal olacak?",
        "zh-CN": "选择哪个频道？",
        "pt-BR": "Qual será o canal?",
        ro: "Care va fi canalul?",
        el: "Ποιο κανάλι θα είναι;",
        de: "Welcher Kanal soll es sein?",
        ru: "Какой канал выбрать?",
    })
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)))
        // Voice Hub
        .addSubcommand(subcommand => subcommand
        .setName("voice-hub")
        .setNameLocalizations({
        tr: "ses-merkezi",
        "zh-CN": "语音中心",
        it: "hub-vocale",
        "pt-BR": "hub-voz",
        ro: "hub-vocal",
        el: "φωνητικό-hub",
        de: "voice-hub",
        ru: "голосовой-хаб",
    })
        .setDescription("Set up a voice hub that people can create their vc!")
        .setDescriptionLocalizations({
        it: "Crea un hub vocale dove gli utenti possono aprire i propri canali vocali!",
        tr: "Kullanıcıların kendi ses kanallarını açabileceği bir ses merkezi oluştur",
        "zh-CN": "建立一个语音中心，让用户可以创建自己的语音频道！",
        "pt-BR": "Crie um hub de voz onde os usuários possam abrir seus canais de voz!",
        ro: "Creează un hub vocal unde utilizatorii își pot face propriul canal vocal!",
        el: "Δημιουργήστε ένα hub φωνής όπου οι χρήστες μπορούν να ανοίγουν τα δικά τους κανάλια!",
        de: "Erstelle ein Voice-Hub, in dem Nutzer eigene Sprachkanäle erstellen können!",
        ru: "Создай голосовой хаб, где пользователи могут открывать свои каналы!",
    })
        .addChannelOption(option => option
        .setName("channel")
        .setNameLocalizations({
        it: "canale",
        tr: "kanal",
        "zh-CN": "频道",
        "pt-BR": "canal",
        ro: "canal",
        el: "κανάλι",
        de: "kanal",
        ru: "канал",
    })
        .setDescription("Select the channel that will become hub")
        .setDescriptionLocalizations({
        it: "Seleziona il canale che diventerà l'hub",
        tr: "Merkez olacak kanalı seç",
        "zh-CN": "选择将成为中心的频道",
        "pt-BR": "Selecione o canal que será o hub",
        ro: "Selectează canalul care va fi hub-ul",
        el: "Επιλέξτε το κανάλι που θα γίνει hub",
        de: "Wähle den Kanal, der das Hub wird",
        ru: "Выбери канал, который станет хабом",
    })
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true)))
        // Automod Ruleset
        .addSubcommand(subcommand => subcommand
        .setName("automod-rule-set")
        .setNameLocalizations({
        it: "set-regole-automod",
        tr: "otomatik-mod-kuralları",
        "zh-CN": "自动模式规则集",
        "pt-BR": "conjunto-de-regras-automod",
        ro: "set-reguli-automod",
        el: "ορισμός-αυτόματου-κανονισμού",
        de: "automod-regelmenge",
        ru: "настройки-автомода",
    })
        .setDescription("Set up automod ruleset for the server!")
        .setDescriptionLocalizations({
        it: "Configura il set di regole automod per il server!",
        tr: "Sunucu için otomatik mod kurallarını ayarla!",
        "zh-CN": "为服务器设置自动管理模式！",
        "pt-BR": "Configure o conjunto de regras automod para o servidor!",
        ro: "Configură setul de reguli automod pentru server!",
        el: "Ορίστε τον ορισμό αυτόματου κανονισμού για τον διακομιστή!",
        de: "Richte das Automod-Regelmenge für den Server ein!",
        ru: "Настрой автоматическую систему правил для сервера!",
    })
        .addAttachmentOption(option => option
        .setName("rule-file")
        .setNameLocalizations({
        it: "file-regola",
        tr: "kural-dosyası",
        "zh-CN": "规则文件",
        "pt-BR": "arquivo-de-regra",
        ro: "fișier-regulă",
        el: "αρχείο-κανονισμού",
        de: "regel-datei",
        ru: "файл-правил",
    })
        .setDescription("Upload your automod rule file")
        .setDescriptionLocalizations({
        it: "Carica il tuo file di regole automod",
        tr: "Otomatik mod kural dosyanızı yükleyin",
        "zh-CN": "上传您的自动模式规则文件",
        "pt-BR": "Envie seu arquivo de regras automod",
        ro: "Trimiteți fișierul de reguli automod",
        el: "Ανεβάστε το αρχείο κανονισμού automod",
        de: "Laden Sie Ihre Automod-Regel-Datei hoch",
        ru: "Загрузите файл правил автомода",
    })
        .setRequired(true))),
    execute: async (interaction) => {
        const { guild } = interaction;
        const channelOption = interaction.options.getChannel("channel");
        const ticketCommand = async () => {
            const modal = new ModalBuilder()
                .setCustomId("ticket-setup-modal")
                .setTitle("Ticket creation")
                .addTextDisplayComponents(new TextDisplayBuilder().setContent("Set the description of the container message will be displayed to members."))
                .addLabelComponents(new LabelBuilder()
                .setId(1)
                .setLabel("Description")
                .setDescription("Description of the ticket message")
                .setTextInputComponent(new TextInputBuilder()
                .setCustomId("ticket-setup-description")
                .setPlaceholder("Markdown is supported")
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(4000)
                .setRequired(false)), new LabelBuilder()
                .setId(2)
                .setLabel("Staff Role")
                .setDescription("Set the role that will get pinged when ticket is created.")
                .setRoleSelectMenuComponent(new RoleSelectMenuBuilder()
                .setCustomId("ticket-setup-staff-role")
                .setMaxValues(1)
                .setPlaceholder("Select a role")
                .setRequired(true)), new LabelBuilder()
                .setId(3)
                .setLabel("Banner Image")
                .setDescription("Banner image of the ticket message, please paste the URL")
                .setTextInputComponent(new TextInputBuilder()
                .setStyle(TextInputStyle.Short)
                .setCustomId("ticket-setup-image-url")
                .setPlaceholder("https://cdn.discord.com/...")
                .setRequired(false)), new LabelBuilder()
                .setId(4)
                .setLabel("Send to channel")
                .setDescription("Select a text channel to send this message to that channel.")
                .setChannelSelectMenuComponent(new ChannelSelectMenuBuilder()
                .setCustomId("ticket-setup-channel")
                .addChannelTypes([ChannelType.GuildText])
                .setMaxValues(1)
                .setPlaceholder("Select a channel")
                .setRequired(true)));
            await interaction.showModal(modal);
        };
        const imageChannel = async () => {
            const selectedChannel = guild?.channels.cache.get(channelOption.id);
            if (!selectedChannel ||
                !selectedChannel.permissionsFor(guild?.members.me)?.has("ViewChannel")) {
                return sendAlertMessage({
                    interaction,
                    content: `I can't find/access to the selected channel. Perhaps give me view channel permission?`,
                    type: "error",
                    tag: "Missing Permissions",
                });
            }
            if (!guild?.members.me?.permissions.has("CreatePublicThreads")) {
                return sendAlertMessage({
                    interaction,
                    content: `It seems like I can't create public threads to people comment on image.\n> ${getEmoji("reactions.user.thumbsup")} Got it! I will give you the permission to manage, soon.`,
                    type: "error",
                    tag: "Missing Permissions",
                    alertReaction: "reactions.kaeru.emphasize",
                });
            }
            await interaction.deferReply();
            try {
                await setImageChannel(guild.id, channelOption.id);
                return interaction.editReply({
                    components: [
                        containerTemplate({
                            tag: "System Created",
                            title: `${getEmoji("banner")} Media channel system created successfully!`,
                            description: [
                                `- Only media content will be allowed`,
                                `- Automatic threads will be created for posts`,
                            ].join("\n"),
                        }),
                    ],
                    flags: [MessageFlags.IsComponentsV2],
                });
            }
            catch (error) {
                console.error("Error setting up image channel:", error);
                return sendAlertMessage({
                    interaction,
                    content: `Failed to set up image channel system. Try again later.`,
                    type: "error",
                    tag: "Error",
                });
            }
        };
        const hubCommand = async () => {
            await interaction.deferReply();
            await setHubChannel(guild.id, channelOption.id);
            return interaction.editReply({
                components: [
                    containerTemplate({
                        tag: "System Created",
                        title: `${getEmoji("up")} Voice Hub channel system created successfully!`,
                        description: [
                            `- Users can create their vc`,
                            `- It is ultra-private — so only admins can join`,
                        ].join("\n"),
                    }),
                ],
                flags: [MessageFlags.IsComponentsV2],
            });
        };
        const automodRulesetCommand = async () => {
            if (!guild?.members.me?.permissions.has("ManageGuild")) {
                return sendAlertMessage({
                    interaction,
                    content: `It seems like I can't create automod ruleset for the server.\n> ${getEmoji("reactions.user.thumbsup")} Got it! I will give you the permission to manage, soon.`,
                    type: "error",
                    tag: "Missing Permissions",
                    alertReaction: "reactions.kaeru.emphasize",
                });
            }
            await interaction.deferReply();
            const RULE_NAME = "Server Rules - Automod";
            const file = interaction.options.getAttachment("rule-file", true);
            if (!file.name.endsWith(".txt") && !file.name.endsWith(".md")) {
                return sendAlertMessage({
                    interaction,
                    content: `Please upload a .txt or .md file.`,
                    type: "error",
                    tag: "Invalid File",
                });
            }
            const response = await fetch(file.url);
            const ruleText = await response.text();
            if (!ruleText.trim()) {
                return sendAlertMessage({
                    interaction,
                    content: `The file is empty.`,
                    type: "error",
                    tag: "Empty File",
                });
            }
            const systemPrompt = `
You are an assistant that creates Discord AutoMod keyword rules from server rules text. 
Extract ONLY offensive slurs, abusive insults, and explicit sexual words that violate community standards.
Do NOT include neutral or descriptive words (e.g. "harassment", "disabled", "violence", "graphic", "disturbing").
Output ONLY a valid JSON array of harmful keywords (no explanations, no code blocks, no text outside the array).
Include all important slurs, even ones commonly censored by AI.
Example: ["nigga", "n!gga", "rape", "sex", "faggot", "retard", "cunt", "slut", "whore", "pedo", "pedophile", "groomer", "dyke", "tranny", "fuck", "bitch"]
  
Here are the server rules:
${ruleText}
  `;
            let keywords = [];
            const fallbackKeywords = ["nigga", "n!gga", "rape", "sex", "faggot", "retard", "cunt"];
            const criticalFallback = [
                "nigga",
                "n!gga",
                "faggot",
                "rape",
                "pedophile",
                "pedo",
                "slut",
                "whore",
            ];
            let rawOutput = "";
            try {
                const aiResponse = karu.getGenerativeModel({
                    model: "gemma-3n-e4b-it",
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 800,
                        topK: 1,
                        topP: 1,
                    },
                });
                const result = await aiResponse.generateContent(systemPrompt);
                rawOutput = result.response.text().trim();
                let cleaned = rawOutput
                    .replace(/```(?:json)?/gi, "")
                    .replace(/```/g, "")
                    .trim();
                keywords = JSON.parse(cleaned);
                if (!Array.isArray(keywords))
                    throw new Error("AI output is not an array");
            }
            catch (error) {
                console.error("Error generating automod rules:", error);
                keywords = fallbackKeywords;
            }
            const bannedGenerics = [
                "harassment",
                "bullying",
                "violence",
                "graphic",
                "disturbing",
                "offensive",
                "disabled",
                "toxic",
                "unwelcoming",
                "hate",
                "hate speech",
                "discrimination",
                "prejudice",
                "racism",
                "sexism",
                "misogyny",
                "bigot",
            ];
            keywords = keywords
                .filter(w => typeof w === "string" &&
                w.length > 2 &&
                !bannedGenerics.includes(w.toLowerCase()) &&
                !w.includes(" "))
                .concat(criticalFallback);
            keywords = Array.from(new Set(keywords));
            if (!keywords.length) {
                return sendAlertMessage({
                    interaction,
                    content: `No usable keywords were generated.`,
                    type: "error",
                    tag: "No Keywords",
                });
            }
            let rules = await guild.autoModerationRules.fetch();
            let rule = rules.find(r => r.name === RULE_NAME);
            if (!rule) {
                rule = await guild.autoModerationRules.create({
                    name: RULE_NAME,
                    eventType: AutoModerationRuleEventType.MessageSend,
                    triggerType: AutoModerationRuleTriggerType.Keyword,
                    triggerMetadata: {
                        keywordFilter: keywords.slice(0, 1000),
                    },
                    actions: [
                        {
                            type: AutoModerationActionType.BlockMessage,
                            metadata: {
                                customMessage: "Please read the server rules before posting.",
                            },
                        },
                    ],
                    enabled: true,
                    reason: "Initialized by automod ruleset system",
                });
            }
            return interaction.editReply({
                components: [
                    containerTemplate({
                        tag: "Automod Ruleset Created",
                        title: `${getEmoji("reactions.kaeru.emphasize")} Automod ruleset created successfully!`,
                        description: [
                            `- ${keywords.length} strong keywords were generated.`,
                            `- Neutral/common terms were filtered out.`,
                            `- Critical slurs were added from fallback.`,
                            `- The ruleset is now active.`,
                            ``,
                            `**Filtered Keywords Applied:**\n\`\`\`json\n${JSON.stringify(keywords, null, 2)}\n\`\`\``,
                        ].join("\n"),
                    }),
                ],
                flags: [MessageFlags.IsComponentsV2],
            });
        };
        switch (interaction.options.getSubcommand()) {
            case "ticket":
                await ticketCommand();
                break;
            case "voice-hub":
                await hubCommand();
                break;
            case "image-channel":
                await imageChannel();
                break;
            case "automod-rule-set":
                await automodRulesetCommand();
                break;
        }
    },
};
export default setup;
