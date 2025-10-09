import {
	ActionRowBuilder,
	ApplicationIntegrationType,
	AutoModerationActionType,
	AutoModerationRuleEventType,
	AutoModerationRuleTriggerType,
	bold,
	ChannelType,
	ChatInputCommandInteraction,
	ContainerBuilder,
	InteractionContextType,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
	MessageFlags,
	NewsChannel,
	PermissionFlagsBits,
	SeparatorBuilder,
	SeparatorSpacingSize,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	TextChannel,
	TextDisplayBuilder,
	underline,
} from "discord.js";
import { BotCommand } from "../../interfaces/botTypes.js";
import {
	emojis,
	getEmoji,
	formatMultiline,
	isValidImageUrl,
	saveStaffRoleId,
	sendAlertMessage,
	setHubChannel,
	setImageChannel,
	containerTemplate,
} from "../../utils/export.js";
import { karu } from "../../config/karu.js";

const setup: BotCommand = {
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
		.addSubcommand(subcommand =>
			subcommand
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
				})
				.addRoleOption(option =>
					option
						.setName("staff_role")
						.setNameLocalizations({
							it: "ruolo_staff",
							tr: "yetkili_rolü",
							"zh-CN": "管理角色",
							"pt-BR": "cargo_de_staff",
							ro: "rol_staff",
							el: "ρόλος_staff",
							de: "staff_rolle",
							ru: "роль_персонала",
						})
						.setDescription("Role to be tagged when ticket channel is created")
						.setDescriptionLocalizations({
							it: "Ruolo da menzionare quando viene creato un canale ticket",
							tr: "Destek kanalı açıldığında etiketlenecek rol",
							"zh-CN": "在创建工单频道时要提及的角色",
							"pt-BR": "Cargo a ser mencionado quando um canal de ticket for criado",
							ro: "Rolul menționat când se creează canalul de tichete",
							el: "Ρόλος που θα αναφέρεται όταν δημιουργείται κανάλι ticket",
							de: "Rolle, die erwähnt wird, wenn ein Ticket-Kanal erstellt wird",
							ru: "Роль, упоминаемая при создании тикет-канала",
						})
						.setRequired(true),
				)
				.addChannelOption(option =>
					option
						.addChannelTypes(ChannelType.GuildText)
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
						.setDescription("Please select a channel")
						.setDescriptionLocalizations({
							it: "Seleziona un canale",
							tr: "Lütfen bir kanal seçin",
							"zh-CN": "请选择频道",
							"pt-BR": "Selecione um canal",
							ro: "Selectează un canal",
							el: "Επιλέξτε κανάλι",
							de: "Bitte wähle einen Kanal",
							ru: "Выберите канал",
						})
						.setRequired(true),
				)
				.addStringOption(option =>
					option
						.setName("description")
						.setNameLocalizations({
							it: "descrizione",
							tr: "açıklama",
							"zh-CN": "描述",
							"pt-BR": "descrição",
							ro: "descriere",
							el: "περιγραφή",
							de: "beschreibung",
							ru: "описание",
						})
						.setDescription(
							"Set message description (markdown supported, use two spaces for a new line).",
						)
						.setDescriptionLocalizations({
							it: "Imposta la descrizione (markdown supportato, vai a capo con due spazi).",
							tr: "Mesaj açıklamasını ayarla (Markdown destekli, yeni satır için iki boşluk kullan).",
							"zh-CN": "设置消息描述（支持markdown，使用两个空格换行）",
							"pt-BR": "Defina a descrição (suporta Markdown, nova linha com dois espaços).",
							ro: "Setează descrierea (acceptă markdown, două spații pentru linie nouă).",
							el: "Ορίστε περιγραφή (υποστηρίζει Markdown, δύο κενά για νέα γραμμή).",
							de: "Beschreibung festlegen (Markdown unterstützt, zwei Leerzeichen für neue Zeile).",
							ru: "Задай описание (поддержка Markdown, два пробела для новой строки).",
						})
						.setRequired(false),
				)
				.addStringOption(option =>
					option
						.setName("image_url")
						.setNameLocalizations({
							it: "immagine_url",
							tr: "görsel_linki",
							"zh-CN": "图片链接",
							"pt-BR": "url_imagem",
							ro: "link_imagine",
							el: "url_εικόνας",
							de: "bild_url",
							ru: "url_изображения",
						})
						.setDescription("Provide a custom image URL for the ticket banner!")
						.setDescriptionLocalizations({
							it: "Fornisci un URL immagine personalizzato per il banner del ticket!",
							tr: "Destek formu için özel bir görsel linki ekle!",
							"zh-CN": "为工单横幅提供自定义图片链接！",
							"pt-BR": "Forneça um link de imagem personalizado para o banner do ticket!",
							ro: "Adaugă un link imagine personalizat pentru banner-ul tichetului!",
							el: "Δώστε ένα προσαρμοσμένο URL εικόνας για το banner ticket!",
							de: "Eigene Bild-URL für das Ticket-Banner angeben!",
							ru: "Укажи URL изображения для баннера тикета!",
						})
						.setRequired(false),
				),
		)
		// Image Channel
		.addSubcommand(subcommand =>
			subcommand
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
				.addChannelOption(option =>
					option
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
						.setRequired(true),
				),
		)
		// Voice Hub
		.addSubcommand(subcommand =>
			subcommand
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
				.addChannelOption(option =>
					option
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
						.setRequired(true),
				),
		)
		// Automod Ruleset
		.addSubcommand(subcommand =>
			subcommand
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
				.addAttachmentOption(option =>
					option
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
						.setRequired(true),
				),
		) as SlashCommandBuilder,

	execute: async (interaction: ChatInputCommandInteraction) => {
		const { guild } = interaction;

		const channelOption = interaction.options.getChannel("channel");

		const ticketCommand = async () => {
			if (!guild?.members.me?.permissions.has("ManageThreads")) {
				return sendAlertMessage({
					interaction,
					content: `It seems like I can't manage threads.\n> ${getEmoji("reactions.user.thumbsup")} Got it! I will give you the permission to manage, soon.`,
					type: "error",
					tag: "Missing Permissions",
					alertReaction: "reactions.kaeru.emphasize",
				});
			}

			if (!guild?.members.me?.permissions.has("CreatePrivateThreads")) {
				return sendAlertMessage({
					interaction,
					content: `It seems like I can't create private threads.\n> ${getEmoji("reactions.user.thumbsup")} Got it! I will give you the permission to manage, soon.`,
					type: "error",
					tag: "Missing Permissions",
					alertReaction: "reactions.kaeru.emphasize",
				});
			}

			const sendingChannel =
				channelOption instanceof TextChannel || channelOption instanceof NewsChannel
					? channelOption
					: null;

			if (
				!interaction.guild ||
				!sendingChannel ||
				!("permissionsFor" in sendingChannel) ||
				!sendingChannel
					.permissionsFor(interaction.guild.members.me!)
					.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])
			) {
				return interaction.reply({
					content: `# ${getEmoji("danger")}\n-# I don't have permission to send messages or view ${sendingChannel ?? "the"} channel.`,
				});
			}

			await interaction.deferReply({
				flags: MessageFlags.Ephemeral,
			});

			const containerDescription = interaction.options.getString("description") ?? "";
			const customImageUrl = interaction.options.getString("image_url") ?? "";
			const staffRole = interaction.options.getRole("staff_role")?.id ?? "";

			let imageUrl =
				"https://cdn.discordapp.com/attachments/736571695170584576/1422748982047932438/Default_Card.png?ex=68ddcdbe&is=68dc7c3e&hm=b16c3ef319ec1633a6798954492a4f3d58114422af50d1e0be9511a459e8ee4f&"; // kaeru's default image for ticket banner

			if (customImageUrl) {
				if (isValidImageUrl(customImageUrl)) {
					imageUrl = customImageUrl;
				} else {
					return interaction.editReply({
						content: `# ${getEmoji("danger")}\n-# The provided image URL is not valid. Please provide a direct link to an image (jpg, png, gif, etc.) or a supported image hosting service.\n> -# **Supported image hosting services:**\n> -# Discord, Imgur, Gyazo, Prnt.sc, i.redd.it, Tenor, Giphy`,
					});
				}
			}

			const container = new ContainerBuilder()
				.setAccentColor(0xa2845e)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						formatMultiline(containerDescription) ||
							[
								`# ${getEmoji("button")} Create a Ticket`,
								`If you're experiencing an issue with our product or service, please use the "Create ticket" button to report it.`,
								`-# This includes any server-related tickets you may be encountering in our Discord server.`,
							].join("\n"),
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true),
				)
				.addMediaGalleryComponents(
					new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(imageUrl)),
				);

			const createTicketMenu = new StringSelectMenuBuilder()
				.setCustomId("ticket-create")
				.setMaxValues(1)
				.setPlaceholder("Create a ticket about...")
				.addOptions([
					new StringSelectMenuOptionBuilder()
						.setLabel("Bug")
						.setDescription("Reporting something that's not working")
						.setValue("bug")
						.setEmoji(emojis.ticket.label.bug),
					new StringSelectMenuOptionBuilder()
						.setLabel("Reward")
						.setDescription("Creating a reward for giveaways")
						.setValue("reward")
						.setEmoji(emojis.ticket.label.reward),
					new StringSelectMenuOptionBuilder()
						.setLabel("Question")
						.setDescription("Asking an important question")
						.setValue("question")
						.setEmoji(emojis.ticket.label.question),
					new StringSelectMenuOptionBuilder()
						.setLabel("Discussion")
						.setDescription("Starting a general discussion")
						.setValue("discussion")
						.setEmoji(emojis.ticket.label.discussion),
					new StringSelectMenuOptionBuilder()
						.setLabel("Help")
						.setDescription("Requesting some help")
						.setValue("help")
						.setEmoji(emojis.ticket.label.help),
				]);

			const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(createTicketMenu);

			await sendingChannel.send({
				components: [container, row],
				flags: MessageFlags.IsComponentsV2,
			});

			await saveStaffRoleId(interaction.guild!.id, staffRole);

			await interaction.editReply({
				components: [
					containerTemplate({
						tag: "System Created",
						title: `${getEmoji("ticket.create")} Created the ticket system successfully in ${sendingChannel}.`,
						description: [
							`- Users can create tickets as thread with selecting label`,
							`- It will auto-name the thread for their issue.`,
							`- Experience PRO ticket handling.`,
						].join("\n"),
					}),
				],
				flags: [MessageFlags.IsComponentsV2],
			});

			if (!interaction.guild!.members.me?.permissions.has(PermissionFlagsBits.ManageMessages)) {
				return sendAlertMessage({
					interaction,
					content: `## ${getEmoji("danger") + " " + underline("Recommending")}\nIf Kaeru has ${bold(
						"Manage Messages",
					)} permission, it will be very easy to reach the first message with pinned messages for staff members.`,
				});
			}
		};

		const imageChannel = async () => {
			const selectedChannel = guild?.channels.cache.get(channelOption!.id);
			if (
				!selectedChannel ||
				!selectedChannel.permissionsFor(guild?.members.me!)?.has("ViewChannel")
			) {
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
				await setImageChannel(guild!.id, channelOption!.id);

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
			} catch (error) {
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

			await setHubChannel(guild!.id, channelOption!.id);

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

			let keywords: string[] = [];
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

				if (!Array.isArray(keywords)) throw new Error("AI output is not an array");
			} catch (error) {
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
				.filter(
					w =>
						typeof w === "string" &&
						w.length > 2 &&
						!bannedGenerics.includes(w.toLowerCase()) &&
						!w.includes(" "),
				)
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
