import { ActionRowBuilder, ApplicationIntegrationType, bold, ChannelType, ContainerBuilder, InteractionContextType, MediaGalleryBuilder, MediaGalleryItemBuilder, MessageFlags, NewsChannel, PermissionFlagsBits, SeparatorBuilder, SeparatorSpacingSize, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextChannel, TextDisplayBuilder, underline, } from "discord.js";
import { emojis, getEmoji, formatMultiline, isValidImageUrl, saveStaffRoleId, } from "../../utils/export.js";
const setupCommand = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setNameLocalizations({
        it: "imposta",
        tr: "kurulum",
        "zh-CN": "设置",
        "pt-BR": "configurar",
        ro: "setare",
        el: "ρύθμιση",
        de: "einrichten",
        ru: "настройка",
    })
        .setDescription("Setup things!")
        .setDescriptionLocalizations({
        it: "Imposta le cose!",
        tr: "Şeyleri kur!",
        "zh-CN": "设置事物！",
        "pt-BR": "Configure as coisas!",
        ro: "Setează lucrurile!",
        el: "Ρυθμίστε τα πράγματα!",
        de: "Richte Dinge ein!",
        ru: "Настройте вещи!",
    })
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .addSubcommand(subcommand => subcommand
        .setName("ticket")
        .setNameLocalizations({
        it: "biglietto",
        tr: "talep",
        "zh-CN": "工单",
        "pt-BR": "bilhete",
        ro: "bilet",
        el: "εισιτήριο",
        de: "ticket",
        ru: "билет",
    })
        .setDescription("Setup ticket system with threads!")
        .setDescriptionLocalizations({
        it: "Configura il sistema dei biglietti con i thread!",
        tr: "Talep sistemiyle thread'leri kur!",
        "zh-CN": "使用线程设置工单系统！",
        "pt-BR": "Configure o sistema de bilhetes com threads!",
        ro: "Configurați sistemul de bilet cu fire de execuție!",
        el: "Ρυθμίστε το σύστημα εισιτηρίων με νήματα!",
        de: "Richten Sie das Ticket-System mit Threads ein!",
        ru: "Настройте систему тикетов с потоками!",
    })
        .addRoleOption(option => option
        .setName("staff_role")
        .setNameLocalizations({
        it: "ruolo_staff",
        tr: "personel_rolü",
        "zh-CN": "staff_角色",
        "pt-BR": "cargo_de_staff",
        ro: "rol_de_staff",
        el: "ρόλος_σταφφ",
        de: "staff_rolle",
        ru: "роль_стажера",
    })
        .setDescription("Role to be tagged when ticket channel is created")
        .setDescriptionLocalizations({
        it: "Ruolo da menzionare quando viene creato il canale del ticket",
        tr: "Talep kanalı oluşturulduğunda etiketlenecek rol",
        "zh-CN": "创建工单频道时要提及的角色",
        "pt-BR": "Cargo a ser mencionado quando o canal de bilhete é criado",
        ro: "Rolul care trebuie menționat atunci când este creat canalul de bilet",
        el: "Ρόλος που θα πρέπει να αναφερθεί όταν δημιουργείται ένας κανάλις εισιτηρίου",
        de: "Rolle, die bei der Erstellung des Ticket-Kanals erwähnt werden soll",
        ru: "Роль, которая будет упомянута при создании канала тикета",
    })
        .setRequired(true))
        .addChannelOption(option => option
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
        ro: "Selectați un canal",
        el: "Επιλέξτε ένα κανάλι",
        de: "Wählen Sie einen Kanal aus",
        ru: "Выберите канал",
    })
        .setRequired(true))
        .addStringOption(option => option
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
        .setDescription("Set message description (markdown supported, use two spaces for a new line).")
        .setDescriptionLocalizations({
        it: "Imposta la descrizione (markdown supportato, vai a capo con due spazi).",
        tr: "Açıklamayı ayarla (markdown destekli, yeni satır için iki boşluk kullan).",
        "zh-CN": "设置描述（支持markdown，使用两个空格换行）",
        "pt-BR": "Defina a descrição (suporta markdown, nova linha com dois espaços).",
        ro: "Setați descrierea (acceptă markdown, două spații pentru rând nou).",
        el: "Ρύθμιση περιγραφής (υποστηρίζει markdown, δύο κενά για νέα γραμμή).",
        de: "Beschreibung festlegen (Markdown unterstützt, zwei Leerzeichen für neue Zeile).",
        ru: "Укажите описание (поддерживает markdown, два пробела — новая строка).",
    })
        .setRequired(false))
        .addStringOption(option => option
        .setName("image_url")
        .setNameLocalizations({
        it: "immagine_url",
        tr: "afiş_linki",
        "zh-CN": "图片链接",
        "pt-BR": "url_da_imagem",
        ro: "url_imagine",
        el: "εικόνα_url",
        de: "bild_url",
        ru: "url_изображения",
    })
        .setDescription("Provide a custom image URL for the ticket banner!")
        .setDescriptionLocalizations({
        it: "Fornisci un URL di immagine personalizzato per la bandiera del ticket!",
        tr: "Talep afişi için özel bir görüntü URL'si sağlayın!",
        "zh-CN": "为工单横幅提供自定义图片链接！",
        "pt-BR": "Forneça uma URL de imagem personalizada para o banner do ticket!",
        ro: "Furnizați o URL imagine personalizată pentru banerul de bilet!",
        el: "Παρέχετε μια εικονική διεύθυνση για την εικόνα του εισιτηρίου!",
        de: "Stellen Sie eine benutzerdefinierte Bild-URL für die Ticket-Banner bereit!",
        ru: "Укажите пользовательский URL изображения для баннера тикета!",
    })
        .setRequired(false))),
    execute: async (interaction) => {
        const guild = interaction.guild;
        if (!guild?.members.me?.permissions.has("ManageThreads")) {
            return interaction.reply({
                content: `# ${getEmoji("error")}\n-#  I don't have permission to manage threads.`,
                flags: MessageFlags.Ephemeral,
            });
        }
        if (!guild?.members.me?.permissions.has("CreatePrivateThreads")) {
            return interaction.reply({
                content: `# ${getEmoji("error")}\n-# I don't have permission to create private threads.`,
                flags: MessageFlags.Ephemeral,
            });
        }
        const ticketCommand = async () => {
            await interaction.deferReply({
                flags: MessageFlags.Ephemeral,
            });
            const containerDescription = interaction.options.getString("description") ?? "";
            const customImageUrl = interaction.options.getString("image_url") ?? "";
            const staffRole = interaction.options.getRole("staff_role")?.id ?? "";
            const channelOption = interaction.options.getChannel("channel");
            const sendingChannel = channelOption instanceof TextChannel || channelOption instanceof NewsChannel
                ? channelOption
                : null;
            if (!interaction.guild ||
                !sendingChannel ||
                !("permissionsFor" in sendingChannel) ||
                !sendingChannel
                    .permissionsFor(interaction.guild.members.me)
                    .has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) {
                return interaction.editReply({
                    content: `# ${getEmoji("danger")}\n-# I don't have permission to send messages or view ${sendingChannel ?? "the"} channel.`,
                });
            }
            let imageUrl = "https://cdn.discordapp.com/attachments/736571695170584576/1398695161923375144/default_ticket_image.png?ex=68864be1&is=6884fa61&hm=0e8b5986b4ee4a9451a844bf1e6b1eecb3abd4d125f5c5670ece213d82d2ee36&"; // kaeru's default image for ticket banner
            if (customImageUrl) {
                if (isValidImageUrl(customImageUrl)) {
                    imageUrl = customImageUrl;
                }
                else {
                    return interaction.editReply({
                        content: `# ${getEmoji("danger")}\n-# The provided image URL is not valid. Please provide a direct link to an image (jpg, png, gif, etc.) or a supported image hosting service.\n> -# **Supported image hosting services:**\n> -# Discord, Imgur, Gyazo, Prnt.sc, i.redd.it, Tenor, Giphy`,
                    });
                }
            }
            const container = new ContainerBuilder()
                .setAccentColor(0xa2845e)
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(formatMultiline(containerDescription) ||
                [
                    `# ${getEmoji("button")} Create a Ticket`,
                    `If you're experiencing an issue with our product or service, please use the "Create ticket" button to report it.`,
                    `-# This includes any server-related tickets you may be encountering in our Discord server.`,
                ].join("\n")))
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true))
                .addMediaGalleryComponents(new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(imageUrl)));
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
            const row = new ActionRowBuilder().addComponents(createTicketMenu);
            await sendingChannel.send({
                components: [container, row],
                flags: MessageFlags.IsComponentsV2,
            });
            await saveStaffRoleId(interaction.guild.id, staffRole);
            await interaction.editReply({
                content: `${getEmoji("ticket.create")} Created the ticket system successfully in ${sendingChannel}.`,
            });
            if (!interaction.guild.members.me?.permissions.has(PermissionFlagsBits.ManageMessages)) {
                await interaction.followUp({
                    content: `## ${getEmoji("danger") + " " + underline("Recommending")}\nIf Kaeru has ${bold("Manage Messages")} permission, it will be very easy to reach the first message with pinned messages for staff members.`,
                    flags: MessageFlags.Ephemeral,
                });
            }
        };
        switch (interaction.options.getSubcommand()) {
            case "ticket":
                await ticketCommand();
                break;
        }
    },
};
export default setupCommand;
