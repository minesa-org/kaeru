import {
	ApplicationIntegrationType,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	InteractionContextType,
	MessageFlags,
	PermissionFlagsBits,
	SeparatorBuilder,
	SlashCommandBuilder,
	TextDisplayBuilder,
} from "discord.js";
import { BotCommand } from "../../interfaces/botTypes.js";
import { tagManager } from "../../utils/tagClass.js";
import { IServerTag } from "../../models/guild.model.js";
import { containerTemplate, sendAlertMessage } from "../../utils/error&containerMessage.js";
import { getEmoji } from "../../utils/emojis.js";

const tag: BotCommand = {
	data: new SlashCommandBuilder()
		.setName("tag")
		.setDescription("Create, get, delete, or list tags")
		.setIntegrationTypes([
			ApplicationIntegrationType.UserInstall,
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.BotDM,
			InteractionContextType.PrivateChannel,
			InteractionContextType.Guild,
		])
		.setNameLocalizations({
			it: "tag",
			tr: "etiket",
			ro: "tag",
			el: "ετικέτα",
			"pt-BR": "tag",
			"zh-CN": "标签",
		})
		.setDescriptionLocalizations({
			it: "Crea, ottieni, cancella o elenca tag",
			tr: "Etiket oluştur, al, sil veya listele",
			ro: "Creează, obține, șterge sau listează etichete",
			el: "Δημιουργήστε, ανακτήστε, διαγράψτε ή αναγνωρίστε ετικέτες",
			"pt-BR": "Crie, obtenha, exclua ou liste tags",
			"zh-CN": "创建、获取、删除或列出标签",
		})
		.addSubcommand(sub =>
			sub
				.setName("create")
				.setDescription("Create a tag")
				.setNameLocalizations({
					it: "crea",
					tr: "oluştur",
					ro: "creează",
					el: "δημιουργήστε",
					"pt-BR": "criar",
					"zh-CN": "创建",
				})
				.setDescriptionLocalizations({
					it: "Crea un tag",
					tr: "Bir etiket oluştur",
					ro: "Creează o etichetă",
					el: "Δημιουργήστε μια ετικέτα",
					"pt-BR": "Crie uma tag",
					"zh-CN": "创建一个标签",
				})
				.addStringOption(opt =>
					opt
						.setName("name")
						.setDescription("Name of the tag")
						.setNameLocalizations({
							it: "nome",
							tr: "ad",
							ro: "nume",
							el: "όνομα",
							"pt-BR": "nome",
							"zh-CN": "名称",
						})
						.setDescriptionLocalizations({
							it: "Nome del tag",
							tr: "Etiket adı",
							ro: "Numele etichetei",
							el: "Όνομα ετικέτας",
							"pt-BR": "Nome da tag",
							"zh-CN": "标签名称",
						})
						.setRequired(true)
						.setMaxLength(50),
				)
				.addStringOption(opt =>
					opt
						.setName("content")
						.setDescription("Content of the tag")
						.setNameLocalizations({
							it: "contenuto",
							tr: "içerik",
							ro: "conținut",
							el: "περιεχόμενο",
							"pt-BR": "conteúdo",
							"zh-CN": "内容",
						})
						.setDescriptionLocalizations({
							it: "Contenuto del tag",
							tr: "Etiket içeriği",
							ro: "Conținutul etichetei",
							el: "Περιεχόμενο ετικέτας",
							"pt-BR": "Conteúdo da tag",
							"zh-CN": "标签内容",
						})
						.setRequired(true)
						.setMaxLength(2000),
				),
		)
		.addSubcommand(sub =>
			sub
				.setName("use")
				.setDescription("Use a tag")
				.setNameLocalizations({
					it: "usa",
					tr: "kullan",
					ro: "folosește",
					el: "χρησιμοποιήστε",
					"pt-BR": "usar",
					"zh-CN": "使用",
				})
				.setDescriptionLocalizations({
					it: "Usa un tag",
					tr: "Bir etiketi kullan",
					ro: "Folosește o etichetă",
					el: "Χρησιμοποιήστε μια ετικέτα",
					"pt-BR": "Use uma tag",
					"zh-CN": "使用一个标签",
				})
				.addStringOption(opt =>
					opt
						.setName("name")
						.setDescription("Name of the tag")
						.setNameLocalizations({
							it: "nome",
							tr: "ad",
							ro: "nume",
							el: "όνομα",
							"pt-BR": "nome",
							"zh-CN": "名称",
						})
						.setDescriptionLocalizations({
							it: "Nome del tag",
							tr: "Etiket adı",
							ro: "Numele etichetei",
							el: "Όνομα ετικέτας",
							"pt-BR": "Nome da tag",
							"zh-CN": "标签名称",
						})
						.setRequired(true)
						.setAutocomplete(true),
				),
		)
		.addSubcommand(sub =>
			sub
				.setName("delete")
				.setDescription("Delete a tag")
				.setNameLocalizations({
					it: "cancella",
					tr: "sil",
					ro: "șterge",
					el: "διαγράψτε",
					"pt-BR": "excluir",
					"zh-CN": "删除",
				})
				.setDescriptionLocalizations({
					it: "Cancella un tag",
					tr: "Bir etiketi sil",
					ro: "Șterge o etichetă",
					el: "Διαγράψτε μια ετικέτα",
					"pt-BR": "Exclua uma tag",
					"zh-CN": "删除一个标签",
				})
				.addStringOption(opt =>
					opt
						.setName("name")
						.setDescription("Name of the tag")
						.setNameLocalizations({
							it: "nome",
							tr: "ad",
							ro: "nume",
							el: "όνομα",
							"pt-BR": "nome",
							"zh-CN": "名称",
						})
						.setDescriptionLocalizations({
							it: "Nome del tag",
							tr: "Etiket adı",
							ro: "Numele etichetei",
							el: "Όνομα ετικέτας",
							"pt-BR": "Nome da tag",
							"zh-CN": "标签名称",
						})
						.setRequired(true)
						.setAutocomplete(true),
				),
		)
		.addSubcommand(sub =>
			sub
				.setName("list")
				.setDescription("List all available tags")
				.setNameLocalizations({
					it: "elenca",
					tr: "listele",
					ro: "listează",
					el: "αναγνωρίστε",
					"pt-BR": "listar",
					"zh-CN": "列出",
				})
				.setDescriptionLocalizations({
					it: "Elenca tutti i tag disponibili",
					tr: "Tüm etiketleri listele",
					ro: "Listează toate etichetele disponibile",
					el: "Αναγνωρίστε όλες τις διαθέσιμες ετικέτες",
					"pt-BR": "Liste todas as tags disponíveis",
					"zh-CN": "列出所有可用的标签",
				}),
		),
	execute: async (interaction: ChatInputCommandInteraction) => {
		const subcommand = interaction.options.getSubcommand();
		const userId = interaction.user.id;
		const serverId = interaction.guild?.id;

		switch (subcommand) {
			case "create": {
				await interaction.deferReply();

				const name = interaction.options.getString("name", true);
				const content = interaction.options.getString("content", true);

				let result;
				if (interaction.guild) {
					if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
						sendAlertMessage({
							interaction,
							content: "You need **Manage Server** permission to create server tags.",
							type: "error",
							tag: "Missing Permission",
						});
						return;
					}

					result = await tagManager.createTag(name, content, userId, serverId);
				} else {
					result = await tagManager.createTag(name, content, userId);
				}

				return interaction.editReply({
					components: [
						containerTemplate({
							tag: "Tag Created",
							description: result.message,
						}),
					],
					flags: MessageFlags.IsComponentsV2,
				});
			}

			case "use": {
				await interaction.deferReply();

				const name = interaction.options.getString("name", true);
				const result = await tagManager.getTag(name, userId, serverId);

				if (!result) {
					return sendAlertMessage({
						interaction,
						content: "I couldn't find that tag.",
						type: "error",
						tag: "Tag Not Found",
					});
				}

				if (!result.isServer) {
					return interaction.editReply({
						content: result.tag.content,
					});
				}

				return interaction.editReply({
					components: [
						new TextDisplayBuilder().setContent(`### ${getEmoji("tag")} ${result.tag.name}`),
						new SeparatorBuilder().setDivider(true),
						new TextDisplayBuilder().setContent(result.tag.content),
					],
					flags: MessageFlags.IsComponentsV2,
				});
			}

			case "delete": {
				await interaction.deferReply({ flags: MessageFlags.Ephemeral });

				const name = interaction.options.getString("name", true);
				const found = await tagManager.getTag(name, userId, serverId);

				if (!found) {
					return sendAlertMessage({
						interaction,
						content: "I couldn't find that tag.",
						type: "error",
						tag: "Tag Not Found",
					});
				}

				if (found.isServer) {
					const serverTag = found.tag as IServerTag;
					if (
						serverTag.userId !== userId &&
						!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)
					) {
						return sendAlertMessage({
							interaction,
							content: "You don't have permission to delete this tag. Not cool.",
							type: "error",
							tag: "Missing Permission",
						});
					}
				}

				const result = await tagManager.deleteTag(name, userId, serverId);

				return interaction.editReply({
					components: [
						containerTemplate({
							tag: "Tag Deleted",
							description: result.message,
						}),
					],
					flags: MessageFlags.IsComponentsV2,
				});
			}

			case "list": {
				await interaction.deferReply({ flags: MessageFlags.Ephemeral });

				const tags = await tagManager.getAllUserTags(userId, serverId);

				if (!tags.length) {
					return sendAlertMessage({
						interaction,
						content: "You don't have any tags.",
						type: "info",
						tag: "No Tags",
					});
				}

				return interaction.editReply({
					components: [
						containerTemplate({
							tag: "Tag System — Limits: Server: 10 | User: 5",
							title: interaction.guild
								? `${getEmoji("tag")} Server & Tags`
								: `${getEmoji("tag")} Your Tags`,
							description: tags.map(t => `- ${t.name}`).join("\n"),
							thumbnail:
								"https://media.discordapp.net/attachments/736571695170584576/1413590581686440027/image.png?ex=68bc7c51&is=68bb2ad1&hm=67f01949f10c5eec79e58572edfb8b5c09d914f2185ab52e7a6094aed95051f9&=&width=706&height=706",
						}),
					],
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}
	},
	autocomplete: async (interaction: AutocompleteInteraction) => {
		const userId = interaction.user.id;
		const serverId = interaction.guildId ?? undefined;
		const focused = interaction.options.getFocused();

		const tags = await tagManager.getAllUserTags(userId, serverId);
		const filtered = tags
			.filter(t => t.name.toLowerCase().includes(focused.toLowerCase()))
			.slice(0, 25)
			.map(t => ({
				name: t.name,
				value: t.name,
			}));

		try {
			await interaction.respond(filtered);
		} catch (error) {}
	},
};

export default tag;
